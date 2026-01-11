
import React, { useState, useCallback } from 'react';
import Visualizer from './components/Visualizer';
import Controls from './components/Controls';
import { fetchTrendData } from './services/geminiService';
import { TrendResponse, LogicMode } from './types';

const App: React.FC = () => {
  const [tags, setTags] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [logicMode, setLogicMode] = useState<LogicMode>('NONE');
  const [startYear, setStartYear] = useState(2020);
  const [endYear, setEndYear] = useState(2024);
  const [loading, setLoading] = useState(false);
  const [trend, setTrend] = useState<TrendResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = useCallback(async () => {
    if (tags.length === 0) return;
    
    // If logic mode is active, only use selected tags. Otherwise use all.
    const tagsToQuery = logicMode === 'NONE' ? tags : selectedTags;
    
    if (logicMode !== 'NONE' && tagsToQuery.length === 0) {
      setError("Please select at least one tag to apply logic to.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await fetchTrendData(tagsToQuery, startYear, endYear, logicMode);
      setTrend(data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch trend data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [tags, selectedTags, startYear, endYear, logicMode]);

  const handleExportCSV = useCallback(() => {
    if (!trend || trend.series.length === 0) return;

    const dates = trend.series[0].data.map(d => d.date);
    const headers = ['Date', ...trend.series.map(s => `"${s.tag}"`)].join(',');
    
    const rows = dates.map(date => {
      const counts = trend.series.map(s => {
        const point = s.data.find(d => d.date === date);
        return point ? point.count : 0;
      });
      return [date, ...counts].join(',');
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `youtube_trends_${startYear}_${endYear}_${logicMode}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [trend, startYear, endYear, logicMode]);

  const formatCount = (count: number) => {
    if (count >= 1000000) return (count / 1000000).toFixed(1) + 'M';
    if (count >= 1000) return (count / 1000).toFixed(0) + 'k';
    return count.toString();
  };

  return (
    <div className="min-h-screen moody-gradient flex flex-col items-center justify-center p-4 md:p-8 selection:bg-blue-500/30">
      
      {/* Header */}
      <header className="text-center mb-12 space-y-4 max-w-2xl">
        <div className="inline-block px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest mb-2">
          Trend Comparison Dashboard
        </div>
        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-tight">
          YouTube <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">Video Trends</span>
        </h1>
        <p className="text-slate-400 text-lg">
          Yo, check the stats! 🚀 Pick your favorite tags and see which ones are actually popping off. No cap, just straight AI vibes to help you spot the next big thing on YT.
        </p>
      </header>

      {/* Main Diagram Area */}
      <main className="w-full max-w-6xl space-y-8 mb-12">
        <div className="relative">
          <div className="absolute -inset-4 bg-blue-500/5 blur-3xl rounded-full"></div>
          <Visualizer 
            series={trend?.series || []} 
            loading={loading} 
          />
        </div>

        {/* Insight Cards */}
        {trend && !loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {trend.series.map((s, idx) => (
              <div key={idx} className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl group hover:border-blue-500/30 transition-all">
                <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest">#{s.tag} Insight</span>
                <div className="flex justify-between items-start mt-4">
                  <div className="space-y-1">
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">Peak Date</p>
                    <p className="text-xl font-mono text-blue-400">{s.peakDate}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">Growth</p>
                    <p className="text-xl font-mono text-emerald-400">{s.growthPercentage}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">Total Videos</p>
                    <p className="text-xl font-mono text-indigo-400">{formatCount(s.totalCount)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-900/20 border border-red-500/20 text-red-400 rounded-xl text-center">
            {error}
          </div>
        )}
      </main>

      {/* Controls Area (Bottom) */}
      <footer className="w-full pb-16">
        <Controls 
          tags={tags}
          setTags={setTags}
          selectedTags={selectedTags}
          setSelectedTags={setSelectedTags}
          logicMode={logicMode}
          setLogicMode={setLogicMode}
          startYear={startYear}
          setStartYear={setStartYear}
          endYear={endYear}
          setEndYear={setEndYear}
          onSearch={handleSearch}
          onExport={handleExportCSV}
          loading={loading}
          hasData={!!trend}
        />
      </footer>

      {/* Decorative Blur Elements */}
      <div className="fixed top-0 right-0 w-96 h-96 bg-blue-600/10 blur-[128px] -z-10"></div>
      <div className="fixed bottom-0 left-0 w-96 h-96 bg-indigo-600/10 blur-[128px] -z-10"></div>
    </div>
  );
};

export default App;
