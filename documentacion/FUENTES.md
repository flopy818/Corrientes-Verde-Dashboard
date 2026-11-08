# Fuentes, procedencia y fecha de actualización

**Proyecto:** Corrientes Verde: Grupo 2 — Fernández Florencia y Ríos Oscar.  
**Territorio:** ciudad de Corrientes, Corrientes Capital.  
**Organismo que publica los datasets:** Municipalidad de la Ciudad de Corrientes, Portal de Datos Abiertos.

## Cómo leer las fechas

- **Última actualización en el portal:** fecha publicada en la ficha del recurso, **consultada e informada por los autores**. No representa necesariamente el día de las observaciones individuales del archivo ni constituye una comprobación automática realizada hoy.
- **Copia incorporada al proyecto:** las copias de trabajo se integraron en este proyecto el **06/11/2026**. No es una certificación del instante exacto de la descarga original.
- **Período de registros:** intervalo temporal representado por las filas del archivo, si dispone de fechas verificables.
- **Publicación del dashboard:** puede cambiar al desplegar código nuevo sin que cambien los datos municipales.

## Archivos utilizados y referencias oficiales

| Conjunto | Papel | Última actualización en el portal | Archivo usado | Acceso oficial |
|---|---|---|---|---|
| Espacios verdes | **Principal** | **03/11/2026** | `datos_originales/espacios_verdes.csv` | [Ficha municipal](https://datos.ciudaddecorrientes.gov.ar/dataset/espacios-verdes) |
| Barrios | Complementario geográfico | **01/10/2025** | `datos_originales/barrios.csv` | [Ficha municipal](https://datos.ciudaddecorrientes.gov.ar/dataset/barrios) |
| Densidad poblacional | Complementario censal | **01/10/2025** | `datos_originales/densidad_poblacional.csv` | [Recurso municipal](https://datos.ciudaddecorrientes.gov.ar/dataset/barrios/archivo/fe281850-2a92-4e61-81cd-4db3bb9598f5) |
| Recolección en puntos verdes | Complementario histórico | **28/08/2024** | `datos_originales/recoleccion_puntos_verdes.csv` | [Ficha municipal](https://datos.ciudaddecorrientes.gov.ar/dataset/recoleccion-en-puntos-verdes) |
| Reciclando Juntos / Ruleros | Complementario histórico | **28/09/2026** | `datos_originales/reciclando_juntos_ruleros.csv` | [Ficha municipal](https://datos.ciudaddecorrientes.gov.ar/dataset/reciclando_juntos_ruleros) |
| Localización de puntos verdes | Complementario cartográfico | **03/11/2026** | `datos_originales/localizacion_puntos_verdes.csv` | [Ficha municipal](https://datos.ciudaddecorrientes.gov.ar/dataset/puntos_verdes_contenedores) |

Las fechas corresponden a la consulta del portal comunicada por el Grupo 2. Los seis archivos **no se descargan ni se actualizan automáticamente cuando alguien abre la página**.

## Qué período contienen las copias

- **Espacios verdes y barrios:** sus geometrías no constituyen una serie histórica; la fecha de actualización del portal **no** debe presentarse como fecha de creación de todos los registros.
- **Densidad poblacional:** fuente censal histórica; el año exacto de referencia no está acreditado por el archivo y sus metadatos conservados. La población por unidad se presenta como **estimación**, no como dato censal oficial por barrio.
- **Recolección en puntos verdes:** la copia contiene observaciones históricas entre **17/01/2019 y 13/09/2020**.
- **Reciclando Juntos:** las fechas son históricas y existe al menos un valor de fecha inválido en la copia; el procesamiento no debe convertirlo en una fecha imaginada.
- **Localización de puntos verdes:** es una lista de ubicaciones, no un registro de actividad o vigencia en el presente.

## Integridad de las copias y reproducción

Las copias originales se conservan **sin modificaciones** en `datos_originales/`. La identidad de las copias usadas se documenta con sumas SHA-256 en [`datos_derivados/registro_fuentes_sha256.json`](../datos_derivados/registro_fuentes_sha256.json). Los scripts y las instrucciones para regenerar los indicadores figuran en [`README.md`](../README.md) y [`METODOLOGIA.md`](../METODOLOGIA.md).

La fecha **06/11/2026** se usa como incorporación de la copia al proyecto, **no** como fecha demostrada de descarga original del portal. Si un recurso oficial se actualiza después, esa publicación **no modifica automáticamente** los resultados aquí mostrados.

## Reserva Natural Municipal Santa Catalina

Se identifica por el **registro municipal 4000**. El campo `nombre_barrio` del registro de la reserva está vacío; para no confundirla con otras observaciones que tampoco declaran barrio, en la visualización **se muestra por su nombre propio**, separada de los registros pertenecientes al barrio Santa Catalina y de otros sin barrio declarado. Esta solución de presentación no implica una asignación territorial nueva.

## Datos deliberadamente fuera del alcance

**Arbolado urbano** es un dataset desarrollado por otro grupo. **RENABAP** fue compartido como referencia, pero no se analiza ni se incluye en los indicadores de este proyecto, cuyo eje principal es Espacios Verdes.
