
'use client';

import React, { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { createChart, ColorType, LineStyle, IChartApi } from 'lightweight-charts';
import { cn } from '@/lib/utils';

// Helper to get CSS variables for chart colors.
const getChartColors = (isDark: boolean) => {
    if (typeof window === 'undefined') {
        // Default for SSR to avoid errors.
        return {
            background: '#121212',
            line: '#444444',
            text: '#C8C4C4',
            green: '#22c55e',
            red: '#ef4444',
            volumeUp: 'rgba(34, 197, 94, 0.3)',
            volumeDown: 'rgba(239, 68, 68, 0.3)',
            sma50: '#f97316',
            sma200: '#a855f7'
        };
    }
    
    return {
        background: isDark ? '#1C1C29' : '#FFFFFF',
        line: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        text: isDark ? '#A3A3A3' : '#333333',
        green: '#22c55e',
        red: '#ef4444',
        volumeUp: 'rgba(34, 197, 94, 0.3)',
        volumeDown: 'rgba(239, 68, 68, 0.3)',
        sma50: '#f97316', // orange-500
        sma200: '#a855f7' // purple-500
    };
};

interface PriceChartProps {
  priceData: {
    candlestick: { date: string; open: number; high: number; low: number; close: number }[];
    volume: { date: string; value: number }[];
    sma50?: { date: string; value: number }[];
    sma200?: { date: string; value: number }[];
  };
  className?: string;
}

export const PriceChart: React.FC<PriceChartProps> = ({ priceData, className }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const [isDark, setIsDark] = React.useState(true); 

  const colors = useMemo(() => getChartColors(isDark), [isDark]);

  // Effect to detect theme changes
  useLayoutEffect(() => {
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.attributeName === 'class') {
          const newIsDark = (mutation.target as HTMLElement).classList.contains('dark');
          if (isDark !== newIsDark) {
            setIsDark(newIsDark);
          }
        }
      }
    });
    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, [isDark]);


  useEffect(() => {
    if (!chartContainerRef.current || !priceData) return;

    // Map volume data and add color based on price change
    const volumeData = priceData.volume.map((v, index) => {
        const currentCandle = priceData.candlestick[index];
        const prevCandle = priceData.candlestick[index - 1];
        const color = prevCandle && currentCandle.close < prevCandle.close ? colors.volumeDown : colors.volumeUp;
        return { time: v.date, value: v.value, color };
    });

    const createOrUpdateChart = () => {
        if (!chartContainerRef.current) return;

        const chartOptions = {
            layout: { background: { type: ColorType.Solid, color: colors.background }, textColor: colors.text },
            grid: { vertLines: { color: colors.line }, horzLines: { color: colors.line } },
            rightPriceScale: { borderColor: colors.line },
            timeScale: { borderColor: colors.line, timeVisible: true },
            width: chartContainerRef.current.clientWidth,
            height: 400,
        };

        if (!chartRef.current) {
            chartRef.current = createChart(chartContainerRef.current, chartOptions);

            const candlestickSeries = chartRef.current.addCandlestickSeries({
                upColor: colors.green, downColor: colors.red, borderDownColor: colors.red,
                borderUpColor: colors.green, wickDownColor: colors.red, wickUpColor: colors.green,
            });
            candlestickSeries.setData(priceData.candlestick.map(d => ({ ...d, time: d.date })));
            
            if (priceData.sma50) {
                const sma50Series = chartRef.current.addLineSeries({ color: colors.sma50, lineWidth: 2, lineStyle: LineStyle.Dashed, priceLineVisible: false, lastValueVisible: false });
                sma50Series.setData(priceData.sma50.map(d => ({ ...d, time: d.date })));
            }
            if (priceData.sma200) {
                const sma200Series = chartRef.current.addLineSeries({ color: colors.sma200, lineWidth: 2, lineStyle: LineStyle.Dashed, priceLineVisible: false, lastValueVisible: false });
                sma200Series.setData(priceData.sma200.map(d => ({ ...d, time: d.date })));
            }

            const volumeSeries = chartRef.current.addHistogramSeries({
                priceFormat: { type: 'volume' },
                priceScaleId: '', // Set to an empty string to display the volume scale on the left
            });
            volumeSeries.setData(volumeData);
            chartRef.current.priceScale('').applyOptions({
                scaleMargins: { top: 0.8, bottom: 0 },
            });

            chartRef.current.timeScale().fitContent();

        } else {
            // Update existing chart
            chartRef.current.applyOptions(chartOptions);
            // This is a simplified update. A more robust implementation would update each series individually.
            // For now, we assume the data doesn't change after initial load for this component instance.
        }
    };

    createOrUpdateChart();

    const handleResize = () => {
      chartRef.current?.applyOptions({ width: chartContainerRef.current!.clientWidth });
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [priceData, colors]); // Rerun effect if data or colors change

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
