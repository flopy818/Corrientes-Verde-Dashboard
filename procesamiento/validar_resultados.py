#!/usr/bin/env python3
"""Comprobaciones automáticas para las COPIAS EXACTAS de los tres CSV de la etapa 1.
Ejecutar: python procesamiento/validar_resultados.py
No se deben modificar los resultados esperados para ocultar errores: al actualizar
las fuentes, registrar una nueva versión y justificar la modificación del control.
"""
from __future__ import annotations
import json, subprocess, sys
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]


def approx(actual, expected, tolerance, label):
    if abs(actual-expected)>tolerance:
        raise AssertionError(f'{label}: se esperaba {expected} +/-{tolerance}; obtenido {actual}')


def main():
    print('Recalculando desde datos_originales...')
    subprocess.run([sys.executable, str(ROOT/'procesamiento/procesar_territorio.py')],check=True)
    subprocess.run([sys.executable, str(ROOT/'procesamiento/preparar_dashboard.py')],check=True)
    d=json.loads((ROOT/'datos_derivados/auditoria_territorial.json').read_text(encoding='utf-8'))
    raw=d['registros']; area=d['superficies']; u=d['unidades_sin_espacios']; pop=d['poblacion']; c=d['concentracion_campo_barrio']
    assert raw['espacios']==293 and raw['espacios_gid_unicos']==293
    assert raw['poligonos_territoriales']==140 and raw['unidades_territoriales_ids_unicos']==138
    assert raw['radios_censales']==319
    approx(raw['poblacion_total_archivo_censal'],354005,0.01,'Población censal')
    approx(area['total_inventario_m2'],3976749.16,0.1,'Área inventario')
    assert area['reserva_gid']==4000 and 'SANTA CATALINA' in area['reserva_nombre_csv']
    approx(area['reserva_m2'],2771672.794,0.1,'Área de reserva')
    approx(area['sin_reserva_m2'],1205076.366,0.1,'Área sin reserva')
    assert u['ids_sin_asignacion_principal_csv']==65
    assert u['filas_de_poligonos_sin_asignacion_principal']==66
    assert u['ids_sin_superficie_intersectada']==65
    assert u['filas_de_poligonos_sin_superficie_intersectada']==67
    assert set(d['espacios_sin_interseccion'])=={261,3005,4000}
    assert d['ids_barrios_repetidos']=={'23':2,'56':2}
    assert d['ids_asignacion_espacios_no_existentes_en_tabla_territorial']==[0,124]
    approx(c['porcentaje_top_5'],45.702699,0.0005,'Concentración cinco')
    approx(pop['asignada_por_suma_de_unidades'],335817.447,0.1,'Población estimada en unidades')
    approx(pop['fuera_de_cobertura_de_union_estimado'],18188.7952,0.1,'Población estimada fuera de unión territorial')
    assert d['calidad_espacios']['nombre_nulo']==16 and d['calidad_espacios']['nombre_sn']==126
    assert d['calidad_espacios']['ordenanza_nula']==79
    for filename, expected_n in [('espacios_auditados.geojson',293),('unidades_territoriales_agrupadas.geojson',138)]:
        feat=json.loads((ROOT/'datos_derivados'/filename).read_text(encoding='utf-8'))['features']
        assert len(feat)==expected_n, f'{filename}: {len(feat)} versus {expected_n}'
    # Integridad entre los productos auditados y los consumidos por el sitio.
    ui=json.loads((ROOT/'datos_derivados/indicadores_dashboard.json').read_text(encoding='utf-8'))
    assert ui['auditoria']['registros']['espacios']==293
    assert len(ui['poligonos_territoriales'])==140
    assert len(ui['clasificaciones'])==8
    assert sum(t['cantidad'] for t in ui['clasificaciones'])==293
    assert ui['proximidad']['total_radios']==319
    assert abs(ui['concentracion']['sin_reserva']['top5_pct']-45.702699)<0.0005
    assert len((ROOT/'datos_derivados/proximidad_centroides_radios.csv').read_text(encoding='utf-8-sig').splitlines())==320
    assert abs(ui['proximidad']['umbrales']['con_reserva']['300']['poblacion_radiocensal']-228639)<0.1
    assert abs(ui['proximidad']['umbrales']['con_reserva']['500']['poblacion_radiocensal']-311291)<0.1
    print('\nRESULTADO: controles automáticos superados con los CSV originales de esta entrega.')
    print('NOTA: controles de coherencia no certifican el EPSG de origen, la vigencia ni la calidad de los datos externos.')

if __name__=='__main__':
    main()
