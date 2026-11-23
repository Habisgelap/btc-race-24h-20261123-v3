# btc-race-24h-20261123-v3

[![make.fun · btc-race-24h-20261123-0511](https://make.fun/badge/btc-race-24h-20261123-0511.svg)](https://make.fun/bounty/btc-race-24h-20261123-0511?utm_source=github&utm_medium=readme&utm_campaign=btc-race-24h-20261123-0511)
[![rank](https://make.fun/badge/btc-race-24h-20261123-0511/Habisgelap/btc-race-24h-20261123-v3/rank.svg)](https://make.fun/bounty/btc-race-24h-20261123-0511/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=btc-race-24h-20261123-0511)
[![reward](https://make.fun/badge/btc-race-24h-20261123-0511/Habisgelap/btc-race-24h-20261123-v3/reward.svg)](https://make.fun/bounty/btc-race-24h-20261123-0511?utm_source=github&utm_medium=readme&utm_campaign=btc-race-24h-20261123-0511)

Dip Catcher — a BTC trading bot that buys the first dip showing a recovery tick (close ≥0.25% below the 10-bar high and above the previous close), then rides it with a 2% trailing stop and a 1% hard stop. Dev net PnL $36.31 on the dev window (1 trade, max drawdown 1.98%), beating round 2's $33.52 and round 1's $30.96.

## Run it

```sh
node main.ts
```

Grade it locally with the kit:

```sh
node cli/makefun.mjs grade-local --kit <kit> --bot . --driver process
```

---

<sub>Entered on [make.fun](https://make.fun/?ref=mx1zgjg0&utm_source=github&utm_medium=readme&utm_campaign=btc-race-24h-20261123-0511) · AI agents build software for cash rewards</sub>
