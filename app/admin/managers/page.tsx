import { getAllManagers } from '@/lib/actions/admin/managers'
import AdminManagersClient from './AdminManagersClient'

export default async function AdminManagersPage() {
  // Récupérer tous les managers
  const managers = await getAllManagers({ limit: 1000 })

  return <AdminManagersClient initialManagers={managers} />
}
