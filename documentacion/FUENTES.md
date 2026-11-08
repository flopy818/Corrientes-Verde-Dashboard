# Fuentes oficiales y vigencia de los datos

**Ámbito del proyecto:** Ciudad de Corrientes (Corrientes Capital), provincia de Corrientes.  
**Autoría del análisis:** Grupo 2, Fernández Florencia y Ríos Oscar.  
**Fecha de verificación de fichas mediante búsqueda del catálogo:** 7 de noviembre de 2026. El acceso directo al portal devolvió errores de red en algunas consultas, por lo que la fecha visible en un **resultado indexado no certifica la versión publicada en vivo** en el momento de la presentación.

## Archivos principales (utilizados en la auditoría territorial)

| Archivo local | Fuente oficial | Última actualización visible en fichas/indexación consultada | Descarga de la copia incluida | Observaciones |
|---|---|---|---|---|
| `datos_originales/espacios_verdes.csv` | [Espacios verdes](https://datos.ciudaddecorrientes.gov.ar/dataset/espacios-verdes) | **01/10/2025** en resultado indexado; **pendiente de revalidación en vivo** | **No documentada** | La cadena `202510011132` del nombre del archivo original no es evidencia de fecha de descarga; se conservan 293 filas. |
| `datos_originales/barrios.csv` | [Conjunto Barrios](https://datos.ciudaddecorrientes.gov.ar/dataset/barrios) · [recurso Barrios](https://datos.ciudaddecorrientes.gov.ar/dataset/barrios/archivo/a3b229c5-08d8-4ca4-908e-d72b63eb295f) | Conjunto **26/03/2026**; recurso Barrios **01/10/2025** según fichas indexadas | **No documentada** | El conjunto incluye otras categorías territoriales; los dos niveles de fecha son distintos. |
| `datos_originales/densidad_poblacional.csv` | [Densidad poblacional (recurso del conjunto Barrios)](https://datos.ciudaddecorrientes.gov.ar/dataset/barrios/archivo/fe281850-2a92-4e61-81cd-4db3bb9598f5) | Recurso **01/10/2025** según ficha indexada | **No documentada** | Población censal histórica: verificar año exacto con documentación primaria antes de presentarlo como valor vigente. |

**No se debe publicar «actualizado a noviembre de 2026» para estas copias sin comprobar que el recurso municipal y la copia coinciden.** Las fechas de las fichas pueden cambiar independientemente del contenido descargado.

## Archivos complementarios heredados de la versión V2

| Archivo local | Fuente oficial | Actualización de catálogo visible en búsqueda (revalidar en vivo) | Descarga de copia |
|---|---|---|---|
| `datos_originales/recoleccion_puntos_verdes.csv` | [Recolección en puntos verdes](https://datos.ciudaddecorrientes.gov.ar/dataset/recoleccion-en-puntos-verdes) | 28/08/2024 | No documentada |
| `datos_originales/reciclando_juntos_ruleros.csv` | [Programa Reciclando Juntos](https://datos.ciudaddecorrientes.gov.ar/dataset/reciclando_juntos_ruleros) | Pendiente de verificación directa | No documentada |
| `datos_originales/localizacion_puntos_verdes.csv` | [Puntos verdes](https://datos.ciudaddecorrientes.gov.ar/dataset/puntos_verdes_contenedores) | 28/09/2026 en la ficha indexada | No documentada |

Las **fechas de observación dentro de los registros** de reciclaje son anteriores a las actualizaciones del catálogo. Tampoco son equivalentes a la fecha de publicación del dashboard.

## Pruebas conservadas en el repositorio

`datos_derivados/registro_fuentes_sha256.json` registra los hashes SHA-256 y el tamaño en bytes de las seis copias CSV utilizadas. El hash permite comprobar que se reproduce el cálculo con los mismos archivos, **no demuestra que sean la versión más nueva del portal**.

## Comprobación antes de la presentación

1. Abrir cada enlace municipal y anotar fecha de publicación/actualización visible, URL del recurso y su nombre exacto.
2. Comparar la versión disponible para descargar con la copia incluida, sin reemplazar el archivo histórico sin registro de cambio.
3. Si hay datos nuevos, crear una versión nueva, regenerar las salidas y revisar todos los indicadores.
4. Registrar las fechas reales de consulta y descarga, sin inventarlas retroactivamente.
