# Auditoría numérica reproducida — Espacios Verdes

**Grupo 2: Fernández Florencia y Ríos Oscar.**  
**Cobertura:** Ciudad de Corrientes, Corrientes Capital.  
**Origen:** copias de CSV municipales incluidas en este proyecto.  
**Naturaleza:** resultados de elaboración académica, no estadísticas oficiales municipales.  
**Estado:** indicadores estadísticos y geoespaciales reproducidos desde CSV e integrados en la interfaz V4; faltan certificación del CRS de origen, confirmación de fechas vigentes del portal y prueba visual integral en Vercel.

## Resultados que se obtienen al ejecutar el script

| Comprobación | Resultado |
|---|---:|
| Espacios del inventario (`gid` únicos) | **293** |
| Polígonos territoriales fuente | **140** |
| Identificadores territoriales únicos | **138** |
| Radios censales fuente | **319** |
| Población total de radios censales | **354.005** |
| Superficie total del inventario | **3.976.749,16 m²** |
| Reserva Natural Municipal Santa Catalina (`gid=4000`) | **2.771.672,79 m²** |
| Superficie del inventario excluyendo la reserva | **1.205.076,37 m²** |
| Participación de la reserva en la superficie total | **69,6969 %** |
| Concentración de las cinco denominaciones barriales de mayor superficie, sin la reserva | **45,7027 %** |
| Polígonos territoriales sin intersección con el inventario | **67 de 140** |
| Unidades por ID sin intersección (agrupando polígonos duplicados) | **65 de 138** |
| Unidades por ID sin asignación principal del CSV de espacios | **65 de 138** |
| Filas de polígonos sin asignación principal del CSV de espacios | **66 de 140** |
| Espacios sin intersección con los polígonos territoriales | **3 (`261`, `3005`, `4000`)** |
| ID territoriales duplicados en filas de polígonos | **23: Collantes; 56: Molina Punta** |
| Población estimada sumando asignaciones por ID | **335.817,45** |
| Población estimada en la unión de territorios (sin doble recuento) | **335.816,20** |
| Población estimada fuera de la unión territorial | **18.188,80** |
| Diferencia atribuible a intersecciones de unidades que se superponen (aproximación) | **1,24** |

## Conciliación de los valores 65, 67 y 68

**65** puede reproducirse al contar los **IDs territoriales distintos** del archivo (138) que carecen de asignación principal en `espacios_verdes.csv`. Coincide numéricamente con 65 IDs sin intersección, pero **los conjuntos de IDs no tienen por qué coincidir**: ambas definiciones se registran por separado.

**67** corresponde a las **filas de polígonos** (140) que no tienen superficie de intersección con los espacios. Dos IDs tienen dos polígonos, de modo que contar filas no equivale a contar unidades.

**68**, presente en el archivo `audit.json` de una etapa anterior, **no se reprodujo con estas definiciones** y no se usará como cifra publicada sin una explicación alternativa reproducible. Ese archivo anterior permanece como histórico, no como resultado vigente de la nueva auditoría.

## Áreas y Santa Catalina

La reserva es el registro con `gid=4000` y nombre explícito «RESERVA NATURAL MUNICIPAL SANTA CATALINA». El campo de ID de barrio está vacío en ese registro y el polígono no intersecta ninguna unidad territorial de la copia utilizada. **No se aplica reasignación silenciosa** a una unidad en esta etapa. La referencia académica a una asignación por cruce documental debe verificarse y documentarse antes de incorporarla como metadato.

El indicador del **45,7027 %** agrupa las áreas geométricas completas del resto de espacios por el campo `nombre_barrio` original. Los cinco primeros son **ARAZATI (147.371,72 m²), CAMBA CUA (133.859,28 m²), SANTA CATALINA (123.158,93 m²), ALDANA (82.007,82 m²) y DR. MONTAÑA (64.354,67 m²)**. No se ha calculado ese porcentaje a partir de intersección física con límites territoriales; esa métrica sería distinta.

## Calidad de datos de espacios

- `nombre_plaza`: **16 nulos** y **126 valores literales `S/N`**. No implica que el espacio no tenga nombre en la realidad.
- `ordenanza`: **79 nulos**.
- `id_barrios`: **2 nulos**; además, aparecen los IDs **0 y 124**, ausentes en los IDs de la tabla territorial actual.
- `nombre_barrio`: **4 nulos**.
- `ubicacion`: **1 nulo**.
- Geometrías de origen: **0 inválidas** bajo el validador de Shapely.

## Población: lectura metodológicamente correcta

La población de `total_poblacion` suma **354.005**. El método de distribución areal estima unos **335.816 habitantes equivalentes** dentro de la unión de los polígonos territoriales. La diferencia estimada de **18.189 habitantes equivalentes** corresponde a la **fracción de área censal no cubierta por esa unión**, bajo la hipótesis de reparto homogéneo por radio; no acredita el lugar real de residencia de esos individuos. Los solapamientos entre delimitaciones territoriales aportan aproximadamente 1,24 habitantes equivalentes extra cuando se suman unidades independientemente.

Por lo tanto, cualquier tasa de m²/habitante será explícitamente estimada e histórica, no un conteo directo actual.

## Comprobación técnica de la transformación de coordenadas

Al transformar los polígonos originales desde EPSG:22185 a WGS84, las coordenadas de registros de muestra (por ejemplo, `gid=356` y `gid=323`) coinciden con los GeoJSON heredados de V2 a nivel de redondeo numérico. Transformar desde EPSG:5347 produce desplazamientos de varios decímetros. Esta concordancia **respalda la consistencia interna con V2**, pero **no sustituye la confirmación oficial del CRS por parte de la fuente municipal**.

## Condiciones pendientes antes de publicar en el dominio definitivo

1. Obtener o confirmar documentalmente el código EPSG exacto de la geometría WKT municipal (se utilizó EPSG:22185 como supuesto operacional coherente).
2. Contrastar los metadatos actualizados del portal con la copia utilizada, guardando fecha de descarga real de cada nueva versión.
3. Documentar de forma verificable la asociación administrativa de la reserva a Santa Catalina cuando corresponda, sin cambiar el dato crudo.
4. Probar la interfaz V4 en el proyecto de Vercel de prueba, incluyendo filtros, exportación, comparación y visualización móvil.
5. La V4 calcula proximidad geométrica por **centroides de radios** a 300/500 m: 207/319 radios y 228.639 habitantes de esos radios (64,5864 %) a ≤300 m; 271/319 radios y 311.291 habitantes (87,9341 %) a ≤500 m. **No mide accesibilidad real ni distancias individuales.** La proyección sigue pendiente de confirmación.

Este informe se genera a partir de resultados auditados con `procesar_territorio.py` y verificados por `validar_resultados.py`. Los detalles completos están en `datos_derivados/auditoria_territorial.json`.
