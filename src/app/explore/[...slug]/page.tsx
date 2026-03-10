import { redirect } from 'next/navigation';

interface PageProps {
  params: Promise<{ slug: string[] }>;
}

// Shareable trail: /explore/Q920-Q796-Q123 -> load first entity and show trail
export default async function ExploreSlugPage({ params }: PageProps) {
  const { slug } = await params;
  const segment = Array.isArray(slug) ? slug[0] : slug;
  if (!segment) redirect('/');
  const ids = segment.split('-').filter(Boolean).map((s) => (s.startsWith('Q') ? s : `Q${s}`));
  const firstId = ids[0];
  if (!firstId) redirect('/');
  redirect(`/explore?id=${encodeURIComponent(firstId)}&trail=${encodeURIComponent(ids.join('-'))}`);
}
