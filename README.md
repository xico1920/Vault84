# VAULT 84

**A browser-based underground facility management game.**
Keep the reactor online. Mine ore. Neutralize threats. Survive.

**[Play in browser →](https://xico1920.github.io/Vault84/)**

---

## About

You are the Overseer of Vault 84 — alone, managing a failing underground facility through a retrofuturistic terminal interface.
No staff. No help. Just systems, alarms, and time.

The game runs entirely in the browser with no build step, no dependencies to install, and no backend.

---

## Systems

| Department | Role |
|---|---|
| Reactor Core | Powers everything — if it fails, all systems degrade |
| Mining Shaft | Extracts raw ore from the ground |
| Ore Refinery | Processes raw ore into sellable refined material |
| Water Treatment | Keeps pump pressure online |
| Smart Storage | Auto-sells refined ore, manages inventory |
| Security | Monitor and neutralize incoming threats via minigames |
| Workshop | Upgrade all systems with earned cash |
| Music | Synthesized ambient soundtrack |

---

## Tech Stack

- **Vanilla JS (ES6 modules)** — no framework, no build step
- **Three.js r128** — all 3D models are procedurally generated at runtime, no external files
- **Web Audio API** — all sound effects and music synthesized in code
- **Canvas 2D API** — security minigames, reactor heatmap, oscilloscope, vault map
- **localStorage** — save/load system with export/import and per-difficulty leaderboard
- **CSS** — full CRT monitor aesthetic, responsive for mobile

---

## Running Locally

```bash
# Clone the repo
git clone https://github.com/xico1920/Vault84.git
cd Vault84

# Serve with any static server (required for ES modules)
npx serve .
# or
python -m http.server 8080
```

Open `http://localhost:8080` — no install, no build.

---

## Structure

```
scripts/
  core/          # Game engine: GameState, GameLoop, SaveSystem, audio, 3D models
  screens/       # UI screens: boot, difficulty, game departments
  screens/game/  # Each department screen (Reactor, Mining, Security, etc.)
css/             # CRT terminal stylesheet
assets/          # Fonts, icons
```

---

## Build

`0.2.0` — first public release
