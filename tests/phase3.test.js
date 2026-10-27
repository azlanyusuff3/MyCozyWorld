import test from "node:test";
import assert from "node:assert/strict";
import {newGame,act,sanitize} from "../src/state.js";
test("career shifts pay coins and restrict repeated shifts",()=>{
 let g=act(newGame(),"travel",{place:"market"}).game;
 const initial=g.coins;
 const first=act(g,"work",{id:"barista"});
 assert.equal(first.ok,true);g=first.game;
 assert.equal(g.coins,initial+18);
 assert.equal(g.career.shifts,1);
 assert.equal(act(g,"work",{id:"barista"}).ok,false);
 assert.equal(sanitize(g).career.shifts,1);
});
test("achievement rewards cannot be claimed twice",()=>{
 let g=act(newGame(),"travel",{place:"school"}).game;
 g=act(g,"work",{id:"tutor"}).game;
 const reward=act(g,"claim-goal",{id:"firstJob"});
 assert.equal(reward.ok,true);
 assert.equal(reward.game.coins,g.coins+15);
 assert.equal(act(reward.game,"claim-goal",{id:"firstJob"}).ok,false);
});
test("conversations progress social goal and older saves migrate",()=>{
 let g=newGame();delete g.career;
 assert.equal(sanitize(g).career.shifts,0);
 g=act(g,"travel",{place:"park"}).game;
 g=act(g,"talk",{id:"milo"}).game;
 assert.equal(g.career.social,1);
});
