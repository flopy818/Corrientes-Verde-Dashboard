# Corrientes Verde — Atlas urbano interactivo

Versión de prueba **independiente** del dashboard de espacios verdes de Corrientes. Rediseño integral de interfaz, mapa navegable, búsqueda de todas las unidades barriales, filtros, ranking territorial, tasa estimada de m² por habitante y documentación de fuentes y límites.

## Publicar en GitHub + Vercel

1. Creá o abrí el repositorio **Prueba-Espacios-Verdes** (no modifiques el repositorio original).
2. Subí **el contenido de esta carpeta** a la raíz del repositorio: `index.html`, `styles.css`, `script.js`, `espacios.geojson`, `barrios.geojson`, `audit.json`, `METODOLOGIA.md`, `README.md` y la carpeta `datos_originales/`.
3. En Vercel, seleccioná **Add New → Project**, importá ese repositorio y elegí **Other** como framework. No hay comando de build; la carpeta de salida es la raíz del proyecto.
4. Desplegá y comprobá mapa, búsqueda, tabla, filtros y gráficos.

**Importante:** `data2.js` **no es necesario en esta versión**. El JavaScript lee directamente los dos GeoJSON. Los CSV originales se conservan para trazabilidad, pero la interfaz no los descarga en tiempo de ejecución.

## Ejecutar localmente

En esta carpeta, ejecutar `python -m http.server 8000` y abrir `http://localhost:8000`.

## Dependencias

Leaflet 1.9.4, Chart.js 4.4.7 y teselas CARTO/OpenStreetMap por CDN. Requiere conexión a Internet.

## Limitaciones

Consultar [METODOLOGIA.md](METODOLOGIA.md) antes de citar cifras. Las tasas barriales son estimaciones y los GeoJSON son derivados de un procesamiento previo que necesita auditoría reproducible. No se incorporó la sección de reciclaje porque el CSV correspondiente no fue proporcionado. El proyecto no es oficial.


## Actualización de reciclaje
Esta versión incorpora `reciclaje.json`, `reciclaje.js` y `procesar_reciclaje.py`, además de tres CSV de origen. Los datos se reproducen ejecutando `python procesar_reciclaje.py` con pandas instalado. Se mantienen las limitaciones documentadas en METODOLOGIA.md.
