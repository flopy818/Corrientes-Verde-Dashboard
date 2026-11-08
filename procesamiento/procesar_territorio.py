#!/usr/bin/env python3
"""Auditoría reproducible, DESCRIPTIVA, de los CSV municipales de Corrientes Capital.

Dependencias: pandas>=2, shapely>=2 y pyproj>=3.
Ejecutar desde cualquier carpeta: python procesamiento/procesar_territorio.py
No descarga ni modifica los archivos originales, ni el dashboard publicado.

IMPORTANTE: el CRS proyectado del WKT no viene declarado dentro del CSV.
Se adopta EPSG:22185 (POSGAR 94 / Argentina 5) como HIPÓTESIS de trabajo
compatible con el rango de coordenadas y los GeoJSON previos. La autoridad
sobre el EPSG exacto corresponde a la fuente municipal original.
"""
from __future__ import annotations

import csv
import hashlib
import json
from collections import Counter, defaultdict
from datetime import date
from pathlib import Path

import pandas as pd
from pyproj import Transformer
from shapely import wkt
from shapely.geometry import shape, mapping
from shapely.ops import transform, unary_union
from shapely.strtree import STRtree

ROOT = Path(__file__).resolve().parents[1]
IN = ROOT / 'datos_originales'
OUT = ROOT / 'datos_derivados'
EPSG_CALCULO = 22185  # Hipótesis, no certificado por un atributo CRS en el CSV
AREA_MINIMA_INTERSECCION = 0.01  # m2; descarta contactos de borde con área numéricamente residual
RESERVA_GID = 4000  # comprobado en nombre_plaza del CSV, NO inferido por tamaño


def texto(v, default=''):
    if pd.isna(v):
        return default
    return str(v).strip()


def numero_id(v):
    return None if pd.isna(v) else int(v)


def guardar_json(path, obj):
    path.write_text(json.dumps(obj, ensure_ascii=False, indent=2, allow_nan=False) + '\n', encoding='utf-8')


def guardar_csv(path, rows, columns):
    with path.open('w', newline='', encoding='utf-8-sig') as h:
        wr = csv.DictWriter(h, fieldnames=columns, extrasaction='ignore')
        wr.writeheader()
        wr.writerows(rows)


