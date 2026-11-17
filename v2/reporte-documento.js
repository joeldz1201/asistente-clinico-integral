(function(){
"use strict";
const $=id=>document.getElementById(id);
const esc=x=>String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function doc(title,text){
const date=new Date().toLocaleString("es-MX");
const clean=String(text||"").replace(/\r\n/g,"\n");
let body="",list=false,opened=false;
const close=()=>{if(list){body+="</ul>";list=false}};
for(const orig of clean.split("\n")){
const line=orig.trim();if(!line){close();continue;}
const isHeader=(!line.includes(": ")&&line.length<=110&&(/^[0-9]{2}\s*[·.\-]/.test(line)||/^[A-ZÁÉÍÓÚÑ0-9\s\/·\-]{12,}$/.test(line)));
if(isHeader){close();if(opened)body+="</section>";body+="<section class='segment'><h2>"+esc(line)+"</h2>";opened=true;continue;}
if(line.startsWith("- ")){if(!list){body+="<ul>";list=true}body+="<li>"+esc(line.slice(2))+"</li>";continue;}
close();
const kv=line.match(/^([^:]{2,55}):\s*(.*)$/);
if(kv)body+="<div class='field'><strong>"+esc(kv[1])+"</strong><span>"+esc(kv[2]||"No documentado")+"</span></div>";
else body+="<p>"+esc(line)+"</p>";
}
close();if(opened)body+="</section>";
const css="@page{size:A4;margin:18mm 16mm}*{box-sizing:border-box}html,body{margin:0;color:#17333d;font-family:Arial,Helvetica,sans-serif;background:#fff;font-size:10.5pt;line-height:1.52}body{padding:0 10px}.title{padding:16px 0;border-bottom:3px solid #0b787a;margin-bottom:18px;display:flex;align-items:flex-start;justify-content:space-between;gap:20px}.mark{font-size:19pt;font-weight:700;color:#123c4c}.sub{color:#487278;font-size:9pt}.right{text-align:right;color:#5a7074;font-size:9pt;white-space:nowrap}h1{font-size:17pt;margin:12px 0}h2{font-size:11.5pt;color:#0b626d;background:#edf7f6;padding:8px 10px;margin:18px 0 10px;border-left:3px solid #119095;page-break-after:avoid}p{margin:6px 0;overflow-wrap:anywhere;white-space:pre-wrap}.field{display:grid;grid-template-columns:36% 1fr;gap:8px;padding:5px 8px;border-bottom:1px solid #e5ecec;break-inside:avoid}.field strong{color:#254b54}.field span{overflow-wrap:anywhere;white-space:pre-wrap}ul{margin:6px 0;padding-left:22px}li{margin:4px 0;overflow-wrap:anywhere;page-break-inside:avoid}.segment{margin-bottom:7px}footer{border-top:1px solid #d9e7e5;margin-top:24px;padding-top:10px;font-size:8.5pt;color:#697d7f}.notice{background:#fff7e7;padding:10px 12px;border-left:3px solid #d39e42;margin-bottom:12px;font-size:9pt}@media screen{body{max-width:850px;margin:auto;padding:32px;box-shadow:0 8px 25px #0001}.print-actions{display:flex;gap:12px;margin-bottom:20px}.print-actions button{cursor:pointer;padding:10px 18px;border-radius:8px;border:1px solid #096f74;background:#096f74;color:white}}@media print{.print-actions{display:none}.title{margin-top:0}body{padding:0}}";
return '<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+esc(title)+'</title><style>'+css+'</style></head><body><div class="print-actions"><button onclick="window.print()">Imprimir o guardar PDF</button></div><div class="title"><div><div class="mark">✚ ASISTENTE CLÍNICO INTEGRAL</div><div class="sub">Documento independiente · Para revisión profesional</div></div><div class="right">Generado: '+esc(date)+'<br>Sin firma ni validación automática</div></div><h1>'+esc(title)+'</h1><div class="notice">Documento de apoyo clínico. Validar datos, diagnóstico, intervenciones y consentimiento. No compartir información identificable en servicios externos.</div>'+body+'<footer>Informe generado localmente en el navegador. No constituye una prescripción ni sustituye la valoración profesional.</footer></body></html>';
}
function getReport(){const t=$("salida")?.value||"";if(!t.trim()){alert("Primero genera un informe desde la valoración.");return null}const a=$("area")?.value||"general";return {html:doc(a==="nutricion"?"Informe de valoración nutricional":"Informe de evaluación clínica",t),a};}
function printReport(){
const r=getReport();if(!r)return;
const w=window.open("","_blank");
if(!w){alert("Tu navegador bloqueó la ventana del informe. Usa Descargar documento HTML y ábrelo para imprimir.");return}
w.document.open();w.document.write(r.html);w.document.close();w.focus();
setTimeout(()=>{try{w.print()}catch(e){}},350);
}
function downloadReport(){
const r=getReport();if(!r)return;
const url=URL.createObjectURL(new Blob([r.html],{type:"text/html;charset=utf-8"}));
const a=document.createElement("a");a.href=url;a.download="informe_clinico_"+r.a+".html";document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);
}
function attach(){
const button=$("imprimir");if(!button)return;
button.textContent="Imprimir / Guardar PDF";button.onclick=printReport;
if(!$("descargarDocumento")){const b=document.createElement("button");b.id="descargarDocumento";b.textContent="Descargar documento";b.onclick=downloadReport;button.after(b)}
const cap=$("informe")?.querySelector(".warn");if(cap)cap.innerHTML="<b>Documento de revisión clínica.</b> Para imprimir o guardar un PDF se abrirá un informe independiente, sin controles de la página. Revisa la anonimización antes de enviarlo a otra plataforma.";
}
window.ClinicalReportDocument={print:printReport,download:downloadReport,create:doc};
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",attach);else attach();
})();