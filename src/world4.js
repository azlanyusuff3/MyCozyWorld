// Phase 4: complete Cozyville directory; 30 destinations in five districts.
// Activity tuple: label, icon, stat/coins/sticker, amount, room index, description.
export const DISTRICTS=Object.freeze([
 {id:"neighborhood",name:"Neighborhood",icon:"🏘️",color:"#f4bfa9",caption:"Homes, pets and community"},
 {id:"learning",name:"Learning",icon:"🎒",color:"#cbb9ed",caption:"Discover, create and play"},
 {id:"shopping",name:"Shopping",icon:"🛍️",color:"#f3c3d9",caption:"Shops and happy treats"},
 {id:"services",name:"Services",icon:"🏥",color:"#b6dfe6",caption:"Helpers around town"},
 {id:"leisure",name:"Leisure",icon:"🎠",color:"#b8dcb9",caption:"Food, games and sunshine"}
]);
const B=[
 ["home","My Home","🏡","neighborhood",["Living Room"],[["Make breakfast","🥞","hunger",14,0,"Cook a delicious breakfast"],["Water the flowers","🌷","joy",9,0,"Keep the plants happy"],["Write a journal","📔","knowledge",6,0,"Remember a cozy day"]]],
 ["apartments","Cozy Apartments","🏢","neighborhood",["Rooftop Garden"],[["Visit the rooftop","🌇","joy",12,0,"Enjoy the view"],["Sort the mail","📨","coins",4,0,"Help deliver letters"],["Tend balcony pots","🪴","knowledge",7,0,"Grow tiny herbs"]]],
 ["neighbor","Neighbor's House","🏠","neighborhood",["Family Lounge"],[["Share cookies","🍪","hunger",10,0,"Taste homemade treats"],["Help clean up","🧹","coins",5,0,"Tidy the room together"],["Play board games","🎲","joy",13,0,"Play a friendly game"]]],
 ["furniture","Furniture Store","🛋️","neighborhood",["Showroom"],[["Try a sofa","🛋️","energy",12,0,"Find a comfy sofa"],["Style a corner","🖼️","joy",11,0,"Match colorful cushions"],["Help with boxes","📦","coins",5,0,"Assist the shopkeeper"]]],
 ["petstore","Pet Store","🐶","neighborhood",["Animal Care"],[["Feed the kittens","🐱","joy",12,0,"Prepare kitten food"],["Brush a puppy","🐕","joy",9,0,"Care for a friendly puppy"],["Organize pet toys","🧸","coins",5,0,"Sort the toy baskets"]]],
 ["community","Community Center","🤝","neighborhood",["Activity Hall"],[["Join dance class","💃","joy",12,0,"Follow the dance steps"],["Volunteer","🙌","coins",6,0,"Help the community"],["Paint a mural","🎨","knowledge",8,0,"Add a splash of color"]]],
 ["school","Cozy School","🏫","learning",["Classroom","Library","Art Room"],[["Solve a puzzle","🧩","knowledge",12,0,"Learn with classroom puzzles"],["Explore the library","📚","knowledge",10,1,"Find an exciting new book"],["Draw a masterpiece","🎨","joy",12,2,"Create your own artwork"]]],
 ["kindergarten","Kindergarten","🧒","learning",["Rainbow Room"],[["Build block towers","🧱","knowledge",8,0,"Stack blocks together"],["Sing along","🎵","joy",12,0,"Learn a new song"],["Sort the shapes","🔺","knowledge",9,0,"Match colorful shapes"]]],
 ["library","Town Library","📚","learning",["Reading Hall"],[["Browse the books","📖","knowledge",13,0,"Find a wonderful story"],["Read quietly","🤫","energy",8,0,"Relax in a reading nook"],["Help shelve books","📗","coins",5,0,"Put books in order"]]],
 ["artstudio","Art Studio","🎨","learning",["Paint Workshop"],[["Paint a canvas","🖌️","joy",13,0,"Mix vivid colors"],["Make clay pottery","🏺","knowledge",10,0,"Shape a tiny bowl"],["Display your art","🖼️","sticker",1,0,"Earn an artist badge"]]],
 ["science","Science Center","🔬","learning",["Discovery Lab"],[["Look through a scope","🔭","knowledge",15,0,"Explore the stars"],["Mix safe colors","🧪","knowledge",11,0,"See the colors change"],["Build a model","🚀","joy",10,0,"Launch an imaginary rocket"]]],
 ["sports","Sports Hall","🏀","learning",["Indoor Court"],[["Shoot hoops","🏀","joy",12,0,"Practice your throw"],["Try gymnastics","🤸","knowledge",8,0,"Learn a balancing trick"],["Help coach","🏅","coins",5,0,"Set out the equipment"]]],
 ["market","Supermarket","🛒","shopping",["Grocery Aisles"],[["Find fresh fruit","🍎","hunger",8,0,"Taste a fruit sample"],["Pack groceries","🛍️","coins",5,0,"Help pack shopping bags"],["Check the recipe","📝","knowledge",7,0,"Discover what to cook"]]],
 ["boutique","Fashion Boutique","👗","shopping",["Style Studio"],[["Try accessories","🎀","joy",11,0,"Style a new look"],["Plan an outfit","👒","knowledge",8,0,"Mix and match fabrics"],["Help the stylist","🪡","coins",5,0,"Organize the clothes"]]],
 ["salon","Hair Salon","💇","shopping",["Styling Chairs"],[["Choose a hairstyle","💈","joy",11,0,"Pick a playful style"],["Try colorful clips","🌈","joy",9,0,"Decorate your hair"],["Sweep the floor","🧹","coins",5,0,"Help keep the salon tidy"]]],
 ["bakery","Bakery","🥐","shopping",["Baking Kitchen"],[["Decorate a cupcake","🧁","hunger",13,0,"Add sweet frosting"],["Knead the dough","🍞","knowledge",9,0,"Learn to bake bread"],["Deliver a pastry","📦","coins",6,0,"Make a happy delivery"]]],
 ["toyshop","Toy Shop","🧸","shopping",["Toy Wonderland"],[["Build a train track","🚂","knowledge",9,0,"Connect the tracks"],["Test a plush toy","🧸","joy",12,0,"Meet a fluffy friend"],["Wrap a present","🎁","coins",5,0,"Tie a perfect bow"]]],
 ["mall","Shopping Mall","🏬","shopping",["Atrium","Food Court","Arcade"],[["Explore the atrium","🌸","joy",11,0,"Enjoy the indoor garden"],["Share a food tray","🍱","hunger",14,1,"Try tasty dishes"],["Win an arcade token","🕹️","sticker",1,2,"Take home an arcade sticker"]]],
 ["hospital","Hospital / Clinic","🏥","services",["Reception","Treatment Room","Pharmacy"],[["Register a visitor","📋","knowledge",7,0,"Help at reception"],["Check a teddy patient","🩺","joy",12,1,"Play pretend doctor"],["Sort medicine labels","💊","knowledge",12,2,"Organize safe pretend supplies"]]],
 ["dentist","Dentist","🦷","services",["Dental Room"],[["Brush a giant tooth","🪥","knowledge",12,0,"Learn proper brushing"],["Count the teeth","😁","knowledge",8,0,"Practice dental care"],["Choose a reward star","⭐","sticker",1,0,"Collect a brave smile badge"]]],
 ["firestation","Fire Station","🚒","services",["Rescue Bay"],[["Practice a drill","🧯","knowledge",11,0,"Learn a safety drill"],["Wash the fire truck","🚒","joy",9,0,"Help keep the truck shiny"],["Pack rescue gear","🧰","coins",6,0,"Check the equipment"]]],
 ["police","Police Station","👮","services",["Help Desk"],[["Find a lost toy","🧸","joy",11,0,"Reunite a toy with its owner"],["Learn road safety","🚦","knowledge",12,0,"Practice safe crossings"],["File pretend forms","📄","coins",5,0,"Help at the desk"]]],
 ["postoffice","Post Office","📮","services",["Sorting Room"],[["Stamp postcards","💌","knowledge",8,0,"Pick a lovely stamp"],["Sort parcels","📦","coins",6,0,"Match each address"],["Send a letter","✉️","sticker",1,0,"Keep a postcard souvenir"]]],
 ["cityhall","City Hall","🏛️","services",["Town Council"],[["Design a town flag","🚩","joy",12,0,"Create a colorful flag"],["Vote for a garden","🗳️","knowledge",10,0,"Make a community choice"],["Help organize files","🗂️","coins",6,0,"Support the town team"]]],
 ["cafe","Cozy Café","☕","leisure",["Coffee Corner"],[["Make hot cocoa","🍫","hunger",13,0,"Sip a cozy drink"],["Arrange the tables","🪑","coins",5,0,"Prepare for visitors"],["Listen to music","🎶","joy",12,0,"Enjoy a soft melody"]]],
 ["restaurant","Family Restaurant","🍽️","leisure",["Dining Room"],[["Set the table","🍽️","coins",5,0,"Lay out the plates"],["Taste soup","🍲","hunger",15,0,"Try today's special"],["Share a family story","💬","joy",11,0,"Tell a fun story"]]],
 ["park","Public Park","🌷","leisure",["Flower Garden"],[["Watch butterflies","🦋","joy",11,0,"Spot colorful wings"],["Care for seedlings","🌱","knowledge",9,0,"Help the little plants"],["Find a four-leaf clover","🍀","sticker",1,0,"Keep a lucky leaf badge"]]],
 ["playground","Adventure Playground","🛝","leisure",["Adventure Field"],[["Cross the rope bridge","🌉","joy",12,0,"Balance safely"],["Climb the lookout","🧗","knowledge",9,0,"See the whole park"],["Race down the slide","🛝","joy",14,0,"Zoom down the slide"]]],
 ["cinema","Cinema","🎬","leisure",["Movie Theater"],[["Watch a cartoon","🍿","joy",15,0,"Enjoy a funny film"],["Try the sound booth","🎧","knowledge",8,0,"Learn movie sounds"],["Collect a movie ticket","🎟️","sticker",1,0,"Add a ticket to your collection"]]],
 ["beach","Sunny Beach","🏖️","leisure",["Shoreline"],[["Build a sandcastle","🏰","joy",15,0,"Build a magical castle"],["Learn about shells","🐚","knowledge",10,0,"Discover beach treasures"],["Find a seashell","🐚","sticker",1,0,"Collect a shiny seashell"]]]
];
export const BUILDINGS=Object.freeze(B.map(([id,name,icon,district,rooms,actions],index)=>Object.freeze({id,name,icon,district,rooms:Object.freeze(rooms.map((name,i)=>({id:i===0?"main":"room"+i,name}))),index,actions:Object.freeze(actions.map(([name,icon,stat,value,room,description],i)=>Object.freeze({id:String(i),name,icon,stat,value,room:i===-1?"main":room===0?"main":"room"+room,description})))})));
export const BUILDING_BY_ID=Object.freeze(Object.fromEntries(BUILDINGS.map(b=>[b.id,b])));
const EXISTING=new Set(["home","school","market","boutique","park"]);
export const WORLD_LOCATIONS=Object.freeze(Object.fromEntries(BUILDINGS.filter(b=>!EXISTING.has(b.id)).map(b=>[b.id,{name:b.name,icon:b.icon,caption:DISTRICTS.find(d=>d.id===b.district).caption}])));
export const BUILDINGS_IN=district=>BUILDINGS.filter(b=>b.district===district);
