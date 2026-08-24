import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { AdminFilmClient } from './AdminFilmClient';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('AdminFilm');
  return {
    title: `${t('title')} | Cinema Aurora Admin`,
    description: t('subtitle'),
  };
}

export default function AdminFilmPage() {
  return <AdminFilmClient />;
}
