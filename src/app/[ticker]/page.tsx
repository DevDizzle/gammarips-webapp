import { getDashboardData, getOptionsSignals } from '@/app/actions';
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
import { FairOptionsDisplay } from './noteworthy-options';
import type { OptionsSignal } from '@/lib/firebase-admin';

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
  
  // Fetch dashboard data and other options signals in parallel
  const [data, otherOptions] = await Promise.all([
    getDashboardData(ticker),
    getOptionsSignals(ticker)
  ]);

  if (!data) {
    return notFound();
  }

  // --- Dynamic Schema.org Generation ---
  let schema: any = null;
  const graph: any[] = [];

  // Determine Article Content
  const headline = data.optionsBrief?.headline || data.fundamentalThesis?.headline;
  let articleBody = data.optionsBrief?.content?.replace(/<[^>]*>?/gm, '') || "";
  
  if (!articleBody && data.fullAnalysis) {
      // Fallback: Construct body from Deep Dive Analysis
      const parts = [
          data.fullAnalysis.technicals,
          data.fullAnalysis.fundamentals,
          data.fullAnalysis.news
      ].filter(Boolean);
      articleBody = parts.join(" ").replace(/<[^>]*>?/gm, '');
  }

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

  // Filter out the main signal and map other options to the required format
  const fairQualityOptions: OptionsSignal[] = otherOptions
    .filter(o => o.contract_symbol !== data.tradeSetup?.suggestedOption?.contractSymbol)
    .map(o => ({
        id: o.id,
        contract_symbol: o.contract_symbol,
        expiration_date: o.expiration_date,
        implied_volatility: o.implied_volatility ?? 0,
        volatility_comparison_signal: 'N/A', // This field is not available in OptionCandidate
        option_type: o.option_type,
        run_date: data.runDate,
        setup_quality_signal: 'Fair',
        stock_price_trend_signal: o.stock_outlook_signal,
        strike_price: o.strike,
        summary: `This contract has a favorable setup based on our analysis.`,
        ticker: o.ticker,
        company_name: o.company_name
    })).slice(0, 3); // Limit to 3


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

        <FairOptionsDisplay options={fairQualityOptions} />

        <UpcomingEarnings ticker={ticker} />
        
        <ActiveSignalTracker ticker={ticker} />
      </div>
    </div>
  );
}