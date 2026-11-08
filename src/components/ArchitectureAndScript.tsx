import React, { useState } from 'react';
import {
  Zap,
  Database,
  ShieldCheck,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

interface ArchitectureAndScriptProps {
  onNavigateTab: (tab: 'overview' | 'chatbot' | 'workbook' | 'architecture') => void;
  onExecuteOfficialPrompt: () => void;
}

const PRESENTATION_STEPS = [
  {
    id: 'step-1',
    timeRange: '0:00 – 0:30',
    title: '1. Introduce the Purpose & Case Study Scope',
    speakerScript:
      '"In Q10 we use an AI assistant as an analytical copilot on the TelcoX workbook—not to invent policy thresholds or replace engineering judgement, but to classify which TelcoX data belongs in a fast event-driven path versus a scheduled batch path, and then verify every claim against the raw sheets."',
    evidencePoint: '4 sheets: Customers (200), Calls (5,000), NetworkEvents (1,000), Store_Visits (300).',
    targetTab: 'overview' as const,
    ctaLabel: 'Show KPI Overview',
  },
  {
    id: 'step-2',
    timeRange: '0:30 – 1:15',
    title: '2. Run the Structured 7-Point Live Prompt',
    speakerScript:
      '"Here is the exact 7-point prompt we give the AI. Notice that we explicitly forbid inventing thresholds, customer mappings, or latency measurements. The assistant classifies NetworkEvents and active unresolved Calls into the fast path, while Customer master attributes and completed Store_Visits go to the scheduled batch path."',
    evidencePoint: 'Constrained prompt enforces separation between workbook facts and proposed pilot targets.',
    targetTab: 'chatbot' as const,
    ctaLabel: 'Run Live Q10 Prompt in Chat',
  },
  {
    id: 'step-3',
    timeRange: '1:15 – 2:15',
    title: '3. Verify Every Quantitative Claim Against the Workbook',
    speakerScript:
      '"We never accept AI output on trust. Checking the workbook directly: 62 of 200 customers have churn_6mo_flag = 1 (exact 31.0% churn rate); 3,986 of 5,000 calls are resolved (79.72%) and 1,014 are unresolved (20.28%). Using illustrative screening rules of loss_percentage >= 10% and avg_latency_ms >= 200ms flags 463 (46.3%) and 398 (39.8%) network events."',
    evidencePoint: 'All 4 sheets have 100% unique primary keys and zero missing values.',
    targetTab: 'workbook' as const,
    ctaLabel: 'Open Workbook Verification Table',
  },
  {
    id: 'step-4',
    timeRange: '2:15 – 2:45',
    title: '4. Explain Data Quality & Schema Limitations Honestly',
    speakerScript:
      '"The verification step also exposes three critical integration boundaries: first, Calls, NetworkEvents, and Store_Visits mix text dates with Excel serial numbers (like 45850.52083 displayed as ##########); second, NetworkEvents only has cell_id and lacks customer_id, so cell faults cannot be linked to individual customers without a serving-cell session table; third, there is no ingestion_timestamp."',
    evidencePoint: 'Calls: 2,879 text / 2,121 serials · NetworkEvents: 581 text / 418 float serials / 1 int serial.',
    targetTab: 'workbook' as const,
    ctaLabel: 'Inspect Raw Timestamp Formats',
  },
  {
    id: 'step-5',
    timeRange: '2:45 – 3:00',
    title: '5. Conclude with the Hybrid Architecture & Pilot Targets',
    speakerScript:
      '"Therefore, TelcoX should adopt a hybrid architecture: an event-driven fast path targeting under 1 minute for persistent cell-level NOC alerts and under 5 minutes for unresolved support call supervisor alerts, paired with a nightly batch pipeline that standardises timestamps, joins Customer history, and refreshes churn models."',
    evidencePoint: 'Pilot targets (<1 min NOC, <5 min Supervisor, Nightly Batch) clearly labeled as proposed targets.',
    targetTab: 'architecture' as const,
    ctaLabel: 'Review Hybrid Architecture',
  },
];

export const ArchitectureAndScript: React.FC<ArchitectureAndScriptProps> = ({
  onNavigateTab,
  onExecuteOfficialPrompt,
}) => {
  const [activeStepIdx, setActiveStepIdx] = useState(0);

  return (
    <div className="space-y-6">
      {/* Section 4 of Q10 PDF: Hybrid Model & Architecture Diagram */}
      <section className="border border-slate-800 bg-[#1E293B]/60 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3.5">
          <div>
            <h2 className="text-sm font-semibold text-slate-100">
              Section 4: Recommended Hybrid Processing Model & Architecture
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Combining a Fast Event-Driven Path for operational intervention with a Scheduled Batch Path for standardized analytics & churn modeling
            </p>
          </div>
          <span className="text-xs font-mono text-sky-400">
            Proposed Pilot Targets (Not Measured from Workbook)
          </span>
        </div>

        {/* Visual Architecture Flow Grid */}
        <div className="mt-5 grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
          {/* Fast / Event-Driven Path Box */}
          <div className="lg:col-span-5 border border-amber-500/30 bg-[#0F172A]/80 p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <h3 className="text-xs font-semibold text-slate-100 uppercase tracking-wider">
                    Fast / Event-Driven Path
                  </h3>
                </div>
                <span className="text-xs font-mono text-amber-400">&lt;1m NOC · &lt;5m Support</span>
              </div>

              <div className="mt-3 space-y-3 text-xs">
                <div className="p-3 border border-slate-800 bg-[#1E293B]/50">
                  <div className="font-mono text-sky-400 font-semibold">
                    1. NetworkEvents Stream (cell_200–cell_219)
                  </div>
                  <p className="text-slate-300 mt-1">
                    Fields: <code className="font-mono">event_type</code>, <code className="font-mono">cell_id</code>, <code className="font-mono">loss_percentage</code>, <code className="font-mono">avg_latency_ms</code>, <code className="font-mono">event_timestamp</code>
                  </p>
                  <p className="text-amber-300 mt-1 text-[11px]">
                    Action: Validate schema, check cell persistence window, alert NOC &amp; log incident. Target: <strong>Under 1 minute</strong>.
                  </p>
                </div>

                <div className="p-3 border border-slate-800 bg-[#1E293B]/50">
                  <div className="font-mono text-sky-400 font-semibold">
                    2. Active Support Calls Stream
                  </div>
                  <p className="text-slate-300 mt-1">
                    Fields: <code className="font-mono">customer_id</code>, <code className="font-mono">call_reason_tag</code>, <code className="font-mono">resolved_flag = 0</code>, <code className="font-mono">hold_time_sec</code>, <code className="font-mono">transfer_count</code>
                  </p>
                  <p className="text-amber-300 mt-1 text-[11px]">
                    Action: Enrich with customer master profile, alert supervisor for live recovery. Target: <strong>Under 5 minutes</strong>.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              Requires external serving-cell session mapping before cell alerts can notify individual customers.
            </div>
          </div>

          {/* Center Integration Controls Bridge */}
          <div className="lg:col-span-2 border border-slate-800 bg-[#0F172A]/60 p-4 flex flex-col justify-center space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-sky-400">
              <ShieldCheck className="w-4 h-4" />
              <span>Integration Controls</span>
            </div>
            <ul className="space-y-2 text-[11px] text-slate-300 font-mono">
              <li className="p-2 border border-slate-800 bg-[#1E293B]/40">
                1. ISO-8601 Timestamp Normaliser (Text + Serial)
              </li>
              <li className="p-2 border border-slate-800 bg-[#1E293B]/40">
                2. Primary Key Deduplication (call_id, event_id, visit_id)
              </li>
              <li className="p-2 border border-slate-800 bg-[#1E293B]/40">
                3. Persistence Window Filter (Prevent alert storms)
              </li>
              <li className="p-2 border border-slate-800 bg-[#1E293B]/40">
                4. Master Customer Context Lookup
              </li>
            </ul>
          </div>

          {/* Scheduled / Batch Path Box */}
          <div className="lg:col-span-5 border border-sky-500/30 bg-[#0F172A]/80 p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-sky-400" />
                  <h3 className="text-xs font-semibold text-slate-100 uppercase tracking-wider">
                    Scheduled / Batch Path
                  </h3>
                </div>
                <span className="text-xs font-mono text-sky-400">Nightly · Monthly Review</span>
              </div>

              <div className="mt-3 space-y-3 text-xs">
                <div className="p-3 border border-slate-800 bg-[#1E293B]/50">
                  <div className="font-mono text-emerald-400 font-semibold">
                    1. Customer Master Dimension (200 rows)
                  </div>
                  <p className="text-slate-300 mt-1">
                    Fields: <code className="font-mono">plan_type</code>, <code className="font-mono">tenure_months</code>, <code className="font-mono">monthly_spend</code>, <code className="font-mono">nps_score</code>, <code className="font-mono">churn_6mo_flag</code>
                  </p>
                  <p className="text-sky-300 mt-1 text-[11px]">
                    Action: Provide slow-moving reference attributes to enrich active support calls and train 6-month churn models.
                  </p>
                </div>

                <div className="p-3 border border-slate-800 bg-[#1E293B]/50">
                  <div className="font-mono text-emerald-400 font-semibold">
                    2. Multi-Sheet Historical Warehouse (6,300 event rows)
                  </div>
                  <p className="text-slate-300 mt-1">
                    Completed <code className="font-mono">Calls</code> (5,000), <code className="font-mono">Store_Visits</code> (300), and historical <code className="font-mono">NetworkEvents</code> (1,000).
                  </p>
                  <p className="text-sky-300 mt-1 text-[11px]">
                    Action: Standardise mixed timestamps, join customer history, compute weekly features, refresh executive dashboards.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              Batch output updates customer risk scores used by the Fast Path on the next day.
            </div>
          </div>
        </div>
      </section>

      {/* Section 5 of Q10 PDF: 3-Minute Presentation Script Teleprompter */}
      <section className="border border-slate-800 bg-[#1E293B]/60 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3.5">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-sky-400" />
            <h2 className="text-sm font-semibold text-slate-100">
              Section 5: Interactive 3-Minute Presentation Script & Evidence Guide
            </h2>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Step-by-step presenter guide with direct links to live verification views
          </span>
        </div>

        <div className="mt-4 grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Timeline Step List */}
          <div className="lg:col-span-5 space-y-2">
            {PRESENTATION_STEPS.map((st, idx) => (
              <button
                key={st.id}
                type="button"
                onClick={() => setActiveStepIdx(idx)}
                className={`w-full text-left p-3 border transition-colors cursor-pointer flex items-center justify-between gap-3 ${
                  activeStepIdx === idx
                    ? 'border-sky-400 bg-sky-950/30 text-slate-100'
                    : 'border-slate-800 bg-[#0F172A]/60 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="text-[11px] font-mono text-sky-400">{st.timeRange}</div>
                  <div className="text-xs font-semibold mt-0.5">{st.title}</div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </button>
            ))}
          </div>

          {/* Active Script Card */}
          <div className="lg:col-span-7 border border-slate-800 bg-[#0F172A] p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-mono text-sky-400 font-semibold">
                  TIME WINDOW: {PRESENTATION_STEPS[activeStepIdx].timeRange}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  Step {activeStepIdx + 1} of {PRESENTATION_STEPS.length}
                </span>
              </div>

              <h3 className="mt-4 text-base font-semibold text-slate-100">
                {PRESENTATION_STEPS[activeStepIdx].title}
              </h3>

              <blockquote className="mt-3 p-4 border border-slate-800 bg-[#1E293B]/50 text-sm text-slate-200 leading-relaxed italic">
                {PRESENTATION_STEPS[activeStepIdx].speakerScript}
              </blockquote>

              <div className="mt-4 text-xs font-mono text-emerald-400">
                Key Workbook Proof: {PRESENTATION_STEPS[activeStepIdx].evidencePoint}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={activeStepIdx === 0}
                  onClick={() => setActiveStepIdx((i) => Math.max(0, i - 1))}
                  className="px-3 py-1.5 border border-slate-700 disabled:opacity-40 text-xs text-slate-200 cursor-pointer"
                >
                  Previous Segment
                </button>
                <button
                  type="button"
                  disabled={activeStepIdx === PRESENTATION_STEPS.length - 1}
                  onClick={() =>
                    setActiveStepIdx((i) => Math.min(PRESENTATION_STEPS.length - 1, i + 1))
                  }
                  className="px-3 py-1.5 border border-slate-700 disabled:opacity-40 text-xs text-slate-200 cursor-pointer"
                >
                  Next Segment
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  const target = PRESENTATION_STEPS[activeStepIdx].targetTab;
                  if (target === 'chatbot') {
                    onExecuteOfficialPrompt();
                  } else {
                    onNavigateTab(target);
                  }
                }}
                className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold text-xs inline-flex items-center gap-1.5 cursor-pointer"
              >
                {PRESENTATION_STEPS[activeStepIdx].ctaLabel} <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
