'use client';

import { useEffect, useState } from 'react';

interface LoadingSpinnerProps {
  fullScreen?: boolean;
}

const motivationalPhrases = [
  "🏖️ Transformez chaque séjour en expérience mémorable...",
  "✨ Un welcomebook bien préparé = Des voyageurs enchantés",
  "🗺️ Vos meilleurs conseils valent de l'or pour vos hôtes",
  "💡 Partagez vos secrets locaux comme un pro",
  "🌟 Démarquez-vous avec un accueil digital unique",
  "📱 Modernisez l'expérience de vos voyageurs",
  "🎯 Gagnez du temps avec un guide interactif",
  "💬 Réduisez les questions répétitives intelligemment",
  "🏆 Offrez un service 5 étoiles dès l'arrivée",
  "🚀 Propulsez votre location dans l'ère digitale",
  "🎨 Personnalisez l'expérience de chaque voyageur",
  "📍 Vos bonnes adresses, toujours à portée de main",
  "⭐ Un accueil parfait commence avant l'arrivée",
  "🌍 Partagez votre région comme personne d'autre",
  "💝 Créez du lien avec vos voyageurs instantanément",
  "🔑 La clé d'un séjour réussi : l'information",
  "🎪 Faites vivre une aventure unique à vos hôtes",
  "📚 Votre expertise locale mérite d'être partagée",
  "🌈 Ajoutez de la couleur à chaque séjour",
  "💎 Votre welcomebook, votre signature unique"
];

export default function LoadingSpinner({ fullScreen = false }: LoadingSpinnerProps) {
  const [currentPhrase, setCurrentPhrase] = useState(0);
  const [fadeIn, setFadeIn] = useState(true);

  useEffect(() => {
    const phraseInterval = setInterval(() => {
      setFadeIn(false);

      setTimeout(() => {
        setCurrentPhrase((prev) => (prev + 1) % motivationalPhrases.length);
        setFadeIn(true);
      }, 300);
    }, 3500);

    return () => clearInterval(phraseInterval);
  }, []);

  const containerClasses = fullScreen
    ? "fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-indigo-950 via-purple-900 to-indigo-900"
    : "flex flex-col items-center justify-center p-8";

  return (
    <div className={containerClasses}>
      {/* Spinning Circle with Gradient */}
      <div className="relative mb-8">
        {/* Outer spinning ring */}
        <div className="w-24 h-24 rounded-full border-4 border-transparent border-t-indigo-400 border-r-purple-400 animate-spin"></div>

        {/* Middle spinning ring (slower) */}
        <div className="absolute inset-0 w-24 h-24 rounded-full border-4 border-transparent border-b-pink-400 border-l-blue-400 animate-spin-slow"></div>

        {/* Inner glow */}
        <div className="absolute inset-3 w-18 h-18 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 blur-md"></div>

        {/* Center dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-3 h-3 rounded-full bg-white animate-pulse"></div>
        </div>
      </div>

      {/* Motivational Phrase */}
      <div className="max-w-md text-center">
        <p
          className={`text-lg font-medium text-white/90 transition-all duration-300 ${
            fadeIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          }`}
        >
          {motivationalPhrases[currentPhrase]}
        </p>
      </div>

      {/* Loading dots */}
      <div className="flex gap-2 mt-6">
        <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-2 h-2 rounded-full bg-pink-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>
    </div>
  );
}
