// Unsplash API - images (usa UNSPLASH_ACCESS_KEY do .env.local)

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1516542076529-1ea3854896f2?w=400&h=300&fit=crop',
];

function getAccessKey(): string | undefined {
  return process.env.UNSPLASH_ACCESS_KEY;
}

export function getEntityImageUrl(query: string, entityId?: string): string {
  // Quando quiser usar imagem por query, use searchUnsplashImages (async)
  return FALLBACK_IMAGES[0];
}

export async function searchUnsplashImages(query: string, count = 3): Promise<string[]> {
  const key = getAccessKey();
  if (!key) {
    return FALLBACK_IMAGES.slice(0, count);
  }
  try {
    const q = encodeURIComponent(query.split(' ').slice(0, 3).join(' '));
    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${q}&client_id=${key}&per_page=${count}`
    );
    if (!res.ok) return FALLBACK_IMAGES.slice(0, count);
    const data = (await res.json()) as { results?: { urls?: { regular?: string } }[] };
    const urls = (data.results ?? [])
      .map((r) => r.urls?.regular)
      .filter((u): u is string => Boolean(u));
    return urls.length > 0 ? urls : FALLBACK_IMAGES.slice(0, count);
  } catch {
    return FALLBACK_IMAGES.slice(0, count);
  }
}
