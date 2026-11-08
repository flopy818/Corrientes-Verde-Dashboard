/* Corrientes Verde — Grupo 2 · Fernández Florencia y Ríos Oscar.
   Presentación DESCRIPTIVA de datos derivados reproducibles de CSV municipales.
   Las geometrías originales y los controles están en procesamiento/.
*/
'use strict';
const $ = id => document.getElementById(id);
const fmt = new Intl.NumberFormat('es-AR', {maximumFractionDigits:0});
const fmt1 = new Intl.NumberFormat('es-AR', {minimumFractionDigits:1,maximumFractionDigits:1});
const fmt2 = new Intl.NumberFormat('es-AR', {minimumFractionDigits:2,maximumFractionDigits:2});
const f0 = v => v===null || v===undefined || !Number.isFinite(Number(v)) ? 'Sin dato' : fmt.format(Number(v));
const f1 = v => v===null || v===undefined || !Number.isFinite(Number(v)) ? 'Sin dato' : fmt1.format(Number(v));
const f2 = v => v===null || v===undefined || !Number.isFinite(Number(v)) ? 'Sin dato' : fmt2.format(Number(v));
const ha = v => `${f2(Number(v)/10000)} ha`;
const m2 = v => `${f0(v)} m²`;
const norm = s => String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().trim();
const esc = s => String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const present = (v,fallback='No informado') => v===null || v===undefined || String(v).trim()==='' ? fallback : String(v);
const palette = ['#245d42','#4e9470','#80ad8e','#a8caa6','#c4d99d','#89b8a4','#c7d9cf','#e6eadb'];
let spaces=[], units=[], dataset=null, map=null, spaceLayer=null, unitLayer=null;
let charts={}, selected=null;
const sourceUrl='https://datos.ciudaddecorrientes.gov.ar/dataset/espacios-verdes';

