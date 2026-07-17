import React, { useState, useEffect } from 'react';
import { FrameworkType, DecisionInput } from '../types';
import { 
  Sparkles, 
  GitCompare, 
  LayoutGrid, 
  Plus, 
  Trash2, 
  ArrowRight, 
  Info,
  Layers,
  FileText
} from 'lucide-react';

interface DecisionFormProps {
  onGenerate: (input: DecisionInput) => void;
  isLoading: boolean;
  initialValues?: DecisionInput | null;
}

export default function DecisionForm({ onGenerate, isLoading, initialValues }: DecisionFormProps) {
  const [title, setTitle] = useState('');
  const [framework, setFramework] = useState<FrameworkType>('pros_cons');
  const [options, setOptions] = useState<string[]>(['', '']);
  const [context, setContext] = useState('');
  
  // Custom criteria state (only for comparison matrix)
  const [criteria, setCriteria] = useState<string[]>([]);
  const [newCriterion, setNewCriterion] = useState('');

  // Sync initial values if editing or reviewing an existing decision
  useEffect(() => {
    if (initialValues) {
      setTitle(initialValues.title || '');
      setFramework(initialValues.framework || 'pros_cons');
      setOptions(initialValues.options && initialValues.options.length ? [...initialValues.options] : ['', '']);
      setContext(initialValues.context || '');
      setCriteria(initialValues.criteria || []);
    } else {
      // Defaults
      setTitle('');
      setFramework('pros_cons');
      setOptions(['', '']);
      setContext('');
      setCriteria([]);
    }
  }, [initialValues]);

  // Adjust options length when switching frameworks
  useEffect(() => {
    if (initialValues) return; // don't override when loading saved data
    if (framework === 'swot') {
      // SWOT usually focuses on 1 subject
      setOptions(prev => prev.length ? [prev[0] || ''] : ['']);
    } else {
      // Pros & Cons or Comparison usually compares 2 or more
      setOptions(prev => {
        if (prev.length < 2) {
          return [...prev, ''];
        }
        return prev;
      });
    }
  }, [framework, initialValues]);

  const handleAddOption = () => {
    setOptions([...options, '']);
  };

  const handleRemoveOption = (index: number) => {
    if (options.length <= 1) return;
    const updated = options.filter((_, i) => i !== index);
    setOptions(updated);
  };

  const handleOptionChange = (index: number, val: string) => {
    const updated = [...options];
    updated[index] = val;
    setOptions(updated);
  };

  const handleAddCriterion = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCriterion.trim() && !criteria.includes(newCriterion.trim())) {
      setCriteria([...criteria, newCriterion.trim()]);
      setNewCriterion('');
    }
  };

  const handleRemoveCriterion = (index: number) => {
    setCriteria(criteria.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    // Filter out empty options
    const cleanedOptions = options.map(o => o.trim()).filter(Boolean);
    const cleanedCriteria = criteria.map(c => c.trim()).filter(Boolean);

    onGenerate({
      title: title.trim(),
      framework,
      options: cleanedOptions,
      context: context.trim() || undefined,
      criteria: framework === 'comparison' ? cleanedCriteria : undefined
    });
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100 bg-slate-50/50">
        <h2 className="text-xl font-display font-bold text-slate-800 tracking-tight flex items-center gap-2">
          <Layers className="w-5 h-5 text-indigo-600" />
          Formulate Your Dilemma
        </h2>
        <p className="text-xs text-slate-400 mt-1 uppercase font-bold tracking-wider">
          Provide your constraints & options to build the analytical grid
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Step 1: Decision/Dilemma */}
        <div>
          <label htmlFor="decision-title-input" className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
            1. What decision are you facing?
          </label>
          <input
            type="text"
            id="decision-title-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Should I accept the Senior Lead offer in Amsterdam or stay in San Francisco?"
            required
            className="w-full px-4 py-3.5 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 text-sm placeholder-slate-400 font-medium transition-all"
          />
        </div>

        {/* Step 2: Choose Framework */}
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
            2. Choose Analytical Framework
          </label>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Pros & Cons Card */}
            <div
              id="framework-pros-cons"
              onClick={() => setFramework('pros_cons')}
              className={`p-5 rounded-2xl border-2 text-left cursor-pointer transition-all ${
                framework === 'pros_cons'
                  ? 'border-indigo-600 bg-indigo-50/20'
                  : 'border-slate-200 hover:border-slate-300 bg-transparent'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={`p-1.5 rounded-xl ${framework === 'pros_cons' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100' : 'bg-slate-100 text-slate-600'}`}>
                  <Sparkles className="w-4 h-4" />
                </div>
                <span className="font-bold text-sm text-slate-800">Pros & Cons</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Analyze single or multiple choices by weighing subjective advantages and disadvantages.
              </p>
            </div>

            {/* Comparison Table Card */}
            <div
              id="framework-comparison"
              onClick={() => setFramework('comparison')}
              className={`p-5 rounded-2xl border-2 text-left cursor-pointer transition-all ${
                framework === 'comparison'
                  ? 'border-indigo-600 bg-indigo-50/20'
                  : 'border-slate-200 hover:border-slate-300 bg-transparent'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={`p-1.5 rounded-xl ${framework === 'comparison' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100' : 'bg-slate-100 text-slate-600'}`}>
                  <GitCompare className="w-4 h-4" />
                </div>
                <span className="font-bold text-sm text-slate-800">Comparison Matrix</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Grade multiple options (1 to 5) across custom criteria for a structured quantitative scorecard.
              </p>
            </div>

            {/* SWOT Analysis Card */}
            <div
              id="framework-swot"
              onClick={() => setFramework('swot')}
              className={`p-5 rounded-2xl border-2 text-left cursor-pointer transition-all ${
                framework === 'swot'
                  ? 'border-indigo-600 bg-indigo-50/20'
                  : 'border-slate-200 hover:border-slate-300 bg-transparent'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={`p-1.5 rounded-xl ${framework === 'swot' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100' : 'bg-slate-100 text-slate-600'}`}>
                  <LayoutGrid className="w-4 h-4" />
                </div>
                <span className="font-bold text-sm text-slate-800">SWOT Grid</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Map the Strengths, Weaknesses, Opportunities, and Threats of a singular strategic option.
              </p>
            </div>
          </div>
        </div>

        {/* Step 3: Options manager */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">
              {framework === 'swot' ? '3. Subject of SWOT Analysis' : '3. What options are you comparing?'}
            </label>
            {framework !== 'swot' && (
              <button
                type="button"
                onClick={handleAddOption}
                id="add-option-btn"
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Option
              </button>
            )}
          </div>

          <div className="space-y-3">
            {options.map((opt, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  id={`option-input-${index}`}
                  value={opt}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  placeholder={
                    framework === 'swot'
                      ? 'e.g. Relocating to our Amsterdam Office'
                      : index === 0 ? 'e.g. Option A: Move to Amsterdam' : index === 1 ? 'e.g. Option B: Stay in San Francisco' : `e.g. Option ${String.fromCharCode(65 + index)}`
                  }
                  required={index < (framework === 'swot' ? 1 : 2)}
                  className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-medium transition-all"
                />
                
                {options.length > (framework === 'swot' ? 1 : 2) && (
                  <button
                    type="button"
                    id={`remove-option-${index}`}
                    onClick={() => handleRemoveOption(index)}
                    className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl border border-slate-200 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step 4: Comparison Criteria (Only for Comparison matrix) */}
        {framework === 'comparison' && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                4. Custom Criteria (Optional)
                <span className="inline-block text-[10px] text-slate-400 font-normal normal-case">
                  (Leave empty for AI suggestions)
                </span>
              </label>
            </div>

            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newCriterion}
                id="new-criterion-input"
                onChange={(e) => setNewCriterion(e.target.value)}
                placeholder="e.g. Base Salary, Work-Life Balance, Tax Benefits"
                className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-medium transition-all"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCriterion(e);
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAddCriterion}
                id="add-criterion-btn"
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-bold transition-all cursor-pointer"
              >
                Add
              </button>
            </div>

            {criteria.length > 0 && (
              <div className="flex flex-wrap gap-2 p-3 bg-slate-50/50 rounded-xl border border-slate-200/60">
                {criteria.map((c, i) => (
                  <span
                    key={i}
                    id={`criterion-tag-${i}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold bg-white text-slate-700 px-3 py-1.5 rounded-full border border-slate-200 shadow-sm"
                  >
                    {c}
                    <button
                      type="button"
                      onClick={() => handleRemoveCriterion(i)}
                      className="p-0.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 5: Optional Extra Context */}
        <div>
          <label htmlFor="context-input" className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1">
            <FileText className="w-3.5 h-3.5" />
            {framework === 'comparison' ? '5.' : '4.'} Tell us more about your situation (Optional)
          </label>
          <textarea
            id="context-input"
            rows={3}
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="e.g. My priority is long-term sustainability. I value flexible hours and proximity to family/travel hubs. I have a 3-month timeline."
            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 text-sm placeholder-slate-400 font-medium transition-all"
          ></textarea>
        </div>

        {/* Submit action */}
        <div className="pt-4 border-t border-slate-100">
          <button
            type="submit"
            id="generate-tiebreaker-btn"
            disabled={isLoading || !title.trim()}
            className="w-full py-3.5 px-6 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-100 disabled:text-slate-400 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:shadow-indigo-200 transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                The Tiebreaker is building bento analytics...
              </>
            ) : (
              <>
                Analyze with AI Decision Core
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
