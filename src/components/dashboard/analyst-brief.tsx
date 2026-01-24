import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Markdown } from '@/components/markdown';
import { OptionsBrief, FundamentalThesis } from '@/lib/types/dashboard-v2';
import { ProLock } from '@/components/ui/pro-lock';
import { cleanPriceStrings } from '@/lib/utils';

interface AnalystBriefProps {
    optionsBrief?: OptionsBrief;
    fundamentalThesis?: FundamentalThesis;
}

export function AnalystBrief({ optionsBrief, fundamentalThesis }: AnalystBriefProps) {
    // If no analysis exists, render nothing
    if (!optionsBrief && !fundamentalThesis) return null;

    return (
        <div className="space-y-6">
            {/* Primary SEO Content: Options/Gamma Analysis */}
            {optionsBrief && (
                <Card className="border-l-4 border-l-primary shadow-sm bg-card/50">
                    <CardHeader>
                        <CardTitle>{cleanPriceStrings(optionsBrief.headline)}</CardTitle>
                        <CardDescription>
                           Daily Derivatives Outlook & Gamma Exposure
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ProLock>
                            <Markdown content={optionsBrief.content} className="prose-sm prose-invert max-w-none text-foreground/90" />
                        </ProLock>
                    </CardContent>
                </Card>
            )}

            {/* Secondary Content: Fundamentals */}
            {fundamentalThesis && (
                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle>{cleanPriceStrings(fundamentalThesis.headline)}</CardTitle>
                        <CardDescription>
                            Macro & Fundamental Catalysts
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                         <ProLock blurStrength='sm'>
                             <Markdown content={fundamentalThesis.content} className="prose-sm prose-invert max-w-none text-muted-foreground" />
                             
                             {/* Render Catalysts Tags */}
                             {fundamentalThesis.catalysts && fundamentalThesis.catalysts.length > 0 && (
                                 <div className="mt-4 flex flex-wrap gap-2">
                                     {fundamentalThesis.catalysts.map((cat, i) => (
                                         <span key={i} className="px-2 py-1 bg-muted rounded-md text-xs font-medium text-muted-foreground">
                                             {cat}
                                         </span>
                                     ))}
                                 </div>
                             )}
                         </ProLock>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
