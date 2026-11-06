# Metodología y límites del Atlas Corrientes Verde

**Naturaleza:** proyecto académico independiente. No es una publicación oficial de la Municipalidad de la Ciudad de Corrientes.

## Archivos de origen

- `datos_originales/espacios_verdes.csv`: vista municipal de espacios verdes (`_vw_espacio_verde__202510011132` en el nombre de archivo recibido; **no equivale necesariamente a fecha de descarga**).
- `datos_originales/barrios.csv`: geometrías y denominaciones de barrios / unidades territoriales.
- `datos_originales/densidad_poblacional.csv`: 319 radios censales, según documentación académica, con referencia al Censo 2010.
- Fuente institucional de espacios verdes: https://datos.ciudaddecorrientes.gov.ar/dataset/espacios-verdes

La fecha exacta de descarga de cada CSV no se encuentra verificada en los archivos entregados.

## Archivos derivados

- `espacios.geojson`: 293 polígonos, transformados a coordenadas WGS84 para visualización; atributos de superficie y tipología.
- `barrios.geojson`: 140 unidades territoriales, con conteo asignado, superficie verde intersectada y población estimada.
- `audit.json`: registro de controles del procesamiento geográfico previo.

Los archivos GeoJSON y el registro de auditoría se recuperaron de una versión anterior de trabajo. **Este paquete no incluye el programa original que produjo esos cálculos**; por tanto, se presentan como resultados de procesamiento previo pendientes de reproducción independiente, no como una auditoría nueva o una validación exhaustiva.

## Interpretación de indicadores

- **Cantidad de espacios verdes:** número de geometrías del inventario, no total de vegetación de la ciudad.
- **Superficie registrada:** suma de áreas de los polígonos de espacios verdes. El polígono mayor se presenta de forma diferenciada en el análisis por tipología; debe confirmarse su denominación exacta antes de usarlo como identificador automático de Santa Catalina.
- **Barrios sin intersección:** unidades con `green = 0` en el cruce espacial previo. No implica ausencia absoluta de árboles, plazas o áreas naturales.
- **Conteo asignado por barrio (`count`):** resultado de asignación territorial previa; no debe confundirse con número de intersecciones.
- **Superficie intersectada (`green`):** m² de intersección entre inventario y unidad barrial. No equivale a la suma completa de polígonos asignados.
- **Población estimada (`pop`):** distribución proporcional de habitantes de radios censales por superficie superpuesta a cada unidad barrial, asumiendo distribución homogénea dentro de cada radio.
- **Tasa (`rate`):** m² verdes intersectados por habitante estimado; aproximación territorial, no indicador municipal oficial.

## Advertencias importantes

Según `audit.json`:

| Control | Resultado del procesamiento previo |
|---|---:|
| Polígonos de espacios verdes | 293 |
| Unidades territoriales | 140 |
| Radios censales | 319 |
| Población censal total en fuente | 354.005 |
| Población distribuida a unidades | 335.817 |
| Unidades sin intersección verde | 67 |
| Unidades sin espacios por asignación principal | 68 |
| Espacios sin intersección | 3 |
| Espacios que cruzan más de una unidad | 16 |

La diferencia entre población total y población distribuida requiere revisión; puede relacionarse con cobertura, superposiciones o geometrías. No se interpreta como población no cubierta sin un análisis reproducible. El informe docente anterior mencionaba 65 unidades sin espacios; los 67 corresponden a un criterio **distinto** (`green = 0`) en los archivos derivados. No deben presentarse como una misma cifra.

## Proyección y medición

La fuente de espacios verdes contiene geometrías proyectadas en Gauss-Krüger faja 5; la visualización web utiliza WGS84. Para reproducir las superficies y cruces se requiere especificar el código EPSG exacto, verificar la transformación y medir en sistema métrico. El código de reprocesamiento geográfico no está incluido en este paquete.

## Alcance de la revisión docente

Se incorporan: búsqueda de todas las unidades, mapa con unidades sin intersección, m²/hab. estimados, sección metodológica, distinción del polígono de gran superficie, coherencia numérica local y eliminación de referencias a Sprint 1 / Qué sigue.

**No se recreó la sección «Reciclando Juntos» ni su serie mensual:** ese dataset no está entre los tres CSV suministrados. Inventar kilos, meses o localizaciones sería metodológicamente incorrecto. Para recuperarla se necesita la fuente original, incluidos registros de eventos y puntos verdes. Tampoco se calcula población a 300/500 m de un espacio verde sin reprocesamiento reproducible de radios y distancias.

## Cómo reproducir el sitio

La interfaz funciona leyendo `espacios.geojson` y `barrios.geojson` mediante `fetch`. Debe servirse por HTTP (Vercel o servidor local), no abrirse mediante `file://`. El mapa base, Chart.js y Leaflet se cargan desde proveedores externos; se requiere Internet.


## Ampliación: reciclaje histórico (versión de auditoría)

- **Recolección en puntos verdes:** 213 registros del archivo recibido, del 17/01/2019 al 13/09/2020. Los kilogramos se interpretan con coma decimal. Eventos: 4.303,163 kg de un total de 8.437,213 kg (51,00 %). Incluye 50 kg de registros sin punto identificado. Los meses sin registros se muestran como faltantes (`null`), no como cero.
- **Reciclando Juntos / Ruleros:** 293 registros; 160 de modalidad «a puerta» y 133 «rulero». Se calcula por separado, sin sumar las dos fuentes por posible solapamiento. `cantidad_domicilios` está vacío en todos los registros; se detectó una fecha no interpretable (`0202/09/06`).
- **Localización de puntos verdes:** 22 ubicaciones del archivo municipal. No se presupone que estén activas actualmente. Solo se vinculan kg históricos a nombres coincidentes sin ambigüedad. No se vincula «Bº Santa Catalina» con el registro de recolección «Santa Catalina» sin documentación adicional.
- **Reproducibilidad:** ejecutar `python procesar_reciclaje.py` (requiere pandas) para regenerar `reciclaje.json`.
- **Fecha de actualización del portal vs. fecha de observación:** las fechas de publicación y actualización del catálogo no son fechas de los eventos de recolección. La fecha exacta de descarga de los CSV no está documentada.
- **Pendientes de auditoría:** conciliación de 65/67/68 unidades sin verde; reproducción integral del cruce de población; asignación documental de la reserva Santa Catalina; comparación territorial de concentración.
