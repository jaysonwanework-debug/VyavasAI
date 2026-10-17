import React, { useState } from 'react';
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Package,
  ShoppingCart,
  RefreshCw,
  BookOpen,
  IndianRupee,
  BarChart3,
  AlertTriangle,
  Layers,
  Sparkles,
} from 'lucide-react';
import { AgentStep, LanguageCode } from '../types';
import { LANGUAGE_CONFIGS } from '../data/seedData';

interface AgentStepsTimelineProps {
  steps: AgentStep[];
  isThinking: boolean;
  currentLang: LanguageCode;
}

export const AgentStepsTimeline: React.FC<AgentStepsTimelineProps> = ({
  steps,
  isThinking,
  currentLang,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const langMeta = LANGUAGE_CONFIGS[currentLang];

  if (steps.length === 0 && !isThinking) {
    return null;
  }

  const getToolIcon = (toolName: string) => {
    switch (toolName) {
      case 'check_stock':
        return <Package size={14} className="text-cyan-400" />;
      case 'create_order':
        return <ShoppingCart size={14} className="text-amber-400" />;
      case 'update_stock':
        return <RefreshCw size={14} className="text-sky-400" />;
      case 'add_to_customer_ledger':
      case 'record_payment':
      case 'get_customer_balance':
        return <BookOpen size={14} className="text-emerald-400" />;
      case 'get_sales_summary':
        return <BarChart3 size={14} className="text-purple-400" />;
      case 'record_expense':
        return <IndianRupee size={14} className="text-rose-400" />;
      case 'get_low_stock_items':
        return <AlertTriangle size={14} className="text-amber-400" />;
      default:
        return <Sparkles size={14} className="text-cyan-400" />;
    }
  };

  return (
    <div className="w-full my-2 bg-slate-900/90 border border-cyan-500/30 rounded-2xl p-3.5 shadow-lg shadow-cyan-950/20 backdrop-blur-md">
      {/* Header Bar */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-left focus:outline-none"
      >
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-300">
            <Layers size={13} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold tracking-tight text-white uppercase">
                {langMeta.agentSteps}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                {steps.length} {steps.length === 1 ? 'Step' : 'Steps'}
              </span>
            </div>
            <div className="text-[10px] text-slate-400">
              {langMeta.agentStepsSubtitle}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-slate-400 hover:text-white">
          <span className="text-[11px] font-mono">
            {isExpanded ? 'Collapse' : 'Expand'}
          </span>
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>

      {/* Steps List */}
      {isExpanded && (
        <div className="mt-3 space-y-2.5 relative before:absolute before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-cyan-500/50 before:via-blue-500/30 before:to-transparent">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="relative pl-7 flex flex-col group animate-fadeIn"
            >
              {/* Step indicator node */}
              <div className="absolute left-1.5 top-1 w-4 h-4 rounded-full bg-slate-900 border-2 border-cyan-400 flex items-center justify-center shadow-[0_0_8px_rgba(6,182,212,0.6)]">
                <span className="text-[8px] font-mono font-bold text-cyan-300">
                  {step.stepNumber}
                </span>
              </div>

              {/* Step content card */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-2.5 transition-all hover:border-cyan-500/30 shadow-sm">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 font-mono text-xs font-semibold text-cyan-300">
                    {getToolIcon(step.toolName)}
                    <span>{step.toolName}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
                    <span>{step.timestamp}</span>
                    <span className="inline-flex items-center gap-0.5 text-emerald-400 font-semibold bg-emerald-950/40 px-1.5 py-0.2 rounded border border-emerald-500/30">
                      <CheckCircle2 size={10} /> Done
                    </span>
                  </div>
                </div>

                {/* Plain language explanation */}
                <p className="mt-1.5 text-xs text-slate-200 font-medium leading-relaxed">
                  {step.description}
                </p>

                {/* Raw Arguments / Results in small cyber pill format */}
                <div className="mt-2 pt-1.5 border-t border-slate-800/80 flex flex-wrap gap-2 text-[10px] font-mono">
                  <span className="text-slate-400">
                    ARGS: <span className="text-slate-300">{JSON.stringify(step.args)}</span>
                  </span>
                  <span className="text-cyan-400 font-semibold">
                    → RES: <span className="text-slate-300">{JSON.stringify(step.result)}</span>
                  </span>
                </div>
              </div>
            </div>
          ))}

          {/* Active execution indicator */}
          {isThinking && (
            <div className="relative pl-7 flex items-center gap-2 text-xs text-cyan-300 italic py-1 animate-pulse">
              <div className="absolute left-1.5 top-1.5 w-4 h-4 rounded-full bg-cyan-900 border-2 border-cyan-400 animate-spin" />
              <span>Next step executing in agent loop...</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
