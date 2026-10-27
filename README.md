# My Cozy World 🌼

A mobile-first, original 2D cartoon life-simulation PWA. **Phase 1 playable foundation.**

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

## Checks

`npm run check` validates JavaScript syntax.
`npm test` runs game-state tests.

## Publish

Deploy the repository root as a static site via GitHub Pages (main/root), or any HTTPS static host. Relative paths support hosting at `/MyCozyWorld/`. Service workers only run on HTTPS or localhost. Open once online, then revisit offline. To install on Android use the browser's Add to Home Screen / Install option.

## Scope and limitations

This is the Phase 1 foundation, not the full open-world simulation. More buildings, relationships, decor placement, careers, NPC AI, advanced animation, accessibility enhancements, and cloud sync are later phases. Save data is local to each browser/device and can be cleared with browser storage. SVG icons may render slightly differently across operating systems.
