// Rabbit Hole - Core types

export type EntityType = 'person' | 'concept' | 'event' | 'place' | 'work' | 'technology' | 'other';

export interface Entity {
  id: string;
  name: string;
  description?: string;
  summary?: string;
  image?: string;
  type: EntityType;
  wikipediaUrl?: string;
  wikidataId?: string;
  interestingFact?: string;
  source?: string;
}

export interface Relation {
  sourceId: string;
  targetId: string;
  label?: string;
  type?: string;
}

export interface GraphNode {
  id: string;
  name: string;
  val?: number;
  group?: string;
  entity?: Entity;
}

export interface GraphLink {
  source: string;
  target: string;
  label?: string;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

export interface DiscoveryCard {
  id: string;
  title: string;
  image?: string;
  summary: string;
  interestingFact?: string;
  entity: Entity;
}

export interface ExplorationStep {
  entityId: string;
  entityName: string;
  timestamp: number;
}

export interface QuizPreference {
  topics: string[];
}

export interface TrendingEntity {
  name: string;
  searchCount: number;
  entityId?: string;
}

export type ConnectionType = 'direct' | 'popular' | 'unexpected';
