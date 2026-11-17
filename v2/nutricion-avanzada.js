(function(){
"use strict";
const $=id=>document.getElementById(id);
const E=x=>String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const N=id=>{const v=($(id)?.value??"").trim();if(v==="")return null;const n=Number(v.replace(",","."));return Number.isFinite(n)?n:null};
const V=id=>($(id)?.value||"").trim();
const has=id=>$(id)?.checked===true;
const number=(id,label,unit="",extra="")=>'<label>'+E(label)+' '+E(unit)+'<input id="'+id+'" type="number" step="any" min="0" '+extra+' placeholder="Sin dato"></label>';
const text=(id,label,placeholder="")=>'<label>'+E(label)+'<textarea id="'+id+'" rows="3" placeholder="'+E(placeholder)+'"></textarea></label>';
const select=(id,label,options)=>'<label>'+E(label)+'<select id="'+id+'">'+options.map(([v,t])=>'<option value="'+E(v)+'">'+E(t)+'</option>').join("")+'</select></label>';
const yesNo=[["","No documentado"],["si","Sí"],["no","No"]];
let latest=null;
const ids=["nConsulta","nObjetivo","nEmbarazo","nERC","nIC","nTCA","nDeportista","nPeso","nTalla","nHabitual","nPeriodo","nCintura","nCadera","nCuello","nGrasa","nMusculo","nMusculoReducido","nGlucosa","nHba1c","nLDL","nHDL","nTG","nCreatinina","nFG","nAcidoUrico","nTA","nFechaLab","nRecordatorio","nComidas","nRestricciones","nDigestivos","nSuplementos","nActividad","nSueno","nIngestaReducida","nInflamacion","nActividadFactor","nEcuacion","nKcal","nProteina","nGrasas","nDias","nPESProblema","nPESEtiologia","nPESEvidencia"];
function mount(){
if(!$("valoracion")||!$("especificos"))return;
const active=V("area")==="nutricion";
const regionWrap=$("region")?.parentElement;
if(regionWrap)regionWrap.style.display=active?"none":"";
const commonTitles=[["motivo","Motivo y evolución nutricional"],["antecedentes","Antecedentes, alergias y medicación"],["hallazgos","Signos vitales y hallazgos clínicos"],["estudios","Otros estudios o resultados"],["previos","Intervenciones nutricionales anteriores y respuesta"],["objetivos","Objetivos clínicos y acuerdos con el paciente"]];
for(const [id,title] of commonTitles){const l=$(id)?.closest("label");if(l&&l.firstChild)l.firstChild.textContent=active?title:({motivo:"Motivo, mecanismo y evolución",antecedentes:"Antecedentes, alergias, medicación",hallazgos:"Signos vitales y hallazgos",estudios:"Estudios complementarios",previos:"Tratamiento previo y respuesta",objetivos:"Objetivos y restricciones"}[id])}
$("especificos").style.display=active?"none":"";
if($("motor"))$("motor").style.display=active?"none":"";
let panel=$("nutriPanel");
if(!panel){panel=document.createElement("section");panel.id="nutriPanel";panel.className="panel";$("especificos").after(panel);
panel.innerHTML='<h2>Valoración nutricional clínica y deportiva</h2><p class="muted">Datos por dominios. Los campos sin registro permanecen como desconocidos. Esta interfaz es una herramienta de cálculo y apoyo profesional, no un diagnóstico automático.</p>'+
'<div class="nutri-section"><h3>01 · Contexto clínico y objetivos</h3><div class="two">'+
select("nConsulta","Tipo de consulta",[["primera","Primera valoración"],["seguimiento","Seguimiento"]])+
select("nObjetivo","Objetivo principal",[["evaluacion","Evaluación integral"],["grasa","Reducir grasa corporal"],["musculo","Mejorar masa o rendimiento muscular"],["metabolico","Control metabólico"],["recuperacion","Recuperación nutricional"],["otro","Otro"]])+
select("nEmbarazo","Embarazo o lactancia",yesNo)+select("nERC","Enfermedad renal diagnosticada",yesNo)+
select("nIC","Insuficiencia cardiaca / restricciones hídricas",yesNo)+select("nTCA","Sospecha de trastorno de conducta alimentaria",yesNo)+
select("nDeportista","Actividad deportiva competitiva",[["","No documentado"],["si","Sí"],["no","No"]])+
'</div></div>'+
'<div class="nutri-section"><h3>02 · Antropometría y composición corporal</h3><div class="two">'+
number("nPeso","Peso actual","(kg)")+number("nTalla","Talla","(cm)")+number("nHabitual","Peso habitual o previo","(kg)")+number("nPeriodo","Intervalo desde peso previo","(meses)")+number("nCintura","Perímetro de cintura","(cm)")+number("nCadera","Perímetro de cadera","(cm)")+number("nCuello","Perímetro de cuello","(cm)")+number("nGrasa","Grasa corporal medida","(%)")+number("nMusculo","Masa muscular estimada o medida","(%)")+select("nMusculoReducido","Masa muscular reducida por método validado",yesNo)+
'</div><p class="mini muted">Registrar por separado método, equipo, fecha y comparabilidad de mediciones en hallazgos clínicos. Cintura, IMC y porcentaje graso no son intercambiables.</p></div>'+
'<div class="nutri-section"><h3>03 · Laboratorios, comorbilidades y signos</h3><div class="two">'+
number("nGlucosa","Glucosa","(mg/dL)")+number("nHba1c","HbA1c","(%)")+number("nLDL","LDL","(mg/dL)")+number("nHDL","HDL","(mg/dL)")+number("nTG","Triglicéridos","(mg/dL)")+number("nCreatinina","Creatinina","(mg/dL)")+number("nFG","TFG estimada","(mL/min/1.73m²)")+number("nAcidoUrico","Ácido úrico","(mg/dL)")+number("nTA","Presión arterial sistólica","(mmHg)")+select("nInflamacion","Enfermedad/carga inflamatoria relacionada con nutrición",yesNo)+
'<label>Fecha de laboratorio<input type="date" id="nFechaLab"></label></div><p class="mini muted">Resultados aislados, sin contexto, unidades y condiciones de medición, no establecen por sí mismos diagnóstico metabólico.</p></div>'+
'<div class="nutri-section"><h3>04 · Historia alimentaria y funcional</h3>'+
text("nRecordatorio","Recordatorio de 24 horas","Horario, alimentos, porciones y bebidas")+
'<div class="two">'+number("nComidas","Comidas diarias","")+select("nIngestaReducida","Ingesta reducida o mala asimilación",yesNo)+
text("nRestricciones","Preferencias, restricciones y acceso a alimentos","Alergias, intolerancias, preferencias, recursos")+
text("nDigestivos","Síntomas digestivos, deglución o absorción","Diarrea, náusea, estreñimiento, disfagia")+
text("nSuplementos","Suplementos, tratamiento dietético y medicación relevante")+
text("nActividad","Actividad física y volumen de entrenamiento")+
text("nSueno","Sueño, horarios y circunstancias")+'</div></div>'+
'<div class="nutri-section"><h3>05 · Formulación de problemas nutricionales (PES)</h3><p class="mini muted">Documenta el problema, su etiología probable y los signos observados. El sistema no deduce causas a partir del IMC.</p>'+select("nPESProblema","Problema nutricional en evaluación",[["","Sin seleccionar"],["Ingesta energética inadecuada","Ingesta energética inadecuada"],["Ingesta energética excesiva","Ingesta energética excesiva"],["Ingesta proteica inadecuada","Ingesta proteica inadecuada"],["Conocimientos alimentarios insuficientes","Conocimientos alimentarios insuficientes"],["Alteración de valores de laboratorio relacionados con nutrición","Alteración de valores de laboratorio relacionados con nutrición"],["Otro problema por definir","Otro problema por definir"]])+text("nPESEtiologia","Etiología o factores contribuyentes documentados","Ej. horarios de comida irregulares")+text("nPESEvidencia","Signos y síntomas que sostienen el problema","Ej. recordatorio de ingesta y evolución ponderal")+'</div>'+
'<div class="nutri-section"><h3>06 · Estimación energética y distribución de macronutrientes</h3><div class="two">'+
select("nEcuacion","Parámetro para ecuación Mifflin–St Jeor",[["","Elegir explícitamente o no calcular"],["masculino","Coeficiente masculino"],["femenino","Coeficiente femenino"]])+
select("nActividadFactor","Factor de actividad estimado",[["","No seleccionado"],["1.2","1.20 · Actividad muy baja"],["1.375","1.375 · Actividad ligera"],["1.55","1.55 · Actividad moderada"],["1.725","1.725 · Actividad alta"]])+
number("nKcal","Objetivo energético propuesto","(kcal/día)")+number("nProteina","Proteína objetivo propuesta","(g/kg/día)")+number("nGrasas","Proporción propuesta de grasa","(% de energía)")+number("nDias","Plazo de seguimiento","(semanas)")+
'</div><div id="nCalculos" class="measure" aria-live="polite">Completa peso, talla y edad para ver estimaciones.</div><div class="warn mini">Las ecuaciones son estimaciones para adultos, no prescripciones. En embarazo/lactancia, enfermedad renal, condiciones complejas, edades pediátricas o deportistas con baja disponibilidad energética se necesita evaluación específica. Los factores de actividad son aproximaciones.</div></div>'+
'<div class="actions"><button id="nutriAnalizar" class="primary">Analizar nutrición y orientar intervención</button><button id="nutriInforme">Generar documento nutricional</button></div><div id="nutriResultados" aria-live="polite"></div>';
panel.querySelectorAll("input,textarea,select").forEach(el=>el.addEventListener("input",()=>{latest=null;calculate();if($("nutriResultados").innerHTML)$("nutriResultados").innerHTML='<p class="warn">Datos modificados. Vuelve a ejecutar el análisis nutricional para actualizar el resultado.</p>'}));
$("nutriAnalizar").onclick=analyze;$("nutriInforme").onclick=report;
}
panel.style.display=active?"":"none";
if(active)calculate();
tool();
}
function healthyNum(id,lo,hi){const v=N(id);return v!==null&&v>=lo&&v<=hi?v:null}
function calculate(){
if(V("area")!=="nutricion")return null;
const age=healthyNum("edad",18,120),w=healthyNum("nPeso",1,450),h=healthyNum("nTalla",70,260),wc=healthyNum("nCintura",20,300),hip=healthyNum("nCadera",20,300),usual=healthyNum("nHabitual",1,450);
const bmi=w!==null&&h!==null?w/Math.pow(h/100,2):null;
const whr=wc!==null&&hip!==null?wc/hip:null;
const loss=w!==null&&usual!==null&&usual>0?(usual-w)/usual*100:null;
let bmr=null,tdee=null,limitation="";
const pregnancy=V("nEmbarazo")==="si",renal=V("nERC")==="si",heart=V("nIC")==="si";
const factor=N("nActividadFactor"),coef=V("nEcuacion");
if(age!==null&&w!==null&&h!==null&&coef&&!pregnancy){bmr=10*w+6.25*h-5*age+(coef==="masculino"?5:-161);if(factor!==null)tdee=bmr*factor}
else limitation="No se calcula Mifflin–St Jeor sin edad adulta, peso, talla, coeficiente elegido y confirmación de que no hay embarazo/lactancia.";
const kcal=healthyNum("nKcal",250,10000),prot=healthyNum("nProteina",0.1,6),fat=healthyNum("nGrasas",5,80);
const proteinG=w!==null&&prot!==null?w*prot:null;
const fatG=kcal!==null&&fat!==null?kcal*fat/100/9:null;
const carbG=kcal!==null&&proteinG!==null&&fatG!==null?(kcal-proteinG*4-fatG*9)/4:null;
const macroValid=carbG===null||carbG>=0;
const fmt=(x,d=1)=>x===null?"Pendiente":x.toFixed(d);
if($("nCalculos"))$("nCalculos").innerHTML='<div class="two">'+
'<p><b>IMC:</b> '+fmt(bmi)+' kg/m²</p><p><b>Cintura/cadera:</b> '+fmt(whr,2)+'</p>'+
'<p><b>Variación respecto a peso previo:</b> '+(loss===null?"Pendiente":fmt(loss)+" % de pérdida (valor negativo = ganancia)")+'</p>'+
'<p><b>Gasto en reposo (Mifflin–St Jeor):</b> '+(bmr===null?"Pendiente":Math.round(bmr)+" kcal/día")+'</p>'+
'<p><b>Gasto total estimado:</b> '+(tdee===null?"Pendiente":Math.round(tdee)+" kcal/día")+'</p>'+
'<p><b>Plan de macronutrientes propuesto:</b> '+(kcal===null||proteinG===null||fatG===null?"Requiere kcal, proteína g/kg y % grasa":"Proteína "+fmt(proteinG,0)+" g · Grasa "+fmt(fatG,0)+" g · Carbohidratos "+(macroValid?fmt(carbG,0)+" g":"Inconsistentes (revisar objetivos)"))+'</p></div>'+
'<p class="mini muted">'+E(limitation||"Las estimaciones deben ajustarse a evolución, gasto real, nivel de actividad, riesgo nutricional y condiciones clínicas.")+'</p>'+
(renal||heart?'<p class="warn mini">Hay comorbilidad renal o cardiaca señalada: no aplicar objetivos proteicos, energéticos o hídricos automáticamente.</p>':"");
return {age,w,h,bmi,whr,loss,bmr,tdee,kcal,prot,fat,proteinG,fatG,carbG,macroValid,renal,heart,pregnancy};
}
function evaluate(){
const c=calculate();if(!c)return null;
const alerts=[],potential=[],differentials=[],todo=[],interventions=[],tracking=[],references=[];
if(c.age===null)todo.push("Edad adulta verificable: para menores de 18 años se requieren referencias pediátricas");
if(c.w===null||c.h===null)todo.push("Peso y talla válidos con fecha y técnica");
if(!V("nRecordatorio"))todo.push("Recordatorio de 24 horas cuantificado y patrón de consumo habitual");
if(!V("nActividad"))todo.push("Actividad física y entrenamiento");
if(!V("nFechaLab")&&(N("nGlucosa")!==null||N("nHba1c")!==null||N("nLDL")!==null||N("nTG")!==null))todo.push("Fecha y contexto de laboratorios");
if(c.pregnancy)alerts.push("Embarazo/lactancia señalada: evaluación obstétrica/nutricional específica; no usar cálculo estándar automático");
if(c.renal)alerts.push("Enfermedad renal: individualizar proteína, líquidos y electrolitos según función renal y prescripción");
if(c.heart)alerts.push("Insuficiencia cardiaca o restricción hídrica: no extrapolar necesidades de líquidos o sodio");
if(V("nTCA")==="si")alerts.push("Posible trastorno de conducta alimentaria: priorizar evaluación especializada; evitar metas restrictivas automáticas");
if(c.loss!==null&&c.loss>=5) {potential.push("Pérdida de peso referida de "+c.loss.toFixed(1)+"%: evaluar si fue involuntaria, el intervalo y el contexto para cribado de malnutrición.");}
if(c.age!==null&&c.bmi!==null) {
if(c.bmi>=30)potential.push("IMC en rango de obesidad según clasificación de adultos; no equivale por sí solo a diagnóstico de composición corporal o causa metabólica.");
else if(c.bmi>=25)potential.push("IMC en rango de sobrepeso para adultos; valorar cintura, composición y comorbilidades.");
else if(c.bmi<18.5)potential.push("IMC bajo en adultos; investigar causas y criterios de malnutrición, no diagnosticada automáticamente.");
else potential.push("IMC en rango de referencia general de adultos; no descarta disfunción metabólica ni malnutrición.");
}
const glmph=(c.loss!==null&&c.loss>=5)||(c.age!==null&&c.bmi!==null&&((c.age<70&&c.bmi<20)||(c.age>=70&&c.bmi<22)))||V("nMusculoReducido")==="si";
const glmet=V("nIngestaReducida")==="si"||V("nInflamacion")==="si";
if(glmph&&glmet)potential.push("Existen señales fenotípicas y etiológicas posibles para valoración GLIM; confirmar cribado, medición, temporalidad y criterio clínico antes de diagnosticar malnutrición.");
else if(glmph||glmet)todo.push("Completar criterios GLIM: fenotipo (pérdida involuntaria, IMC bajo o masa reducida) y etiología (ingesta/asimilación o inflamación).");
const t=N("nTG"),ldl=N("nLDL"),a1c=N("nHba1c"),glu=N("nGlucosa");
if(t!==null||ldl!==null) {
potential.push("Perfil de lípidos registrado: interpretar con rango del laboratorio, riesgo cardiovascular, antecedentes y tratamiento.");
interventions.push("Si se confirma dislipidemia: valorar patrón alimentario cardioprotector, grasas saturadas, fibra soluble y balance energético individualizado.");
}
if(t!==null&&t>=500)alerts.push("Triglicéridos ≥500 mg/dL registrados: requieren valoración médica prioritaria por riesgo de hipertrigliceridemia grave; confirmar contexto.");
if(glu!==null||a1c!==null) {
potential.push("Marcadores glucémicos registrados: revisar condiciones de toma, repetición y criterios médicos; no diagnosticar diabetes con un valor sin contexto.");
interventions.push("Si se documenta disglucemia: estructurar distribución de carbohidratos, fibra, horarios y actividad según terapia y riesgo de hipoglucemia.");
}
if(V("nObjetivo")==="musculo"||V("nDeportista")==="si") {
interventions.push("Evaluar carga de entrenamiento, disponibilidad energética, proteína total y distribución por comidas; vigilar rendimiento y recuperación.");
differentials.push("Baja disponibilidad energética relativa al ejercicio (RED-S) si hay fatiga, alteraciones menstruales/hormonales, lesiones por estrés o deterioro del rendimiento.");
}
if(V("nPESProblema")){if(V("nPESEtiologia")&&V("nPESEvidencia"))potential.push("Enunciado PES propuesto para revisión: "+V("nPESProblema")+" relacionado con "+V("nPESEtiologia")+" evidenciado por "+V("nPESEvidencia")+".");else todo.push("Completar etiología y signos/síntomas para sustentar el enunciado PES seleccionado.");}
interventions.unshift("Historia alimentaria cuantificada, identificación de barreras y establecimiento de objetivos nutricionales compartidos, medibles y reevaluables.");
if(V("nObjetivo")==="grasa")interventions.push("Valorar déficit energético individualizado solo tras revisar enfermedad, composición corporal, ingesta, adherencia y factores de riesgo; evitar reducciones arbitrarias.");
if(V("nDigestivos"))interventions.push("Investigar síntomas gastrointestinales y tolerancia alimentaria antes de recomendar alimentos, fibra o suplementos específicos.");
if(c.kcal!==null&&c.proteinG!==null&&c.fatG!==null&&c.macroValid)interventions.push("Borrador energético aportado: "+c.kcal.toFixed(0)+" kcal/día, proteína "+c.proteinG.toFixed(0)+" g, grasa "+c.fatG.toFixed(0)+" g y carbohidratos "+c.carbG.toFixed(0)+" g. Requiere validación individual.");
else todo.push("Para construir macros, elegir objetivo energético, proteína g/kg y porcentaje de grasa; no se prescriben por omisión");
differentials.unshift("Exceso o déficit de ingesta respecto a necesidades, alteración de composición corporal y riesgo de malnutrición: discriminar con historia y mediciones.");
tracking.push("Peso y cintura con medición estandarizada, evolución de la ingesta, síntomas y adherencia.");
if(V("nObjetivo")==="musculo"||V("nDeportista")==="si")tracking.push("Fuerza, rendimiento, recuperación, energía disponible y composición corporal con método reproducible.");
if(t!==null||ldl!==null)tracking.push("Perfil lipídico según indicación profesional.");
if(glu!==null||a1c!==null)tracking.push("Glucosa/HbA1c según seguimiento médico y tratamiento.");
references.push(["Mifflin–St Jeor (1990)","https://pubmed.ncbi.nlm.nih.gov/2305711/"]);
references.push(["GLIM, actualización 2025","https://pubmed.ncbi.nlm.nih.gov/40223699/"]);
latest={calc:c,alerts,potential,differentials,todo,interventions,tracking,references,observed:Object.fromEntries(ids.map(id=>[id,V(id)])),date:new Date().toLocaleDateString("es-MX"),age:V("edad"),sex:V("sexo")};
return latest;
}
function list(arr){return '<ul>'+arr.map(x=>'<li>'+E(x)+'</li>').join("")+'</ul>'}
function analyze(){
if(V("area")!=="nutricion")return;
const r=evaluate();if(!r)return;
const output=$("nutriResultados");output.innerHTML='<div class="panel"><h2>Orientación nutricional vinculada</h2>'+
(r.alerts.length?'<div class="warn"><b>Seguridad y referencia</b>'+list(r.alerts)+'</div>':"")+
'<h3>Hallazgos e hipótesis de valoración</h3>'+list(r.potential.length?r.potential:["Se requieren mediciones suficientes para plantear hipótesis específicas."])+
'<h3>Diferenciales y problemas nutricionales por estudiar</h3>'+list(r.differentials)+
'<h3>Datos faltantes</h3>'+list(r.todo)+
'<h3>Opciones de intervención y plan de trabajo</h3>'+list(r.interventions)+
'<h3>Indicadores y reevaluación</h3>'+list(r.tracking)+
'<h3>Fuentes metodológicas</h3>'+r.references.map(([n,u])=>'<p><a href="'+u+'" rel="noopener noreferrer" target="_blank">'+E(n)+'</a></p>').join("")+
'<p class="mini muted">Estas hipótesis son orientativas. Las prescripciones dependen de evaluación profesional y de datos suficientes.</p><div class="actions"><button class="primary" id="nTrasladarInforme">Crear documento nutricional</button></div></div>';
$("nTrasladarInforme").onclick=report;output.scrollIntoView({behavior:"smooth",block:"start"});
}
function report(){
if(V("area")!=="nutricion")return;
const r=evaluate();if(!r)return;const c=r.calc;
const fmt=x=>x===null?"No estimado":x.toFixed(1);
const labels={
nConsulta:"Tipo de consulta",nObjetivo:"Objetivo principal",nEmbarazo:"Embarazo/lactancia",nERC:"Enfermedad renal",nIC:"Insuficiencia cardiaca",nTCA:"Riesgo TCA",nDeportista:"Deportista",
nPeso:"Peso (kg)",nTalla:"Talla (cm)",nHabitual:"Peso previo (kg)",nPeriodo:"Intervalo (meses)",nCintura:"Cintura (cm)",nCadera:"Cadera (cm)",nCuello:"Cuello (cm)",nGrasa:"Grasa (%)",nMusculo:"Músculo (%)",nMusculoReducido:"Masa muscular reducida",nGlucosa:"Glucosa",nHba1c:"HbA1c",nLDL:"LDL",nHDL:"HDL",nTG:"Triglicéridos",nCreatinina:"Creatinina",nFG:"TFGe",nAcidoUrico:"Ácido úrico",nTA:"PAS",nFechaLab:"Fecha laboratorios",nRecordatorio:"Recordatorio de 24h",nComidas:"Comidas al día",nRestricciones:"Restricciones alimentarias",nDigestivos:"Síntomas GI",nSuplementos:"Suplementos",nActividad:"Actividad y ejercicio",nSueno:"Sueño",nIngestaReducida:"Ingesta reducida",nInflamacion:"Inflamación/enfermedad",nActividadFactor:"Factor actividad",nEcuacion:"Coeficiente Mifflin",nKcal:"Meta kcal",nProteina:"Meta proteína g/kg",nGrasas:"Meta grasa %",nDias:"Reevaluación semanas",nPESProblema:"Problema PES",nPESEtiologia:"Etiología PES",nPESEvidencia:"Signos y síntomas PES"};
const lines=["ASISTENTE CLÍNICO INTEGRAL · INFORME DE VALORACIÓN NUTRICIONAL","Fecha de emisión: "+r.date,"Uso: revisión profesional, no diagnóstico definitivo","",
"01 · CONTEXTO CLÍNICO","Edad: "+(r.age||"No documentada"),"Sexo registrado: "+(r.sex||"No documentado"),"Motivo de consulta: "+(V("motivo")||"No documentado"),"Antecedentes y medicación: "+(V("antecedentes")||"No documentado"),"Exploración clínica: "+(V("hallazgos")||"No documentado")];
for(const [id,label] of Object.entries(labels))lines.push(label+": "+(r.observed[id]||"No documentado"));
lines.push("Otros estudios: "+(V("estudios")||"No documentado"),"Tratamiento previo: "+(V("previos")||"No documentado"),"Objetivos acordados: "+(V("objetivos")||"No documentado"),"Resumen importado: "+(V("resumen")||"No documentado"));
lines.push("","02 · CÁLCULOS ORIENTATIVOS","IMC: "+fmt(c.bmi)+" kg/m²","Cintura/cadera: "+fmt(c.whr),"Variación ponderal (% de pérdida respecto al peso previo): "+fmt(c.loss),"Gasto en reposo Mifflin–St Jeor: "+(c.bmr===null?"No calculado":Math.round(c.bmr)+" kcal/día"),"Gasto total estimado: "+(c.tdee===null?"No calculado":Math.round(c.tdee)+" kcal/día"),"Propuesta de macros: "+(c.proteinG===null||c.fatG===null||!c.macroValid?"Incompleta":Math.round(c.proteinG)+" g proteína / "+Math.round(c.fatG)+" g grasa / "+Math.round(c.carbG)+" g carbohidratos"));
const sections=[["03 · SEGURIDAD Y DERIVACIÓN",r.alerts],["04 · HALLAZGOS E HIPÓTESIS",r.potential],["05 · DIAGNÓSTICOS DIFERENCIALES / PROBLEMAS POR EVALUAR",r.differentials],["06 · DATOS FALTANTES",r.todo],["07 · PROPUESTAS DE INTERVENCIÓN",r.interventions],["08 · SEGUIMIENTO",r.tracking]];
for(const [name,arr] of sections)lines.push("",name,...(arr.length?arr.map(x=>"- "+x):["- Sin elementos documentados"]));
lines.push("","09 · FUENTES",...r.references.map(([n,u])=>n+": "+u),"","NOTA: revisar valores, aplicabilidad de las ecuaciones y competencia clínica. Datos anonimizados antes de enviar a IA.");
$("salida").value=lines.join("\n");
document.querySelector('[data-go="informe"]').click();
}
function tool(){
const page=$("herramientas");if(!page)return;
let section=$("nHerrNutri");
if(!section){section=document.createElement("div");section.id="nHerrNutri";section.className="panel";page.querySelector("h1")?.after(section)}
const active=V("area")==="nutricion";section.style.display=active?"":"none";
if(!active)return;
const c=calculate();
section.innerHTML='<h2>Calculadoras nutricionales vinculadas a la valoración</h2>'+
'<div class="two">'+
'<div class="measure"><b>IMC y riesgo antropométrico</b><p>'+(c?.bmi===null?"Pendiente":c.bmi.toFixed(1)+" kg/m²")+'</p></div>'+
'<div class="measure"><b>Índice cintura/cadera</b><p>'+(c?.whr===null?"Pendiente":c.whr.toFixed(2))+'</p></div>'+
'<div class="measure"><b>Gasto energético en reposo</b><p>'+(c?.bmr===null?"Pendiente":Math.round(c.bmr)+" kcal/día")+'</p></div>'+
'<div class="measure"><b>Gasto total orientativo</b><p>'+(c?.tdee===null?"Pendiente":Math.round(c.tdee)+" kcal/día")+'</p></div></div>'+
'<div class="actions"><button class="primary" id="nToolGoto">Volver a valoración nutricional</button></div><p class="mini muted">Valores sincronizados desde Nutrición. Las fórmulas no equivalen a diagnóstico ni a prescripción.</p>';
$("nToolGoto").onclick=()=>document.querySelector('[data-go="valoracion"]').click();
const other=page.querySelector(".grid");if(other)other.style.display="none";
const gs=Array.from(page.children).filter(x=>x.classList?.contains("panel")&&x!==section);for(const el of gs)el.style.display="none";
}
function toggle(){
mount();
if(V("area")!=="nutricion"){
const page=$("herramientas"),other=page?.querySelector(".grid");if(other)other.style.display="";
if(page)for(const el of Array.from(page.children).filter(x=>x.classList?.contains("panel")&&x.id!=="nHerrNutri"))el.style.display="";
}
}
function attach(){
if(!$("area"))return;
$("area").addEventListener("change",toggle);
document.querySelectorAll('[data-go="herramientas"]').forEach(b=>b.addEventListener("click",()=>{if(V("area")==="nutricion")tool()}));
$("edad").addEventListener("input",()=>{latest=null;calculate()});
$("sexo").addEventListener("change",()=>{latest=null;calculate()});
toggle();
}
window.ClinicalNutrition={mount,toggle,analyze,report,tool,calculate};
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",attach);else attach();
})();