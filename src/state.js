import { world4Action,normalizeWorld,BUILDING_BY_ID } from "./world4.js";
import { phase3Action, normalizeCareer } from "./phase3.js";
import { phase2Action, FURNITURE, FRIENDS } from "./phase2.js";
import { PLACES, ITEMS, MARKET, CLOTHES, LOOKS, MISSIONS } from "./data.js";

export const SAVE_KEY = "my-cozy-world.save.v1";
export const SAVE_VERSION = 1;
const numeric = (n, low, high) => {
  const v = Number(n);
  return Math.max(low, Math.min(high, Number.isFinite(v) ? v : low));
};
const object = x => x !== null && typeof x === "object" && !Array.isArray(x);
const pick = (v, choices, def) => choices.includes(v) ? v : def;
export const safeName = value => typeof value === "string"
  ? (value.replace(/[\u0000-\u001f<>]/g, "").trim().slice(0, 18) || "Sunny")
  : "Sunny";

export function newGame() {
  return {
    version: SAVE_VERSION, createdAt: Date.now(), savedAt: null,
    characterReady: false,
    avatar: { name: "Sunny", skin: LOOKS.skin[1], hair: "bob", hairColor: LOOKS.hairColor[0], outfit: "overalls", outfitColor: LOOKS.outfitColor[0] },
    wardrobe: ["overalls", "shirt"], location: "town",
    position: { x: 610, y: 568 }, coins: 64,
    stats: { hunger: 73, energy: 84, joy: 82, knowledge: 0 },
    inventory: {}, progress: { book: false, study: false, outfit: false, shop: false, eat: false, rest: false, daisy: false },
    day: 1, minute: 8 * 60 + 30, steps: 0, sound: true, decor: [], friends: {}, career: normalizeCareer(), world: normalizeWorld()
  };
}
export function sanitize(raw) {
  const s = newGame();
  if (!object(raw) || raw.version !== SAVE_VERSION) return s;
  const a = object(raw.avatar) ? raw.avatar : {};
  s.avatar = {
    name: safeName(a.name),
    skin: pick(a.skin, LOOKS.skin, s.avatar.skin),
    hair: pick(a.hair, LOOKS.hair, s.avatar.hair),
    hairColor: pick(a.hairColor, LOOKS.hairColor, s.avatar.hairColor),
    outfit: pick(a.outfit, Object.keys(CLOTHES), s.avatar.outfit),
    outfitColor: pick(a.outfitColor, LOOKS.outfitColor, s.avatar.outfitColor)
  };
  s.wardrobe = [...new Set(["overalls", "shirt", ...(Array.isArray(raw.wardrobe) ? raw.wardrobe.filter(x => Object.hasOwn(CLOTHES, x)) : [])])];
  if (!s.wardrobe.includes(s.avatar.outfit)) s.avatar.outfit = "overalls";
  s.characterReady = !!raw.characterReady;
  s.location = Object.hasOwn(PLACES, raw.location) ? raw.location : "town";
  s.position = { x: numeric(raw.position?.x, 100, 1100), y: numeric(raw.position?.y, 493, 603) };
  s.coins = Math.floor(numeric(raw.coins, 0, 99999));
  for (const key of Object.keys(s.stats)) s.stats[key] = numeric(raw.stats?.[key], 0, key === "knowledge" ? 9999 : 100);
  if (object(raw.inventory)) for (const [id, n] of Object.entries(raw.inventory)) {
    if (Object.hasOwn(ITEMS, id) && Number.isInteger(n) && n > 0) s.inventory[id] = Math.min(n, 99);
  }
  for (const key of Object.keys(s.progress)) s.progress[key] = !!raw.progress?.[key];
  s.day = Math.floor(numeric(raw.day, 1, 9999));
  s.minute = Math.floor(numeric(raw.minute, 0, 1439));
  s.steps = Math.floor(numeric(raw.steps, 0, 999999));
  s.decor = Array.isArray(raw.decor) ? raw.decor.slice(0,12).filter(d=>d&&Object.hasOwn(FURNITURE,d.id)).map(d=>({id:d.id,x:numeric(d.x,100,1080),y:numeric(d.y,290,450)})) : [];
  s.friends = {};
  for(const id of Object.keys(FRIENDS)) s.friends[id]=numeric(raw.friends?.[id],0,100);
  s.career = normalizeCareer(raw.career);
  s.world = normalizeWorld(raw.world);
  if (!BUILDING_BY_ID[s.location]?.rooms.some(room=>room.id===s.world.room))s.world.room="main";
  s.sound = raw.sound !== false;
  s.createdAt = Number.isFinite(raw.createdAt) ? raw.createdAt : s.createdAt;
  s.savedAt = Number.isFinite(raw.savedAt) ? raw.savedAt : null;
  return s;
}
export function loadGame(storage = globalThis.localStorage) {
  try {
    const value = storage?.getItem(SAVE_KEY);
    return value ? sanitize(JSON.parse(value)) : newGame();
  } catch { return newGame(); }
}
export function persist(game, storage = globalThis.localStorage) {
  try {
    game.savedAt = Date.now();
    storage?.setItem(SAVE_KEY, JSON.stringify(sanitize(game)));
    return true;
  } catch { return false; }
}
export const itemCount = (game, id) => Math.max(0, Number(game.inventory?.[id]) || 0);
export const missionStep = game => Math.max(0, MISSIONS.findIndex(m => !game.progress[m.id])) || (MISSIONS.every(m => game.progress[m.id]) ? MISSIONS.length : 0);
export const nextMission = game => MISSIONS.find(m => !game.progress[m.id]) || null;
export function timeLabel(game) {
  const h = Math.floor(game.minute / 60);
  return (((h + 11) % 12) + 1) + ":" + String(game.minute % 60).padStart(2, "0") + (h < 12 ? " AM" : " PM");
}
const cap = (game, key, delta, upper = 100) => {
  game.stats[key] = numeric(game.stats[key] + delta, 0, upper);
};
const passTime = (game, mins, hunger = 0, energy = 0) => {
  const m = game.minute + mins;
  game.day = Math.min(9999, game.day + Math.floor(m / 1440));
  game.minute = m % 1440;
  cap(game, "hunger", -hunger);
  cap(game, "energy", -energy);
};
const increase = (g, id) => { g.inventory[id] = Math.min(99, itemCount(g, id) + 1); };
const decrease = (g, id) => {
  if (!itemCount(g, id)) return false;
  if (--g.inventory[id] <= 0) delete g.inventory[id];
  return true;
};
const outcome = (game, ok, message, effect = "") => ({ game, ok, message, effect });

