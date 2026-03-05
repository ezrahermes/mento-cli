import { Command } from 'commander';
import chalk from 'chalk';
import { getMento, resolveChainId, type GlobalOptions } from '../lib/client.js';
import { output } from '../lib/format.js';
import { resolveToken } from '../lib/utils.js';
import type { Route, RouteWithCost } from '@mento-protocol/mento-sdk';

interface RoutesOptions {
  direct?: boolean;
  from?: string;
  to?: string;
  fresh?: boolean;
}

function routeToRow(route: Route | RouteWithCost): string[] {
  const poolTypes = [...new Set(route.path.map((p) => p.poolType))].join(', ');
  return [
    route.id,
    route.tokens[0].symbol,
    route.tokens[1].symbol,
    String(route.path.length),
    poolTypes,
  ];
}

function routeToData(route: Route | RouteWithCost): Record<string, unknown> {
  return {
    id: route.id,
    tokenA: route.tokens[0],
    tokenB: route.tokens[1],
    hops: route.path.length,
    poolTypes: route.path.map((p) => p.poolType),
    path: route.path.map((p) => ({ poolAddr: p.poolAddr, poolType: p.poolType })),
  };
}

export function registerRoutesCommand(program: Command): void {
  program
    .command('routes')
    .description('List trading routes in the Mento Protocol')
    .option('-d, --direct', 'Only show direct (single-hop) routes')
    .option('--from <symbol>', 'Find route from this token symbol')
    .option('--to <symbol>', 'Find route to this token symbol')
    .option('--fresh', 'Bypass cache and fetch fresh routes from the blockchain')
    .action(async (options: RoutesOptions) => {
      const globalOpts = program.opts<GlobalOptions>();

      try {
        const mento = await getMento(globalOpts);
        const jsonMode = globalOpts.json ?? false;
        const chainId = resolveChainId(globalOpts.chain);

        const headers = ['Route ID', 'Token A', 'Token B', 'Hops', 'Pool Types'];

        if (options.from || options.to) {
          // Find specific route between two tokens
          if (!options.from || !options.to) {
            console.error(chalk.red('Error: --from and --to must be used together'));
            process.exit(1);
          }

          const tokenIn = resolveToken(chainId, options.from);
          const tokenOut = resolveToken(chainId, options.to);

          if (!tokenIn) {
            console.error(chalk.red(`Error: Token not found: ${options.from}`));
            process.exit(1);
          }
          if (!tokenOut) {
            console.error(chalk.red(`Error: Token not found: ${options.to}`));
            process.exit(1);
          }

          const route = await mento.routes.findRoute(tokenIn.address, tokenOut.address, {
            cached: !options.fresh,
          });

          if (!jsonMode) {
            console.log(chalk.bold(`Route: ${route.id}`));
            console.log(chalk.gray(`Hops: ${route.path.length}\n`));
          }

          output([routeToData(route)], headers, [routeToRow(route)], jsonMode);
        } else if (options.direct) {
          // Direct (single-hop) routes only
          const routes = await mento.routes.getDirectRoutes();

          if (!jsonMode) {
            console.log(chalk.bold('Direct Routes'));
            console.log(chalk.gray(`Found ${routes.length} direct route(s)\n`));
          }

          const rows = routes.map(routeToRow);
          const data = routes.map(routeToData);
          output(data, headers, rows, jsonMode);
        } else {
          // All routes (direct + multi-hop)
          const routes = await mento.routes.getRoutes({ cached: !options.fresh });

          if (!jsonMode) {
            console.log(chalk.bold('All Routes'));
            console.log(chalk.gray(`Found ${routes.length} route(s)\n`));
          }

          const rows = [...routes].map(routeToRow);
          const data = [...routes].map(routeToData);
          output(data, headers, rows, jsonMode);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error(chalk.red(`Error: ${message}`));
        process.exit(1);
      }
    });
}
