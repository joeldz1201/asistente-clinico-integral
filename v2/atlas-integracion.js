(function(){
"use strict";
const get=id=>document.getElementById(id);
const atlas=Array.isArray(window.ClinicalAtlasRegions)?window.ClinicalAtlasRegions:[];
const esc=x=>String(x==null?"":x).replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[ch]));
const norm=x=>String(x||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");
const names={mano:"Mano y dedos",muneca:"Muñeca",codo:"Codo y antebrazo",hombro:"Hombro",cervical:"Columna cervical",toracica:"Columna torácica",lumbar:"Columna lumbar",cadera:"Pelvis y cadera",rodilla:"Rodilla",tobillo:"Tobillo",pie:"Pie"};
const aliases={mano:["mano","dedo","pulgar","metacarp","falange","tenar","digital"],muneca:["muneca","carpo","radio distal"],codo:["codo","epicond","antebrazo"],hombro:["hombro","escapula","manguito"],cervical:["cervical","cuello"],toracica:["toracica","dorsal","torax"],lumbar:["lumbar","lumbosac","espalda baja"],cadera:["cadera","pelvis","ingle","gluteo"],rodilla:["rodilla","rotula"],tobillo:["tobillo","maleolo"],pie:["pie","plantar","calcaneo","metatarso"]};
const questions={
mano:[["Traumatismo directo, caída o aplastamiento","trauma"],["Herida abierta o corte profundo","urgent"],["Deformidad de dedo o mano","urgent"],["Pérdida de flexión o extensión activa de algún dedo","urgent"],["Entumecimiento, hormigueo o pérdida de sensibilidad","neuro"],["Bloqueo o chasquido de dedo","gatillo"],["Dolor en la base del pulgar","pulgar"],["Cambio de color, temperatura o perfusión","urgent"]],
muneca:[["Caída sobre mano extendida","trauma"],["Dolor en tabaquera anatómica","urgent"],["Dolor radial y movimientos repetitivos del pulgar","radial"],["Hormigueo nocturno en pulgar, índice o medio","mediano"],["Atrofia tenar o debilidad progresiva","urgent"],["Deformidad o compromiso vascular","urgent"]],
codo:[["Dolor lateral con agarre o extensión de muñeca","lateral"],["Hormigueo en cuarto o quinto dedo","cubital"],["Traumatismo","trauma"],["Incapacidad para extender el codo","urgent"],["Déficit neurológico progresivo","urgent"]],
hombro:[["Debilidad para elevar o rotar brazo","rotador"],["Caída o luxación reciente","trauma"],["Rigidez tanto activa como pasiva","rigidez"],["Parestesias o dolor irradiado del cuello","neuro"],["Fiebre o deformidad","urgent"]],
cervical:[["Dolor irradiado al brazo","radicular"],["Parestesias en manos","neuro"],["Debilidad progresiva","urgent"],["Alteración de marcha o destreza manual bilateral","urgent"],["Traumatismo importante o fiebre","urgent"]],
toracica:[["Dolor mecánico relacionado con movimiento","mecanico"],["Disnea, opresión torácica o síncope","urgent"],["Fiebre o síntomas sistémicos","urgent"],["Traumatismo u osteoporosis de riesgo","trauma"]],
lumbar:[["Dolor irradiado a miembro inferior","radicular"],["Hormigueo o pérdida sensitiva","neuro"],["Dolor al caminar aliviado por flexión","claud"],["Alteración esfinteriana o anestesia perineal nueva","urgent"],["Déficit motor progresivo","urgent"],["Fiebre o traumatismo importante","urgent"]],
cadera:[["Dolor inguinal y rigidez","artrosis"],["Dolor lateral con apoyo monopodal","gluteo"],["Caída con imposibilidad para apoyar","urgent"],["Fiebre o dolor intenso en reposo","urgent"]],
rodilla:[["Dolor anterior con sentadillas/escaleras","anterior"],["Giro traumático con derrame","trauma"],["Bloqueo mecánico verdadero","urgent"],["Inestabilidad con caídas","trauma"],["Rodilla caliente con fiebre","urgent"]],
tobillo:[["Inversión al lesionarse","esguince"],["Dolor óseo focal en puntos de Ottawa","urgent"],["Incapacidad para dar cuatro pasos","urgent"],["Chasquido y pérdida de flexión plantar","urgent"],["Edema o equimosis","edema"],["Deformidad o compromiso vascular","urgent"]],
pie:[["Dolor plantar al dar los primeros pasos","plantar"],["Dolor óseo focal tras aumento de carga","trauma"],["Parestesias persistentes","neuro"],["Herida, fiebre o incapacidad de apoyo","urgent"]]
};
let current=null;
function findRegion(text){const t=norm(text);if(!t.trim())return "";for(const [id,words] of Object.entries(aliases)){if(words.some(x=>t.includes(norm(x))))return id}return ""}
function regionFromCase(){return findRegion(get("region")?.value)}
function regionFromSearch(q){return findRegion(q)}
function relevantCard(c){return c.region===regionFromCase()}
function setAreaContext(){
const area=get("area")?.value,reg=regionFromCase(),musculo=area==="dolor"||area==="rehab";
const root=get("motor");if(!root)return;
const group=root.querySelector(".clinical-checks");if(!group)return;
let q=musculo?(questions[reg]||[]):null;
if(musculo){
root.querySelector("h2").textContent="Exploración regional · "+(names[reg]||"Selecciona una región anatómica");
const caption=root.querySelector("p.muted");if(caption)caption.textContent=reg?"Región detectada: "+names[reg]+". Los puntos no marcados no se interpretan como negativos.":"Escribe mano, muñeca, cervical, lumbar, rodilla, etc. para activar las preguntas anatómicas específicas.";
group.innerHTML=q.map((row,i)=>'<label><input type="checkbox" class="regional-check" data-index="'+i+'"><span>'+esc(row[0])+'</span></label>').join("");
if(!reg)group.innerHTML='<p class="muted">La exploración regional se activará al seleccionar una región reconocida.</p>';
}
const exist=get("anatomiaRelacionada");if(exist)exist.remove();
if(musculo&&reg){
const cardset=atlas.filter(x=>x.region===reg);
const block=document.createElement("div");block.id="anatomiaRelacionada";block.className="measure";
block.innerHTML='<h3>Estructuras y pruebas asociadas: '+esc(names[reg])+'</h3>'+cardset.slice(0,3).map(x=>'<details><summary>'+esc(x.title)+'</summary><p><b>Anatomía:</b> '+esc(x.anatomy)+'</p><p><b>Exploración:</b> '+esc(x.assessment)+'</p></details>').join("")+'<p class="mini muted">El atlas enlaza estas fichas con el análisis. La anatomía, por sí sola, no establece diagnóstico.</p>';
group.after(block);
}
current=null;
get("resultadoCaso").innerHTML="";
get("analizarCaso").onclick=renderAnalysis;
refreshTools();
}
function allClinicalCards(){const original=(typeof data==="undefined"?[]:data).filter(x=>!["dolor","rehab"].includes(x.a));return atlas.concat(original.map((x,i)=>({id:"general-"+i,region:"",title:x.t,code:x.c,anatomy:x.an,assessment:x.ev,differentials:"Requiere evaluación individual",alerts:x.alert,treatment:x.trat,dose:x.dosis,followup:x.seg,tools:"Evaluación según especialidad",source:"https://pubmed.ncbi.nlm.nih.gov/?term="+encodeURIComponent(x.q),area:x.a})))}
function renderAtlas(){
const q=norm(get("buscar")?.value||""),a=get("filtro")?.value||"todas",regional=get("atlasRegion")?.value||"";
const c=allClinicalCards().filter(x=>{
const isMSK=!x.area;
if(a==="dolor"||a==="rehab"){if(!isMSK)return false}
else if(a!=="todas"&&x.area!==a)return false;
if(regional&&x.region!==regional)return false;
if(!q)return true;
const strictRegion=regionFromSearch(q);if(strictRegion && (q===strictRegion||q===norm(names[strictRegion])||q==="muñeca"||q==="torácica"))return x.region===strictRegion;
const searchable=norm([x.region,names[x.region]||"",x.title,x.code,x.anatomy,x.assessment,x.differentials,x.tools].join(" "));
return searchable.includes(q)||(regionFromSearch(q)!==""&&x.region===regionFromSearch(q));
});
const target=get("fichas");if(!target)return;
const summary=get("atlasCounter");if(summary)summary.textContent=c.length+" fichas visibles · "+atlas.length+" fichas anatómicas en "+Object.keys(names).length+" regiones";
if(!c.length){target.innerHTML='<div class="panel"><h3>No hay una ficha coincidente</h3><p>Prueba con una región anatómica o retira el filtro. No se mostrarán fichas ajenas a tu búsqueda.</p></div>';return}
target.innerHTML=c.map(x=>'<article class="card" id="atlas-'+esc(x.id)+'"><span class="pill">'+esc(x.region?names[x.region]:areas[x.area]?.[0]||"Clínica")+'</span><h2>'+esc(x.title)+'</h2><p class="muted">'+esc(x.code)+'</p><details open><summary>01 · Anatomía: músculos, tendones, ligamentos y articulaciones</summary><p>'+esc(x.anatomy)+'</p></details><details><summary>02 · Evaluación y pruebas</summary><p>'+esc(x.assessment)+'</p><p><b>Pruebas / herramientas:</b> '+esc(x.tools)+'</p></details><details><summary>03 · Diagnósticos diferenciales</summary><p>'+esc(x.differentials)+'</p></details><details><summary>04 · Alarmas y derivación</summary><p>'+esc(x.alerts)+'</p></details><details><summary>05 · Opciones de tratamiento</summary><p>'+esc(x.treatment)+'</p></details><details><summary>06 · Dosificación, criterios y progresión</summary><p>'+esc(x.dose)+'</p></details><details><summary>07 · Seguimiento y resultados</summary><p>'+esc(x.followup)+'</p></details><p><a href="'+esc(x.source)+'" target="_blank" rel="noopener noreferrer">Consultar fuente o literatura de referencia</a></p><p class="mini muted">Material orientativo; el enlace no implica validación integral de esta ficha.</p></article>').join("");
}
function prepareAtlasUI(){
const title=get("atlas");if(!title)return;
const search=title.querySelector(".two");if(!search)return;
const div=document.createElement("div");div.className="panel";div.innerHTML='<div class="two"><div><label>Filtrar por región anatómica<select id="atlasRegion"><option value="">Todas las regiones</option>'+Object.entries(names).map(([k,v])=>'<option value="'+k+'">'+esc(v)+'</option>').join("")+'</select></label></div><div><label>Contenido disponible</label><p id="atlasCounter" class="muted"></p></div></div>';
search.after(div);
get("buscar").oninput=()=>{const reg=regionFromSearch(get("buscar").value);if(reg&&get("atlasRegion").value&&get("atlasRegion").value!==reg)get("atlasRegion").value="";if(reg&&!["todas","dolor","rehab"].includes(get("filtro").value))get("filtro").value="todas";renderAtlas()};get("filtro").onchange=renderAtlas;get("atlasRegion").onchange=()=>{get("buscar").value="";renderAtlas()};
renderAtlas();
}
function selectedFindings(){
const reg=regionFromCase(),a=get("area").value;
if(a!=="dolor"&&a!=="rehab")return Array.from(document.querySelectorAll("#motor input[type=checkbox]:checked")).map(x=>x.closest("label")?.innerText.trim()||"Hallazgo");
const qs=questions[reg]||[];
return Array.from(document.querySelectorAll("#motor .regional-check:checked")).map(x=>qs[Number(x.dataset.index)]).filter(Boolean);
}
function conditionOrder(conditions,caseText,positive){
const text=norm(caseText+" "+positive.map(x=>x[0]||"").join(" "));
function score(c){
const t=norm(c.title);let n=0;
if(/trauma|caida|golpe|fractura|deformidad|herida|corte/.test(text)&&/trauma|lesion|fractura|esguince/.test(t))n+=4;
if(/parest|hormigueo|entumec|sensibilidad|noche/.test(text)&&/neuropat|nervios|tunel|alteracion sensitiva|radicular/.test(t))n+=5;
if(/chasquido|bloqueo/.test(text)&&/gatillo|meniscal/.test(t))n+=5;
if(/pulgar|pinza/.test(text)&&/pulgar|de quervain/.test(t))n+=4;
if(/tabaquera|escafoides/.test(text)&&/escafoides/.test(t))n+=5;
if(/rodilla|anterior|escalera/.test(text)&&/femoropatelar/.test(t))n+=2;
if(/inversion/.test(text)&&/esguince/.test(t))n+=5;
if(/lumbar|lumbalgia/.test(text)&&/lumbar/.test(t))n+=2;
return n;
}
return conditions.map(x=>({...x,priority:score(x)})).sort((a,b)=>b.priority-a.priority);
}
function renderAnalysis(){
if(get('area').value==='nutricion'&&window.ClinicalNutrition){window.ClinicalNutrition.analyze();return;}
const a=get("area").value,reg=regionFromCase(),name=names[reg]||"No identificada",p=selectedFindings();
const lines=p.map(x=>Array.isArray(x)?x[0]:x);
const positives=p.filter(Array.isArray);
const urgent=positives.filter(x=>x[1]==="urgent").map(x=>x[0]);
const caution=positives.filter(x=>x[1]==="trauma").map(x=>x[0]);
const text=[get("region")?.value,get("motivo")?.value,get("hallazgos")?.value,get("antecedentes")?.value,get("resumen")?.value].join(" ");
const isMSK=a==="dolor"||a==="rehab";
let cards=[];
if(isMSK)cards=reg?conditionOrder(atlas.filter(x=>x.region===reg),text,positives):[];
else cards=allClinicalCards().filter(x=>x.area===a);
const missing=[];
if(!String(get("edad")?.value||"").trim())missing.push("Edad");
if(!String(get("hallazgos")?.value||"").trim()||/^(no|ninguno)$/i.test(get("hallazgos").value.trim()))missing.push("Exploración objetiva; no se considera normal por omisión");
if(!String(get("motivo")?.value||"").trim())missing.push("Inicio, duración, síntomas y mecanismo");
if(isMSK){
if(!reg)missing.push("Región anatómica específica (mano, muñeca, codo, hombro, cervical, torácica, lumbar, cadera, rodilla, tobillo o pie)");
else missing.push("Inspección, palpación, ROM, fuerza, neurovascular y pruebas regionales pertinentes; documenta positivos y negativos");
}else missing.push("Información y mediciones específicas para "+(areas[a]?.[0]||"especialidad")+"; ausencia de datos no confirma ni excluye patología");
if(isMSK&&reg==="mano")missing.push("Dominancia manual, dedo específico, mecanismo, cascada digital, función de flexores/extensores, sensibilidad y perfusión");
if(isMSK&&reg==="muneca")missing.push("Palpación ósea focal, territorios sensitivos y actividad desencadenante");
current={a,reg,name,lines,urgent,caution,missing,cards,stamp:new Date().toISOString()};
const out=get("resultadoCaso");if(!out)return;
const l=arr=>'<ul>'+arr.map(x=>'<li>'+esc(x)+'</li>').join("")+'</ul>';
const prioritized=cards.filter(x=>x.priority>0);const diagnosticCandidates=isMSK?prioritized.slice(0,3):cards.slice(0,3);
const hypothesis=diagnosticCandidates.length?diagnosticCandidates.map((x,i)=>'<div class="diagnosis"><b>'+esc(x.title)+'</b><p><b>Por qué considerarla:</b> '+esc(x.assessment)+'</p><p><b>Qué podría diferenciarla:</b> '+esc(x.differentials)+'</p><small>Posibilidad anatómica para explorar · No diagnóstico confirmado'+(x.priority>0?' · Coincidencia orientativa con los hallazgos':' · Sin datos suficientes para priorizar')+'</small></div>').join(""):'<div class="diagnosis missing">No hay datos específicos suficientes para priorizar una hipótesis diagnóstica. Abajo se muestran únicamente fichas anatómicas relacionadas con la región, no diagnósticos asignados al paciente.</div>';
out.innerHTML='<h3>Orientación clínica vinculada · '+esc(isMSK?name:areas[a]?.[0])+'</h3>'+(urgent.length?'<div class="diagnosis urgent"><b>Hallazgos que exigen valoración prioritaria o derivación</b>'+l(urgent)+'</div>':'<div class="diagnosis"><b>Alertas sin confirmar.</b> No marcar una alerta no equivale a descartarla.</div>')+'<h3>Hallazgos registrados</h3>'+(lines.length?l(lines):'<p>No hay hallazgos regionales seleccionados.</p>')+'<h3>Hipótesis y diagnósticos diferenciales por región</h3>'+hypothesis+'<h3>Información pendiente</h3><div class="diagnosis missing">'+l(missing)+'</div><h3>Biblioteca regional y herramientas para continuar la exploración</h3>'+cards.slice(0,5).map(x=>'<div class="diagnosis"><b>'+esc(x.title)+'</b><p><b>Estructuras:</b> '+esc(x.anatomy)+'</p><p><b>Exploración:</b> '+esc(x.tools)+'</p><details><summary>Intervención y seguimiento (orientativos)</summary><p>'+esc(x.treatment)+'</p><p><b>Dosificación:</b> '+esc(x.dose)+'</p><p><b>Seguimiento:</b> '+esc(x.followup)+'</p></details></div>').join("")+'<p class="mini muted">El sistema relaciona reglas y fichas clínicas, no ejecuta un modelo de IA ni confirma diagnósticos.</p><div class="actions"><button class="primary" id="informeRegional">Generar informe del caso</button><button id="atlasRegional">Ver fichas de esta región</button><button id="herrRegional">Abrir herramientas pertinentes</button></div>';
get("informeRegional").onclick=buildReport;
get("atlasRegional").onclick=()=>{get("atlasRegion").value=reg||"";get("buscar").value="";get("filtro").value=isMSK?"rehab":a;renderAtlas();document.querySelector('[data-go="atlas"]').click()};
get("herrRegional").onclick=()=>{refreshTools();document.querySelector('[data-go="herramientas"]').click()};
out.scrollIntoView({block:"start",behavior:"smooth"});
}
function reportValue(id){const x=get(id);return x&&String(x.value||"").trim()?x.value.trim():"No documentado"}
function buildReport(){
if(get('area').value==='nutricion'&&window.ClinicalNutrition){window.ClinicalNutrition.report();return;}
if(!current||current.a!==get("area").value||current.reg!==regionFromCase())renderAnalysis();
if(!current)return;
const c=current;
let lines=["INFORME CLÍNICO PARA REVISIÓN PROFESIONAL","AVISO: propuesta orientativa y no diagnóstico confirmado","","Especialidad: "+(areas[c.a]?.[0]||c.a),"Región anatómica: "+c.name,"Edad: "+reportValue("edad"),"Sexo registrado: "+reportValue("sexo"),"Motivo y evolución: "+reportValue("motivo"),"Antecedentes y alergias: "+reportValue("antecedentes"),"Exploración y signos vitales: "+reportValue("hallazgos"),"Estudios: "+reportValue("estudios"),"Tratamiento previo: "+reportValue("previos"),"Objetivos: "+reportValue("objetivos"),"Resumen importado: "+reportValue("resumen"),"","HALLAZGOS REGIONALES","- "+(c.lines.join("\n- ")||"Sin hallazgos seleccionados"),"","POSIBLES HIPÓTESIS / DIFERENCIALES"];
for(const x of c.cards)lines.push("- "+x.title+" | Diferenciales: "+x.differentials+" | Evaluar: "+x.assessment);
lines.push("","ALERTAS REPORTADAS","- "+(c.urgent.join("\n- ")||"No marcadas, pero no descartadas"),"","DATOS FALTANTES","- "+c.missing.join("\n- "),"","BIBLIOTECA Y TRATAMIENTO ORIENTATIVO");
for(const x of c.cards.slice(0,5))lines.push(x.title+"\nEstructuras: "+x.anatomy+"\nPruebas: "+x.tools+"\nAlternativas: "+x.treatment+"\nProgresión: "+x.dose+"\nSeguimiento: "+x.followup+"\nFuente: "+x.source+"\n");
lines.push("","HERRAMIENTAS DE SESIÓN","EVA: "+(get("eva")?.value||"No documentado")+"/10","Fuerza MRC: "+(get("mrc")?.value||"No documentado")+"/5","RPE: "+(get("rpe")?.value||"No documentado")+"/10");
if(typeof roms!=="undefined"&&Array.isArray(roms))lines.push("ROM: "+(roms.join(" | ")||"No documentado"));
lines.push("","SOLICITUD DE ANÁLISIS CON IA","Revisar coherencia de hipótesis, explicar argumentos a favor y en contra según datos, preguntar lo faltante, descartar urgencias, ofrecer opciones de intervención basadas en bibliografía verificable y competencias profesionales; no inventar dosis ni atribuir certeza.");
lines.push("","PRIVACIDAD: retirar identificadores antes de compartir. Esta plataforma no envía datos a un modelo de IA.");
get("salida").value=lines.join("\n");document.querySelector('[data-go="informe"]').click();
}
function refreshTools(){
if(get('area')?.value==='nutricion'&&window.ClinicalNutrition){window.ClinicalNutrition.tool();return;}
const area=get("area")?.value||"rehab",reg=regionFromCase(),root=get("herramientas");if(!root)return;
let top=get("herrContext");if(!top){top=document.createElement("div");top.id="herrContext";top.className="panel";root.querySelector("h1")?.after(top)}
const items=atlas.filter(x=>x.region===reg);
top.innerHTML='<h3>Herramientas relacionadas con la valoración</h3><p><b>Especialidad:</b> '+esc(areas[area]?.[0]||area)+' · <b>Región:</b> '+esc(names[reg]||"Sin especificar")+'</p>'+(items.length?'<ul>'+items.slice(0,3).map(x=>'<li><b>'+esc(x.title)+'</b>: '+esc(x.tools)+'</li>').join("")+'</ul>':'<p class="muted">Indica una región anatómica para mostrar pruebas y escalas pertinentes. Los controles genéricos no sustituyen las pruebas regionales.</p>');
const cards=Array.from(root.querySelectorAll(".grid>.card"));if(cards.length>=4){
cards[0].style.display=(area==="dolor"||area==="rehab"||area==="enfermeria")?"":"none";
cards[1].style.display=(area==="dolor"||area==="rehab"||area==="enfermeria")?"":"none";
cards[2].style.display=(area==="rehab"||area==="nutricion")?"":"none";
cards[3].style.display=area==="nutricion"?"":"none";
}
}
function attach(){
if(!atlas.length){return}
const regionInput=get("region");regionInput.setAttribute("list","atlasRegionesOpciones");
const dl=document.createElement("datalist");dl.id="atlasRegionesOpciones";dl.innerHTML=Object.values(names).map(x=>'<option value="'+esc(x)+'">').join("");document.body.append(dl);
prepareAtlasUI();
const sync=()=>{setAreaContext();refreshTools()};
regionInput.addEventListener("input",sync);get("area").addEventListener("change",sync);
get("valoracion").addEventListener("input",()=>{if(current){current=null;const box=get("resultadoCaso");if(box)box.insertAdjacentHTML("afterbegin",'<p class="warn">Los datos cambiaron: ejecuta nuevamente el análisis para actualizar las hipótesis y fichas.</p>')}});
get("generar").onclick=buildReport;
sync();
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",attach);else attach();
})();