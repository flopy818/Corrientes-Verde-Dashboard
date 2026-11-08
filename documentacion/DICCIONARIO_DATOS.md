# Diccionario de variables — Corrientes Verde V4

**Grupo 2: Fernández Florencia y Ríos Oscar.** Referencias completas: `FUENTES.md`.

| Campo | Origen | Significado en el dashboard |
|---|---|---|
| `gid` | Espacios verdes | Identificador original de un espacio; 293 IDs únicos en el CSV utilizado. |
| `nombre_plaza` / `nombre_original` | Espacios verdes | Denominación textual original, puede ser `S/N` o faltar. |
| `clasificacion` / `clasificacion_normalizada` | Espacios verdes | Tipo textual original y etiqueta normalizada para gráficos. |
| `ubicacion` / `ubicacion_original` | Espacios verdes | Referencia de ubicación registrada por la fuente. |
| `id_barrios` / `id_barrio_original` | Espacios verdes | ID territorial declarado en el registro, **no equivale a intersección**. |
| `nombre_barrio` / `barrio_original` | Espacios verdes | Nombre territorial declarado, utilizado en ranking de concentración. |
| `the_geom` | Fuentes geográficas | Geometría WKT (espacios) o GeoJSON (barrios y radios). |
| `area_m2` | Procesado | Área de geometría WKT expresada en m² bajo proyección de trabajo. |
| `numero_unidades_intersectadas` | Procesado | Cantidad de IDs territoriales con intersección de área >0,01 m². |
| `es_reserva_santa_catalina` | Procesado | Verdadero solo si `gid=4000`, corroborado por su denominación textual. |
| `id_unidad` | Barrios | Clave de unidad territorial; 138 IDs a partir de 140 polígonos. |
| `cantidad_poligonos_fuente` | Procesado | Cantidad de filas/polígonos municipales que comparten ID. |
| `cantidad_espacios_asignados_csv` | Procesado | Cantidad de espacios cuyo `id_barrios` coincide con ID de la unidad. |
| `cantidad_espacios_intersectados` | Procesado | Cantidad de polígonos de espacios con área intersectada positiva sobre la unidad agrupada. |
| `superficie_intersectada_m2` | Procesado | Suma de áreas de intersección por unidad, en m². |
| `poblacion_estimada_areal` | Procesado | Suma proporcional por área de población de radios censales, no conteo oficial barrial. |
| `m2_intersectados_por_habitante_estimado` | Procesado | Área de intersección / población estimada, cuando denominador >0. |
| `sin_interseccion` | Procesado | No hay áreas de intersección >0,01 m² con el inventario utilizado. |
| `distancia_minima_todos_m` | Procesado | Distancia euclidiana del centroide censal al polígono más cercano de todo el inventario. |
| `distancia_minima_sin_reserva_m` | Procesado | Misma distancia excluyendo GID 4000. |
| `porcentaje_poblacion_archivo` | Procesado | Porcentaje de la suma de población censal de radios con centroides bajo un umbral; no equivale a accesibilidad real. |
| `fecha_actualizacion_dataset_indexada` | Metadatos | Fecha encontrada en resultados indexados; **no certificada en vivo**. |
| `fecha_descarga_copia` | Metadatos | Fecha en que se descargó el CSV usado; `null` cuando no está documentada. |

El dataset de *Espacios verdes* incluye diferentes clases y sus áreas geométricas; la denominación «superficie registrada» no equivale a superficie vegetal.
