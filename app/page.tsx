import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600">
      <div className="text-center text-white">
        <h1 className="text-6xl font-bold mb-4">WelcomeBook</h1>
        <p className="text-xl mb-8">Créez des guides personnalisés pour vos locations</p>
        <div className="space-x-4">
          <Link
            href="/demo"
            className="inline-block bg-white text-indigo-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            Voir la démo
          </Link>
          <Link
            href="/admin"
            className="inline-block bg-transparent border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-indigo-600 transition"
          >
            Espace gestionnaire
          </Link>
        </div>
      </div>
    </div>
  )
}
