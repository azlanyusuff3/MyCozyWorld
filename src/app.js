import { JOBS, GOALS, TASKS, DAILY } from "./phase3.js";
import { FURNITURE, FRIENDS } from "./phase2.js";
import { PLACES, ITEMS, MARKET, CLOTHES, LOOKS, MISSIONS } from "./data.js";
import { loadGame, persist, act, itemCount, nextMission, missionStep, timeLabel } from "./state.js";
import { avatarSvg, sceneSvg } from "./art.js";
let game=loadGame(), modal="", toastTimer, activeJob="", jobAnswers=[];
const app=document.getElementById("app");
const escape=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function button(label,action,value="",cls="action-btn"){return '<button class="'+cls+'" data-action="'+action+'" data-value="'+escape(value)+'">'+label+"</button>";}
function stat(label,value,color){return '<div class="stat"><span>'+label+' '+Math.round(value)+'</span><div class="track"><b style="width:'+Math.min(100,value)+'%;background:'+color+'"></b></div></div>';}
function sceneActions(){switch(game.location){
 case "home":return button("🪑 Decorate","decorate")+button("🛏️ Rest","rest")+button("📖 Read","study")+button("👗 Wardrobe","wardrobe");
 case "school":return button("💼 Tutor shift","work","tutor")+button("💬 Luna","talk","luna")+button("📚 Get book","book")+button("✏️ Study","study");
 case "market":return button("💼 Cafe shift","work","barista")+MARKET.map(id=>button(ITEMS[id].icon+" "+ITEMS[id].name+" · "+ITEMS[id].cost+" 🪙","buy",id)).join("");
 case "boutique":return button("💬 Poppy","talk","poppy")+Object.entries(CLOTHES).map(([id,v])=>button(v.icon+" "+v.name+(game.wardrobe.includes(id)?" · Owned":" · "+v.cost+" 🪙"),game.wardrobe.includes(id)?"equip":"buy-outfit",id)).join("");
 case "park":return button("💼 Garden shift","work","gardener")+button("💬 Milo","talk","milo")+button("🛝 Play","play")+button("🌼 Pick daisy","daisy");
 default:return button("🏡 Home","travel","home")+button("📚 School","travel","school")+button("🛒 Market","travel","market")+button("👗 Boutique","travel","boutique")+button("🌷 Park","travel","park");
}}
function npcMarkup(){const match=Object.entries(FRIENDS).find(([,friend])=>friend.place===game.location);if(!match)return "";const [id,friend]=match;return '<button class="npc-character" data-action="talk" data-value="'+id+'"><span class="npc-face">'+friend.icon+'</span><span class="npc-name">'+friend.name+'</span></button>';}
function decorMarkup(){return game.location==="home"?'<div class="decor-items">'+(game.decor||[]).map((d,i)=>'<button class="decor-object" style="left:'+(d.x/12)+'%;top:'+(d.y/6.5)+'%" data-action="shift-decor" data-value="'+i+'" title="Tap to move">'+FURNITURE[d.id].icon+'</button>').join("")+'</div>':"";}
function render(){
 const mission=nextMission(game);
 app.innerHTML='<div class="game"><header><div class="brand">🌼 My Cozy World</div><div class="pill">🪙 '+game.coins+'</div><div class="pill">☀️ Day '+game.day+' · '+timeLabel(game)+'</div><div class="stats">'+stat("🍎 Food",game.stats.hunger,"#f1a47e")+stat("⚡ Energy",game.stats.energy,"#b1c68d")+stat("💗 Joy",game.stats.joy,"#e6a1ba")+stat("📖 Learning",Math.min(100,game.stats.knowledge),"#a7a1db")+'</div><div class="top-buttons">'+button("🏆","career","","icon-btn")+button("💗","friends","","icon-btn")+button("🎒","inventory","","icon-btn")+button("🗺️","map","","icon-btn")+button("⚙️","settings","","icon-btn")+'</div></header><main><div class="scene" id="scene">'+sceneSvg(game.location)+decorMarkup()+npcMarkup()+'<div class="avatar-layer" id="player" style="left:'+game.position.x/12+'%;bottom:'+((650-game.position.y)/6.5)+'%">'+avatarSvg(game.avatar,120)+'</div><div class="hint">'+PLACES[game.location].icon+' '+PLACES[game.location].name+'</div><div class="walk-pad"><button class="up" data-move="up" aria-label="Move up">↑</button><button class="left" data-move="left" aria-label="Move left">←</button><button class="down" data-move="down" aria-label="Move down">↓</button><button class="right" data-move="right" aria-label="Move right">→</button></div></div><div class="dock">'+button("🗺️ Town map","travel","town","nav-btn")+'<div class="dock-actions">'+sceneActions()+'</div><div class="mission"><strong>⭐ '+(mission?"Quest "+(missionStep(game)+1)+"/"+MISSIONS.length+": "+escape(mission.title):"All quests done! 🎉")+'</strong>'+(mission?escape(mission.hint):"Keep exploring!")+'</div></div></main><div class="toast hidden" id="toast" role="status"></div></div>'+ (modal?renderModal():"");
 bind();
}
function renderModal(){
 const head=(title,body)=>'<div class="overlay"><section class="panel" role="dialog" aria-modal="true" aria-label="'+escape(title)+'"><div class="panel-top"><h2>'+title+'</h2>'+button("×","close","","close")+'</div>'+body+'</section></div>';
 if(modal==="job"){const qs=TASKS[activeJob]||[];const index=jobAnswers.length;const q=qs[index];return head("💼 "+JOBS[activeJob].name,q?'<div class="job-play"><div class="job-icon">'+JOBS[activeJob].icon+'</div><p>Task '+(index+1)+'/'+qs.length+'</p><h3>'+q.prompt+'</h3><div class="grid">'+q.options.map((opt,i)=>button(opt,"answer-job",String(i),"tile")).join("")+'</div></div>':'<p>Ready to finish your shift?</p>'+button("Finish shift","finish-job","","primary"));}
 if(modal==="career")return head("🏆 My Cozy Career",'<p>Work one shift each day to earn coins. Rest when tired!</p><div class="grid">'+Object.entries(JOBS).map(([id,j])=>'<div class="tile"><div style="font-size:32px">'+j.icon+'</div><strong>'+j.name+'</strong><small>'+j.pay+' coins · '+j.place+'</small></div>').join("")+'</div><p>Shifts: '+game.career.shifts+' · Conversations: '+game.career.social+'</p><h3>Achievements</h3><div class="grid">'+Object.entries(GOALS).map(([id,g])=>'<div class="tile"><strong>'+g.name+'</strong><small>'+Math.min(g.target,id==="social"?game.career.social:game.career.shifts)+'/'+g.target+' · Reward '+g.reward+' coins</small>'+ (game.career.claimed.includes(id)?"✓ Claimed":button("Claim reward","claim-goal",id))+'</div>').join("")+'</div><h3>Daily tasks</h3><div class="grid">'+DAILY.map(t=>'<div class="tile"><strong>'+t.name+'</strong><small>+'+t.reward+' coins</small>'+button("Claim","claim-daily",t.key)+'</div>').join("")+'</div>');
 if(modal==="decorate")return head("🪑 Decorate home",'<p>Buy furniture with coins. Tap placed furniture to move it.</p><div class="grid">'+Object.entries(FURNITURE).map(([id,f])=>'<button class="tile" data-action="buy-furniture" data-value="'+id+'"><div style="font-size:38px">'+f.icon+'</div><strong>'+f.name+'</strong><small>'+f.cost+' coins</small></button>').join("")+'</div><p>Placed: '+(game.decor||[]).length+'/12</p>');
 if(modal==="friends")return head("💗 My friends",'<div class="grid">'+Object.entries(FRIENDS).map(([id,f])=>'<div class="tile"><div style="font-size:38px">'+f.icon+'</div><strong>'+f.name+'</strong><small>Friendship '+(game.friends?.[id]||0)+'/100 · '+f.place+'</small></div>').join("")+'</div>');
 if(modal==="map")return head("🗺️ Where shall we go?",'<div class="grid">'+Object.entries(PLACES).map(([id,p])=>'<button class="tile" data-action="travel" data-value="'+id+'"><div style="font-size:36px">'+p.icon+'</div><strong>'+escape(p.name)+'</strong><small>'+escape(p.caption)+'</small></button>').join("")+'</div>');
 if(modal==="inventory"){const items=Object.entries(game.inventory).filter(([,n])=>n>0);return head("🎒 My Backpack",items.length?'<div class="grid">'+items.map(([id,n])=>'<div class="tile"><div style="font-size:34px">'+ITEMS[id].icon+'</div><strong>'+ITEMS[id].name+' ×'+n+'</strong><small>'+ITEMS[id].description+'</small>'+ (ITEMS[id].kind==="food"?button("Eat snack","eat",id):ITEMS[id].kind==="book"?button("Read book","study"):"")+'</div>').join("")+'</div>':"<p>Your backpack is empty. Visit the school or market!</p>");}
 if(modal==="wardrobe")return head("👗 My Wardrobe",'<p>Choose an outfit you own, or visit Petal Boutique for more!</p><div class="grid">'+game.wardrobe.map(id=>'<button class="tile" data-action="equip" data-value="'+id+'"><div style="font-size:42px">'+CLOTHES[id].icon+'</div><strong>'+CLOTHES[id].name+'</strong><small>'+(game.avatar.outfit===id?"Currently wearing":"Tap to wear")+'</small></button>').join("")+'</div>'+button("🎨 Customize character","creator"));
 if(modal==="settings")return head("⚙️ Settings",'<p>Your adventure is automatically saved on this device after every action.</p>'+button(game.sound?"🔊 Sound on":"🔇 Sound off","toggle-sound")+button("🎨 Edit character","creator")+button("🗺️ World map","map")+'<hr><p><strong>Start over?</strong> This permanently erases your current local game.</p>'+button("🗑️ Reset game","confirm-reset"));
 if(modal==="creator"){
  const a=game.avatar;
  const colors=(field,options)=>'<div class="form-group"><label>'+({skin:"Skin tone",hairColor:"Hair color",outfitColor:"Clothes color"}[field])+'</label><div class="swatches">'+options.map(c=>'<button class="swatch '+(a[field]===c?"active":"")+'" style="background:'+c+'" data-pick="'+field+'" data-color="'+c+'" aria-label="'+field+' '+c+'"></button>').join("")+'</div></div>';
  return head("✨ Create your character",'<div class="creator"><div class="preview" id="avatar-preview">'+avatarSvg(a,160)+'</div><div><div class="form-group"><label for="avatar-name">Your name</label><input id="avatar-name" maxlength="18" value="'+escape(a.name)+'"></div>'+colors("skin",LOOKS.skin)+'<div class="form-group"><label for="avatar-hair">Hairstyle</label><select id="avatar-hair">'+LOOKS.hair.map(h=>'<option '+(h===a.hair?"selected":"")+' value="'+h+'">'+h+'</option>').join("")+'</select></div>'+colors("hairColor",LOOKS.hairColor)+ '<div class="form-group"><label for="avatar-outfit">Outfit</label><select id="avatar-outfit">'+game.wardrobe.map(id=>'<option '+(id===a.outfit?"selected":"")+' value="'+id+'">'+CLOTHES[id].name+'</option>').join("")+'</select></div>'+colors("outfitColor",LOOKS.outfitColor)+'</div></div><p>'+button("💖 Let's play!","save-avatar","","primary")+'</p>');
 }
 return "";
}
function notify(text){const el=document.getElementById("toast");if(!el)return;el.textContent=text;el.classList.remove("hidden");clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.add("hidden"),2600);}
function dispatch(type,payload={}){
 const r=act(game,type,payload);
 if(r.ok){game=r.game;persist(game);if(type==="travel"||type==="reset"||type==="customize"||type==="equip"||type==="buy-outfit")modal="";render();}
 if(r.message)notify(r.message);
}
function openModal(id){modal=id;render();}
function bind(){
 app.querySelectorAll("[data-action]").forEach(el=>el.addEventListener("click",ev=>{
  ev.stopPropagation();const type=el.dataset.action,id=el.dataset.value;
  if(["map","inventory","wardrobe","settings","creator","decorate","friends","career"].includes(type))return openModal(type);
  if(type==="close"){if(!game.characterReady)return;modal="";return render();}
  if(type==="confirm-reset"){if(window.confirm("Erase this saved world and start over?")){dispatch("reset");modal="creator";render();}return;}
  if(type==="save-avatar"){const a={...game.avatar,name:document.getElementById("avatar-name").value,hair:document.getElementById("avatar-hair").value,outfit:document.getElementById("avatar-outfit").value};return dispatch("customize",{avatar:a});}
  if(type==="work"){activeJob=id;jobAnswers=[];modal="job";return render();}
  if(type==="answer-job"){const q=TASKS[activeJob]?.[jobAnswers.length];if(!q)return;if(Number(id)!==q.answer)return notify("Try again!");jobAnswers.push(Number(id));return render();}
  if(type==="finish-job"){const job=activeJob,answers=[...jobAnswers];modal="";activeJob="";jobAnswers=[];return dispatch("work",{id:job,answers});}
  if(type==="shift-decor")return;
  if(type==="talk"||type==="buy-furniture"||type==="work"||type==="claim-goal"||type==="claim-daily")return dispatch(type,{id});
  if(type==="travel")return dispatch(type,{place:id});
  if(type==="buy"||type==="eat"||type==="buy-outfit"||type==="equip")return dispatch(type,{id});
  dispatch(type);
 }));
 app.querySelectorAll("[data-pick]").forEach(el=>el.addEventListener("click",()=>{
  game.avatar[el.dataset.pick]=el.dataset.color;render();
 }));
 const scene=document.getElementById("scene");
 app.querySelectorAll(".decor-object").forEach(el=>{
   let pointer=null, moved=false;
   el.addEventListener("pointerdown",e=>{e.stopPropagation();pointer=e.pointerId;moved=false;el.setPointerCapture(pointer);});
   el.addEventListener("pointermove",e=>{if(pointer!==e.pointerId)return;const rect=scene.getBoundingClientRect();const x=Math.max(100,Math.min(1080,(e.clientX-rect.left)/rect.width*1200));const y=Math.max(290,Math.min(450,(e.clientY-rect.top)/rect.height*650));el.style.left=x/12+"%";el.style.top=y/6.5+"%";moved=true;});
   el.addEventListener("pointerup",e=>{if(pointer!==e.pointerId)return;pointer=null;const rect=scene.getBoundingClientRect();if(moved)dispatch("move-furniture",{index:Number(el.dataset.value),x:(e.clientX-rect.left)/rect.width*1200,y:(e.clientY-rect.top)/rect.height*650});});
   el.addEventListener("pointercancel",()=>{pointer=null;render();});
 });
 scene?.querySelectorAll("[data-place],[data-action]").forEach(el=>{const trigger=()=>{if(el.dataset.place)dispatch("travel",{place:el.dataset.place});else dispatch(el.dataset.action);};el.addEventListener("click",trigger);el.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();trigger();}});});
 scene?.addEventListener("pointerdown",e=>{if(e.target.closest("[data-place],[data-action],[data-move]"))return;const rect=scene.getBoundingClientRect();const x=Math.round((e.clientX-rect.left)/rect.width*1200);const y=Math.round((e.clientY-rect.top)/rect.height*650);moveTo(x,y);});
 app.querySelectorAll("[data-move]").forEach(el=>el.addEventListener("click",()=>move(el.dataset.move)));
}
function moveTo(x,y){const r=act(game,"move",{x,y});game=r.game;persist(game);const el=document.getElementById("player");if(el){el.style.left=game.position.x/12+"%";el.style.bottom=(650-game.position.y)/6.5+"%";}}
function move(direction){const d={left:[-45,0],right:[45,0],up:[0,-24],down:[0,24]}[direction];if(d)moveTo(game.position.x+d[0],game.position.y+d[1]);}
document.addEventListener("keydown",e=>{if(modal)return;const key={ArrowLeft:"left",a:"left",ArrowRight:"right",d:"right",ArrowUp:"up",w:"up",ArrowDown:"down",s:"down"}[e.key];if(key){e.preventDefault();move(key);}});
render();if(!game.characterReady)openModal("creator");
if("serviceWorker" in navigator&&location.protocol!=="file:")window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));
