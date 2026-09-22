/* suíte do IA Coach v2.7 — core puro + DOM (jsdom) */
'use strict';
(async()=>{
const fs=require('fs'),path=require('path');
let P=0,F=0;const FALHAS=[];
function ok(c,n){if(c){P++;console.log('  \u2713 '+n)}else{F++;FALHAS.push(n);console.log('  \u2717 FALHOU: '+n)}}
function secao(t){console.log('\n\u2500\u2500 '+t+' \u2500\u2500')}
const HTML=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');

/* \u2550\u2550\u2550 1. CORE puro \u2550\u2550\u2550 */
secao('CORE: extra\u00e7\u00e3o e datas');
const corpoCZ=HTML.split('const CZ={')[1].split('};\n/*CZ-END*/')[0];
ok(corpoCZ.length>2000,'CZ extra\u00eddo do index.html');
(0,eval)('var CZ={'+corpoCZ+'}');
const hoje=CZ.hojeISO();
ok(/^\d{4}-\d{2}-\d{2}$/.test(hoje),'hojeISO formato ISO');
ok(CZ.isoMenos(1)<hoje,'isoMenos(1) \u00e9 ontem');

secao('CORE: perfil do bloco plano (IA)');
const blocoBom='blabla ```plano\n{"objetivo":"forca|saude","local":"quarto","exp":"pouco","dias":"4","tempo":"20","limit":"joelho"}\n``` fim';
const rB=CZ.perfilDoBloco(blocoBom,null);
ok(!!rB,'bloco plano v\u00e1lido \u00e9 aceito');
ok(rB.perfil.objetivo==='forca|saude','objetivo combinado ok');
ok(rB.perfil.limit==='joelho','limita\u00e7\u00e3o ok');
ok(rB.perfil.nomes.apelido==='champ','apelido padr\u00e3o quando novo');
ok(Array.isArray(rB.plano.dias)&&rB.plano.dias.length===7,'plano gerado com 7 dias');
ok(CZ.perfilDoBloco('```plano\n{"objetivo":"forca","local":"marte","exp":"pouco","dias":"4","tempo":"20"}\n```',null)===null,'local inv\u00e1lido rejeita');
ok(CZ.perfilDoBloco('sem bloco aqui',null)===null,'sem bloco \u2192 null');
ok(CZ.perfilDoBloco('```plano\n{quebrado!!}\n```',null)===null,'JSON quebrado \u2192 null');
const antigo={v:2,nomes:{apelido:'L\u00f4',coach:'Capit\u00e3o'},rotina:'manh\u00e3 cheia',criado:'2026-01-01'};
const rA=CZ.perfilDoBloco('```plano\n{"objetivo":"resis","local":"academia","exp":"meses","dias":"5","tempo":"40","limit":"nenhum"}\n```',antigo);
ok(rA.perfil.nomes.apelido==='L\u00f4'&&rA.perfil.nomes.coach==='Capit\u00e3o','nomes existentes preservados');
ok(rA.perfil.rotina==='manh\u00e3 cheia','rotina preservada');
ok(rA.perfil.tier==='meses','tier por experi\u00eancia');

secao('CORE: timers');
ok(CZ.comSeg(60)===65,'comSeg: 60s \u2192 65s (+5 prepara\u00e7\u00e3o)');
ok(CZ.comSeg(1)===6,'comSeg: m\u00ednimo 1s \u2192 6s');
ok(CZ.fmtTimer(65000)==='1:05','fmtTimer 1:05');
ok(CZ.fmtTimer(-1)==='0:00','fmtTimer negativo \u2192 0:00');
ok(!!CZ.validaTimer({nome:'Tabata',seg:30}),'timer v\u00e1lido');
ok(CZ.validaTimer({nome:'',seg:30})===null,'sem nome rejeita');
ok(CZ.validaTimer({nome:'X',seg:0})===null,'seg 0 rejeita');
ok(CZ.validaTimer({nome:'X',seg:99999})===null,'seg acima de 7200 rejeita');
const tm=CZ.validaTimer({nome:'Prancha',mmss:'1:05'});
ok(!!tm&&tm.seg===65,'mmss 1:05 \u2192 65s');
ok(CZ.timersDoBloco('```timers\n[{"nome":"A","seg":30},{"nome":"B","seg":15}]\n```').length===2,'bloco com 2 timers');
ok(CZ.timersDoBloco('```timers\n[{"nome":"","seg":30}]\n```')===null,'s\u00f3 inv\u00e1lidos \u2192 null');
ok(CZ.timersDoBloco('nada')===null,'sem bloco \u2192 null');
let l=CZ.timerUpsert([{nome:'Tabata',seg:30}],{nome:'Tabata',seg:45});
ok(l.length===1&&l[0].seg===45,'upsert substitui mesmo nome (modificar)');
l=CZ.timerUpsert(l,{nome:'Extra',seg:10});
ok(l.length===2,'upsert adiciona novo');
ok(CZ.TIM_PRESETS.length===5&&CZ.TIM_PRESETS.every(t=>CZ.validaTimer(t)),'5 presets v\u00e1lidos');

secao('CORE: plano/ciclo/renova\u00e7\u00e3o (n\u00e3o-regress\u00e3o)');
const perfil={v:2,objetivo:'forca',local:'quarto',exp:'pouco',dias:'4',tempo:'20',limit:'nenhum',nomes:{apelido:'L\u00f4',coach:'Capit\u00e3o'},criado:hoje,cicloIni:hoje,tier:'pouco'};
const pl=CZ.criarPlano(perfil);
ok(pl.dias.filter(d=>d.foco!=='livre'&&d.foco!=='descanso').length===4,'4 dias de treino na semana 4x');
ok(pl.dias[0].foco==='descanso','segunda \u00e9 descanso (semana come\u00e7a na segunda)');
const pl10=CZ.criarPlano(Object.assign({},perfil,{tempo:'10'}));
ok(pl10.dias.find(d=>d.foco==='A').acoes.filter(a=>a.t.indexOf('Rodadas')<0).length===3,'sess\u00e3o 10min corta pra 3 exerc\u00edcios');
const plVar=CZ.criarPlano(perfil,1);
const A1=pl.dias.find(d=>d.foco==='A'||d.foco==='B'),A2=plVar.dias.find(d=>d.foco==='A'||d.foco==='B');
ok(A1.foco!==A2.foco,'varia\u00e7\u00e3o alterna A/B');
ok(CZ.nomeDe(CZ.CIRC.A[0],'meses','nenhum').indexOf('20-25')>0,'volume por tier');
ok(CZ.nomeDe(CZ.CIRC.A[3],'pouco','joelho').indexOf('Marcha parada')>=0,'substitui\u00e7\u00e3o de joelho');
const log={};CZ.checkin(pl,log,hoje,0,true);CZ.checkin(pl,log,hoje,1,true);
ok(CZ.fezAlgo(log[hoje]),'checkin marca');
ok(CZ.streak(log,hoje)===1,'streak 1 com hoje feito');
CZ.registrarComo(log,hoje,'leve');
ok(CZ.feedbacks(log).includes('leve'),'feedback registrado');
ok(CZ.balanco(log,pl,hoje).tot>0,'balan\u00e7o calcula');
ok(CZ.ajustarPlano(pl,'evoluir').tier==='meses','evoluir sobe degrau');
ok(CZ.ajustarPlano(pl,'encolher').tier==='zero','encolher desce degrau');
const pv=Object.assign({},perfil,{cicloIni:CZ.isoMenos(25),cicloSemanas:3});
ok(CZ.ciclo(pv,pl).renovar,'ciclo fechado detecta renova\u00e7\u00e3o');
ok(CZ.renovarPlano(pv,pl,log,2).plano.semanas===2,'renova\u00e7\u00e3o aplica semanas');
ok(!!CZ.wizResp()&&CZ.wizCompleto({objetivo:['peso'],local:'quarto',exp:'zero',dias:'3',tempo:'10',limit:['nenhum'],nomes:{apelido:'B'}}),'wizard helpers ok');

/* \u2550\u2550\u2550 2. DOM \u2550\u2550\u2550 */
secao('DOM: chat-direto + cadeado (libera geral depois)');
const {JSDOM}=require('jsdom');
const dom=new JSDOM(HTML,{runScripts:'dangerously',url:'https://lucasgabrieldevgg.github.io/coach/',pretendToBeVisual:true});
const w=dom.window,d=w.document;
const tick=(ms)=>new Promise(r=>setTimeout(r,ms||60));
const $=(s)=>d.querySelector(s);
const $$=(s)=>d.querySelectorAll(s);
const MOCKS=[];
w.fetch=async()=>{const c=MOCKS.shift()||'ok';return {ok:true,json:async()=>({choices:[{message:{content:c}}]})}};
w.addEventListener('error',e=>console.log('  [window error]',e.message));
await tick(150);
ok($('#v-chat').hidden===false,'boot sem plano \u2192 CHAT direto');
ok($('#nav').hidden===false,'nav vis\u00edvel no chat');
ok($('#nav button[data-v="v-hoje"]').style.opacity==='0.45','Hoje com cadeado visual (opacidade)');
$('#nav button[data-v="v-hoje"]').click();await tick(120);
ok($('#v-chat').hidden===false&&$('#v-hoje').hidden===true,'clicar Hoje sem plano: segura e fica no chat');
const chips0=$$('#chipsx .chip');
ok(chips0.length===5,'5 chips (4 exemplos + question\u00e1rio) sem plano');
ok(!!$('#chipsx [data-ex="q"]'),'chip do question\u00e1rio existe');
ok($('#chatlog').textContent.indexOf('te solto no app inteiro')>=0,'sauda\u00e7\u00e3o promete liberar geral');

secao('DOM: question\u00e1rio via chip \u2192 plano \u2192 LIBERA GERAL');
$('#chipsx [data-ex="q"]').click();await tick(120);
ok($('#v-wizard').hidden===false,'chip abre o wizard');
for(let passos=0;passos<12;passos++){
  const corpo=$('#w-corpo');
  const areas=corpo.querySelectorAll('.area');
  const qTxt=(corpo.querySelector('h1')||{textContent:''}).textContent;
  const multi=(qTxt.indexOf('objetivo')>=0||qTxt.indexOf('limitação')>=0);
  const texto=(corpo.querySelector('textarea')!==null),nomes=(corpo.querySelector('#wz-ap')!==null);
  if(areas.length){
    areas[0].click();await tick(60);
    if(multi){corpo.querySelectorAll('.area')[1].click();await tick(60);$('#w-avancar').click();await tick(90)}
    else await tick(220);
  }else if(texto){
    const ta=corpo.querySelector('textarea');ta.value='semana normal';ta.dispatchEvent(new w.Event('input',{bubbles:true}));
    $('#w-avancar').click();await tick(90);
  }else if(nomes){
    const ap2=corpo.querySelector('#wz-ap'),co=corpo.querySelector('#wz-co');
    ap2.value='Teste';ap2.dispatchEvent(new w.Event('input',{bubbles:true}));
    co.value='Capit\u00e3o';co.dispatchEvent(new w.Event('input',{bubbles:true}));
    $('#w-avancar').click();await tick(90);
  }
  if($('#v-hoje').hidden===false)break;
}
await tick(150);
ok($('#v-hoje').hidden===false,'wizard completo \u2192 aba Hoje');
ok($('#nav button[data-v="v-hoje"]').style.opacity==='','LIBERADO: cadeado sumiu do nav');
ok(!!w.localStorage.getItem('coach_plano'),'plano do wizard salvo');
$('#v-hoje').querySelector('.acao').click();await tick(120);
ok(JSON.parse(w.localStorage.getItem('coach_log'))[CZ.hojeISO()].feitas[0]===true,'checkin no Hoje');
d.querySelector('#nav button[data-v="v-prog"]').click();await tick(120);
ok($('#v-prog').textContent.indexOf('Ofensiva')>=0,'Progresso renderiza liberado');
d.querySelector('#nav button[data-v="v-plano"]').click();await tick(120);
$('#v-plano').querySelector('[data-aj="encolher"]').click();await tick(120);
ok(JSON.parse(w.localStorage.getItem('coach_plano')).tier==='zero','encolher carga na aba Plano');
ok($$('#nav button').length===6,'nav com 6 abas');
ok($('#nav button[data-v="v-timer"]').textContent.indexOf('Timers')>=0,'aba Timers no nav');

secao('DOM: apagar tudo \u2192 chat de novo + cadeado volta');
d.querySelector('#nav button[data-v="v-config"]').click();await tick(120);
$('#cf-apagar').click();await tick(80);$('#cf-apagar').click();await tick(150);
ok($('#v-chat').hidden===false,'apagar tudo volta pro CHAT');
ok(!w.localStorage.getItem('coach_timers'),'apagar tudo inclui timers');
$('#nav button[data-v="v-plano"]').click();await tick(120);
ok($('#v-chat').hidden===false&&$('#v-plano').hidden===true,'cadeado de novo sem plano');

secao('DOM: chat monta o plano (bloco da IA)');
MOCKS.push('Fechamos! ```plano\n{"objetivo":"forca","local":"quarto","exp":"pouco","dias":"4","tempo":"20","limit":"nenhum","apelido":"L\u00f4","coach":"Capit\u00e3o"}\n```');
$('#chatin').value='quero treinar em casa';
$('#b-enviar').click();await tick(400);
const ap=$('#chatlog').querySelector('[data-ap="plano"]');
ok(!!ap,'card "usar este plano" aparece no chat');
ap.click();await tick(150);
ok($('#v-plano').hidden===false,'aplicar leva pra aba Plano (liberado)');
const pj=JSON.parse(w.localStorage.getItem('coach_plano'));
ok(pj.diasSemana==='4'&&pj.dias.length===7,'plano do bloco gerado pelo motor da casa');
const pfj=JSON.parse(w.localStorage.getItem('coach_perfil'));
ok(pfj.nomes.apelido==='L\u00f4'&&pfj.nomes.coach==='Capit\u00e3o','perfil com nomes do bloco');
ok(!!w.localStorage.getItem('coach_log'),'log zerado no primeiro plano');

secao('DOM: chat remonta o plano (modifica, preserva hist\u00f3rico)');
const lg2=CZ.checkin(pj,JSON.parse(w.localStorage.getItem('coach_log')),CZ.hojeISO(),0,true);
w.localStorage.setItem('coach_log',JSON.stringify(lg2));
d.querySelector('#nav button[data-v="v-chat"]').click();await tick(120);
MOCKS.push('Bora! ```plano\n{"objetivo":"resis","local":"parque","exp":"pouco","dias":"5","tempo":"40","limit":"nenhum"}\n```');
$('#chatin').value='agora treino no parque, 5 dias';
$('#b-enviar').click();await tick(400);
const bots2=$$('#chatlog [data-ap="plano"]');
bots2[bots2.length-1].click();await tick(150);
const pj2=JSON.parse(w.localStorage.getItem('coach_plano'));
ok(pj2.versao===2&&pj2.nota==='plano remontado na conversa \ud83d\udcac','remontagem versiona o plano');
ok(pj2.local==='parque'&&pj2.diasSemana==='5','remontagem muda local/dias');
ok(CZ.fezAlgo(JSON.parse(w.localStorage.getItem('coach_log'))[CZ.hojeISO()]),'hist\u00f3rico PRESERVADO');
d.querySelector('#nav button[data-v="v-chat"]').click();await tick(120);
const botsAntes=$$('#chatlog [data-ap="plano"]').length;
MOCKS.push('ops ```plano\n{"objetivo":"forca","local":"marte","exp":"pouco","dias":"4","tempo":"20"}\n```');
$('#chatin').value='muda pra marte';
$('#b-enviar').click();await tick(400);
const bots3=$$('#chatlog [data-ap="plano"]');
ok(bots3.length===botsAntes+1,'bloco inválido vira card (o APP quem barra no clique)');
bots3[bots3.length-1].click();await tick(150);
ok($('#v-chat').hidden===false,'plano inválido: clique seguro, segue no chat');
ok(JSON.parse(w.localStorage.getItem('coach_plano')).local==='parque','plano leg\u00edtimo intacto');

secao('DOM: IA cria timers + EDITAR + excluir');
MOCKS.push('Fechou! ```timers\n[{"nome":"Tabata","seg":30},{"nome":"Descanso tabata","seg":15}]\n```');
$('#chatin').value='cria 2 timers: tabata 30s e descanso 15s';
$('#b-enviar').click();await tick(400);
const bt=$('#chatlog').querySelector('[data-ap="timers"]');
ok(!!bt,'card "adicionar ao rel\u00f3gio" aparece');
bt.click();await tick(150);
ok($('#v-timer').hidden===false,'leva pra aba Timers');
let tj=JSON.parse(w.localStorage.getItem('coach_timers'));
ok(tj.length===2&&tj[0].nome==='Tabata'&&tj[0].seg===30,'2 timers criados pela IA');
ok($('#v-timer').textContent.indexOf('5s extras de prepara\u00e7\u00e3o')>=0,'aviso dos 5s na tela');
ok($$('#v-timer [data-src="p"]').length===5,'5 presets');
d.querySelector('#nav button[data-v="v-chat"]').click();await tick(120);
MOCKS.push('Ajustado! ```timers\n[{"nome":"Tabata","seg":45}]\n```');
$('#chatin').value='tabata com 45s';
$('#b-enviar').click();await tick(400);
const bt2=$$('#chatlog [data-ap="timers"]');
bt2[bt2.length-1].click();await tick(150);
tj=JSON.parse(w.localStorage.getItem('coach_timers'));
ok(tj.length===2&&tj.find(t=>t.nome==='Tabata').seg===45,'IA MODIFICOU timer existente');
$('#tn-nome').value='Edit\u00e1vel';$('#tn-min').value='0';$('#tn-seg').value='20';
$('#tn-add').click();await tick(120);
ok(JSON.parse(w.localStorage.getItem('coach_timers')).length===3,'manual criado (3 meus)');
const edits=$$('#v-timer [data-edi]');
ok(edits.length===3,'cada timer meu tem \u270f\ufe0f editar');
edits[2].click();await tick(120);
ok($('#tn-nome').value==='Edit\u00e1vel'&&$('#tn-min').value==='0'&&$('#tn-seg').value==='20','editar carrega os valores');
ok($('#tn-add').textContent==='💾 salvar','bot\u00e3o vira salvar');
$('#tn-nome').value='Editado';$('#tn-min').value='0';$('#tn-seg').value='45';
$('#tn-add').click();await tick(120);
tj=JSON.parse(w.localStorage.getItem('coach_timers'));
ok(tj.length===3&&tj.find(t=>t.nome==='Editado').seg===45&&!tj.find(t=>t.nome==='Edit\u00e1vel'),'EDITADO: mesmo slot, nome e tempo novos');
const dels=$$('#v-timer [data-del]');
ok(dels.length===3,'excluir \ud83d\uddd1 segue a\u00ed');
dels[2].click();await tick(120);
ok(JSON.parse(w.localStorage.getItem('coach_timers')).length===2,'exclus\u00e3o funciona');

secao('DOM: \u2753 como faz? leva pro chat com a pergunta pronta');
d.querySelector('#nav button[data-v="v-hoje"]').click();await tick(120);
const cf=$('#v-hoje').querySelector('[data-exq]');
ok(!!cf,'bot\u00e3o "\u2753 como faz?" existe no exerc\u00edcio');
MOCKS.push('Agachamento: p\u00e9s na largura dos ombros, desce devagar... procura "agachamento livre" no YouTube pra ver o movimento!');
cf.click();
ok($('#v-chat').hidden===false,'como faz abre o chat');
await tick(400);
ok($('#chatlog').textContent.indexOf('como faz:')>=0,'pergunta "como faz: ..." foi pro chat');
await tick(400);
ok($('#chatlog').textContent.indexOf('YouTube')>=0,'coach respondeu e sugeriu YouTube');

secao('DOM: ciclo do timer (PREPARA \u2192 VALENDO \u2192 FIM)');
d.querySelector('#nav button[data-v="v-timer"]').click();await tick(120);
$('#tn-nome').value='Raio';$('#tn-min').value='0';$('#tn-seg').value='1';
$('#tn-add').click();await tick(120);
const meusT=$$('#v-timer [data-src="m"]');
meusT[meusT.length-1].click();await tick(120);
ok($('#tfase').textContent==='PREPARA\u2026','fase inicial: PREPARA\u2026');
ok($('#tnum').textContent==='0:05','display come\u00e7a nos 5s');
await tick(5400);
ok($('#tfase').textContent==='VALENDO','ap\u00f3s 5s: VALENDO');
await tick(1700);
ok($('#tfase').textContent==='FIM!','no fim: FIM!');
ok($('#t-zap').textContent==='fechar','bot\u00e3o vira "fechar"');
$('#t-zap').click();await tick(120);
ok(!$('#v-timer').querySelector('#tnum'),'fechar volta pra lista');

console.log('\n\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550');
console.log('RESULTADO: '+P+' \u2713 / '+F+' \u2717'+(F?(' \u2192 '+FALHAS.join(' | ')):' \u2014 SU\u00cdTE INTEIRA PASSOU \ud83e\ud74a'));
process.exit(F?1:0);
})().catch(e=>{console.error('CRASH:',e&&e.message);process.exit(1)});
