'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Markdown } from "@/components/markdown";
import { FullAnalysis } from "@/lib/types/dashboard-v2";
import { ProLock } from "@/components/ui/pro-lock";
import { Lock, FileText, TrendingUp, DollarSign, Mic2, Newspaper } from "lucide-react";

interface DeepDiveAnalysisProps {
    analysis: FullAnalysis;
}

export function DeepDiveAnalysis({ analysis }: DeepDiveAnalysisProps) {
    if (!analysis) return null;
    
    // Define tabs configuration
    const tabs = [
        { id: "technicals", label: "Technicals", icon: TrendingUp, content: analysis.technicals },
        { id: "financials", label: "Financials", icon: DollarSign, content: analysis.financials },
        { id: "transcript", label: "Earnings Call", icon: Mic2, content: analysis.transcript },
        { id: "mda", label: "MD&A", icon: FileText, content: analysis["md&a"] },
        { id: "news", label: "News", icon: Newspaper, content: analysis.news },
    ].filter(tab => !!tab.content); // Only show tabs with content

    if (tabs.length === 0) return null;

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Lock className="w-5 h-5 text-primary" />
                    Deep Dive Analysis
                </CardTitle>
                <CardDescription>
                    Comprehensive breakdown of technicals, fundamentals, and earnings data.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue={tabs[0].id} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 mb-4 h-auto">
                        {tabs.map(tab => (
                            <TabsTrigger key={tab.id} value={tab.id} className="flex gap-2 items-center py-2">
                                <tab.icon className="w-4 h-4" />
                                <span className="hidden sm:inline">{tab.label}</span>
                            </TabsTrigger>
                        ))}
                    </TabsList>
                    
                    {tabs.map(tab => (
                        <TabsContent key={tab.id} value={tab.id}>
                            <ProLock blurStrength="sm" minHeight="min-h-[300px]">
                                <Markdown content={tab.content || ''} className="prose-sm prose-invert max-w-none text-muted-foreground" />
                            </ProLock>
                        </TabsContent>
                    ))}
                </Tabs>
            </CardContent>
        </Card>
    );
}
