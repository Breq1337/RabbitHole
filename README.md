<<<<<<< HEAD
# 🕳️ Rabbit Hole

**"Search one thing. Lose yourself in everything."**

A cinematic knowledge exploration platform that mixes a **knowledge graph**, **infinite discovery**, **surprising connections**, and a **mobile-first** dark UI. Built with Next.js, React, TailwindCSS, Framer Motion, and react-force-graph.

## Features

- **Smart search** — Type any topic (e.g. Einstein, Rome, AI) and explore its connections.
- **Interactive knowledge graph** — Force-directed graph with zoom, drag, and node click.
- **Discovery feed** — Cards with title, image, summary, and “interesting fact” next to the graph.
- **Entity details** — Side panel and full entity page with Wikipedia summary and related entities.
- **Exploration trail** — Path of visited entities with **shareable links** (e.g. `/explore/Q920-Q796`).
- **Trending** — Top 5 most searched (mock data; plug in real analytics when ready).
- **Random button** — “Take me somewhere random” for serendipitous discovery.
- **First-visit quiz** — Optional preferences (Science, History, etc.) stored in `localStorage`.
- **Dark, cinematic theme** — Deep black, neon accents, subtle glow.

## Tech stack

- **Frontend:** Next.js 16 (App Router), React 19, TailwindCSS 4, Framer Motion
- **Graph:** react-force-graph (2D), d3-force
- **APIs:** Wikidata (entities + relations), Wikipedia REST (summaries), optional Unsplash
- **Caching:** In-memory (replace with Redis in production)
- **Data:** No DB required for MVP; add PostgreSQL/Neo4j for history, achievements, users

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

<<<<<<< HEAD
**Erro de certificado SSL (rede corporativa/escolar):** Se aparecer `unable to get local issuer certificate` ao usar Explore ou Connect, rode em desenvolvimento com verificação SSL desabilitada: `npm run dev:insecure`. Use apenas em ambiente local.

=======
>>>>>>> 27823babd34dc607940de5ccd0a48669d086112f
- **Home:** Search bar, trending, random button, quiz (first visit).
- **Explore:** `/explore?q=Tesla` or `/explore?id=Q920` — graph, feed, details, trail.
- **Share trail:** Copy `/explore/Q920-Q796` to recreate the path.
- **Entity page:** `/entity/Q920` — full entity + related.

## Project structure

```
src/
├── app/
│   ├── page.tsx              # Home (search, trending, random, quiz)
│   ├── explore/
│   │   ├── page.tsx          # Discovery (graph + feed + details + trail)
│   │   └── [...slug]/        # Shareable trail route
│   ├── entity/[id]/page.tsx  # Single entity page
│   └── api/
│       ├── search/           # Wikidata search
│       ├── explore/          # Build graph + feed (by q or id)
│       ├── trending/         # Top 5 (mock)
│       ├── random/          # Random topic
│       └── entity/[id]/      # Entity + related
├── components/
│   ├── SearchBar.tsx
│   ├── TrendingSection.tsx
│   ├── RandomButton.tsx
│   ├── QuizModal.tsx
│   ├── KnowledgeGraph.tsx   # Force-directed graph (2D)
│   ├── DiscoveryFeed.tsx
│   ├── EntityDetails.tsx
│   └── ExplorationTrail.tsx
├── lib/
│   ├── wikidata.ts          # Search, get entity, relations
│   ├── wikipedia.ts         # Summary by title
│   ├── unsplash.ts          # Placeholder images
│   ├── discovery.ts         # Build graph + feed + algorithm
│   └── cache.ts             # In-memory cache
└── types/
    └── index.ts
```

## APIs used

- **Wikidata** — `wbsearchentities`, `wbgetentities` (labels, descriptions, claims).
- **Wikipedia** — REST `page/summary/{title}` for extract and thumbnail.
- Images from Wikimedia Commons (via Wikidata P18) or Wikipedia thumbnail; optional Unsplash with API key.

## Next steps

- **Achievements** — Explorer, Deep Diver, Rabbit Runner, etc., based on exploration (store in DB).
- **User accounts** — Email/password; exploration history, saved discoveries, profile.
- **Sound** — Short cinematic sounds on node discovery and achievements.
- **Recommendation engine** — Direct / popular / unexpected relations (partially in `discovery.ts`).
- **Database** — PostgreSQL or Neo4j for users, history, trending counts, cache.

## License

MIT.
=======
# RabbitHole
>>>>>>> f505aab3576a3dda24976b866fd6c0b643c84e18
