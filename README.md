# My Cozy World 🌼

A mobile-first, original 2D cartoon life-simulation PWA. **Playable Phases 1–4: character creation, social life, careers and 30-building Cozyville.**

## Play locally

Node.js 20+: `npm run dev` and open `http://localhost:4173`. No dependency installation required.

## Phase 1 features

- Character creator with name, skin, hairstyle, hair color, clothes and colorways
- Interactive cartoon town with six destinations: town, home, school, market, boutique and park
- Touch and keyboard walking; tap buildings to enter; map travel
- Storybook, reading/studying, clothing shop and wardrobe, grocery shopping, snacks, rest and park play
- Backpack inventory, coins, needs, in-game time, six sequential missions
- Local auto-save, reset confirmation and offline cache via service worker
- Responsive landscape-first interface, scalable original SVG illustrations
- No third-party assets, runtime libraries, trackers or backend

## Phase 2 and Phase 3 features

- Five draggable home decorations and conversations with Luna, Milo and Poppy
- Three daily careers with interactive two-question shifts, salaries and achievements
- Daily goals, collectible rewards and persistent career progression

## Phase 4: Cozyville world expansion

- **30 destinations in five districts**, six locations per district: Neighborhood, Learning, Shopping, Services and Leisure
- District-based world directory with visit tracking
- 90 contextual, touch-friendly activities spanning all locations
- Multi-room navigation at school (Classroom, Library, Art Room), hospital (Reception, Treatment Room, Pharmacy), and shopping mall (Atrium, Food Court, Arcade)
- Themed SVG interiors and tappable activity stations, with accessible keyboard activation
- Collectible keepsake album, exploration progress and persistent room states
- Legacy Phase 1–3 save compatibility preserved

## Checks

`npm run check` validates JavaScript syntax.
`npm test` runs game-state tests.

## Publish

Deploy the repository root as a static site via GitHub Pages (main/root), or any HTTPS static host. Relative paths support hosting at `/MyCozyWorld/`. Service workers only run on HTTPS or localhost. Open once online, then revisit offline. To install on Android use the browser's Add to Home Screen / Install option.

## Scope and limitations

This is a 30-building playable world expansion, but not a complete Sims-style simulation. Advanced NPC AI, deeper economic simulation, fully illustrated handcrafted interior art, high-end character animation, and cloud sync are not implemented. Automated logic tests are not a substitute for device-based visual QA. Save data is local to each browser/device and can be cleared with browser storage. SVG icons may render slightly differently across operating systems.
