import React, { useState } from 'react';
import {
  Send,
  Copy,
  Check,
  Sparkles,
  FileSpreadsheet,
  ArrowUpRight,
  Terminal,
  RotateCcw,
} from 'lucide-react';
import {
  OFFICIAL_Q10_LIVE_PROMPT,
  buildGroundedQ10Response,
} from '../utils/telcoxAnalytics';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  title?: string;
  content: string;
  timestamp: string;
  citations?: string[];
  verificationHighlights?: Array<{ label: string; value: string; sheet: string }>;
  engineMode?: string;
}

interface AiDemoChatbotProps {
  messages: ChatMessage[];
  onSendMessage: (promptText: string) => Promise<void>;
  isLoading: boolean;
  onResetChat: () => void;
  lossThreshold: number;
  latencyThreshold: number;
  onInspectSheet: (sheetName: 'Customers' | 'Calls' | 'NetworkEvents' | 'Store_Visits') => void;
}

const PRESET_PROMPTS = [
  {
    label: 'Run Official 7-Point Q10 Live Demo Prompt',
    prompt: OFFICIAL_Q10_LIVE_PROMPT,
  },
  {
    label: 'Audit Mixed Timestamp Formats (########## vs Text)',
    prompt:
      'Inspect the timestamp formats across Calls, NetworkEvents, and Store_Visits. How many records are text strings versus Excel serial numbers, and how does this affect real-time stream windowing?',
  },
  {
    label: 'Explain Missing cell_id to customer_id Join Boundary',
    prompt:
      'Can TelcoX attribute a packet_loss or latency_spike event in NetworkEvents directly to a specific customer in Customers? Explain the schema limitation and how the hybrid architecture handles it.',
  },
  {
    label: 'Verify 6-Month Churn (31.0%) & Unresolved Calls (20.28%)',
    prompt:
      'Verify the exact 6-month customer churn rate in Customers!H2:H201 and the call resolution rate in Calls!G2:G5001, and explain how active unresolved calls should be routed.',
  },
];

