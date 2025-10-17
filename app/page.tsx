import Link from 'next/link'
import BackgroundCarousel from '@/components/BackgroundCarousel'
import { readdirSync } from 'fs'
import { join } from 'path'

function getBackgroundImages() {
  try {
    const imagesDirectory = join(process.cwd(), 'public', 'background-images')
    const filenames = readdirSync(imagesDirectory)
    return filenames
      .filter(file => /\.(jpg|jpeg|png|webp|gif)$/i.test(file))
      .map(file => `/background-images/${file}`)
  } catch {
    return []
  }
}

export default function Home() {
  const backgroundImages = getBackgroundImages()

  return (
    <>
      <BackgroundCarousel images={backgroundImages} interval={5000} />
      <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="text-center text-white max-w-5xl mx-auto px-4">
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-bold mb-3 sm:mb-4 md:mb-6 drop-shadow-lg">
            welcomebook
          </h1>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-8 sm:mb-10 md:mb-12 opacity-90 drop-shadow-md max-w-3xl mx-auto px-2">
            Créez des guides personnalisés pour vos locations de vacances
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-stretch sm:items-center max-w-3xl mx-auto">
            <Link
              href="/demo"
              className="inline-block bg-white text-indigo-600 px-6 sm:px-8 py-3 sm:py-4 rounded-lg text-sm sm:text-base font-semibold hover:bg-gray-100 transition shadow-lg"
            >
              Voir la démo
            </Link>
            <Link
              href="/login"
              className="inline-block bg-transparent border-2 border-white text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg text-sm sm:text-base font-semibold hover:bg-white hover:text-indigo-600 transition"
            >
              Connexion
            </Link>
            <Link
              href="/signup"
              className="inline-block bg-indigo-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg text-sm sm:text-base font-semibold hover:bg-indigo-800 transition shadow-lg"
            >
              Créer un compte
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