function fact(label,value){return `<div class="fact"><span>${esc(label)}</span><b>${esc(value)}</b></div>`;}
function getSP(p){return p.clasificacion_normalizada||p.clasificacion_original||'Sin clasificar';}
function getName(p){const value=p.nombre_original||'Sin denominación en CSV';return value==='S/N'?'S/N (registro sin nombre explícito)':value;}
function getUN(p){return p.nombre_unidad||'(unidad sin nombre)';}
function getFeatureID(f,kind){return kind==='space'?f.properties.gid:f.properties.id_unidad;}
function showSelection(f,kind){
 selected={f,kind};const p=f.properties;
 $('selectionTitle').textContent=kind==='space'?getName(p):getUN(p);
 if(kind==='space'){
  $('selectionDesc').textContent=`${getSP(p)} · ${present(p.ubicacion_original)}`;
  $('selectionFacts').innerHTML=[
    fact('Número del registro municipal',p.gid),fact('Clasificación original',present(p.clasificacion_original)),
    fact('Superficie geométrica',m2(p.area_m2)),fact('Barrio declarado',present(p.barrio_original)),
    fact('ID de unidad declarada',present(p.id_barrio_original)),fact('Ordenanza',present(p.ordenanza_original,'No consignada en el CSV')),
    fact('Unidades intersectadas',p.numero_unidades_intersectadas),fact('¿Es la Reserva Natural Municipal Santa Catalina?',p.es_reserva_santa_catalina?'Sí · registro municipal 4000':'No')
  ].join('');
  $('selectedMethod').textContent='La denominación y clasificación provienen del archivo municipal. El barrio declarado figura en el CSV; la intersección se calcula al superponer geometrías. Son dos datos distintos.';
 } else {
  $('selectionDesc').textContent=`${present(p.tipo_unidad)} · ID ${p.id_unidad} · ${p.cantidad_poligonos_fuente} polígono(s) fuente`;
  $('selectionFacts').innerHTML=[
    fact('Espacios asignados en CSV',f0(p.cantidad_espacios_asignados_csv)),
    fact('Espacios con intersección',f0(p.cantidad_espacios_intersectados)),
    fact('Superficie intersectada',m2(p.superficie_intersectada_m2)),
    fact('Población estimada',f0(p.poblacion_estimada_areal)),
    fact('m²/hab. (estimado)',f2(p.m2_intersectados_por_habitante_estimado)),
    fact('Sin intersección',p.sin_interseccion?'Sí':'No'),
    fact('Polígonos originales',p.cantidad_poligonos_fuente),
  ].join('');
  $('selectedMethod').textContent='La población se estima repartiendo los datos de sectores censales por superficie. No es una cifra oficial por barrio; «asignados» e «intersectados» se calculan de manera diferente.';
 }
}
function featureWithin(f){
 const p=f.properties,typ=$('typeFilter').value,territory=$('territoryFilter').value;
 return (!typ||getSP(p)===typ)&&(!territory||String(p.id_barrio_original)===territory);
}
function spaceStyle(f){const visible=featureWithin(f);return {color:visible?'#1b6042':'#97a89a',weight:visible?1.25:.3,fillColor:visible?'#3aaf6b':'#a8b9ac',fillOpacity:visible?.74:.055,opacity:visible?1:.17};}
function modeValue(p){
 const mode=$('mapMode').value;
 if(mode==='assigned')return p.cantidad_espacios_asignados_csv;
 if(mode==='intersect')return p.cantidad_espacios_intersectados;
 if(mode==='area')return p.superficie_intersectada_m2;
 if(mode==='rate')return p.m2_intersectados_por_habitante_estimado;
 return p.sin_interseccion?0:1;
}
function territoryColor(p){
 const mode=$('mapMode').value;
 if(mode==='empty')return p.sin_interseccion?'#dec6b2':'#9ac6a6';
 const v=modeValue(p);
 if(v===null || v===undefined || !Number.isFinite(Number(v)))return '#e0e2e0';
 if(Number(v)===0)return '#e9e8e2';
 const limits = mode==='rate'?[.5,1,2,4,10,25,60]:mode==='area'?[100,500,1500,5000,15000,40000,85000]:[1,2,3,5,8,12,20];
 const idx=limits.filter(t=>Number(v)>t).length;
 return ['#d9ead6','#c0dcbc','#a1cda9','#82b99c','#64a782','#458966','#24684a','#164e39'][idx];
}
function territoryStyle(f){return {color:'#5d9075',weight:.9,fillColor:territoryColor(f.properties),fillOpacity:.54};}
function mapLegend(){
 $('mapLegendMetric').textContent={assigned:'Color: espacios asignados en CSV',intersect:'Color: espacios con intersección',area:'Color: superficie intersectada (m²)',rate:'Color: m²/habitante estimados',empty:'Marrón: sin intersección; verde: con intersección'}[$('mapMode').value];
 const mode=$('mapMode').value;
 $('choroplethScale').hidden=mode==='empty';
 $('mapLegendLimits').textContent={assigned:'Rangos por cantidad: 1, 2, 3, 5, 8, 12, 20. Gris = cero.',intersect:'Rangos por cantidad: 1, 2, 3, 5, 8, 12, 20. Gris = cero.',area:'Rangos de superficie en m²: 100, 500, 1.500, 5.000, 15.000, 40.000, 85.000. Gris = cero.',rate:'Rangos en m²/habitante estimados: 0,5; 1; 2; 4; 10; 25; 60. Gris = cero o sin dato.',empty:'Marrón claro: sin intersección; verde: con intersección registrada.'}[mode];
}
function zoomFeature(f,kind){
 showSelection(f,kind);const layer=kind==='space'?spaceLayer:unitLayer;let hit=null;
 layer.eachLayer(x=>{if(x.feature===f)hit=x;});
 if(hit){const bounds=hit.getBounds();if(bounds.isValid())map.fitBounds(bounds,{padding:[30,30],maxZoom:16});if(kind==='space')hit.openPopup();}
 document.querySelector('#explorador').scrollIntoView({behavior:'smooth',block:'start'});
}
function buildMap(){
 map=L.map('map',{preferCanvas:true,zoomControl:false}).setView([-27.475,-58.825],12);
 L.control.zoom({position:'topright'}).addTo(map);
 L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{
    maxZoom:19,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
 }).addTo(map);
 unitLayer=L.geoJSON({type:'FeatureCollection',features:units},{style:territoryStyle,onEachFeature:(f,layer)=>{
    layer.on('click',()=>showSelection(f,'unit'));
    layer.bindTooltip(esc(getUN(f.properties)),{sticky:true});
 }}).addTo(map);
 spaceLayer=L.geoJSON({type:'FeatureCollection',features:spaces},{style:spaceStyle,onEachFeature:(f,layer)=>{
    const p=f.properties;
    layer.on('click',()=>showSelection(f,'space'));
    layer.bindPopup(`<b>${esc(getName(p))}</b><br>${esc(getSP(p))}<br>${esc(m2(p.area_m2))}<br><small>Registro municipal ${esc(p.gid)}</small>`);
 }}).addTo(map);
 const bounds=unitLayer.getBounds();if(bounds.isValid())map.fitBounds(bounds,{padding:[18,18]});
 mapLegend();setTimeout(()=>map.invalidateSize(),80);
}
function populateFilters(){
 const types=dataset.clasificaciones.map(x=>x.tipo);
 types.forEach(x=>{const opt=new Option(x,x);$('typeFilter').add(opt);});
 [...units].sort((a,b)=>getUN(a.properties).localeCompare(getUN(b.properties),'es')).forEach(f=>{
  const p=f.properties;const value=String(p.id_unidad);$('territoryFilter').add(new Option(`${getUN(p)} · ID ${value}`,value));
  $('compareA').add(new Option(`${getUN(p)} · ${value}`,value));
  $('compareB').add(new Option(`${getUN(p)} · ${value}`,value));
 });
 $('compareA').value=String(units[0].properties.id_unidad);
 $('compareB').value=String(units[Math.min(1,units.length-1)].properties.id_unidad);
}
function showResults(){
 const query=norm($('search').value),typ=$('typeFilter').value,territory=$('territoryFilter').value;
 const matches=[];
 if(query){units.filter(f=>[getUN(f.properties),f.properties.id_unidad].some(x=>norm(x).includes(query))).forEach(f=>matches.push({f,kind:'unit'}));}
 spaces.filter(f=>(!typ||getSP(f.properties)===typ)&&(!territory||String(f.properties.id_barrio_original)===territory)&&(!query||[
     f.properties.nombre_original,f.properties.barrio_original,f.properties.gid,f.properties.ubicacion_original,
     f.properties.ordenanza_original].some(s=>norm(s).includes(query)))).forEach(f=>matches.push({f,kind:'space'}));
 $('resultCount').textContent=`${f0(matches.length)} resultados`;
 const results=$('results');results.innerHTML='';
 if(!matches.length){results.innerHTML='<p>No hay coincidencias para la selección actual.</p>';return;}
 const frag=document.createDocumentFragment();
 for(const {f,kind} of matches){
    const p=f.properties,b=document.createElement('button');b.type='button';b.className='result-item';
    b.innerHTML=`<span><b>${esc(kind==='space'?getName(p):getUN(p))}</b><small>${kind==='space'?`${esc(getSP(p))} · Registro ${esc(p.gid)}`:`Unidad · ID ${esc(p.id_unidad)}`}</small></span><span>Ver ↗</span>`;
    b.addEventListener('click',()=>zoomFeature(f,kind));frag.appendChild(b);
 }
 results.appendChild(frag);
}
function currentTable(){
 const view=$('tableView').value,query=norm($('tableSearch').value),sort=$('tableSort').value;
 const isPol=view==='polygons';
 let rows=isPol?dataset.poligonos_territoriales.map(x=>({...x})) :units.map(f=>({...f.properties}));
 rows=rows.filter(p=>[p.nombre_unidad,p.id_unidad].some(v=>norm(v).includes(query)));
 const first=(a,b)=>a.nombre_unidad.localeCompare(b.nombre_unidad,'es')||a.id_unidad-b.id_unidad;
 rows.sort((a,b)=>{
    if(sort==='assigned'&&!isPol)return b.cantidad_espacios_asignados_csv-a.cantidad_espacios_asignados_csv||first(a,b);
    if(sort==='area')return b.superficie_intersectada_m2-a.superficie_intersectada_m2||first(a,b);
    if(sort==='empty')return Number(b.sin_interseccion)-Number(a.sin_interseccion)||first(a,b);
    if(sort==='rate'&&!isPol)return (b.m2_intersectados_por_habitante_estimado??-1)-(a.m2_intersectados_por_habitante_estimado??-1)||first(a,b);
    return first(a,b);
 });
 return {isPol,rows};
}
function renderTable(){
 const {isPol,rows}=currentTable();const body=$('barrioRows');body.innerHTML='';
 $('tableHead').innerHTML=isPol?'<tr><th>Fila / polígono</th><th>Unidad (ID)</th><th>Tipo</th><th>Superficie intersectada</th><th>Intersección</th></tr>':
 '<tr><th>Unidad (ID)</th><th>Tipo</th><th>Asignados CSV</th><th>Intersectados</th><th>Superficie intersectada</th><th>Población estimada</th><th>m²/hab. estimados</th></tr>';
 const frag=document.createDocumentFragment();
 for(const p of rows){const tr=document.createElement('tr');
    if(isPol){tr.innerHTML=`<td>${f0(p.numero_fila)}</td><td><b>${esc(p.nombre_unidad)}</b><small class="subcell">ID ${esc(p.id_unidad)}</small></td><td>${esc(p.tipo_unidad)}</td><td>${esc(m2(p.superficie_intersectada_m2))}</td><td>${p.sin_interseccion?'Sin intersección':'Con intersección'}</td>`;}
    else{tr.innerHTML=`<td><b>${esc(getUN(p))}</b><small class="subcell">ID ${esc(p.id_unidad)} · ${p.cantidad_poligonos_fuente} polígono(s)</small></td><td>${esc(p.tipo_unidad)}</td><td>${f0(p.cantidad_espacios_asignados_csv)}</td><td>${f0(p.cantidad_espacios_intersectados)}</td><td>${esc(m2(p.superficie_intersectada_m2))}</td><td>${f0(p.poblacion_estimada_areal)}</td><td>${f2(p.m2_intersectados_por_habitante_estimado)}</td>`;}
    tr.tabIndex=0;tr.title='Ir a esta unidad en el mapa';
    const action=()=>{const f=units.find(x=>x.properties.id_unidad===p.id_unidad);if(f)zoomFeature(f,'unit');};
    tr.addEventListener('click',action);tr.addEventListener('keydown',e=>{if(e.key==='Enter')action();});frag.appendChild(tr);
 }
 body.appendChild(frag);
 $('tableFoot').textContent=`${f0(rows.length)} de ${isPol?'140 polígonos originales':'138 unidades agrupadas por ID'}. Seleccioná una fila para ver su geometría en el mapa. ${isPol?'Las unidades con varios polígonos aparecen en más de una fila.':'La población y las tasas son estimaciones censales históricas.'}`;
}
function csvValue(x){const t=String(x??'');return /[;"\n\r]/.test(t)?'"'+t.replace(/"/g,'""')+'"':t;}
function exportTable(){
 const {isPol,rows}=currentTable();
 const keys=isPol?['numero_fila','id_unidad','nombre_unidad','tipo_unidad','area_poligono_m2','superficie_intersectada_m2','sin_interseccion']:
 ['id_unidad','nombre_unidad','tipo_unidad','cantidad_poligonos_fuente','cantidad_espacios_asignados_csv','cantidad_espacios_intersectados','superficie_intersectada_m2','poblacion_estimada_areal','m2_intersectados_por_habitante_estimado','sin_interseccion'];
 const lines=[keys.join(';'),...rows.map(r=>keys.map(k=>csvValue(r[k])).join(';'))];
 const blob=new Blob(['\ufeff',...lines.map(x=>x+'\r\n')],{type:'text/csv;charset=utf-8'});
 const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=isPol?'corrientes_verde_poligonos_filtrados.csv':'corrientes_verde_unidades_filtradas.csv';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function compare(){
 const a=units.find(f=>String(f.properties.id_unidad)===$('compareA').value);
 const b=units.find(f=>String(f.properties.id_unidad)===$('compareB').value);
 const target=$('compareOutput');
 if(!a||!b){target.textContent='Seleccioná dos unidades.';return;}
 target.innerHTML=[a,b].map((f,i)=>{const p=f.properties;return `<div class="compare-card"><span class="panel-kicker">${i?'SEGUNDA UNIDAD':'PRIMERA UNIDAD'}</span><h4>${esc(getUN(p))}</h4><p class="compare-id">ID ${esc(p.id_unidad)} · ${esc(p.tipo_unidad)}</p>
    ${fact('Espacios asignados',f0(p.cantidad_espacios_asignados_csv))}${fact('Espacios intersectados',f0(p.cantidad_espacios_intersectados))}${fact('Superficie intersectada',m2(p.superficie_intersectada_m2))}${fact('Población estimada',f0(p.poblacion_estimada_areal))}${fact('m²/hab. estimado',f2(p.m2_intersectados_por_habitante_estimado))}
    <button class="secondary-btn" type="button" data-unit="${p.id_unidad}">Ver en el mapa ↗</button></div>`;}).join('');
 target.querySelectorAll('[data-unit]').forEach(button=>button.addEventListener('click',()=>{
    const f=units.find(x=>String(x.properties.id_unidad)===button.dataset.unit);if(f)zoomFeature(f,'unit');
 }));
}
function proximity(){
 const dt=dataset.proximidad.umbrales[$('proximityReserve').value];
 $('proximityOutput').innerHTML=[300,500].map(threshold=>{const x=dt[String(threshold)];return `<div class="proximity-card"><span class="panel-kicker">CENTROIDES A ≤ ${threshold} METROS</span><b class="proximity-number">${f1(x.porcentaje_poblacion_archivo)} %</b><div class="proximity-bar"><i style="width:${Math.max(0,Math.min(100,x.porcentaje_poblacion_archivo))}%"></i></div><p>${f0(x.radios_n)} radios de ${f0(dataset.proximidad.total_radios)} · ${f0(x.poblacion_radiocensal)} habitantes censales acumulados</p></div>`;}).join('');
}
function barChart(id,labels,values,unit,options={}){
 if(charts[id])charts[id].destroy();
 const horizontal=options.horizontal!==false;
 charts[id]=new Chart($(id),{type:'bar',data:{labels,datasets:[{data:values,backgroundColor:labels.map((_,i)=>i===0?'#286a49':'#8cbb9b'),borderRadius:5,maxBarThickness:26}]},
 options:{maintainAspectRatio:false,indexAxis:horizontal?'y':'x',plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>`${f1(horizontal?c.parsed.x:c.parsed.y)} ${unit}`}}},
 scales:{x:{beginAtZero:horizontal,grid:{color:'#edf1eb'},ticks:{color:'#6b826e',font:{size:10}}},y:{beginAtZero:!horizontal,grid:{display:!horizontal,color:'#edf1eb'},ticks:{color:'#42624c',font:{size:10}}}}}});
}
function renderBaseCharts(){
 if(!window.Chart){$('error').hidden=false;$('error').textContent='No se pudo cargar Chart.js. El mapa y las tablas pueden funcionar, pero los gráficos requieren conexión.';return;}
 Chart.defaults.font.family='DM Sans, sans-serif';
 const sorted=(key)=>[...units].filter(f=>Number(f.properties[key])>0).sort((a,b)=>Number(b.properties[key])-Number(a.properties[key])).slice(0,10);
 let list=sorted('cantidad_espacios_asignados_csv');barChart('countChart',list.map(f=>getUN(f.properties)),list.map(f=>f.properties.cantidad_espacios_asignados_csv),'espacios');
 list=sorted('superficie_intersectada_m2');barChart('territoryAreaChart',list.map(f=>getUN(f.properties)),list.map(f=>f.properties.superficie_intersectada_m2),'m²');
 list=units.filter(f=>f.properties.poblacion_estimada_areal>=100&&Number(f.properties.m2_intersectados_por_habitante_estimado)>0).sort((a,b)=>b.properties.m2_intersectados_por_habitante_estimado-a.properties.m2_intersectados_por_habitante_estimado).slice(0,10);
 barChart('rateChart',list.map(f=>getUN(f.properties)),list.map(f=>f.properties.m2_intersectados_por_habitante_estimado),'m²/habitante');
 const classes=dataset.clasificaciones;
 charts.type=new Chart($('typeChart'),{type:'doughnut',data:{labels:classes.map(x=>x.tipo),datasets:[{data:classes.map(x=>x.cantidad),backgroundColor:palette,borderColor:'#fff',borderWidth:3,hoverOffset:5}]},
 options:{maintainAspectRatio:false,cutout:'65%',plugins:{legend:{position:'bottom',labels:{boxWidth:11,padding:12,font:{size:10}}},tooltip:{callbacks:{label:c=>`${c.label}: ${f0(c.parsed)} registros (${f1(100*c.parsed/spaces.length)} %)`}}}}});
 updateAreaChart();updateConcentration();
}
function updateAreaChart(){
 if(!window.Chart)return;
 const without=$('excludeReserve').checked;
 const typeMap=new Map(dataset.clasificaciones.map(x=>[x.tipo,0]));
 spaces.forEach(f=>{const p=f.properties;if(without&&p.gid===dataset.auditoria.superficies.reserva_gid)return;typeMap.set(getSP(p),(typeMap.get(getSP(p))??0)+p.area_m2);});
 const a=[...typeMap.entries()].sort((x,y)=>y[1]-x[1]);
 barChart('areaChart',a.map(x=>x[0]),a.map(x=>x[1]/10000),'ha',{horizontal:false});
}
function updateConcentration(){
 const without=$('concentrationReserve').checked;
 const o=dataset.concentracion[without?'sin_reserva':'con_reserva'];
 $('concentrationPct').textContent=`${f2(o.top5_pct)} %`;
 $('concentrationMethod').textContent=without
  ?`Se sumaron las superficies completas de cada espacio según el barrio declarado en el archivo municipal. Los cinco primeros reúnen ${f0(o.top5.reduce((s,x)=>s+x.area_m2,0))} m² sobre ${f0(o.total_m2)} m² del inventario sin la reserva. No se calculó por intersección de polígonos.`
  :`El cálculo incluye la Reserva Natural Santa Catalina como grupo propio, porque su registro no declara barrio. La barra «SANTA CATALINA» corresponde a otros espacios que sí declaran ese barrio. Los restantes registros sin barrio declarado forman otro grupo. Los cinco primeros reúnen ${f0(o.top5.reduce((s,x)=>s+x.area_m2,0))} m² de ${f0(o.total_m2)} m². No implica asignar la reserva a un barrio.`;
 if(window.Chart)barChart('concentrationChart',o.top5.map(x=>x.nombre),o.top5.map(x=>x.area_m2),'m²');
}
function fillStats(){
 const body=$('statsRows');body.innerHTML=dataset.clasificaciones.map(x=>`<tr><td><b>${esc(x.tipo)}</b></td><td>${f0(x.cantidad)}</td><td>${f0(x.min)}</td><td>${f0(x.q1)}</td><td>${f0(x.mediana)}</td><td>${f0(x.media)}</td><td>${f0(x.q3)}</td><td>${f0(x.max)}</td><td>${x.desvio_muestral===null?'No aplica':f0(x.desvio_muestral)}</td></tr>`).join('');
}
function renderBoxPlot(){
 const data=dataset.clasificaciones;
 const SVG='http://www.w3.org/2000/svg';
 const make=(tag,attrs={},text=null)=>{const x=document.createElementNS(SVG,tag);Object.entries(attrs).forEach(([key,value])=>x.setAttribute(key,String(value)));if(text!==null)x.textContent=text;return x;};
 const W=980,L=185,R=35,TOP=42,STEP=51,H=TOP+data.length*STEP+58;
 const all=spaces.map(f=>f.properties.area_m2).filter(v=>v>0);
 const logMin=Math.floor(Math.log10(Math.min(...all))),logMax=Math.ceil(Math.log10(Math.max(...all)));
 const x=v=>L+(Math.log10(Math.max(Number(v),1e-6))-logMin)/(logMax-logMin)*(W-L-R);
 const svg=make('svg',{viewBox:`0 0 ${W} ${H}`,role:'img','aria-label':'Distribución de áreas por clasificación, escala logarítmica'});
 svg.appendChild(make('title',{},'Diagrama de cajas por clasificación; escala logarítmica en metros cuadrados'));
 for(let power=logMin;power<=logMax;power++){
    const value=10**power,xx=x(value);svg.appendChild(make('line',{x1:xx,x2:xx,y1:TOP-18,y2:H-40,stroke:'#e3e9e2','stroke-width':1}));
    svg.appendChild(make('text',{x:xx,y:H-19,'text-anchor':'middle',fill:'#6d816e','font-size':11},f0(value)));
 }
 data.forEach((r,i)=>{
    const y=TOP+i*STEP+16;
    svg.appendChild(make('text',{x:L-13,y:y+4,'text-anchor':'end',fill:'#365d44','font-weight':600,'font-size':12},r.tipo));
    svg.appendChild(make('line',{x1:x(r.bigote_inferior),x2:x(r.bigote_superior),y1:y,y2:y,stroke:'#6d9683','stroke-width':2}));
    for(const v of [r.bigote_inferior,r.bigote_superior])svg.appendChild(make('line',{x1:x(v),x2:x(v),y1:y-8,y2:y+8,stroke:'#416e54','stroke-width':2}));
    svg.appendChild(make('rect',{x:x(r.q1),y:y-12,width:Math.max(2,x(r.q3)-x(r.q1)),height:24,rx:4,fill:'#95c1a0',stroke:'#377654','stroke-width':1.5}));
    svg.appendChild(make('line',{x1:x(r.mediana),x2:x(r.mediana),y1:y-12,y2:y+12,stroke:'#173e2e','stroke-width':3}));
    for(const val of r.atipicos_valores_m2){svg.appendChild(make('circle',{cx:x(val),cy:y,r:3,fill:'#ca9064',opacity:.85}));}
    const transparent=make('rect',{x:L,y:y-16,width:W-L-R,height:33,fill:'transparent'});
    transparent.appendChild(make('title',{},`${r.tipo}: n=${r.cantidad}; mínimo=${f0(r.min)} m²; Q1=${f0(r.q1)} m²; mediana=${f0(r.mediana)} m²; Q3=${f0(r.q3)} m²; máximo=${f0(r.max)} m²; atípicos=${r.atipicos_n}.`));svg.appendChild(transparent);
 });
 svg.appendChild(make('text',{x:(L+W-R)/2,y:H-2,'text-anchor':'middle',fill:'#456a4e','font-size':11},'Superficie en m² · escala logarítmica'));
 $('boxPlot').replaceChildren(svg);
}
function sources(){
 const src=dataset.fuentes,primary=src.find(x=>x.id==='espacios_verdes');
 const date=v=> /^\d{4}-\d{2}-\d{2}$/.test(String(v||''))?v.split('-').reverse().join('/'):null;
 const main=date(primary.fecha_actualizacion_portal);
 $('primaryDateSummary').textContent=`Espacios verdes · última actualización en el portal municipal: ${main||'sin fecha documentada'}. Copia utilizada incorporada al proyecto: ${date(primary.fecha_incorporacion_proyecto)||'sin fecha registrada'}. Fuente: Portal de Datos Abiertos de la Municipalidad de Corrientes.`;
 const titles={espacios_verdes:'Espacios verdes',barrios:'Barrios y unidades territoriales',densidad_poblacional:'Densidad poblacional',puntos_verdes_reciclaje:'Recolección en puntos verdes',reciclando_juntos:'Reciclando Juntos / Ruleros',ubicaciones_puntos_verdes:'Localización de puntos verdes'};
 $('sourceRows').innerHTML=src.map(x=>{
    const portalDate=date(x.fecha_actualizacion_portal);
    const portal=portalDate?`${esc(portalDate)}<small class="subcell">Fecha informada por el Grupo 2 desde la ficha municipal</small>`:'No informada en esta versión';
    const incorporated=date(x.fecha_incorporacion_proyecto)||'No registrada';
    const period=esc(present(x.periodo_efectivo_registros,'Sin período documentado'));
    const title=esc(titles[x.id]||x.id.replace(/_/g,' '));
    const safeLink=x.pagina_oficial?.startsWith('https://datos.ciudaddecorrientes.gov.ar/')?x.pagina_oficial:sourceUrl;
    return `<tr><td><b>${title}</b><small class="subcell">${esc(x.archivo)}</small></td><td>${esc(x.caracter)}</td><td>${portal}</td><td>${esc(incorporated)}</td><td>${period}</td><td><a href="${esc(safeLink)}" target="_blank" rel="noopener noreferrer">Abrir fuente ↗</a></td></tr>`;
 }).join('');
}
function quality(){
 const d=dataset.auditoria,q=d.calidad_espacios;
 const items=[
 ['Nombres vacíos o S/N',q.nombre_nulo+q.nombre_sn,'16 vacíos + 126 con S/N; solo en el archivo'],
 ['Ordenanzas no consignadas',q.ordenanza_nula,'Campo ordenanza vacío en el CSV'],
 ['Sin intersección territorial',d.espacios_sin_interseccion.length,`Registros municipales ${d.espacios_sin_interseccion.join(', ')}`],
 ['Geometrías inválidas',q.geometrias_invalidas,'Control geométrico del procesador'],
 ['IDs territoriales repetidos',Object.keys(d.ids_barrios_repetidos).length,'Cada uno aparece en dos polígonos; se agrupan por ID'],
 ['Cobertura censal fuera de la unión',f0(d.poblacion.fuera_de_cobertura_de_union_estimado),'Habitantes equivalentes según reparto por superficie; no personas observadas']
 ];
 $('qualityGrid').innerHTML=items.map(([name,val,description])=>`<article><span>${esc(name)}</span><b>${esc(val)}</b><small>${esc(description)}</small></article>`).join('');
}
async function getJson(path){const r=await fetch(path+"?actualizacion=20261108",{cache:"no-store"});if(!r.ok)throw Error(`No se pudo cargar ${path}: HTTP ${r.status}`);return r.json();}
async function init(){
 try{
    if(!window.L)throw Error('No se cargó Leaflet; revisá la conexión.');
    const [sp,un,dt]=await Promise.all([
        getJson('datos_derivados/espacios_auditados.geojson'),
        getJson('datos_derivados/unidades_territoriales_agrupadas.geojson'),
        getJson('datos_derivados/indicadores_dashboard.json')]);
    if(sp.features?.length!==293||un.features?.length!==138||dt.auditoria.registros.poligonos_territoriales!==140)throw Error('La versión de los indicadores no coincide con los archivos geográficos. Regenerá el procesamiento.');
    spaces=sp.features;units=un.features;dataset=dt;
    const a=dt.auditoria;
    $('kpiSpaces').textContent=f0(spaces.length);
    $('kpiTypes').textContent=f0(dt.clasificaciones.length);
    $('kpiArea').textContent=ha(a.superficies.total_inventario_m2);
    $('kpiBarrios').textContent=f0(a.registros.poligonos_territoriales);
    $('kpiUnits').textContent=f0(a.registros.unidades_territoriales_ids_unicos);
    $('kpiNoGreen').textContent=f0(a.unidades_sin_espacios.filas_de_poligonos_sin_superficie_intersectada);
    $('kpiReserve').textContent=`${f1(a.superficies.participacion_reserva_pct)} %`;
    $('reserveArea').textContent=ha(a.superficies.reserva_m2);
    $('reservePercent').textContent=`${f1(a.superficies.participacion_reserva_pct)} % de la superficie total del inventario`;
    populateFilters();buildMap();showResults();renderTable();compare();proximity();sources();quality();fillStats();renderBoxPlot();renderBaseCharts();
    $('search').addEventListener('input',showResults);
    $('typeFilter').addEventListener('change',()=>{spaceLayer.setStyle(spaceStyle);showResults();});
    $('territoryFilter').addEventListener('change',()=>{spaceLayer.setStyle(spaceStyle);showResults();});
    $('mapMode').addEventListener('change',()=>{unitLayer.setStyle(territoryStyle);mapLegend();});
    $('reset').addEventListener('click',()=>{
        for(const id of ['search','typeFilter','territoryFilter'])$(id).value='';$('mapMode').value='assigned';spaceLayer.setStyle(spaceStyle);unitLayer.setStyle(territoryStyle);mapLegend();showResults();
        const b=unitLayer.getBounds();if(b.isValid())map.fitBounds(b,{padding:[18,18]});
        $('selectionTitle').textContent='Explorá el territorio';$('selectionDesc').textContent='Seleccioná una geometría en el mapa o elegí una coincidencia.';$('selectionFacts').innerHTML='';$('selectedMethod').textContent='';
    });
    for(const id of ['tableView','tableSearch','tableSort'])$(id).addEventListener(id==='tableSearch'?'input':'change',renderTable);
    $('exportTable').addEventListener('click',exportTable);
    $('compareA').addEventListener('change',compare);$('compareB').addEventListener('change',compare);
    $('proximityReserve').addEventListener('change',proximity);
    $('excludeReserve').addEventListener('change',updateAreaChart);
    $('concentrationReserve').addEventListener('change',updateConcentration);
 }catch(err){console.error('Corrientes Verde:',err);$('error').hidden=false;$('error').textContent=`No fue posible completar la carga: ${err.message}. Ejecutá un servidor local (python -m http.server 8000) o publicá en Vercel; abrir index.html mediante file:// puede bloquear las lecturas.`;}
}
$('menuToggle').addEventListener('click',()=>{const bar=document.querySelector('.sidebar');$('menuToggle').setAttribute('aria-expanded',String(bar.classList.toggle('open')));});
document.querySelectorAll('.side-nav a').forEach(a=>a.addEventListener('click',()=>{document.querySelector('.sidebar').classList.remove('open');$('menuToggle').setAttribute('aria-expanded','false');}));
document.addEventListener('DOMContentLoaded',init);
