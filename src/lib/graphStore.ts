/**
 * Graph persistence layer: people, edges, paths.
 * In-memory implementation by default; plug Redis/SQLite for production.
 */

import type { Person, PersonEdge, ConnectionPath } from '@/types/connect';

export interface GraphStore {
  getEdges(personId: string): Promise<PersonEdge[]>;
  setEdges(personId: string, edges: PersonEdge[]): Promise<void>;
  getPath(personAId: string, personBId: string): Promise<ConnectionPath | null>;
  setPath(personAId: string, personBId: string, path: ConnectionPath): Promise<void>;
  getPerson(id: string): Promise<Person | null>;
  setPerson(person: Person): Promise<void>;
}

const pathKey = (a: string, b: string) =>
  [a, b].sort().join(':');

export class InMemoryGraphStore implements GraphStore {
  private edges = new Map<string, PersonEdge[]>();
  private paths = new Map<string, ConnectionPath>();
  private people = new Map<string, Person>();

  async getEdges(personId: string): Promise<PersonEdge[]> {
    return this.edges.get(personId) ?? [];
  }

  async setEdges(personId: string, edges: PersonEdge[]): Promise<void> {
    this.edges.set(personId, edges);
  }

  async getPath(personAId: string, personBId: string): Promise<ConnectionPath | null> {
    return this.paths.get(pathKey(personAId, personBId)) ?? null;
  }

  async setPath(personAId: string, personBId: string, path: ConnectionPath): Promise<void> {
    this.paths.set(pathKey(personAId, personBId), path);
  }

  async getPerson(id: string): Promise<Person | null> {
    return this.people.get(id) ?? null;
  }

  async setPerson(person: Person): Promise<void> {
    this.people.set(person.id, person);
  }
}

let defaultStore: GraphStore | null = null;

export function getDefaultGraphStore(): GraphStore {
  if (!defaultStore) defaultStore = new InMemoryGraphStore();
  return defaultStore;
}

export function setDefaultGraphStore(store: GraphStore): void {
  defaultStore = store;
}
