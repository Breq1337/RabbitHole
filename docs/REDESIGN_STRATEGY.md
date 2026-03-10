# Rabbit Hole — Product Vision & Redesign Strategy

**Tagline:** *"Search one thing. Lose yourself in everything."*

---

## SECTION A — Product Vision Summary

Rabbit Hole is a **cinematic curiosity engine**: one search leads into a living graph of knowledge where logical and surprising connections create an addictive exploration loop. It should feel like a hybrid of an interactive documentary, a futuristic knowledge OS, and a curiosity game—mobile-first, dark, premium, and alive.

**Core promise:** Arrive with one question; disappear into discovery.

**Emotional targets:** Surprise, curiosity, delight, immersion, wonder.

**Positioning:** Experimental product at the intersection of knowledge, interface design, and curiosity psychology—premium, not corporate or generic.

---

## SECTION B — Full Redesign Strategy

### Visual direction
- **Dark, cinematic, high-contrast** — deep black/charcoal, cyan/electric accents, restrained violet for “magic” moments.
- **Depth:** Layered grids, soft blur, light bloom, glass-like panels, glowing borders.
- **Motion:** Purposeful—hierarchy, discovery, focus, delight. No gimmicks.
- **Cards:** Spotlight hover, subtle tilt, premium edge lighting, rich image treatment.

### Information hierarchy
1. **At a glance:** Elegant, uncluttered.
2. **On interaction:** Reveal depth—detail panel, feed cards, trail.
3. **Discovery moments:** Emphasis (motion, glow, micro-copy) on “surprising connection” and “dive deeper”.

### Surprise as a feature
- Recommendation engine must balance **direct**, **popular**, and **surprising** connections.
- Surprising jumps get dedicated UI treatment (e.g. “Unexpected connection”, brief cinematic transition).
- Copy: “Take me somewhere strange”, “Jump across disciplines”, “This leads somewhere interesting”.

### Mobile-first
- Graph usable on touch (pinch, drag, tap).
- Panels → bottom sheets / drawers; feed → horizontal scroll or compact list.
- Thumb-zone CTAs; performant transitions.

---

## SECTION C — Page Architecture

| Page | Role | Key elements |
|------|------|--------------|
| **Homepage** | Land, intrigue, search, quiz, trending, “Surprise Me” | Hero search, animated bg, quiz block, top 5 trending, featured random |
| **Exploration** | Heart of product | Feed (left) · Graph (center) · Detail (right) · Trail (bottom) |
| **Entity detail** | Deep dive / overlay | Hero image, type badge, summary, facts, “Read more”, “Jump deeper”, “Share trail” |
| **Profile** (optional) | Account, history, saved | Saved trails, achievements, preferences |
| **Saved trails** | Revisit paths | List of saved trails, share links |
| **Achievement center** | Gamification | List of achievements, progress |
| **Shared trail** | Public link | Reconstructed path, graph neighborhood, CTA to continue |

**Route structure:**
- `/` — Home
- `/explore?q=...` or `/explore?id=...` — Exploration
- `/explore/[slug]` — Shared trail (e.g. `/explore/tesla-electricity-grid`)
- `/entity/[id]` — Full entity page
- `/profile` — User profile (optional auth)
- `/trails` — Saved trails
- `/achievements` — Achievement center

---

## SECTION D — Component Inventory

| Component | Purpose |
|-----------|--------|
| Logo / brand mark | Header, identity |
| Search hero | Large cinematic search + focus states |
| Quiz card system | First-visit preferences |
| Trending list (top 5) | Alive, tappable, competitive feel |
| Random discovery CTA | “Surprise Me” / “Take me somewhere random” |
| Discovery feed cards | Thumbnail, title, summary, category, curiosity hook, spotlight/tilt |
| Graph container | Canvas, controls, tooltips |
| Graph node (custom draw) | Glow, pulse, birth animation, type color |
| Detail panel | Hero image, badge, summary, facts, CTAs |
| Bottom trail | Breadcrumb storyline, tappable, share |
| Achievement toast | Unlock feedback |
| Save / share controls | Trail share, copy link |
| Empty / loading states | Skeleton, retry, “Jump somewhere random” |
| Audio toggle | Mute cinematic sounds |
| Mobile bottom sheet | Detail panel on mobile |
| Command palette | Quick search (optional) |

