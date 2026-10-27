// Original vector props: contextual dressing makes each Cozyville room recognisable.
// Decorative SVG only. All tap targets remain in cozy-art activityHotspots().
const panel=(x,y,icon,color="#fff1d8",size=78)=>'<g><rect x="'+x+'" y="'+y+'" width="220" height="178" rx="25" fill="'+color+'" stroke="#d7b59c" stroke-width="9"/><circle cx="'+(x+110)+'" cy="'+(y+78)+'" r="65" fill="#fff9ed" opacity=".76"/><text x="'+(x+110)+'" y="'+(y+108)+'" text-anchor="middle" font-size="'+size+'">'+icon+'</text></g>';
const banner=(x,y,label,color="#f8e6c7")=>'<g><rect x="'+x+'" y="'+y+'" width="340" height="66" rx="20" fill="'+color+'" stroke="#fff7ec" stroke-width="7"/><text x="'+(x+170)+'" y="'+(y+44)+'" text-anchor="middle" font-size="30" fill="#775950">'+label+'</text></g>';
const counter=(x,y,w=460)=>'<g><rect x="'+x+'" y="'+y+'" width="'+w+'" height="105" rx="22" fill="#bd8f70" stroke="#996e5d" stroke-width="8"/><rect x="'+(x-10)+'" y="'+(y-18)+'" width="'+(w+20)+'" height="30" rx="14" fill="#e3b998"/><path d="M'+(x+22)+' '+(y+33)+'h'+(w-44)+'M'+(x+22)+' '+(y+76)+'h'+(w-44)+'" stroke="#9f785f" stroke-width="4" opacity=".6"/></g>';
const monitor=(x,y)=>'<g><rect x="'+x+'" y="'+y+'" width="220" height="125" rx="18" fill="#506c7e" stroke="#a6babf" stroke-width="10"/><rect x="'+(x+13)+'" y="'+(y+13)+'" width="194" height="99" rx="6" fill="#b6e4d3"/><path d="M'+(x+20)+' '+(y+62)+'h35l15-24 22 49 25-49 17 24h59" fill="none" stroke="#6aae97" stroke-width="8"/></g>';
const books=(x,y)=>'<g>'+Array.from({length:6},(_,i)=>'<rect x="'+(x+i*33)+'" y="'+(y+(i%2)*8)+'" width="29" height="'+(100-(i%2)*8)+'" rx="4" fill="'+["#e7a3b0","#91bda1","#e7c38e","#a9b0d9","#d5a2c0","#93c9b5"][i]+'" stroke="#fff2dd" stroke-width="3"/>').join("")+'</g>';
const easel=(x,y)=>'<g><path d="M'+(x+40)+' '+(y+280)+' '+(x+132)+' '+(y+2)+' '+(x+225)+' '+(y+280)+'M'+(x+70)+' '+(y+212)+'h123" stroke="#a97d63" stroke-width="16" fill="none"/><rect x="'+(x+45)+'" y="'+(y+35)+'" width="175" height="162" rx="13" fill="#fff8e9" stroke="#c8a182" stroke-width="12"/><circle cx="'+(x+124)+'" cy="'+(y+104)+'" r="43" fill="#ecc8a3"/><path d="M'+(x+66)+' '+(y+170)+'Q'+(x+126)+' '+(y+85)+' '+(x+198)+' '+(y+162)+'" stroke="#7aaf98" stroke-width="12" fill="none"/><circle cx="'+(x+75)+'" cy="'+(y+83)+'" r="13" fill="#e7a6ad"/></g>';
const foodTable=(x,y)=>'<g><ellipse cx="'+x+'" cy="'+y+'" rx="135" ry="42" fill="#d4a27e" stroke="#a87b62" stroke-width="8"/><path d="M'+(x-92)+' '+(y+30)+'v80m190-80v80" stroke="#986f5f" stroke-width="16"/><text x="'+(x-70)+'" y="'+(y-5)+'" font-size="60">🍰</text><text x="'+(x+24)+'" y="'+(y-5)+'" font-size="58">🥛</text></g>';
const bench=(x,y)=>'<g><rect x="'+x+'" y="'+y+'" width="305" height="60" rx="18" fill="#ba9477" stroke="#98755f" stroke-width="8"/><rect x="'+x+'" y="'+(y-75)+'" width="305" height="65" rx="16" fill="#d2ae89" stroke="#a27b67" stroke-width="7"/><path d="M'+(x+38)+' '+(y+57)+'v65m230-65v65" stroke="#8e6c57" stroke-width="14"/></g>';
const seedling=(x,y)=>'<g><path d="M'+x+' '+y+'v-87" stroke="#67a081" stroke-width="8"/><path d="M'+x+' '+(y-42)+'Q'+(x-69)+' '+(y-125)+' '+(x-78)+' '+(y-56)+'Q'+(x-38)+' '+(y-24)+' '+x+' '+(y-42)+'M'+x+' '+(y-56)+'Q'+(x+70)+' '+(y-151)+' '+(x+76)+' '+(y-75)+'Q'+(x+45)+' '+(y-35)+' '+x+' '+(y-56)+'" fill="#88c6a1" stroke="#569575" stroke-width="5"/><path d="M'+(x-33)+' '+y+'h67l-11 46h-45Z" fill="#ce977a" stroke="#ad7665" stroke-width="5"/></g>';
const arch=(x,y)=>'<g><path d="M'+x+' '+(y+245)+'V'+(y+100)+'Q'+(x+140)+' '+(y-75)+' '+(x+280)+' '+(y+100)+'v145" fill="none" stroke="#c5a18d" stroke-width="25"/><path d="M'+(x+34)+' '+(y+245)+'V'+(y+104)+'Q'+(x+140)+' '+(y-19)+' '+(x+246)+' '+(y+104)+'v141" fill="none" stroke="#e8ccaa" stroke-width="8"/></g>';
const pool=(x,y)=>'<g><ellipse cx="'+x+'" cy="'+y+'" rx="210" ry="63" fill="#8cd3e4" stroke="#e7f6e5" stroke-width="20"/><ellipse cx="'+x+'" cy="'+y+'" rx="173" ry="34" fill="#b8e7e8"/><path d="M'+(x-100)+' '+y+'q50-30 100 0t100 0" fill="none" stroke="#f7fcf4" stroke-width="9"/></g>';
const starField=(x,y)=>'<g>'+Array.from({length:11},(_,i)=>'<text x="'+(x+(i*55)%300)+'" y="'+(y+(i*47)%150)+'" font-size="'+(18+(i%3)*10)+'" fill="#ffe69d">'+(i%2?"✦":"✧")+'</text>').join("")+'</g>';
export function sceneProps(place,room="main"){
 if(place==="school"){
  if(room==="room1")return banner(390,96,"📚 School Library","#eee2ef")+books(420,292)+books(730,292)+panel(910,265,"📖","#eef6ed");
  if(room==="room2")return banner(390,96,"🎨 Color Studio","#f8dfdf")+easel(470,215)+panel(845,255,"🖌️","#fff2de");
  return panel(938,240,"✏️","#fff0dc");
 }
 if(place==="hospital"){
  if(room==="room1")return banner(400,98,"🩺 Treatment Room","#d8f0ee")+'<rect x="420" y="334" width="450" height="87" rx="32" fill="#f7f9f6" stroke="#9bbfc1" stroke-width="13"/><rect x="475" y="316" width="104" height="44" rx="19" fill="#a5d9d6"/>'+monitor(860,169);
  if(room==="room2")return banner(410,101,"💊 Pharmacy","#d9eeef")+panel(445,265,"💊","#d1e9e3")+panel(730,265,"🧪","#e7e0f2");
  return banner(410,100,"❤ Cozy Care Clinic","#f9e7e4")+counter(425,350,480)+panel(920,230,"🩺","#e4f5f0");
 }
 if(place==="mall"){
  if(room==="room1")return banner(400,99,"🍱 Food Court","#fff0d1")+foodTable(565,413)+panel(890,250,"🍜","#fff0d6");
  if(room==="room2")return banner(414,99,"🕹️ Cozy Arcade","#d8dcf2")+panel(390,245,"🕹️","#c9d9f0")+panel(685,245,"🎮","#d7c8f3")+starField(920,220);
  return banner(418,101,"🛍️ Shops & Friends","#fae5db")+arch(460,196)+panel(842,220,"🛍️","#f5dae9");
 }
 if(place==="kindergarten")return banner(417,105,"🌈 Rainbow Learning","#fbe1dc")+panel(385,256,"🧸","#fce9ba")+panel(718,256,"🧱","#deecf9");
 if(place==="library")return banner(410,95,"📚 Storytime","#e5e6f0")+books(405,290)+books(750,290)+panel(920,255,"📖","#f6e8c9");
 if(place==="artstudio")return banner(397,99,"🎨 Let's Create","#fae5ea")+easel(470,215)+panel(892,252,"🎨","#fbeed9");
 if(place==="science")return banner(389,100,"🔬 Little Scientists","#d9edf5")+panel(420,238,"🔬","#d7e6ed")+panel(738,238,"🧪","#dfebf2");
 if(place==="sports")return '<g><rect x="405" y="175" width="295" height="25" rx="7" fill="#b9d1dc"/><path d="M552 200v104" stroke="#b7bdc1" stroke-width="18"/><circle cx="552" cy="277" r="66" fill="none" stroke="#d99d82" stroke-width="12"/><path d="M505 284Q552 365 600 284" fill="none" stroke="#f3dfcf" stroke-width="7"/></g>'+panel(831,245,"🏀","#fbecd8");
 if(place==="market")return banner(418,100,"🍎 FRESH & HAPPY","#ffdfc4")+panel(379,287,"🍎","#f8e6cc")+panel(727,287,"🥑","#e0efde");
 if(place==="boutique")return banner(420,91,"👗 NEW ARRIVALS","#fae3f0")+panel(840,230,"👜","#f8deea");
 if(place==="salon")return banner(393,101,"💇 Beauty Studio","#f5dcec")+panel(420,260,"💇","#f9e6f2")+panel(748,260,"🪞","#d9e7e8");
 if(place==="bakery")return banner(407,99,"🥐 Warm & Fresh","#f9e3cd")+panel(419,260,"🍰","#fff0db")+panel(745,260,"🍞","#f4e8cf");
 if(place==="toyshop")return banner(411,101,"🧸 Toy Wonderland","#f8e7cf")+panel(418,249,"🧸","#fce0df")+panel(760,249,"🚂","#dfeef1");
 if(place==="furniture")return banner(404,93,"🛋️ Cozy Designs","#f3ded0")+panel(806,250,"🪴","#e2f0d7");
 if(place==="petstore")return banner(394,105,"🐾 Friendly Pets","#e2efdf")+panel(406,265,"🐶","#f4e4dc")+panel(769,265,"🐱","#e5edf4");
 if(place==="apartments")return banner(404,101,"🌇 Rooftop Garden","#e2efd6")+seedling(470,420)+seedling(740,420)+pool(950,452);
 if(place==="neighbor")return banner(402,100,"🏡 Hello, Neighbor!","#f8e1d4")+panel(465,260,"🍪","#f8eddc");
 if(place==="community")return banner(403,100,"🤝 Together We Grow","#f6dfd4")+panel(468,270,"🎨","#f8e9d5")+panel(778,270,"💃","#e5e6f7");
 if(place==="dentist")return banner(403,95,"🦷 Happy Smiles","#dff2ee")+panel(450,245,"🪥","#e4f5ed")+panel(744,245,"🦷","#f8f2dd");
 if(place==="firestation")return banner(398,93,"🚒 Rescue Heroes","#fae2ce")+panel(415,260,"🚒","#f8d8c7")+panel(745,260,"🧯","#fbe6dd");
 if(place==="police")return banner(418,98,"👮 Helping Hands","#e1e8f5")+counter(436,330,490)+panel(914,255,"🚦","#e9e9f3");
 if(place==="postoffice")return banner(394,99,"📮 Mail & Parcels","#f8e1ce")+panel(417,264,"✉️","#f8edcf")+panel(747,264,"📦","#f3e0d0");
 if(place==="cityhall")return banner(397,98,"🏛️ Town Council","#e3e8ef")+panel(444,280,"🗳️","#e9e8f5")+panel(760,280,"🚩","#e8dfeb");
 if(place==="cafe")return banner(406,102,"☕ COZY CAFÉ","#f5e2cf")+foodTable(602,410)+panel(920,237,"☕","#fff1dc");
 if(place==="restaurant")return banner(408,102,"🍽️ Family Restaurant","#f9e4d2")+foodTable(540,417)+panel(900,238,"🍲","#fff1d6");
 if(place==="playground")return '<g><path d="M420 415V220h220v195" fill="none" stroke="#c6926b" stroke-width="19"/><path d="M397 228L527 125 667 228" fill="#e69ca0" stroke="#c3817f" stroke-width="9"/><path d="M565 258v155" stroke="#d3a16d" stroke-width="15"/><path d="M565 350l145 75" stroke="#f6c86d" stroke-width="55" stroke-linecap="round"/></g>'+panel(873,255,"🪁","#fff1d0");
 if(place==="cinema")return banner(391,102,"🎬 MOVIE TIME","#dce0ed")+'<rect x="390" y="190" width="470" height="244" rx="15" fill="#5d617d" stroke="#c7c2d4" stroke-width="17"/><text x="625" y="331" text-anchor="middle" font-size="100">🍿</text>'+starField(888,224);
 if(place==="beach")return '<g><path d="M350 430v-248" stroke="#ad8e67" stroke-width="15"/><path d="M350 192Q570 151 590 330L350 192Q170 200 110 310Z" fill="#f2a6ac" stroke="#fff2e0" stroke-width="10"/><path d="M350 192Q432 223 476 310" stroke="#fff2e2" stroke-width="11" fill="none"/></g>'+pool(830,482)+panel(975,240,"🐚","#f1e1ca");
 if(place==="park")return '<g><ellipse cx="880" cy="474" rx="220" ry="89" fill="#96d4d7" stroke="#fff8eb" stroke-width="17"/><ellipse cx="880" cy="474" rx="156" ry="58" fill="#b8e7e4"/><path d="M880 355v90" stroke="#c8c9d3" stroke-width="12"/><circle cx="880" cy="347" r="22" fill="#f9f0cf"/></g>'+bench(198,460);
 if(place==="home")return '<g><rect x="480" y="176" width="150" height="130" rx="17" fill="#f2d1bd" stroke="#bf947d" stroke-width="12"/><rect x="496" y="198" width="120" height="94" rx="8" fill="#9d786b"/><path d="M516 282q12-49 27-30 15-55 31-5t28 35" fill="#f9c780"/><path d="M500 304h108" stroke="#b68d78" stroke-width="13"/></g>';
 return "";
}
