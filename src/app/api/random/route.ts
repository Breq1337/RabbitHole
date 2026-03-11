import { NextResponse } from 'next/server';
import { getRandomTopic } from '@/lib/discovery';

export async function GET() {
  const topic = getRandomTopic();
  return NextResponse.json({ topic });
}
