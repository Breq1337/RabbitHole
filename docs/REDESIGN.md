# Rabbit Hole — Complete Product Redesign

**Tagline:** Search one thing. Lose yourself in everything.

---

## SECTION A — Product Redesign Vision

### Core Mission
Turn Rabbit Hole into the **best-looking people-connection explorer on the web** — a cinematic, dark, mobile-first platform where users discover human connections through a premium, addictive, motion-rich experience.

### Product Principles
- **Alive** — Motion, glow, and depth at every layer
- **Visual** — Portrait-driven nodes, dramatic path reveal, rich imagery
- **Dramatic** — Staggered entrances, path animation, focus transitions
- **Tactile** — Hover feedback, tap response, drag/zoom
- **Premium** — No flat UI, no generic graphs, no student-project feel
- **Immersive** — Dark atmosphere, layered backgrounds, cinematic focus

### Anti-Patterns (Never Do)
- Generic SaaS dashboard
- Plain force-graph demo with circles and lines
- Static node-and-line toy
- Debugging-tool aesthetic

---

## SECTION B — Homepage Redesign

### Hero Layout
```
┌─────────────────────────────────────────────┐
│ 🕳️ Rabbit Hole    [Try] [Connect] [Lang]   │
├─────────────────────────────────────────────┤
│                                             │
│     Search one thing.                       │
│     Lose yourself in everything.            │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ Person A (portrait + name)           │   │
│  └─────────────────────────────────────┘   │
│  ┌─────────────────────────────────────┐   │
│  │ Person B (portrait + name)           │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  [ Find Connection ]  [ Surprise Pair ]     │
│                                             │
│  ┌─ Trending People (Chroma Grid) ─────┐   │
│  │ [portrait] [portrait] [portrait]     │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

### Visual Treatment
- Animated background: grid + soft glow + optional particle layer
- Staggered entrance: hero → inputs → CTAs → trending (0.1s stagger)
- Dual person input: portrait-style search cards with swap button
- Surprise Pair CTA: random famous pair, playful microcopy
- Trending: ChromaPeopleGrid with portrait cards

---

## SECTION C — Graph Redesign Architecture

### Path Modes

| Mode | Purpose | Visual |
|------|---------|--------|
| **Path** | Shortest connection only | Linear chain, prominent nodes, glowing edges |
| **Expanded** | Path + nearby humans | Secondary nodes dimmed, path highlighted |
| **Story** | Cinematic sequence | Step-by-step reveal, carousel-like |
| **Compare** | Two paths | Dual chains, contrasting accents |

### Node Design (Premium)
- Portrait image or initials avatar
- Glow ring (accent color)
- Soft animated aura on hover
- Badge for relation type if useful
- Hover: mini-card tooltip
- Tap: detail panel / bottom sheet

### Edge Design
- Animated draw-in on reveal
- Glow along path
- Labels mid-edge or on hover
- Primary path: brighter, thicker
- Secondary: dimmed, thinner

### Path Reveal Sequence
1. Loading: shimmer / skeleton
2. Nodes appear with stagger (start → end)
3. Edges draw between nodes
4. Final path pulses once
5. Side panel updates per node focus

---

## SECTION D — Interactive Motion System

### Timing
- Fast: 150ms (micro-interactions)
- Normal: 300ms (transitions)
- Slow: 500ms (reveals)
- Cinematic: 800ms (path reveal)

### Easing
- `cubic-bezier(0.16, 1, 0.3, 1)` — snappy out
- `cubic-bezier(0.34, 1.56, 0.64, 1)` — spring

### Motion Catalog
| Element | Entry | Hover | Tap |
|---------|-------|-------|-----|
| Card | y:16→0, opacity | y:-4, scale:1.02 | scale:0.98 |
| Node | scale:0→1 | glow up | scale:1.05 |
| Edge | pathLength:0→1 | opacity up | — |
| Panel | x:100%→0 or y:100%→0 | — | — |
| Path | stagger 100ms | — | — |

---

## SECTION E — React Bits-Inspired Component Strategy

| Area | Component | Usage |
|------|-----------|-------|
| Trending | ChromaPeopleGrid | Home, Connect continue |
| Related | ChromaPeopleGrid | Explore sidebar |
| Person cards | ChromaCard | Discovery, suggestions |
| Path result | ConnectionPathGraph | Interactive path (not Chroma) |
| Detail | PersonDetailSheet | Node tap, mobile bottom sheet |
| Hero | HeroDualSearch | Home dual input |
| Carousel | GradientCarousel | Alternate paths, famous chains |

**Rule:** Use Chroma/Carousel for **discovery** and **suggestion** surfaces. Keep **path result** linear and clear with ConnectionPathGraph.

---

## SECTION F — Mobile-First Behavior

- **Touch:** Tap node → detail sheet. Swipe sheet to dismiss.
- **Graph:** Pinch zoom, pan. Tap to focus.
- **Search:** Full-width inputs, large tap targets.
- **CTAs:** Full-width on mobile, side-by-side on desktop.
- **Detail panel:** Bottom sheet on mobile, side panel on desktop.

---

## SECTION G — Visual Design System

### Palette
- Background: `oklch(0.12 0 0)` (dark)
- Foreground: `oklch(0.97 0 0)`
- Accent: `#22d3ee` (cyan)
- Muted: `oklch(0.55 0 0)`
- Border: `oklch(0.35 0 0)`
- Glow: `rgba(34, 211, 238, 0.2)`

