export const FURNITURE={chair:{name:"Cloud Chair",icon:"🪑",cost:12},plant:{name:"Little Fern",icon:"🪴",cost:8},lamp:{name:"Star Lamp",icon:"💡",cost:15},rug:{name:"Cozy Rug",icon:"🧶",cost:20},teddy:{name:"Teddy Bear",icon:"🧸",cost:10}};
export const FRIENDS={luna:{name:"Luna",icon:"👩🏽",place:"school"},milo:{name:"Milo",icon:"👦🏻",place:"park"},poppy:{name:"Poppy",icon:"👩🏼",place:"boutique"}};
export function phase2Action(source,type,payload={}){
 const game=structuredClone(source);
 game.decor=Array.isArray(game.decor)?game.decor:[];
 game.friends=game.friends||{};
 if(type==="buy-furniture"){
  const item=FURNITURE[payload.id];
  if(game.location!=="home"||!item)return {game:source,ok:false,message:"Decorate at home."};
  if(game.coins<item.cost)return {game:source,ok:false,message:"Not enough coins."};
  if(game.decor.length>=12)return {game:source,ok:false,message:"Room is full."};
  game.coins-=item.cost;game.decor.push({id:payload.id,x:160+(game.decor.length%4)*220,y:360});
  return {game,ok:true,message:item.name+" added!"};
 }
 if(type==="move-furniture"){
  const i=Number(payload.index);
  if(game.location!=="home"||!Number.isInteger(i)||i<0||i>=game.decor.length)return {game:source,ok:false,message:"Furniture not found."};
  game.decor[i].x=Math.max(100,Math.min(1080,Number(payload.x)||100));
  game.decor[i].y=Math.max(290,Math.min(450,Number(payload.y)||290));
  return {game,ok:true,message:"Furniture moved!"};
 }
 if(type==="talk"){
  const friend=FRIENDS[payload.id];
  if(!friend||game.location!==friend.place)return {game:source,ok:false,message:"Friend is somewhere else."};
  game.friends[payload.id]=Math.min(100,(game.friends[payload.id]||0)+10);
  game.stats.joy=Math.min(100,game.stats.joy+5);
  return {game,ok:true,message:friend.name+" says hello! Friendship "+game.friends[payload.id]+"/100"};
 }
 return {game:source,ok:false,message:"Unknown action."};
}