# MyCozyWorld

Mobile-first Progressive Web App collection.

- **Cozy Arena:** Original auto-battler, launch from `?game=arena`. Existing `game.js` and assets are preserved.
- **Cozy Salon:** Sally's Salon-style time-management game at `salon/` (v2). Stylist Mira walks to stations; queue up to 5 tasks, same-service combos, guest types (Mak Cik, Remaja, VIP, Influencer), hair transformations, coffee machine, auto hair dryer, 4 locations (Kampung, Mall KL, Resort Langkawi, Studio Seleb) across 60 levels. Save key `mycozyworld_cozy_salon_v2` (migrates v1).
  - **Sprites:** ChatGPT commits raw sheets to `salon/sprites/sheets/` (1536x1024, magenta #FF00FF, 3x2 grid of 512 cells); they are cut into `salon/sprites/<name>.webp` and listed in `salon/sprites/list.json`. Names: `mira_{front,back,side}_{idle,walk1,walk2}`, `mira_{cut,wash,happy}`, `guest_<biasa|makcik|remaja|vip|seleb>_{front,back,side}_{idle,walk1,walk2}`, `guest_<type>_{sit,angry,chair,after}`, `st_{wash,cut,color,style,pay}`, `bg_{kampung,mall,resort,seleb}`. Side sprites face right. Missing sprites fall back to drawn placeholders.

Deploy with GitHub Pages: main branch, repository root. The shared service worker caches both games for offline play after installation.
