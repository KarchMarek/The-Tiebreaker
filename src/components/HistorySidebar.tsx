import React, { useState } from 'react';
import { SavedDecision, FrameworkType } from '../types';
import { 
  GitCompare, 
  Trash2, 
  Calendar, 
  HelpCircle, 
  Sparkles, 
  BarChart3, 
  LayoutGrid, 
  PlusCircle,
  Search
} from 'lucide-react';

interface HistorySidebarProps {
  history: SavedDecision[];
  currentDecisionId: string | null;
  onSelectDecision: (id: string) => void;
  onNewDecision: () => void;
  onDeleteDecision: (id: string) => void;
  onClearAll: () => void;
}

export default function HistorySidebar({
  history,
  currentDecisionId,
  onSelectDecision,
  onNewDecision,
  onDeleteDecision,
  onClearAll
}: HistorySidebarProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const getFrameworkBadge = (type: FrameworkType) => {
    switch (type) {
      case 'pros_cons':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100">
            <Sparkles className="w-2.5 h-2.5" />
            Pros & Cons
          </span>
        );
      case 'comparison':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
            <GitCompare className="w-2.5 h-2.5" />
            Comparison
          </span>
        );
      case 'swot':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-violet-50 text-violet-700 border border-violet-100">
            <LayoutGrid className="w-2.5 h-2.5" />
            SWOT
          </span>
        );
    }
  };

  const filteredHistory = history.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.input.context && item.input.context.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Recent';
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50/50 border-r border-slate-200/60">
      {/* Header section */}
      <div className="p-4 border-b border-slate-200/60 bg-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-indigo-100">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 3h5v5"></path><path d="M8 3H3v5"></path><path d="M21 3l-7.5 7.5"></path><path d="M3 3l7.5 7.5"></path><path d="M10.5 13.5L3 21"></path><path d="M13.5 13.5L21 21"></path></svg>
            </div>
            <h1 className="text-lg font-extrabold tracking-tight text-slate-900 uppercase italic">The Tiebreaker</h1>
          </div>
          
          <button
            onClick={onNewDecision}
            id="new-decision-btn"
            className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-all cursor-pointer"
          >
            New
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search decisions..."
            value={searchTerm}
            id="search-history-input"
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-gray-50 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 placeholder-gray-400"
          />
        </div>
      </div>

      {/* List items */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {filteredHistory.length === 0 ? (
          <div className="p-6 text-center text-gray-400 text-xs flex flex-col items-center justify-center gap-2 h-full">
            <HelpCircle className="w-6 h-6 text-gray-300 stroke-[1.5]" />
            {searchTerm ? 'No decisions match search' : 'No decisions resolved yet'}
          </div>
        ) : (
          filteredHistory.map((item) => {
            const isSelected = item.id === currentDecisionId;
            return (
              <div
                key={item.id}
                id={`history-item-${item.id}`}
                onClick={() => onSelectDecision(item.id)}
                className={`group flex flex-col p-3 rounded-lg text-left transition-all cursor-pointer border ${
                  isSelected 
                    ? 'bg-indigo-50/50 border-indigo-200/60' 
                    : 'bg-transparent border-transparent hover:bg-gray-50/60'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <span className={`text-sm font-medium leading-snug break-words flex-1 ${
                    isSelected ? 'text-indigo-900' : 'text-gray-700 group-hover:text-gray-900'
                  }`}>
                    {item.title}
                  </span>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteDecision(item.id);
                    }}
                    id={`delete-history-${item.id}`}
                    className="p-1 text-gray-400 hover:text-red-500 rounded-md hover:bg-gray-100/80 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete decision"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center justify-between gap-2 mt-1">
                  <div className="flex items-center gap-1.5">
                    {getFrameworkBadge(item.framework)}
                    {item.rating && (
                      <span className="inline-flex items-center text-[10px] text-amber-600 font-medium bg-amber-50 px-1 py-0.5 rounded border border-amber-100">
                        ★ {item.rating}
                      </span>
                    )}
                  </div>
                  
                  <span className="text-[10px] text-gray-400 flex items-center gap-1">
                    <Calendar className="w-2.5 h-2.5" />
                    {formatDate(item.timestamp)}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer statistics */}
      {history.length > 0 && (
        <div className="p-3 bg-gray-50 border-t border-gray-100 text-center">
          <div className="flex items-center justify-between text-[11px] text-gray-500 mb-1">
            <span>Total dilemmas:</span>
            <span className="font-semibold text-gray-700">{history.length}</span>
          </div>
          <button
            onClick={() => {
              if (window.confirm("Are you sure you want to clear your entire decision history? This cannot be undone.")) {
                onClearAll();
              }
            }}
            id="clear-all-history-btn"
            className="text-[10px] font-medium text-red-500 hover:text-red-600 underline transition-all cursor-pointer"
          >
            Clear all history
          </button>
        </div>
      )}
    </div>
  );
}
