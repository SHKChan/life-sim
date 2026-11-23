/* Chrome独立测试存档：结算换选、刷新、学徒入口与判定帮助。 */
'use strict';
const fs = require('fs'), path = require('path'), os = require('os'), { execFileSync } = require('child_process');
const dir = path.join(__dirname, '..'), out = path.join(dir, 'docs', 'validation', 'echo-v216');
const chrome = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
if (!fs.existsSync(chrome) || /msedge/i.test(chrome)) throw Error('请使用Chrome');
fs.mkdirSync(out, { recursive: true });
const modes = [['select', 1440], ['select', 390], ['home', 390], ['craft', 390], ['self', 1440]];
for (const [mode, width] of modes) {
  const setup = `<script>localStorage.clear();localStorage.setItem('vibe.lang','zh');window.echoErrors=[];addEventListener('error',e=>echoErrors.push(e.message));</script>`;
  const seed = `<script>{const E=JY.engine;E.startRandom();const L=E.get().L;L.year=JY.byId[L.cid].born+80;E.get().W.year=L.year;L.death='寿终正寝';
    if(['craft','self'].includes('${mode}')){const life=E.finish('认真过了。');JY.ECHO.select(JY.ECHO.sourceOf(life),'${mode}');E.startRandom();const g=E.G,l=E.get().L;l.year=JY.byId[l.cid].born+('${mode}'==='craft'?22:34);E.get().W.year=l.year;g.remember('lifePath','work');g.remember('money0',true);g.remember('cash',50000);g.remember('skill',null);JY.CN.setJob(g,'${mode}'==='craft'?'worker':'office','${mode}'==='craft'?'工厂工人':'公司职员');JY.CN.goCity(g,1,g.recall('city')==='上海'?'深圳':'上海');g.remember('gift',null);l.st['事业']=55;l.queue=['${mode}'==='craft'?'y_worker22':'t_rewrite_remote'];}E.save();}</script>`;
  const driver = `<script>try{const ok=(v,m)=>{if(!v)throw Error(m)},click=id=>{const el=document.getElementById(id);ok(el,'缺少 '+id);el.click()};click('h-resume');
    if(['select','home'].includes('${mode}')){click('wd-0');if(document.getElementById('rv-close'))click('rv-close');const echo=document.querySelector('.end-echo');ok(echo&&!echo.open,'残响默认折叠');echo.querySelector('summary').click();let inputs=[...document.querySelectorAll('[data-echo-source]')];ok(inputs.length===3,'三个候选');inputs[0].click();ok(JY.album().pendingEcho==='craft','点击保存');inputs[2].click();ok(JY.album().pendingEcho==='self'&&inputs.filter(x=>x.checked).length===1,'换选只留一项');document.querySelector('[data-echo-clear]').click();ok(!JY.album().pendingEcho,'放弃带入');inputs[0].click();JY.engine.load();ok(JY.album().pendingEcho==='craft','存储重读仍保留选择');
      if('${mode}'==='home'){click('e-home');ok(document.querySelector('input[value="craft"]').checked,'首页可重新选择');}
      const card=document.querySelector('.echo-options').closest('.card');card.open=true;card.querySelector('input[value="craft"]').setAttribute('checked','');document.getElementById('app').innerHTML='<main class="home">'+card.outerHTML+'</main>';window.scrollTo(0,0);
    }else{const E=JY.engine,n=E.peek().node,opts=E.choices(n),echo=opts.find(o=>o.ch.echo==='${mode}');ok(echo,'残响选项可见');ok(opts.length<=4,'可见选项不超四个');ok(!E.G.recall('echoUsed'),'预览未消耗');if('${mode}'==='self'){ok(E.odds(echo.ch.check)===58,'只给专属选项八点帮助');}else{const button=document.querySelector('[data-act="choose"][data-i="'+echo.i+'"]');ok(button,'学徒按钮');button.click();ok(E.G.recall('echoUsed')&&E.G.recall('job')==='electrician','使用一次后进入学徒职业');ok(document.getElementById('app').textContent.includes('前世残响'),'显示残响状态');}}
    ok(document.documentElement.scrollWidth<=innerWidth,'无横向溢出');ok(!echoErrors.length,'无JS错误');document.documentElement.dataset.echoCheck='PASS';
  }catch(e){document.documentElement.dataset.echoCheck='FAIL';document.body.prepend(Object.assign(document.createElement('pre'),{textContent:e.stack}));}</script>`;
  const file = path.join(dir, '_echo-shot.html'), phone = path.join(dir, '_echo-phone.html');
  const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8').replace('<script src="config.js"></script>', setup + '<script src="config.js"></script>')
    .replace('<script src="../share/ui.js"></script>', seed + '<script src="../share/ui.js"></script>').replace('</body>', driver + '</body>');
  fs.writeFileSync(file, html); let target = file;
  if (width < 500) {
    fs.writeFileSync(phone, `<iframe style="border:0;width:390px;height:1100px" src="_echo-shot.html" onload="document.documentElement.dataset.echoCheck=this.contentDocument.documentElement.dataset.echoCheck;const p=this.contentDocument.querySelector('pre');if(p)document.body.appendChild(p.cloneNode(true))"></iframe>`); target = phone;
  }
  try {
    const dom = execFileSync(chrome, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--allow-file-access-from-files', '--window-size=' + Math.max(520, width) + ',1100', '--virtual-time-budget=2000', '--user-data-dir=' + path.join(os.tmpdir(), 'life-echo-' + mode + width), '--screenshot=' + path.join(out, mode + '-' + width + '.png'), '--dump-dom', 'file:///' + target.replace(/\\/g, '/')], { encoding: 'utf8', timeout: 60000, maxBuffer: 16 * 1024 * 1024, stdio: ['ignore', 'pipe', 'pipe'] });
    const pass = dom.includes('data-echo-check="PASS"');
    fs.writeFileSync(path.join(out, mode + '-' + width + '.json'), JSON.stringify({ mode, width, pass }));
    if (!pass) throw Error((dom.match(/<pre[^>]*>([\s\S]*?)<\/pre>/) || [])[1] || '界面检查失败');
    console.log('PASS ' + mode + ' ' + width);
  } finally { fs.rmSync(file, { force: true }); fs.rmSync(phone, { force: true }); }
}
