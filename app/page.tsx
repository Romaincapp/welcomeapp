import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 p-4">
      <div className="text-center text-white max-w-4xl">
        <h1 className="text-6xl font-bold mb-4">WelcomeBook</h1>
        <p className="text-xl mb-8">Créez des guides personnalisés pour vos locations de vacances</p>

        <div className="grid md:grid-cols-3 gap-4 mb-8 text-left">
          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl">
            <div className="text-4xl mb-3">📱</div>
            <h3 className="font-bold text-lg mb-2">Interface moderne</h3>
            <p className="text-sm opacity-90">Design responsive et intuitif pour vos voyageurs</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl">
            <div className="text-4xl mb-3">✏️</div>
            <h3 className="font-bold text-lg mb-2">Édition facile</h3>
            <p className="text-sm opacity-90">Ajoutez et modifiez vos conseils en quelques clics</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl">
            <div className="text-4xl mb-3">🗺️</div>
            <h3 className="font-bold text-lg mb-2">Carte interactive</h3>
            <p className="text-sm opacity-90">Localisez tous vos lieux favoris sur une carte</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Link
            href="/demo"
            className="inline-block bg-white text-indigo-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition shadow-lg"
          >
            Voir la démo
          </Link>
          <Link
            href="/login"
            className="inline-block bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-indigo-600 transition"
          >
            Connexion gestionnaire
          </Link>
          <Link
            href="/signup"
            className="inline-block bg-indigo-700 text-white px-8 py-4 rounded-lg font-semibold hover:bg-indigo-800 transition shadow-lg"
          >
            Créer un compte
          </Link>
        </div>

        <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl text-sm">
          <p className="mb-2">
            <strong>Nouveau système d'authentification !</strong>
          </p>
          <p className="opacity-90">
            Créez un compte gratuit pour commencer à éditer votre welcomebook. Ajoutez, modifiez et supprimez vos conseils en temps réel.
          </p>
        </div>
      </div>
    </div>
  )
}
