import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  OFFICIAL_Q10_LIVE_PROMPT,
  evaluateNetworkScreening,
  classifyHybridStreamEvent,
  computeLiveTelemetryWindow,
  evaluateAutomatedScreeningPolicy,
  buildGroundedQ10Response,
  StreamRoutedEvent,
} from './utils/telcoxAnalytics';
import { StreamVisualizer } from './components/StreamVisualizer';
import { AiDemoChatbot, ChatMessage } from './components/AiDemoChatbot';
import { WorkbookVerifier } from './components/WorkbookVerifier';
import { ArchitectureAndScript } from './components/ArchitectureAndScript';

type ActiveTab = 'overview' | 'chatbot' | 'workbook' | 'architecture';
type SheetTab = 'Customers' | 'Calls' | 'NetworkEvents' | 'Store_Visits';

function buildInitialMessages(): ChatMessage[] {
  const initialGrounded = buildGroundedQ10Response(OFFICIAL_Q10_LIVE_PROMPT);
  return [
    {
      id: 'msg-init-user',
      role: 'user',
      content: OFFICIAL_Q10_LIVE_PROMPT,
      timestamp: 'Q10 Official Live Prompt',
    },
    {
      id: 'msg-init-assistant',
      role: 'assistant',
      title: initialGrounded.title,
      content: initialGrounded.markdown,
      timestamp: 'Verified Against 4 Workbook Sheets',
      citations: initialGrounded.citations,
      verificationHighlights: initialGrounded.verificationHighlights,
      engineMode: 'verified-workbook-engine',
    },
  ];
}

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [activeSheet, setActiveSheet] = useState<SheetTab>('NetworkEvents');

  // Automatic real-time stream state: enabled automatically on load!
  const [streamCursor, setStreamCursor] = useState<number>(64);
  const [isSimulating, setIsSimulating] = useState<boolean>(true);
  const [streamSpeedMs, setStreamSpeedMs] = useState<number>(1000);

  // Automated Operational Screening System state (enabled automatically by default)
  const [isAutoScreening, setIsAutoScreening] = useState<boolean>(true);
  const [manualLossThreshold, setManualLossThreshold] = useState<number>(10);
  const [manualLatencyThreshold, setManualLatencyThreshold] = useState<number>(200);

  // Chatbot state
  const [messages, setMessages] = useState<ChatMessage[]>(() => buildInitialMessages());
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);

  // Evaluate automated screening policy from live rolling telemetry window
  const automatedDecision = useMemo(
    () => evaluateAutomatedScreeningPolicy(streamCursor),
    [streamCursor]
  );

  // Effective thresholds: driven automatically by the screening controller unless manually locked
  const lossThreshold = isAutoScreening
    ? automatedDecision.lossThreshold
    : manualLossThreshold;
  const latencyThreshold = isAutoScreening
    ? automatedDecision.latencyThreshold
    : manualLatencyThreshold;

  // Evaluate screening metrics across all 1,000 NetworkEvents rows
  const screeningResult = useMemo(
    () => evaluateNetworkScreening(lossThreshold, latencyThreshold),
    [lossThreshold, latencyThreshold]
  );

  // Build current stream replay window of routed events
  const streamEvents: StreamRoutedEvent[] = useMemo(() => {
    const items: StreamRoutedEvent[] = [];
    const startIdx = Math.max(0, streamCursor - 12);
    for (let i = streamCursor - 1; i >= startIdx; i--) {
      items.push(classifyHybridStreamEvent(i, lossThreshold, latencyThreshold));
    }
    return items;
  }, [streamCursor, lossThreshold, latencyThreshold]);

  // Compute live accumulating telemetry & rolling 16-event cell series
  const liveTelemetry = useMemo(
    () => computeLiveTelemetryWindow(streamCursor, 16, lossThreshold, latencyThreshold),
    [streamCursor, lossThreshold, latencyThreshold]
  );

  useEffect(() => {
    if (!isSimulating) return;
    const timer = setInterval(() => {
      setStreamCursor((prev) => prev + 1);
    }, streamSpeedMs);
    return () => clearInterval(timer);
  }, [isSimulating, streamSpeedMs]);

  const handleLockQ10Baseline = useCallback(() => {
    setIsAutoScreening(false);
    setManualLossThreshold(10);
    setManualLatencyThreshold(200);
  }, []);

  const handleManualLossChange = useCallback((val: number) => {
    setIsAutoScreening(false);
    setManualLossThreshold(val);
  }, []);

  const handleManualLatencyChange = useCallback((val: number) => {
    setIsAutoScreening(false);
    setManualLatencyThreshold(val);
  }, []);

  const handleStepSimulation = useCallback(() => {
    setStreamCursor((prev) => prev + 1);
  }, []);

  const handleResetSimulation = useCallback(() => {
    setStreamCursor(64);
  }, []);

  const handleSendMessage = useCallback(
    async (promptText: string) => {
      const userMsg: ChatMessage = {
        id: `usr-${Date.now()}`,
        role: 'user',
        content: promptText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      };

      setMessages((prev) => [...prev, userMsg]);
      setIsChatLoading(true);

      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: promptText,
            lossThreshold,
            latencyThreshold,
          }),
        });

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const data = await res.json();
        const assistantMsg: ChatMessage = {
          id: `ast-${Date.now()}`,
          role: 'assistant',
          title: data.title || 'Verified TelcoX Analysis',
          content: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          citations: data.citations,
          verificationHighlights: data.verificationHighlights,
          engineMode: data.mode,
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } catch (_err) {
        const fallback = buildGroundedQ10Response(promptText);
        const assistantMsg: ChatMessage = {
          id: `ast-${Date.now()}`,
          role: 'assistant',
          title: fallback.title,
          content: fallback.markdown,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          citations: fallback.citations,
          verificationHighlights: fallback.verificationHighlights,
          engineMode: 'verified-workbook-engine',
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } finally {
        setIsChatLoading(false);
      }
    },
    [lossThreshold, latencyThreshold]
  );

  const handleTriggerLiveQ10Prompt = useCallback(() => {
    setActiveTab('chatbot');
    handleSendMessage(OFFICIAL_Q10_LIVE_PROMPT);
  }, [handleSendMessage]);

  const handleInspectSheet = useCallback((sheet: SheetTab) => {
    setActiveSheet(sheet);
    setActiveTab('workbook');
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#0F172A] text-slate-100">
      {/* Top Bar Contract: 3 zones (Brand, Nav Links, Primary CTA) separated by gap-8 */}
      <header className="sticky top-0 z-40 border-b border-slate-800 bg-[#0F172A]/95 backdrop-blur">
        <div className="max-w-[1440px] mx-auto px-6 h-14 flex items-center justify-between gap-8">
          {/* Zone 1: Brand Wordmark (single text element, whitespace-nowrap shrink-0) */}
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className="text-sm font-bold tracking-tight text-slate-100 whitespace-nowrap shrink-0 cursor-pointer"
          >
            TelcoX Q10 Analytics
          </button>

          {/* Zone 2: 4 Single-line Nav Links */}
          <nav aria-label="Primary Navigation" className="flex items-center gap-6 overflow-x-auto">
            {(
              [
                { id: 'overview', label: 'Overview & Stream' },
                { id: 'chatbot', label: 'AI Demonstration Chat' },
                { id: 'workbook', label: 'Workbook Verification' },
                { id: 'architecture', label: 'Hybrid Architecture' },
              ] as const
            ).map((item) => (
              <button
                key={item.id}
                type="button"
                data-testid={`nav-tab-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`text-xs font-medium whitespace-nowrap py-4 border-b-2 transition-colors cursor-pointer ${
                  activeTab === item.id
                    ? 'border-sky-400 text-sky-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Zone 3: 1 Primary CTA Button */}
          <button
            type="button"
            data-testid="top-cta-run-prompt"
            onClick={handleTriggerLiveQ10Prompt}
            className="px-3.5 py-1.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold text-xs whitespace-nowrap shrink-0 transition-colors cursor-pointer"
          >
            Run Live Q10 Prompt
          </button>
        </div>
      </header>

      {/* Contextual Case Study Scope & Live Real-Time Status Strip */}
      <div className="border-b border-slate-800 bg-[#1E293B]/40">
        <div className="max-w-[1440px] mx-auto px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-base font-semibold text-slate-100">
              Q10 AI Demonstration: TelcoX — Real-Time versus Batch Processing
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Grounded on <span className="font-mono text-slate-300">Case Study 1- DIAI framework - TelcoX Case Study Data.xlsx</span> · 4 Sheets · 6,500 Total Verified Records
            </p>
          </div>
          <div className="text-xs font-mono text-slate-300 tabular-nums">
            Auto-Screening: {isAutoScreening ? automatedDecision.regimeCode : 'LOCKED'} (&ge;{lossThreshold}% / &ge;{latencyThreshold}ms) · Streamed: {liveTelemetry.totalProcessed} · NOC (&lt;1m): {liveTelemetry.fastNocAlerts}
          </div>
        </div>
      </div>

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-6 py-6">
        {activeTab === 'overview' && (
          <StreamVisualizer
            lossThreshold={lossThreshold}
            latencyThreshold={latencyThreshold}
            isAutoScreening={isAutoScreening}
            onToggleAutoScreening={setIsAutoScreening}
            automatedDecision={automatedDecision}
            onChangeLossThreshold={handleManualLossChange}
            onChangeLatencyThreshold={handleManualLatencyChange}
            onLockQ10Baseline={handleLockQ10Baseline}
            screeningResult={screeningResult}
            streamEvents={streamEvents}
            liveTelemetry={liveTelemetry}
            isSimulating={isSimulating}
            streamSpeedMs={streamSpeedMs}
            onChangeStreamSpeed={setStreamSpeedMs}
            onToggleSimulation={() => setIsSimulating((s) => !s)}
            onStepSimulation={handleStepSimulation}
            onResetSimulation={handleResetSimulation}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'chatbot' && (
          <AiDemoChatbot
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={isChatLoading}
            onResetChat={() => setMessages(buildInitialMessages())}
            lossThreshold={lossThreshold}
            latencyThreshold={latencyThreshold}
            onInspectSheet={handleInspectSheet}
          />
        )}

        {activeTab === 'workbook' && (
          <WorkbookVerifier
            activeSheet={activeSheet}
            onSelectSheet={setActiveSheet}
            lossThreshold={lossThreshold}
            latencyThreshold={latencyThreshold}
          />
        )}

        {activeTab === 'architecture' && (
          <ArchitectureAndScript
            onNavigateTab={setActiveTab}
            onExecuteOfficialPrompt={handleTriggerLiveQ10Prompt}
          />
        )}
      </main>
    </div>
  );
}
