# Cozy Salon v15: gameplay & economy expansion

Checklist status: **done** means it is playable, saved and covered by an automated or browser check.

## Done
- [x] **Tempahan (reservations):** select a guest, then tap an occupied station that matches their next service. The station shows numbered badges (max 3 per station) and the guest shows 📌n. When the station frees up, the first eligible guest walks there by themselves. Tap the same station again to cancel, or tap another one to change. Reservations are cleared when a guest leaves, on restart, and on new levels. Reservations are separate from staff queues.
- [x] **Staff queue fix:** if the staff queue is full when a guest is placed, the slot is flagged and the job is re-queued silently once someone frees up, so the guest no longer gets stuck.
- [x] **Level config (`levelCfg`):** each location has its own arrival pattern. Kampung is steady and patient. Mall KL comes in lunch waves. Langkawi has groups of 2–3, capped by free seats. Studio Seleb has fewer guests, more wishes and higher tips. Each guest plan is seeded per level, so replays are fair.
- [x] **Events:** 👰 bridal, 💼 office rush, 🎨 colour promo, 👑 VIP day and 📸 influencer, on levels 10, 14, 20, 25, 29, 35, 40, 44, 50, 55 and 59.
- [x] **Objectives:** serve, income, PERFECT, wish, no-angry and colour mix. They are introduced one at a time from level 8, and every opportunity is guaranteed: guests get forced cut, colour or wish needs where an objective requires them. A briefing before each level explains the win rule and the star rule. The HUD shows live progress.
- [x] **Staff specialisation and training:** 3 capped tracks per staff member (max level 3). Each one has a real effect on speed, PERFECT zone width, tips, coffee strength or checkout.
- [x] **Navigation:** grid A* routing around furniture. The layout editor shows solid footprints, a highlighted door zone, the drag boundary, a route preview (Mira → station and Door → station) and the average route length. It refuses to save a layout that blocks the door, counter or stations. Old invalid layouts are repaired automatically.
- [x] **Replayable map:** a 15-level grid per location showing stars and events, plus a detail card. Replays never lower progress. First-clear bonus and repeat rewards are listed separately.
- [x] **Collections:** 4 collections × 6 code-drawn cosmetic items (floor, wall, rug, cushions, plants, lights, station finish, signs). You can equip and unequip them freely. Completing a collection gives +2% tips (total cosmetic bonus is capped at 10%).
- [x] **Renovations:** reception, lounge and frontage, funded in instalments, with visible results.
- [x] **Contracts:** 5 authored contracts × 3 tiers. The fee is charged once per attempt. Restarting from pause is free. Leaving or refreshing counts as a disclosed failure, and the payout can only happen once.
- [x] **Supplies:** 3 consumables, stock capped at 3 each. One unit is used when a level starts, and restarting the same attempt does not use another.
- [x] **Salon Master:** unlocks after level 60. Each round offers 3 rotating sessions with difficulty capped at 56. There is no prestige reset.
- [x] **Save v3:** the existing key is migrated. A recovery copy is written to `mycozyworld_cozy_salon_backup`, and all values are validated.

## Makeover visuals: what is actually visible
- **Haircut:** after a cut, the guest's waiting/sit pose switches to their existing `after` sprite, which already shows the new hairstyle. Walking sprites still show the original cut. Showing it there would need new art, so that is not done.
- **Colour:** done (v16). Task P sprites `guest_<type>_<pose>_c1..c3` are in for biasa, remaja, vip and seleb, covering all walk and pose frames. Only the hair colour changes.
- **Mak Cik:** the tudung is preserved. A cut or colour adds a small gold brooch detail instead.
- **Checkout:** a small non-blocking before/after card appears at the top-left.

## Economy (values in `BAL` and the data tables at the top of `game.js`)
Measured with a bot, 3 runs per level, full upgrades. A weak player earns about 2.4–3.3k per Mall session and 2.5–5.6k per Seleb session. A medium player earns about 3–3.7k (Mall) and 4–7.7k (late game).
- Training: 1,500 / 4,000 / 9,000 per level, 130k for all 9 tracks. Level 1 costs about half a Mall session.
- Cosmetics: 650–1,250 (Kampung) up to 5,500–8,000 (Seleb), about 86k in total.
- Renovations: 60k / 100k / 160k, roughly 12 to 35 late sessions.
- Contracts: fee → payout of 1k→3k, 2.5k→7k and 5k→13k. On top of the payout you keep 70% of what you earned.
- Supplies: 400–600 each.
