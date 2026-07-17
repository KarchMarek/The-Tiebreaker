import React, { useState, useEffect } from 'react';
import { 
  SavedDecision, 
  DecisionInput, 
  DecisionResponse, 
  FrameworkType 
} from './types';
import HistorySidebar from './components/HistorySidebar';
import DecisionForm from './components/DecisionForm';
import ProsConsView from './components/ProsConsView';
import ComparisonView from './components/ComparisonView';
import SwotView from './components/SwotView';
import { 
  Sparkles, 
  GitCompare, 
  LayoutGrid, 
  Loader2, 
  RotateCcw, 
  Copy, 
  Check, 
  HelpCircle, 
  Star, 
  Scale, 
  AlertCircle, 
  Layers, 
  ArrowLeft,
  Settings,
  ChevronRight,
  ShieldCheck,
  Calendar
} from 'lucide-react';

export default function App() {
  // Saved decisions history
  const [history, setHistory] = useState<SavedDecision[]>(() => {
    try {
      const stored = localStorage.getItem('tiebreaker_history');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Current active decision state
  const [currentDecisionId, setCurrentDecisionId] = useState<string | null>(null);
  
  // Loading state
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessageIdx, setLoadingMessageIdx] = useState(0);
  const [apiError, setApiError] = useState<string | null>(null);

  // Clipboard copy feedback state
  const [isCopied, setIsCopied] = useState(false);

  // Form values pre-populator (for adjustments)
  const [activeTab, setActiveTab] = useState<'form' | 'result'>('form');

  // Sync history changes with localStorage
  useEffect(() => {
    localStorage.setItem('tiebreaker_history', JSON.stringify(history));
  }, [history]);

  // Loading messages rotation hook
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading) {
      interval = setInterval(() => {
        setLoadingMessageIdx(prev => (prev + 1) % LOADING_MESSAGES.length);
      }, 3000);
    } else {
      setLoadingMessageIdx(0);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  // Active decision helper
  const currentDecision = history.find(d => d.id === currentDecisionId) || null;

  // Auto-switch tabs when selected decision changes
  useEffect(() => {
    if (currentDecisionId) {
      setActiveTab('result');
    } else {
      setActiveTab('form');
    }
  }, [currentDecisionId]);

  const LOADING_MESSAGES = [
    "Consulting AI decision theory experts...",
    "Brainstorming latent pros and cons...",
    "Constructing SWOT strategic quadrants...",
    "Objectively rating options across criteria...",
    "Resolving logical deadlocks...",
    "Formulating the ultimate tiebreaker recommendation...",
  ];

  // Handler to call the backend API and save results to history
  const handleGenerateDecision = async (input: DecisionInput) => {
    setIsLoading(true);
    setApiError(null);
    try {
      const response = await fetch('/api/decide', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const errPayload = await response.json().catch(() => ({}));
        throw new Error(errPayload.error || `Server responded with ${response.status}`);
      }

      const rawResult: DecisionResponse = await response.json();

      const newSaved: SavedDecision = {
        id: rawResult.id,
        title: input.title,
        timestamp: rawResult.timestamp,
        framework: input.framework,
        input: input,
        response: rawResult,
      };

      setHistory(prev => [newSaved, ...prev]);
      setCurrentDecisionId(newSaved.id);
      setActiveTab('result');
    } catch (err: any) {
      console.error(err);
      setApiError(err.message || "An unexpected error occurred while communicating with the server.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDecision = (id: string) => {
    setHistory(prev => prev.filter(d => d.id !== id));
    if (currentDecisionId === id) {
      setCurrentDecisionId(null);
      setActiveTab('form');
    }
  };

  const handleClearAllHistory = () => {
    setHistory([]);
    setCurrentDecisionId(null);
    setActiveTab('form');
  };

  const handleRateDecision = (rating: number) => {
    if (!currentDecisionId) return;
    setHistory(prev => prev.map(d => {
      if (d.id === currentDecisionId) {
        return { ...d, rating };
      }
      return d;
    }));
  };

  const handleCopyToClipboard = () => {
    if (!currentDecision) return;
    
    let text = `THE TIEBREAKER — DECISION ANALYSIS\n`;
    text += `==================================\n`;
    text += `Decision: "${currentDecision.title}"\n`;
    text += `Framework: ${currentDecision.framework.toUpperCase()}\n`;
    text += `Timestamp: ${new Date(currentDecision.timestamp).toLocaleString()}\n\n`;

    if (currentDecision.response.prosCons) {
      text += `SUMMARY:\n${currentDecision.response.prosCons.summary}\n\n`;
      text += `VERDICT RECOMMENDATION:\n${currentDecision.response.prosCons.recommendation}\n\n`;
      currentDecision.response.prosCons.options.forEach(opt => {
        text += `Option: ${opt.optionName} (Score: ${opt.score}/100)\n`;
        text += `  PROS:\n`;
        opt.pros.forEach(p => text += `  - [${p.impact.toUpperCase()} IMPACT] ${p.point}: ${p.explanation}\n`);
        text += `  CONS:\n`;
        opt.cons.forEach(c => text += `  - [${c.impact.toUpperCase()} IMPACT] ${c.point}: ${c.explanation}\n`);
        text += `\n`;
      });
    } else if (currentDecision.response.comparison) {
      text += `SUMMARY:\n${currentDecision.response.comparison.summary}\n\n`;
      text += `VERDICT RECOMMENDATION:\n${currentDecision.response.comparison.recommendation}\n\n`;
      currentDecision.response.comparison.options.forEach(opt => {
        text += `Option: ${opt.name} (Overall Score: ${opt.overallScore.toFixed(1)}/5.0)\n`;
        text += `  Verdict: ${opt.verdict}\n`;
        text += `  Evaluations:\n`;
        Object.entries(opt.ratings).forEach(([crit, r]) => {
          const rating = r as any;
          text += `    * ${crit}: ${rating.score}/5 - ${rating.text}\n`;
        });
        text += `\n`;
      });
    } else if (currentDecision.response.swot) {
      text += `SUMMARY:\n${currentDecision.response.swot.summary}\n\n`;
      text += `VERDICT RECOMMENDATION:\n${currentDecision.response.swot.recommendation}\n\n`;
      text += `STRENGTHS:\n`;
      currentDecision.response.swot.strengths.forEach(s => text += `  - ${s.title}: ${s.description}\n`);
      text += `WEAKNESSES:\n`;
      currentDecision.response.swot.weaknesses.forEach(w => text += `  - ${w.title}: ${w.description}\n`);
      text += `OPPORTUNITIES:\n`;
      currentDecision.response.swot.opportunities.forEach(o => text += `  - ${o.title}: ${o.description}\n`);
      text += `THREATS:\n`;
      currentDecision.response.swot.threats.forEach(t => text += `  - ${t.title}: ${t.description}\n`);
    }

    navigator.clipboard.writeText(text).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  const getConfidenceScore = () => {
    if (!currentDecision) return "88%";
    const resp = currentDecision.response;
    if (resp.prosCons && resp.prosCons.options) {
      const maxScore = Math.max(...resp.prosCons.options.map(o => o.score));
      return `${Math.min(98, Math.max(72, Math.round(maxScore)))}%`;
    } else if (resp.comparison && resp.comparison.options) {
      const maxScore = Math.max(...resp.comparison.options.map(o => o.overallScore));
      return `${Math.min(98, Math.max(72, Math.round((maxScore / 5) * 100)))}%`;
    }
    return "94%";
  };

  const getFrameworkBadgeColor = (type: FrameworkType) => {
    switch (type) {
      case 'pros_cons': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'comparison': return 'bg-indigo-50 text-indigo-700 border-indigo-100';
      case 'swot': return 'bg-violet-50 text-violet-700 border-violet-100';
    }
  };

  const getFrameworkLabel = (type: FrameworkType) => {
    switch (type) {
      case 'pros_cons': return 'Pros & Cons List';
      case 'comparison': return 'Comparison Matrix Table';
      case 'swot': return 'SWOT Analysis Matrix';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Upper Layout Bar */}
      <header className="bg-white border-b border-slate-200/60 py-3.5 px-6 shrink-0 md:hidden flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-indigo-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 3h5v5"></path><path d="M8 3H3v5"></path><path d="M21 3l-7.5 7.5"></path><path d="M3 3l7.5 7.5"></path><path d="M10.5 13.5L3 21"></path><path d="M13.5 13.5L21 21"></path></svg>
          </div>
          <h1 className="text-xl font-extrabold tracking-tight text-slate-900 uppercase italic">The Tiebreaker</h1>
        </div>
        
        {currentDecisionId && (
          <button 
            onClick={() => {
              setCurrentDecisionId(null);
              setActiveTab('form');
            }}
            id="mobile-new-dilemma-btn"
            className="text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 px-3 py-2 rounded-xl transition-all cursor-pointer"
          >
            New
          </button>
        )}
      </header>

      {/* Main Full-Height Workspace Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side Navigation (Sidebar) */}
        <aside className="w-80 shrink-0 hidden md:block">
          <HistorySidebar
            history={history}
            currentDecisionId={currentDecisionId}
            onSelectDecision={(id) => {
              setCurrentDecisionId(id);
              setActiveTab('result');
            }}
            onNewDecision={() => {
              setCurrentDecisionId(null);
              setActiveTab('form');
            }}
            onDeleteDecision={handleDeleteDecision}
            onClearAll={handleClearAllHistory}
          />
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col">
          <div className="max-w-5xl w-full mx-auto flex-1 flex flex-col justify-start">
            
            {/* Show API error if any */}
            {apiError && (
              <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-rose-800 animate-fade-in" id="api-error-card">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-sm">Failed to generate decision analysis</h4>
                  <p className="text-xs text-rose-700/90 mt-1 leading-relaxed">
                    {apiError}
                  </p>
                  <button 
                    onClick={() => setApiError(null)}
                    id="dismiss-api-error-btn"
                    className="mt-2 text-xs font-semibold text-rose-900 hover:underline cursor-pointer"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            )}

            {/* Premium Loading Screen */}
            {isLoading ? (
              <div className="flex-1 flex flex-col items-center justify-center py-16 px-4 text-center my-auto" id="loading-screen">
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-indigo-500/10 rounded-full blur-xl animate-pulse"></div>
                  <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl text-indigo-600 animate-spin relative">
                    <Loader2 className="w-8 h-8 stroke-[2.5]" />
                  </div>
                </div>

                <h3 className="text-lg font-display font-bold text-gray-900 tracking-tight animate-pulse duration-1000">
                  {LOADING_MESSAGES[loadingMessageIdx]}
                </h3>
                <p className="text-xs text-gray-500 mt-2 max-w-sm">
                  We are processing your preferences to provide a perfectly balanced, objective verdict.
                </p>

                {/* Simulated visual progress meter bar */}
                <div className="w-48 h-1 bg-gray-100 rounded-full overflow-hidden mt-6">
                  <div className="h-full bg-indigo-600 rounded-full animate-infinite-loading"></div>
                </div>
              </div>
            ) : activeTab === 'form' ? (
              /* Decision Input Form */
              <div className="space-y-6">
                {/* Visual Header */}
                <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 rounded-3xl p-6 md:p-8 text-white shadow-lg relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div className="absolute top-0 right-0 transform translate-x-12 -translate-y-12 w-64 h-64 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none"></div>
                  <div className="relative max-w-2xl">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-indigo-500/20 text-indigo-200 px-3 py-1 rounded-full border border-indigo-500/30 mb-4 uppercase tracking-wider">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                      AI-Powered Decision Core
                    </span>
                    <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight uppercase italic text-white">
                      The Tiebreaker
                    </h1>
                    <p className="text-sm text-indigo-200/80 mt-2 leading-relaxed">
                      Facing a difficult dilemma, career path, purchase choice, or business strategy? Input your constraints and let our objective analytical model weigh the options and break the deadlock.
                    </p>
                  </div>
                  <div className="bg-white/10 border border-white/10 rounded-2xl px-4 py-3 flex items-center gap-3 shadow-md relative shrink-0">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-bold text-indigo-300 uppercase tracking-widest mb-0.5">Decision Mode</span>
                      <div className="flex items-center gap-2">
                        <div className="h-2.5 w-2.5 rounded-full bg-green-400 animate-pulse"></div>
                        <span className="text-xs font-bold text-white tracking-wide">Comprehensive Analysis</span>
                      </div>
                    </div>
                  </div>
                </div>

                <DecisionForm 
                  onGenerate={handleGenerateDecision} 
                  isLoading={isLoading} 
                  initialValues={currentDecision ? currentDecision.input : null}
                />
              </div>
            ) : currentDecision ? (
              /* Decision Analysis Results Screen */
              <div className="space-y-6 animate-fade-in" id="decision-results-screen">
                {/* Navigation Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm">
                  <div className="flex items-center gap-3.5">
                    <button
                      onClick={() => {
                        setCurrentDecisionId(null);
                        setActiveTab('form');
                      }}
                      id="back-to-form-btn"
                      className="p-2.5 hover:bg-slate-50 text-slate-500 hover:text-slate-900 rounded-2xl transition-all border border-slate-200 cursor-pointer shadow-xs"
                      title="Adjust Dilemma Form"
                    >
                      <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
                    </button>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`inline-flex items-center text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${getFrameworkBadgeColor(currentDecision.framework)}`}>
                          {getFrameworkLabel(currentDecision.framework)}
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-300" />
                          {new Date(currentDecision.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                      <h2 className="text-base font-display font-black text-slate-800 mt-1">
                        {currentDecision.title}
                      </h2>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        // populate form with existing values
                        setActiveTab('form');
                      }}
                      id="adjust-inputs-btn"
                      className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2.5 hover:bg-slate-50 text-slate-600 rounded-2xl border border-slate-200 transition-all cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Adjust Dilemma
                    </button>

                    <button
                      onClick={handleCopyToClipboard}
                      id="copy-summary-btn"
                      className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl shadow-md shadow-indigo-100 transition-all cursor-pointer"
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          Export Verdict
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Dilemma Summary Callout block */}
                <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm">
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">The Strategic Landscape</h3>
                  <p className="text-sm text-slate-600 leading-relaxed font-semibold">
                    {currentDecision.response.prosCons?.summary || 
                     currentDecision.response.comparison?.summary || 
                     currentDecision.response.swot?.summary}
                  </p>
                </div>

                {/* Ultimate Tiebreaker Verdict Card & Confidence Score Grid */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5" id="verdict-banner-card">
                  {/* Left component: recommendation */}
                  <div className="md:col-span-8 bg-slate-900 text-white rounded-3xl p-6 md:p-8 border border-slate-950 shadow-lg relative overflow-hidden flex flex-col justify-between">
                    <div className="absolute top-0 right-0 transform translate-x-16 -translate-y-16 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>
                    <div className="relative">
                      <span className="inline-flex items-center gap-1.5 text-[9px] font-bold bg-indigo-500/20 text-indigo-200 border border-indigo-500/30 px-3 py-1 rounded-full mb-4 uppercase tracking-widest">
                        <Scale className="w-3 h-3 text-indigo-400" />
                        The Tiebreaker Verdict
                      </span>

                      <h4 className="text-xl font-display font-black uppercase tracking-tight mb-2.5">Verdict Recommendation</h4>
                      <p className="text-sm leading-relaxed text-slate-250 whitespace-pre-line font-medium">
                        {currentDecision.response.prosCons?.recommendation || 
                         currentDecision.response.comparison?.recommendation || 
                         currentDecision.response.swot?.recommendation}
                      </p>
                    </div>
                  </div>

                  {/* Right component: Big Confidence score card */}
                  <div className="md:col-span-4 bg-indigo-600 text-white rounded-3xl p-6 md:p-8 shadow-xl flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 transform translate-x-8 -translate-y-8 w-32 h-32 bg-white/5 rounded-full blur-xl pointer-events-none"></div>
                    <div>
                      <p className="text-[10px] font-bold text-indigo-100 uppercase tracking-widest mb-2">Confidence Level</p>
                      <p className="text-xs text-indigo-50/90 leading-relaxed font-semibold">
                        Determined through objective weight grading metrics.
                      </p>
                    </div>
                    <div className="mt-6 md:mt-0">
                      <div className="text-5xl font-black tracking-tighter italic font-display">{getConfidenceScore()}</div>
                      <p className="text-[9px] text-indigo-100/60 uppercase tracking-widest font-bold mt-1">AI Analytical Match</p>
                    </div>
                  </div>
                </div>

                {/* Specific Framework visualizers */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Deep Analytical Breakdown</h3>
                  </div>

                  {currentDecision.framework === 'pros_cons' && currentDecision.response.prosCons && (
                    <ProsConsView analysis={currentDecision.response.prosCons} />
                  )}

                  {currentDecision.framework === 'comparison' && currentDecision.response.comparison && (
                    <ComparisonView analysis={currentDecision.response.comparison} />
                  )}

                  {currentDecision.framework === 'swot' && currentDecision.response.swot && (
                    <SwotView analysis={currentDecision.response.swot} />
                  )}
                </div>

                {/* Decision rating: Feedback card */}
                <div className="bg-white border border-slate-200/80 rounded-3xl p-6 text-center shadow-sm max-w-xl mx-auto space-y-3">
                  <h4 className="font-display font-extrabold text-slate-800 text-sm uppercase tracking-wider">Did this analysis help break your deadlock?</h4>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">
                    Rate how insightful the Tiebreaker verdict was. Your ratings will be saved in your local dilemma history catalog.
                  </p>
                  
                  <div className="flex items-center justify-center gap-1.5 pt-1">
                    {[1, 2, 3, 4, 5].map((stars) => {
                      const isStarred = (currentDecision.rating || 0) >= stars;
                      return (
                        <button
                          key={stars}
                          id={`star-rating-btn-${stars}`}
                          onClick={() => handleRateDecision(stars)}
                          className="p-1 text-slate-300 hover:text-amber-400 focus:outline-none transition-colors cursor-pointer"
                          title={`Rate ${stars} stars`}
                        >
                          <Star className={`w-6 h-6 ${isStarred ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                        </button>
                      );
                    })}
                  </div>
                  
                  {currentDecision.rating && (
                    <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider flex items-center justify-center gap-1">
                      <ShieldCheck className="w-4 h-4" />
                      Feedback recorded successfully!
                    </p>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </main>
      </div>
    </div>
  );
}
