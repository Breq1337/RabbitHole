import { NextResponse } from 'next/server';
import { resolvePerson } from '@/services/connect/personResolver';
import type { Person } from '@/types/connect';

const FAMOUS_PAIRS = [
  ['Kevin Bacon', 'Robert Downey Jr.'],
  ['Einstein', 'Marilyn Monroe'],
  ['Steve Jobs', 'Barack Obama'],
  ['Ayrton Senna', 'Pelé'],
  ['Marie Curie', 'Ada Lovelace'],
  ['David Bowie', 'Andy Warhol'],
  ['Stephen Hawking', 'Leonard Cohen'],
  ['Oprah Winfrey', 'Ellen DeGeneres'],
  ['Elon Musk', 'Jeff Bezos'],
  ['Coco Chanel', 'Pablo Picasso'],
];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

export async function GET() {
  const [nameA, nameB] = pickRandom(FAMOUS_PAIRS);
  try {
    const [peopleA, peopleB] = await Promise.all([
      resolvePerson(nameA),
      resolvePerson(nameB),
    ]);
    const personA: Person | null = peopleA[0] ?? null;
    const personB: Person | null = peopleB[0] ?? null;
    return NextResponse.json({
      personA,
      personB,
      pairLabel: `${nameA} ↔ ${nameB}`,
    });
  } catch (e) {
    console.error('[surprise-pair]', e);
    return NextResponse.json(
      { personA: null, personB: null, pairLabel: `${nameA} ↔ ${nameB}` },
      { status: 200 }
    );
  }
}
