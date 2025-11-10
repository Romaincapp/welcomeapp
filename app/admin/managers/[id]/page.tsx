import { getManagerDetails } from '@/lib/actions/admin/managers'
import { notFound } from 'next/navigation'
import ManagerDetailsClient from './ManagerDetailsClient'

export default async function ManagerDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const details = await getManagerDetails(id)

  if (!details) {
    notFound()
  }

  return <ManagerDetailsClient details={details} />
}
