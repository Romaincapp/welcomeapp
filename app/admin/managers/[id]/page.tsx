import { getManagerDetails } from '@/lib/actions/admin/managers'
import { notFound } from 'next/navigation'
import ManagerDetailsClient from './ManagerDetailsClient'

export default async function ManagerDetailsPage({
  params,
}: {
  params: { id: string }
}) {
  const details = await getManagerDetails(params.id)

  if (!details) {
    notFound()
  }

  return <ManagerDetailsClient details={details} />
}
