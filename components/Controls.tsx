
import React, { useState } from 'react';
import { LogicMode } from '../types';

interface ControlsProps {
  tags: string[];
  setTags: (tags: string[]) => void;
  selectedTags: string[];
  setSelectedTags: (tags: string[]) => void;
  logicMode: LogicMode;
  setLogicMode: (mode: LogicMode) => void;
  startYear: number;
  endYear: number;
  setStartYear: (val: number) => void;
  setEndYear: (val: number) => void;
  onSearch: () => void;
  onExport: () => void;
  loading: boolean;
  hasData: boolean;
}

const Controls: React.FC<ControlsProps> = ({ 
  tags, setTags, 
  selectedTags, setSelectedTags,
  logicMode, setLogicMode,
  startYear, endYear, 
  setStartYear, setEndYear, 
  onSearch, onExport,
  loading, hasData
}) => {
  const [inputValue, setInputValue] = useState('');

  const addTag = () => {
    const trimmed = inputValue.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setInputValue('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
    setSelectedTags(selectedTags.filter(t => t !== tagToRemove));
  };

  const toggleSelectTag = (tag: string) => {
    if (logicMode === 'NONE') return;
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const markingYears = [2005, 2009, 2013, 2017, 2021, 2025];

  const getTagClass = (tag: string) => {
    const isSelected = selectedTags.includes(tag);
    if (!isSelected || logicMode === 'NONE') {
      return 'bg-slate-800 text-blue-300 border-slate-700 hover:border-slate-500';
    }
    if (logicMode === 'AND') return 'bg-emerald-900/40 text-emerald-300 border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.2)]';
    if (logicMode === 'OR') return 'bg-blue-900/40 text-blue-300 border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.2)]';
    if (logicMode === 'NOT') return 'bg-rose-900/40 text-rose-300 border-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.2)]';
    return 'bg-slate-800 text-blue-300 border-slate-700';
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 p-8 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-slate-800 shadow-2xl">
      
      {/* Time Range Section */}
      <div className="space-y-6">
        <div className="flex justify-between items-center px-1">
          <label className="text-sm font-semibold tracking-wider text-slate-400 uppercase">Period of Time</label>
          <div className="flex gap-2 font-mono text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20 text-sm">
            <span>{startYear}</span>
            <span className="text-slate-600">—</span>
            <span>{endYear}</span>
          </div>
        </div>
        
        <div className="relative h-12 flex items-center group">
          <div className="absolute w-full h-1 bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="absolute h-full bg-blue-500/30"
              style={{ 
                left: `${((startYear - 2005) / 20) * 100}%`, 
                right: `${100 - ((endYear - 2005) / 20) * 100}%` 
              }}
            ></div>
          </div>
          
          <div className="absolute w-full flex justify-between px-0.5 pointer-events-none">
            {markingYears.map(year => (
              <div key={year} className="flex flex-col items-center">
                <div className="w-0.5 h-2 bg-slate-700 mb-1"></div>
                <span className="text-[10px] text-slate-600 font-mono">{year}</span>
              </div>
            ))}
          </div>

          <input 
            type="range"
            min="2005"
            max="2025"
            value={startYear}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              if (val < endYear) setStartYear(val);
            }}
            className="absolute w-full h-1 bg-transparent appearance-none pointer-events-none z-10 [&::-webkit-slider-thumb]:pointer-events-auto"
          />
          <input 
            type="range"
            min="2005"
            max="2025"
            value={endYear}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              if (val > startYear) setEndYear(val);
            }}
            className="absolute w-full h-1 bg-transparent appearance-none pointer-events-none z-10 [&::-webkit-slider-thumb]:pointer-events-auto"
          />
        </div>
      </div>

      {/* Multi-Tag Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-end px-1">
          <label className="text-sm font-semibold tracking-wider text-slate-400 uppercase">Tags to Compare</label>
          <span className="text-[10px] text-slate-500 italic">type tags and press enter</span>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {tags.map(t => (
            <span 
              key={t} 
              onClick={() => toggleSelectTag(t)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium transition-all duration-300 animate-in zoom-in cursor-pointer select-none ${getTagClass(t)}`}
            >
              #{t}
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  removeTag(t);
                }}
                className="hover:text-red-400 transition-colors ml-1"
                aria-label="Remove tag"
              >
                ×
              </button>
            </span>
          ))}
          <div className="relative flex-grow">
             <input 
              type="text"
              placeholder={tags.length === 0 ? "Add tags to start..." : "Add another tag..."}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addTag()}
              className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all text-sm shadow-inner"
            />
          </div>
        </div>

        {/* Logic Buttons */}
        <div className="flex items-center gap-2 pt-1 px-1">
          <div className="flex gap-2">
            <button 
              onClick={() => {
                setLogicMode('NONE');
                setSelectedTags([]);
              }}
              className={`px-3 py-1 text-[10px] font-bold rounded uppercase tracking-tighter border transition-all ${logicMode === 'NONE' ? 'bg-slate-700 border-slate-500 text-white' : 'bg-transparent border-slate-800 text-slate-500 hover:text-slate-300'}`}
            >
              Compare
            </button>
            <button 
              onClick={() => setLogicMode('OR')}
              className={`px-3 py-1 text-[10px] font-bold rounded uppercase tracking-tighter border transition-all ${logicMode === 'OR' ? 'bg-blue-600 border-blue-400 text-white' : 'bg-transparent border-slate-800 text-slate-500 hover:text-blue-400'}`}
            >
              OR
            </button>
            <button 
              onClick={() => setLogicMode('AND')}
              className={`px-3 py-1 text-[10px] font-bold rounded uppercase tracking-tighter border transition-all ${logicMode === 'AND' ? 'bg-emerald-600 border-emerald-400 text-white' : 'bg-transparent border-slate-800 text-slate-500 hover:text-emerald-400'}`}
            >
              AND
            </button>
            <button 
              onClick={() => setLogicMode('NOT')}
              className={`px-3 py-1 text-[10px] font-bold rounded uppercase tracking-tighter border transition-all ${logicMode === 'NOT' ? 'bg-rose-600 border-rose-400 text-white' : 'bg-transparent border-slate-800 text-slate-500 hover:text-rose-400'}`}
            >
              NOT
            </button>
          </div>

          {/* Info Tooltip Icon */}
          <div className="relative group ml-2">
            <div className="w-4 h-4 rounded-full border border-slate-700 text-slate-500 flex items-center justify-center text-[10px] cursor-help hover:border-slate-400 hover:text-slate-400 transition-colors">
              i
            </div>
            {/* Tooltip content */}
            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 p-2 bg-slate-950 border border-slate-800 rounded-lg text-[10px] text-slate-300 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all shadow-2xl z-50 pointer-events-none">
              <p className="mb-1 text-blue-400 font-bold uppercase tracking-widest">Search Modes</p>
              <ul className="space-y-1">
                <li><span className="text-white font-bold">OR:</span> Count videos with any of the selected tags.</li>
                <li><span className="text-white font-bold">AND:</span> Count videos containing all selected tags together.</li>
                <li><span className="text-white font-bold">NOT:</span> Exclude selected tags from the trend calculation.</li>
              </ul>
            </div>
          </div>
          
          {logicMode !== 'NONE' && (
            <span className="text-[10px] text-blue-400/80 animate-pulse ml-2 font-medium">
              Click tags above to apply logic
            </span>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <button 
          onClick={onSearch}
          disabled={loading || tags.length === 0 || (logicMode !== 'NONE' && selectedTags.length === 0)}
          className="flex-grow py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-bold rounded-xl transition-all shadow-lg active:scale-[0.98] flex items-center justify-center border-b-4 border-blue-800"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
          ) : (
            logicMode === 'NONE' ? "Analyze Comparison" : `Apply ${logicMode} Logic`
          )}
        </button>
        
        {hasData && (
          <button 
            onClick={onExport}
            className="px-6 py-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl transition-all flex items-center justify-center gap-2 group border border-slate-700 active:scale-[0.98]"
          >
            <svg className="w-5 h-5 group-hover:translate-y-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export CSV
          </button>
        )}
      </div>
    </div>
  );
};

export default Controls;
