import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { useContainer } from 'class-validator';
import { ConfigService } from '../config/service';
import { Obj, Package } from '../utils';
import { ServerOptions } from './interfaces';
import { requestMiddleware } from './middlewares/functional/requestSerializer';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

export class RestServer {
  /**
   * Create instance of fastify lambda server
   * @returns Promise<INestApplication>
   */

  static async make(module: any, options?: ServerOptions): Promise<void> {
    const app = await NestFactory.create<NestExpressApplication>(module, {
      bodyParser: true,
    });

    if (options?.addValidationContainer) {
      useContainer(app.select(module), { fallbackOnErrors: true });
    }
    const config = app.get(ConfigService, { strict: false });

    if (config.get('app.cors') || options?.cors) {
      const corsRule = options?.cors ?? (config.get('app.cors') as CorsOptions);
      app.enableCors(corsRule);
    }

    /**
     * Explicitly enable body parsers, so that they are available in all of the middlewares.
     */
    app.useBodyParser('json');
    app.useBodyParser('raw');
    app.useBodyParser('urlencoded');

    app.use(requestMiddleware);

    this.configureErrorReporter(config.get('app.sentry'));

    if (options.exceptionFilter) {
      const { httpAdapter } = app.get(HttpAdapterHost);
      app.useGlobalFilters(options.exceptionFilter(httpAdapter));
    }

    if (options?.globalPrefix) {
      app.setGlobalPrefix(options.globalPrefix);
    }

    console.log(
      'starting server on ',
      options?.port || (config.get('app.port') as number),
    );
    await app.listen(options?.port || (config.get('app.port') as number));
  }

  static configureErrorReporter(config: Record<string, any>) {
    if (!config) return;

    if (Obj.isObj(config) && config?.dsn) {
      const {
        dsn,
        tracesSampleRate,
        integrateNodeProfile,
        profilesSampleRate,
      } = config;

      if (dsn) {
        const Sentry = Package.load('@sentry/node');
        const integrations = [];
        /**
         * Load integrations
         */
        if (integrateNodeProfile) {
          const { nodeProfilingIntegration } = Package.load(
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
