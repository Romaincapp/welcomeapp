import { requireAdmin } from '@/lib/auth/admin';
import { getAppFeatures } from '@/lib/actions/admin/updates';
import FeaturesAdminClient from './FeaturesAdminClient';

export const dynamic = 'force-dynamic';

export default async function AdminUpdatesPage() {
  await requireAdmin();

  const result = await getAppFeatures();

  return (
    <FeaturesAdminClient
      features={result.features || []}
      error={result.error}
    />
  );
}
