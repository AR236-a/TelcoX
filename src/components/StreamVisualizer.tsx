import React from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  StepForward,
  Cpu,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Database,
  Zap,
  ArrowUpRight,
  Activity,
  Lock,
} from 'lucide-react';
import {
  WORKBOOK_SUMMARY_CONSTANTS,
  ScreeningResult,
  StreamRoutedEvent,
  LiveTelemetryWindow,
  AutomatedScreeningDecision,
} from '../utils/telcoxAnalytics';

interface StreamVisualizerProps {
  lossThreshold: number;
  latencyThreshold: number;
  isAutoScreening: boolean;
  onToggleAutoScreening: (auto: boolean) => void;
  automatedDecision: AutomatedScreeningDecision;
  onChangeLossThreshold: (val: number) => void;
  onChangeLatencyThreshold: (val: number) => void;
  onLockQ10Baseline: () => void;
  screeningResult: ScreeningResult;
  streamEvents: StreamRoutedEvent[];
  liveTelemetry: LiveTelemetryWindow;
  isSimulating: boolean;
  streamSpeedMs: number;
  onChangeStreamSpeed: (ms: number) => void;
  onToggleSimulation: () => void;
  onStepSimulation: () => void;
  onResetSimulation: () => void;
  onNavigateTab: (tab: 'overview' | 'chatbot' | 'workbook' | 'architecture') => void;
}

