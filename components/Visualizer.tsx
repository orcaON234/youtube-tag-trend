
import React from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { SeriesData } from '../types';

interface VisualizerProps {
  series: SeriesData[];
  loading: boolean;
}

const COLORS = [
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#10b981', // emerald
  '#f43f5e', // rose
  '#f59e0b', // amber
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg shadow-2xl backdrop-blur-xl">
        <p className="text-slate-400 font-bold mb-2 text-xs uppercase tracking-tighter">{label}</p>
        <div className="space-y-1">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4">
              <span className="text-sm font-medium" style={{ color: entry.color }}>
                {entry.name}:
              </span>
              <span className="font-mono text-slate-100 text-sm">
                {entry.value.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

const Visualizer: React.FC<VisualizerProps> = ({ series, loading }) => {
  if (loading) {
    return (
      <div className="w-full h-[450px] flex items-center justify-center bg-slate-900/20 rounded-2xl border border-blue-900/30 animate-pulse">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-blue-300 font-medium">Processing Multi-Tag Data...</p>
        </div>
      </div>
    );
  }

  if (!series || series.length === 0) {
    return (
      <div className="w-full h-[450px] flex items-center justify-center bg-slate-900/20 rounded-2xl border border-blue-900/30">
        <p className="text-slate-500 italic">Add tags and click analyze to compare trends</p>
      </div>
    );
  }

  // Reshape data for Recharts (merge series by date)
  const chartData: any[] = [];
  const dates = series[0].data.map(d => d.date);
  
  dates.forEach(date => {
    const point: any = { date };
    series.forEach(s => {
      const dPoint = s.data.find(d => d.date === date);
      point[s.tag] = dPoint ? dPoint.count : 0;
    });
    chartData.push(point);
  });

  return (
    <div className="w-full h-[500px] bg-slate-900/40 p-6 rounded-2xl border border-slate-800 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none moody-gradient opacity-30"></div>
      
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            {series.map((s, i) => (
              <linearGradient key={`grad-${i}`} id={`color-${i}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS[i % COLORS.length]} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={COLORS[i % COLORS.length]} stopOpacity={0}/>
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
          <XAxis 
            dataKey="date" 
            stroke="#64748b" 
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => value.split('-')[0]}
            minTickGap={30}
          />
          <YAxis 
            stroke="#64748b" 
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => value >= 1000000 ? `${(value / 1000000).toFixed(1)}M` : value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            verticalAlign="top" 
            height={36} 
            iconType="circle"
            wrapperStyle={{ paddingTop: '0px', paddingBottom: '20px', fontSize: '12px' }}
          />
          {series.map((s, i) => (
            <Area 
              key={s.tag}
              type="monotone" 
              dataKey={s.tag} 
              stroke={COLORS[i % COLORS.length]} 
              strokeWidth={3}
              fillOpacity={1} 
              fill={`url(#color-${i})`} 
              animationDuration={1500}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Visualizer;
