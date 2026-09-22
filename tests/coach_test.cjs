/* suíte do IA Coach v3.0 — fluxo: homepage → perguntas NO CHAT → libera; links no 🗺️ */
'use strict';
(async()=>{
const fs=require('fs'),path=require('path');
let P=0,F=0;const FALHAS=[];
function ok(c,n){if(c){P++;console.log('  ✓ '+n)}else{F++;FALHAS.push(n);console.log('  ✗ FALHOU: '+n)}}
function secao(t){console.log('\n── '+t+' ──')}
const HTML=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');

/* ═══ CORE puro ═══ */
secao('CORE: extração e datas');
const corpoCZ=HTML.split('const CZ={')[1].split('};\n/*CZ-END*/')[0];
ok(corpoCZ.length>2000,'CZ extraído do index.html');
(0,eval)('var CZ={'+corpoCZ+'}');
const hoje=CZ.hojeISO();
ok(/^\d{4}-\d{2}-\d{2}$/.test(hoje),'hojeISO formato ISO');
ok(CZ.isoMenos(1)<hoje,'isoMenos(1) é ontem');

secao('CORE: perfil do bloco plano (IA)');
const rB=CZ.perfilDoBloco('x ```plano\n{"objetivo":"forca|saude","local":"quarto","exp":"pouco","dias":"4","tempo":"20","limit":"joelho"}\n``` y',null);
ok(!!rB,'bloco plano válido é aceito');
ok(rB.perfil.objetivo==='forca|saude','objetivo combinado ok');
ok(rB.perfil.limit==='joelho','limitação ok');
ok(rB.perfil.nomes.apelido==='champ','apelido padrão quando novo');
ok(Array.isArray(rB.plano.dias)&&rB.plano.dias.length===7,'plano gerado com 7 dias');
ok(CZ.perfilDoBloco('```plano\n{"objetivo":"forca","local":"marte","exp":"pouco","dias":"4","tempo":"20"}\n```',null)===null,'local inválido rejeita');
ok(CZ.perfilDoBloco('sem bloco aqui',null)===null,'sem bloco → null');
ok(CZ.perfilDoBloco('```plano\n{quebrado!!}\n```',null)===null,'JSON quebrado → null');
const antigo={v:2,nomes:{apelido:'Lô',coach:'Capitão'},rotina:'manhã cheia',criado:'2026-01-01'};
const rA=CZ.perfilDoBloco('```plano\n{"objetivo":"resis","local":"academia","exp":"meses","dias":"5","tempo":"40","limit":"nenhum"}\n```',antigo);
ok(rA.perfil.nomes.apelido==='Lô'&&rA.perfil.nomes.coach==='Capitão','nomes existentes preservados');
ok(rA.perfil.rotina==='manhã cheia','rotina preservada');
ok(rA.perfil.tier==='meses','tier por experiência');

secao('CORE: timers');
ok(CZ.comSeg(60)===65,'comSeg: 60s → 65s (+5 preparação)');
ok(CZ.comSeg(1)===6,'comSeg: mínimo 1s → 6s');
ok(CZ.fmtTimer(65000)==='1:05','fmtTimer 1:05');
ok(CZ.fmtTimer(-1)==='0:00','fmtTimer negativo → 0:00');
ok(!!CZ.validaTimer({nome:'Tabata',seg:30}),'timer válido');
ok(CZ.validaTimer({nome:'',seg:30})===null,'sem nome rejeita');
ok(CZ.validaTimer({nome:'X',seg:0})===null,'seg 0 rejeita');
ok(CZ.validaTimer({nome:'X',seg:99999})===null,'seg acima de 7200 rejeita');
const tm=CZ.validaTimer({nome:'Prancha',mmss:'1:05'});
ok(!!tm&&tm.seg===65,'mmss 1:05 → 65s');
ok(CZ.timersDoBloco('```timers\n[{"nome":"A","seg":30},{"nome":"B","seg":15}]\n```').length===2,'bloco com 2 timers');
ok(CZ.timersDoBloco('```timers\n[{"nome":"","seg":30}]\n```')===null,'só inválidos → null');
ok(CZ.timersDoBloco('nada')===null,'sem bloco → null');
let l=CZ.timerUpsert([{nome:'Tabata',seg:30}],{nome:'Tabata',seg:45});
ok(l.length===1&&l[0].seg===45,'upsert substitui mesmo nome (modificar)');
l=CZ.timerUpsert(l,{nome:'Extra',seg:10});
ok(l.length===2,'upsert adiciona novo');
ok(CZ.TIM_PRESETS.length===5&&CZ.TIM_PRESETS.every(t=>CZ.validaTimer(t)),'5 presets válidos');

secao('CORE: plano/ciclo/renovação (não-regressão)');
const perfil={v:2,objetivo:'forca',local:'quarto',exp:'pouco',dias:'4',tempo:'20',limit:'nenhum',nomes:{apelido:'Lô',coach:'Capitão'},criado:hoje,cicloIni:hoje,tier:'pouco'};
const pl=CZ.criarPlano(perfil);
ok(pl.dias.filter(d=>d.foco!=='livre'&&d.foco!=='descanso').length===4,'4 dias de treino na semana 4x');
ok(pl.dias[0].foco==='descanso','segunda é descanso');
const pl10=CZ.criarPlano(Object.assign({},perfil,{tempo:'10'}));
ok(pl10.dias.find(d=>d.foco==='A').acoes.filter(a=>a.t.indexOf('Rodadas')<0).length===3,'sessão 10min corta pra 3 exercícios');
const plVar=CZ.criarPlano(perfil,1);
const A1=pl.dias.find(d=>d.foco==='A'||d.foco==='B'),A2=plVar.dias.find(d=>d.foco==='A'||d.foco==='B');
ok(A1.foco!==A2.foco,'variação alterna A/B');
ok(CZ.nomeDe(CZ.CIRC.A[0],'meses','nenhum').indexOf('20-25')>0,'volume por tier');
ok(CZ.nomeDe(CZ.CIRC.A[3],'pouco','joelho').indexOf('Marcha parada')>=0,'substituição de joelho');
const log={};CZ.checkin(pl,log,hoje,0,true);CZ.checkin(pl,log,hoje,1,true);
ok(CZ.fezAlgo(log[hoje]),'checkin marca');
ok(CZ.streak(log,hoje)===1,'streak 1 com hoje feito');
CZ.registrarComo(log,hoje,'leve');
ok(CZ.feedbacks(log).includes('leve'),'feedback registrado');
ok(CZ.balanco(log,pl,hoje).tot>0,'balanço calcula');
ok(CZ.ajustarPlano(pl,'evoluir').tier==='meses','evoluir sobe degrau');
ok(CZ.ajustarPlano(pl,'encolher').tier==='zero','encolher desce degrau');
const pv=Object.assign({},perfil,{cicloIni:CZ.isoMenos(25),cicloSemanas:3});
ok(CZ.ciclo(pv,pl).renovar,'ciclo fechado detecta renovação');
ok(CZ.renovarPlano(pv,pl,log,2).plano.semanas===2,'renovação aplica semanas');
ok(!!CZ.wizResp()&&CZ.wizCompleto({objetivo:['peso'],local:'quarto',exp:'zero',dias:'3',tempo:'10',limit:['nenhum'],nomes:{apelido:'B'}}),'wizard helpers ok');

/* ═══ DOM: fluxo novo ═══ */
secao('DOM: HOMEPAGE primeiro');
const {JSDOM}=require('jsdom');
const dom=new JSDOM(HTML,{runScripts:'dangerously',url:'https://lucasgabrieldevgg.github.io/coach/',pretendToBeVisual:true});
const w=dom.window,d=w.document;
const tick=(ms)=>new Promise(r=>setTimeout(r,ms||60));
const $=(s)=>d.querySelector(s);
const $$=(s)=>Array.from(d.querySelectorAll(s));
const MOCKS=[];
w.fetch=async()=>{const c=MOCKS.shift()||'ok';return {ok:true,json:async()=>({choices:[{message:{content:c}}]})}};
w.addEventListener('error',e=>console.log('  [window error]',e.message));
await tick(150);
ok($('#v-start').hidden===false,'boot sem plano → HOMEPAGE');
ok($('#nav').hidden===true,'nav escondida na homepage');
ok($('#b-comecar').textContent.indexOf('8 perguntas')>=0,'caminho principal: 8 perguntas');
ok(!!$('#b-falar'),'alternativa: conversar com o coach');

secao('DOM: b-começar → CHAT com as perguntas do coach');
$('#b-comecar').click();await tick(150);
ok($('#v-chat').hidden===false,'b-começar abre O CHAT');
const ult0=$$('#chatlog .msg.ia').pop();
ok($$('#chatlog .msg.ia').some(b=>b.textContent.indexOf('te perguntando aqui mesmo')>=0),'saudação promete perguntas uma de cada vez');
ok(!!$('#chatquiz')&&!$('#chatquiz').hidden,'área de resposta do quiz visível');
ok($$('#chatquiz .chip').length===4&&!!$('#chatquiz #qz-ok'),'pergunta 1 (objetivo) com chips multi + pronto');
ok($('#chipsx').hidden===true,'exemplos escondidos durante o quiz');

secao('DOM: as 8 perguntas — o coach pergunta, o usuário responde');
for(let passo=0;passo<10;passo++){
  if(!$('#chatquiz')||$('#chatquiz').hidden)break;
  const texto=($$('#chatlog .msg.ia').pop()||{textContent:''}).textContent;
  const qz=$('#chatquiz');
  if(texto.indexOf('objetivo agora')>=0){
    qz.querySelectorAll('[data-qz]')[0].click();await tick(60);
    $('#chatquiz').querySelectorAll('[data-qz]')[1].click();await tick(60);
    $('#chatquiz #qz-ok').click();await tick(120);
  }else if(texto.indexOf('Onde você vai treinar')>=0){
    $('#chatquiz').querySelectorAll('[data-qz]')[1].click();await tick(220);
  }else if(texto.indexOf('experiência com treino')>=0){
    $('#chatquiz').querySelectorAll('[data-qz]')[1].click();await tick(220);
  }else if(texto.indexOf('dias por semana')>=0){
    $('#chatquiz').querySelectorAll('[data-qz]')[1].click();await tick(220);
  }else if(texto.indexOf('tempo por sessão')>=0){
    $('#chatquiz').querySelectorAll('[data-qz]')[1].click();await tick(220);
  }else if(texto.indexOf('limitação física')>=0){
    $('#chatquiz').querySelectorAll('[data-qz]')[0].click();await tick(60);
    $('#chatquiz #qz-ok').click();await tick(120);
  }else if(texto.indexOf('Como é tua semana')>=0){
    $('#chatquiz #qz-txt').value='manhã cheia, tarde livre';
    $('#chatquiz #qz-ok').click();await tick(120);
  }else if(texto.indexOf('Última coisa')>=0){
    $('#chatquiz #qz-ap').value='Teste';
    $('#chatquiz #qz-co').value='Capitão';
    $('#chatquiz #qz-ok').click();await tick(200);
  }else{await tick(200)}
}
await tick(150);
const pj=JSON.parse(w.localStorage.getItem('coach_plano'));
ok(!!pj,'quiz completo → plano criado');
const pfj=JSON.parse(w.localStorage.getItem('coach_perfil'));
ok(pfj.nomes.apelido==='Teste'&&pfj.nomes.coach==='Capitão','nomes das respostas no perfil');
ok(pfj.local==='casa'&&pfj.dias==='4'&&pfj.tempo==='20','respostas das opções no perfil');
ok(pfj.rotina==='manhã cheia, tarde livre','rotina salva');
ok(w.localStorage.getItem('coach_quiz')===null,'quiz limpo do storage ao finalizar');
const ultF=$$('#chatlog .msg.ia').pop();
ok(ultF.textContent.indexOf('Plano fechado, Teste!')>=0,'coach anuncia o plano pelo nome');
ok(ultF.textContent.indexOf('destravaram')>=0,'avisa que liberou geral');
ok($$('#chatlog .msg.ia a').length===0,'SEM parede de links no chat');
const ecos=$$('#chatlog .msg.eu');
ok(ecos.length===8&&ecos[0].textContent.indexOf('Perder peso')>=0,'8 respostas viram bolhas do usuário (eco fiel)');
ok($('#chatquiz').hidden===true,'área de resposta do quiz recolhida');

secao('DOM: LIBERADO + links NA ABA PLANO (cada treino no seu lugar)');
ok($('#nav button[data-v="v-hoje"]').style.opacity==='','LIBERADO: sem cadeado no nav');
$('#nav button[data-v="v-hoje"]').click();await tick(120);
$('#v-hoje').querySelector('.acao').click();await tick(120);
ok(JSON.parse(w.localStorage.getItem('coach_log'))[CZ.hojeISO()].feitas[0]===true,'checkin no Hoje');
$('#nav button[data-v="v-plano"]').click();await tick(120);
ok($('#v-plano').textContent.indexOf('abre o YouTube com a busca pronta')>=0,'aba Plano explica os links');
const linksPl=$$('#v-plano table.pl a[href*="youtube.com/results"]');
ok(linksPl.length>=8,'cada exercício da semana linkado ('+linksPl.length+' links)');
ok(decodeURIComponent(linksPl[0].href).indexOf('Agachamento')>=0,'busca com o nome do treino');
ok($$('#v-plano table.pl a a').length===0,'sem link aninhado no plano');
$('#v-plano').querySelector('[data-aj="encolher"]').click();await tick(120);
ok(JSON.parse(w.localStorage.getItem('coach_plano')).tier==='zero','encolher carga segue de pé');
d.querySelector('#nav button[data-v="v-prog"]').click();await tick(120);
ok($('#v-prog').textContent.indexOf('Ofensiva')>=0,'Progresso renderiza');
ok($$('#nav button').length===6,'nav com 6 abas');

secao('DOM: IA remonta pelo papo (histórico preservado, links continuam no 🗺️)');
const lg2=CZ.checkin(JSON.parse(w.localStorage.getItem('coach_plano')),JSON.parse(w.localStorage.getItem('coach_log')),CZ.hojeISO(),1,true);
w.localStorage.setItem('coach_log',JSON.stringify(lg2));
d.querySelector('#nav button[data-v="v-chat"]').click();await tick(120);
MOCKS.push('Bora! ```plano\n{"objetivo":"resis","local":"parque","exp":"pouco","dias":"5","tempo":"40","limit":"nenhum"}\n```');
$('#chatin').value='agora treino no parque, 5 dias';
$('#b-enviar').click();await tick(400);
const bots2=$$('#chatlog [data-ap="plano"]');
ok(!!bots2.length,'card "usar este plano" aparece');
bots2[bots2.length-1].click();await tick(150);
const pj2=JSON.parse(w.localStorage.getItem('coach_plano'));
ok(pj2.versao>=2&&pj2.nota==='plano remontado na conversa 💬','remontagem versiona o plano (v'+pj2.versao+')');
ok(pj2.local==='parque'&&pj2.diasSemana==='5','remontagem muda local/dias');
ok(CZ.fezAlgo(JSON.parse(w.localStorage.getItem('coach_log'))[CZ.hojeISO()]),'histórico PRESERVADO');
ok($$('#v-chat .msg.ia a').length===0,'anúncio da remontagem também SEM links');
const bots3=$$('#chatlog [data-ap="plano"]');
MOCKS.push('ops ```plano\n{"objetivo":"forca","local":"marte","exp":"pouco","dias":"4","tempo":"20"}\n```');
$('#chatin').value='muda pra marte';
$('#b-enviar').click();await tick(400);
const bots4=$$('#chatlog [data-ap="plano"]');
ok(bots4.length===bots3.length+1,'bloco inválido vira card (o APP barra no clique)');
bots4[bots4.length-1].click();await tick(150);
ok($('#v-chat').hidden===false&&JSON.parse(w.localStorage.getItem('coach_plano')).local==='parque','clique seguro: plano legítimo intacto');

secao('DOM: IA cria timers + EDITAR + excluir');
MOCKS.push('Fechou! ```timers\n[{"nome":"Tabata","seg":30},{"nome":"Descanso tabata","seg":15}]\n```');
$('#chatin').value='cria 2 timers: tabata 30s e descanso 15s';
$('#b-enviar').click();await tick(400);
const bt=$('#chatlog').querySelector('[data-ap="timers"]');
ok(!!bt,'card "adicionar ao relógio" aparece');
bt.click();await tick(150);
ok($('#v-timer').hidden===false,'leva pra aba Timers');
let tj=JSON.parse(w.localStorage.getItem('coach_timers'));
ok(tj.length===2&&tj[0].nome==='Tabata'&&tj[0].seg===30,'2 timers criados pela IA');
ok($('#v-timer').textContent.indexOf('5s extras de preparação')>=0,'aviso dos 5s na aba');
ok($$('#v-timer [data-src="p"]').length===5,'5 presets');
d.querySelector('#nav button[data-v="v-chat"]').click();await tick(120);
MOCKS.push('Ajustado! ```timers\n[{"nome":"Tabata","seg":45}]\n```');
$('#chatin').value='tabata com 45s';
$('#b-enviar').click();await tick(400);
const bt2=$$('#chatlog [data-ap="timers"]');
bt2[bt2.length-1].click();await tick(150);
tj=JSON.parse(w.localStorage.getItem('coach_timers'));
ok(tj.length===2&&tj.find(t=>t.nome==='Tabata').seg===45,'IA MODIFICOU timer existente');
$('#tn-nome').value='Editável';$('#tn-min').value='0';$('#tn-seg').value='20';
$('#tn-add').click();await tick(120);
ok(JSON.parse(w.localStorage.getItem('coach_timers')).length===3,'manual criado');
const edits=$$('#v-timer [data-edi]');
ok(edits.length===3,'cada timer meu tem ✏️');
edits[2].click();await tick(120);
ok($('#tn-nome').value==='Editável'&&$('#tn-seg').value==='20','editar carrega os valores');
$('#tn-nome').value='Editado';$('#tn-min').value='0';$('#tn-seg').value='45';
$('#tn-add').click();await tick(120);
tj=JSON.parse(w.localStorage.getItem('coach_timers'));
ok(tj.length===3&&tj.find(t=>t.nome==='Editado').seg===45&&!tj.find(t=>t.nome==='Editável'),'EDITADO: mesmo slot, dados novos');
const dels=$$('#v-timer [data-del]');
dels[2].click();await tick(120);
ok(JSON.parse(w.localStorage.getItem('coach_timers')).length===2,'exclusão funciona');

secao('DOM: ❓ como faz? — coach explica SEM links (links moram no 🗺️)');
d.querySelector('#nav button[data-v="v-hoje"]').click();await tick(120);
const cf=$('#v-hoje').querySelector('[data-exq]');
ok(!!cf,'botão "❓ como faz?" existe no exercício');
MOCKS.push('Agachamento livre: pés na largura dos ombros, desce devagar com o joelho alinhado. Procura "agachamento livre" no YouTube pra ver o movimento!');
cf.click();
ok($('#v-chat').hidden===false,'como faz abre o chat');
await tick(400);
ok($('#chatlog').textContent.indexOf('como faz:')>=0,'pergunta pronta foi pro chat');
ok($('#chatlog').textContent.indexOf('YouTube')>=0,'coach indica o YouTube');
ok($$('#chatlog .msg.ia a').length===0,'e NÃO solta link no chat (link é no 🗺️)');

secao('DOM: ciclo do timer (PREPARA → VALENDO → FIM)');
d.querySelector('#nav button[data-v="v-timer"]').click();await tick(120);
$('#tn-nome').value='Raio';$('#tn-min').value='0';$('#tn-seg').value='1';
$('#tn-add').click();await tick(120);
const meusT=$$('#v-timer [data-src="m"]');
meusT[meusT.length-1].click();await tick(120);
ok($('#tfase').textContent==='PREPARA…','fase inicial: PREPARA…');
ok($('#tnum').textContent==='0:05','display começa nos 5s');
await tick(5400);
ok($('#tfase').textContent==='VALENDO','após 5s: VALENDO');
await tick(1700);
ok($('#tfase').textContent==='FIM!','no fim: FIM!');
$('#t-zap').click();await tick(120);
ok(!$('#v-timer').querySelector('#tnum'),'fechar volta pra lista');

secao('DOM: apagar tudo → homepage, quiz zerado');
d.querySelector('#nav button[data-v="v-config"]').click();await tick(120);
$('#cf-apagar').click();await tick(80);$('#cf-apagar').click();await tick(150);
ok($('#v-start').hidden===false,'apagar tudo volta pra HOMEPAGE');
ok(w.localStorage.getItem('coach_quiz')===null,'quiz zerado');
ok(!w.localStorage.getItem('coach_timers'),'timers zerados');

console.log('\n══════════════════════════');
console.log('RESULTADO: '+P+' ✓ / '+F+' ✗'+(F?(' → '+FALHAS.join(' | ')):' — SUÍTE INTEIRA PASSOU 🥊'));
process.exit(F?1:0);
})().catch(e=>{console.error('CRASH:',e&&e.message);process.exit(1)});
