#!/usr/bin/env python3
"""Crea los indicadores del tablero desde los productos de la auditoría y CSV de origen.

El cálculo de proximidad es EXCLUSIVAMENTE geométrico: distancia en metros desde
cada centroide de radio censal al polígono del inventario más cercano, NO
accesibilidad peatonal ni localización real de cada habitante.
La proyección de trabajo del CSV WKT (EPSG:22185) sigue pendiente de certificación
por la fuente municipal; ver FUENTES.md.
"""
from __future__ import annotations
import csv
import json
from collections import defaultdict
from pathlib import Path
import numpy as np
import pandas as pd
from shapely import wkt
from shapely.geometry import shape
from shapely.strtree import STRtree
from shapely.ops import transform
from pyproj import Transformer

ROOT = Path(__file__).resolve().parents[1]
ORIG = ROOT / 'datos_originales'
DER = ROOT / 'datos_derivados'


def read_json(path):
    return json.loads(path.read_text(encoding='utf-8'))


def normalize(v):
    return '' if pd.isna(v) else str(v).strip()


def main():
    audit=read_json(DER/'auditoria_territorial.json')
    spaces=read_json(DER/'espacios_auditados.geojson')['features']
    units=read_json(DER/'unidades_territoriales_agrupadas.geojson')['features']
    meta=read_json(ROOT/'documentacion/fuentes_metadatos.json')
    original_territorial=pd.read_csv(ORIG/'barrios.csv')
    original_census=pd.read_csv(ORIG/'densidad_poblacional.csv')
    original_spaces=pd.read_csv(ORIG/'espacios_verdes.csv')
    # Recuperar datos de los 140 POLÍGONOS FUENTE, diferentes de las 138 unidades agrupadas.
    polygons=[]
    with (DER/'poligonos_territoriales.csv').open(encoding='utf-8-sig',newline='') as h:
        for row in csv.DictReader(h):
            polygons.append({
                'numero_fila':int(row['indice_csv']), 'id_unidad':int(row['id_unidad']),
                'nombre_unidad':row['nombre_unidad'], 'tipo_unidad':row['tipo_unidad'],
                'area_poligono_m2':float(row['area_poligono_m2']),
                'superficie_intersectada_m2':float(row['superficie_intersectada_m2']),
                'sin_interseccion':row['sin_interseccion'].lower()=='true',
            })
    assert len(polygons)==len(original_territorial)==140

    # Estadísticas descriptivas con reglas explícitas de percentiles y límites de Tukey.
    group = defaultdict(list)
    for f in spaces:
        p=f['properties']; group[p['clasificacion_normalizada']].append(float(p['area_m2']))
    distribution=[]
    for typ, vals in sorted(group.items()):
        arr=np.array(vals, dtype=float)
        q1, med, q3 = np.percentile(arr, [25, 50, 75])
        iqr=q3-q1
        low=float(min(v for v in arr if v >= q1-1.5*iqr))
        high=float(max(v for v in arr if v <= q3+1.5*iqr))
        distribution.append({
            'tipo':typ, 'cantidad':len(vals),
            'superficie_total_m2':round(float(arr.sum()),4),
            'min':round(float(arr.min()),4), 'q1':round(float(q1),4),
            'mediana':round(float(med),4), 'media':round(float(arr.mean()),4),
            'q3':round(float(q3),4),'max':round(float(arr.max()),4),
            'desvio_muestral':round(float(arr.std(ddof=1)),4) if len(arr)>1 else None,
            'bigote_inferior':round(low,4), 'bigote_superior':round(high,4),
            'atipicos_n':int(sum((arr<q1-1.5*iqr)|(arr>q3+1.5*iqr))),
            'atipicos_valores_m2':[round(float(v),4) for v in arr if v<q1-1.5*iqr or v>q3+1.5*iqr]
        })
    assert sum(x['cantidad'] for x in distribution)==293

    # Repetir método de concentración por nombre_barrio DECLARADO, excluyendo SOLO 4000.
    # Para la vista CON reserva se muestra explícitamente el grupo sin barrio declarado.
    groups_all=defaultdict(float)
    groups_without=defaultdict(float)
    for f in spaces:
        p=f['properties']; key=p['barrio_original'] or '(sin barrio declarado)'
        groups_all[key]+=p['area_m2']
        if p['gid']!=4000: groups_without[key]+=p['area_m2']
    def ranking(groups):
        order=sorted(groups.items(),key=lambda x:(-x[1],x[0]))
        total=sum(groups.values())
        return {'total_m2':round(total,4),'top5':[
            {'nombre':key,'area_m2':round(value,4)} for key,value in order[:5]],
            'top5_pct':round(sum(v for _,v in order[:5])/total*100,6),
            'todos':[{'nombre':key,'area_m2':round(v,4)} for key,v in order]}
    c={'con_reserva':ranking(groups_all),'sin_reserva':ranking(groups_without),
       'criterio':'Agrupación por nombre_barrio declarado en espacios_verdes.csv: superficie completa de cada geometría. No corresponde a intersecciones espaciales con límites territoriales.'}
    assert abs(c['sin_reserva']['top5_pct']-audit['concentracion_campo_barrio']['porcentaje_top_5'])<1e-4

    # Proximidad geométrica: radio censal como unidad; su población se asigna entera
    # al grupo de distancia de su centroide. NO es una estimación de viviendas a distancia.
    to_m=Transformer.from_crs('EPSG:4326','EPSG:22185',always_xy=True)
    geo_src=[wkt.loads(v) for v in original_spaces['the_geom']]
    tree_all=STRtree(geo_src)
    tree_no_reserve=STRtree([g for i,g in enumerate(geo_src) if int(original_spaces.iloc[i]['gid']) != 4000])
    radii=[transform(to_m.transform,shape(json.loads(v))) for v in original_census['the_geom']]
    pops=original_census['total_poblacion'].astype(float).tolist()
    near_rows=[]
    for i,(geom,pop) in enumerate(zip(radii,pops)):
        center=geom.centroid
        d_all=float(center.distance(tree_all.geometries[tree_all.nearest(center)]))
        d_no=float(center.distance(tree_no_reserve.geometries[tree_no_reserve.nearest(center)]))
        near_rows.append({'gid_radio':int(original_census.iloc[i]['gid']),'poblacion_radio':pop,
                          'distancia_minima_todos_m':round(d_all,3),
                          'distancia_minima_sin_reserva_m':round(d_no,3)})
    total_pop=sum(pops)
    proximity={
        'descripcion':'Distancia euclidiana mínima del centroide geométrico de cada radio censal a un polígono del inventario. Población del radio acumulada si el centroide cumple el umbral.',
        'advertencia':'NO representa residentes individuales dentro de 300/500 m, no representa rutas peatonales y no certifica acceso público. Se usa la población total del conjunto censal como denominador.',
        'total_radios':len(near_rows),'poblacion_total_archivo':total_pop,
        'umbrales':{}
    }
    for flag,col in [('con_reserva','distancia_minima_todos_m'),('sin_reserva','distancia_minima_sin_reserva_m')]:
        proximity['umbrales'][flag]={}
        for dist in [300,500]:
            pts=[r for r in near_rows if r[col]<=dist]
            sub=sum(r['poblacion_radio'] for r in pts)
            proximity['umbrales'][flag][str(dist)]={
                'radios_n':len(pts),'poblacion_radiocensal':round(sub,4),
                'porcentaje_poblacion_archivo':round(100*sub/total_pop,4)}

    with (DER/'proximidad_centroides_radios.csv').open('w',newline='',encoding='utf-8-sig') as h:
        wr=csv.DictWriter(h,fieldnames=list(near_rows[0]));wr.writeheader();wr.writerows(near_rows)
    payload={
        'version_datos':'Archivos CSV originales incluidos en este repositorio; no actualización en tiempo real',
        'proyecto':audit['caracter'],
        'auditoria':audit,
        'clasificaciones':distribution,
        'concentracion':c,
        'proximidad':proximity,
        'poligonos_territoriales':polygons,
        'fuentes':meta['fuentes'],
    }
    (DER/'indicadores_dashboard.json').write_text(json.dumps(payload,ensure_ascii=False,indent=2,allow_nan=False)+'\n',encoding='utf-8')
    print('Preparado indicadores_dashboard.json, proximidad_centroides_radios.csv;'
          f' {len(units)} unidades, {len(polygons)} polígonos y {len(spaces)} espacios.')
    print('Proximidad geométrica (solo centroides, no acceso real):',proximity['umbrales'])

if __name__=='__main__':
    main()
