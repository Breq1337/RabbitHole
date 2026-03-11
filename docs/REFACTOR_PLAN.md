# Rabbit Hole — Refatoração de Performance e Arquitetura

## SECTION A — Diagnóstico dos Gargalos Atuais

### 1. Múltiplas chamadas HTTP sequenciais
- **Share page** (`/connect/[personA]/[personB]`): 2× POST `/api/connect/resolve` (A e B) + 1× POST `/api/connect/search` = **3 round-trips** antes de qualquer conteúdo.
- **Connect page**: usuário escolhe A e B no client (resolve já feito no autocomplete); depois 1× POST `/api/connect/search`. Pareado, mas o resolve no autocomplete pode ser pesado (Wikidata + Wikipedia por candidato).

### 2. Resolução de pessoas serial e pesada
- `personResolver.resolvePerson(query)`: 1× searchWikidata → depois **loop serial** sobre até 5 resultados: para cada um, `getWikidataEntity` + `getWikipediaSummary`. Ou seja, até **1 + 5×2 = 11** chamadas externas por query.
- Sem controle de concorrência; sem separação entre “candidatos leves” e “hidratação pesada”.

### 3. Extração de vizinhos cara e mal ordenada
- `peopleGraph.getPrunedNeighbors`: sempre chama `extractWikidataEdges` e, se `uniqueWdTargets < TOP_K`, chama `extractNeighbors` (Wikipedia). Wikipedia faz fetchParse + resolveTitlesToQidsBatch (batches de 5). Prioridade invertida: poderia usar só Wikidata primeiro e só fallback para Wikipedia quando insuficiente.
- `wikipediaExtractor.extractNeighbors`: batch de title→QID de apenas 5; muitas idas ao servidor.

### 4. Path search sem camada local
- Cada expansão BFS chama `getPrunedNeighbors(node.id)`, que pode disparar Wikidata + Wikipedia. Nenhum uso de “edge store” local; mesmo par (A,B) é recalculado.
- Sem hub penalty; nós com muitos vizinhos dominam a fronteira.
- Sem cap duro de vizinhos por nó; sem “local edge first”.

### 5. Cache só em memória
- `lib/cache.ts`: Map in-memory. Reinício do processo = perda total. Sem TTL por tipo (resolved, neighbors, path). Sem L2 (Redis) para múltiplas instâncias.

### 6. Share page 100% client-side
- Tudo em `useEffect`: resolve A, resolve B, search. Loading longo; sem SSR/prefetch; sem uma única resposta “pronta para render”.

### 7. Resumo dos gargalos
| Área | Problema | Impacto |
|------|----------|---------|
| Resolver | Serial, sem batch de entity/summary | Alta latência por query |
| Neighbors | Wikipedia antes de esgotar Wikidata; batch pequeno | Muitas chamadas por nó |
| Path search | Sem store local; sem hub penalty; sem cap | BFS lento e instável |
| Share | 3 requests em cascata no client | 3× RTT + tempo de resolução |
| Cache | Só L1 em memória | Cold start e sem escala |
| Rotas | resolve + search separados | Cliente orquestra; mais round-trips |

---

## SECTION B — Nova Arquitetura de Rotas

| Rota | Método | Uso | Responsabilidade |
|------|--------|-----|-------------------|
| `POST /api/connect/autocomplete` | POST | UX: sugestões ao digitar | Resolve leve: candidatos (id, label, opcional thumbnail); sem hidratação pesada de todos. |
| `POST /api/connect/find` | POST | Fluxo principal e share | Resolve A e B (ou usa IDs), busca caminho, devolve **uma** resposta: `{ path | error, personA?, personB? }`. |
| `POST /api/connect/search` | POST | Mantido para compatibilidade | Recebe `personAId`, `personBId`; apenas path search (usado por find internamente). |
| `POST /api/connect/resolve` | POST | Deprecar para “find” | Manter por compatibilidade; clientes migram para autocomplete + find. |
| `GET /api/connect/surprise-pair` | GET | Par aleatório | Retorna dois Person já hidratados (ou IDs + find). |
| `POST /api/connect/prefetch-neighbors` | POST | Opcional | Recebe `personId[]`; preaquece cache de vizinhos em background. |
| `GET /api/connect/trending-pairs` | GET | Opcional | Pares populares em cache (TTL curto). |

**Contrato recomendado**

- **autocomplete**  
  Body: `{ query: string, limit?: number }`  
  Response: `{ people: PersonCandidate[] }` (id, canonicalName, wikipediaTitle?, image?, shortDescription? opcional; mínimo para dropdown).

- **find**  
  Body: `{ personAQuery: string, personBQuery: string } | { personAId: string, personBId: string }`  
  Response: `{ path?: ConnectionPath, error?: string, personA?: Person, personB?: Person }`.  
  Uma única chamada resolve + path (+ hidratação só dos nós do caminho).

---

## SECTION C — Nova Arquitetura de Serviços

