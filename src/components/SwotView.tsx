import React, { useState } from 'react';
import { SwotAnalysis, SwotItem } from '../types';
import { 
  PlusCircle, 
  MinusCircle, 
  ChevronDown, 
  ChevronUp,
  Shield, 
  AlertTriangle, 
  TrendingUp, 
  Flame
} from 'lucide-react';

interface SwotViewProps {
  analysis: SwotAnalysis;
}

export default function SwotView({ analysis }: SwotViewProps) {
  // Store expanded items in record [quadrant-idx] -> boolean
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  const toggleItem = (key: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const renderQuadrant = (
    title: string, 
    items: SwotItem[], 
    quadrantKey: 'strengths' | 'weaknesses' | 'opportunities' | 'threats',
    bgColor: string, 
    borderColor: string, 
    headerColor: string, 
    icon: React.ReactNode
  ) => {
    return (
      <div className={`p-6 rounded-3xl border ${bgColor} ${borderColor} shadow-sm flex flex-col h-full`}>
        <div className={`flex items-center gap-2.5 mb-4 ${headerColor}`}>
          {icon}
          <h3 className="font-display font-extrabold text-sm tracking-widest uppercase">{title}</h3>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/80 border border-current/10 font-mono">
            {items.length}
          </span>
        </div>

        <div className="space-y-3 flex-1">
          {items.map((item, idx) => {
            const key = `${quadrantKey}-${idx}`;
            const isExpanded = !!expandedItems[key];

            return (
              <div 
                key={idx} 
                id={`swot-item-${quadrantKey}-${idx}`}
                onClick={() => toggleItem(key)}
                className={`p-4 rounded-2xl border text-left bg-white shadow-xs cursor-pointer hover:shadow-sm hover:border-slate-300 transition-all ${
                  isExpanded ? 'ring-2 ring-indigo-500/10 border-indigo-600' : 'border-slate-200'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-bold text-slate-800 leading-normal">
                    {item.title}
                  </span>
                  <div className="text-slate-400 mt-0.5 shrink-0">
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </div>
                </div>

                {isExpanded && (
                  <p className="text-xs text-slate-600 mt-2.5 border-t border-slate-100 pt-2.5 leading-relaxed animate-fade-in font-medium">
                    {item.description}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* 2x2 Bento grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* STRENGTHS */}
        {renderQuadrant(
          "Strengths (Internal)",
          analysis.strengths,
          "strengths",
          "bg-blue-50/40",
          "border-blue-100",
          "text-blue-700",
          <Shield className="w-5 h-5 text-blue-500 fill-blue-500/10" />
        )}

        {/* WEAKNESSES */}
        {renderQuadrant(
          "Weaknesses (Internal)",
          analysis.weaknesses,
          "weaknesses",
          "bg-orange-50/40",
          "border-orange-100",
          "text-orange-700",
          <AlertTriangle className="w-5 h-5 text-orange-500" />
        )}

        {/* OPPORTUNITIES */}
        {renderQuadrant(
          "Opportunities (External)",
          analysis.opportunities,
          "opportunities",
          "bg-purple-50/40",
          "border-purple-100",
          "text-purple-700",
          <TrendingUp className="w-5 h-5 text-purple-500" />
        )}

        {/* THREATS */}
        {renderQuadrant(
          "Threats (External)",
          analysis.threats,
          "threats",
          "bg-rose-50/40",
          "border-rose-100",
          "text-rose-700",
          <Flame className="w-5 h-5 text-rose-500 fill-rose-500/10" />
        )}
      </div>

      <div className="flex items-center gap-2 text-xs text-slate-400 justify-center p-2 font-bold uppercase tracking-wider">
        <span>Tip: Click on any card in the quadrants to read strategic details and execution context.</span>
      </div>
    </div>
  );
}
