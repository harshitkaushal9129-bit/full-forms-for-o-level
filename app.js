let DATA={},PRACTICAL_DATA={},active=0,deferredPrompt=null,done=JSON.parse(localStorage.getItem('oDone')||'{}');
const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
fetch('data.json').then(r=>r.json()).then(d=>{DATA=d;init()});
fetch('new.json').then(r=>r.json()).then(d=>{PRACTICAL_DATA=d;});
function init(){
  $('#moduleCount').textContent=DATA.modules.length;
  $('#unitCount').textContent=DATA.modules.reduce((a,m)=>a+m.units.length,0);
  $('#topicCount').textContent=DATA.modules.reduce((a,m)=>a+m.units.reduce((b,u)=>b+u.topics.length,0),0);
  renderTabs();
  render();
  updateDone();
  if(localStorage.theme==='dark')document.body.classList.add('dark');
}
function renderTabs(){
  $('#moduleTabs').innerHTML=DATA.modules.map((m,i)=>`<button class="${i===active?'active':''}" data-mod="${i}">${m.code}</button>`).join('');
  document.querySelectorAll('[data-mod]').forEach(b=>b.onclick=()=>{active=+b.dataset.mod;renderTabs();render()});
}
function render(){
  let m=DATA.modules[active],q=$('#search').value.toLowerCase();
  let units=m.units.map((u,i)=>{
    let topics=u.topics.filter(t=>(t.title+' '+t.note+' '+u.title).toLowerCase().includes(q));
    if(!topics.length)return '';
    return `<section class="unit"><div class="unitHead"><div><h3>${i+1}. ${esc(u.title)}</h3><p>${esc(u.summary)}</p></div><span>⌄</span></div><div class="unitBody"><div class="topicGrid">${topics.map(t=>`<article class="topic"><img src="${t.image}" alt="${esc(t.title)} illustration" data-img="${t.id}"><div class="topicText"><b>${esc(t.title)}</b><small>${done[t.id]?'Completed':'Study topic'}</small><br><button data-topic="${t.id}">Read notes →</button></div><button class="done" title="Mark complete" data-done="${t.id}">${done[t.id]?'✓':'○'}</button></article>`).join('')}</div></div></section>`;
  }).join('');
  $('#content').innerHTML=`<div class="moduleIntro"><h2>${m.code} · ${esc(m.name)}</h2><p>${m.units.length} syllabus units • ${m.units.reduce((a,u)=>a+u.topics.length,0)} topics • Revision 5.1</p></div>${units||'<p class="muted">No matching topics found.</p>'}`;
  document.querySelectorAll('.unitHead').forEach(h=>h.onclick=()=>h.nextElementSibling.classList.toggle('hidden'));
  document.querySelectorAll('[data-img]').forEach(im=>im.onclick=()=>showImage(im.dataset.img));
  document.querySelectorAll('[data-topic]').forEach(b=>b.onclick=()=>showTopic(b.dataset.topic));
  document.querySelectorAll('[data-done]').forEach(b=>b.onclick=()=>{
    let id=b.dataset.done;
    done[id]=!done[id];
    localStorage.setItem('oDone',JSON.stringify(done));
    render();
    updateDone();
  });
}
function findTopic(id){
  for(let m of DATA.modules)
    for(let u of m.units)
      for(let t of u.topics)
        if(t.id===id)return {t,u,m};
}
function showImage(id){
  let {t}=findTopic(id);
  $('#largeImage').src=t.image;
  $('#imageCaption').textContent=t.title;
  $('#imageModal').classList.remove('hidden');
}
function showTopic(id){
  let {t,u,m}=findTopic(id);
  $('#panelTitle').textContent=t.title;
  $('#panelBody').innerHTML=`<img src="${t.image}" alt="${esc(t.title)}"><p class="muted">${m.code} · ${esc(u.title)}</p><h3>Quick Notes</h3><p>${esc(t.note)}</p><button class="primary" id="markThis">✓ Mark as completed</button>`;
  $('#panel').classList.remove('hidden');
  $('#markThis').onclick=()=>{
    done[id]=true;
    localStorage.setItem('oDone',JSON.stringify(done));
    updateDone();
    render();
    $('#panel').classList.add('hidden');
  };
}
function updateDone(){
  $('#doneCount').textContent=Object.values(done).filter(Boolean).length;
}
const questions=[
  ['कंप्यूटर का मस्तिष्क किसे कहा जाता है?',['Monitor','CPU','RAM','Hard Disk'],1,'CPU निर्देशों को प्रोसेस करता है।'],
  ['कौन-सी मेमोरी Volatile है?',['ROM','SSD','RAM','DVD'],2,'RAM की सामग्री बिजली बंद होने पर मिट जाती है।'],
  ['HTML का उपयोग किसलिए होता है?',['वेब पेज संरचना','डेटाबेस','ऑपरेटिंग सिस्टम','एंटीवायरस'],0,'HTML वेब पेज की संरचना बनाता है।'],
  ['CSS का मुख्य काम क्या है?',['डेटा स्टोर','वेब पेज स्टाइल','प्रोग्राम चलाना','नेटवर्क रूटिंग'],1,'CSS वेब पेज की प्रस्तुति नियंत्रित करता है।'],
  ['Python में function बनाने का keyword है?',['func','define','def','function'],2,'Python में def keyword उपयोग होता है।'],
  ['IoT में Sensor का काम है?',['भौतिक मान मापना','वेब होस्टिंग','टेक्स्ट फॉर्मेट','प्रिंटिंग'],0,'Sensor तापमान, प्रकाश आदि माप सकता है।'],
  ['LAN का पूरा नाम क्या है?',['Large Area Network','Local Area Network','Long Access Node','Line Area Network'],1,'LAN सीमित क्षेत्र का नेटवर्क है।'],
  ['Spreadsheet में SUM() क्या करता है?',['औसत','गिनती','जोड़','सबसे बड़ा'],2,'SUM दिए गए मानों का योग करता है।']
];
function openQuiz(){
  let i=0,score=0;
  function next(){
    if(i>=questions.length){
      $('#panelTitle').textContent='Quiz Result';
      $('#panelBody').innerHTML=`<h2>${score}/${questions.length}</h2><p>आपका अभ्यास पूरा हुआ। गलत उत्तरों के explanation दोबारा पढ़ें।</p><button class="primary" id="again">Try Again</button>`;
      $('#again').onclick=()=>{i=0;score=0;next()};
      return;
    }
    let q=questions[i];
    $('#panelTitle').textContent=`Practice Quiz · ${i+1}/${questions.length}`;
    $('#panelBody').innerHTML=`<h3>${q[0]}</h3>${q[1].map((o,n)=>`<button class="quizOpt" data-answer="${n}">${'ABCD'[n]}) ${o}</button>`).join('')}<p id="feedback" class="muted"></p>`;
    document.querySelectorAll('[data-answer]').forEach(b=>b.onclick=()=>{
      if($('#feedback').textContent)return;
      let ok=+b.dataset.answer===q[2];
      if(ok)score++;
      b.classList.add(ok?'correct':'wrong');
      $('#feedback').textContent=(ok?'सही उत्तर! ':'सही उत्तर: '+q[1][q[2]]+'. ')+q[3];
      let n=document.createElement('button');
      n.className='primary';
      n.textContent='Next →';
      n.onclick=()=>{i++;next()};
      $('#panelBody').append(n);
    });
  }
  $('#panel').classList.remove('hidden');
  next();
}
function panel(title,html){
  $('#panelTitle').textContent=title;
  $('#panelBody').innerHTML=html;
  $('#panel').classList.remove('hidden');
}
$('#menuBtn').onclick=()=>$('#menu').classList.toggle('hidden');
$('#menu').onclick=e=>{
  let a=e.target.dataset.action;
  if(!a)return;
  $('#menu').classList.add('hidden');
  if(a==='about')panel('App Info','<p>NIELIT O Level Master Portal</p><p>Revision 5.1 study companion with topic notes, SVG illustrations, quiz and offline install support.</p><p class="muted">Not affiliated with NIELIT.</p>');
  if(a==='developer')panel('Developer Info','<h3>kaushalji</h3><p>Full Stack Web Developer & Tech Educator</p><p><a href="https://www.youtube.com/@computer-skills9129">YouTube</a> · <a href="https://www.instagram.com/kaushalji_boss.01">Instagram</a></p>');
  if(a==='install')install();
  if(a==='share')share();
};
$('#themeBtn').onclick=()=>{
  document.body.classList.toggle('dark');
  localStorage.theme=document.body.classList.contains('dark')?'dark':'light';
};
$('#closeImage').onclick=()=>$('#imageModal').classList.add('hidden');
$('#imageModal').onclick=e=>{if(e.target.id==='imageModal')$('#imageModal').classList.add('hidden')};
$('#closePanel').onclick=()=>$('#panel').classList.add('hidden');
$('#search').oninput=render;
$('#continueBtn').onclick=()=>document.querySelector('#moduleTabs').scrollIntoView({behavior:'smooth'});
$('#quizTop').onclick=$('#openQuiz').onclick=openQuiz;
$('#flashBtn').onclick=()=>{
  let m=DATA.modules[active],items=m.units.flatMap(u=>u.topics).slice(0,10);
  panel('Quick Revision',items.map(t=>`<p><b>${esc(t.title)}</b><br><span class="muted">${esc(t.note)}</span></p>`).join(''));
};
$('#progressBtn').onclick=()=>panel('My Progress',`<h2>${Object.values(done).filter(Boolean).length} topics completed</h2><p>किसी topic के पास ○ पर टैप करके उसे पूरा mark करें।</p>`);
$('#syllabusBtn').onclick=()=>window.open('https://nielit.gov.in/sites/default/files/headquarter/pdf/20220905_5_1_revised_O_Level_IT.pdf','_blank');
$('#installHero').onclick=install;
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredPrompt=e});
async function install(){
  if(deferredPrompt){
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt=null;
  } else {
    panel('Install App','<p>Android Chrome में ऊपर ⋮ मेन्यू खोलें और <b>Install app</b> या <b>Add to Home screen</b> चुनें। पहले साइट को localhost या HTTPS hosting पर खोलें।</p>');
  }
}
async function share(){
  const shareData={title:DATA.title||'NIELIT O Level Portal',text:'NIELIT O Level Master Portal',url:'https://harshitkaushal9129-bit.github.io/full-forms-for-o-level/'};
  if(navigator.share){
    try{await navigator.share(shareData)}catch(e){}
  } else {
    navigator.clipboard?.writeText('https://harshitkaushal9129-bit.github.io/full-forms-for-o-level/');
    panel('Share Portal','<p>Portal link copy कर ली गई है!</p>');
  }
}
if('serviceWorker'in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));

