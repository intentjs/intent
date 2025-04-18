import {
  DiscoveryService,
  MetadataScanner,
  ModuleRef,
  NestFactory,
} from '@nestjs/core';
import { useContainer } from 'class-validator';
import { ConfigService } from '../../config/service.js';
import { ExceptionHandler } from '../../exceptions/base-exception-handler.js';
import {
  Actuator,
  IntentAppContainer,
  ModuleBuilder,
} from '../../foundation/index.js';
import { Type } from '../../interfaces/index.js';
import {
  findProjectRoot,
  getPackageJson,
  Obj,
  Package,
} from '../../utils/index.js';
import { Kernel } from '../foundation/kernel.js';
import pc from 'picocolors';
import { printBulletPoints } from '../../utils/console-helpers.js';
import { Response as HyperResponse, Server } from '@intentjs/hyper-express';
import { MiddlewareConfigurator } from './middlewares/configurator.js';
import { MiddlewareComposer } from './middlewares/middleware-composer.js';
import { HyperServer } from '../http-server/server.js';
import { HttpExecutionContext } from '../http-server/contexts/http-execution-context.js';
import { ExecutionContext } from '../http-server/contexts/execution-context.js';
import { RouteExplorer } from '../http-server/route-explorer.js';
import { RouteNotFoundException } from '../../exceptions/route-not-found-exception.js';

const signals = ['SIGTERM', 'SIGINT', 'SIGUSR2'];

export class IntentHttpServer {
  private kernel: Kernel;
  private errorHandler: Type<ExceptionHandler>;
  private container: IntentAppContainer;

  constructor(private readonly actuator: Actuator) {}

  initKernel(kernelCls: Type<Kernel>): this {
    this.kernel = new kernelCls();
    return this;
  }

  catchErrorsWith(handler: Type<ExceptionHandler>): this {
    this.errorHandler = handler;
    return this;
  }

  async start() {
    const container = await this.getContainer();
    const module = ModuleBuilder.build(container, this.kernel);

    const app = await NestFactory.createApplicationContext(module, {
      logger: ['error'],
    });

    const globalGuards = this.kernel.guards();

    const appModule = app.select(module);
    const ds = app.get(DiscoveryService);

    const ms = app.get(MetadataScanner, { strict: false });
    const mr = appModule.get(ModuleRef, { strict: true });

    const errorHandler = await mr.create(this.errorHandler);

    const config = appModule.get(ConfigService);

    useContainer(appModule, { fallbackOnErrors: true });

    const middlewareConfigurator = new MiddlewareConfigurator();
    this.kernel.routeMiddlewares(middlewareConfigurator);

    const composer = new MiddlewareComposer(
      mr,
      middlewareConfigurator,
      this.kernel.middlewares(),
    );

    const globalMiddlewares = await composer.globalMiddlewares();
    const routeMiddlewares = await composer.getRouteMiddlewares();
    const excludedMiddlewares =
      await composer.getExcludedMiddlewaresForRoutes();

    const routeExplorer = new RouteExplorer(ds, ms, mr);
    const routes = await routeExplorer
      .useGlobalGuards(globalGuards)
      .exploreFullRoutes(errorHandler);

    const serverOptions = config.get('http.server');

    const customServer = new HyperServer();
    const server = await customServer
      .useGlobalMiddlewares(globalMiddlewares)
      .useRouteMiddlewares(routeMiddlewares)
      .build(routes, serverOptions);

    await this.container.boot(app);
    await this.kernel.boot(server);

    server.set_not_found_handler((hReq: any, hRes: HyperResponse) => {
      const httpContext = new HttpExecutionContext(hReq, hRes);
      const context = new ExecutionContext(httpContext, null, null);
      const routeNotFoundError = new RouteNotFoundException(
        `[${hReq.method}] ${hReq.url} is not a valid route.`,
      );
      errorHandler.catch(context, routeNotFoundError);
    });

    server.set_error_handler((hReq: any, hRes: HyperResponse, error: Error) => {
      const httpContext = new HttpExecutionContext(hReq, hRes);
      const context = new ExecutionContext(httpContext, null, null);
      errorHandler.catch(context, error);
    });

    this.configureErrorReporter(config.get('app.sentry'));

    const port = config.get('app.port');
    const hostname = config.get('app.hostname');

    await server.listen(port, hostname || '0.0.0.0');

    for (const signal of signals) {
      process.on(signal, () => this.shutdown(server, signal));
    }

    this.printToConsole(config, [['➜', 'routes scanned', routes.length + '']]);
  }

  printToConsole(
    config: ConfigService<unknown>,
    extraInfo: [string, string, string][] = [],
  ) {
    // console.clear();
    console.log();
    const port = config.get('app.port');
    const hostname = config.get('app.hostname');
    const environment = config.get('app.env');
    const debug = config.get('app.debug');

    try {
      const { dependencies } = getPackageJson();
      console.log(
        `  ${pc.bold(pc.green('Intent'))} ${pc.green(dependencies['@intentjs/core'])}`,
      );
      console.log();
    } catch {}

    printBulletPoints([
      ['➜', 'environment', environment],
      ['➜', 'debug', debug],
      ['➜', 'hostname', hostname ?? '127.0.0.1'],
      ['➜', 'port', port],
      ...extraInfo,
    ]);

    const url = new URL(`http://${hostname ?? 'localhost'}`);
    url.port = port;

    console.log();
    console.log(`  ${pc.white('Listening on')}: ${pc.cyan(url.toString())}`);
  }

  async shutdown(server: Server, signal: string): Promise<void> {
    console.log(`\nReceived ${signal}, starting graceful shutdown...`);

    if (server) {
      await new Promise(res =>
        server.close(() => {
          res(1);
        }),
      );
    }
  }

  async getContainer(): Promise<IntentAppContainer> {
    const containerCls = await this.actuator.importContainer();
    this.container = new containerCls();
    this.container.build();
    return this.container;
  }

  async configureErrorReporter(config: Record<string, any>): Promise<void> {
    if (!config) return;

    if (Obj.isObj(config) && config?.dsn) {
      const {
        dsn,
        tracesSampleRate,
        integrateNodeProfile,
        profilesSampleRate,
      } = config;

      if (dsn) {
        const Sentry = await Package.load('@sentry/node');
        const integrations = [];
        /**
         * Load integrations
         */
        if (integrateNodeProfile) {
          const { nodeProfilingIntegration } = await Package.load(
            '@sentry/profiling-node',
          );

          integrations.push(nodeProfilingIntegration());
        }

        Sentry.init({
          dsn,
          tracesSampleRate,
          profilesSampleRate,
          integrations,
        });
      }
    }
  }
}
