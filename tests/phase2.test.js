import test from "node:test";
import assert from "node:assert/strict";
import { newGame, act, sanitize } from "../src/state.js";
test("furniture buying, movement and validation",()=>{
 let g=act(newGame(),"travel",{place:"home"}).game;
 assert.equal(act(newGame(),"buy-furniture",{id:"chair"}).ok,false);
 const r=act(g,"buy-furniture",{id:"chair"});
 assert.equal(r.ok,true);g=r.game;
 assert.equal(g.decor.length,1);
 assert.equal(g.coins,52);
 g=act(g,"move-furniture",{index:0,x:900,y:400}).game;
 assert.equal(sanitize(g).decor[0].x,900);
 assert.equal(act(g,"move-furniture",{index:3,x:300,y:300}).ok,false);
});
test("friendship only at correct location",()=>{
 let g=newGame();
 assert.equal(act(g,"talk",{id:"luna"}).ok,false);
 g=act(g,"travel",{place:"school"}).game;
 for(let i=0;i<15;i++)g=act(g,"talk",{id:"luna"}).game;
 assert.equal(sanitize(g).friends.luna,100);
});
test("older save remains compatible",()=>{
 const g=newGame();delete g.decor;delete g.friends;
 assert.deepEqual(sanitize(g).decor,[]);
 assert.equal(sanitize(g).friends.luna,0);
});
