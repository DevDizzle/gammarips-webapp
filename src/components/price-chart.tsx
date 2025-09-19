
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
} from 'recharts';

interface PriceChartProps {
  data: {
    candlestick: { date: string; open: number; high: number; low: number; close: number }[];
    volume: { date: string; value: number }[];
    sma50?: { date: string; value: number }[];
    sma200?: { date: string; value: number }[];
  };
}

const ChartTooltipContent = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const isBullish = data.close > data.open;
    const color = isBullish ? 'text-green-500' : 'text-red-500';

    return (
      <div className="p-2 bg-background/90 border rounded-lg shadow-lg backdrop-blur-sm">
        <p className="font-bold text-base">{new Date(label + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
        <div className="text-xs space-y-1 mt-1">
            <p className={color}>O: <span className="font-mono">${data.open.toFixed(2)}</span> H: <span className="font-mono">${data.high.toFixed(2)}</span> L: <span className="font-mono">${data.low.toFixed(2)}</span> C: <span className="font-mono">${data.close.toFixed(2)}</span></p>
            {data.sma50 && <p className="text-orange-400">SMA 50: <span className="font-mono">${data.sma50.toFixed(2)}</span></p>}
            {data.sma200 && <p className="text-purple-400">SMA 200: <span className="font-mono">${data.sma200.toFixed(2)}</span></p>}
        </div>
      </div>
    );
  }
  return null;
};

// Custom shape for the candlestick
const Candlestick = (props: any) => {
  const { x, y, width, height, low, high, open, close } = props;
  const isBullish = close > open;
  const color = isBullish ? 'hsl(var(--chart-2))' : 'hsl(var(--chart-5))';
  const wickX = x + width / 2;

  return (
    <g stroke={color} strokeWidth={1.5} className="transition-opacity duration-200">
      <line x1={wickX} y1={y} x2={wickX} y2={y + height} />
      <rect
        x={x}
        y={isBullish ? y + (open - low) : y + (close - low)}
        width={width}
        height={Math.max(1.5, Math.abs(open - close))}
        fill={color}
      />
    </g>
  );
};


export const PriceChart = ({ data }: PriceChartProps) => {
  const combinedData = React.useMemo(() => {
    const dataMap = new Map();
    data.candlestick.forEach(d => dataMap.set(d.date, { ...d, yRange: [d.low, d.high] }));

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
    const fullData = Array.from(dataMap.values());
    // Take only the last 30 days for the chart
    return fullData.slice(-30);
  }, [data]);
  
  if (!combinedData || combinedData.length === 0) {
    return <div className="h-[400px] flex items-center justify-center"><p>No data available for chart.</p></div>;
  }

  const yDomain = [
    Math.min(...combinedData.map(d => d.low)) * 0.98,
    Math.max(...combinedData.map(d => d.high)) * 1.02
  ];

  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={combinedData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border) / 0.5)" />
          <XAxis 
            dataKey="date" 
            tickFormatter={(date) => new Date(date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
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
          
          <Tooltip content={<ChartTooltipContent />} cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 1, strokeDasharray: '3 3' }} />

          <Legend 
            verticalAlign="top"
            wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
            formatter={(value, entry) => <span className="text-muted-foreground">{value}</span>}
          />
          
          {/* Candlestick - represented by a bar for positioning */}
          <Bar yAxisId="price" dataKey="yRange" shape={<Candlestick />} name="Price" barSize={12} />

          {data.sma50 && (
             <Line yAxisId="price" type="monotone" dataKey="sma50" stroke="#f97316" strokeWidth={2} dot={false} name="SMA 50" />
          )}
           {data.sma200 && (
             <Line yAxisId="price" type="monotone" dataKey="sma200" stroke="#a855f7" strokeWidth={2} dot={false} name="SMA 200" />
          )}

        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};
