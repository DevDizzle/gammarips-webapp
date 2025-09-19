
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, LineStyle } from 'lightweight-charts';
import { cn } from '@/lib/utils';

// Helper to get CSS variables for chart colors
const getChartColors = () => {
    if (typeof window === 'undefined') {
        // Default for SSR
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
    const style = getComputedStyle(document.body);
    const isDark = document.documentElement.classList.contains('dark');
    return {
        background: isDark ? '#0e111a' : '#FFFFFF',
        line: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        text: isDark ? '#C8C4C4' : '#333333',
        green: 'rgba(34, 197, 94, 1)', // #22c55e
        red: 'rgba(239, 68, 68, 1)', // #ef4444
        sma50: '#f97316',
        sma200: '#a855f7'
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
  const [colors, setColors] = useState(getChartColors());

  useEffect(() => {
    const handleThemeChange = () => {
        setColors(getChartColors());
    };
    
    // Listen for theme changes (if you have a mechanism for it)
    // For now, we'll just set it once on mount.
    handleThemeChange();

    const chart = createChart(chartContainerRef.current!, {
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
      width: chartContainerRef.current!.clientWidth,
      height: 400,
      autoSize: true,
    });

    const candlestickSeries = chart.addCandlestickSeries({
        upColor: colors.green,
        downColor: colors.red,
        borderDownColor: colors.red,
        borderUpColor: colors.green,
        wickDownColor: colors.red,
        wickUpColor: colors.green,
    });
    
    const candlestickData = priceData.candlestick.map(d => ({
        time: d.date,
        open: d.open,
        high: d.high,
        low: d.low,
        close: d.close,
    }));
    candlestickSeries.setData(candlestickData);

    if (priceData.sma50) {
        const sma50Series = chart.addLineSeries({
            color: colors.sma50,
            lineWidth: 2,
            lineStyle: LineStyle.Solid,
            priceLineVisible: false,
            lastValueVisible: false,
        });
        const sma50Data = priceData.sma50.map(d => ({ time: d.date, value: d.value }));
        sma50Series.setData(sma50Data);
    }
    
    if (priceData.sma200) {
        const sma200Series = chart.addLineSeries({
            color: colors.sma200,
            lineWidth: 2,
            lineStyle: LineStyle.Solid,
            priceLineVisible: false,
            lastValueVisible: false,
        });
        const sma200Data = priceData.sma200.map(d => ({ time: d.date, value: d.value }));
        sma200Series.setData(sma200Data);
    }
    
    chart.timeScale().fitContent();

    const handleResize = () => {
      chart.applyOptions({ width: chartContainerRef.current!.clientWidth });
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [priceData, colors]);

  return <div ref={chartContainerRef} className={cn('w-full h-[400px]', className)} />;
};