---

## SECTION E — Motion / Visual Effects System

### Design tokens (motion)
- **Duration:** fast 150ms, normal 300ms, slow 500ms, cinematic 800ms.
- **Easing:** ease-out for entrances, ease-in-out for transitions, spring for interactive (stiffness ~300, damping ~25).
- **Stagger:** 40–60ms between list/card items.

### Effect families
- **Backgrounds:** Animated grid (subtle), beams, ambient particles (low opacity).
- **Cards:** Spotlight on hover/focus, subtle tilt (2–4deg), border glow.
- **Graph:** Node birth (scale 0.9→1, fade-in, halo pulse), edge draw-in, selected node intensity.
- **Transitions:** Layered opacity, scale + blur on route change; “surprise jump” = brief energy sweep.
- **Text:** Reveal on scroll/view, optional scramble/glitch only for key moments.

### Restraint
- No effect spam; hierarchy drives where motion lives.
- Respect `prefers-reduced-motion`.

---

## SECTION F — Discovery Engine Logic

### Recommendation types
1. **Direct** — Same graph relation props (P31, P279, P106, …).
2. **Popular** — Weight by trending, frequency in sessions.
3. **Surprising** — Cross-category bridges, novelty score, “unexpected” relation slice.

### Scoring (conceptual)
```
score = w1·direct + w2·popular + w3·novelty + w4·quizAffinity + w5·bridgeCategory + w6·curiosityBoost
```
Plus **surprise injection:** inject N high-interest, non-obvious candidates per response.

### Inputs
- Search term, entity graph relations, quiz preferences, session history, 24h popularity, entity type, novelty, cross-category potential.

### Data
- **Wikidata** — entities, relations, types.
- **Wikipedia** — summaries, thumbnails.
- **Gemini** — interesting fact when missing.
- **Unsplash** (optional) — imagery.

---

## SECTION G — Backend / Database Architecture

### API layer (Next.js route handlers)
- `GET /api/search` — Wikidata search.
- `GET /api/explore` — Build graph + feed + recommendations (by query or entity id).
- `GET /api/entity/[id]` — Entity + related.
- `GET /api/trending` — Top searches (e.g. last 24h).
- `GET /api/random` — Random topic.
- Optional: `POST /api/trail`, `GET /api/trail/[id]`, `POST /api/achievements`, auth routes.

### Caching
- In-memory or Redis for explore/entity responses; short TTL for trending.

### Data model (conceptual)
- **users** — id, email, created_at.
- **sessions** — id, user_id, anonymous_id, payload.
- **entities** — normalized cache (id, name, type, summary, image_url, …).
- **trails** — id, user_id, slug, entity_ids[], created_at.
- **achievements** — id, key, name, condition.
- **unlocked_achievements** — user_id, achievement_id, unlocked_at.
- **preferences / quiz** — user_id or session_id, topics[].

### Auth
- Optional email/password; mobile-friendly flows; anonymous exploration with “save progress” prompt.

---

## SECTION H — Mobile-First Interaction Model

- **Graph:** Pinch zoom, drag pan, tap node = select + update detail + feed.
- **Detail:** Bottom sheet; drag up to expand, down to collapse; swipe or tap outside to dismiss.
- **Feed:** Vertical scroll or horizontal card strip; tap card = select entity.
- **Trail:** Horizontal scroll, tap step = jump to that node in graph.
- **Primary CTAs** in thumb zone; secondary in header/top.
- **Performance:** Lazy load, progressive graph, image optimization, skeletons.

---

## SECTION I — Implementation Roadmap

