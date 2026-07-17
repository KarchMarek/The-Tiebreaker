import React, { useState } from 'react';
import { ComparisonAnalysis, ComparisonOption } from '../types';
import { 
  Star, 
  HelpCircle, 
  Info, 
  Check, 
  Award, 
  ChevronDown, 
  ChevronUp 
} from 'lucide-react';

interface ComparisonViewProps {
  analysis: ComparisonAnalysis;
}

export default function ComparisonView({ analysis }: ComparisonViewProps) {
  // Store currently selected option and criterion for detailed inspection
  const [selectedCell, setSelectedCell] = useState<{ optIdx: number; criterion: string } | null>(null);

  const getScoreStars = (score: number) => {
    return (
      <div className="flex items-center gap-0.5 justify-center">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star
            key={s}
            className={`w-3.5 h-3.5 ${
              s <= score 
                ? 'fill-amber-400 text-amber-400' 
                : 'text-gray-200 fill-gray-100'
            }`}
          />
        ))}
      </div>
    );
  };

  const getScoreBadge = (score: number) => {
    const styles = {
      5: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      4: 'bg-teal-100 text-teal-800 border-teal-200',
      3: 'bg-amber-100 text-amber-800 border-amber-200',
      2: 'bg-orange-100 text-orange-800 border-orange-200',
      1: 'bg-rose-100 text-rose-800 border-rose-200'
    }[Math.floor(score) as 1 | 2 | 3 | 4 | 5] || 'bg-gray-100 text-gray-800 border-gray-200';

    return (
      <span className={`inline-flex items-center justify-center w-6 h-6 text-xs font-bold rounded-full border ${styles}`}>
        {score}
      </span>
    );
  };

  const getWinnerBadge = (option: ComparisonOption) => {
    const isWinner = option.overallScore === Math.max(...analysis.options.map(o => o.overallScore));
    if (!isWinner) return null;

    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200/80 px-2 py-0.5 rounded-full shadow-sm animate-pulse">
        <Award className="w-3 h-3 text-amber-500 fill-amber-500" />
        Top Match
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Scrollable Table Wrapper */}
      <div className="bg-white border border-slate-200/80 rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200/80">
                <th className="p-5 text-xs font-bold text-slate-400 uppercase tracking-widest min-w-[180px]">
                  Comparison Matrix
                </th>
                {analysis.options.map((opt, oIdx) => (
                  <th key={oIdx} className="p-5 text-center min-w-[200px] border-l border-slate-100">
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">
                        Option {oIdx + 1}
                      </span>
                      <span className="font-display font-bold text-sm text-slate-800 text-center break-words max-w-[180px]">
                        {opt.name}
                      </span>
                      <div className="mt-1 flex items-center gap-1.5">
                        {getWinnerBadge(opt)}
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            
            <tbody className="divide-y divide-slate-100">
              {/* Scorecard row (overall score) */}
              <tr className="bg-indigo-50/10 font-semibold">
                <td className="p-5 text-sm font-bold text-indigo-950">
                  Overall Score (1-5)
                </td>
                {analysis.options.map((opt, oIdx) => (
                  <td key={oIdx} className="p-5 text-center border-l border-slate-100">
                    <div className="flex flex-col items-center gap-1.5">
                      <span className="text-2xl font-black font-mono text-indigo-600">
                        {opt.overallScore.toFixed(1)}
                      </span>
                      {getScoreStars(Math.round(opt.overallScore))}
                    </div>
                  </td>
                ))}
              </tr>

              {/* Criteria evaluations */}
              {analysis.criteria.map((crit, cIdx) => (
                <tr key={cIdx} className="hover:bg-slate-50/40 transition-colors">
                  <td className="p-5 text-sm font-bold text-slate-700">
                    <div className="flex items-center gap-1.5">
                      <span>{crit}</span>
                    </div>
                  </td>
                  
                  {analysis.options.map((opt, oIdx) => {
                    const cellRating = opt.ratings[crit] || { score: 3, text: 'No rating provided.' };
                    const isSelected = selectedCell?.optIdx === oIdx && selectedCell?.criterion === crit;

                    return (
                      <td 
                        key={oIdx} 
                        id={`compare-cell-${oIdx}-${cIdx}`}
                        onClick={() => setSelectedCell(isSelected ? null : { optIdx: oIdx, criterion: crit })}
                        className={`p-5 text-center cursor-pointer border-l border-slate-100 transition-all ${
                          isSelected ? 'bg-indigo-50/30' : ''
                        }`}
                      >
                        <div className="flex flex-col items-center gap-1.5">
                          <div className="flex items-center gap-2">
                            {getScoreBadge(cellRating.score)}
                            <span className="text-xs text-slate-400 font-bold">
                              / 5
                            </span>
                          </div>
                          
                          {/* Peek comment if very short */}
                          <p className="text-[10px] text-slate-400 max-w-[180px] truncate font-medium">
                            {cellRating.text}
                          </p>

                          <span className="text-[9px] text-indigo-600 font-bold uppercase tracking-wider opacity-0 hover:opacity-100 sm:group-hover:opacity-100 transition-opacity">
                            View details
                          </span>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}

              {/* Quick Verdict row */}
              <tr className="bg-slate-50/30">
                <td className="p-5 text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Quick Verdict
                </td>
                {analysis.options.map((opt, oIdx) => (
                  <td key={oIdx} className="p-5 text-center border-l border-slate-100">
                    <p className="text-xs font-semibold text-slate-600 max-w-[200px] mx-auto leading-relaxed italic">
                      "{opt.verdict}"
                    </p>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Cell inspection panel */}
      {selectedCell ? (
        <div id="criteria-inspector" className="p-6 bg-indigo-50/20 border border-indigo-100 rounded-3xl animate-fade-in">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="flex items-center gap-2.5">
              <span className="p-1.5 bg-indigo-600 rounded-xl text-white shadow-md shadow-indigo-100">
                <Info className="w-4 h-4" />
              </span>
              <h4 className="font-display font-bold text-slate-800 text-sm">
                Evaluating "{selectedCell.criterion}" for {analysis.options[selectedCell.optIdx].name}
              </h4>
            </div>
            <button 
              onClick={() => setSelectedCell(null)}
              id="close-cell-inspector"
              className="text-xs text-slate-400 hover:text-slate-600 font-bold uppercase tracking-wider cursor-pointer"
            >
              Close &times;
            </button>
          </div>
          
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Score awarded:</span>
            {getScoreBadge(analysis.options[selectedCell.optIdx].ratings[selectedCell.criterion]?.score || 3)}
            {getScoreStars(analysis.options[selectedCell.optIdx].ratings[selectedCell.criterion]?.score || 3)}
          </div>

          <p className="text-sm text-slate-700 leading-relaxed bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm font-medium">
            {analysis.options[selectedCell.optIdx].ratings[selectedCell.criterion]?.text || 'No additional evaluation details.'}
          </p>
        </div>
      ) : (
        <div className="flex items-center gap-2 text-xs text-slate-400 justify-center p-2 font-bold uppercase tracking-wider">
          <HelpCircle className="w-4 h-4 text-slate-300" />
          <span>Tip: Click on any cell in the grid matrix to inspect deep criteria justifications.</span>
        </div>
      )}
    </div>
  );
}
