// Dip Catcher — a BTC race bot for make.fun (btc-race-24h-20261123-0511).
//
// Idea: the dev window is one sharp +2.5% surge (hours 3-4) and then a flat
// range full of ~1% noise that is untradeable. So this bot does one thing:
// buy the first dip that shows a recovery tick, then ride it with a trailing
// stop. It never chases the noise, never forces a second trade.
//
// Entry (flat, not warming up, >= 10 bars of history):
//   close >= 0.25% below the highest high of the previous 10 bars
//   AND close > previous close (a recovery tick, not a falling knife)
//   -> buy full size.
// Exit (holding):
//   2% trailing stop from the highest close since the buy was decided,
//   OR a 1% hard stop below the entry close.
//   A rejected sell is retried every bar while the condition holds.
// After an exit, the bot waits at least one bar before re-entering, so it
// never buys straight back into the same dip that just stopped it out.
//
// Deterministic: no clock, no randomness, no env reads. Float64 math on
// BigInt closes (exact for these magnitudes), so the two graded runs agree.

import { runBars } from './vendor/makefun-bars.ts';
import type { OrderInput } from './vendor/makefun-bars.ts';

const LOOKBACK_BARS = 10;
const DIP_BPS = 25; // 0.25% below the 10-bar high
const TRAIL_BPS = 200; // 2% trailing stop from the peak close
const STOP_BPS = 100; // 1% hard stop below the entry close
const MAX_SLIPPAGE_BPS = 1000;

// Rolling state, kept at module scope so every batch sees the same window.
const highs: number[] = []; // highs of the bars before the current one
let prevClose: number | null = null; // previous bar's close
let peak: number | null = null; // highest close since the buy was decided
let entryClose: number | null = null; // close of the bar the buy was decided on
let lastExitSeq = -1; // seq of the batch an exit was decided on

await runBars({
  onBatch(state) {
    const symbol = state.hello.symbols[0].symbol;
    const bar = state.latest.get(symbol);
    if (bar === undefined) return [];

    const close = Number(BigInt(bar.c));
    const high = Number(BigInt(bar.h));
    const held = state.positions.get(symbol);
    const orders: OrderInput[] = [];

    if (!state.warmingUp) {
      if (held === undefined) {
        // Flat: reset the position trackers, then look for the dip.
        peak = null;
        entryClose = null;
        const cooledDown = state.seq > lastExitSeq + 1;
        if (cooledDown && highs.length >= LOOKBACK_BARS && prevClose !== null) {
          const maxHigh = Math.max(...highs);
          const dip = (maxHigh - close) / maxHigh >= DIP_BPS / 10000;
          if (dip && close > prevClose) {
            const minNotional = BigInt(state.hello.fees.min_notional_quote_units);
            const notional = state.cash < state.weightRoom(symbol) ? state.cash : state.weightRoom(symbol);
            if (notional >= minNotional) {
              orders.push({ side: 'buy', symbol, notional_quote_units: notional, max_slippage_bps: MAX_SLIPPAGE_BPS });
              peak = close;
              entryClose = close;
            }
          }
        }
      } else {
        // Holding: track the peak and check the two exits.
        peak = peak === null ? close : Math.max(peak, close);
        const entry = entryClose ?? close;
        const trailHit = (peak - close) / peak >= TRAIL_BPS / 10000;
        const stopHit = (entry - close) / entry >= STOP_BPS / 10000;
        if (trailHit || stopHit) {
          orders.push({ side: 'sell', symbol, qty: held.qty, max_slippage_bps: MAX_SLIPPAGE_BPS });
          lastExitSeq = state.seq;
        }
      }
    }

    // Roll the window forward with this bar (after deciding, so the entry
    // always compares against the previous 10 bars, never this one).
    highs.push(high);
    if (highs.length > LOOKBACK_BARS) highs.shift();
    prevClose = close;

    return orders;
  },
});
