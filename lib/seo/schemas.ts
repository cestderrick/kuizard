// =============================================
// Schemas Schema.org pour le SEO Kuizard
// =============================================

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://kuizard.com";

/**
 * Schema Organization — décrit Projiat (l'éditeur du site) à Google.
 * Permet à terme d'avoir un panneau "Knowledge Graph" si tu deviens connu.
 */
export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Projiat",
    legalName: "Projiat (entreprise individuelle)",
    url: BASE_URL,
    logo: `${BASE_URL}/logo.svg`,
    description:
      "Projiat édite Kuizard, le service de quizz personnalisés pour les évènements et les bars.",
    address: {
      "@type": "PostalAddress",
      streetAddress: "8 place Bir-Hakeim",
      postalCode: "69003",
      addressLocality: "Lyon",
      addressCountry: "FR",
    },
    contactPoint: [
      {
        "@type": "ContactPoint",
        email: "contact@kuizard.fr",
        contactType: "customer service",
        availableLanguage: ["French", "English"],
      },
    ],
    foundingDate: "2025",
    founders: [
      {
        "@type": "Person",
        name: "Cédric Ghironzi",
      },
    ],
    identifier: {
      "@type": "PropertyValue",
      propertyID: "SIRET",
      value: "10404270000013",
    },
  };
}

/**
 * Schema WebSite — décrit le site Kuizard à Google.
 * On inclut un PotentialAction pour permettre la "sitelinks search box"
 * (la petite barre de recherche qui apparaît parfois sous le titre du site
 * dans les résultats Google). Ici on cible /q?code=... qui est le point
 * d'entrée joueur.
 */
export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Kuizard",
    alternateName: "Kuizard — Quizz personnalisés",
    url: BASE_URL,
    inLanguage: ["fr", "en", "es", "it", "de", "pt", "ru", "zh"],
    publisher: {
      "@type": "Organization",
      name: "Projiat",
      url: BASE_URL,
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${BASE_URL}/q?code={code}`,
      },
      "query-input": "required name=code",
    },
  };
}

/**
 * Schema FAQPage — pour /aide. Génère des "rich results" Google où la
 * question et la réponse apparaissent directement sous le titre du site
 * (super pour le CTR).
 */
export function faqPageSchema(
  questions: { question: string; answer: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: questions.map((q) => ({
      "@type": "Question",
      name: q.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: q.answer,
      },
    })),
  };
}

/**
 * Schema Product avec Offers — pour la page /tarifs.
 * Permet à Google d'afficher le prix de chaque offre dans les résultats.
 */
export function productSchema(p: {
  name: string;
  description: string;
  priceCents: number;
  slug: string;
  interval?: "month" | "year" | null;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `Kuizard — ${p.name}`,
    description: p.description,
    brand: {
      "@type": "Brand",
      name: "Kuizard",
    },
    offers: {
      "@type": "Offer",
      url: `${BASE_URL}/tarifs#${p.slug}`,
      priceCurrency: "EUR",
      price: (p.priceCents / 100).toFixed(2),
      availability: "https://schema.org/InStock",
      ...(p.interval && {
        priceSpecification: {
          "@type": "UnitPriceSpecification",
          price: (p.priceCents / 100).toFixed(2),
          priceCurrency: "EUR",
          billingDuration: p.interval === "year" ? "P1Y" : "P1M",
          billingIncrement: 1,
          unitCode: p.interval === "year" ? "ANN" : "MON",
        },
      }),
    },
  };
}

/**
 * Schema BreadcrumbList — pour les pages publiques en profondeur.
 */
export function breadcrumbSchema(
  items: { name: string; url: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: it.url,
    })),
  };
}

/**
 * Schema HowTo — Google adore. Permet d'afficher des étapes numérotées
 * en rich snippet sous le titre du site. Parfait pour pages "comment créer
 * un quizz mariage" etc.
 */
export function howToSchema(h: {
  name: string;
  description: string;
  steps: { name: string; text: string }[];
  totalTime?: string; // ISO 8601 duration ex: "PT5M" = 5 min
  estimatedCost?: { currency: string; value: number };
}) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: h.name,
    description: h.description,
    ...(h.totalTime && { totalTime: h.totalTime }),
    ...(h.estimatedCost && {
      estimatedCost: {
        "@type": "MonetaryAmount",
        currency: h.estimatedCost.currency,
        value: h.estimatedCost.value,
      },
    }),
    step: h.steps.map((s, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: s.name,
      text: s.text,
    })),
  };
}

/**
 * Schema Article — pour les pages de blog.
 */
export function articleSchema(a: {
  headline: string;
  description: string;
  slug: string;
  datePublished: string;
  dateModified: string;
  image?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: a.headline,
    description: a.description,
    url: `${BASE_URL}/blog/${a.slug}`,
    datePublished: a.datePublished,
    dateModified: a.dateModified,
    image: a.image ?? `${BASE_URL}/og-image.png`,
    author: {
      "@type": "Organization",
      name: "Projiat",
      url: BASE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: "Projiat",
      url: BASE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${BASE_URL}/logo.svg`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${BASE_URL}/blog/${a.slug}`,
    },
  };
}
