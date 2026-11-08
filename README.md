# Corrientes Verde — Grupo 2 · Versión V4 candidata de prueba

**Autores:** Fernández Florencia y Ríos Oscar  
**Carácter:** proyecto académico independiente, no oficial.  
**Cobertura:** **ciudad de Corrientes (Corrientes Capital)**, provincia de Corrientes, Argentina; **no** toda la provincia.  
**Dataset principal:** [Espacios verdes — Municipalidad de la Ciudad de Corrientes](https://datos.ciudaddecorrientes.gov.ar/dataset/espacios-verdes).

## Qué incluye esta versión

Se **conservó el estilo visual verde/crema, la tipografía, la barra lateral y el mapa Leaflet** de la versión V2. El sitio ahora **consume los GeoJSON auditados** y `indicadores_dashboard.json` elaborados desde las copias de CSV que están en `datos_originales/`.

1. **Panorama:** 293 espacios, 8 clases, superficies, 140 polígonos territoriales (138 IDs) y controles de intersección.
2. **Mapa:** búsquedas en todos los espacios, filtros por clase y asignación declarada, indicadores territoriales diferentes y ficha de cada polígono.
3. **Territorio y población:** directorios de 138 unidades agrupadas y 140 polígonos originales, exportación CSV, comparador de 2 unidades, estimaciones poblacionales areales y proximidad geométrica de centroides de radios a 300/500 metros.
4. **Tipologías:** recuentos, áreas, tabla de estadística descriptiva, diagrama de cajas en escala logarítmica, ranking de concentración y control para excluir **solo el GID 4000** de la reserva.
5. **Reciclaje histórico:** complemento conservado; **no** se suman los datasets sin comprobar su independencia y **no** se presentan como actuales.
6. **Fuentes y metodología:** ficha temporal de cada fuente, calidad del inventario y links a los documentos y datos procesados.

No se incluye arbolado urbano, recomendaciones políticas, inferencias causales ni predicciones.

## Cómo publicarlo en GitHub + Vercel

1. **Usar un repositorio de prueba**, sin reemplazar el repositorio/dominio ya enviado al profesor.
2. Subir **el contenido de esta carpeta a la raíz** del repositorio (incluidos `index.html`, `script.js`, `datos_derivados/` y `datos_originales/`). No subir solamente el ZIP.
3. En Vercel, importar ese repositorio, elegir **Other** como framework si se solicita y mantener `./` como directorio raíz. No requiere comando de compilación ni instalación de Python para servir la web: los JSON/GeoJSON generados ya están incluidos.
4. Probar mapa, búsqueda, fichas, gráficos, comparador, exportación y la sección de fuentes en el dominio **de prueba** antes de modificar la versión pública que conoce el profesor.
5. Para conservar el enlace original, una vez aprobada la prueba, copiar esta versión al **mismo repositorio asociado al proyecto Vercel original**; no eliminar/recrear ese proyecto ni cambiar su dominio.

Para probar localmente, desde la raíz:

```bash
python -m http.server 8000
# Abrir http://localhost:8000
```

No abrir `index.html` por doble clic: `file://` puede bloquear las lecturas de datos JSON y GeoJSON.

## Reproducir el procesamiento

Requiere Python 3.10 o superior:

```bash
python -m pip install -r procesamiento/requirements.txt
python procesamiento/procesar_territorio.py
python procesamiento/preparar_dashboard.py
python procesar_reciclaje.py
python procesamiento/validar_resultados.py
```

El último comando ejecuta nuevamente las dos primeras etapas territoriales y comprueba totales, IDs, superficies, concentraciones, estructura de archivos y resultados de proximidad para **estas copias exactas**. Cuando se actualicen los datasets, documentar nueva versión de entrada y actualizar los controles justificadamente.

### Estructura

- `index.html`, `styles.css`, `script.js`: interfaz y análisis de espacios verdes; cargan solo `datos_derivados/*`.
- `reciclaje.js`, `reciclaje.json`, `procesar_reciclaje.py`: módulo histórico complementario.
- `datos_originales/*.csv`: copias del material fuente utilizado, **sin modificaciones**.
- `procesamiento/procesar_territorio.py`: geometrías, áreas, intersecciones, agregación, población areal, auditoría y SHA-256.
- `procesamiento/preparar_dashboard.py`: indicadores finales, boxplots, proximidad y metadatos para la web.
- `procesamiento/validar_resultados.py`: pruebas de regresión desde CSV.
- `datos_derivados/espacios_auditados.geojson`, `unidades_territoriales_agrupadas.geojson`, `indicadores_dashboard.json`: resultados que consume la página.
- `datos_derivados/*.csv`, `proximidad_centroides_radios.csv`: tablas exportables y auditoría.
- `METODOLOGIA.md`, `documentacion/{FUENTES,DICCIONARIO_DATOS,INFORME_AUDITORIA}.md`: explicación técnica, fuentes y limitaciones.

## Estado de validación y advertencias

**Se realizaron pruebas de generación y controles automatizados de datos y sintaxis de JavaScript.** La prueba de navegador automatizado quedó restringida en el entorno de ejecución y **no equivale a una prueba visual integral del sitio desplegado en Vercel**. Esta V4 es una **candidata para el repositorio de prueba**, no una versión publicada certificada.

Las superficies originales del CSV WKT usan coordenadas métricas, pero **el EPSG exacto no está declarado en el propio archivo**. Se utiliza EPSG:22185 como hipótesis de procesamiento internamente coherente, **pendiente de confirmación documental de la fuente municipal**. La estimación de población usa fracciones de superficie de radios censales históricos (no censos oficiales por barrio). La proximidad 300/500 m utiliza el **centroide geométrico de cada radio**, no accesibilidad peatonal ni distancia individual. No equivale a medir disponibilidad o calidad de espacios públicos.

La ficha municipal puede haber cambiado desde la obtención de los CSV originales. [**Consultar fuentes y fechas**](documentacion/FUENTES.md): las fechas de actualización **indexadas** están marcadas como pendientes de revalidación, y la **fecha real de descarga de las copias no está documentada**. El dashboard no se actualiza en tiempo real.

## Contacto y uso

Proyecto académico independiente de **Fernández Florencia y Ríos Oscar (Grupo 2)**. Los datos proceden de las fuentes indicadas; los cálculos y visualizaciones son elaboración del grupo y no se atribuyen oficialmente a la Municipalidad.
