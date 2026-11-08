# Registro de comprobaciones — Corrientes Verde: Grupo 2

**Proyecto académico independiente: Fernández Florencia y Ríos Oscar (Grupo 2).**

## Pruebas realizadas con los archivos de esta entrega

- `python procesamiento/validar_resultados.py` recompone datos territoriales desde `datos_originales/` y comprueba resultados esperados.
- `python procesar_reciclaje.py` regenera `reciclaje.json` desde los CSV históricos.
- `node --check script.js` y `node --check reciclaje.js`: sintaxis válida.
- Validación estática: los enlaces locales y archivos relativos usados en `index.html` existen; los JSON del paquete se pueden leer; los controles principales tienen identificadores únicos.
- Prueba de interfaz con Chromium headless: se inyectó el **HTML y CSS reales**, los **JSON y GeoJSON reales** y se simularon las bibliotecas externas Leaflet y Chart.js (sin renderizar sus mapas/gráficos). Se comprobó que se cargan indicadores y tablas, la búsqueda incluye 293 espacios y filtra 104 PLAZAS, se alterna el directorio de 138 unidades a 140 polígonos, se exporta CSV, la concentración cambia con/sin reserva y se activa el control de reciclaje. No se detectaron excepciones de JavaScript en esta prueba.

## Qué NO prueba este registro

La prueba con bibliotecas externas simuladas **no acredita** el renderizado real de gráficos Chart.js, los mapas Leaflet, los mosaicos OSM ni el despliegue Vercel. El intento de navegar el servidor local mediante navegador automatizado fue bloqueado por restricciones del entorno. La validación visual y de interacción con las bibliotecas reales debe repetirse tras cada despliegue, en particular antes de utilizar el enlace público ante el profesor o las autoridades.

## Advertencias de fuente

- La fecha de descarga de las copias originales no se encuentra documentada: **no inventarla**.
- Las fechas informadas por el Grupo 2 describen lo publicado en el portal municipal cuando lo consultaron. La eventual publicación de nuevos recursos no actualiza automáticamente los CSV del tablero.
- El EPSG del WKT original se adoptó como hipótesis operacional **no certificada**.
- La población por unidad y la proximidad de centroides son aproximaciones metodológicas explícitas, no conteos observados de personas por barrio ni acceso peatonal efectivo.


## Comprobaciones de concentración y presentación de reserva

- Fechas de portal proporcionadas por los autores: Espacios verdes y tres datasets de reciclaje. La copia integrada al proyecto se identifica por separado.
- La reserva Santa Catalina aparece como categoría independiente en el ranking; otros espacios sin barrio declarado se conservan separados. La suma de superficies completa se mantiene.
- El porcentaje de concentración sin reserva permanece en 45,702699 %.
- Se incorporan descripciones en lenguaje accesible junto a los gráficos y definiciones técnicas desplegables.
- Se incorpora enlace al repositorio definitivo del proyecto.

## Revisión de metadatos de las fuentes

- Fechas del portal para Barrios y Densidad poblacional completadas como 01/10/2025, procedentes de la consulta comunicada por el Grupo 2.
- Renombradas en la interfaz las columnas «Última actualización en el portal» y «Copia incorporada al proyecto».
- El archivo RENABAP no se utiliza ni forma parte del paquete.
- La excepción de Santa Catalina conserva el identificador técnico 4000, pero lo muestra con nombre explicativo en los filtros.
