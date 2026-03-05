import { Command } from 'commander';
import chalk from 'chalk';
import { getMento, type GlobalOptions } from '../lib/client.js';

export function registerCacheCommand(program: Command): void {
  const cache = program
    .command('cache')
    .description('Refresh cached protocol data from the blockchain');

  cache
    .command('routes')
    .description('Refresh the routes cache from on-chain data')
    .action(async () => {
      const globalOpts = program.opts<GlobalOptions>();
      const jsonMode = globalOpts.json ?? false;

      try {
        const mento = await getMento(globalOpts);
        const routes = await mento.routes.getRoutes({ cached: false });
        const count = routes.length;

        if (jsonMode) {
          console.log(JSON.stringify({ cached: 'routes', count }));
        } else {
          console.log(chalk.green(`✔ Cached ${count} route(s) from chain.`));
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error(chalk.red(`Error: ${message}`));
        process.exit(1);
      }
    });

  cache
    .command('tokens')
    .description('Refresh the tokens cache from on-chain data')
    .action(async () => {
      const globalOpts = program.opts<GlobalOptions>();
      const jsonMode = globalOpts.json ?? false;

      try {
        const mento = await getMento(globalOpts);

        const [stables, collateral] = await Promise.all([
          mento.tokens.getStableTokens(),
          mento.tokens.getCollateralAssets(),
        ]);

        const stableCount = stables.length;
        const collateralCount = collateral.length;
        const totalCount = stableCount + collateralCount;

        if (jsonMode) {
          console.log(
            JSON.stringify({
              cached: 'tokens',
              count: totalCount,
              stableTokens: stableCount,
              collateralAssets: collateralCount,
            }),
          );
        } else {
          console.log(
            chalk.green(
              `✔ Cached ${totalCount} token(s) from chain (${stableCount} stable, ${collateralCount} collateral).`,
            ),
          );
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error(chalk.red(`Error: ${message}`));
        process.exit(1);
      }
    });
}
