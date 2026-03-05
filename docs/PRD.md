# Mento CLI — Product Requirements Document

## Overview

A TypeScript CLI tool that wraps the `@mento-protocol/mento-sdk` v3 to provide developer-friendly access to the Mento Protocol. This is the v3 successor to the utility scripts that lived in `mento-sdk/scripts/` during the v2 era (v1.17.0 and earlier).

The CLI gives developers and operators a fast way to inspect protocol state, get quotes, execute swaps, and manage liquidity — all from the terminal.

## Tech Stack

- TypeScript (ESM)
- Commander.js for CLI framework
- @mento-protocol/mento-sdk v3 (viem-based)
- viem for any direct contract reads the SDK doesn't wrap
- chalk for colored output
- cli-table3 for tabular display
- Publishable as `@mento-protocol/cli` (or `mento-cli`)

## Installation & Usage

```bash
# Install globally
npm install -g @mento-protocol/cli

# Or run via npx
npx @mento-protocol/cli routes

# Usage pattern
mento <command> [subcommand] [options]

# Global options
--network mainnet|testnet (default: mainnet)
--rpc <url>               (custom RPC endpoint)
--json                    (output as JSON instead of formatted tables)
```

---

## Commands

### 1. `mento tokens`
**Replaces:** `printTokens.ts`
**SDK service:** `mento.tokens`

List all tokens known to the protocol.

```bash
mento tokens                    # List all stable tokens with supply
mento tokens --collateral       # List collateral assets
mento tokens --all              # Both stable + collateral
```

**Output columns:** Symbol, Name, Address, Decimals, Supply (for stables)

---

### 2. `mento routes`
**Replaces:** `printTradablePairs.ts`, `visualizeTokenGraph.ts`
**SDK service:** `mento.routes`

List and inspect trading routes (the v3 replacement for "tradable pairs").

```bash
mento routes                          # List all routes
mento routes --direct                 # Only single-hop routes
mento routes --from USDm --to CELO    # Find specific route
mento routes --fresh                  # Bypass cache, fetch from chain
mento routes --graph                  # Output Mermaid diagram of token connectivity
```

**Output columns:** Route ID, Token A, Token B, Hops, Pool Types (FPMM/Virtual)

For `--graph`: output a Mermaid-formatted token connectivity diagram (can be piped to a .md file).

---

### 3. `mento pools`
**Replaces:** `printPoolConfigs.ts`, part of `printMentoDetails.ts`
**SDK service:** `mento.pools`

List pools and their configuration.

```bash
mento pools                           # List all pools
mento pools --type fpmm               # Filter by pool type
mento pools --type virtual
mento pools --details <address>       # Detailed view of a specific pool
```

**List output columns:** Pool Address, Token0, Token1, Pool Type
**Details output:** Full pool details including on-chain configuration (fee parameters for FPMM, spread/rate feed for Virtual)

---

### 4. `mento quote`
**Replaces:** `quotes/index.ts`
**SDK service:** `mento.quotes`, `mento.routes`

Get swap quotes. Finds the best route and returns expected output.

```bash
mento quote USDm CELO 100             # Quote: 100 USDm -> CELO
mento quote CELO USDm 50              # Quote: 50 CELO -> USDm
mento quote USDm CELO 100 --all-routes # Show quotes across all possible routes
```

**Output:** Amount in, Expected amount out, Route used, Price, Price impact / cost

For `--all-routes`: table of all viable routes ranked by output amount (best first).

---

### 5. `mento swap`
**Replaces:** `swap.ts`
**SDK service:** `mento.swap`

Execute a swap on-chain. Requires a private key or keystore.

```bash
mento swap USDm CELO 100 \
  --private-key <key>                  # Direct key (not recommended)
  --keyfile <path>                     # Encrypted keystore file
  --slippage 1                         # Slippage tolerance % (default: 0.5)
  --deadline 10                        # Deadline in minutes (default: 5)
  --dry-run                            # Build tx but don't send, print CallParams
```

**Flow:**
1. Resolve tokens by symbol
2. Find best route
3. Get quote
4. Display confirmation (amount in, expected out, slippage, route)
5. Prompt for confirmation (unless --yes flag)
6. Build swap tx via SDK (handles approval if needed)
7. Send approval tx if required, wait for confirmation
8. Send swap tx, wait for confirmation
9. Display result (tx hash, actual amounts)