### Typography
- Headlines: bold, tight tracking
- Body: system-ui
- Mono: for IDs/codes

### Effects
- `.glow-text` — text shadow
- `.chroma-glow` — card glow
- `.node-glow` — graph node
- `.card-spotlight` — cursor-follow spotlight

---

## SECTION H — Component Inventory

| Component | Status | Purpose |
|-----------|--------|---------|
| HeroDualSearch | New | Home dual person input |
| ConnectionPathGraph | New | Interactive path visualization |
| PersonDetailSheet | New | Node detail, mobile bottom sheet |
| ChromaPeopleGrid | Done | Discovery cards |
| ChromaCard | Done | Person tile |
| KnowledgeGraph | Upgrade | Portrait nodes, premium styling |
| PersonSearchInput | Done | Resolve person |
| ConnectionResult | Upgrade | Use ConnectionPathGraph |
| FaultyTerminal | Done | Ambient background |

---

## SECTION I — Page Layouts

### Home (`/`)
- Header: logo, Try, Connect, Lang
- Hero: dual search, Find Connection, Surprise Pair
- Trending: ChromaPeopleGrid
- Footer: tagline

### Connect (`/connect`)
- Header
- Dual PersonSearchInput + Swap
- Find Connection, Surprise Pair
- Result: ConnectionPathGraph + PersonDetailSheet
- Continue: ChromaPeopleGrid

### Explore (`/explore`)
- Header
- 3-column: DiscoveryFeed | KnowledgeGraph | EntityDetails + Related ChromaGrid
- Trail: ExplorationTrail

---

## SECTION J — Interaction Details

### Search
- Swap A↔B
- Random pair
- Clear per field

### Path
- Tap node → detail sheet
- Set as start / Set as target
- Share, Save
- Explore from here

### Graph
- Pan, zoom
- Node hover: tooltip
- Node tap: detail
- Recenter button

---

## SECTION K — Implementation Roadmap

| Phase | Focus | Deliverables |
|-------|-------|--------------|
| 1 | Design doc + tokens | REDESIGN.md, globals.css |
| 2 | Homepage | HeroDualSearch, Surprise Pair, layout |
| 3 | ConnectionPathGraph | Interactive path, portrait nodes |
| 4 | PersonDetailSheet | Bottom sheet, actions |
| 5 | Connect page | Full flow, swap, CTAs |
| 6 | KnowledgeGraph upgrade | Portrait nodes, glow |
| 7 | Polish | Motion, mobile, performance |

---

## SECTION L–O — Implementation Notes

- **L (Components):** React + TypeScript + Framer Motion + Tailwind
- **M (Graph):** react-force-graph-2d for Explore; custom SVG/canvas for ConnectionPathGraph
- **N (Styling):** Tailwind + globals.css custom utilities
- **O (Polish):** prefers-reduced-motion, lazy images, GPU transforms
