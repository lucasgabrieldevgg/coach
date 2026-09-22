/* suíte do IA Coach v2.6 — core puro + DOM (jsdom) */
'use strict';
(async()=>{
const fs=require('fs'),path=require('path');
let P=0,F=0;const FALHAS=[];
function ok(c,n){if(c){P++;console.log('  ✓ '+n)}else{F++;FALHAS.push(n);console.log('  ✗ FALHOU: '+n)}}
function secao(t){console.log('\n── '+t+' ──')}
const HTML=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');

/* ════════ 1. CORE puro (CZ extraído do index.html) ════════ */
secao('CORE: extração e datas');
const corpoCZ=HTML.split('const CZ={')[1].split('};\n/*CZ-END*/')[0];
ok(corpoCZ.length>2000,'CZ extraído do index.html ('+corpoCZ.length+' chars)');
(0,eval)('var CZ={'+corpoCZ+'}');
ok(typeof CZ.criarPlano==='function','CZ disponível no escopo');
const hoje=CZ.hojeISO();
ok(/^\d{4}-\d{2}-\d{2}$/.test(hoje),'hojeISO formato ISO: '+hoje);
ok(CZ.isoMenos(1)<hoje,'isoMenos(1) é ontem');
ok(CZ.isoMenos(0)===hoje,'isoMenos(0) é hoje');

secao('CORE: perfil do bloco plano (IA)');
const blocoBom='blabla ```plano\n{"objetivo":"forca|saude","local":"quarto","exp":"pouco","dias":"4","tempo":"20","limit":"joelho"}\n``` fim';
const rB=CZ.perfilDoBloco(blocoBom,null);
ok(!!rB,'bloco plano válido é aceito');
ok(rB.perfil.objetivo==='forca|saude','objetivo combinado ok');
ok(rB.perfil.limit==='joelho','limitação ok');
ok(rB.perfil.nomes.apelido==='champ','apelido padrão quando novo');
ok(rB.perfil.nomes.coach==='Coach','coach padrão quando novo');
ok(rB.perfil.tier==='pouco','tier derivado da experiência');
ok(Array.isArray(rB.plano.dias)&&rB.plano.dias.length===7,'plano gerado com 7 dias');
ok(rB.plano.diasSemana==='4','plano carrega dias/semana');
const blocoMarte='```plano\n{"objetivo":"forca","local":"marte","exp":"pouco","dias":"4","tempo":"20"}\n```';
ok(CZ.perfilDoBloco(blocoMarte,null)===null,'local inválido rejeita o bloco');
ok(CZ.perfilDoBloco('sem bloco aqui',null)===null,'sem bloco → null');
ok(CZ.perfilDoBloco('```plano\n{quebrado!!}\n```',null)===null,'JSON quebrado → null');
const antigo={v:2,nomes:{apelido:'Lô',coach:'Capitão'},rotina:'manhã cheia',criado:'2026-01-01'};
const rA=CZ.perfilDoBloco('```plano\n{"objetivo":"resis","local":"academia","exp":"meses","dias":"5","tempo":"40","limit":"nenhum"}\n```',antigo);
ok(rA.perfil.nomes.apelido==='Lô'&&rA.perfil.nomes.coach==='Capitão','nomes existentes preservados');
ok(rA.perfil.rotina==='manhã cheia','rotina preservada na remontagem');
ok(rA.perfil.tier==='meses','tier por experiência (meses)');
ok(rA.perfil.criado==='2026-01-01','criado original preservado');

secao('CORE: timers');
ok(CZ.comSeg(60)===65,'comSeg: 60s → 65s (+5 de preparação)');
ok(CZ.comSeg(1)===6,'comSeg: mínimo 1s → 6s');
ok(CZ.fmtTimer(65000)==='1:05','fmtTimer 1:05');
ok(CZ.fmtTimer(5000)==='0:05','fmtTimer 0:05');
ok(CZ.fmtTimer(-1)==='0:00','fmtTimer negativo → 0:00');
const tv=CZ.validaTimer({nome:'Tabata',seg:30});
ok(!!tv&&tv.seg===30,'timer válido');
ok(CZ.validaTimer({nome:'',seg:30})===null,'sem nome rejeita');
ok(CZ.validaTimer({nome:'X',seg:0})===null,'seg 0 rejeita');
ok(CZ.validaTimer({nome:'X',seg:99999})===null,'seg acima de 7200 rejeita');
const tm=CZ.validaTimer({nome:'Prancha',mmss:'1:05'});
ok(!!tm&&tm.seg===65,'mmss 1:05 → 65s');
ok(CZ.timersDoBloco('a ```timers\n[{"nome":"Tabata","seg":30},{"nome":"Descanso","seg":15}]\n``` b').length===2,'bloco com 2 timers');
ok(CZ.timersDoBloco('```timers\n[{"nome":"","seg":30}]\n```')===null,'bloco só com timers inválidos → null');
ok(CZ.timersDoBloco('```timers\n{"nome":"sozinho"}\n```')===null,'não-array → null');
ok(CZ.timersDoBloco('nada')===null,'sem bloco timers → null');
let l=CZ.timerUpsert([{nome:'Tabata',seg:30}].slice(),{nome:'Tabata',seg:45});
ok(l.length===1&&l[0].seg===45,'upsert substitui timer de mesmo nome (modificar)');
l=CZ.timerUpsert(l,{nome:'Extra',seg:10});
ok(l.length===2,'upsert adiciona novo');
ok(CZ.TIM_PRESETS.length===5&&CZ.TIM_PRESETS.every(t=>CZ.validaTimer(t)),'5 presets todos válidos');

secao('CORE: plano/ciclo/renovação (não-regressão)');
const perfil={v:2,objetivo:'forca',local:'quarto',exp:'pouco',dias:'4',tempo:'20',limit:'nenhum',nomes:{apelido:'Lô',coach:'Capitão'},criado:hoje,cicloIni:hoje,tier:'pouco'};
const pl=CZ.criarPlano(perfil);
ok(pl.dias.filter(d=>d.foco!=='livre'&&d.foco!=='descanso').length===4,'4 dias de treino na semana 4x');
ok(pl.dias[0].foco==='descanso','segunda é descanso (semana começa na segunda)');
const pl10=CZ.criarPlano(Object.assign({},perfil,{tempo:'10'}));
const diaA=pl10.dias.find(d=>d.foco==='A');
ok(diaA.acoes.filter(a=>a.t.indexOf('Rodadas')<0).length===3,'sessão 10min corta pra 3 exercícios');
const plVar=CZ.criarPlano(perfil,1);
const A1=pl.dias.find(d=>d.foco==='A'||d.foco==='B'),A2=plVar.dias.find(d=>d.foco==='A'||d.foco==='B');
ok(A1.foco!==A2.foco,'variação alterna A/B ('+A1.foco+'→'+A2.foco+')');
ok(CZ.nomeDe(CZ.CIRC.A[0],'meses','nenhum').indexOf('20-25')>0,'volume por tier');
ok(CZ.nomeDe(CZ.CIRC.A[3],'pouco','joelho').indexOf('Marcha parada')>=0,'substituição de joelho');
const log={};CZ.checkin(pl,log,hoje,0,true);CZ.checkin(pl,log,hoje,1,true);
ok(CZ.fezAlgo(log[hoje]),'checkin marca');
ok(CZ.streak(log,hoje)===1,'streak 1 com hoje feito');
ok(CZ.streak(log,CZ.isoMenos(0))===1,'streak conta hoje');
CZ.registrarComo(log,hoje,'leve');
ok(CZ.feedbacks(log).includes('leve'),'feedback registrado');
const bal=CZ.balanco(log,pl,hoje);
ok(bal.tot>0&&typeof bal.pct==='number','balanço calcula');
const pl2=CZ.ajustarPlano(pl,'evoluir');
ok(pl2.tier==='meses'&&pl2.versao===2,'evoluir sobe degrau e versiona');
const pl3=CZ.ajustarPlano(pl,'encolher');
ok(pl3.tier==='zero','encolher desce degrau');
const perfilVelho=Object.assign({},perfil,{cicloIni:CZ.isoMenos(25),cicloSemanas:3});
const ciclo=CZ.ciclo(perfilVelho,pl);
ok(ciclo.n===2&&ciclo.renovar,'ciclo fechado detecta renovação');
const ren=CZ.renovarPlano(perfilVelho,pl,log,2);
ok(ren.plano.semanas===2&&ren.plano.cicloIni===hoje,'renovação aplica semanas novas');
ok(!!CZ.wizResp()&&typeof CZ.wizCompleto==='function','wizard helpers ok');
ok(CZ.wizCompleto({objetivo:['peso'],local:'quarto',exp:'zero',dias:'3',tempo:'10',limit:['nenhum'],nomes:{apelido:'B'}}),'wizCompleto aceita completo');
ok(!CZ.wizCompleto({objetivo:[],local:'quarto',exp:'zero',dias:'3',tempo:'10',limit:['nenhum'],nomes:{apelido:'B'}}),'wizCompleto recusa sem objetivo');

/* ════════ 2. DOM (jsdom) ════════ */
secao('DOM: preparando jsdom');
const {JSDOM}=require('jsdom');
const dom=new JSDOM(HTML,{runScripts:'dangerously',url:'https://lucasgabrieldevgg.github.io/coach/',pretendToBeVisual:true});
const w=dom.window,d=w.document;
const tick=(ms)=>new Promise(r=>setTimeout(r,ms||60));
const $=(s)=>d.querySelector(s);
const MOCKS=[];
w.fetch=async()=>{const c=MOCKS.shift()||'ok';return {ok:true,json:async()=>({choices:[{message:{content:c}}]})}};
await tick(150);
ok($('#v-start').hidden===false,'boot sem perfil → v-start');
ok($('#nav').hidden===true,'nav escondida no start');
ok(!!$('#b-falar'),'botão "conversar com o coach" existe no start');

secao('DOM: chat monta plano (bloco da IA)');
$('#b-falar').click();await tick(120);
ok($('#v-chat').hidden===false,'b-falar abre o chat');
ok($('#nav').hidden===false,'nav aparece no chat');
ok(!$('#chipsx').hidden,'chips de exemplo visíveis no início');
ok($('#chipsx').querySelectorAll('.chip').length===4,'4 exemplos clicáveis');
MOCKS.push('Fechei o contexto! ```plano\n{"objetivo":"forca","local":"quarto","exp":"pouco","dias":"4","tempo":"20","limit":"nenhum","apelido":"Lô","coach":"Capitão"}\n```');
$('#chatin').value='quero treinar em casa';
$('#b-enviar').click();await tick(300);
const ap=$('#chatlog').querySelector('[data-ap="plano"]');
ok(!!ap,'card "usar este plano" aparece no chat');
ap.click();await tick(150);
ok($('#v-plano').hidden===false,'aplicar plano leva pra aba Plano');
const p1=w.localStorage.getItem('coach_plano');
ok(!!p1,'plano salvo');
const pj=JSON.parse(p1);
ok(pj.diasSemana==='4'&&pj.dias.length===7,'plano do bloco gerado pelo motor da casa');
const pfj=JSON.parse(w.localStorage.getItem('coach_perfil'));
ok(pfj.nomes.apelido==='Lô'&&pfj.nomes.coach==='Capitão','perfil com nomes do bloco');
ok(!!w.localStorage.getItem('coach_log'),'log zerado no primeiro plano');

secao('DOM: chat remonta o plano (modifica aba Plano)');
const la=CZ.checkin(JSON.parse(p1),JSON.parse(w.localStorage.getItem('coach_log')),CZ.hojeISO(),0,true);
w.localStorage.setItem('coach_log',JSON.stringify(la));
const logAntes=JSON.parse(w.localStorage.getItem('coach_log'));
ok(CZ.fezAlgo(logAntes[CZ.hojeISO()]),'log com marcação antes da remontagem');
d.querySelector('#nav button[data-v="v-chat"]').click();await tick(120);
MOCKS.push('Bora! ```plano\n{"objetivo":"resis","local":"parque","exp":"pouco","dias":"5","tempo":"40","limit":"nenhum"}\n```');
$('#chatin').value='agora vou treinar no parque, 5 dias';
$('#b-enviar').click();await tick(300);
const bots2=$('#chatlog').querySelectorAll('[data-ap="plano"]');
bots2[bots2.length-1].click();await tick(150);
const pj2=JSON.parse(w.localStorage.getItem('coach_plano'));
ok(pj2.versao===2&&pj2.nota==='plano remontado na conversa 💬','remontagem versiona o plano');
ok(pj2.local==='parque'&&pj2.diasSemana==='5','remontagem muda local/dias');
const logDepois=JSON.parse(w.localStorage.getItem('coach_log'));
ok(CZ.fezAlgo(logDepois[CZ.hojeISO()]),'histórico PRESERVADO na remontagem');

secao('DOM: plano inválido não suja nada');
d.querySelector('#nav button[data-v="v-chat"]').click();await tick(120);
MOCKS.push('ops ```plano\n{"objetivo":"forca","local":"marte","exp":"pouco","dias":"4","tempo":"20"}\n```');
$('#chatin').value='muda pra marte';
$('#b-enviar').click();await tick(300);
const bots3=$('#chatlog').querySelectorAll('[data-ap="plano"]');
bots3[bots3.length-1].click();await tick(150);
ok($('#v-chat').hidden===false,'plano inválido: clique segura (toast) e não troca de aba');
ok(JSON.parse(w.localStorage.getItem('coach_plano')).local==='parque','plano legítimo intacto');

secao('DOM: chat cria timers (bloco da IA)');
MOCKS.push('Fechou! ```timers\n[{"nome":"Tabata","seg":30},{"nome":"Descanso tabata","seg":15}]\n```');
$('#chatin').value='cria 2 timers: tabata 30s e descanso 15s';
$('#b-enviar').click();await tick(300);
const bt=$('#chatlog').querySelector('[data-ap="timers"]');
ok(!!bt,'card "adicionar ao relógio" aparece');
bt.click();await tick(150);
ok($('#v-timer').hidden===false,'adicionar leva pra aba Timers');
const tj=JSON.parse(w.localStorage.getItem('coach_timers'));
ok(tj.length===2&&tj[0].nome==='Tabata'&&tj[0].seg===30,'2 timers criados pela IA');
ok($('#v-timer').textContent.indexOf('5s extras de preparação')>=0,'aviso dos 5s na tela');
ok($('#v-timer').textContent.indexOf('Tabata')>=0,'meus timers listados');
ok($('#v-timer').querySelectorAll('[data-src="p"]').length===5,'5 presets na lista');

secao('DOM: timer IA modificando existente + upsert');
d.querySelector('#nav button[data-v="v-chat"]').click();await tick(120);
MOCKS.push('Ajustado! ```timers\n[{"nome":"Tabata","seg":45}]\n```');
$('#chatin').value='tabata agora com 45s';
$('#b-enviar').click();await tick(300);
const bt2=$('#chatlog').querySelectorAll('[data-ap="timers"]');
bt2[bt2.length-1].click();await tick(150);
const tj2=JSON.parse(w.localStorage.getItem('coach_timers'));
ok(tj2.length===2&&tj2.find(t=>t.nome==='Tabata').seg===45,'IA MODIFICOU o timer existente (mesmo nome, novo tempo)');

secao('DOM: timer personalizado criado na aba');
const rn=$('#tn-nome'),rm=$('#tn-min'),rs=$('#tn-seg');
rn.value='Prancha hardcore';rm.value='1';rs.value='5';
$('#tn-add').click();await tick(120);
const tj3=JSON.parse(w.localStorage.getItem('coach_timers'));
ok(tj3.length===3&&tj3.find(t=>t.nome==='Prancha hardcore').seg===65,'personalizado criado (1:05)');
rn.value='';rs.value='0';rm.value='0';
$('#tn-add').click();await tick(120);
ok(JSON.parse(w.localStorage.getItem('coach_timers')).length===3,'timer sem nome/tempo rejeitado');
const linhas=$('#v-timer').querySelectorAll('[data-src="m"]');
ok(linhas.length===3,'3 meus timers na lista');
const dels=$('#v-timer').querySelectorAll('[data-del]');
ok(dels.length===3,'cada timer meu tem excluir');
dels[2].click();await tick(120);
ok(JSON.parse(w.localStorage.getItem('coach_timers')).length===2,'exclusão funciona');

secao('DOM: ciclo do timer (PREPARA → VALENDO → FIM)');
$('#v-timer').querySelectorAll('[data-src="p"]')[0].click();await tick(120);
ok($('#tfase').textContent==='PREPARA…','fase inicial: PREPARA…');
ok($('#tnum').textContent==='0:05','display começa nos 5s de preparação');
ok($('#v-timer').textContent.indexOf('preparação')>=0,'lembrete de preparação visível durante');
await tick(5400);
ok($('#tfase').textContent==='VALENDO','após 5s: VALENDO');
ok($('#tnum').textContent==='0:30','contando o tempo pedido (0:30 do preset)');
$('#t-zap').click();await tick(120);
ok(!$('#v-timer').querySelector('#tnum'),'parar volta pra lista');
$('#tn-nome').value='Raio';$('#tn-min').value='0';$('#tn-seg').value='1';
$('#tn-add').click();await tick(120);
const meusT=$('#v-timer').querySelectorAll('[data-src="m"]');
meusT[meusT.length-1].click();await tick(120);
ok($('#tfase').textContent==='PREPARA…','raio também começa preparando');
await tick(5300);
ok($('#tfase').textContent==='VALENDO','raio valendo (5s de preparação contados)');
await tick(1700);
ok($('#tfase').textContent==='FIM!','no fim: FIM!');
ok($('#t-zap').textContent==='fechar','botão vira "fechar"');
$('#t-zap').click();await tick(120);
ok(!$('#v-timer').querySelector('#tnum'),'fechar volta pra lista');

secao('DOM: caminho rápido (wizard) segue inteiro');
d.querySelector('#nav button[data-v="v-config"]').click();await tick(120);
$('#cf-apagar').click();await tick(80);$('#cf-apagar').click();await tick(150);
ok($('#v-start').hidden===false,'apagar tudo volta pro start');
ok(!w.localStorage.getItem('coach_timers'),'apagar tudo inclui timers');
$('#b-comecar').click();await tick(120);
ok($('#v-wizard').hidden===false,'wizard abre');
for(let passo=0;passo<8;passo++){
  const rotulo=$('#w-passo').textContent;
  const corpo=$('#w-corpo');
  const areas=corpo.querySelectorAll('.area');
  const multi=(passo===0||passo===5);
  const texto=(passo===6),nomes=(passo===7);
  if(areas.length){
    areas[0].click();await tick(60);
    if(multi&&passo===0){corpo.querySelectorAll('.area')[1].click();await tick(60)}
    if(multi){$('#w-avancar').click();await tick(90)}
    else await tick(200);
  }else if(texto){
    const ta=corpo.querySelector('textarea');ta.value='semana normal';ta.dispatchEvent(new w.Event('input',{bubbles:true}));
    $('#w-avancar').click();await tick(90);
  }else if(nomes){
    const ap2=corpo.querySelector('#wz-ap'),co=corpo.querySelector('#wz-co');
    ap2.value='Teste';ap2.dispatchEvent(new w.Event('input',{bubbles:true}));
    co.value='Coach';co.dispatchEvent(new w.Event('input',{bubbles:true}));
    $('#w-avancar').click();await tick(90);
  }
  if($('#v-hoje').hidden===false)break;
}
await tick(150);
ok($('#v-hoje').hidden===false,'wizard completo → aba Hoje');
ok(!!w.localStorage.getItem('coach_plano'),'plano do wizard salvo');
ok(w.localStorage.getItem('coach_perfil').indexOf('Teste')>0,'apelido do wizard salvo');
const hoje2=CZ.hojeISO();
$('#v-hoje').querySelector('.acao').click();await tick(120);
ok(JSON.parse(w.localStorage.getItem('coach_log'))[hoje2].feitas[0]===true,'checkin no Hoje');
d.querySelector('#nav button[data-v="v-prog"]').click();await tick(120);
ok($('#v-prog').textContent.indexOf('Ofensiva')>=0,'Progresso renderiza');
d.querySelector('#nav button[data-v="v-plano"]').click();await tick(120);
$('#v-plano').querySelector('[data-aj="encolher"]').click();await tick(120);
ok(JSON.parse(w.localStorage.getItem('coach_plano')).tier==='zero','encolher carga na aba Plano');
ok($('#nav').querySelectorAll('button').length===6,'nav com 6 abas (timers incluída)');
ok($('#nav button[data-v="v-timer"]').textContent.indexOf('Timers')>=0,'aba Timers no nav');

console.log('\n══════════════════════════');
console.log('RESULTADO: '+P+' ✓ / '+F+' ✗'+(F?(' → '+FALHAS.join(' | ')):' — SUÍTE INTEIRA PASSOU 🥊'));
process.exit(F?1:0);
})().catch(e=>{console.error('CRASH:',e&&e.message);process.exit(1)});
