import test from "node:test";
import assert from "node:assert/strict";
import { BUILDINGS,BUILDING_BY_ID,DISTRICTS,BUILDINGS_IN } from "../src/world4.js";
import { PLACES } from "../src/data.js";
import { newGame,act,sanitize } from "../src/state.js";

test("Cozyville includes 30 unique accessible destinations across five districts",()=>{
 assert.equal(BUILDINGS.length,30);
 assert.equal(new Set(BUILDINGS.map(b=>b.id)).size,30);
 assert.equal(DISTRICTS.length,5);
 for(const d of DISTRICTS)assert.equal(BUILDINGS_IN(d.id).length,6);
 for(const b of BUILDINGS){
  assert.ok(PLACES[b.id]);
  assert.equal(b.actions.length,3);
  assert.ok(b.rooms.length>0);
  for(const a of b.actions)assert.ok(b.rooms.some(r=>r.id===a.room));
 }
});
test("travel, multiroom visits, activity gains and exploration persist",()=>{
 let g=newGame();
 let r=act(g,"travel",{place:"hospital"});assert.equal(r.ok,true);g=r.game;
 assert.ok(g.world.visited.includes("hospital"));
 assert.equal(g.world.room,"main");
 assert.equal(act(g,"explore",{id:"1"}).ok,false);
 r=act(g,"enter-room",{room:"room1"});assert.equal(r.ok,true);g=r.game;
 const before=g.stats.joy;
 r=act(g,"explore",{id:"1"});assert.equal(r.ok,true);g=r.game;
 assert.ok(g.stats.joy>before);assert.equal(g.world.actions,1);
 assert.equal(sanitize(g).world.room,"room1");
 assert.equal(sanitize(g).world.actions,1);
 r=act(g,"travel",{place:"mall"});assert.equal(r.ok,true);
 assert.equal(r.game.world.room,"main");
 assert.ok(r.game.world.visited.includes("hospital"));
});
test("collectibles only count once and reward is not duplicated",()=>{
 let g=act(newGame(),"travel",{place:"cinema"}).game;
 let r=act(g,"explore",{id:"2"});assert.equal(r.ok,true);g=r.game;
 assert.equal(g.world.stickers.length,1);
 assert.equal(act(g,"explore",{id:"2"}).ok,false);
 assert.equal(sanitize(g).world.stickers.length,1);
});
test("world save migration blocks invalid room, unknown buildings and fraudulent rewards",()=>{
 let g=newGame();delete g.world;assert.equal(sanitize(g).world.room,"main");
 g=act(g,"travel",{place:"school"}).game;
 assert.equal(act(g,"enter-room",{room:"treasure"}).ok,false);
 assert.equal(act(g,"explore",{id:"999"}).ok,false);
 g.world={room:"room9",visited:["school","fake"],stickers:["cinema:2","fake:5"],actions:8};
 const safe=sanitize(g);
 assert.equal(safe.world.room,"main");
 assert.deepEqual(safe.world.visited,["school"]);
 assert.deepEqual(safe.world.stickers,["cinema:2"]);
});
test("Phase 1-3 legacy locations and actions remain accessible",()=>{
 for(const id of ["home","school","market","boutique","park"])assert.ok(BUILDING_BY_ID[id]);
 let g=act(newGame(),"travel",{place:"park"}).game;
 assert.equal(act(g,"play").ok,true);
 assert.equal(act(g,"talk",{id:"milo"}).ok,true);
});
