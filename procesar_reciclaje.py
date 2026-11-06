"""Regenera reciclaje.json desde datos_originales/. Requiere pandas. Ejecutar: python procesar_reciclaje.py"""
import pandas as pd, json, unicodedata
from pathlib import Path
base=Path(__file__).resolve().parent
p=pd.read_csv(base/'datos_originales/recoleccion_puntos_verdes.csv')
r=pd.read_csv(base/'datos_originales/reciclando_juntos_ruleros.csv')
l=pd.read_csv(base/'datos_originales/localizacion_puntos_verdes.csv')
p['kg']=pd.to_numeric(p.kg_residuos_secos_reciclables.str.replace(',','.',regex=False),errors='coerce')
p['dt']=pd.to_datetime(p.fecha,format='%Y/%m/%d',errors='coerce')
r['dt']=pd.to_datetime(r.fecha,format='%Y/%m/%d',errors='coerce')
def key(s):return ''.join(c for c in unicodedata.normalize('NFD',str(s).lower()) if unicodedata.category(c)!='Mn').replace(' ','')
groups=[{'name':'Eventos' if k=='Evento' else 'Sin identificar' if pd.isna(k) else str(k),'kg':round(float(v.kg.sum()),3),'records':len(v)} for k,v in p.groupby('punto_verde',dropna=False)]
months=[]
for month in pd.period_range(p.dt.min().to_period('M'),p.dt.max().to_period('M'),freq='M'):
 subset=p[p.dt.dt.to_period('M')==month];months.append({'month':str(month),'kg':round(float(subset.kg.sum()),3) if len(subset) else None,'records':len(subset)})
points=[]
for _,row in l.iterrows():
 name=str(row['Puntos Verdes']).strip();subset=p[p.punto_verde.fillna('').map(key)==key(name)]
 if name=='Parque Camba Cuá':subset=p[p.punto_verde=='Parque Camba Cua']
 points.append({'name':name,'address':None if pd.isna(row.Calles) else str(row.Calles),'lat':float(row.Lat),'lon':float(row.Long),'historicalKg':round(float(subset.kg.sum()),3) if len(subset) else None,'historicalRecords':len(subset) if len(subset) else None})
total=float(p.kg.sum());event=float(p.loc[p.punto_verde=='Evento','kg'].sum())
data={'meta':{'sources':{'puntos':'https://datos.ciudaddecorrientes.gov.ar/dataset/recoleccion-en-puntos-verdes','ruleros':'https://datos.ciudaddecorrientes.gov.ar/dataset/reciclando_juntos_ruleros','localizacion':'https://datos.ciudaddecorrientes.gov.ar/dataset/puntos_verdes_contenedores'},'note':'Histórico del CSV entregado; no describe recolección actual ni toda la ciudad.'},'puntos':{'totalKg':round(total,3),'eventKg':round(event,3),'eventShare':round(event/total*100,3),'records':len(p),'groups':groups,'monthly':months,'period':{'from':str(p.dt.min().date()),'to':str(p.dt.max().date())}},'ruleros':{'totalKg':round(float(r.kg_residuos_secos_reciclables.sum()),5),'records':len(r),'modes':[{'name':str(k),'kg':round(float(v.kg_residuos_secos_reciclables.sum()),5),'records':len(v)} for k,v in r.groupby('recoleccion_tipo')],'invalidDates':r.loc[r.dt.isna(),'fecha'].tolist(),'missingHouseholds':int(r.cantidad_domicilios.isna().sum())},'locations':points}
(base/'reciclaje.json').write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding='utf-8')
print('Generado reciclaje.json:',len(p),'registros de puntos verdes;',len(r),'de Reciclando Juntos')
