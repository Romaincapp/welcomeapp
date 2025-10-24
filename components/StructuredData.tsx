/**
 * Données structurées Schema.org pour le SEO
 * Aide Google à comprendre que WelcomeApp est un logiciel SaaS B2B
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
        description: 'Plateforme SaaS de welcomebook digital pour conciergeries, promoteurs immobiliers et gestionnaires de locations de vacances',
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'Sales',
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
        name: 'WelcomeApp',
        applicationCategory: 'BusinessApplication',
        applicationSubCategory: 'Property Management Software',
        operatingSystem: 'Web',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'EUR',
          priceValidUntil: '2025-12-31',
          availability: 'https://schema.org/InStock',
          description: 'Essai gratuit disponible'
        },
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '4.8',
          ratingCount: '45',
          bestRating: '5'
        },
        description: 'Solution SaaS de welcomebook digital pour conciergeries et promoteurs immobiliers. Gestion multi-propriétés, check-in automatisé, guides voyageurs personnalisés.',
        featureList: [
          'Welcomebook digital personnalisable',
          'Gestion multi-propriétés',
          'Check-in automatisé',
          'Guide voyageur interactif avec carte',
          'Conseils et recommandations géolocalisés',
          'Solution white-label',
          'Interface mobile-first',
          'Codes promo et horaires',
          'Boutons d\'action (itinéraire, appel, SMS, site web)'
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
      // Service (pour le SEO B2B)
      {
        '@type': 'Service',
        serviceType: 'Property Management Software',
        provider: {
          '@id': 'https://welcomeapp.be/#organization'
        },
        areaServed: {
          '@type': 'Country',
          name: 'Belgium'
        },
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: 'Solutions WelcomeApp',
          itemListElement: [
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
            },
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Service',
                name: 'Solution pour Gestionnaires Indépendants',
                description: 'Welcomebook digital pour locations de vacances individuelles'
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
        name: 'WelcomeApp - Solution Welcomebook Digital pour Conciergeries & Promoteurs Immobiliers',
        description: 'Plateforme SaaS de welcomebook digital pour conciergeries, promoteurs immobiliers et gestionnaires professionnels',
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
        inLanguage: 'fr-BE'
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
