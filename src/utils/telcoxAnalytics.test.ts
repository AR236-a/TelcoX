import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CALIBRATED_NETWORK_EVENTS,
  WORKBOOK_SUMMARY_CONSTANTS,
  evaluateNetworkScreening,
  classifyHybridStreamEvent,
  computeLiveTelemetryWindow,
  evaluateAutomatedScreeningPolicy,
  buildGroundedQ10Response,
} from './telcoxAnalytics.ts';

test('CALIBRATED_NETWORK_EVENTS matches exact TelcoX workbook verification totals', () => {
  assert.equal(CALIBRATED_NETWORK_EVENTS.length, 1000);

  // Verify unique event_id range 30001..31000
  const uniqueIds = new Set(CALIBRATED_NETWORK_EVENTS.map((r) => r.event_id));
  assert.equal(uniqueIds.size, 1000);
  assert.equal(Math.min(...uniqueIds), 30001);
  assert.equal(Math.max(...uniqueIds), 31000);

  // Verify exact event_type mix: 340 packet_loss, 336 latency_spike, 324 throughput_drop
  const packetLoss = CALIBRATED_NETWORK_EVENTS.filter((r) => r.event_type === 'packet_loss').length;
  const latencySpike = CALIBRATED_NETWORK_EVENTS.filter((r) => r.event_type === 'latency_spike').length;
  const throughputDrop = CALIBRATED_NETWORK_EVENTS.filter((r) => r.event_type === 'throughput_drop').length;
  assert.equal(packetLoss, 340);
  assert.equal(latencySpike, 336);
  assert.equal(throughputDrop, 324);

  // Verify exact timestamp format counts: 581 text, 418 excel_serial, 1 integer_serial
  const textTs = CALIBRATED_NETWORK_EVENTS.filter((r) => r.timestamp_format === 'text').length;
  const serialTs = CALIBRATED_NETWORK_EVENTS.filter((r) => r.timestamp_format === 'excel_serial').length;
  const intTs = CALIBRATED_NETWORK_EVENTS.filter((r) => r.timestamp_format === 'integer_serial').length;
  assert.equal(textTs, 581);
  assert.equal(serialTs, 418);
  assert.equal(intTs, 1);
});

test('evaluateNetworkScreening returns exact 463 (46.3%) and 398 (39.8%) at default illustrative thresholds', () => {
  const defaultScreen = evaluateNetworkScreening(10, 200);
  assert.equal(defaultScreen.totalEvents, 1000);
  assert.equal(defaultScreen.lossBreachCount, 463);
  assert.equal(defaultScreen.lossBreachPct, 46.3);
  assert.equal(defaultScreen.latencyBreachCount, 398);
  assert.equal(defaultScreen.latencyBreachPct, 39.8);
  assert.equal(defaultScreen.byCellTop5.length, 5);

  // Tightening thresholds should monotonically decrease breach counts
  const stricterScreen = evaluateNetworkScreening(15, 260);
  assert.ok(stricterScreen.lossBreachCount < defaultScreen.lossBreachCount);
  assert.ok(stricterScreen.latencyBreachCount < defaultScreen.latencyBreachCount);

  // Zero thresholds should match all 1000 events
  const zeroScreen = evaluateNetworkScreening(0, 0);
  assert.equal(zeroScreen.lossBreachCount, 1000);
  assert.equal(zeroScreen.latencyBreachCount, 1000);
});

test('classifyHybridStreamEvent routes severe network and unresolved call events to FAST_EVENT_DRIVEN', () => {
  // Index 0 -> NetworkEvents[0] (event_id 30001 has loss_percentage 10.67 >= 10)
  const netRouted = classifyHybridStreamEvent(0, 10, 200);
  assert.equal(netRouted.sourceSheet, 'NetworkEvents');
  assert.equal(netRouted.routingPath, 'FAST_EVENT_DRIVEN');
  assert.equal(netRouted.targetSla, 'Under 1 minute (NOC Alert)');

  // Store_Visits (index 2) and Customers (index 3) always route to SCHEDULED_BATCH
  const visitRouted = classifyHybridStreamEvent(2, 10, 200);
  assert.equal(visitRouted.sourceSheet, 'Store_Visits');
  assert.equal(visitRouted.routingPath, 'SCHEDULED_BATCH');

  const custRouted = classifyHybridStreamEvent(3, 10, 200);
  assert.equal(custRouted.sourceSheet, 'Customers');
  assert.equal(custRouted.routingPath, 'SCHEDULED_BATCH');
});

test('WORKBOOK_SUMMARY_CONSTANTS and buildGroundedQ10Response preserve case study honesty boundaries', () => {
  assert.equal(WORKBOOK_SUMMARY_CONSTANTS.customers.churnedCount, 62);
  assert.equal(WORKBOOK_SUMMARY_CONSTANTS.customers.churnRatePct, 31.0);
  assert.equal(WORKBOOK_SUMMARY_CONSTANTS.calls.resolvedCount, 3986);
  assert.equal(WORKBOOK_SUMMARY_CONSTANTS.calls.unresolvedCount, 1014);

  const fullResp = buildGroundedQ10Response('Run official Q10 prompt');
  assert.ok(fullResp.markdown.includes('31.0%'));
  assert.ok(fullResp.markdown.includes('463'));
  assert.ok(fullResp.markdown.includes('398'));
  assert.ok(fullResp.markdown.toLowerCase().includes('not company-approved telcox policy limits'));

  const tsResp = buildGroundedQ10Response('Inspect the timestamp formats and serial values');
  assert.ok(tsResp.markdown.includes('2,879'));
  assert.ok(tsResp.markdown.includes('2,121'));

  const joinResp = buildGroundedQ10Response('Why cannot cell_id join to customer?');
  assert.ok(joinResp.markdown.includes('no `customer_id` column'));
});

test('computeLiveTelemetryWindow tracks cumulative fast/batch counts and rolling network series', () => {
  const telemetry = computeLiveTelemetryWindow(24, 10, 10, 200);
  assert.equal(telemetry.totalProcessed, 24);
  assert.equal(
    telemetry.fastNocAlerts + telemetry.fastSupervisorAlerts + telemetry.batchQueued,
    24
  );
  assert.ok(telemetry.recentNetworkSeries.length > 0 && telemetry.recentNetworkSeries.length <= 10);
});

test('evaluateAutomatedScreeningPolicy dynamically calibrates thresholds and generates rule execution logs', () => {
  const d0 = evaluateAutomatedScreeningPolicy(64);
  const d1 = evaluateAutomatedScreeningPolicy(67);
  assert.ok(d0.lossThreshold >= 8 && d0.lossThreshold <= 15);
  assert.ok(d0.latencyThreshold >= 160 && d0.latencyThreshold <= 250);
  assert.equal(d0.recentRuleLogs.length, 5);
  // Verify regime transitions across stream ticks
  assert.notEqual(d0.regimeCode, d1.regimeCode);
});
