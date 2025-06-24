import type { Metadata } from "next"

export interface SEOConfig {
  title: string
  description: string
  keywords?: string[]
  author?: string
  canonical?: string
  ogTitle?: string
  ogDescription?: string
  ogImage?: string
  ogType?: string
  ogUrl?: string
  twitterCard?: "summary" | "summary_large_image" | "app" | "player"
  twitterSite?: string
  twitterCreator?: string
  twitterTitle?: string
  twitterDescription?: string
  twitterImage?: string
  robots?: string
  viewport?: string
  themeColor?: string
  alternates?: {
    canonical?: string
    languages?: Record<string, string>
  }
  verification?: {
    google?: string
    yandex?: string
    yahoo?: string
    other?: Record<string, string>
  }
}

export const defaultSEOConfig: SEOConfig = {
  title: "Kothler | Precisión Y Crecimiento",
  description:
    "Desarrollamos software a medida, sitios web y sistemas especializados para restaurantes, hoteles y más. Soluciones digitales que transforman tu negocio.",
  keywords: [
    "desarrollo web",
    "software a medida",
    "sistemas para restaurantes",
    "sistemas para hoteles",
    "desarrollo de aplicaciones",
    "soluciones digitales",
    "Guadalajara",
    "México",
    "tecnología",
    "innovación",
  ],
  author: "Kothler",
  ogType: "website",
  ogImage: "/og-image.jpg",
  twitterCard: "summary_large_image",
  twitterSite: "@kothler",
  robots: "index, follow",
  viewport: "width=device-width, initial-scale=1",
  themeColor: "#000000",
}

export function generateMetadata(config: Partial<SEOConfig> = {}): Metadata {
  const seoConfig = { ...defaultSEOConfig, ...config }

  const metadata: Metadata = {
    title: seoConfig.title,
    description: seoConfig.description,
    keywords: seoConfig.keywords?.join(", "),
    authors: seoConfig.author ? [{ name: seoConfig.author }] : undefined,
    robots: seoConfig.robots,
    viewport: seoConfig.viewport,
    themeColor: seoConfig.themeColor,

    openGraph: {
      title: seoConfig.ogTitle || seoConfig.title,
      description: seoConfig.ogDescription || seoConfig.description,
      type: seoConfig.ogType as any,
      url: seoConfig.ogUrl,
      images: seoConfig.ogImage
        ? [
            {
              url: seoConfig.ogImage,
              width: 1200,
              height: 630,
              alt: seoConfig.ogTitle || seoConfig.title,
            },
          ]
        : undefined,
      siteName: "Kothler",
      locale: "es_MX",
    },

    twitter: {
      site: seoConfig.twitterSite,
      creator: seoConfig.twitterCreator,
      title: seoConfig.twitterTitle || seoConfig.title,
      description: seoConfig.twitterDescription || seoConfig.description,
      images: seoConfig.twitterImage || seoConfig.ogImage,
    },

    alternates: seoConfig.alternates,

    verification: seoConfig.verification,

  }

  // Remove undefined values
  Object.keys(metadata).forEach((key) => {
    if (metadata[key as keyof Metadata] === undefined) {
      delete metadata[key as keyof Metadata]
    }
  })

  return metadata
}

// Page-specific SEO configurations
export const pageSEOConfigs = {
  home: {
    title: "Kothler | Precisión Y Crecimiento - Desarrollo Web y Software a Medida",
    description:
      "Transformamos tu negocio con soluciones digitales innovadoras. Desarrollo web, software a medida y sistemas especializados en Guadalajara, México.",
    keywords: [
      "desarrollo web Guadalajara",
      "software a medida México",
      "soluciones digitales",
      "desarrollo de aplicaciones",
    ],
    ogUrl: "/",
  },

  services: {
    title: "Servicios | Kothler - Desarrollo Web y Software Especializado",
    description:
      "Descubre nuestros servicios de desarrollo web, software a medida, sistemas para restaurantes y hoteles. Soluciones tecnológicas que impulsan tu negocio.",
    keywords: ["servicios desarrollo web", "software restaurantes", "sistemas hoteles", "aplicaciones móviles"],
    ogUrl: "/servicios",
  },

  team: {
    title: "Nuestro Equipo | Kothler - Profesionales en Tecnología",
    description:
      "Conoce al equipo de profesionales detrás de Kothler. Expertos en desarrollo web, software y soluciones digitales innovadoras.",
    keywords: ["equipo Kothler", "desarrolladores Guadalajara", "profesionales tecnología", "expertos software"],
    ogUrl: "/equipo",
  },

  contact: {
    title: "Contacto | Kothler - Solicita tu Cotización",
    description:
      "Contáctanos para desarrollar tu proyecto digital. Cotizaciones gratuitas y asesoría personalizada en Guadalajara, México.",
    keywords: ["contacto Kothler", "cotización desarrollo web", "asesoría tecnológica Guadalajara"],
    ogUrl: "/contacto",
  },

  dashboard: {
    title: "Dashboard | Kothler - Panel de Administración",
    description: "Panel de administración para gestionar contenido, usuarios y configuraciones del sitio web.",
    robots: "noindex, nofollow",
    ogUrl: "/dashboard",
  },
}

// JSON-LD structured data generators
export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Kothler",
    description:
      "Empresa de desarrollo web y software a medida especializada en soluciones digitales para restaurantes, hoteles y otros negocios.",
    url: "https://kothler.com",
    logo: "https://kothler.com/logo.png",
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+52-33-20395094",
      contactType: "customer service",
      email: "contacto@kothler.com",
      availableLanguage: ["Spanish", "English"],
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: "Guadalajara",
      addressRegion: "Jalisco",
      addressCountry: "MX",
    },
    sameAs: ["https://www.instagram.com/kothler.mkt", "https://www.facebook.com/profile.php?id=61574062746873"],
  }
}

export function generateWebsiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Kothler",
    url: "https://kothler.com",
    description: "Desarrollo web y software a medida. Soluciones digitales que transforman tu negocio.",
    publisher: {
      "@type": "Organization",
      name: "Kothler",
    },
    potentialAction: {
      "@type": "SearchAction",
      target: "https://kothler.com/search?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  }
}

export function generateServiceSchema(service: {
  name: string
  description: string
  price?: string
  category?: string
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.name,
    description: service.description,
    provider: {
      "@type": "Organization",
      name: "Kothler",
    },
    category: service.category,
    offers: service.price
      ? {
          "@type": "Offer",
          price: service.price,
          priceCurrency: "MXN",
        }
      : undefined,
  }
}

export function generatePersonSchema(person: {
  name: string
  jobTitle: string
  description: string
  image?: string
  sameAs?: string[]
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: person.name,
    jobTitle: person.jobTitle,
    description: person.description,
    image: person.image,
    worksFor: {
      "@type": "Organization",
      name: "Kothler",
    },
    sameAs: person.sameAs,
  }
}
