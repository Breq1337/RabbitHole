// Unsplash API - images (free tier, no key required for demo; use placeholder or public source)

const UNSPLASH_SOURCE = 'https://source.unsplash.com/400x300';

export function getEntityImageUrl(query: string, entityId?: string): string {
  // Unsplash Source is deprecated; use a placeholder service or require API key
  // For production: https://api.unsplash.com/search/photos?query=... with API key
  const q = encodeURIComponent(query.split(' ').slice(0, 2).join(' '));
  return `https://images.unsplash.com/photo-1516542076529-1ea3854896f2?w=400&h=300&fit=crop`;
}

export async function searchUnsplashImages(query: string, count = 3): Promise<string[]> {
  // Placeholder: return generic knowledge/exploration images without API key
  const fallbacks = [
    'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1516542076529-1ea3854896f2?w=400&h=300&fit=crop',
  ];
  return fallbacks.slice(0, count);
}
