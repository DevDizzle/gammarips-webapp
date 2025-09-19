
'use client';

import React, { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { createChart, ColorType, LineStyle, IChartApi } from 'lightweight-charts';
import { cn } from '@/lib/utils';

// Helper to get CSS variables for chart colors.
// This function now only reads the values, it doesn't cause re-renders.
const getChartColors = () => {
    if (typeof window === 'undefined') {
        // Default for SSR to avoid errors.
        return {
            background: '#0e111a',
            line: '#444',
            text: '#C8C4C4',
            green: '#22c55e',
            red: '#ef4444',
            sma50: '#f97316',
            sma200: '#a855f7'
        };
    }
    const isDark = document.documentElement.classList.contains('dark');
    return {
        background: isDark ? 'hsl(232 15% 15%)' : '#FFFFFF',
        line: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        text: isDark ? 'hsl(0 0% 63.9%)' : '#333333',
        green: 'rgba(34, 197, 94, 1)', // #22c55e
        red: 'rgba(239, 68, 68, 1)', // #ef4444
        sma50: '#f97316', // orange-500
        sma200: '#a855f7' // purple-500
    };
};

interface PriceChartProps {
  priceData: {
    candlestick: { date: string; open: number; high: number; low: number; close: number }[];
    sma50?: { date: string; value: number }[];
    sma200?: { date: string; value: number }[];
  };
  className?: string;
}

export const PriceChart: React.FC<PriceChartProps> = ({ priceData, className }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const [isDark, setIsDark] = React.useState(true); 

  // Memoize colors to prevent re-renders on every effect run.
  // This is the core fix for the infinite loop.
  const colors = useMemo(() => getChartColors(), [isDark]);

  // Effect to detect theme changes
  useLayoutEffect(() => {
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.attributeName === 'class') {
          const newIsDark = (mutation.target as HTMLElement).classList.contains('dark');
          setIsDark(newIsDark);
        }
      }
    });

    observer.observe(document.documentElement, { attributes: true });

    return () => observer.disconnect();
  }, []);


  useEffect(() => {
    if (!chartContainerRef.current) return;

    // If chart doesn't exist, create it.
    if (!chartRef.current) {
        chartRef.current = createChart(chartContainerRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: colors.background },
                textColor: colors.text,
            },
            grid: {
                vertLines: { color: colors.line },
                horzLines: { color: colors.line },
            },
            rightPriceScale: {
                borderColor: colors.line,
            },
            timeScale: {
                borderColor: colors.line,
                timeVisible: true,
            },
            width: chartContainerRef.current.clientWidth,
            height: 400,
        });

        const candlestickSeries = chartRef.current.addCandlestickSeries({
            upColor: colors.green,
            downColor: colors.red,
            borderDownColor: colors.red,
            borderUpColor: colors.green,
            wickDownColor: colors.red,
            wickUpColor: colors.green,
        });
        candlestickSeries.setData(priceData.candlestick.slice(-30).map(d => ({...d, time: d.date})));

        if (priceData.sma50) {
            const sma50Series = chartRef.current.addLineSeries({ color: colors.sma50, lineWidth: 2, priceLineVisible: false, lastValueVisible: false });
            sma50Series.setData(priceData.sma50.slice(-30).map(d => ({...d, time: d.date})));
        }
        
        if (priceData.sma200) {
            const sma200Series = chartRef.current.addLineSeries({ color: colors.sma200, lineWidth: 2, priceLineVisible: false, lastValueVisible: false });
            sma200Series.setData(priceData.sma200.slice(-30).map(d => ({...d, time: d.date})));
        }

        chartRef.current.timeScale().fitContent();

    } else {
        // If chart exists, just update its options and data.
        chartRef.current.applyOptions({
            layout: {
                background: { type: ColorType.Solid, color: colors.background },
                textColor: colors.text,
            },
             grid: {
                vertLines: { color: colors.line },
                horzLines: { color: colors.line },
            },
        });
    }

    const handleResize = () => {
      chartRef.current?.applyOptions({ width: chartContainerRef.current!.clientWidth });
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      // Do not remove the chart on every re-render.
      // We will remove it only when the component unmounts.
    };
  }, [priceData, colors]); // `colors` is now stable thanks to useMemo

  // Effect to clean up chart on unmount
  useEffect(() => {
    return () => {
        if (chartRef.current) {
            chartRef.current.remove();
            chartRef.current = null;
        }
    }
  }, []);

  return <div ref={chartContainerRef} className={cn('w-full h-[400px]', className)} />;
};
