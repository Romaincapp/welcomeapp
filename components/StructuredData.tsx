/**
 * Données structurées Schema.org pour le SEO
 * Aide Google à comprendre que WelcomeApp est un livret d'accueil digital gratuit pour Airbnb
 */

export default function StructuredData() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      // Organisation
      {
        '@type': 'Organization',
        '@id': 'https://welcomeapp.be/#organization',
        name: 'WelcomeApp',
        url: 'https://welcomeapp.be',
        logo: {
          '@type': 'ImageObject',
          url: 'https://welcomeapp.be/icon-512.png',
          width: 512,
          height: 512
        },
        description: 'Plateforme gratuite de livret d\'accueil digital pour Airbnb, gîtes, villas et locations de vacances. Solution welcomebook numérique pour hôtes, conciergeries et gestionnaires professionnels.',
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'Customer Support',
          availableLanguage: ['fr', 'en']
        }
      },
      // Site web
      {
        '@type': 'WebSite',
        '@id': 'https://welcomeapp.be/#website',
        url: 'https://welcomeapp.be',
        name: 'WelcomeApp',
        publisher: {
          '@id': 'https://welcomeapp.be/#organization'
        },
        inLanguage: 'fr-BE'
      },
      // Application logicielle (SoftwareApplication)
      {
        '@type': 'SoftwareApplication',
        name: 'WelcomeApp - Livret d\'Accueil Digital Gratuit',
        applicationCategory: 'BusinessApplication',
        applicationSubCategory: 'Property Management Software',
        operatingSystem: 'Web',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'EUR',
          priceValidUntil: '2026-12-31',
          availability: 'https://schema.org/InStock',
          description: '100% gratuit - Livret d\'accueil digital sans carte bancaire. Aucun abonnement requis.'
        },
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '4.8',
          ratingCount: '45',
          bestRating: '5'
        },
        description: 'Livret d\'accueil digital gratuit pour Airbnb, gîtes, villas et locations de vacances. Créez votre welcomebook numérique professionnel avec carte interactive, recommandations locales, infos pratiques. Solution idéale pour hôtes Airbnb, conciergeries et gestionnaires.',
        featureList: [
          'Livret d\'accueil digital 100% gratuit',
          'Idéal pour Airbnb, gîtes, villas, chalets',
          'Guide voyageur interactif avec carte',
          'Recommandations locales géolocalisées',
          'Informations pratiques (WiFi, check-in, parking)',
          'Boutons d\'action (itinéraire, appel, SMS, site web)',
          'Interface mobile-first',
          'Création en 5 minutes',
          'Aucune carte bancaire requise',
          'Multi-langues (7 langues)',
          'Gestion multi-propriétés'
        ],
        screenshot: 'https://welcomeapp.be/og-image.jpg',
        softwareVersion: '1.0',
        author: {
          '@id': 'https://welcomeapp.be/#organization'
        },
        provider: {
          '@id': 'https://welcomeapp.be/#organization'
        }
      },
      // Service (pour le SEO B2C et B2B)
      {
        '@type': 'Service',
        serviceType: 'Digital Welcomebook Software',
        provider: {
          '@id': 'https://welcomeapp.be/#organization'
        },
        areaServed: [
          {
            '@type': 'Country',
            name: 'Belgium'
          },
          {
            '@type': 'Country',
            name: 'France'
          }
        ],
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: 'Solutions WelcomeApp Gratuites',
          itemListElement: [
            {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'EUR',
              itemOffered: {
                '@type': 'Service',
                name: 'Livret d\'Accueil Digital Gratuit pour Airbnb',
                description: 'Solution gratuite pour hôtes Airbnb : livret d\'accueil numérique avec guide interactif, carte, recommandations locales'
              }
            },
            {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'EUR',
              itemOffered: {
                '@type': 'Service',
                name: 'Welcomebook Gratuit pour Gîtes',
                description: 'Livret d\'accueil digital gratuit pour gîtes ruraux, chalets, villas'
              }
            },
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Service',
                name: 'Solution pour Conciergeries',
                description: 'Plateforme de gestion multi-propriétés pour conciergeries professionnelles'
              }
            },
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Service',
                name: 'Solution pour Promoteurs Immobiliers',
                description: 'Outil de valorisation et communication pour résidences de tourisme'
              }
            }
          ]
        }
      },
      // Page d'accueil
      {
        '@type': 'WebPage',
        '@id': 'https://welcomeapp.be/#webpage',
        url: 'https://welcomeapp.be',
        name: 'WelcomeApp - Livret d\'Accueil Digital Gratuit pour Airbnb & Locations de Vacances',
        description: 'Créez votre livret d\'accueil digital gratuit pour Airbnb, gîte, villa, appartement. Welcomebook numérique professionnel avec guide interactif, carte, recommandations. 100% gratuit, sans carte bancaire.',
        isPartOf: {
          '@id': 'https://welcomeapp.be/#website'
        },
        about: {
          '@id': 'https://welcomeapp.be/#organization'
        },
        primaryImageOfPage: {
          '@type': 'ImageObject',
          url: 'https://welcomeapp.be/og-image.jpg',
          width: 1200,
          height: 630
        },
        inLanguage: 'fr-BE',
        keywords: 'livret accueil digital gratuit, airbnb, welcomebook, guide voyageur, gîte, villa, location vacances'
      }
    ]
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}
