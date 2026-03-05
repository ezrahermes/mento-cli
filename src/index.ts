import { Command } from 'commander';
import { registerTokensCommand } from './commands/tokens.js';
import { registerRoutesCommand } from './commands/routes.js';
import { registerPoolsCommand } from './commands/pools.js';
import { registerQuoteCommand } from './commands/quote.js';
import { registerTradingCommand } from './commands/trading.js';
import { registerInfoCommand } from './commands/info.js';
import { registerSwapCommand } from './commands/swap.js';
import { registerCacheCommand } from './commands/cache.js';

const program = new Command();

program
  .name('mento')
  .description('CLI tool for the Mento Protocol')
  .version('0.1.0')
  .option('-c, --chain <name-or-id>', 'Chain name (celo, celo-sepolia) or chain ID', 'celo')
  .option('--rpc <url>', 'Custom RPC endpoint URL')
  .option('--json', 'Output as JSON instead of formatted tables', false);

// Register commands
registerTokensCommand(program);
registerRoutesCommand(program);
registerPoolsCommand(program);
registerQuoteCommand(program);
registerTradingCommand(program);
registerInfoCommand(program);
registerSwapCommand(program);
registerCacheCommand(program);

program.parse();
