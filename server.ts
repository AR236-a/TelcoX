import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import {
  OFFICIAL_Q10_LIVE_PROMPT,
  WORKBOOK_SUMMARY_CONSTANTS,
  VERIFICATION_AUDIT_CHECKS,
  buildGroundedQ10Response,
} from './src/utils/telcoxAnalytics.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SYSTEM_INSTRUCTION = `You are the TelcoX Q10 Telecommunications Analytics Assistant demonstrating Real-Time versus Batch Processing on the "Case Study 1 - DIAI framework - TelcoX Case Study Data.xlsx" workbook.

STRICT CASE STUDY FACTS & VERIFICATION BOUNDARIES (NEVER VIOLATE OR INVENT):
1. Four Workbook Sheets & Exact Record Counts (0 missing values, 100% unique primary keys):
   - Customers (Customers!A1:H201): 200 rows (customer_id 1001–1200). Fields: customer_id, phone_number, segment (consumer, smallbiz), monthly_spend, tenure_months, plan_type (prepaid, unlimited, enterprise), nps_score, churn_6mo_flag.
     * Verified Churn Rate: 62 of 200 customers have churn_6mo_flag = 1 -> 31.0% six-month churn rate (138 retained = 69.0%).
   - Calls (Calls!A1:I5001): 5,000 rows (call_id 20001–25000). Fields: call_id, customer_id, call_timestamp, call_duration_sec, call_reason_tag (billing, upgrade, device, network), agent_id, resolved_flag, hold_time_sec, transfer_count.
     * Verified Call Resolution Rate: 3,986 resolved (79.72%) and 1,014 unresolved (20.28%).
     * Timestamp Mix: 2,879 text dates ("DD-MM-YYYY HH:MM") and 2,121 numeric Excel serial values (displayed as ########## in narrow Excel columns). Parsed range: 2025-01-06 to 2025-12-06.
   - NetworkEvents (NetworkEvents!A1:F1001): 1,000 rows (event_id 30001–31000) across 20 cells (cell_200 to cell_219). Fields: event_id, cell_id, event_timestamp, event_type, loss_percentage, avg_latency_ms.
     * Verified Event Mix: 340 packet_loss (34.0%), 336 latency_spike (33.6%), and 324 throughput_drop (32.4%).
     * Illustrative Operational Screening Rules (MUST be explicitly labeled as illustrative screening rules for demonstration, NOT company-approved TelcoX policy limits):
       - loss_percentage >= 10%: 463 of 1,000 events (46.3%).
       - avg_latency_ms >= 200 ms: 398 of 1,000 events (39.8%).
     * Timestamp Mix: 581 text dates, 418 float Excel serial values, 1 integer serial value (event_id 30011). Parsed range: 2025-01-06 to 2025-12-06.
   - Store_Visits (Store_Visits!A1:G301): 300 rows (visit_id 40001–40300) across store_A, store_B, store_C. Fields: visit_id, customer_id, store_id, visit_timestamp, visit_duration_min, issue_type (support, billing, device, plan_change), purchase_value.
     * Timestamp Mix: 177 text dates and 123 Excel serial values. Parsed range: 2025-01-06 to 2025-12-06.

2. Critical Schema & Real-Time Integration Limitations:
   - Historical Log Only: The workbook is a 2025 historical dataset, NOT a live telemetry stream. It has event occurrence timestamps but NO ingestion_timestamp, so end-to-end processing latency CANNOT be measured from the workbook.
   - Missing Cross-Sheet Link (cell_id vs customer_id): Calls and Store_Visits join to Customers via customer_id. NetworkEvents ONLY has cell_id (cell_200–cell_219) and has NO customer_id or serving-cell/session mapping table. Therefore, cell-level network faults cannot be attributed directly to named customers from this workbook alone.
   - Store Visits: Contains completed visit_duration_min, NOT live queue wait_time_minutes.

3. Recommended Hybrid Architecture & Pilot Response-Time Targets (Proposed targets, not measured from workbook):
   - Fast / Event-Driven Path:
     * NetworkEvents (event_type, cell_id, loss_percentage, avg_latency_ms, event_timestamp) -> Validate, check persistence window, alert NOC, log incident. Proposed Pilot Target: Under 1 minute.
     * Active Calls (customer_id, call_reason_tag, resolved_flag=0, hold_time_sec, transfer_count) -> Enrich with customer master profile, trigger supervisor alert. Proposed Pilot Target: Under 5 minutes.
   - Scheduled / Batch Path:
     * Customer master (plan_type, tenure_months, monthly_spend, nps_score, churn_6mo_flag) + historical Calls, Store_Visits, and NetworkEvents -> Standardise mixed timestamps, deduplicate, join records, compute weekly features, refresh BI dashboards, retrain churn models. Proposed Pilot Target: Nightly refresh; monthly trend review.

Format your responses with clear markdown headings, bullet points, and exact sheet range citations (e.g., Customers!H2:H201, Calls!G2:G5001, NetworkEvents!D2:F1001).`;

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      workbookSummary: WORKBOOK_SUMMARY_CONSTANTS,
      checksCount: VERIFICATION_AUDIT_CHECKS.length,
    });
  });

  app.post('/api/chat', async (req, res) => {
    const { message, lossThreshold = 10, latencyThreshold = 200 } = req.body || {};
    const promptText = typeof message === 'string' && message.trim() ? message.trim() : OFFICIAL_Q10_LIVE_PROMPT;
    const groundedFallback = buildGroundedQ10Response(promptText);

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim() === '') {
      res.json({
        title: groundedFallback.title,
        reply: groundedFallback.markdown,
        citations: groundedFallback.citations,
        verificationHighlights: groundedFallback.verificationHighlights,
        mode: 'verified-workbook-engine',
      });
      return;
    }

    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
      });

      const contextualPrompt = `User Query: ${promptText}
Current Interactive Screening Sliders set by user in UI: loss_percentage >= ${lossThreshold}%, avg_latency_ms >= ${latencyThreshold} ms.
Respond accurately using only verified TelcoX workbook facts.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: contextualPrompt,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.15,
        },
      });

      const replyText = response.text || groundedFallback.markdown;
      res.json({
        title: groundedFallback.title,
        reply: replyText,
        citations: groundedFallback.citations,
        verificationHighlights: groundedFallback.verificationHighlights,
        mode: 'gemini-3.8-flash',
      });
    } catch (_err) {
      res.json({
        title: groundedFallback.title,
        reply: groundedFallback.markdown,
        citations: groundedFallback.citations,
        verificationHighlights: groundedFallback.verificationHighlights,
        mode: 'verified-workbook-engine',
      });
    }
  });

  if (process.env.NODE_ENV === 'production') {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  const PORT = Number(process.env.PORT) || 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TelcoX Q10 AI Analytics Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
