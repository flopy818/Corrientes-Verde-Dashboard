# Metodología — Corrientes Verde V4

**Grupo 2 · Fernández Florencia y Ríos Oscar**  
**Ámbito:** ciudad de Corrientes, Corrientes Capital.  
**Objeto principal:** descripción y análisis estadístico/geoespacial de los registros del dataset municipal **Espacios verdes**.  
**Naturaleza:** trabajo académico independiente, sin inferencias causales ni recomendaciones administrativas.

## 1. Archivos y procedencia

Se usan copias identificadas de CSV de espacios verdes (293 registros), barrios/unidades territoriales (140 polígonos), densidad poblacional/radios censales (319 registros), y tres archivos históricos de reciclaje. Se conservan como entradas en `datos_originales/`; su origen y fechas están en [`documentacion/FUENTES.md`](documentacion/FUENTES.md). El archivo `datos_derivados/registro_fuentes_sha256.json` identifica las copias principales por hash; la huella digital **no prueba la fecha de descarga**. El catálogo y el sitio no se consultan en tiempo real.

## 2. Identificadores y geometrías

- Espacio: `gid` original, **293 valores únicos**.
- Territorio: 140 polígonos fuente; los IDs `id_barrios=23` y `56` aparecen dos veces, dando **138 identificadores territoriales únicos**. Se conservan las 140 filas y se genera una unión geométrica por ID para gráficos y comparaciones.
- Radio censal: `gid` original, 319 geometrías.
- Las geometrías se verifican con Shapely: no se realizan reparaciones silenciosas de geometrías inválidas.

Las geometrías de espacios vienen en formato WKT proyectado, sin código EPSG explícito. **Para transformar barrios y radios a un sistema métrico común, se adopta provisoriamente EPSG:22185 (POSGAR 94 / Argentina 5)**, basado en consistencia con las coordenadas y visualizaciones previas, **pendiente de certificación por la fuente**. Los resultados que dependen de distancias y áreas llevan esa limitación. GeoJSON de visualización se transforma a WGS84 (EPSG:4326).

## 3. Indicadores de superficie y categorías

`superficie_m2 = área geométrica del polígono WKT transformado a sistema métrico de trabajo`; superficie total = suma para los 293 registros. El inventario incluye distintas clases, por ejemplo plazas, plazoletas, paseos y rotonda: **superficie de inventario no significa cobertura vegetal**.

Los grupos por tipología provienen de `clasificacion` del CSV. Se conserva el valor original y una versión normalizada de uso gráfico. Para cada clase: recuento, suma, mínimo, máximo, media, mediana, percentiles Q1/Q3 y desvío estándar muestral (con `ddof=1`, no calculado para grupos de tamaño 1). El diagrama de cajas utiliza bigotes de Tukey con límite de 1,5 × IQR, mostrando valores fuera de los bigotes como puntos; el eje es logarítmico en m².

## 4. Reserva Santa Catalina y concentración

La reserva es **GID 4000**, nombre textual «RESERVA NATURAL MUNICIPAL SANTA CATALINA». Excluir la reserva significa excluir exactamente ese ID, **no** excluir cualquier espacio grande. El campo territorial del registro está vacío y su polígono no intersecta los polígonos territoriales del archivo utilizado. **No se asigna automáticamente al barrio Santa Catalina**; cualquier relación administrativa adicional exige respaldo documental verificable.

El valor **45,7027 %** corresponde a esta operación:

1. Excluir el registro GID 4000.
2. Agrupar **superficies completas** de los otros registros por el **campo `nombre_barrio` del propio CSV** (categoría sin barrio declarado explícita cuando corresponda).
3. Ordenar los grupos de mayor a menor y sumar las superficies de los cinco primeros.
4. Dividir esa suma entre la superficie de todos los registros salvo GID 4000 y multiplicar por 100.

Esto **no es** el porcentaje de superficie intersectada con las geometrías barriales. La vista «con reserva» utiliza exactamente el mismo procedimiento, incluyendo GID 4000 como registro **sin barrio declarado** cuando así figura en la fuente.

## 5. Asignación por CSV versus intersección geoespacial

