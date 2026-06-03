import Link from "next/link";

const BASE_URL = "https://gammarips.com";

export interface Crumb {
  name: string;
  href?: string;
}

/**
 * Visible breadcrumb trail + BreadcrumbList JSON-LD. Gives detail pages an
 * upward internal link to their hub (crawl + anchor signal) and a breadcrumb
 * rich-result in SERPs. Pure presentational — safe in server or client trees.
 * Set emitJsonLd={false} on pages that already emit a BreadcrumbList script.
 */
export function Breadcrumbs({
  items,
  emitJsonLd = true,
  className = "",
}: {
  items: Crumb[];
  emitJsonLd?: boolean;
  className?: string;
}) {
  if (!items.length) return null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      ...(c.href
        ? { item: c.href.startsWith("http") ? c.href : `${BASE_URL}${c.href}` }
        : {}),
    })),
  };

  return (
    <>
      {emitJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <nav
        aria-label="Breadcrumb"
        className={`text-sm text-muted-foreground ${className}`}
      >
        <ol className="flex flex-wrap items-center gap-1.5">
          {items.map((c, i) => {
            const isLast = i === items.length - 1;
            return (
              <li key={`${c.name}-${i}`} className="flex items-center gap-1.5">
                {c.href && !isLast ? (
                  <Link href={c.href} className="hover:text-primary transition-colors">
                    {c.name}
                  </Link>
                ) : (
                  <span className={isLast ? "text-foreground" : undefined}>{c.name}</span>
                )}
                {!isLast && <span className="text-muted-foreground/60">/</span>}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
