import { getDashboardData } from '@/app/actions';
import { ExecutionDeck } from '@/components/dashboard/execution-deck';
import { KpiCarousel } from '@/components/dashboard/kpi-carousel';
import { AnalystBrief } from '@/components/dashboard/analyst-brief';
import { DeepDiveAnalysis } from '@/components/dashboard/deep-dive-analysis';
import { FAQSection } from '@/components/dashboard/faq-section';
import { PriceChart } from '@/components/price-chart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import UpcomingEarnings from './upcoming-events';
import ActiveSignalTracker from './signal-tracker';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { ActiveContracts } from './noteworthy-options';
import type { MarketStructure } from '@/lib/types/dashboard-v2';

type Props = {
  params: Promise<{ ticker: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ticker } = await params;
  const data = await getDashboardData(ticker);

  if (!data || !data.seo) {
    return {
      title: `${ticker.toUpperCase()} Stock Analysis | GammaRips`,
      description: `Real-time AI analysis, options flow, and technical signals for ${ticker.toUpperCase()}.`,
    };
  }

  const metadata: Metadata = {
    title: data.seo.title,
    description: data.seo.metaDescription,
    keywords: data.seo.keywords,
    alternates: {
      canonical: `/${ticker.toUpperCase()}`,
    },
  };

  // Add Dynamic OpenGraph Image (Ticker Logo)
  if (data.titleInfo.image_uri) {
      metadata.openGraph = {
          images: [{ url: data.titleInfo.image_uri }],
      };
      metadata.twitter = {
          card: 'summary', // Use summary card for small logo + text
          images: [data.titleInfo.image_uri],
      };
  }

  return metadata;
}

export default async function Page({ params }: Props) {
  const { ticker } = await params;
  
  // Fetch all dashboard data from a single source
  const data = await getDashboardData(ticker);

  if (!data) {
    return notFound();
  }

  // --- Dynamic Schema.org Generation ---
  let schema: any = null;
  const graph: any[] = [];

  // Determine Article Content
  const headline = data.seo?.h1 || data.optionsBrief?.headline || data.fundamentalThesis?.headline;
  
  // Construct comprehensive article body for SEO
  const contentParts = [
      data.optionsBrief?.content,
      data.fundamentalThesis?.content,
      data.fullAnalysis?.technicals,
      data.fullAnalysis?.financials,
      data.fullAnalysis?.["md&a"],
      data.fullAnalysis?.transcript,
      data.fullAnalysis?.news
  ].filter(Boolean);

  const articleBody = contentParts.join(" ").replace(/<[^>]*>?/gm, '');

  // Add Article schema for the main analysis
  if (headline) {
    graph.push({
      "@type": "NewsArticle",
      "headline": headline,
      "author": {
        "@type": "Organization",
        "name": "GammaRips"
      },
      "publisher": {
        "@type": "Organization",
        "name": "GammaRips",
        "logo": {
          "@type": "ImageObject",
          "url": "https://gammarips.com/icon.png"
        }
      },
      "datePublished": data.runDate,
      "dateModified": data.runDate,
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": `https://gammarips.com/${data.ticker}`
      },
      // Strip HTML tags for a clean articleBody for Schema
      "articleBody": articleBody.substring(0, 5000), // Limit length for safety
      "description": data.seo.metaDescription,
    });
  }

  // Add FAQ schema if available in the data payload
  const faqData = data.faq;
  if (faqData && Array.isArray(faqData) && faqData.length > 0) {
    graph.push({
      "@type": "FAQPage",
      "mainEntity": faqData.map((item) => ({
        "@type": "Question",
        "name": item.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": item.answer
        }
      }))
    });
  }

  // Finalize schema structure
  if (graph.length > 1) {
    schema = {
      "@context": "https://schema.org",
      "@graph": graph
    };
  } else if (graph.length === 1) {
    schema = {
      "@context": "https://schema.org",
      ...graph[0]
    };
  }
  // --- End Schema Generation ---

  // Get active contracts from the market structure data, sourced from dashboard_json
  const activeContracts = data.marketStructure?.top_active_contracts || [];

  return (
    <div className="space-y-8 container py-6 mx-auto max-w-5xl">
      {schema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      )}
      <ExecutionDeck data={data} />
      
      <KpiCarousel kpis={data.kpis} />
      
      <div className="space-y-8">
        <Card className="overflow-hidden">
            <CardHeader>
                <CardTitle>Price Action</CardTitle>
                <p className="text-sm text-muted-foreground">
                    Visualizing daily price movements and technical trends to spot potential entry and exit points.
                </p>
            </CardHeader>
            <CardContent className="p-0 sm:p-6 min-h-[300px]">
                    {data.priceChartData ? (
                        <PriceChart priceData={data.priceChartData} />
                    ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                        Chart data unavailable
                    </div>
                    )}
            </CardContent>
        </Card>

        <AnalystBrief 
            optionsBrief={data.optionsBrief} 
            fundamentalThesis={data.fundamentalThesis} 
        />

        {data.fullAnalysis && <DeepDiveAnalysis analysis={data.fullAnalysis} />}
        
        {data.faq && <FAQSection faqs={data.faq} />}

        <ActiveContracts contracts={activeContracts} />

        <UpcomingEarnings ticker={ticker} />
        
        <ActiveSignalTracker ticker={ticker} />
      </div>
    </div>
  );
}
