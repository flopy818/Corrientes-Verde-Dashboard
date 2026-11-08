# Cómo leer Corrientes Verde — Guía para visitantes

**Corrientes Verde: Grupo 2** es un proyecto académico independiente de **Fernández Florencia y Ríos Oscar**. Se concentra en la **ciudad de Corrientes**, no en toda la provincia.

## ¿Para qué sirve?

Para explorar en un solo sitio los espacios verdes que figuran en una copia del inventario municipal: su nombre (cuando existe), ubicación, clasificación y superficie. Los mapas y gráficos también permiten agrupar y comparar esa información por unidades territoriales. Cada resultado tiene una fuente y un procedimiento de cálculo documentado.

## Por dónde empezar

1. **Panorama:** muestra las cantidades del archivo. No representan necesariamente todos los espacios que existen actualmente.
2. **Mapa interactivo:** buscá un lugar, hacé clic en un polígono y leé su ficha. Podés filtrar por tipo o por unidad territorial declarada.
3. **Territorio y población:** compará cuántos espacios se asignan o cruzan con cada unidad. Los valores de población son estimaciones históricas, no un padrón actual.
4. **Tipologías y superficies:** observá cuántas plazas, plazoletas u otros tipos hay y cuánto varían sus tamaños.
5. **Reciclaje histórico:** consultá registros de recolección de años anteriores; no equivalen a actividad actual.
6. **Fuentes y metodología:** revisá los enlaces al portal de la Municipalidad, las fechas y los métodos de cálculo.

## Algunas palabras que vas a encontrar

- **Registro:** una fila del archivo municipal que representa un espacio.
- **Polígono:** figura dibujada en el mapa que delimita una superficie.
- **Unidad territorial:** área que el archivo municipal clasifica como barrio u otra categoría.
- **Asignado:** el archivo municipal declara que el espacio corresponde a esa unidad.
- **Intersectado:** las formas del espacio y la unidad se superponen al dibujarlas en el mapa. Un registro puede cruzar límites entre unidades.
- **m² y hectárea (ha):** unidades para medir superficie. **1 ha = 10.000 m²**.
- **Mediana:** el valor del centro después de ordenar tamaños de menor a mayor.
- **Valor atípico:** tamaño inusual dentro del conjunto comparado. No significa que sea un error.
- **Centroide:** punto que representa el centro geométrico de un polígono.

## ¿Por qué se puede quitar Santa Catalina del gráfico?

Porque la **Reserva Natural Municipal Santa Catalina** representa una gran parte de la superficie sumada del archivo. Excluir **solo su registro (número municipal 4000)** permite observar mejor las superficies de las demás categorías. No se borra ningún dato: se cambia la vista del gráfico. Como el archivo no declara barrio para ese registro, la reserva aparece identificada por su nombre, separada de otros espacios sin barrio declarado.

## ¿De cuándo son los datos?

Los datasets tienen diferentes fechas de actualización publicadas en el portal municipal. Esas fechas y los enlaces originales aparecen en [FUENTES.md](FUENTES.md) y dentro del dashboard. Los CSV analizados son copias guardadas en este proyecto; los resultados no se actualizan automáticamente cuando cambia el portal.

## Qué NO responde este dashboard

No muestra en tiempo real el estado de mantenimiento, la seguridad, el uso efectivo, la vegetación existente ni el acceso peatonal comprobado a cada espacio. Tampoco determina dónde debería invertir la Municipalidad. Presenta **datos procesados y comparaciones descriptivas**, sin suposiciones sobre causas o necesidades.