def sha256(path):
    hh = hashlib.sha256()
    with path.open('rb') as fh:
        for chunk in iter(lambda: fh.read(1024 * 1024), b''):
            hh.update(chunk)
    return hh.hexdigest()


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    files = {
        'espacios_verdes': IN / 'espacios_verdes.csv',
        'barrios': IN / 'barrios.csv',
        'densidad_poblacional': IN / 'densidad_poblacional.csv',
        'recoleccion_puntos_verdes': IN / 'recoleccion_puntos_verdes.csv',
        'reciclando_juntos_ruleros': IN / 'reciclando_juntos_ruleros.csv',
        'localizacion_puntos_verdes': IN / 'localizacion_puntos_verdes.csv',
    }
    for nom, path in files.items():
        if not path.is_file():
            raise FileNotFoundError(f'No se encuentra {nom}: {path}')

    # No corregimos valores originales sin registrar una transformación.
    src_spaces = pd.read_csv(files['espacios_verdes'])
    src_areas = pd.read_csv(files['barrios'])
    src_census = pd.read_csv(files['densidad_poblacional'])

    espacios_m = [wkt.loads(v) for v in src_spaces['the_geom']]
    to_m = Transformer.from_crs('EPSG:4326', f'EPSG:{EPSG_CALCULO}', always_xy=True)
    to_ll = Transformer.from_crs(f'EPSG:{EPSG_CALCULO}', 'EPSG:4326', always_xy=True)
    poligonos_m = [transform(to_m.transform, shape(json.loads(v))) for v in src_areas['the_geom']]
    censales_m = [transform(to_m.transform, shape(json.loads(v))) for v in src_census['the_geom']]

    for nom, geometries in [('espacios', espacios_m), ('territorios', poligonos_m), ('radios', censales_m)]:
        empty = [i for i,g in enumerate(geometries) if g.is_empty]
        invalid = [i for i,g in enumerate(geometries) if not g.is_valid]
        if invalid or empty:
            raise ValueError(f'{nom}: geometrías vacías={empty}, inválidas={invalid}. No se aplican reparaciones silenciosas.')

    # Controles generales y campos incompletos
    ids_space = src_spaces['gid'].astype(int).tolist()
    ids_areas = src_areas['id_barrios'].astype(int).tolist()
    ids_census = src_census['gid'].astype(int).tolist()
    if len(ids_space) != len(set(ids_space)):
        raise ValueError('El identificador gid de espacios no es único en el archivo; revisar.')
    if len(ids_census) != len(set(ids_census)):
        raise ValueError('El identificador gid censal no es único en el archivo; revisar.')

    reserve_indices = [i for i, gid in enumerate(ids_space) if gid == RESERVA_GID]
    if len(reserve_indices) != 1:
        raise ValueError(f'La reserva gid={RESERVA_GID} no aparece exactamente una vez.')
    ri = reserve_indices[0]
    reserva_nombre = texto(src_spaces.iloc[ri]['nombre_plaza'])
    if 'RESERVA NATURAL MUNICIPAL SANTA CATALINA' not in reserva_nombre.upper():
        raise ValueError('La identificación documental de la reserva no coincide con el gid 4000.')

    # Dos entidades del archivo de polígonos tienen dos geometrías con el mismo ID.
    # Se conservan 140 filas originales y se construyen 138 unidades diferenciadas por ID.
    records_territory = {}
    polygons_per_id = defaultdict(list)
    for j, bid in enumerate(ids_areas):
        polygons_per_id[bid].append(j)
        if bid not in records_territory:
            records_territory[bid] = {
                'id_unidad': bid,
                'nombre_unidad': texto(src_areas.iloc[j]['nombre_barrio']),
                'tipo_unidad': texto(src_areas.iloc[j]['tipo_barrio']),
            }
        elif (records_territory[bid]['nombre_unidad'] != texto(src_areas.iloc[j]['nombre_barrio']) or
              records_territory[bid]['tipo_unidad'] != texto(src_areas.iloc[j]['tipo_barrio'])):
            raise ValueError(f'ID {bid}: mismo identificador con nombres/tipos diferentes; revisar manualmente.')

    keys = sorted(records_territory)
    shapes_unit_m = [unary_union([poligonos_m[j] for j in polygons_per_id[k]]) for k in keys]
    tree_areas = STRtree(poligonos_m)
    tree_units = STRtree(shapes_unit_m)
    tree_census = STRtree(censales_m)
    universe_ids = set(keys)

    # Cruce de cada ESPACIO con cada POLÍGONO fuente, sin asignar por nombre.
    intersects_polys_area = [0.] * len(poligonos_m)
    intersects_polys_n = [0] * len(poligonos_m)
    areas_space = [round(g.area, 6) for g in espacios_m]
    space_no_intersection = []
    space_crossing_multiple = []
    space_rows = []
    for i, ge in enumerate(espacios_m):
        hits = []
        for j in tree_areas.query(ge, predicate='intersects'):
            area = float(ge.intersection(poligonos_m[int(j)]).area)
            if area > AREA_MINIMA_INTERSECCION:
                j = int(j)
                intersects_polys_area[j] += area
                intersects_polys_n[j] += 1
                hits.append({'id_unidad': ids_areas[j], 'indice_poligono': j, 'area_interseccion_m2': round(area, 4)})
        if not hits:
            space_no_intersection.append(ids_space[i])
        if len(set(t['id_unidad'] for t in hits)) > 1:
            space_crossing_multiple.append(ids_space[i])
        space_rows.append({
            'gid': ids_space[i],
            'nombre_original': texto(src_spaces.iloc[i]['nombre_plaza']),
            'clasificacion_original': texto(src_spaces.iloc[i]['clasificacion']),
            'clasificacion_normalizada': texto(src_spaces.iloc[i]['clasificacion']).upper(),
            'id_barrio_original': numero_id(src_spaces.iloc[i]['id_barrios']),
            'barrio_original': texto(src_spaces.iloc[i]['nombre_barrio']),
            'ordenanza_original': texto(src_spaces.iloc[i]['ordenanza']),
            'ubicacion_original': texto(src_spaces.iloc[i]['ubicacion']),
            'area_m2': round(ge.area, 4),
            'numero_poligonos_intersectados': len(hits),
            'numero_unidades_intersectadas': len(set(h['id_unidad'] for h in hits)),
            'intersecciones': hits,
            'es_reserva_santa_catalina': ids_space[i] == RESERVA_GID,
        })

    # Repetimos sobre UNIDADES ID únicas. La misma plaza puede intersectar más de una unidad;
    # nunca se denomina "asignación original" a este conteo espacial.
    primary_counts = Counter(int(v) for v in src_spaces['id_barrios'].dropna())
    space_hits_unit = defaultdict(int)
    green_m2_unit = defaultdict(float)
    for i, ge in enumerate(espacios_m):
        for ui in tree_units.query(ge, predicate='intersects'):
            ui = int(ui)
            area = float(ge.intersection(shapes_unit_m[ui]).area)
            if area > AREA_MINIMA_INTERSECCION:
                key = keys[ui]
                space_hits_unit[key] += 1
                green_m2_unit[key] += area

    # Distribución areal de población censal. La superficie del radio es el denominador,
    # SIN asumir que el radio completo está dentro de una unidad territorial.
    pop_census = [float(x) for x in src_census['total_poblacion']]
    pop_unit = []
    for i, geom_unit in enumerate(shapes_unit_m):
        pop_est = 0.
        for j in tree_census.query(geom_unit, predicate='intersects'):
            j = int(j)
            overlap = float(geom_unit.intersection(censales_m[j]).area)
            if overlap > AREA_MINIMA_INTERSECCION:
                pop_est += pop_census[j] * overlap / censales_m[j].area
        pop_unit.append(pop_est)

    # Separar los faltantes de cobertura de una eventual doble contabilización
    # ocasionada por solapamiento entre unidades territoriales.
    union_units = unary_union(shapes_unit_m)
    pop_covered_union = 0.
    for j, geom_census in enumerate(censales_m):
        overlap = float(geom_census.intersection(union_units).area)
        pop_covered_union += pop_census[j] * max(0., min(1., overlap / geom_census.area))
    pop_sum_units = sum(pop_unit)
    pop_all = sum(pop_census)
    pop_uncovered_est = pop_all - pop_covered_union
    pop_overlap_est = pop_sum_units - pop_covered_union

    # Listados separados para distinguir unidad territorial de polígono fuente.
    polygon_rows = []
    for j, bid in enumerate(ids_areas):
        polygon_rows.append({
            'indice_csv': j + 1, 'id_unidad': bid,
            'nombre_unidad': texto(src_areas.iloc[j]['nombre_barrio']),
            'tipo_unidad': texto(src_areas.iloc[j]['tipo_barrio']),
            'area_poligono_m2': round(poligonos_m[j].area, 4),
            'superficie_intersectada_m2': round(intersects_polys_area[j], 4),
            'cantidad_espacios_intersectados': intersects_polys_n[j],
            'sin_interseccion': intersects_polys_area[j] <= AREA_MINIMA_INTERSECCION,
            'sin_asignacion_principal': primary_counts[bid] == 0,
        })
    unit_rows = []
    for i, bid in enumerate(keys):
        base = records_territory[bid]
        pop = pop_unit[i]
        green = green_m2_unit[bid]
        unit_rows.append({
            **base,
            'cantidad_poligonos_fuente': len(polygons_per_id[bid]),
            'area_unidad_m2': round(shapes_unit_m[i].area, 4),
            'cantidad_espacios_asignados_csv': primary_counts[bid],
            'cantidad_espacios_intersectados': space_hits_unit[bid],
            'superficie_intersectada_m2': round(green, 4),
            'poblacion_estimada_areal': round(pop, 4),
            'm2_intersectados_por_habitante_estimado': round(green / pop, 6) if pop > 0 else None,
            'sin_asignacion_principal': primary_counts[bid] == 0,
            'sin_interseccion': green <= AREA_MINIMA_INTERSECCION,
        })

    # Tabla estadística por tipología municipal ("Rotonda" se normaliza a mayúsculas,
    # pero la forma original queda en la ficha del espacio).
    stat_rows = []
    df_area = pd.DataFrame({
        'tipo': [r['clasificacion_normalizada'] for r in space_rows],
        'area_m2': [r['area_m2'] for r in space_rows],
    })
    for tipo, group in sorted(df_area.groupby('tipo'), key=lambda v: v[0]):
        v = group['area_m2']
        stat_rows.append({
            'clasificacion': tipo, 'cantidad': len(v),
            'superficie_total_m2': round(float(v.sum()), 4),
            'superficie_min_m2': round(float(v.min()), 4),
            'superficie_q1_m2': round(float(v.quantile(.25)), 4),
            'superficie_mediana_m2': round(float(v.median()), 4),
            'superficie_media_m2': round(float(v.mean()), 4),
            'superficie_q3_m2': round(float(v.quantile(.75)), 4),
            'superficie_max_m2': round(float(v.max()), 4),
            'desviacion_estandar_muestral_m2': round(float(v.std(ddof=1)), 4) if len(v)>1 else None,
        })

    # Ranking original: área completa del espacio asociada al nombre_barrio del CSV.
    # Se EXCLUYE SOLO el gid 4000. No equivale a un análisis por intersección.
    without_reserve = [r for r in space_rows if r['gid'] != RESERVA_GID]
    area_by_name = defaultdict(float)
    for r in without_reserve:
        area_by_name[r['barrio_original'] or '(sin barrio declarado)'] += r['area_m2']
    top_names = sorted(area_by_name.items(), key=lambda t: (-t[1], t[0]))[:5]
    area_total = sum(r['area_m2'] for r in space_rows)
    reserve_area = space_rows[ri]['area_m2']
    area_without_reserve = area_total - reserve_area
    concentration = sum(v for _,v in top_names) / area_without_reserve * 100
    sum_source_names = sum(area_by_name.values())

    # Registro de calidad; ausentes significan ausentes EN EL CSV, no en la ciudad.
    spaces_null_names = int(src_spaces['nombre_plaza'].isna().sum())
    spaces_sn_names = int((src_spaces['nombre_plaza'].fillna('').astype(str).str.strip().str.upper() == 'S/N').sum())
    ids_inexisting = sorted(set(primary_counts) - universe_ids)
    dup_ids = {str(k): len(v) for k,v in polygons_per_id.items() if len(v)>1}
    source_primary_absent_unit_ids = [bid for bid in keys if primary_counts[bid] == 0]
    zero_intersect_unit_ids = [r['id_unidad'] for r in unit_rows if r['sin_interseccion']]

    summary = {
        'analisis': 'Ciudad de Corrientes (Corrientes Capital), provincia de Corrientes',
        'caracter': 'Proyecto académico independiente - Grupo 2: Fernández Florencia y Ríos Oscar',
        'registros': {
            'espacios': len(src_spaces), 'espacios_gid_unicos': len(set(ids_space)),
            'poligonos_territoriales': len(src_areas), 'unidades_territoriales_ids_unicos': len(keys),
            'radios_censales': len(src_census), 'poblacion_total_archivo_censal': pop_all,
        },
        'superficies': {
            'total_inventario_m2': round(area_total, 3),
            'reserva_gid': RESERVA_GID, 'reserva_nombre_csv': reserva_nombre,
            'reserva_m2': round(reserve_area, 3),
            'sin_reserva_m2': round(area_without_reserve, 3),
            'participacion_reserva_pct': round(100 * reserve_area / area_total, 6),
            'interseccion_sumada_sobre_poligonos_fuente_m2': round(sum(intersects_polys_area), 3),
            'interseccion_sumada_sobre_unidades_id_m2': round(sum(green_m2_unit.values()), 3),
        },
        'unidades_sin_espacios': {
            'ids_sin_asignacion_principal_csv': len(source_primary_absent_unit_ids),
            'filas_de_poligonos_sin_asignacion_principal': sum(r['sin_asignacion_principal'] for r in polygon_rows),
            'ids_sin_superficie_intersectada': len(zero_intersect_unit_ids),
            'filas_de_poligonos_sin_superficie_intersectada': sum(r['sin_interseccion'] for r in polygon_rows),
            'explicacion': 'Las cantidades no son intercambiables: contar por id_barrios del CSV y medir intersecciones son dos métodos distintos; 140 filas incluyen IDs repetidos.'
        },
        'espacios_sin_interseccion': space_no_intersection,
        'espacios_intersectando_multiples_ids': space_crossing_multiple,
        'ids_barrios_repetidos': dup_ids,
        'ids_asignacion_espacios_no_existentes_en_tabla_territorial': ids_inexisting,
        'calidad_espacios': {
            'nombre_nulo': spaces_null_names, 'nombre_sn': spaces_sn_names,
            'ordenanza_nula': int(src_spaces['ordenanza'].isna().sum()),
            'id_barrio_nulo': int(src_spaces['id_barrios'].isna().sum()),
            'nombre_barrio_nulo': int(src_spaces['nombre_barrio'].isna().sum()),
            'ubicacion_nula': int(src_spaces['ubicacion'].isna().sum()),
            'geometrias_invalidas': 0,
        },
        'poblacion': {
            'total_archivo': round(pop_all, 4),
            'asignada_por_suma_de_unidades': round(pop_sum_units, 4),
            'asignada_a_union_geometrica': round(pop_covered_union, 4),
            'fuera_de_cobertura_de_union_estimado': round(pop_uncovered_est, 4),
            'potencial_doble_recuento_por_solapamientos_entre_unidades_estimado': round(pop_overlap_est, 4),
            'metodo': 'Fracción del área del radio dentro de la geometría territorial por población total del radio. Población estimada, no observada barrio a barrio.'
        },
        'concentracion_campo_barrio': {
            'criterio': 'Agrupación nombre_barrio del archivo espacios_verdes.csv, área total de cada espacio, exceptuando solamente gid=4000; no es intersección espacial.',
            'top_5': [{'nombre_barrio': n, 'superficie_m2': round(a, 3)} for n,a in top_names],
            'superficie_total_sin_reserva_m2': round(area_without_reserve, 3),
            'superficie_agregada_en_cinco_m2': round(sum(v for _,v in top_names), 3),
            'porcentaje_top_5': round(concentration, 6),
            'verificacion_suma': round(sum_source_names - area_without_reserve, 6),
        },
        'advertencias': [
            'El CSV de espacios contiene WKT proyectado sin EPSG explícito. Se presupone EPSG:22185 para cálculo y cruces; requiere confirmación de fuente.',
            'Una reserva cuyo polígono no intersecta territorios puede tener asociación administrativa distinta. NO se reasigna automáticamente.',
            'La superficie del inventario incluye paseos, plazas, rotonda, playa y otras clasificaciones; no significa cobertura vegetal.',
            'La población por unidad es estimación areal de datos censales históricos y no una medición demográfica por barrio.',
            'La fecha de descarga de las copias originales no está documentada; no confundir nombre 20251001 con fecha de descarga.',
        ]
    }

    # GeoJSON de inspección. NO reemplaza a los archivos consumidos por el sitio V2.
    spaces_geo = {'type':'FeatureCollection','features':[
        {'type':'Feature','properties':{k:v for k,v in r.items() if k!='intersecciones'},
         'geometry':mapping(transform(to_ll.transform,espacios_m[i]))}
        for i,r in enumerate(space_rows)
    ]}
    units_geo = {'type':'FeatureCollection','features':[
        {'type':'Feature','properties':r,
         'geometry':mapping(transform(to_ll.transform,shapes_unit_m[i]))}
        for i,r in enumerate(unit_rows)
    ]}
    guardar_json(OUT / 'auditoria_territorial.json', summary)
    guardar_json(OUT / 'espacios_auditados.geojson', spaces_geo)
    guardar_json(OUT / 'unidades_territoriales_agrupadas.geojson', units_geo)
    guardar_csv(OUT/'espacios_auditados.csv', [{k:v for k,v in r.items() if k!='intersecciones'} for r in space_rows],
                [k for k in space_rows[0].keys() if k!='intersecciones'])
    guardar_csv(OUT/'poligonos_territoriales.csv', polygon_rows, list(polygon_rows[0]))
    guardar_csv(OUT/'unidades_territoriales.csv', unit_rows, list(unit_rows[0]))
    guardar_csv(OUT/'estadisticas_por_clasificacion.csv',stat_rows,list(stat_rows[0]))
    guardar_json(OUT/'registro_fuentes_sha256.json', {
        'aclaracion': 'El hash identifica el contenido de las copias incluidas; NO acredita su fecha de descarga ni la actualización del portal.',
        'archivos': {key:{'ruta_relativa':str(path.relative_to(ROOT)), 'sha256':sha256(path),
                         'bytes':path.stat().st_size} for key,path in files.items()}
    })
    print(json.dumps({
        'espacios':len(src_spaces),'poligonos_territoriales':len(src_areas),
        'ids_territoriales':len(keys),'sin_asignacion_principal_ids':len(source_primary_absent_unit_ids),
        'poligonos_sin_interseccion':sum(r['sin_interseccion'] for r in polygon_rows),
        'superficie_total_m2':round(area_total,2),'reserva_m2':round(reserve_area,2),
        'concentracion_top5_sin_reserva_pct':round(concentration,3),
        'poblacion_asignada_estimada':round(pop_sum_units,2),
    },ensure_ascii=False,indent=2))

if __name__=='__main__':
    main()