export const StreamVisualizer: React.FC<StreamVisualizerProps> = ({
  lossThreshold,
  latencyThreshold,
  isAutoScreening,
  onToggleAutoScreening,
  automatedDecision,
  onChangeLossThreshold,
  onChangeLatencyThreshold,
  onLockQ10Baseline,
  screeningResult,
  streamEvents,
  liveTelemetry,
  isSimulating,
  streamSpeedMs,
  onChangeStreamSpeed,
  onToggleSimulation,
  onStepSimulation,
  onResetSimulation,
  onNavigateTab,
}) => {
  const fastEvents = streamEvents.filter((e) => e.routingPath === 'FAST_EVENT_DRIVEN');
  const batchEvents = streamEvents.filter((e) => e.routingPath === 'SCHEDULED_BATCH');

  return (
    <div className="space-y-6">
      {/* Executive KPI Strip: Single-elevation 1px border grid, tabular-nums, zero nested cards */}
      <section
        aria-label="Verified Workbook Key Metrics"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 border border-slate-800 bg-[#1E293B]/60 divide-y md:divide-y-0 md:divide-x divide-slate-800"
      >
        <div className="p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Six-Month Customer Churn</span>
            <span className="font-mono text-slate-400">Customers!H2:H201</span>
          </div>
          <div className="mt-3 flex items-baseline gap-3">
            <span className="text-3xl font-bold tracking-tight text-slate-100 font-mono tabular-nums">
              {WORKBOOK_SUMMARY_CONSTANTS.customers.churnRatePct.toFixed(1)}%
            </span>
            <span className="text-xs font-mono tabular-nums text-amber-400">
              62 / 200 churned
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-400">
            138 retained (69.0%) · 200 unique IDs · 0 missing
          </p>
        </div>

        <div className="p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Support Call Resolution</span>
            <span className="font-mono text-slate-400">Calls!G2:G5001</span>
          </div>
          <div className="mt-3 flex items-baseline gap-3">
            <span className="text-3xl font-bold tracking-tight text-slate-100 font-mono tabular-nums">
              {WORKBOOK_SUMMARY_CONSTANTS.calls.resolvedPct.toFixed(2)}%
            </span>
            <span className="text-xs font-mono tabular-nums text-rose-400">
              1,014 unresolved (20.28%)
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-400">
            3,986 resolved of 5,000 calls · 2,121 Excel serial dates
          </p>
        </div>

        <div className="p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2 text-xs text-slate-400">
            <span className="whitespace-nowrap">
              Auto Loss Rule (&ge; {lossThreshold}%)
            </span>
            <span className="font-mono text-slate-400 whitespace-nowrap">NetworkEvents!E2:E1001</span>
          </div>
          <div className="mt-3 flex items-baseline gap-3">
            <span
              data-testid="metric-loss-breach-count"
              className="text-3xl font-bold tracking-tight text-sky-400 font-mono tabular-nums"
            >
              {screeningResult.lossBreachCount}
            </span>
            <span className="text-xs font-mono tabular-nums text-slate-300">
              {screeningResult.lossBreachPct.toFixed(1)}% of 1,000
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-400 font-mono tabular-nums">
            Q10 Baseline (&ge;10%): 463 events (46.3%)
          </p>
        </div>

        <div className="p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2 text-xs text-slate-400">
            <span className="whitespace-nowrap">
              Auto Latency Rule (&ge; {latencyThreshold} ms)
            </span>
            <span className="font-mono text-slate-400 whitespace-nowrap">NetworkEvents!F2:F1001</span>
          </div>
          <div className="mt-3 flex items-baseline gap-3">
            <span
              data-testid="metric-latency-breach-count"
              className="text-3xl font-bold tracking-tight text-amber-400 font-mono tabular-nums"
            >
              {screeningResult.latencyBreachCount}
            </span>
            <span className="text-xs font-mono tabular-nums text-slate-300">
              {screeningResult.latencyBreachPct.toFixed(1)}% of 1,000
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-400 font-mono tabular-nums">
            Q10 Baseline (&ge;200ms): 398 events (39.8%)
          </p>
        </div>
      </section>

      {/* Main Split Grid: Left = Automated Operational Screening System | Right = Live Hybrid Stream Router */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 cols): Automated Operational Screening System & Workbook Distributions */}
        <div className="lg:col-span-5 space-y-6">
          {/* Automated Operational Screening System Panel */}
          <section className="border border-slate-800 bg-[#1E293B]/60 p-5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3.5">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-emerald-400" />
                <h2 className="text-sm font-semibold text-slate-100">
                  Automated Operational Screening System
                </h2>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  data-testid="btn-mode-auto-screening"
                  onClick={() => onToggleAutoScreening(true)}
                  className={`px-2.5 py-1 text-[11px] font-mono transition-colors cursor-pointer ${
                    isAutoScreening
                      ? 'bg-emerald-500 text-slate-950 font-semibold'
                      : 'border border-slate-700 text-slate-300 hover:text-slate-100'
                  }`}
                >
                  Auto-System
                </button>
                <button
                  type="button"
                  data-testid="btn-mode-lock-baseline"
                  onClick={onLockQ10Baseline}
                  className={`px-2.5 py-1 text-[11px] font-mono inline-flex items-center gap-1 transition-colors cursor-pointer ${
                    !isAutoScreening && lossThreshold === 10 && latencyThreshold === 200
                      ? 'bg-sky-500 text-slate-950 font-semibold'
                      : 'border border-slate-700 text-slate-300 hover:text-slate-100'
                  }`}
                >
                  <Lock className="w-3 h-3" /> Lock 10%/200ms
                </button>
              </div>
            </div>

            {/* Active Automated Controller Regime & Telemetry Feedback Loop */}
            <div className="mt-3.5 p-3 border border-slate-800 bg-[#0F172A]/90 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Active Control Regime</span>
                <span
                  data-testid="automated-regime-label"
                  className="font-mono font-semibold text-emerald-400"
                >
                  {isAutoScreening
                    ? automatedDecision.regimeLabel
                    : `Locked Manual Rule (${lossThreshold}% / ${latencyThreshold}ms)`}
                </span>
              </div>

              <div className="grid grid-cols-3 border border-slate-800 bg-[#1E293B]/50 divide-x divide-slate-800 font-mono tabular-nums text-center">
                <div className="p-2">
                  <div className="text-[10px] text-slate-400">Window Avg Loss</div>
                  <div className="text-xs font-semibold text-sky-400 mt-0.5">
                    {automatedDecision.rollingAvgLoss.toFixed(2)}%
                  </div>
                </div>
                <div className="p-2">
                  <div className="text-[10px] text-slate-400">Window Avg Lat</div>
                  <div className="text-xs font-semibold text-amber-400 mt-0.5">
                    {automatedDecision.rollingAvgLatency.toFixed(1)} ms
                  </div>
                </div>
                <div className="p-2">
                  <div className="text-[10px] text-slate-400">NOC Queue Load</div>
                  <div className="text-xs font-semibold text-emerald-400 mt-0.5">
                    {automatedDecision.nocQueueLoadPct}%
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-slate-300 leading-relaxed font-mono">
                {isAutoScreening
                  ? automatedDecision.automationReason
                  : 'Automated regime switching paused. Enforcing fixed operational screening rules across all 1,000 NetworkEvents.'}
              </p>
            </div>

            {/* Automated Threshold Meters (with Manual Override capability if needed) */}
            <div className="mt-4 space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-slate-200">
                    Automated Packet Loss Gate (<span className="font-mono">loss_percentage &ge; {lossThreshold}%</span>)
                  </span>
                  <span className="font-mono tabular-nums text-sky-400">
                    {screeningResult.lossBreachCount} / 1,000 ({screeningResult.lossBreachPct.toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-sky-400 transition-all duration-500"
                    style={{ width: `${Math.min(100, (lossThreshold / 19) * 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] font-mono text-slate-400 mt-1">
                  <span>Auto Range: 9%–12%</span>
                  <span className="text-slate-300">Q10 Baseline: 10% (463 events)</span>
                  <button
                    type="button"
                    onClick={() => onChangeLossThreshold(lossThreshold === 10 ? 12 : 10)}
                    className="text-sky-400 hover:text-sky-300 cursor-pointer"
                  >
                    Step Gate
                  </button>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-slate-200">
                    Automated Latency Gate (<span className="font-mono">avg_latency_ms &ge; {latencyThreshold} ms</span>)
                  </span>
                  <span className="font-mono tabular-nums text-amber-400">
                    {screeningResult.latencyBreachCount} / 1,000 ({screeningResult.latencyBreachPct.toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-amber-400 transition-all duration-500"
                    style={{ width: `${Math.min(100, (latencyThreshold / 300) * 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] font-mono text-slate-400 mt-1">
                  <span>Auto Range: 180–220ms</span>
                  <span className="text-slate-300">Q10 Baseline: 200ms (398 events)</span>
                  <button
                    type="button"
                    onClick={() => onChangeLatencyThreshold(latencyThreshold === 200 ? 220 : 200)}
                    className="text-amber-400 hover:text-amber-300 cursor-pointer"
                  >
                    Step Gate
                  </button>
                </div>
              </div>
            </div>

            {/* Live Automated Rule Execution Log */}
            <div className="mt-5 pt-4 border-t border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-200">
                  Live Automated Screening Decisions
                </span>
                <span className="text-[11px] font-mono text-emerald-400">
                  Auto-Evaluating Stream
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-[11px] font-mono tabular-nums">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400">
                      <th className="py-1.5 font-medium">Event / Cell</th>
                      <th className="py-1.5 font-medium text-right">Measured</th>
                      <th className="py-1.5 font-medium text-right">Auto Gate</th>
                      <th className="py-1.5 font-medium text-right">Automated Route</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {automatedDecision.recentRuleLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-800/40">
                        <td className="py-1.5 text-slate-200">
                          #{log.eventId} · {log.cellId}
                        </td>
                        <td className="py-1.5 text-right text-slate-300">
                          {log.measuredLoss.toFixed(1)}% / {log.measuredLatency.toFixed(0)}ms
                        </td>
                        <td className="py-1.5 text-right text-slate-400">
                          &ge;{lossThreshold}% / &ge;{latencyThreshold}ms
                        </td>
                        <td
                          className={`py-1.5 text-right font-semibold ${
                            log.outcome === 'FAST_NOC_DISPATCH'
                              ? 'text-amber-400'
                              : 'text-sky-400'
                          }`}
                        >
                          {log.outcome === 'FAST_NOC_DISPATCH' ? 'FAST NOC (<1m)' : 'BATCH LOG'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Top 5 Cell Towers by Screening Breaches */}
            <div className="mt-4 pt-3 border-t border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-200">
                  Top Flagged Cells at Active Gate ({lossThreshold}% / {latencyThreshold}ms)
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  No customer_id join
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400">
                      <th className="py-1 font-medium">Cell ID</th>
                      <th className="py-1 font-medium text-right">Events</th>
                      <th className="py-1 font-medium text-right">Loss &ge;{lossThreshold}%</th>
                      <th className="py-1 font-medium text-right">Lat &ge;{latencyThreshold}ms</th>
                      <th className="py-1 font-medium text-right">Max Lat</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono tabular-nums">
                    {screeningResult.byCellTop5.map((cell) => (
                      <tr key={cell.cell_id} className="hover:bg-slate-800/40">
                        <td className="py-1 text-slate-200">{cell.cell_id}</td>
                        <td className="py-1 text-right text-slate-300">{cell.total}</td>
                        <td className="py-1 text-right text-sky-400">{cell.lossBreaches}</td>
                        <td className="py-1 text-right text-amber-400">{cell.latencyBreaches}</td>
                        <td className="py-1 text-right text-slate-300">{cell.maxLatency.toFixed(1)}ms</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Network Event Mix & Timestamp Quality Visualization */}
          <section className="border border-slate-800 bg-[#1E293B]/60 p-5 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-sm font-semibold text-slate-100">
                Network Event Mix &amp; Timestamp Format Audit
              </h2>
              <span className="text-xs font-mono text-slate-400">6,500 Total Rows</span>
            </div>

            {/* Event Mix Horizontal Proportional Bars */}
            <div className="space-y-2.5">
              <div className="text-xs text-slate-300 flex justify-between">
                <span>NetworkEvents!D2:D1001 Mix</span>
                <span className="font-mono text-slate-400">1,000 events across 20 cells</span>
              </div>
              <div className="space-y-2 font-mono text-xs tabular-nums">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-200">packet_loss</span>
                    <span className="text-sky-400">340 (34.0%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 overflow-hidden">
                    <div className="h-full bg-sky-400" style={{ width: '34.0%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-200">latency_spike</span>
                    <span className="text-amber-400">336 (33.6%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 overflow-hidden">
                    <div className="h-full bg-amber-400" style={{ width: '33.6%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-200">throughput_drop</span>
                    <span className="text-emerald-400">324 (32.4%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 overflow-hidden">
                    <div className="h-full bg-emerald-400" style={{ width: '32.4%' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Mixed Timestamp Encoding Table */}
            <div className="pt-3 border-t border-slate-800">
              <div className="text-xs text-slate-300 mb-2 flex items-center justify-between">
                <span>Mixed Timestamp Storage (2025-01-06 to 2025-12-06)</span>
                <button
                  type="button"
                  onClick={() => onNavigateTab('workbook')}
                  className="text-sky-400 hover:text-sky-300 inline-flex items-center gap-1 cursor-pointer"
                >
                  Inspect Raw Sheets <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="py-1.5 font-medium">Workbook Sheet</th>
                    <th className="py-1.5 font-medium text-right">Text String</th>
                    <th className="py-1.5 font-medium text-right">Excel Serial (###)</th>
                    <th className="py-1.5 font-medium text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono tabular-nums">
                  <tr>
                    <td className="py-1.5 text-slate-200">Calls</td>
                    <td className="py-1.5 text-right text-slate-300">2,879</td>
                    <td className="py-1.5 text-right text-amber-400">2,121</td>
                    <td className="py-1.5 text-right text-slate-100">5,000</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 text-slate-200">NetworkEvents</td>
                    <td className="py-1.5 text-right text-slate-300">581</td>
                    <td className="py-1.5 text-right text-amber-400">419 (418+1 int)</td>
                    <td className="py-1.5 text-right text-slate-100">1,000</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 text-slate-200">Store_Visits</td>
                    <td className="py-1.5 text-right text-slate-300">177</td>
                    <td className="py-1.5 text-right text-amber-400">123</td>
                    <td className="py-1.5 text-right text-slate-100">300</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* Right Column (7 cols): Live Automatic Real-Time Hybrid Routing Simulator */}
        <div className="lg:col-span-7 flex flex-col border border-slate-800 bg-[#1E293B]/60 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3.5">
            <div>
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                <h2 className="text-sm font-semibold text-slate-100">
                  Real-Time Hybrid Ingestion &amp; Routing Stream
                </h2>
                <span className="text-xs font-mono text-emerald-400">
                  {isSimulating ? '· AUTO-STREAMING LIVE' : '· PAUSED'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Automatically streaming workbook records through ISO-8601 timestamp normalisation &amp; automated screening gates
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* Stream Speed Selector */}
              <div className="flex items-center border border-slate-700 bg-[#0F172A]">
                {[
                  { label: '1x', ms: 1000 },
                  { label: '2x', ms: 500 },
                  { label: '4x', ms: 250 },
                ].map((spd) => (
                  <button
                    key={spd.label}
                    type="button"
                    onClick={() => onChangeStreamSpeed(spd.ms)}
                    className={`px-2 py-1 text-[11px] font-mono transition-colors cursor-pointer ${
                      streamSpeedMs === spd.ms
                        ? 'bg-sky-500 text-slate-950 font-semibold'
                        : 'text-slate-300 hover:text-slate-100'
                    }`}
                  >
                    {spd.label}
                  </button>
                ))}
              </div>

              <button
                type="button"
                data-testid="btn-toggle-simulation"
                onClick={onToggleSimulation}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                  isSimulating
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                    : 'bg-sky-500 hover:bg-sky-400 text-slate-950'
                }`}
              >
                {isSimulating ? (
                  <>
                    <Pause className="w-3.5 h-3.5" /> Pause Live Stream
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" /> Resume Live Stream
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={onStepSimulation}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium border border-slate-700 hover:border-slate-600 text-slate-200 transition-colors cursor-pointer"
                title="Step next workbook event"
              >
                <StepForward className="w-3.5 h-3.5" /> Step
              </button>
              <button
                type="button"
                onClick={onResetSimulation}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium border border-slate-700 hover:border-slate-600 text-slate-300 transition-colors cursor-pointer"
                title="Reset stream replay"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Live Accumulating Session Telemetry Strip */}
          <div className="mt-3.5 grid grid-cols-2 sm:grid-cols-5 border border-slate-800 bg-[#0F172A]/90 divide-y sm:divide-y-0 sm:divide-x divide-slate-800 font-mono tabular-nums">
            <div className="p-2.5">
              <div className="text-[10px] text-slate-400">Records Streamed</div>
              <div data-testid="live-total-processed" className="text-sm font-semibold text-slate-100 mt-0.5">
                {liveTelemetry.totalProcessed}
              </div>
            </div>
            <div className="p-2.5">
              <div className="text-[10px] text-slate-400">NOC Alerts (&lt;1m)</div>
              <div className="text-sm font-semibold text-amber-400 mt-0.5">
                {liveTelemetry.fastNocAlerts}
              </div>
            </div>
            <div className="p-2.5">
              <div className="text-[10px] text-slate-400">Support Alerts (&lt;5m)</div>
              <div className="text-sm font-semibold text-rose-400 mt-0.5">
                {liveTelemetry.fastSupervisorAlerts}
              </div>
            </div>
            <div className="p-2.5">
              <div className="text-[10px] text-slate-400">Batch Queued</div>
              <div className="text-sm font-semibold text-sky-400 mt-0.5">
                {liveTelemetry.batchQueued}
              </div>
            </div>
            <div className="p-2.5">
              <div className="text-[10px] text-slate-400">Serials Normalized</div>
              <div className="text-sm font-semibold text-emerald-400 mt-0.5">
                {liveTelemetry.serialTimestampsNormalized}
              </div>
            </div>
          </div>

          {/* Real-Time Rolling NetworkEvents Waveform / Bar Chart */}
          <div className="mt-3.5 p-3.5 border border-slate-800 bg-[#0F172A]/80">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs mb-2">
              <span className="font-medium text-slate-200">
                Live Cell Telemetry Window (Latest {liveTelemetry.recentNetworkSeries.length} NetworkEvents vs. Automated Gates)
              </span>
              <span className="font-mono text-[11px] text-slate-400 tabular-nums">
                Sky = Loss (&ge;{lossThreshold}%) · Amber = Latency (&ge;{latencyThreshold}ms)
              </span>
            </div>

            <div className="grid grid-cols-16 gap-1.5 items-end h-20 pt-2 px-1 border-b border-slate-800">
              {liveTelemetry.recentNetworkSeries.map((pt) => {
                const lossHeightPct = Math.min(100, Math.max(10, (pt.loss_percentage / 20) * 100));
                const latHeightPct = Math.min(100, Math.max(10, (pt.avg_latency_ms / 320) * 100));
                return (
                  <div
                    key={pt.event_id}
                    className="flex flex-col items-center gap-1 h-full justify-end group"
                    title={`${pt.cell_id} (#${pt.event_id}): loss=${pt.loss_percentage}%, latency=${pt.avg_latency_ms}ms`}
                  >
                    <div className="w-full flex items-end justify-center gap-0.5 h-14">
                      <div
                        className={`w-1.5 transition-all duration-300 ${
                          pt.isLossBreach ? 'bg-sky-400' : 'bg-slate-700'
                        }`}
                        style={{ height: `${lossHeightPct}%` }}
                      />
                      <div
                        className={`w-1.5 transition-all duration-300 ${
                          pt.isLatencyBreach ? 'bg-amber-400' : 'bg-slate-600'
                        }`}
                        style={{ height: `${latHeightPct}%` }}
                      />
                    </div>
                    <span className="text-[9px] font-mono text-slate-400 truncate max-w-full">
                      {pt.cell_id.replace('cell_', 'c')}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Honest Case Study Boundary Notice */}
          <div className="mt-3.5 px-3.5 py-2 border border-amber-500/30 bg-amber-500/10 flex items-start gap-2.5 text-xs text-amber-200">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Case Study Verification Boundary:</span> The Excel file is a historical 2025 dataset without <span className="font-mono">ingestion_timestamp</span>. Response targets below (<span className="font-mono">&lt;1 min</span> NOC alert, <span className="font-mono">&lt;5 min</span> supervisor alert) are <strong>proposed pilot targets</strong>, not measured latency from the workbook.
            </div>
          </div>

          {/* Two-Lane Routing View: Fast Event-Driven Path vs Scheduled Batch Path */}
          <div className="mt-3.5 grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
            {/* Lane 1: Fast / Event-Driven Path */}
            <div className="border border-slate-800 bg-[#0F172A]/70 flex flex-col">
              <div className="px-3.5 py-2.5 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-semibold text-slate-100">
                    Fast / Event-Driven Path
                  </span>
                </div>
                <span className="text-xs font-mono tabular-nums text-amber-400">
                  {fastEvents.length} in window · Pilot &lt;1m / &lt;5m
                </span>
              </div>

              <div className="p-3 space-y-2.5 overflow-y-auto max-h-[380px]">
                {fastEvents.length === 0 ? (
                  <div className="py-12 text-center text-xs text-slate-400">
                    No fast-path breaches in current replay window. Wait for next automatic stream tick.
                  </div>
                ) : (
                  fastEvents.map((ev) => (
                    <div
                      key={ev.id}
                      className="p-3 border border-slate-800 bg-[#1E293B]/70 space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="text-sky-400">
                          {ev.sourceSheet} #{ev.recordId} · {ev.entityKey}
                        </span>
                        <span
                          className={
                            ev.severity === 'critical' ? 'text-rose-400' : 'text-amber-400'
                          }
                        >
                          {ev.targetSla}
                        </span>
                      </div>
                      <div className="text-xs font-medium text-slate-100">{ev.summary}</div>
                      <div className="text-xs font-mono tabular-nums text-slate-300">
                        {ev.metricLabel}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800/80">
                        <span>Raw TS: {ev.rawTimestamp}</span>
                        <span className="font-mono text-slate-300">
                          ISO: {ev.standardizedTimestamp.slice(0, 16)}
                        </span>
                      </div>
                      <div className="text-[11px] text-emerald-400">
                        Action: {ev.actionRequired}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Lane 2: Scheduled / Batch Path */}
            <div className="border border-slate-800 bg-[#0F172A]/70 flex flex-col">
              <div className="px-3.5 py-2.5 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-sky-400" />
                  <span className="text-xs font-semibold text-slate-100">
                    Scheduled / Batch Path
                  </span>
                </div>
                <span className="text-xs font-mono tabular-nums text-sky-400">
                  {batchEvents.length} in window · Nightly Refresh
                </span>
              </div>

              <div className="p-3 space-y-2.5 overflow-y-auto max-h-[380px]">
                {batchEvents.length === 0 ? (
                  <div className="py-12 text-center text-xs text-slate-400">
                    No batch records in current replay window.
                  </div>
                ) : (
                  batchEvents.map((ev) => (
                    <div
                      key={ev.id}
                      className="p-3 border border-slate-800 bg-[#1E293B]/40 space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="text-slate-300">
                          {ev.sourceSheet} #{ev.recordId} · {ev.entityKey}
                        </span>
                        <span className="text-slate-400">{ev.targetSla}</span>
                      </div>
                      <div className="text-xs font-medium text-slate-200">{ev.summary}</div>
                      <div className="text-xs font-mono tabular-nums text-slate-300">
                        {ev.metricLabel}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800/80">
                        <span>Raw TS: {ev.rawTimestamp}</span>
                        <span className="font-mono text-slate-300">
                          ISO: {ev.standardizedTimestamp.slice(0, 16)}
                        </span>
                      </div>
                      <div className="text-[11px] text-sky-400">
                        Action: {ev.actionRequired}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Bottom Summary Footer of Simulator */}
          <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
            <div className="flex items-center gap-4">
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Timestamp Normaliser Active (Text + Excel Serials)
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-sky-400" />
                Automated Screening Controller Enabled
              </span>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab('chatbot')}
              className="text-sky-400 hover:text-sky-300 font-medium inline-flex items-center gap-1 cursor-pointer"
            >
              Open Interactive Q10 AI Assistant <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