let practicalCategory="All";
(function createPracticalButton(){
  const tabs=document.getElementById("moduleTabs");
  if(!tabs||document.getElementById("practicalLaunch"))return;
  const btn=document.createElement("button");
  btn.id="practicalLaunch";
  btn.className="active";
  btn.innerHTML="🧪 Practical Lab";
  btn.style.cssText=`background:linear-gradient(135deg,#7c3aed,#2563eb);color:white;border:0;padding:12px 18px;margin:8px 4px;border-radius:12px;font-weight:bold;cursor:pointer;`;
  tabs.parentNode.insertBefore(btn,tabs.nextSibling);
  btn.onclick=openPracticalLab;
})();
function openPracticalLab(){
  if(!PRACTICAL_DATA||!PRACTICAL_DATA.practicals){
    panel("Practical Lab","<p><b>new.json</b> फ़ाइल लोड नहीं हो पाई है या उसमें practicals सेक्शन नहीं है।</p>");
    return;
  }
  practicalCategory="All";
  renderPracticalLab();
}
function renderPracticalLab(){
  const practicalsList=PRACTICAL_DATA.practicals||[];
  const categories=["All",...practicalsList.map(p=>p.category)];
  const items=practicalsList.filter(p=>practicalCategory==="All"||p.category===practicalCategory).flatMap(p=>p.items.map(item=>({...item,category:p.category})));
  const categoryHTML=categories.map(cat=>`<button class="practical-category" data-category="${esc(cat)}" style="padding:8px 14px;margin:4px;border:0;border-radius:10px;background:${cat===practicalCategory?"#4f46e5":"#334155"};color:white;cursor:pointer;">${esc(cat)}</button>`).join("");
  
  const cards=items.map((item,index)=>{
    // यहाँ HTML/CSS कोड को iframe के अंदर लाइव रेंडर करने के लिए srcdoc का उपयोग किया गया है
    const isCodeLang = item.language === "HTML5" || item.language === "CSS3";
    const outputView = isCodeLang 
      ? `<iframe srcdoc="${esc(item.code)}" style="width:100%;height:100px;background:#fff;border:1px solid #ccc;border-radius:6px;" sandbox="allow-scripts"></iframe>`
      : `<pre style="margin:0;white-space:pre-wrap;font-family:monospace;">${esc(item.output||item.code)}</pre>`;

    return `<article class="practical-card" style="background:var(--card,#1e293b);border:1px solid var(--line,#334155);border-radius:15px;padding:16px;margin:14px 0;color:#f8fafc;">
      <div style="display:flex;justify-content:space-between;gap:8px">
        <span style="color:#818cf8;font-weight:bold">${esc(item.category)}</span>
        <span style="font-size:12px;background:#334155;padding:2px 8px;border-radius:6px;">${esc(item.language)}</span>
      </div>
      <h3 style="margin:8px 0;">${esc(item.title)}</h3>
      <p style="margin-bottom:12px;"><b>Question:</b> ${esc(item.question)}</p>
      <details style="margin-bottom:12px;">
        <summary style="cursor:pointer;padding:10px;background:#334155;color:white;border-radius:8px;">View Practical Code</summary>
        <pre style="overflow:auto;padding:15px;background:#0b1220;color:#a7f3d0;border-radius:10px;white-space:pre-wrap;word-break:break-word;margin-top:8px;"><code>${esc(item.code)}</code></pre>
        <button class="copy-practical" data-index="${index}" style="background:#059669;color:white;border:0;padding:8px 14px;border-radius:8px;cursor:pointer;margin-top:6px;">📋 Copy Code</button>
      </details>
      <div style="background:#0f172a;color:#e2e8f0;padding:12px;border-radius:10px;border-left:4px solid #6366f1;">
        <b>Live Output Preview:</b>
        <div style="margin-top:8px;">${outputView}</div>
      </div>
    </article>`;
  }).join("");

  panel("🧪 "+esc(PRACTICAL_DATA.title||"O Level Practical Lab"),`<div style="margin-bottom:18px"><p>HTML, CSS, JavaScript, Python और IoT के Practical Questions और उनके Live Outputs.</p><div style="margin-top:8px;">${categoryHTML}</div><p style="margin-top:10px;"><b>${items.length}</b> Practical Questions Found</p></div><div>${cards||"<p>No practicals found.</p>"}</div>`);

  document.querySelectorAll("[data-category]").forEach(button=>{
    button.onclick=()=>{
      practicalCategory=button.dataset.category;
      renderPracticalLab();
    };
  });
  document.querySelectorAll(".copy-practical").forEach(button=>{
    button.onclick=async()=>{
      const index=Number(button.dataset.index);
      const item=items[index];
      try{
        await navigator.clipboard.writeText(item.code);
        button.textContent="✓ Copied Successfully";
      }catch(error){
        const textarea=document.createElement("textarea");
        textarea.value=item.code;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        textarea.remove();
        button.textContent="✓ Copied";
      }
      setTimeout(()=>{button.textContent="📋 Copy Code";},1800);
    };
  });
}