export function act(original, type, payload = {}) {
  if(["enter-room","explore"].includes(type))return world4Action(sanitize(original),type,payload);
  if(["work","claim-goal","claim-daily"].includes(type))return phase3Action(sanitize(original),type,payload);
  if(["buy-furniture","move-furniture"].includes(type))return phase2Action(sanitize(original),type,payload);
  const game = sanitize(original);
  if(type==="talk"){
    const result=phase2Action(game,type,payload);
    if(result.ok){result.game.career.social+=1;}
    return result;
  }
  switch (type) {
    case "travel": {
      const place = payload.place;
      if (!Object.hasOwn(PLACES, place)) return outcome(original, false, "That place is not available yet.");
      if (place === game.location) return outcome(original, true, "You're already here!");
      game.location = place;
      game.world.room="main";
      if(BUILDING_BY_ID[place]&&!game.world.visited.includes(place))game.world.visited.push(place);
      game.position = { x: 610, y: 568 };
      passTime(game, 12, 2, 2);
      return outcome(game, true, "Welcome to " + PLACES[place].name + "!", "travel");
    }
    case "move": {
      game.position = { x: numeric(payload.x, 100, 1100), y: numeric(payload.y, 493, 603) };
      game.steps += 1;
      if (game.steps % 12 === 0) passTime(game, 2, 1, 1);
      return outcome(game, true, "");
    }
    case "customize": {
      const a = object(payload.avatar) ? payload.avatar : {};
      game.avatar.name = safeName(a.name ?? game.avatar.name);
      for (const key of ["skin", "hair", "hairColor", "outfitColor"]) game.avatar[key] = pick(a[key], LOOKS[key], game.avatar[key]);
      if (game.wardrobe.includes(a.outfit)) game.avatar.outfit = a.outfit;
      game.characterReady = true;
      return outcome(game, true, "Looking lovely, " + game.avatar.name + "!", "sparkle");
    }
    case "equip": {
      const id = payload.id;
      if (!game.wardrobe.includes(id) || !Object.hasOwn(CLOTHES, id)) return outcome(original, false, "You haven't unlocked that outfit yet.");
      if (game.avatar.outfit !== id) game.progress.outfit = true;
      game.avatar.outfit = id;
      if (LOOKS.outfitColor.includes(payload.color)) game.avatar.outfitColor = payload.color;
      return outcome(game, true, "New outfit: " + CLOTHES[id].name + "!", "sparkle");
    }
    case "buy-outfit": {
      if (game.location !== "boutique") return outcome(original, false, "Visit Petal Boutique to shop for new outfits.");
      const id = payload.id;
      if (!Object.hasOwn(CLOTHES, id)) return outcome(original, false, "That outfit isn't for sale.");
      if (game.wardrobe.includes(id)) return outcome(original, false, "You already own that outfit.");
      if (game.coins < CLOTHES[id].cost) return outcome(original, false, "Not enough coins. Study or play to earn some!");
      game.coins -= CLOTHES[id].cost;
      game.wardrobe.push(id);
      game.avatar.outfit = id;
      game.progress.outfit = true;
      passTime(game, 5);
      return outcome(game, true, CLOTHES[id].name + " is yours! -"+CLOTHES[id].cost+" coins.", "sparkle");
    }
    case "book": {
      if (game.location !== "school") return outcome(original, false, "The storybook is at school.");
      if (game.progress.book) return outcome(original, false, "You already have your storybook.");
      increase(game, "book");
      game.progress.book = true;
      game.coins += 8;
      cap(game, "joy", 5);
      passTime(game, 6);
      return outcome(game, true, "Storybook found! +8 coins. Open your backpack.", "sparkle");
    }
    case "study": {
      if (!["school", "home"].includes(game.location)) return outcome(original, false, "Find a cozy reading corner at home or school.");
      if (!itemCount(game, "book")) return outcome(original, false, "Pick up the storybook at school first.");
      game.progress.study = true;
      game.coins += 6;
      cap(game, "knowledge", 18, 9999);
      cap(game, "joy", 4);
      passTime(game, 20, 4, 6);
      return outcome(game, true, "You learned something new! +18 knowledge, +6 coins.", "sparkle");
    }
    case "buy": {
      const id = payload.id;
      if (game.location !== "market") return outcome(original, false, "Shopping happens at Berry Basket Market.");
      if (!MARKET.includes(id)) return outcome(original, false, "That isn't sold in this shop.");
      if (game.coins < ITEMS[id].cost) return outcome(original, false, "Not enough coins for this snack!");
      if (itemCount(game, id) >= 99) return outcome(original, false, "You can't carry any more of those.");
      game.coins -= ITEMS[id].cost;
      increase(game, id);
      game.progress.shop = true;
      passTime(game, 4);
      return outcome(game, true, ITEMS[id].name + " is in your backpack. -"+ITEMS[id].cost+" coins.", "sparkle");
    }
    case "eat": {
      const id = payload.id;
      if (!Object.hasOwn(ITEMS, id) || ITEMS[id].kind !== "food" || !decrease(game, id)) return outcome(original, false, "You don't have that snack in your backpack.");
      cap(game, "hunger", ITEMS[id].hunger);
      cap(game, "joy", ITEMS[id].joy);
      game.progress.eat = true;
      passTime(game, 7);
      return outcome(game, true, "Yum! That " + ITEMS[id].name.toLowerCase() + " hit the spot!", "hearts");
    }
    case "rest": {
      if (game.location !== "home") return outcome(original, false, "Your comfy bed is at home.");
      cap(game, "energy", 46);
      cap(game, "joy", 6);
      game.progress.rest = true;
      passTime(game, 50, 4);
      return outcome(game, true, "Sweet dreams! You're all recharged.", "hearts");
    }
    case "sit": {
      if (!["home", "school", "park"].includes(game.location)) return outcome(original, false, "Find a comfy place to sit.");
      cap(game, "energy", 8);
      passTime(game, 12, 1);
      return outcome(game, true, "A peaceful little break.", "hearts");
    }
    case "play": {
      if (game.location !== "park") return outcome(original, false, "Head to Cloudberry Park to play.");
      cap(game, "joy", 20);
      game.coins += 4;
      passTime(game, 22, 5, 8);
      return outcome(game, true, "That was lovely! +4 coins.", "sparkle");
    }
    case "daisy": {
      if (game.location !== "park") return outcome(original, false, "Daisies grow in the park.");
      if (game.progress.daisy) return outcome(original, false, "You have already picked your special daisy.");
      increase(game, "daisy");
      game.progress.daisy = true;
      passTime(game, 3);
      return outcome(game, true, "A daisy for your collection!", "sparkle");
    }
    case "toggle-sound": game.sound = !game.sound; return outcome(game, true, game.sound ? "Sound on." : "Sound off.");
    case "reset": return outcome(newGame(), true, "A fresh cozy adventure begins!", "sparkle");
    default: return outcome(original, false, "That action isn't ready yet.");
  }
}
