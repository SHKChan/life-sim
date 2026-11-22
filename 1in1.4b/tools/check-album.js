/* 使用独立 Chrome 存档检查图鉴空状态、线索折叠及旧记录展示。 */
'use strict';
const fs = require('fs'), path = require('path'), os = require('os'), { execFileSync } = require('child_process');
const dir = path.join(__dirname, '..'), out = path.join(dir, 'docs/validation/album-v217');
const chrome = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
if (!fs.existsSync(chrome) || /msedge/i.test(chrome)) throw Error('请使用 Chrome');
fs.mkdirSync(out, { recursive: true });
for (const mode of ['empty', 'partial', 'complete']) for (const width of [1440, 390]) {
  const before = `<script>localStorage.clear();window.albumErrors=[];addEventListener('error',e=>albumErrors.push(e.message));</script>`;
  const seed = `<script>{const ends={};if('${mode}'!=='empty')JY.FATE.ENDS.slice(0,'${mode}'==='partial'?1:undefined).forEach(e=>ends[e.k]=2);localStorage.setItem('1in1.4b.album.v1',JSON.stringify({ends}));}</script>`;
  const driver = `<script>try{
    const ok=(v,m)=>{if(!v)throw Error(m)},section=document.querySelector('.ending-album'),hints=section.querySelector('.ending-hints'),found=section.querySelectorAll('.ending-entry.unlocked');
    ok(section,'图鉴存在');ok(!section.textContent.includes('未解锁')&&!section.textContent.includes(' / '),'没有未解锁标签和完成比例');
    ok(found.length===('${mode}'==='empty'?0:'${mode}'==='partial'?1:JY.FATE.ENDS.length),'已记录数量正确');
    if('${mode}'==='empty')ok(section.textContent.includes('完成第一段人生后'),'温和空状态');
    if('${mode}'==='complete')ok(!hints,'收齐后不显示线索入口');else{
      ok(hints&&!hints.open,'线索默认折叠');ok([...hints.querySelectorAll('.ending-entry')].every(e=>!e.checkVisibility()),'没有可见路线');
      hints.querySelector('summary').click();ok(hints.open,'点击展开线索');ok(hints.querySelector('.ending-entry').getBoundingClientRect().height>0,'展开后线索可见');
      hints.querySelector('summary').click();ok(!hints.open,'再次收起线索');
    }
    if(found.length){found[0].querySelector('summary').click();ok(found[0].open&&found[0].textContent.includes('已记录 2 次'),'旧记录次数与详情保留');found[0].querySelector('summary').click();}
    for(const theme of ['dark','gray','light']){document.documentElement.dataset.theme=theme;ok(document.documentElement.scrollWidth<=innerWidth,'无横向溢出 '+theme);}
    ok(!albumErrors.length,albumErrors.join(';'));document.getElementById('app').innerHTML='<main class="home">'+section.outerHTML+'</main>';document.documentElement.dataset.albumCheck='PASS';
  }catch(e){document.documentElement.dataset.albumCheck='FAIL';document.body.prepend(Object.assign(document.createElement('pre'),{textContent:e.stack}));}</script>`;
  const file = path.join(dir, '_album-check.html'), phone = path.join(dir, '_album-phone.html');
  const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8').replace('<script src="config.js"></script>', before + '<script src="config.js"></script>')
    .replace('<script src="../share/ui.js"></script>', seed + '<script src="../share/ui.js"></script>').replace('</body>', driver + '</body>');
  fs.writeFileSync(file, html);
  if(width===390)fs.writeFileSync(phone, '<iframe style="border:0;width:390px;height:1100px" src="_album-check.html" onload="document.documentElement.dataset.albumCheck=this.contentDocument.documentElement.dataset.albumCheck;const p=this.contentDocument.querySelector(\'pre\');if(p)document.body.appendChild(p.cloneNode(true))"></iframe>');
  try {
    const dom = execFileSync(chrome, ['--headless=new','--disable-gpu','--hide-scrollbars','--allow-file-access-from-files','--window-size='+Math.max(520,width)+',1100','--virtual-time-budget=2000','--user-data-dir='+path.join(os.tmpdir(),'life-album-'+mode+width),'--screenshot='+path.join(out,mode+'-'+width+'.png'),'--dump-dom','file:///'+(width===390?phone:file).replace(/\\/g,'/')], {encoding:'utf8',timeout:60000,maxBuffer:16*1024*1024,stdio:['ignore','pipe','pipe']});
    if(!dom.includes('data-album-check="PASS"'))throw Error((dom.match(/<pre[^>]*>([\s\S]*?)<\/pre>/)||[])[1]||'图鉴验收失败');
    console.log('PASS '+mode+' '+width);
  } finally {fs.rmSync(file,{force:true});fs.rmSync(phone,{force:true});}
}
