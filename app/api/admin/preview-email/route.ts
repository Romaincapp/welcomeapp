import { NextRequest, NextResponse } from 'next/server';
import { render } from '@react-email/render';
import { MultipleUpdatesAnnouncement } from '@/emails/templates/MultipleUpdatesAnnouncement';

export const dynamic = 'force-dynamic';

interface UpdateItem {
  title: string;
  description: string;
  emoji?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { updates, customIntro } = await request.json() as {
      updates: UpdateItem[];
      customIntro?: string;
    };

    if (!updates || !Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json({ error: 'Aucune fonctionnalité fournie' }, { status: 400 });
    }

    // Rendre le composant React Email en HTML
    const html = await render(
      MultipleUpdatesAnnouncement({
        managerName: 'Prénom',
        managerEmail: 'preview@example.com',
        updates,
        customIntro: customIntro || undefined,
      })
    );

    return NextResponse.json({ html });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('[PREVIEW EMAIL] Erreur:', err);
    return NextResponse.json({ error: err?.message || 'Erreur interne' }, { status: 500 });
  }
}
