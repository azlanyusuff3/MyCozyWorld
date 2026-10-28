import test from "node:test";
import assert from "node:assert/strict";
import { newGame, act } from "../src/state.js";
import { BUILDINGS, DISTRICTS } from "../src/world4.js";
import { cozySceneSvg, townSvg, welcomeSvg, districtLandscapeSvg } from "../src/cozy-art.js";
import { welcomeMarkup, worldMapMarkup, careerDashboardMarkup, albumMarkup, roomNavigatorMarkup } from "../src/cozy-ui.js";

test("Illustrated Phase 4 includes a playable scene for all 30 destinations and every room",()=>{
 assert.equal(BUILDINGS.length,30);
 for(const building of BUILDINGS){
  for(const room of building.rooms){
   const art=cozySceneSvg(building.id,room.id);
   assert.match(art,/<svg[^>]+viewBox="0 0 1200 650"/);
   assert.match(art,/data-action="explore"/);
   const expected=building.actions.filter(a=>a.room===room.id);
   for(const item of expected){
    assert.ok(art.includes('data-value="'+item.id+'"'),building.id+" "+room.id+" should include "+item.name);
    assert.ok(art.includes('aria-label="'+item.name.replace(/&/g,"&amp;")+'"'));
   }
  }
 }
});
test("Five themed district maps expose exactly six named interactive travel pins each",()=>{
 const game=newGame();
 for(const district of DISTRICTS){
  const map=worldMapMarkup(game,district.id);
  assert.equal((map.match(/class="world-map-pin /g)||[]).length,6);
  assert.equal((map.match(/class="district-pill /g)||[]).length,5);
  assert.equal((map.match(/data-action="travel"/g)||[]).length,7);
  assert.ok(districtLandscapeSvg(district.id).includes("<svg"));
  assert.ok(map.includes("world-illustrated-map"));
 }
});
test("Town illustration has five clickable destinations, menu has functional controls",()=>{
 const town=townSvg();
 assert.equal((town.match(/data-place="/g)||[]).length,5);
 const welcome=welcomeMarkup(newGame(),'<svg aria-label="avatar"></svg>');
 assert.match(welcome,/data-action="start-game"/);
 assert.match(welcome,/data-action="edit-avatar"/);
 assert.match(welcome,/data-action="menu-settings"/);
 assert.doesNotMatch(welcome,/data-action="resume-game"/);
 const ready=newGame();ready.characterReady=true;
 assert.match(welcomeMarkup(ready,"<svg></svg>"),/data-action="resume-game"/);
 assert.match(welcomeSvg(),/<svg/);
});
test("Interior navigation and career UI preserve existing actions",()=>{
 let game=act(newGame(),"travel",{place:"hospital"}).game;
 let rooms=roomNavigatorMarkup(game);
 assert.equal((rooms.match(/data-action="enter-room"/g)||[]).length,3);
 game=act(game,"enter-room",{room:"room1"}).game;
 rooms=roomNavigatorMarkup(game);
 assert.match(rooms,/is-selected/);
 assert.match(careerDashboardMarkup(game),/data-action="claim-daily"/);
 assert.match(careerDashboardMarkup(game),/data-action="claim-goal"/);
 assert.match(albumMarkup(game),/cozy-album/);
});
