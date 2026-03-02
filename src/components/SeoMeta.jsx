import { Helmet } from "react-helmet-async";

export default function SeoMeta({
  title,
  description,
  keywords,
  canonical,
  ogImage,
  companyName,
  contactEmail,
}) {
  // JSON-LD blocks improve rich search understanding for brand + website entities.
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: companyName,
    url: canonical,
    logo: ogImage,
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "sales",
        email: contactEmail,
      },
    ],
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: companyName,
    url: canonical,
    potentialAction: {
      "@type": "SearchAction",
      target: `${canonical}?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="theme-color" content="#0b1026" />

      <link rel="canonical" href={canonical} />
      <link rel="icon" type="image/svg+xml" href="/vite.svg" />

      <meta property="og:type" content="website" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={ogImage} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      <script type="application/ld+json">{JSON.stringify(organizationSchema)}</script>
      <script type="application/ld+json">{JSON.stringify(websiteSchema)}</script>
    </Helmet>
  );
}