### Resolver
- **resolvePersonCandidates(query, limit?)**: só busca Wikidata + entity básica (labels, P31, P18, sitelinks); retorna candidatos com id, label, wikipediaTitle?, image?; **sem** Wikipedia summary em batch.
- **hydrateResolvedPeople(ids: string[])**: dado N ids, busca em batch entity + Wikipedia summary; concorrência limitada (ex.: p-limit 4); retorna `Map<id, Person>`.
- **getResolvedPersonById(id)**: cache-first (L1/L2); se miss, hidrata esse id e grava no cache.
- **resolvePerson** (compatibilidade): usa resolvePersonCandidates + hydrateResolvedPeople para os primeiros `limit` candidatos; mantém contrato atual.

### Extração (Wikipedia / Wikidata)
- **Title → QID**: cache forte (L1+L2); batch maior (ex.: 15–20 títulos por chamada quando possível).
- **peopleGraph.getPrunedNeighbors**:
  - Fase 1: só `extractWikidataEdges` (estruturado).
  - Se `edges.length < TOP_K`: Fase 2: `extractNeighbors` (Wikipedia) com prioridade para infobox (spouse, family, coach, etc.) e depois bio_link como fallback.
- Ordem de relação preferida: spouse, family, co-star, teammate, rival, co-founder, worked with, collaborated with, coached by, mentored by; bio_link por último.

### Grafo e path search
- **Edge store** (interface): `getEdges(personId)`, `setEdges(personId, edges)`, `getPath(personA, personB)`, `setPath(...)`. Implementação: in-memory + opcional persistência (SQLite/Redis).
- **pathSearch**:
  - Primeiro: arestas do edge store (local).
  - Expandir só se necessário com getPrunedNeighbors (que usa cache/store).
  - Hub penalty: nós com grau > N (ex.: 50) têm custo maior ou são atrasados na fila.
  - Max neighbors por nó (ex.: 15); ordenar por confidence antes de expandir.
  - Timeout e best-effort: retornar melhor caminho parcial se timeout.

### Cache
- **L1**: in-memory, por processo; TTL por tipo (resolved: 1h, neighbors: 24h, path: 24h, title2qid: 24h).
- **L2**: interface (Redis-ready); chaves: `connect:person:{id}`, `connect:neighbors:{id}`, `connect:path:{idA}:{idB}`, `connect:title2qid:{title}`, `connect:resolve:{query}`.

---

## SECTION D — Estratégia de Cache

- **Chaves**  
  - Pessoa: `connect:person:{wikidataId}`  
  - Resolve por query: `connect:resolve:{queryNormalized}`  
  - Vizinhos: `connect:neighbors:{wikidataId}`  
  - Path: `connect:path:{idA}:{idB}` (ids ordenados)  
  - Title→QID: `connect:title2qid:{titleNormalized}`  
  - Trending: `connect:trending:pairs`

- **TTL (sugerido)**  
  - Resolved people: 3600  
  - Neighbors: 86400  
  - Path: 86400  
  - Title2QID: 86400  
  - Trending: 300  

- **L1**: Map com expires; L2: adapter (no-op ou Redis). Get: L1 → L2 → miss. Set: write-through L1 + L2.

---

## SECTION E — Persistência do Grafo

- **Modelo**  
  - **people**: id (QID), canonical_name, wikipedia_title, wikipedia_url, image_url, short_description, updated_at.  
  - **edges**: source_id, target_id, relation_type, relation_label, confidence, evidence_type, updated_at.  
  - **paths**: person_a_id, person_b_id, path_json (array de ids + edges), score, length, created_at.  
  - **neighbor_snapshots**: person_id, edges_json, updated_at.

- **Implementação**  
  - Interface `GraphStore` com getEdges, setEdges, getPath, setPath, getPerson, setPerson.  
  - In-memory por padrão; adapters opcionais: SQLite (better-sqlite3), Redis (hashes + sets), ou PostgreSQL.  
  - peopleGraph e pathSearch usam o store: leem primeiro do store; escrevem no store ao obter vizinhos/caminhos.

---

## SECTION F — Redesenho do Fluxo de Dados (Server/Client)

- **Página Connect (busca principal)**  
  - Autocomplete: `POST /api/connect/autocomplete` com debounce; resposta leve (candidatos).  
  - Ao clicar “Find Connection”: se dois Person já selecionados (com id), uma chamada `POST /api/connect/find` com `personAId` e `personBId`; resposta única com path ou error.  
  - Alternativa: se a UI permitir “buscar por texto” sem escolher pessoa, um único `POST /api/connect/find` com `personAQuery` e `personBQuery`.

- **Share page**  
  - Uma única chamada: `POST /api/connect/find` com `personAQuery` e `personBQuery` derivados dos slugs (ex.: slug “Kevin-Bacon” → “Kevin Bacon”).  
  - Possível implementação: Server Component que chama find no servidor e renderiza com o payload; ou Client com um único useEffect que chama find uma vez e mostra resultado.  
  - Objetivo: **uma** requisição HTTP para “resolver A + B + path” e mostrar conteúdo.

