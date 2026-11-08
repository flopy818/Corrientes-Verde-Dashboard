# Corrientes Verde: Grupo 2

**Atlas interactivo de espacios verdes de Corrientes Capital.**  
**Autores:** Fernández Florencia y Ríos Oscar.  
**Carácter:** proyecto académico independiente, no oficial.  
**Ámbito:** ciudad de Corrientes, provincia de Corrientes, Argentina. El proyecto **no** analiza la totalidad de la provincia.

**Sitio público:** [Corrientes Verde](https://corrientesverdedashboard.vercel.app/)  
**Repositorio oficial del proyecto:** [flopy818/Corrientes-Verde-Dashboard](https://github.com/flopy818/Corrientes-Verde-Dashboard)  
**Fuente principal:** [Espacios Verdes — Portal de Datos Abiertos de la Municipalidad de la Ciudad de Corrientes](https://datos.ciudaddecorrientes.gov.ar/dataset/espacios-verdes).

## ¿Para qué sirve este proyecto?

Corrientes Verde organiza y visualiza información del **inventario municipal de espacios verdes** de Corrientes Capital. Permite que cualquier visitante consulte **qué espacios figuran registrados, dónde se encuentran, cómo están clasificados y qué superficie representa cada uno**, y compare los resultados por unidades territoriales.

El trabajo aplica análisis **descriptivo, estadístico y geoespacial** sobre archivos municipales y fuentes complementarias. Sus resultados facilitan la consulta de información pública sin atribuir causas, establecer prioridades de inversión ni formular recomendaciones de políticas públicas. **El rol del Grupo 2 es preparar, analizar, documentar y comunicar datos, no decidir intervenciones municipales.**

La información describe **las copias de datos utilizadas**: no constituye un inventario completo y actualizado en tiempo real ni representa una herramienta oficial de la Municipalidad.

## Contenido del dashboard

| Sección | ¿Qué permite consultar? |
|---|---|
| **Panorama** | Cantidad de espacios, clasificaciones, superficies y cobertura de los polígonos territoriales analizados. |
| **Mapa interactivo** | Localización de espacios, búsqueda por nombre, ubicación o identificador, filtros por categoría y territorio, y fichas individuales. |
| **Territorio y población** | Cantidades asignadas e intersectadas, superficie por unidad territorial, población estimada, comparación entre dos unidades, exportación CSV y cálculo geométrico por centroides a 300/500 metros. |
| **Tipologías y superficies** | Composición del inventario, superficies por tipo, estadísticos descriptivos, diagramas de caja y concentración de superficie con/sin la Reserva Natural Municipal Santa Catalina. |
| **Reciclaje histórico** | Módulo **complementario** con registros históricos de recolección por puntos, eventos, modalidades y meses. No refleja la situación actual ni se suma entre fuentes incompatibles. |
| **Fuentes, calidad y metodología** | Origen, fechas informadas por el portal, copia utilizada, procedimientos de cálculo, controles de calidad y enlaces a los recursos oficiales. |

En la interfaz, las explicaciones para visitantes se muestran junto a los gráficos; las precisiones técnicas y las fórmulas se conservan en la documentación y los controles desplegables.

## Fuentes de datos y fechas

La columna siguiente informa la **última actualización publicada en el portal**, según la consulta comunicada por los autores. **No** equivale a la última fecha de cada registro ni a una descarga automática realizada por este proyecto.

| Datos | Última actualización en el portal | Enlace oficial |
|---|---|---|
| **Espacios verdes (principal)** | **03/11/2026** | [Fuente municipal](https://datos.ciudaddecorrientes.gov.ar/dataset/espacios-verdes) |
| Barrios y delimitaciones | 01/10/2025 | [Fuente municipal](https://datos.ciudaddecorrientes.gov.ar/dataset/barrios) |
| Densidad poblacional | 01/10/2025 | [Recurso municipal](https://datos.ciudaddecorrientes.gov.ar/dataset/barrios/archivo/fe281850-2a92-4e61-81cd-4db3bb9598f5) |
| Recolección en puntos verdes | 28/08/2024 | [Fuente municipal](https://datos.ciudaddecorrientes.gov.ar/dataset/recoleccion-en-puntos-verdes) |
| Reciclando Juntos / Ruleros | 28/09/2026 | [Fuente municipal](https://datos.ciudaddecorrientes.gov.ar/dataset/reciclando_juntos_ruleros) |
| Localización de puntos verdes | 03/11/2026 | [Fuente municipal](https://datos.ciudaddecorrientes.gov.ar/dataset/puntos_verdes_contenedores) |

Las copias de trabajo fueron **incorporadas al proyecto el 06/11/2026**. Esta fecha **no documenta necesariamente el instante exacto de descarga del archivo original**. El sitio utiliza esas copias: si la fuente municipal cambia, el contenido del dashboard **no se actualiza automáticamente**.

Detalles de archivos, períodos y referencias: [FUENTES.md](documentacion/FUENTES.md). Para preservar identidad de cada copia, se calculan hashes SHA-256 en [`registro_fuentes_sha256.json`](datos_derivados/registro_fuentes_sha256.json).

## Resultados descriptivos principales de las copias utilizadas

- **293** espacios con identificadores únicos en el archivo principal.
- **8** clasificaciones municipales.
- **3.976.749,16 m²**: suma de superficies geométricas de los registros; puede incluir sectores superpuestos y **no** equivale a superficie de vegetación.
- **140** polígonos territoriales, correspondientes a **138** identificadores distintos.
- **67** polígonos sin superposición de área con espacios del inventario analizado, según el criterio documentado; al agrupar por identificador, son **65** unidades sin intersección.
- **Reserva Natural Municipal Santa Catalina:** registro municipal **4000**, aproximadamente **277,17 ha** y **69,7 %** de la suma total del inventario.
- **45,70 %**: suma de superficies asignadas a las cinco denominaciones con mayor valor **excluyendo la reserva**, conforme al campo de barrio declarado en el CSV y la fórmula reproducible.

Son resultados obtenidos con **las copias incorporadas**, no afirmaciones sobre la situación actual ni evaluación de la calidad de los espacios.

### La reserva Santa Catalina: por qué se puede incluir o excluir

La Reserva Natural Municipal Santa Catalina es un espacio de tamaño excepcional dentro de la copia. Un control permite **ver cómo cambia el gráfico si se excluye únicamente ese registro (número municipal 4000)**. En el archivo original, el campo de barrio de la reserva está vacío. Por eso, al incluirla en el gráfico de concentración, aparece con **su propio nombre**, separada tanto de otros registros sin barrio declarado como de los espacios asignados al barrio Santa Catalina. La vista **no supone una asignación territorial que el archivo no contiene**.

## Estructura del repositorio

```text
Corrientes-Verde-Dashboard/
├── index.html                         # Interfaz principal
├── styles.css                         # Estética, disposición y adaptación a pantallas
├── script.js                          # Mapa, filtros, tablas, gráficos y consultas
├── reciclaje.js                       # Gráficos y capa de reciclaje histórico
├── reciclaje.json                     # Datos procesados de reciclaje
├── procesar_reciclaje.py              # Reproduce los cálculos de reciclaje
├── datos_originales/                 # CSV utilizados, sin alterar
├── datos_derivados/                  # Indicadores, tablas, auditorías, GeoJSON
├── procesamiento/
│   ├── requirements.txt
│   ├── procesar_territorio.py         # Limpieza, áreas, intersecciones y auditoría
│   ├── preparar_dashboard.py          # Estadística y datos de consumo de la web
│   └── validar_resultados.py          # Controles automáticos de integridad
├── documentacion/
│   ├── FUENTES.md                      # URLs, fechas y trazabilidad
│   ├── DICCIONARIO_DATOS.md           # Descripción de campos originales y derivados
│   ├── GUIA_DE_LECTURA.md             # Guía breve para público general
│   ├── INFORME_AUDITORIA.md           # Resultados y advertencias
│   ├── REGISTRO_PRUEBAS.md            # Controles y alcance de las pruebas
│   └── fuentes_metadatos.json         # Registro legible por máquina de las fuentes
├── METODOLOGIA.md                     # Criterios técnicos detallados
└── README.md                          # Este documento
```

## Reproducir el análisis

Se necesita **Python 3.10 o superior** y las dependencias de [`procesamiento/requirements.txt`](procesamiento/requirements.txt). Desde la carpeta raíz:

```bash
python -m pip install -r procesamiento/requirements.txt
python procesamiento/procesar_territorio.py
python procesamiento/preparar_dashboard.py
python procesar_reciclaje.py
python procesamiento/validar_resultados.py
```

Los resultados generados se guardan en `datos_derivados/` y `reciclaje.json`. El último script revisa totales y consistencia para las **copias concretas incluidas** en este repositorio. Las pruebas de regresión no sustituyen la validación cartográfica ni de metadatos de origen.

Para ejecutar la página de forma local:

```bash
python -m http.server 8000
```

Abrir `http://localhost:8000` en el navegador. No se recomienda abrir `index.html` por doble clic, ya que el esquema `file://` puede bloquear la lectura de JSON y GeoJSON.

## Publicación

El proyecto es una **web estática**: `index.html`, `styles.css`, JavaScript y archivos JSON/GeoJSON. Puede desplegarse en Vercel utilizando la **raíz del repositorio (`./`)** y el preset **Other**, sin proceso de compilación. Los procesadores Python se ejecutan **antes** de publicar, para preparar los resultados.

Repositorio público: [https://github.com/flopy818/Corrientes-Verde-Dashboard](https://github.com/flopy818/Corrientes-Verde-Dashboard). Actualizar el contenido de este repositorio permite conservar su historial; si el proyecto Vercel original continúa conectado a su rama de publicación, el mismo dominio sirve los cambios desplegados.

## Alcance, límites y autoría

- **Sistema de referencia geográfica:** el procesamiento usa **EPSG:22185** como hipótesis operativa; el CSV no trae una declaración explícita del CRS y sigue pendiente su certificación con la fuente. No se presenta como dato confirmado por la Municipalidad.
- **Población:** las cifras por unidad son estimaciones calculadas mediante reparto areal de radios censales de un conjunto histórico, no recuentos oficiales por barrio; el año censal exacto no está acreditado por los metadatos que conservamos.
- **Proximidad a 300/500 m:** mide distancia directa entre el centro geométrico de un radio censal y un espacio registrado. No permite afirmar que cada habitante esté a esa distancia, ni representa acceso peatonal real.
- **Inventario:** incluye distintas categorías (plazas, paseos, espacios deportivos, etc.). La suma de áreas registradas no equivale automáticamente a vegetación, disponibilidad, accesibilidad ni calidad de los espacios.
- **Reciclaje:** análisis histórico complementario. Los conjuntos no se suman sin acreditar que sus observaciones sean independientes.
- **Fuentes:** el portal puede actualizarse después de la fecha registrada; **la web no sincroniza datos en tiempo real**.

**Grupo 2 — Fernández Florencia y Ríos Oscar.** Trabajo académico independiente elaborado a partir de datos abiertos oficiales. Los cálculos y las visualizaciones son producción del grupo y no se atribuyen a la Municipalidad como resultados oficiales.