`--dry-run` skips steps 5-9 and just outputs the CallParams JSON — useful for multisig or scripting.

---

### 6. `mento trading`
**Replaces:** `printTradingLimits.ts`, `printBreakerBox.ts`
**SDK service:** `mento.trading`

Check trading status, limits, and circuit breakers.

```bash
mento trading status                   # Overview: which pairs are tradable
mento trading status USDm CELO         # Check if specific pair is tradable
mento trading limits                   # Trading limits for all pools
mento trading limits <pool-address>    # Limits for a specific pool
```

**`status` output:** Route, Tradable (yes/no), Circuit Breaker OK, Trading Mode
**`limits` output:** Pool, Token, Limit Type, Limit Value, Current Netflow, Utilization (with visual bar like the v2 script)

---

### 7. `mento info`
**Replaces:** `printMentoDetails.ts`
**SDK service:** multiple services

Protocol-level information dump.

```bash
mento info                             # Key protocol addresses and stats
mento info --contracts                 # List all contract addresses
```

**Output:** Chain, Router address, Factory addresses, Number of pools, Number of routes, Number of tokens

---

### 8. `mento cache`
**Replaces:** `cacheTradablePairs/index.ts`
**SDK service:** `mento.routes` (with fresh: true)

Regenerate local route/token caches. Primarily useful for SDK development.

```bash
mento cache routes                     # Regenerate route cache
mento cache tokens                     # Regenerate token cache
```

---

## Non-Goals (for v1)

- **Liquidity management** (`mento.liquidity`) — complex UX, better suited for a web app. Can add later.
- **Borrowing/Trove management** (`mento.borrow`) — same reasoning. Future scope.
- **Latency benchmarking** (`estimateLatencies.ts`) — developer-only, not worth porting to CLI.
- **Full breaker parameter dump** — v3 SDK doesn't expose detailed breaker configs (median/value thresholds, EMA). Would need raw contract reads. Can add if needed.

---

## Project Structure

```
mento-cli/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts              # Entry point, Commander setup
│   ├── commands/
│   │   ├── tokens.ts
│   │   ├── routes.ts
│   │   ├── pools.ts
│   │   ├── quote.ts
│   │   ├── swap.ts
│   │   ├── trading.ts
│   │   ├── info.ts
│   │   └── cache.ts
│   ├── lib/
│   │   ├── client.ts         # Mento SDK initialization + shared config
│   │   ├── format.ts         # Table formatting, colors, number display
│   │   ├── wallet.ts         # Private key / keyfile handling
│   │   └── utils.ts          # Token resolution, common helpers
│   └── types.ts
├── bin/
│   └── mento.js              # Shebang entry
└── README.md
```

---

## Implementation Order

Stories should be implemented in this order (each builds on the previous):

1. **Project scaffolding** — package.json, tsconfig, Commander setup, global options, `mento --version`
2. **SDK client module** — shared Mento.create() initialization with network/rpc options
3. **`mento tokens`** — simplest read command, validates SDK integration
4. **`mento routes`** — core concept, validates route/pool model understanding
5. **`mento pools`** — builds on route understanding, adds detail views
6. **`mento quote`** — first command that combines services (routes + quotes)
7. **`mento trading`** — trading status and limits
8. **`mento info`** — aggregation command
9. **`mento swap`** — most complex, requires wallet handling
10. **`mento cache`** — utility command
11. **`mento routes --graph`** — Mermaid output, nice-to-have
12. **Polish** — error handling, help text, README

---

## Key Design Decisions

1. **Symbol-based token input** — users type `USDm` not `0x...`. The CLI resolves symbols to addresses via the SDK's cached token data.

2. **Confirmation prompts for writes** — any on-chain transaction requires explicit confirmation unless `--yes` is passed.

3. **JSON output mode** — every command supports `--json` for scripting/piping. Default is human-readable tables.

4. **No embedded private keys** — the `--private-key` flag exists for convenience but the preferred path is `--keyfile` with an encrypted keystore. The CLI should warn when raw keys are used.

5. **Graceful SDK errors** — FXMarketClosed, invalid routes, insufficient balance etc. should produce clear human-readable error messages, not stack traces.
