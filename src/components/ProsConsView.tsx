import React, { useState } from 'react';
import { ProsConsAnalysis, ProConPoint } from '../types';
import { 
  PlusCircle, 
  MinusCircle, 
  Info, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  XCircle,
  TrendingUp
} from 'lucide-react';

interface ProsConsViewProps {
  analysis: ProsConsAnalysis;
}

export default function ProsConsView({ analysis }: ProsConsViewProps) {
  // Store expanded states for items in a Record [optionIdx-type-itemIdx] -> boolean
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  const toggleItem = (key: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const getImpactBadge = (impact: 'high' | 'medium' | 'low', isPro: boolean) => {
    const proStyles = {
      high: 'bg-emerald-50 text-emerald-700 border-emerald-100',
      medium: 'bg-teal-50 text-teal-700 border-teal-100',
      low: 'bg-slate-50 text-slate-600 border-slate-100'
    };

    const conStyles = {
      high: 'bg-rose-50 text-rose-700 border-rose-100',
      medium: 'bg-amber-50 text-amber-700 border-amber-100',
      low: 'bg-slate-50 text-slate-600 border-slate-100'
    };

    const styles = isPro ? proStyles[impact] : conStyles[impact];

    return (
      <span className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full border ${styles}`}>
        {impact.charAt(0).toUpperCase() + impact.slice(1)} Weight
      </span>
    );
  };

  const getScoreColor = (score: number) => {
    if (score >= 65) return 'bg-emerald-500 text-emerald-950';
    if (score >= 45) return 'bg-amber-500 text-amber-950';
    return 'bg-rose-500 text-rose-950';
  };

  const getScoreVerdict = (score: number) => {
    if (score >= 70) return 'Highly Favorable';
    if (score >= 55) return 'Slightly Favorable';
    if (score >= 45) return 'Balanced Match';
    if (score >= 30) return 'Slightly Unfavorable';
    return 'Highly Unfavorable';
  };

  return (
    <div className="space-y-8">
      {/* Options Side-by-Side Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {analysis.options.map((opt, optIdx) => {
          return (
            <div 
              key={optIdx} 
              id={`proscons-option-${optIdx}`}
              className="bg-white border border-slate-200/80 rounded-3xl shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col"
            >
              {/* Option header with balance meter */}
              <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Option {optIdx + 1}</span>
                    <h3 className="text-xl font-display font-bold text-slate-800 tracking-tight mt-0.5">{opt.optionName}</h3>
                  </div>
                  
                  {/* Balance score */}
                  <div className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">{getScoreVerdict(opt.score)}</span>
                      <span className={`text-sm font-black font-mono px-2.5 py-1 rounded-xl ${getScoreColor(opt.score)}`}>
                        {opt.score}
                      </span>
                    </div>
                  </div>
                </div>

                {/* score slider bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[9px] font-black tracking-wider text-slate-400 uppercase">
                    <span>Con-heavy</span>
                    <span>Balanced</span>
                    <span>Pro-heavy</span>
                  </div>
                  <div className="h-2 w-full bg-slate-200/80 rounded-full overflow-hidden relative">
                    <div className="absolute top-0 bottom-0 left-1/2 w-[2px] bg-white z-10"></div>
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${
                        opt.score >= 50 ? 'bg-gradient-to-r from-slate-300 to-indigo-600' : 'bg-gradient-to-r from-rose-500 to-slate-300'
                      }`}
                      style={{ width: `${opt.score}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Pros & Cons Columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100 flex-1">
                {/* PROS COLUMN */}
                <div className="p-6 flex flex-col h-full">
                  <div className="flex items-center gap-2 mb-4 text-green-700">
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                    <span className="font-extrabold text-xs tracking-wider uppercase">Pros ({opt.pros.length})</span>
                  </div>

                  {opt.pros.length === 0 ? (
                    <p className="text-xs text-slate-400 italic text-center my-auto py-8">No significant pros found</p>
                  ) : (
                    <div className="space-y-3 flex-1">
                      {opt.pros.map((pro, pIdx) => {
                        const itemKey = `${optIdx}-pro-${pIdx}`;
                        const isExpanded = !!expandedItems[itemKey];

                        return (
                          <div 
                            key={pIdx} 
                            id={`pro-item-${optIdx}-${pIdx}`}
                            onClick={() => toggleItem(itemKey)}
                            className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all ${
                              isExpanded 
                                ? 'bg-green-50/30 border-green-200' 
                                : 'bg-slate-50/40 hover:bg-slate-50/80 border-slate-100'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <p className="text-xs font-bold text-slate-800 leading-normal">{pro.point}</p>
                                <div className="mt-1 flex items-center gap-1.5">
                                  {getImpactBadge(pro.impact, true)}
                                </div>
                              </div>
                              <div className="text-slate-400 mt-0.5">
                                {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                              </div>
                            </div>
                            
                            {isExpanded && (
                              <p className="text-xs text-slate-600 mt-2 border-t border-green-100/30 pt-2 leading-relaxed animate-fade-in font-medium">
                                {pro.explanation}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* CONS COLUMN */}
                <div className="p-6 flex flex-col h-full">
                  <div className="flex items-center gap-2 mb-4 text-rose-700">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div>
                    <span className="font-extrabold text-xs tracking-wider uppercase">Cons ({opt.cons.length})</span>
                  </div>

                  {opt.cons.length === 0 ? (
                    <p className="text-xs text-slate-400 italic text-center my-auto py-8">No significant cons found</p>
                  ) : (
                    <div className="space-y-3 flex-1">
                      {opt.cons.map((con, cIdx) => {
                        const itemKey = `${optIdx}-con-${cIdx}`;
                        const isExpanded = !!expandedItems[itemKey];

                        return (
                          <div 
                            key={cIdx} 
                            id={`con-item-${optIdx}-${cIdx}`}
                            onClick={() => toggleItem(itemKey)}
                            className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all ${
                              isExpanded 
                                ? 'bg-rose-50/30 border-rose-200' 
                                : 'bg-slate-50/40 hover:bg-slate-50/80 border-slate-100'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <p className="text-xs font-bold text-slate-800 leading-normal">{con.point}</p>
                                <div className="mt-1 flex items-center gap-1.5">
                                  {getImpactBadge(con.impact, false)}
                                </div>
                              </div>
                              <div className="text-slate-400 mt-0.5">
                                {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                              </div>
                            </div>
                            
                            {isExpanded && (
                              <p className="text-xs text-slate-600 mt-2 border-t border-rose-100/30 pt-2 leading-relaxed animate-fade-in font-medium">
                                {con.explanation}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
