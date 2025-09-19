
'use client';

import React from 'react';
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { cn } from '@/lib/utils';

interface PriceChartProps {
  data: {
    candlestick: { date: string; open: number; high: number; low: number; close: number }[];
    volume: { date: string; value: number }[];
    sma50?: { date: string; value: number }[];
    sma200?: { date:string; value: number }[];
  };
}

const ChartTooltipContent = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="p-2 bg-background/80 border rounded-lg shadow-lg backdrop-blur-sm">
        <p className="font-bold">{label}</p>
        <div className="text-xs">
            <p>Open: <span className="font-mono">${data.open.toFixed(2)}</span></p>
            <p>High: <span className="font-mono">${data.high.toFixed(2)}</span></p>
            <p>Low: <span className="font-mono">${data.low.toFixed(2)}</span></p>
            <p>Close: <span className="font-mono">${data.close.toFixed(2)}</span></p>
            {data.sma50 && <p>SMA 50: <span className="font-mono">${data.sma50.toFixed(2)}</span></p>}
            {data.sma200 && <p>SMA 200: <span className="font-mono">${data.sma200.toFixed(2)}</span></p>}
            {data.volume && <p>Volume: <span className="font-mono">{(data.volume / 1_000_000).toFixed(2)}M</span></p>}
        </div>
      </div>
    );
  }
  return null;
};

// Custom shape for the candlestick
const Candlestick = (props: any) => {
  const { x, y, width, height, low, high, open, close, fill } = props;
  const isBullish = close > open;
  const color = isBullish ? 'hsl(var(--chart-2))' : 'hsl(var(--chart-5))';

  return (
    <g>
      <path
        d={`M${x + width / 2},${y + height - (high - Math.max(open, close))} L${x + width / 2},${y + height - (low - Math.min(open, close))}`}
        stroke={color}
        strokeWidth={1}
      />
      <rect
        x={x}
        y={isBullish ? y + height - (close - open) : y}
        width={width}
        height={Math.max(1, Math.abs(open - close))}
        fill={color}
      />
    </g>
  );
};


export const PriceChart = ({ data }: PriceChartProps) => {
  const combinedData = React.useMemo(() => {
    const dataMap = new Map();
    data.candlestick.forEach(d => dataMap.set(d.date, { ...d, yRange: [d.low, d.high] }));
    data.volume.forEach(d => {
        if(dataMap.has(d.date)) dataMap.get(d.date).volume = d.value;
    });
    if (data.sma50) {
        data.sma50.forEach(d => {
            if(dataMap.has(d.date)) dataMap.get(d.date).sma50 = d.value;
        });
    }
    if (data.sma200) {
        data.sma200.forEach(d => {
            if(dataMap.has(d.date)) dataMap.get(d.date).sma200 = d.value;
        });
    }
    return Array.from(dataMap.values());
  }, [data]);
  
  if (!combinedData || combinedData.length === 0) {
    return <div className="h-96 flex items-center justify-center"><p>No data available for chart.</p></div>;
  }

  const yDomain = [
    Math.min(...combinedData.map(d => d.low)) * 0.95,
    Math.max(...combinedData.map(d => d.high)) * 1.05
  ];

  const volumeDomain = [0, Math.max(...combinedData.map(d => d.volume)) * 3]; // Give volume bars some space

  return (
    <div className="w-full h-96">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={combinedData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border) / 0.5)" />
          <XAxis 
            dataKey="date" 
            tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis 
            yAxisId="price" 
            orientation="right"
            domain={yDomain}
            tickFormatter={(value) => `$${value.toFixed(0)}`}
            tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
            axisLine={false}
            tickLine={false}
          />
           <YAxis 
                yAxisId="volume" 
                orientation="right" 
                domain={volumeDomain} 
                tickFormatter={(value) => `${(value / 1_000_000).toFixed(0)}M`}
                axisLine={false} 
                tickLine={false} 
                tick={{ display: 'none' }}
            />
          
          <Tooltip content={<ChartTooltipContent />} />

          <Legend 
            wrapperStyle={{ fontSize: '12px' }}
            formatter={(value, entry) => <span className="text-muted-foreground">{value}</span>}
          />
          
          {/* Candlestick - represented by a bar for positioning */}
          <Bar yAxisId="price" dataKey="yRange" shape={<Candlestick />} name="Price" />

          {data.sma50 && (
             <Line
                yAxisId="price"
                type="monotone"
                dataKey="sma50"
                stroke="hsl(var(--chart-1))"
                strokeWidth={2}
                dot={false}
                name="SMA 50"
            />
          )}

           {data.sma200 && (
             <Line
                yAxisId="price"
                type="monotone"
                dataKey="sma200"
                stroke="hsl(var(--chart-3))"
                strokeWidth={2}
                dot={false}
                name="SMA 200"
            />
          )}
          
          <Bar yAxisId="volume" dataKey="volume" name="Volume">
            {combinedData.map((entry, index) => (
                <rect key={`cell-${index}`} fill={entry.close > entry.open ? 'hsl(var(--chart-2) / 0.3)' : 'hsl(var(--chart-5) / 0.3)'} />
            ))}
          </Bar>

           {/* Reference line for the latest close price */}
            <ReferenceLine yAxisId="price" y={combinedData[combinedData.length - 1].close} stroke="hsl(var(--primary))" strokeDasharray="3 3">
                <Legend content={
                    <div className="text-xs text-primary font-bold bg-background/50 backdrop-blur-sm p-1 rounded">
                       {combinedData[combinedData.length - 1].close.toFixed(2)}
                    </div>
                } position="insideRight" />
            </ReferenceLine>

        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};
