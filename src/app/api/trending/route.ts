import { NextResponse } from 'next/server';

// In production: store in DB/Redis and update from search logs every 24h
const MOCK_TRENDING = [
  { name: 'Elon Musk', searchCount: 1240, entityId: 'Q317521' },
  { name: 'World War II', searchCount: 980, entityId: 'Q362' },
  { name: 'Artificial intelligence', searchCount: 892, entityId: 'Q11660' },
  { name: 'Nikola Tesla', searchCount: 756, entityId: 'Q920' },
  { name: 'Roman Empire', searchCount: 654, entityId: 'Q2277' },
];

export async function GET() {
  return NextResponse.json({ trending: MOCK_TRENDING });
}
