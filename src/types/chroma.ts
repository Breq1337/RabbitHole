// Chroma People Grid — content model

export type ChromaGridVariant =
  | 'trending'
  | 'related'
  | 'continueExploring'
  | 'savedTrails'
  | 'popularConnections';

export interface ChromaGridItem {
  id: string;
  name: string;
  image?: string;
  description?: string;
  badge?: string;
  relationHint?: string;
  href?: string;
  entityId?: string;
  /** Used for ordering / emphasis */
  score?: number;
}
