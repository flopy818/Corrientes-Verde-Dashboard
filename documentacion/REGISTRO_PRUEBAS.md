# Registro de comprobaciones — Corrientes Verde V4 (candidata)

**Proyecto académico independiente: Fernández Florencia y Ríos Oscar (Grupo 2).**

## Pruebas realizadas con los archivos de esta entrega

- `python procesamiento/validar_resultados.py` recompone datos territoriales desde `datos_originales/` y comprueba resultados esperados.
- `python procesar_reciclaje.py` regenera `reciclaje.json` desde los CSV históricos.
- `node --check script.js` y `node --check reciclaje.js`: sintaxis válida.
- Validación estática: los enlaces locales y archivos relativos usados en `index.html` existen; los JSON del paquete se pueden leer; los controles principales tienen identificadores únicos.
- Prueba de interfaz con Chromium headless: se inyectó el **HTML y CSS reales**, los **JSON y GeoJSON reales** y se simularon las bibliotecas externas Leaflet y Chart.js (sin renderizar sus mapas/gráficos). Se comprobó que se cargan indicadores y tablas, la búsqueda incluye 293 espacios y filtra 104 PLAZAS, se alterna el directorio de 138 unidades a 140 polígonos, se exporta CSV, la concentración cambia con/sin reserva y se activa el control de reciclaje. No se detectaron excepciones de JavaScript en esta prueba.

## Qué NO prueba este registro

La prueba con bibliotecas externas simuladas **no acredita** el renderizado real de gráficos Chart.js, los mapas Leaflet, los mosaicos OSM ni el despliegue Vercel. El intento de navegar el servidor local mediante navegador automatizado fue bloqueado por restricciones del entorno. La validación visual y de interacción con bibliotecas reales debe realizarse en el **repositorio/proyecto de prueba** antes de reemplazar el sitio enviado al profesor.

## Advertencias de fuente

- La fecha de descarga de las copias originales no se encuentra documentada: **no inventarla**.
- Las fichas del catálogo publicadas/indexadas pueden haber cambiado. Se debe revisar su vigencia al preparar la entrega.
- El EPSG del WKT original se adoptó como hipótesis operacional **no certificada**.
- La población por unidad y la proximidad de centroides son aproximaciones metodológicas explícitas, no conteos observados de personas por barrio ni acceso peatonal efectivo.