**Registros asignados:** se cuentan los espacios por su columna `id_barrios`.  
**Registros intersectados:** se cuenta todo espacio cuya geometría tenga intersección de área **superior a 0,01 m²** con la unidad, tras agrupar los polígonos por ID.  
**Superficie intersectada:** suma de áreas geométricas del fragmento de cada espacio que solapa cada unidad territorial.

Un espacio puede aparecer en más de una unidad intersectada. La suma por unidades puede repetir superficies si los polígonos territoriales se superponen. No se interpreta «sin intersección registrada» como ausencia física de vegetación o espacios públicos. La documentación reporta por separado **65 IDs sin asignación principal**, **65 IDs sin intersección** y **67 polígonos de 140 sin intersección**.

## 6. Población por unidad: aproximación areal

Por cada radio censal, se calcula la proporción del área del radio que intersecta cada unidad territorial. Se multiplica esa proporción por `total_poblacion` del radio y se suman aportes. **Esto supone distribución homogénea de la población dentro de cada radio**; es una estimación espacial, no un conteo de personas ni una estadística oficial por barrio.

Se mantiene el total de 354.005 habitantes que figura en el archivo censal completo, y se contabiliza por separado la cobertura de la **unión** de territorios (335.816,20 habitantes equivalentes) y el equivalente fuera de esa unión (18.188,80). Al sumar estimaciones individuales por unidad se obtiene 335.817,45 por aproximadamente 1,24 de solapamiento; no se oculta esta discrepancia.

`m²/habitante estimado = superficie verde intersectada de la unidad / población estimada areal`, cuando la población es mayor que cero. No equivale a accesibilidad efectiva, calidad de los espacios, ni disponibilidad de vegetación.

## 7. Proximidad geométrica de centroides

Para los **319 radios censales** se calcula su centroide geométrico, luego su **distancia euclidiana mínima** al polígono más cercano del inventario. Se repite con todos los espacios y con GID 4000 excluido. Se cuenta cuántos centroides quedan a **300 m y 500 m** o menos, y se suma **toda la población censal de los radios correspondientes**. Denominador del porcentaje: 354.005 habitantes del archivo censal.

**Interpretación permitida:** «porcentaje de la población del archivo contenida en radios cuyos centroides se encuentran a ≤500 m de un polígono del inventario».  
**Interpretaciones prohibidas:** «porcentaje de residentes que viven a 500 m de una plaza», «acceso peatonal a un espacio», «porcentaje de población cubierta», porque este procedimiento no identifica domicilios, entradas habilitadas, rutas transitables ni uso efectivo del espacio. El indicador es descriptivo y aproximado. La diferencia con/sin reserva resulta nula en estas copias; el cálculo se mantiene en ambas vistas para hacerlo verificable.

## 8. Reciclaje: complemento histórico independiente

`procesar_reciclaje.py` genera `reciclaje.json` a partir de los CSV de recolección en puntos verdes, Reciclando Juntos y localización. Distingue eventos y otras modalidades. El total de un dataset no se suma al otro sin certificar independencia de observaciones. Los meses sin registros se dejan en `null`, no se asignan arbitrariamente a 0. La cobertura temporal del primer CSV es de 2019 a 2020. La lista geográfica no certifica actividad actual de puntos verdes.

## 9. Reproducción y control de vigencia

Ejecutar:

```bash
python -m pip install -r procesamiento/requirements.txt
python procesamiento/procesar_territorio.py
python procesamiento/preparar_dashboard.py
python procesar_reciclaje.py
python procesamiento/validar_resultados.py
```

La última validación reconstruye los datos derivados desde las copias de origen y verifica resultados esperados. La página lee `datos_derivados/espacios_auditados.geojson`, `unidades_territoriales_agrupadas.geojson` e `indicadores_dashboard.json` y el `reciclaje.json`. Se publica como sitio estático en Vercel. **Ni un deploy ni una fecha de actualización indexada prueban que el CSV utilizado sea el más nuevo disponible.** La consulta de metadatos en vivo del portal debe repetirla el grupo antes de la entrega definitiva.
