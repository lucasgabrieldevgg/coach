const fs=require('fs');
const {JSDOM}=require('jsdom');
const HTML=fs.readFileSync('index.html','utf8');
const dom=new JSDOM(HTML,{runScripts:'dangerously',url:'https://x.github.io/coach/'});
const w=dom.window,d=w.document;
const tick=ms=>new Promise(r=>setTimeout(r,ms||60));
w.fetch=async()=>({ok:true,json:async()=>({choices:[{message:{content:'Bora! ```plano\n{"objetivo":"resis","local":"parque","exp":"pouco","dias":"5","tempo":"40","limit":"nenhum"}\n```'}}]})});
(async()=>{
 await tick(150);
 d.querySelector('#b-comecar').click();await tick(150);
 // responde o quiz rápido via W direto (rodei o fluxo normal antes; aqui simplificado: usar cliques)
 for(let i=0;i<10;i++){
  const qz=d.querySelector('#chatquiz');
  if(!qz||qz.hidden)break;
  const txt=(Array.from(d.querySelectorAll('#chatlog .msg.ia')).pop()||{textContent:''}).textContent;
  if(txt.includes('objetivo agora')){qz.querySelectorAll('[data-qz]')[0].click();await tick(50);d.querySelector('#chatquiz').querySelectorAll('[data-qz]')[1].click();await tick(50);d.querySelector('#chatquiz #qz-ok').click();await tick(100)}
  else if(txt.includes('limitação física')){qz.querySelectorAll('[data-qz]')[0].click();await tick(50);d.querySelector('#chatquiz #qz-ok').click();await tick(100)}
  else if(txt.includes('Como é tua semana')){d.querySelector('#chatquiz #qz-txt').value='x';d.querySelector('#chatquiz #qz-ok').click();await tick(100)}
  else if(txt.includes('Última coisa')){d.querySelector('#chatquiz #qz-ap').value='T';d.querySelector('#chatquiz #qz-co').value='C';d.querySelector('#chatquiz #qz-ok').click();await tick(150)}
  else{const c=qz.querySelectorAll('[data-qz]')[1];if(c){c.click();await tick(180)}else await tick(180)}
 }
 console.log('plano?',!!w.localStorage.getItem('coach_plano'));
 console.log('hist tipos:',JSON.parse(w.localStorage.getItem('coach_chat')).map(x=>x.r+':'+typeof x.t).join(' | '));
const H=JSON.parse(w.localStorage.getItem('coach_chat'));
H.filter(x=>typeof x.t==='object').forEach(x=>console.log('OBJETO:',JSON.stringify(x).slice(0,200)));
})();
