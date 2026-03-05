# mento-cli

Command-line interface for the [Mento Protocol](https://mento.org). Wraps the Mento SDK v3 to let you inspect tokens, routes, pools, get quotes, check trading status, and execute swaps — all from the terminal.

## Installation

```bash
# Install globally
npm install -g mento-cli

# Or run without installing
npx mento-cli
```

Requires Node.js >= 18.

## Quick Start

```bash
# List stable tokens on Celo mainnet
mento tokens

# Get a quote for swapping 100 USDm to CELO
mento quote USDm CELO 100

# Show protocol info
mento info
```

## Global Options

| Option | Description | Default |
|---|---|---|
| `-c, --chain <name-or-id>` | Chain name (`celo`, `celo-sepolia`) or numeric chain ID | `celo` |
| `--rpc <url>` | Custom RPC endpoint URL | (chain default) |
| `--json` | Output as JSON instead of formatted tables | `false` |
| `-V, --version` | Print version | |
| `-h, --help` | Show help | |

## Commands

### tokens

List tokens known to the Mento Protocol.

```bash
mento tokens                # List stable tokens (default)
mento tokens --collateral   # List collateral assets
mento tokens --all          # List both stable and collateral
mento tokens --json         # Output as JSON
```

### routes

List available trading routes between token pairs.

```bash
mento routes                        # List all routes
mento routes --from USDm --to CELO  # Filter routes by pair
mento routes --direct               # Show only direct routes
mento routes --fresh                # Bypass cache, fetch from chain
mento routes --graph                # Show route graph visualization
```

### pools

List liquidity pools and their details.

```bash
mento pools                          # List all pools
mento pools --type VirtualPool       # Filter by pool type
mento pools --details <pool-addr>    # Show detailed pool info
mento pools --json                   # Output as JSON
```

### quote

Get a swap quote for a token pair and amount.

```bash
mento quote USDm CELO 100            # Quote 100 USDm → CELO
mento quote CELO USDm 50             # Quote 50 CELO → USDm
mento quote USDm CELO 100 --all-routes   # Compare across all routes
mento quote USDm CELO 100 --json     # Output as JSON
```

### swap

Execute a token swap on-chain.

```bash
mento swap USDm CELO 100 --private-key 0x...   # Swap 100 USDm for CELO
mento swap USDm CELO 100 --keyfile ./key.txt    # Use keyfile for signing
mento swap USDm CELO 100 --dry-run              # Preview without sending
mento swap USDm CELO 100 --slippage 1 --yes     # 1% slippage, skip prompt
```

| Option | Description | Default |
|---|---|---|
| `--private-key <key>` | Private key for signing | |
| `--keyfile <path>` | Path to file containing private key | |
| `--slippage <percent>` | Slippage tolerance in percent | `0.5` |
| `--deadline <minutes>` | Transaction deadline in minutes | `5` |
| `--dry-run` | Output CallParams as JSON without sending | |
| `-y, --yes` | Skip confirmation prompt | |

### trading

Check trading status and limits.

```bash
mento trading status                # Check all routes trading status
mento trading status USDm CELO     # Check if a specific pair is tradable
mento trading limits               # Show trading limits for all pools
mento trading limits --json        # Output limits as JSON
```

### info

Show protocol overview and contract addresses.

```bash
mento info                          # Protocol overview (pools, routes, tokens)
mento info --contracts              # List all known contract addresses
mento info --chain celo-sepolia     # Show info for Celo Sepolia testnet
mento info --json                   # Output as JSON
```

### cache

Refresh cached protocol data from the blockchain.

```bash
mento cache routes    # Refresh routes cache
mento cache tokens    # Refresh tokens cache
```

## Examples

```bash
# Use Celo Sepolia testnet
mento tokens --chain celo-sepolia

# Use a custom RPC endpoint
mento info --rpc https://my-rpc.example.com

# Pipe JSON output to jq
mento tokens --json | jq '.[] | .symbol'

# Quote and swap workflow
mento quote USDm CELO 100
mento swap USDm CELO 100 --private-key 0x... --slippage 0.5
```

## Full Specification

See [docs/PRD.md](docs/PRD.md) for the complete product requirements document.

## License

MIT
