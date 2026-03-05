import { Command } from 'commander';
import { registerTokensCommand } from './commands/tokens.js';
import { registerRoutesCommand } from './commands/routes.js';

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

program.parse();