| Phase | Focus |
|-------|--------|
| **1** | Design tokens, globals, cinematic background, homepage hero, search + “Surprise Me” + quiz |
| **2** | Exploration layout, graph visual upgrade (glow, birth, selection), discovery feed cards (spotlight, motion) |
| **3** | Detail panel hierarchy and motion, exploration trail redesign, share trail link |
| **4** | Discovery algorithm tuning (surprise injection), optional sound, achievement toasts |
| **5** | Optional auth, saved trails, achievement center, profile |
| **6** | Polish, accessibility, performance, launch prep |

---

## SECTION J — Folder Structure

```
src/
├── app/
│   ├── page.tsx                 # Home
│   ├── layout.tsx
│   ├── globals.css
│   ├── explore/
│   │   ├── page.tsx
│   │   └── [...slug]/page.tsx   # Shared trail
│   ├── entity/[id]/page.tsx
│   ├── profile/page.tsx         # Optional
│   ├── trails/page.tsx          # Saved trails
│   ├── achievements/page.tsx     # Optional
│   └── api/
│       ├── search/
│       ├── explore/
│       ├── entity/[id]/
│       ├── trending/
│       ├── random/
│       └── ...
├── components/
│   ├── ui/                      # Buttons, inputs, FaultyTerminal, etc.
│   ├── SearchBar.tsx
│   ├── RandomButton.tsx
│   ├── QuizModal.tsx
│   ├── TrendingSection.tsx
│   ├── DiscoveryFeed.tsx
│   ├── DiscoveryCard.tsx       # Premium card
│   ├── KnowledgeGraph.tsx
│   ├── EntityDetails.tsx
│   ├── ExplorationTrail.tsx
│   ├── LanguageToggle.tsx
│   └── layout/
│       ├── Header.tsx
│       └── MobileDetailSheet.tsx  # Optional
├── contexts/
│   ├── LanguageContext.tsx
│   └── AudioContext.tsx         # Optional mute
├── lib/
│   ├── wikidata.ts
│   ├── wikipedia.ts
│   ├── gemini.ts
│   ├── unsplash.ts
│   ├── discovery.ts
│   ├── cache.ts
│   └── recommendations.ts       # Scoring, surprise injection
└── types/
    └── index.ts
```

---

## SECTION K — Key Code Examples

### Design tokens (CSS)
```css
:root {
  --motion-fast: 150ms;
  --motion-normal: 300ms;
  --motion-slow: 500ms;
  --motion-cinematic: 800ms;
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
  --glow-soft: 0 0 20px rgba(34, 211, 238, 0.15);
  --glow-strong: 0 0 32px rgba(34, 211, 238, 0.35);
}
```

### Staggered list (Framer Motion)
```tsx
const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };
<motion.ul variants={container} initial="hidden" animate="show">
  {items.map(i => <motion.li key={i.id} variants={item}>...</motion.li>)}
</motion.ul>
```

### Card spotlight (CSS + hover)
```css
.card-spotlight {
  position: relative;
  overflow: hidden;
}
.card-spotlight::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(600px circle at var(--x) var(--y), rgba(34,211,238,0.08), transparent);
  opacity: 0;
  transition: opacity 0.3s;
}
.card-spotlight:hover::before { opacity: 1; }
```
(Use JS to set `--x` / `--y` from mouse position.)

### Surprise injection (discovery)
In `buildDiscoveryFromEntityId`, after building `allRelated`, splice 1–2 high-novelty items from a precomputed list or from a “bridge” entity not in the current graph.

---

## SECTION L — Final Polish Recommendations

1. **Copy:** All CTA and empty states in Portuguese (and EN) with the tone: intriguing, cinematic, slightly playful.
2. **Accessibility:** Semantic HTML, focus states, `prefers-reduced-motion`, labels, audio toggle.
3. **Performance:** Lazy load graph, virtualize long feeds if needed, cache aggressively, skeleton states.
4. **Analytics (optional):** Track search, node clicks, trail length, surprise clicks—to tune the recommendation engine.
5. **Launch:** One clear “What is this?” moment on the homepage; one strong “Surprise Me” path so the first click is rewarding.

---

*This document is the single source of truth for the Rabbit Hole redesign. Implement in phases; prioritize cinematic feel, graph life, and discovery feed premium quality first.*
