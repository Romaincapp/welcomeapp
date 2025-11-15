import { getAllCampaignsAnalytics } from '@/lib/actions/admin/campaign-analytics';
import AdminCampaignsClient from './AdminCampaignsClient';

export const metadata = {
  title: 'Campagnes Email | Admin WelcomeApp',
  description: 'Gestion des campagnes email marketing et analytics',
};

export default async function AdminCampaignsPage() {
  // Récupérer toutes les campagnes avec analytics
  const campaigns = await getAllCampaignsAnalytics();

  return <AdminCampaignsClient campaigns={campaigns} />;
}
