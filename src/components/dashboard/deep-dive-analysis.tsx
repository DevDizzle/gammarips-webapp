'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
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
                {/* Desktop View: Tabs */}
                <div className="hidden md:block">
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
                </div>

                {/* Mobile View: Carousel */}
                <div className="md:hidden">
                    <Carousel opts={{ align: "start", loop: true }} className="w-full">
                        <CarouselContent>
                            {tabs.map(tab => (
                                <CarouselItem key={tab.id} className="basis-[90%] pl-4">
                                    <div className="flex flex-col h-full border rounded-lg bg-card/50 overflow-hidden">
                                        <div className="flex items-center gap-2 p-3 border-b bg-muted/20">
                                            <tab.icon className="w-4 h-4 text-primary" />
                                            <span className="font-semibold text-sm">{tab.label}</span>
                                        </div>
                                        <div className="p-4 max-h-[60vh] overflow-y-auto">
                                            <ProLock blurStrength="sm" minHeight="min-h-[200px]">
                                                <Markdown 
                                                    content={tab.content || ''} 
                                                    className="prose-sm prose-invert max-w-none text-muted-foreground" 
                                                />
                                            </ProLock>
                                        </div>
                                    </div>
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                        <div className="py-2 text-center text-xs text-muted-foreground">
                            Swipe for more
                        </div>
                    </Carousel>
                </div>
            </CardContent>
        </Card>
    );
}
