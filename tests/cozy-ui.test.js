import test from "node:test";
import assert from "node:assert/strict";
import { BUILDINGS,DISTRICTS,BUILDINGS_IN } from "../src/world4.js";
import { newGame,act } from "../src/state.js";
import { cozySceneSvg,welcomeSvg,districtLandscapeSvg } from "../src/cozy-art.js";
import { welcomeMarkup,worldMapMarkup,careerDashboardMarkup,albumMarkup,roomNavigatorMarkup } from "../src/cozy-ui.js";

test("start screen contains original landscape, working navigation buttons and safe character text",()=>{
 const g=newGame();g.avatar.name='<unsafe&"';
 const html=welcomeMarkup(g,'<svg></svg>');
 assert.match(html,/welcome-screen/);
 assert.match(html,/data-action="start-game"/);
 assert.match(html,/data-action="edit-avatar"/);
 assert.match(html,/data-action="menu-settings"/);
 assert.doesNotMatch(html,/<unsafe/);
 assert.match(html,/&lt;unsafe&amp;&quot;/);
 assert.match(welcomeSvg(),/cozy-illustration/);
});
test("interactive town and district landscapes have genuine drawn SVG, not images or placeholders",()=>{
 const town=cozySceneSvg("town");
 for(const place of ["home","school","market","boutique","park"])assert.ok(town.includes('data-place="'+place+'"'),place);
 assert.match(town,/<svg/);
 assert.match(town,/path/);
 for(const district of DISTRICTS){
  const svg=districtLandscapeSvg(district.id);
  assert.ok(svg.startsWith("<svg"));
  for(const b of BUILDINGS_IN(district.id))assert.ok(svg.includes(b.icon),b.id);
 }
});
test("all 30 buildings have illustrated clickable activities in the correct rooms",()=>{
 for(const building of BUILDINGS){
  for(const room of building.rooms){
   const scene=cozySceneSvg(building.id,room.id);
   assert.match(scene,/cozy-illustration/);
   assert.match(scene,new RegExp(building.id==="beach"?"<svg":"<svg"));
   const activities=building.actions.filter(x=>x.room===room.id);
   for(const action of activities)assert.ok(scene.includes('data-action="explore" data-value="'+action.id+'"'),building.id+":"+action.id);
  }
 }
});
test("map pins preserve the 5-district six-place navigation and selected state",()=>{
 const game=newGame();
 for(const district of DISTRICTS){
  const html=worldMapMarkup(game,district.id);
  assert.equal((html.match(/class="world-map-pin /g)||[]).length,6);
  assert.equal((html.match(/data-action="district"/g)||[]).length,5);
  for(const b of BUILDINGS_IN(district.id))assert.ok(html.includes('data-value="'+b.id+'"'),b.id);
 }
 let g=act(game,"travel",{place:"hospital"}).game;
 const html=worldMapMarkup(g,"services");
 assert.match(html,/class="world-map-pin visited"/);
 assert.match(html,/1 \/ 30 places discovered/);
});
test("room navigation tracks school, hospital and mall; remaining buildings have no false tabs",()=>{
 let g=act(newGame(),"travel",{place:"school"}).game;
 let html=roomNavigatorMarkup(g);
 assert.match(html,/Classroom/);
 assert.match(html,/Library/);
 assert.match(html,/Art Room/);
 assert.equal((html.match(/data-action="enter-room"/g)||[]).length,3);
 g=act(g,"travel",{place:"hospital"}).game;
 assert.equal((roomNavigatorMarkup(g).match(/data-action="enter-room"/g)||[]).length,3);
 g=act(g,"travel",{place:"home"}).game;
 assert.equal(roomNavigatorMarkup(g),"");
});
test("career and keepsake screens render real reward actions",()=>{
 const game=newGame();
 const career=careerDashboardMarkup(game);
 assert.match(career,/data-action="claim-daily"/);
 assert.match(career,/data-action="claim-goal"/);
 assert.match(career,/data-action="travel"/);
 assert.match(career,/data-action="album"/);
 assert.match(albumMarkup(game),/album-sticker-grid/);
});

test("themed SVG visuals differ by building and room",()=>{assert.notEqual(cozySceneSvg("hospital","main"),cozySceneSvg("hospital","room1"));assert.notEqual(cozySceneSvg("school","room1"),cozySceneSvg("school","room2"));assert.match(cozySceneSvg("hospital","room1"),/Treatment Room/);assert.match(cozySceneSvg("mall","room2"),/Cozy Arcade/);assert.match(cozySceneSvg("cafe"),/COZY CAFÉ/);});