- **Expansão do grafo**  
  - Carregar nós adicionais sob demanda (ex.: “expandir nó X”); usar prefetch-neighbors quando fizer sentido; manter estado otimista no client quando possível.

---

## SECTION G — Estratégia de Otimização do BFS

- **Local edge first**: para cada nó, obter arestas primeiro do GraphStore/cache; só chamar getPrunedNeighbors (Wikidata/Wikipedia) em cache miss.
- **Ordenação por qualidade**: antes de enfileirar, ordenar vizinhos por confidence (e preferir relation_type forte); expandir os melhores primeiro.
- **Cap de vizinhos**: máximo 15 (ou configurável) por nó; evita explosão da fronteira.
- **Hub penalty**: nós com grau > 50 (ou limiar) entram com “depth virtual” maior ou são processados depois (fila de prioridade).
- **Memoização**: por request, cache de getPrunedNeighbors por node id (evita chamadas duplicadas na mesma busca).
- **Short-circuit**: ao encontrar primeiro encontro A–B, reconstruir caminho e retornar; opcionalmente continuar em background para caminhos alternativos (best-effort).
- **Timeout**: ex.: 25s; ao estourar, retornar melhor caminho parcial encontrado ou mensagem clara.

---

## SECTION H — Redesenho da Share Page

- **Objetivo**: zero cascata de requests no client; uma chamada que devolve path + personA + personB.
- **Opção 1 (recomendada)**  
  - Página Server Component: em `page.tsx`, ler `params.personA` e `params.personB`, converter slugs em queries, chamar `findConnectionByQuery(personAQuery, personBQuery)` no servidor (função que usa resolve + pathSearch).  
  - Passar o resultado como props para um Client Component que só desenha ConnectionResult e loading/error.  
  - Uma única “viagem” de dados no servidor; cliente recebe HTML já preenchido ou um único fetch para dados JSON.

- **Opção 2**  
  - Página permanece Client; no mount, **uma** chamada `POST /api/connect/find` com `personAQuery` e `personBQuery` (slugs → texto).  
  - Resposta contém path (ou error) e personA/personB; setState único; sem resolve separado.

- **Implementação**: usar Opção 2 no código (uma chamada find no client) para não bloquear o primeiro paint com Server Component pesado; depois migrar para Opção 1 (RSC) se quiser melhor SEO e primeiro paint.

---

## SECTION I — Plano de Refatoração Arquivo a Arquivo

| Arquivo | Ação |
|---------|------|
| `lib/cache.ts` | Substituir por cache em camadas: L1 (memory) + interface L2; TTL por tipo; get/set/invalidate. |
| `services/connect/personResolver.ts` | Adicionar resolvePersonCandidates, hydrateResolvedPeople, getResolvedPersonById; concurrency limit; manter resolvePerson. |
| `services/connect/wikipediaExtractor.ts` | Aumentar batch title→QID; cache forte; usar em peopleGraph só como fallback. |
| `services/connect/wikidataExtractor.ts` | Manter; chamado primeiro em getPrunedNeighbors. |
| `services/connect/peopleGraph.ts` | Estágio 1: só Wikidata; estágio 2: Wikipedia se edges < TOP_K; usar GraphStore se existir; max neighbors. |
| `services/connect/pathSearch.ts` | Ler do store primeiro; memoização por request; hub penalty; max neighbors; timeout; ordenar por confidence. |
| `lib/graphStore.ts` (novo) | Interface GraphStore; implementação InMemoryGraphStore; opcionalmente SQLite/Redis. |
| `app/api/connect/autocomplete/route.ts` | POST; resolvePersonCandidates + hidratação leve ou só candidatos. |
| `app/api/connect/find/route.ts` | POST; body personAQuery/personBQuery ou personAId/personBId; resolve (se query) + findConnectionPath; retornar path + personA + personB. |
| `app/api/connect/resolve/route.ts` | Manter; pode delegar para novo resolver. |
| `app/api/connect/search/route.ts` | Manter; usado por find. |
| `app/connect/page.tsx` | Manter fluxo; PersonSearchInput usa autocomplete; handleSearch chama find com ids. |
| `app/connect/[personA]/[personB]/page.tsx` | Uma chamada find com personAQuery/personBQuery derivados dos slugs; remover dupla resolve + search. |
| `components/connect/PersonSearchInput.tsx` | Trocar fetch de `/api/connect/resolve` para `/api/connect/autocomplete`. |

---

## SECTION J — Exemplos TypeScript (Production-Ready)

Ver implementação nos arquivos:

- `lib/cacheLayered.ts` — cache L1 + L2
- `lib/graphStore.ts` — interface + InMemoryGraphStore
- `services/connect/personResolver.ts` — resolvePersonCandidates, hydrateResolvedPeople, getResolvedPersonById
- `services/connect/peopleGraph.ts` — staged extraction, store
- `services/connect/pathSearch.ts` — local-first, hub penalty, memo, timeout
- `app/api/connect/find/route.ts` — unified find
- `app/api/connect/autocomplete/route.ts` — lightweight autocomplete
- `app/connect/[personA]/[personB]/page.tsx` — single-request share
