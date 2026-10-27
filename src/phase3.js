export const JOBS=Object.freeze({barista:{name:"Cafe Helper",icon:"☕",place:"market",pay:18,energy:13},tutor:{name:"Junior Tutor",icon:"📚",place:"school",pay:20,energy:14},gardener:{name:"Park Gardener",icon:"🌱",place:"park",pay:16,energy:11}});
export const GOALS=Object.freeze({firstJob:{name:"First paycheck",target:1,reward:15},social:{name:"Friendly neighbour",target:3,reward:12},worker:{name:"Hard worker",target:5,reward:30}});
const clamp=(n,a,b)=>Math.max(a,Math.min(b,Number.isFinite(Number(n))?Number(n):a));
export function normalizeCareer(raw){return {shifts:Math.floor(clamp(raw?.shifts,0,9999)),lastShiftDay:Math.floor(clamp(raw?.lastShiftDay,0,9999)),social:Math.floor(clamp(raw?.social,0,9999)),claimed:Array.isArray(raw?.claimed)?raw.claimed.filter(x=>Object.hasOwn(GOALS,x)):[]};}
export function phase3Action(source,type,payload={}){
 const g=structuredClone(source);g.career=normalizeCareer(g.career);
 if(type==="work"){
  const job=JOBS[payload.id];if(!job||g.location!==job.place)return {game:source,ok:false,message:"Visit the workplace first."};
  if(g.career.lastShiftDay===g.day)return {game:source,ok:false,message:"You've already worked today. Come back tomorrow!"};
  if(g.stats.energy<job.energy)return {game:source,ok:false,message:"Too tired to work. Rest at home first."};
  g.stats.energy=clamp(g.stats.energy-job.energy,0,100);g.stats.hunger=clamp(g.stats.hunger-8,0,100);
  g.coins+=job.pay;g.career.shifts++;g.career.lastShiftDay=g.day;
  const mins=g.minute+90;g.day+=Math.floor(mins/1440);g.minute=mins%1440;
  return {game:g,ok:true,message:"Great shift! Earned "+job.pay+" coins."};
 }
 if(type==="claim-goal"){
  const id=payload.id,goal=GOALS[id];if(!goal||g.career.claimed.includes(id))return {game:source,ok:false,message:"Reward unavailable."};
  const value=id==="social"?g.career.social:g.career.shifts;
  if(value<goal.target)return {game:source,ok:false,message:"Goal not complete yet."};
  g.career.claimed.push(id);g.coins+=goal.reward;
  return {game:g,ok:true,message:"Achievement unlocked! +"+goal.reward+" coins."};
 }
 return {game:source,ok:false,message:"Unknown activity."};
}