export const AiDemoChatbot: React.FC<AiDemoChatbotProps> = ({
  messages,
  onSendMessage,
  isLoading,
  onResetChat,
  lossThreshold,
  latencyThreshold,
  onInspectSheet,
}) => {
  const [inputVal, setInputVal] = useState('');
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  const handleCopyOfficialPrompt = () => {
    navigator.clipboard?.writeText(OFFICIAL_Q10_LIVE_PROMPT);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim() || isLoading) return;
    const text = inputVal.trim();
    setInputVal('');
    await onSendMessage(text);
  };

  // Simple clean formatter for markdown-style headings and bullets
  const renderFormattedContent = (markdown: string) => {
    const lines = markdown.split('\n');
    return (
      <div className="space-y-2 text-xs leading-relaxed text-slate-200">
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          if (!trimmed) return <div key={idx} className="h-1" />;
          if (trimmed.startsWith('### ')) {
            return (
              <h4
                key={idx}
                className="text-xs font-semibold text-sky-400 pt-2 border-t border-slate-800/80 first:border-t-0 first:pt-0"
              >
                {trimmed.replace('### ', '')}
              </h4>
            );
          }
          if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            return (
              <div key={idx} className="flex items-start gap-2 pl-2">
                <span className="text-sky-400 font-mono select-none">·</span>
                <span
                  dangerouslySetInnerHTML={{
                    __html: trimmed
                      .slice(2)
                      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-slate-100 font-semibold">$1</strong>')
                      .replace(/`(.*?)`/g, '<code class="font-mono text-sky-300 bg-slate-900/90 px-1">$1</code>'),
                  }}
                />
              </div>
            );
          }
          if (/^\d+\.\s/.test(trimmed)) {
            const match = trimmed.match(/^(\d+\.)\s+(.*)$/);
            if (match) {
              return (
                <div key={idx} className="flex items-start gap-2 pl-2">
                  <span className="text-sky-400 font-mono tabular-nums select-none">{match[1]}</span>
                  <span
                    dangerouslySetInnerHTML={{
                      __html: match[2]
                        .replace(/\*\*(.*?)\*\*/g, '<strong class="text-slate-100 font-semibold">$1</strong>')
                        .replace(/`(.*?)`/g, '<code class="font-mono text-sky-300 bg-slate-900/90 px-1">$1</code>'),
                    }}
                  />
                </div>
              );
            }
          }
          return (
            <p
              key={idx}
              dangerouslySetInnerHTML={{
                __html: trimmed
                  .replace(/\*\*(.*?)\*\*/g, '<strong class="text-slate-100 font-semibold">$1</strong>')
                  .replace(/`(.*?)`/g, '<code class="font-mono text-sky-300 bg-slate-900/90 px-1">$1</code>'),
              }}
            />
          );
        })}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left Column (5 cols): Official Q10 Live Demonstration Prompt & Analytical Presets */}
      <div className="lg:col-span-5 space-y-6">
        <section className="border border-slate-800 bg-[#1E293B]/60 p-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-sky-400" />
              <h2 className="text-sm font-semibold text-slate-100">
                Official Q10 Live Demonstration Prompt
              </h2>
            </div>
            <button
              type="button"
              onClick={handleCopyOfficialPrompt}
              className="inline-flex items-center gap-1 text-xs font-mono text-slate-300 hover:text-sky-400 transition-colors cursor-pointer"
            >
              {copiedPrompt ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" /> Copied
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" /> Copy Prompt
                </>
              )}
            </button>
          </div>

          <p className="mt-3 text-xs text-slate-400">
            Exact 7-point structured prompt from Section 2 of the Q10 AI Demonstration brief, constraining the AI to verified workbook fields without inventing thresholds, customer mappings, or latency measurements:
          </p>

          <div className="mt-3 p-3.5 border border-slate-800 bg-[#0F172A] font-mono text-xs text-slate-200 leading-relaxed select-all">
            {OFFICIAL_Q10_LIVE_PROMPT}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              data-testid="btn-execute-official-prompt"
              disabled={isLoading}
              onClick={() => onSendMessage(OFFICIAL_Q10_LIVE_PROMPT)}
              className="w-full py-2.5 px-4 bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-slate-950 font-semibold text-xs inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              {isLoading ? 'Running Grounded Q10 Analysis...' : 'Execute Official Q10 Prompt in Live Chat'}
            </button>
          </div>
        </section>

        {/* Quick Verification Follow-up Queries */}
        <section className="border border-slate-800 bg-[#1E293B]/60 p-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-semibold text-slate-100">
              Workbook Audit & Follow-Up Prompts
            </h3>
            <span className="text-xs font-mono text-slate-400">
              Sliders: &ge;{lossThreshold}% / &ge;{latencyThreshold}ms
            </span>
          </div>

          <div className="mt-3 space-y-2">
            {PRESET_PROMPTS.map((item, i) => (
              <button
                key={i}
                type="button"
                disabled={isLoading}
                onClick={() => onSendMessage(item.prompt)}
                className="w-full text-left p-3 border border-slate-800 hover:border-sky-500/50 bg-[#0F172A]/60 hover:bg-[#0F172A] transition-colors flex items-center justify-between gap-2 cursor-pointer group"
              >
                <span className="text-xs font-medium text-slate-200 group-hover:text-sky-400">
                  {item.label}
                </span>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-sky-400 shrink-0" />
              </button>
            ))}
          </div>

          {/* Direct Workbook Sheet Jump Links */}
          <div className="mt-5 pt-4 border-t border-slate-800">
            <div className="text-xs font-medium text-slate-300 mb-2.5">
              Jump to Raw Sheet Evidence to Verify Claims:
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              {(['Customers', 'Calls', 'NetworkEvents', 'Store_Visits'] as const).map((sheet) => (
                <button
                  key={sheet}
                  type="button"
                  onClick={() => onInspectSheet(sheet)}
                  className="px-3 py-2 border border-slate-800 hover:border-slate-700 bg-[#0F172A]/50 text-slate-300 hover:text-sky-400 flex items-center justify-between cursor-pointer"
                >
                  <span>{sheet}</span>
                  <FileSpreadsheet className="w-3.5 h-3.5 text-slate-500" />
                </button>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* Right Column (7 cols): Interactive AI Demonstration Conversation Stream */}
      <div className="lg:col-span-7 border border-slate-800 bg-[#1E293B]/60 flex flex-col h-[740px]">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-100">
              TelcoX Analytics Assistant (Grounded on 4-Sheet Workbook)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Every quantitative claim is cross-checked against Customers (200), Calls (5,000), NetworkEvents (1,000), and Store_Visits (300)
            </p>
          </div>
          <button
            type="button"
            onClick={onResetChat}
            className="px-2.5 py-1.5 border border-slate-700 hover:border-slate-600 text-xs text-slate-300 inline-flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset Session
          </button>
        </div>

        {/* Message List */}
        <div
          data-testid="chat-messages-container"
          className="flex-1 overflow-y-auto p-5 space-y-5"
        >
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`border p-4 ${
                msg.role === 'user'
                  ? 'border-sky-500/30 bg-sky-950/20 ml-8'
                  : 'border-slate-800 bg-[#0F172A]/80 mr-2'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-2 pb-2 border-b border-slate-800/80">
                <span className={msg.role === 'user' ? 'text-sky-400 font-semibold' : 'text-emerald-400 font-semibold'}>
                  {msg.role === 'user' ? 'ANALYST PROMPT' : `TELCOX AI OUTPUT · ${msg.title || 'VERIFIED ANALYSIS'}`}
                </span>
                <span>{msg.timestamp}</span>
              </div>

              {msg.role === 'user' ? (
                <p className="text-xs font-mono text-slate-200 line-clamp-2 leading-relaxed" title={msg.content}>
                  {msg.content}
                </p>
              ) : (
                <>
                  {renderFormattedContent(msg.content)}

                  {msg.verificationHighlights && msg.verificationHighlights.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {msg.verificationHighlights.map((hl, idx) => (
                        <div key={idx} className="p-2 border border-slate-800/90 bg-[#1E293B]/60">
                          <div className="text-[10px] text-slate-400">{hl.label}</div>
                          <div className="text-xs font-mono font-semibold text-slate-100 tabular-nums mt-0.5">
                            {hl.value}
                          </div>
                          <div className="text-[10px] font-mono text-sky-400 mt-0.5">
                            {hl.sheet}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {msg.citations && msg.citations.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-slate-400">
                      <div>
                        Workbook Citations: {msg.citations.join(' · ')}
                      </div>
                      <button
                        type="button"
                        onClick={() => onInspectSheet('NetworkEvents')}
                        className="text-sky-400 hover:text-sky-300 inline-flex items-center gap-1 cursor-pointer"
                      >
                        Verify in Workbook Explorer <ArrowUpRight className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="border border-slate-800 bg-[#0F172A]/80 p-4 space-y-2 animate-pulse">
              <div className="h-3 w-48 bg-slate-800" />
              <div className="h-3 w-full bg-slate-800" />
              <div className="h-3 w-5/6 bg-slate-800" />
            </div>
          )}
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="p-4 border-t border-slate-800 bg-[#0F172A]/60">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Ask about TelcoX churn (31.0%), call resolution (79.72%), screening rules, or hybrid architecture..."
              className="flex-1 bg-[#0F172A] border border-slate-700 focus:border-sky-400 px-3.5 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={isLoading || !inputVal.trim()}
              className="px-4 py-2.5 bg-sky-500 hover:bg-sky-400 disabled:opacity-40 text-slate-950 font-semibold text-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" /> Ask AI
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
