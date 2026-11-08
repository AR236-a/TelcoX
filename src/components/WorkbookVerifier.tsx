import React, { useState, useMemo } from 'react';
import {
  Search,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  FileText,
  X,
} from 'lucide-react';
import {
  VERIFICATION_AUDIT_CHECKS,
  AUTHENTIC_CUSTOMER_ROWS,
  AUTHENTIC_CALL_ROWS,
  CALIBRATED_NETWORK_EVENTS,
  AUTHENTIC_STORE_VISIT_ROWS,
} from '../utils/telcoxAnalytics';

interface WorkbookVerifierProps {
  activeSheet: 'Customers' | 'Calls' | 'NetworkEvents' | 'Store_Visits';
  onSelectSheet: (sheet: 'Customers' | 'Calls' | 'NetworkEvents' | 'Store_Visits') => void;
  lossThreshold: number;
  latencyThreshold: number;
}

export const WorkbookVerifier: React.FC<WorkbookVerifierProps> = ({
  activeSheet,
  onSelectSheet,
  lossThreshold,
  latencyThreshold,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showStandardizedTs, setShowStandardizedTs] = useState(false);
  const [activePdfAsset, setActivePdfAsset] = useState<string | null>(null);

  const filteredCustomers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return AUTHENTIC_CUSTOMER_ROWS;
    return AUTHENTIC_CUSTOMER_ROWS.filter(
      (r) =>
        String(r.customer_id).includes(q) ||
        r.phone_number.includes(q) ||
        r.segment.toLowerCase().includes(q) ||
        r.plan_type.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const filteredCalls = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return AUTHENTIC_CALL_ROWS;
    return AUTHENTIC_CALL_ROWS.filter(
      (r) =>
        String(r.call_id).includes(q) ||
        String(r.customer_id).includes(q) ||
        r.call_reason_tag.toLowerCase().includes(q) ||
        r.agent_id.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const filteredNetworkEvents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const subset = CALIBRATED_NETWORK_EVENTS.slice(0, 50);
    if (!q) return subset;
    return CALIBRATED_NETWORK_EVENTS.filter(
      (r) =>
        String(r.event_id).includes(q) ||
        r.cell_id.toLowerCase().includes(q) ||
        r.event_type.toLowerCase().includes(q)
    ).slice(0, 50);
  }, [searchQuery]);

  const filteredStoreVisits = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return AUTHENTIC_STORE_VISIT_ROWS;
    return AUTHENTIC_STORE_VISIT_ROWS.filter(
      (r) =>
        String(r.visit_id).includes(q) ||
        String(r.customer_id).includes(q) ||
        r.store_id.toLowerCase().includes(q) ||
        r.issue_type.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  return (
    <div className="space-y-6">
      {/* Section 3 of Q10 PDF: Verification of AI Output Against the Workbook */}
      <section className="border border-slate-800 bg-[#1E293B]/60 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3.5">
          <div>
            <h2 className="text-sm font-semibold text-slate-100">
              Section 3: Verification of AI Output Against the TelcoX Workbook
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Every statistic in the AI demonstration is cross-examined directly against the four Excel sheets so nothing is accepted on trust
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                setActivePdfAsset('/assets/aistudio/Q10_TelcoX_AI_Demonstration-1_cdf47eeb.pdf')
              }
              className="px-3 py-1.5 border border-slate-700 hover:border-sky-400 text-xs text-slate-200 inline-flex items-center gap-1.5 cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-sky-400" /> View Q10 Brief PDF
            </button>
            <button
              type="button"
              onClick={() =>
                setActivePdfAsset(
                  '/assets/aistudio/Case_Study_1-_DIAI_framework_-_TelcoX_Case_Study_Data_f25f4082.pdf'
                )
              }
              className="px-3 py-1.5 border border-slate-700 hover:border-sky-400 text-xs text-slate-200 inline-flex items-center gap-1.5 cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" /> View Workbook Data PDF
            </button>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="py-2.5 pr-4 font-medium">AI Claim</th>
                <th className="py-2.5 px-4 font-medium">Workbook Check Performed</th>
                <th className="py-2.5 px-4 font-medium">Verified Result</th>
                <th className="py-2.5 px-4 font-medium text-right">Exact Value</th>
                <th className="py-2.5 pl-4 font-medium text-right">Sheet Reference</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {VERIFICATION_AUDIT_CHECKS.map((chk) => (
                <tr key={chk.id} className="hover:bg-slate-800/30">
                  <td className="py-3 pr-4 font-medium text-slate-100 whitespace-nowrap">
                    {chk.aiClaim}
                  </td>
                  <td className="py-3 px-4 text-slate-300">{chk.workbookCheckFormula}</td>
                  <td className="py-3 px-4 text-slate-200">{chk.verifiedResult}</td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums text-sky-400 whitespace-nowrap">
                    {chk.exactNumericValue}
                  </td>
                  <td className="py-3 pl-4 text-right font-mono text-slate-400 whitespace-nowrap">
                    {chk.sheetReference}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Interactive 4-Sheet Workbook Inspector */}
      <section className="border border-slate-800 bg-[#1E293B]/60 p-5">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
          {/* Sheet Selector Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            {(
              [
                { id: 'Customers', label: 'Customers (200 rows)' },
                { id: 'Calls', label: 'Calls (5,000 rows)' },
                { id: 'NetworkEvents', label: 'NetworkEvents (1,000 rows)' },
                { id: 'Store_Visits', label: 'Store_Visits (300 rows)' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                data-testid={`sheet-tab-${tab.id}`}
                onClick={() => onSelectSheet(tab.id)}
                className={`px-3.5 py-2 text-xs font-mono transition-colors cursor-pointer ${
                  activeSheet === tab.id
                    ? 'bg-sky-500 text-slate-950 font-semibold'
                    : 'border border-slate-800 bg-[#0F172A]/60 text-slate-300 hover:border-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search & Timestamp Format Toggle */}
          <div className="flex flex-wrap items-center gap-3">
            {activeSheet !== 'Customers' && (
              <button
                type="button"
                onClick={() => setShowStandardizedTs((prev) => !prev)}
                className="px-3 py-1.5 border border-slate-700 hover:border-sky-400 text-xs font-mono text-slate-200 cursor-pointer"
              >
                {showStandardizedTs
                  ? 'Showing: Standardized ISO-8601 UTC'
                  : 'Showing: Raw Workbook Timestamps (Text + Serial ###)'}
              </button>
            )}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Filter ${activeSheet} rows...`}
                className="bg-[#0F172A] border border-slate-700 focus:border-sky-400 pl-8 pr-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Sheet Contextual Schema Note */}
        <div className="mt-3 px-3.5 py-2 border border-slate-800 bg-[#0F172A]/60 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-300">
          {activeSheet === 'Customers' && (
            <>
              <span>
                <strong>Customers!A1:H201</strong> · Primary Key: <code className="font-mono text-sky-400">customer_id</code> (1001–1200) · Joins to <code className="font-mono">Calls</code> &amp; <code className="font-mono">Store_Visits</code>
              </span>
              <span className="font-mono text-amber-400">
                Verified: 62 churn_6mo_flag=1 / 200 rows (31.0%)
              </span>
            </>
          )}
          {activeSheet === 'Calls' && (
            <>
              <span>
                <strong>Calls!A1:I5001</strong> · Primary Key: <code className="font-mono text-sky-400">call_id</code> (20001–25000) · Foreign Key: <code className="font-mono text-emerald-400">customer_id</code>
              </span>
              <span className="font-mono text-amber-400">
                2,879 text dates + 2,121 Excel serial floats (##########)
              </span>
            </>
          )}
          {activeSheet === 'NetworkEvents' && (
            <>
              <span>
                <strong>NetworkEvents!A1:F1001</strong> · Primary Key: <code className="font-mono text-sky-400">event_id</code> (30001–31000) · Entity Key: <code className="font-mono text-amber-400">cell_id</code> (cell_200–cell_219, NO customer_id)
              </span>
              <span className="font-mono text-sky-400">
                581 text + 418 float serials + 1 integer serial (event_id 30011)
              </span>
            </>
          )}
          {activeSheet === 'Store_Visits' && (
            <>
              <span>
                <strong>Store_Visits!A1:G301</strong> · Primary Key: <code className="font-mono text-sky-400">visit_id</code> (40001–40300) · Foreign Key: <code className="font-mono text-emerald-400">customer_id</code>
              </span>
              <span className="font-mono text-amber-400">
                177 text dates + 123 Excel serial floats · Completed visit_duration_min only
              </span>
            </>
          )}
        </div>

        {/* High-Density Data Grid */}
        <div className="mt-4 overflow-x-auto max-h-[420px]">
          {activeSheet === 'Customers' && (
            <table className="w-full text-left border-collapse text-xs font-mono tabular-nums">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="py-2 pr-3">customer_id</th>
                  <th className="py-2 px-3">phone_number</th>
                  <th className="py-2 px-3">segment</th>
                  <th className="py-2 px-3 text-right">monthly_spend</th>
                  <th className="py-2 px-3 text-right">tenure_months</th>
                  <th className="py-2 px-3">plan_type</th>
                  <th className="py-2 px-3 text-right">nps_score</th>
                  <th className="py-2 pl-3 text-right">churn_6mo_flag</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredCustomers.map((row) => (
                  <tr key={row.customer_id} className="hover:bg-slate-800/40">
                    <td className="py-2 pr-3 text-sky-400">{row.customer_id}</td>
                    <td className="py-2 px-3 text-slate-300">{row.phone_number}</td>
                    <td className="py-2 px-3 text-slate-200">{row.segment}</td>
                    <td className="py-2 px-3 text-right text-slate-200">${row.monthly_spend.toFixed(2)}</td>
                    <td className="py-2 px-3 text-right text-slate-300">{row.tenure_months}</td>
                    <td className="py-2 px-3 text-slate-200">{row.plan_type}</td>
                    <td className="py-2 px-3 text-right text-slate-300">{row.nps_score}</td>
                    <td
                      className={`py-2 pl-3 text-right font-semibold ${
                        row.churn_6mo_flag === 1 ? 'text-rose-400' : 'text-emerald-400'
                      }`}
                    >
                      {row.churn_6mo_flag}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeSheet === 'Calls' && (
            <table className="w-full text-left border-collapse text-xs font-mono tabular-nums">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="py-2 pr-3">call_id</th>
                  <th className="py-2 px-3">customer_id</th>
                  <th className="py-2 px-3">call_timestamp</th>
                  <th className="py-2 px-3">format</th>
                  <th className="py-2 px-3 text-right">call_duration_sec</th>
                  <th className="py-2 px-3">call_reason_tag</th>
                  <th className="py-2 px-3">agent_id</th>
                  <th className="py-2 px-3 text-right">resolved_flag</th>
                  <th className="py-2 px-3 text-right">hold_time_sec</th>
                  <th className="py-2 pl-3 text-right">transfer_count</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredCalls.map((row) => (
                  <tr key={row.call_id} className="hover:bg-slate-800/40">
                    <td className="py-2 pr-3 text-sky-400">{row.call_id}</td>
                    <td className="py-2 px-3 text-emerald-400">{row.customer_id}</td>
                    <td className="py-2 px-3 text-slate-200">
                      {showStandardizedTs ? row.call_timestamp_iso : row.call_timestamp_raw}
                    </td>
                    <td
                      className={`py-2 px-3 ${
                        row.timestamp_format === 'excel_serial' ? 'text-amber-400' : 'text-slate-400'
                      }`}
                    >
                      {row.timestamp_format}
                    </td>
                    <td className="py-2 px-3 text-right text-slate-300">{row.call_duration_sec}</td>
                    <td className="py-2 px-3 text-slate-200">{row.call_reason_tag}</td>
                    <td className="py-2 px-3 text-slate-300">{row.agent_id}</td>
                    <td
                      className={`py-2 px-3 text-right font-semibold ${
                        row.resolved_flag === 1 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {row.resolved_flag}
                    </td>
                    <td className="py-2 px-3 text-right text-slate-300">{row.hold_time_sec}</td>
                    <td className="py-2 pl-3 text-right text-slate-300">{row.transfer_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeSheet === 'NetworkEvents' && (
            <table className="w-full text-left border-collapse text-xs font-mono tabular-nums">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="py-2 pr-3">event_id</th>
                  <th className="py-2 px-3">cell_id</th>
                  <th className="py-2 px-3">event_timestamp</th>
                  <th className="py-2 px-3">format</th>
                  <th className="py-2 px-3">event_type</th>
                  <th className="py-2 px-3 text-right">loss_percentage</th>
                  <th className="py-2 px-3 text-right">avg_latency_ms</th>
                  <th className="py-2 pl-3 text-right">Screening (&ge;{lossThreshold}% / &ge;{latencyThreshold}ms)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredNetworkEvents.map((row) => {
                  const lossBreach = row.loss_percentage >= lossThreshold;
                  const latBreach = row.avg_latency_ms >= latencyThreshold;
                  return (
                    <tr key={row.event_id} className="hover:bg-slate-800/40">
                      <td className="py-2 pr-3 text-sky-400">{row.event_id}</td>
                      <td className="py-2 px-3 text-slate-200">{row.cell_id}</td>
                      <td className="py-2 px-3 text-slate-200">
                        {showStandardizedTs ? row.event_timestamp_iso : row.event_timestamp_raw}
                      </td>
                      <td
                        className={`py-2 px-3 ${
                          row.timestamp_format !== 'text' ? 'text-amber-400' : 'text-slate-400'
                        }`}
                      >
                        {row.timestamp_format}
                      </td>
                      <td className="py-2 px-3 text-slate-200">{row.event_type}</td>
                      <td
                        className={`py-2 px-3 text-right ${
                          lossBreach ? 'text-sky-400 font-semibold' : 'text-slate-300'
                        }`}
                      >
                        {row.loss_percentage.toFixed(2)}%
                      </td>
                      <td
                        className={`py-2 px-3 text-right ${
                          latBreach ? 'text-amber-400 font-semibold' : 'text-slate-300'
                        }`}
                      >
                        {row.avg_latency_ms.toFixed(1)} ms
                      </td>
                      <td className="py-2 pl-3 text-right">
                        {lossBreach || latBreach ? (
                          <span className="text-amber-400 inline-flex items-center gap-1 justify-end">
                            <AlertTriangle className="w-3 h-3" /> Fast Path
                          </span>
                        ) : (
                          <span className="text-slate-400 inline-flex items-center gap-1 justify-end">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Batch
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {activeSheet === 'Store_Visits' && (
            <table className="w-full text-left border-collapse text-xs font-mono tabular-nums">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="py-2 pr-3">visit_id</th>
                  <th className="py-2 px-3">customer_id</th>
                  <th className="py-2 px-3">store_id</th>
                  <th className="py-2 px-3">visit_timestamp</th>
                  <th className="py-2 px-3">format</th>
                  <th className="py-2 px-3 text-right">visit_duration_min</th>
                  <th className="py-2 px-3">issue_type</th>
                  <th className="py-2 pl-3 text-right">purchase_value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredStoreVisits.map((row) => (
                  <tr key={row.visit_id} className="hover:bg-slate-800/40">
                    <td className="py-2 pr-3 text-sky-400">{row.visit_id}</td>
                    <td className="py-2 px-3 text-emerald-400">{row.customer_id}</td>
                    <td className="py-2 px-3 text-slate-200">{row.store_id}</td>
                    <td className="py-2 px-3 text-slate-200">
                      {showStandardizedTs ? row.visit_timestamp_iso : row.visit_timestamp_raw}
                    </td>
                    <td
                      className={`py-2 px-3 ${
                        row.timestamp_format === 'excel_serial' ? 'text-amber-400' : 'text-slate-400'
                      }`}
                    >
                      {row.timestamp_format}
                    </td>
                    <td className="py-2 px-3 text-right text-slate-300">{row.visit_duration_min}</td>
                    <td className="py-2 px-3 text-slate-200">{row.issue_type}</td>
                    <td className="py-2 pl-3 text-right text-slate-200">${row.purchase_value.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* In-App PDF Reference Modal (avoids window.open in iframe) */}
      {activePdfAsset && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 flex items-center justify-center p-6">
          <div className="w-full max-w-5xl h-[85vh] border border-slate-700 bg-[#0F172A] flex flex-col">
            <div className="p-3.5 border-b border-slate-800 flex items-center justify-between">
              <span className="text-xs font-mono text-slate-200">
                Attached Case Study Document: {activePdfAsset}
              </span>
              <button
                type="button"
                onClick={() => setActivePdfAsset(null)}
                className="p-1 text-slate-400 hover:text-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <iframe
              src={activePdfAsset}
              title="TelcoX Case Study PDF Document"
              className="w-full flex-1 bg-slate-900"
            />
          </div>
        </div>
      )}
    </div>
  );
};
