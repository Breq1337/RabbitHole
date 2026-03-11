// Six Degrees — People Connection Engine types

export type Domain =
  | 'actor'
  | 'athlete'
  | 'musician'
  | 'founder'
  | 'politician'
  | 'scientist'
  | 'influencer'
  | 'historical'
  | 'other';

export type RelationType =
  | 'ACTED_WITH'
  | 'TEAMMATE_OF'
  | 'RIVAL_OF'
  | 'CO_FOUNDED_WITH'
  | 'WORKED_WITH'
  | 'MARRIED_TO'
  | 'DATED'
  | 'FAMILY_OF'
  | 'COACHED_BY'
  | 'MENTORED_BY'
  | 'INTERVIEWED_BY'
  | 'APPEARED_WITH'
  | 'COLLABORATED_WITH'
  | 'SHARED_GOVERNMENT'
  | 'SUCCESSOR_OF'
  | 'PREDECESSOR_OF'
  | 'PLAYED_AGAINST'
  | 'PRODUCED_WITH'
  | 'DIRECTED'
  | 'SHARED_BAND'
  | 'SHARED_PROJECT'
  | 'SHARED_INSTITUTION'
  | 'SHARED_EVENT'
  | 'INSPIRED'
  | 'TRIBUTED'
  | 'UNKNOWN';

export type EvidenceType = 'infobox' | 'wikidata' | 'bio_link' | 'category';

export interface Person {
  id: string;
  canonicalName: string;
  aliases?: string[];
  wikipediaTitle?: string;
  wikipediaUrl?: string;
  image?: string;
  shortDescription?: string;
  domains?: Domain[];
  popularityScore?: number;
}

export interface PersonEdge {
  sourcePersonId: string;
  targetPersonId: string;
  relationType: RelationType;
  relationLabel: string;
  evidenceType: EvidenceType;
  sourceWikipediaPages?: string[];
  domain?: Domain;
  confidence: number;
}

export interface ConnectionPath {
  persons: Person[];
  edges: {
    fromIndex: number;
    toIndex: number;
    label: string;
    relationType: string;
  }[];
  score: number;
  length: number;
}
