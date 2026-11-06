/* Módulo de reciclaje: datos históricos separados de espacios verdes. */
'use strict';
(async function(){
 const $=id=>document.getElementById(id);
 const nf=new Intl.NumberFormat('es-AR',{maximumFractionDigits:1});
 const fmt=x=>nf.format(x);
 try {
 const response=await fetch('reciclaje.json');if(!response.ok)throw Error('HTTP '+response.status);const data=await response.json();
 $('recTotal').textContent=fmt(data.puntos.totalKg);$('recEventos').textContent=fmt(data.puntos.eventShare)+' %';$('recRuleros').textContent=fmt(data.ruleros.totalKg);$('recPuntos').textContent=String(data.locations.length);
 if(window.Chart){
 const green=['#245d42','#53926b','#91c1a1','#c0d5b5','#dfebcf','#c78b67'];
 const bar=(id,labels,values,horizontal=false)=>new Chart($(id),{type:'bar',data:{labels,datasets:[{data:values,backgroundColor:green,borderRadius:5}]},options:{responsive:true,maintainAspectRatio:false,indexAxis:horizontal?'y':'x',plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>fmt(horizontal?c.parsed.x:c.parsed.y)+' kg'}}},scales:{x:{grid:{color:'#edf1eb'}},y:{beginAtZero:!horizontal,grid:{color:'#edf1eb'}}}}});
 bar('recGroupsChart',data.puntos.groups.map(x=>x.name),data.puntos.groups.map(x=>x.kg),true);
 bar('recModesChart',data.ruleros.modes.map(x=>x.name),data.ruleros.modes.map(x=>x.kg),false);
 new Chart($('recMonthlyChart'),{type:'line',data:{labels:data.puntos.monthly.map(x=>x.month),datasets:[{label:'Kg registrados',data:data.puntos.monthly.map(x=>x.kg),spanGaps:false,borderColor:'#286a49',backgroundColor:'#a9d5b0',pointRadius:3,tension:.15}]},options:{maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>fmt(c.parsed.y)+' kg'}}},scales:{y:{beginAtZero:true,title:{display:true,text:'Kilogramos'}},x:{ticks:{maxRotation:50,minRotation:45,autoSkip:true}}}}});
 }
 const toggle=$('recycleMapToggle'),status=$('recycleMapStatus');let layer=null;
 toggle.addEventListener('change',()=>{
 if(!window.L||typeof map==='undefined'||!map){status.textContent='El mapa todavía no está disponible. Esperá unos segundos y volvé a intentarlo.';toggle.checked=false;return;}
 if(!layer){layer=L.layerGroup(data.locations.map(p=>{const marker=L.circleMarker([p.lat,p.lon],{radius:7,color:'#a26424',weight:2,fillColor:'#f3bd68',fillOpacity:.95});const safe=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));marker.bindPopup('<strong>'+safe(p.name)+'</strong><br>'+safe(p.address||'Ubicación no informada')+(p.historicalKg!==null?'<br>Histórico: '+fmt(p.historicalKg)+' kg':'<br>Sin registro histórico vinculado')+'<br><small>Listado municipal; vigencia actual no confirmada</small>');return marker;}));}
 if(toggle.checked){layer.addTo(map);status.textContent='Capa de puntos de reciclaje activada. Volvé al mapa principal para explorarla.'; }else{map.removeLayer(layer);status.textContent='Capa desactivada.';}
 });
 }catch(e){console.error('Reciclaje:',e);$('recTotal').textContent='Sin datos';$('recEventos').textContent='Sin datos';$('recRuleros').textContent='Sin datos';$('recPuntos').textContent='Sin datos';}
})();
