const fs=require('fs');
const {JSDOM}=require('jsdom');
const HTML=fs.readFileSync('/tmp/coach/index.html','utf8');
const dom=new JSDOM(HTML,{runScripts:'dangerously',url:'https://x.github.io/coach/'});
const w=dom.window,d=w.document;
w.addEventListener('error',e=>console.log('WINDOW ERROR:',e.message));
w.fetch=async()=>({ok:true,json:async()=>({choices:[{message:{content:'x ```plano\n{"objetivo":"forca","local":"quarto","exp":"pouco","dias":"4","tempo":"20","limit":"nenhum"}\n```'}}]})});
const tick=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 await tick(150);
 d.querySelector('#b-falar').click();await tick(120);
 w.localStorage.setItem('coach_chat','[]');
 d.querySelector('#nav button[data-v="v-chat"]').click();await tick(120);
 w.fetch=async()=>({ok:true,json:async()=>({choices:[{message:{content:'x ```plano\n{"objetivo":"forca","local":"quarto","exp":"pouco","dias":"4","tempo":"20","limit":"nenhum"}\n```'}}]})});
 d.querySelector('#chatin').value='quero treinar';
 d.querySelector('#b-enviar').click();await tick(400);
 const ap=d.querySelector('#chatlog [data-ap="plano"]');
 console.log('botão existe?',!!ap);
 if(ap){ap.click();await tick(200);
  console.log('v-plano hidden?',d.querySelector('#v-plano').hidden);
  console.log('plano salvo?',!!w.localStorage.getItem('coach_plano'));
  try{const r=w.eval('JSON.stringify(CZ.perfilDoBloco(decodeURIComponent("'+encodeURIComponent('{"objetivo":"forca","local":"quarto","exp":"pouco","dias":"4","tempo":"20","limit":"nenhum"}')+'"),null))');
   console.log('perfilDoBloco via w.eval:',r&&r.slice(0,80));
  }catch(e){console.log('w.eval falhou:',e.message)}
 }
})();
