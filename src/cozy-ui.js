import { BUILDINGS, BUILDINGS_IN, BUILDING_BY_ID, DISTRICTS } from "./world4.js";
import { JOBS, GOALS, DAILY } from "./phase3.js";
import { welcomeSvg, districtLandscapeSvg } from "./cozy-art.js";

const esc=value=>String(value).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const btn=(label,action,id="",cls="")=>'<button class="'+cls+'" data-action="'+action+'" data-value="'+esc(id)+'">'+label+'</button>';
const townProgress=game=>Array.isArray(game.world?.visited)?game.world.visited.length:0;
export function welcomeMarkup(game,avatar){
 const ready=!!game.characterReady;
 return '<div class="welcome-screen"><div class="welcome-landscape">'+welcomeSvg()+'</div><div class="welcome-sparkle sparkle-one">✿</div><div class="welcome-sparkle sparkle-two">✦</div><div class="welcome-header"><div class="welcome-logo"><span>MY</span><strong>COZY</strong><b>WORLD</b><small>Make every little day an adventure ♡</small></div></div><div class="welcome-character"><div class="welcome-avatar">'+avatar+'</div><div class="welcome-character-label">🌼 '+esc(game.avatar?.name||"Sunny")+' <span>is ready to explore!</span></div></div><nav class="welcome-menu" aria-label="Main menu">'+btn("▶ &nbsp; PLAY","start-game","","welcome-btn green")+(ready?btn("🏠 &nbsp; CONTINUE","resume-game","","welcome-btn yellow"):"")+btn("🎨 &nbsp; CHARACTER CREATOR","edit-avatar","","welcome-btn purple")+btn("⚙️ &nbsp; SETTINGS","menu-settings","","welcome-btn blue")+'</nav><div class="welcome-footer">🏡 Discover 30 cozy places &nbsp; • &nbsp; ✨ Make your own story</div></div>';
}
export function worldMapMarkup(game,selected){
 const active=DISTRICTS.some(d=>d.id===selected)?selected:DISTRICTS[0].id;
 const district=DISTRICTS.find(d=>d.id===active);
 const places=BUILDINGS_IN(active);
 const pins=places.map((b,i)=>{
  const x=15.8+(i%3)*32.5, y=38.9+Math.floor(i/3)*31.5;
  const visited=game.world?.visited?.includes(b.id);
  return '<button class="world-map-pin '+(visited?"visited":"")+'" data-action="travel" data-value="'+b.id+'" style="left:'+x+'%;top:'+y+'%" aria-label="Travel to '+esc(b.name)+'"><span class="world-pin-icon">'+b.icon+'</span><span class="world-pin-name">'+esc(b.name)+'</span><span class="world-pin-state">'+(visited?"✓ visited":"● explore")+'</span></button>';
 }).join("");
 return '<section class="cozy-map-ui"><div class="world-map-header"><span>🧭 Choose a district to explore</span><strong>'+townProgress(game)+' / '+BUILDINGS.length+' places discovered</strong></div><div class="world-district-tabs" role="group" aria-label="Districts">'+DISTRICTS.map(d=>btn(d.icon+' '+esc(d.name),"district",d.id,"district-pill "+(d.id===active?"is-active":""))).join("")+'</div><div class="world-illustrated-map" role="region" aria-label="'+esc(district.name)+' map">'+districtLandscapeSvg(active)+pins+'</div><div class="world-map-foot"><p>'+esc(district.caption)+' · Six places to visit</p>'+btn("🏘️ Town Square","travel","town","map-town-button")+'</div></section>';
}
export function careerDashboardMarkup(game){
 const career=game.career||{shifts:0,social:0,claimed:[],dailyClaimed:[],dailyBase:{shifts:0,social:0},dailyDay:0};
 const progress=(value,target)=>Math.min(100,Math.round(value/target*100));
 const dailyCurrent=career.dailyDay===game.day;
 const daily=DAILY.map(task=>{
  const value=dailyCurrent?Math.max(0,career[task.key]-(career.dailyBase?.[task.key]||0)):0;
  const claimed=dailyCurrent&&career.dailyClaimed?.includes(task.key);
  return '<div class="career-task"><div class="career-task-icon">'+(task.key==="social"?"💬":"💼")+'</div><div class="career-task-main"><strong>'+esc(task.name)+'</strong><div class="career-progress"><i style="width:'+progress(value,task.target)+'%"></i></div><small>'+Math.min(value,task.target)+' / '+task.target+' · +'+task.reward+' coins</small></div>'+(claimed?'<span class="career-earned">✓ Done</span>':btn("CLAIM","claim-daily",task.key,"career-claim "+(value<task.target?"is-locked":"")))+'</div>';
 }).join("");
 const jobs=Object.entries(JOBS).map(([id,job])=>'<div class="career-job"><span class="career-job-icon">'+job.icon+'</span><div><strong>'+esc(job.name)+'</strong><small>Earn '+job.pay+' coins · '+esc(job.place)+'</small></div>'+btn("GO","travel",job.place,"career-go")+'</div>').join("");
 const milestones=Object.entries(GOALS).map(([id,goal])=>{
  const n=id==="social"?career.social:career.shifts;
  const claimed=career.claimed?.includes(id);
  return '<div class="career-achievement"><strong>🏆 '+esc(goal.name)+'</strong><span>'+Math.min(goal.target,n)+' / '+goal.target+'</span><div class="career-progress"><i style="width:'+progress(n,goal.target)+'%"></i></div>'+(claimed?'<small>✓ Reward claimed</small>':btn("🎁 +"+goal.reward,"claim-goal",id,"career-claim "+(n<goal.target?"is-locked":"")))+'</div>';
 }).join("");
 const keeps=game.world?.stickers?.length||0;
 return '<div class="cozy-career-ui"><div class="career-column"><h3>💼 MY CAREER <small>'+career.shifts+' shifts completed</small></h3>'+jobs+'</div><div class="career-column"><h3>📋 DAILY QUESTS <small>Fresh goals each day</small></h3>'+daily+'<div class="career-achievement-header">🏅 ACHIEVEMENTS</div><div class="career-achievement-grid">'+milestones+'</div></div><div class="career-column career-album"><h3>📒 STICKER ALBUM</h3><div class="career-album-visual"><div class="album-pages">🌼 🐶 🏡 🦋<span>🍰 🎟️ 🌷 🐚</span></div><strong>'+keeps+' keepsakes collected</strong><p>Explore Cozyville and collect special memories from its 30 places.</p>'+btn("OPEN ALBUM","album","","album-open")+'</div><div class="career-adventure-note">✨ Collect • Explore • Work • Grow</div></div></div>';
}
export function albumMarkup(game){
 const stickers=game.world?.stickers||[];
 const cards=BUILDINGS.flatMap(b=>b.actions.filter(a=>a.stat==="sticker").map(a=>'<div class="album-sticker '+(stickers.includes(b.id+":"+a.id)?"is-collected":"")+'"><span>'+a.icon+'</span><strong>'+esc(a.name)+'</strong><small>'+esc(b.name)+'</small></div>')).join("");
 return '<div class="cozy-album"><div class="album-summary"><strong>📒 '+stickers.length+' cozy keepsakes</strong><span>Visit special places to complete your collection!</span></div><div class="album-sticker-grid">'+cards+'</div></div>';
}
export function roomNavigatorMarkup(game){
 const b=BUILDING_BY_ID[game.location];if(!b||b.rooms.length<2)return "";
 return '<div class="premium-room-tabs" role="group" aria-label="Rooms in '+esc(b.name)+'">'+b.rooms.map(r=>btn("🚪 "+esc(r.name),"enter-room",r.id,"premium-room-tab "+(game.world.room===r.id?"is-selected":""))).join("")+'</div>';
}
