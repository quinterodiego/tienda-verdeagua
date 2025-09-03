'use client';

import { siteConfig } from '@/lib/metadata';

export default function StructuredData() {
  // Structured Data para la organización
  const organizationData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": siteConfig.name,
    "description": siteConfig.description,
    "url": siteConfig.url,
    "logo": `${siteConfig.url}/logo.png`,
    "sameAs": [
      "https://www.facebook.com/verdeaguapersonalizados",
      "https://www.instagram.com/verdeaguapersonalizados",
      "https://www.tiktok.com/@verdeaguapersonalizados"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "availableLanguage": "Spanish"
    },
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "AR",
      "addressLocality": "Argentina"
    }
  };

  // Structured Data para el sitio web
  const websiteData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": siteConfig.name,
    "url": siteConfig.url,
    "description": siteConfig.description,
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${siteConfig.url}/search?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  };

  // Structured Data para la tienda online
  const storeData = {
    "@context": "https://schema.org",
    "@type": "Store",
    "name": siteConfig.name,
    "description": siteConfig.description,
    "url": siteConfig.url,
    "currenciesAccepted": "ARS",
    "paymentAccepted": "Cash, Credit Card, MercadoPago",
    "priceRange": "$500-$5000",
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Productos Personalizados",
      "itemListElement": siteConfig.categories.map(category => ({
        "@type": "OfferCatalog",
        "name": category,
        "itemListElement": {
          "@type": "Product",
          "category": category
        }
      }))
    }
  };

  return (
    <>
      {/* Organization Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationData)
        }}
      />
      
      {/* Website Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteData)
        }}
      />
      
      {/* Store Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(storeData)
        }}
      />
    </>
  );
}
