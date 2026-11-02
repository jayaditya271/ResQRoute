# 🛡️ ResQRoute™ — Emergency Evacuation Route Analysis Engine

> **Tagline:** *Intelligent Life-Safety Graph Analytics & Real-Time Emergency Evacuation Routing*  
> **Author:** Jayaditya  
> **Topics:** Graph Representation & Breadth-First Search (BFS)  
> **Stack:** Next.js, Tailwind CSS v4, Pure JavaScript (ES6+), React  
> **Keywords:** `emergency-evacuation`, `graph-representation`, `bfs`, `breadth-first-search`, `life-safety`, `nextjs`, `tailwindcss-v4`

---

## 📌 Executive Overview

**ResQRoute™** is a real-world emergency evacuation route analysis platform engineered to model architectural life-safety systems. By mapping complex building floorplans into mathematical graphs ($G = (V, E)$), the engine computes guaranteed minimum-door escape paths using **Breadth-First Search (BFS)** under active fire, toxic smoke, and structural corridor blockages in real time.

Occupants and facility managers can toggle hazard incidents, visualize animated level-by-level BFS wavefronts with live FIFO queue states, and evaluate egress metrics.

---

## 🗂️ 1. Architectural Graph Representation: $G = (V, E)$

The building layout is modeled using an **Adjacency List** data structure located in [`src/lib/algorithms/graphLogic.js`](file:///c:/Users/hp/Documents/DAA/src/lib/algorithms/graphLogic.js):

- **Vertices / Nodes ($V$):** Represent architectural zones:
  - `ROOM`: Offices, ICU units, laboratories, transit platforms.
  - `CORRIDOR`: Horizontal walkways connecting zones.
  - `STAIRWELL`: Vertical fire-rated staircases with descent multipliers.
  - `ATRIUM`: High-volume transition halls and lobbies.
  - `EXIT`: Designated exterior life-safety emergency exit doors.
  - *Attributes:* `id`, `name`, `type`, `floor`, `x`, `y`, `capacity`, and dynamic `hazard` status (`none`, `smoke`, `fire`, `crowded`).

- **Edges ($E$):** Walkways and doors connecting adjacent zones:
  - *Attributes:* `target`, `distance` (meters), and `isBlocked` (debris / collapsed ceiling).

- **Adjacency List Structure:**
  ```javascript
  graph = {
    nodes: {
      ROOM_1402: { id: 'ROOM_1402', name: 'Software Lab 14B', type: 'room', x: 120, y: 220 },
      // ...
    },
    adjacencyList: {
      ROOM_1402: [{ target: 'CORR_WEST', distance: 12 }],
      // ...
    }
  };
  ```

---

## 🌊 2. Breadth-First Search (BFS) Evacuation Engine

### Algorithmic Characteristics:
- **Data Structure:** First-In-First-Out (FIFO) Queue
- **Time Complexity:** $\mathcal{O}(V + E)$  [Vertices $V$ = Zones, Edges $E$ = Corridors]
- **Space Complexity:** $\mathcal{O}(V)$  [Queue & Visited Set]
- **Optimality:** Guarantees finding the route requiring the **minimum number of doorway/zone transitions** (unweighted shortest path).

### Real-Life Evacuation Role:
1. **Minimizes Door Chokepoints:** Doorways are primary crush points during stampedes. BFS guarantees the path with the fewest doors crossed, drastically lowering crowd congestion risks.
2. **Radial Alarm Propagation:** Mathematically simulates how emergency directives radiate outward in concentric circular waves from origin.
3. **Dynamic Fire Pruning:** If a corridor or room catches fire, BFS dynamically prunes that branch, routing occupants along the nearest safe alternate path.

---

## 🌟 Key Features

1. **Floating Hide-on-Scroll Navbar:**
   - Smoothly translates up when scrolling down to maximize blueprint canvas visibility.
   - Translates down when scrolling up with glassmorphism backdrop blur.
2. **Interactive Architectural Blueprint Canvas:**
   - 2D SVG vector grid with real-time edge lengths in meters.
   - Click any room to set occupant **Start Origin**.
   - Click hazard badges to cycle through **Fire**, **Smoke**, and **Congestion**.
3. **Step-by-Step BFS Wavefront Visualizer:**
   - Watch concentric waves expand level-by-level with a **Live FIFO Queue State** viewer.
   - Selectable speeds (*Slow*, *Normal*, *Instant*).
4. **Comprehensive Life-Safety Telemetry:**
   - Real-time **Door Hops** (Minimum zone transitions).
   - **Safety Score** (0–100%).
   - Total **Escape Run Distance** (meters).
   - Estimated **Evacuation Time** (minutes & seconds).
   - Step-by-step ordered waypoint path breakdown.
5. **Multiple Preset Scenarios:**
   - 🏢 *Metropolis Corporate High-Rise (Floor 14 Commercial Wing)*
   - 🏥 *Saint Luke Regional Trauma Center (ICU & Surgical Suites)*
   - 🚇 *Grand Central Subsurface Metro Station (Platform Concourse -2)*

---

## 📁 Codebase Organization

```text
c:\Users\hp\Documents\DAA/
├── .gitignore                      # Excludes .node_runtime, .next, node_modules
├── jsconfig.json                   # Path alias mappings (@/* -> src/*)
├── next.config.mjs                 # Next.js configuration
├── package.json                    # Project metadata & dependencies
├── postcss.config.mjs              # Tailwind CSS v4 pipeline
├── README.md                       # Comprehensive documentation
├── public/
│   └── favicon.svg                 # Branded vector life-safety icon
└── src/
    ├── app/
    │   ├── globals.css             # Tailwind v4 import & route pulsing keyframes
    │   ├── layout.js               # Root layout, SEO metadata, author attribution
    │   ├── page.js                 # Primary dashboard controller
    │   ├── robots.js               # Search crawler indexing
    │   └── sitemap.js              # XML sitemap
    ├── components/
    │   ├── AlgorithmControls.js    # Pure BFS controls & live FIFO queue viewer
    │   ├── AlgorithmDocsModal.js   # Graph Representation & BFS theory dialog
    │   ├── BrandLogo.js            # Vector brand emblem & typography
    │   ├── EvacuationGraph.js      # SVG blueprint canvas with live route pulsing
    │   ├── Footer.js               # Minimalist copyright footer (Author: Jayaditya)
    │   ├── HazardManager.js        # Incident injector (Fire, Smoke, Debris)
    │   ├── MetricsPanel.js         # Real-time door hops & distance telemetry
    │   └── Navbar.js               # Floating responsive hide-on-scroll navbar
    └── lib/
        ├── algorithms/
        │   └── graphLogic.js       # Core BFS & Graph logic (Separated & documented)
        └── utils.js                # Class name merging & time formatting utilities
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js `v18+` or `v20+`
- npm `v9+` or `v10+`

### Installation & Launch
```bash
# Clone or navigate to the repository
cd c:\Users\hp\Documents\DAA

# Install dependencies
npm install

# Launch development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your web browser.

### Production Build
```bash
npm run build
npm run start
```

---

## 🧑‍💻 Author

- **Jayaditya** — *Concept, Mathematical Graph Modeling, BFS Implementation & Full-Stack Development*

---

## 📄 License
This project is licensed under the MIT License — see the LICENSE file for details.
