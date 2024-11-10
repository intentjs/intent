import { DiscoveryService, MetadataScanner } from '@nestjs/core';
import { CommandMeta, CommandMetaOptions } from './console';
import { ConsoleConstants } from './console/constants';
import { EventMetadata } from './events';
import { IntentEventConstants } from './events/constants';
import { Injectable } from './foundation';
import { GenericFunction } from './interfaces';
import { JOB_NAME, JOB_OPTIONS } from './queue/constants';
import { QueueMetadata } from './queue/metadata';
import { Limiter } from './limiter';
import { ulid } from 'ulid';
import { REFILL_INTERVAL, TOKEN_COUNT } from './limiter/constants';

@Injectable()
export class IntentExplorer {
  constructor(
    private readonly discovery: DiscoveryService,
    private readonly metadataScanner: MetadataScanner,
  ) {}

  onModuleInit() {
    const wrappers = this.discovery.getProviders();
    wrappers.forEach(w => {
      const { instance } = w;
      if (
        !instance ||
        typeof instance === 'string' ||
        !Object.getPrototypeOf(instance)
      ) {
        return;
      }

      this.metadataScanner.scanFromPrototype(
        instance,
        Object.getPrototypeOf(instance),
        (key: string) => {
          this.lookupJobs(instance, key);
          this.lookupEventListeners(instance, key);
          this.lookupConsoleCommands(instance, key);
        },
      );
    });
  }

  lookupJobs(instance: Record<string, GenericFunction>, key: string) {
    const methodRef = instance[key];
    const hasJobMeta = Reflect.hasMetadata(JOB_NAME, instance, key);
    if (!hasJobMeta) return;
    const jobName = Reflect.getMetadata(JOB_NAME, instance, key);
    QueueMetadata.addJob(jobName, {
      options: Reflect.getMetadata(JOB_OPTIONS, instance, key),
      target: methodRef.bind(instance),
    });
  }

  lookupEventListeners(instance: Record<string, any>, key: string) {
    const methodRef = instance[key];
    const hasEventMeta = Reflect.hasMetadata(
      IntentEventConstants.eventName,
      instance,
      key,
    );
    if (!hasEventMeta) return;
    const eventName = Reflect.getMetadata(
      IntentEventConstants.eventName,
      instance,
      key,
    );
    EventMetadata.addListener(eventName, methodRef.bind(instance));
  }

  lookupConsoleCommands(
    instance: Record<string, GenericFunction>,
    key: string,
  ) {
    const methodRef = instance[key];
    const hasCommandMeta = Reflect.hasMetadata(
      ConsoleConstants.commandName,
      instance,
      key,
    );
    const isClassConsoleCommand = Reflect.hasMetadata(
      ConsoleConstants.commandName,
      instance.constructor,
    );

    if (!hasCommandMeta && !isClassConsoleCommand) return;

    if (isClassConsoleCommand && key != 'handle') return;

    const command =
      Reflect.getMetadata(ConsoleConstants.commandName, instance, key) ||
      Reflect.getMetadata(ConsoleConstants.commandName, instance.constructor);

    const options: CommandMetaOptions =
      Reflect.getMetadata(ConsoleConstants.commandOptions, instance, key) ||
      Reflect.getMetadata(
        ConsoleConstants.commandOptions,
        instance.constructor,
      );

    CommandMeta.setCommand(command, options, methodRef.bind(instance));
  }

  lookupLimittedMethods(
    instance: Record<string, GenericFunction>,
    key: string,
  ) {
    let methodRef = instance[key];
    const hasCommandMeta = Reflect.hasMetadata(TOKEN_COUNT, instance, key);

    if (!hasCommandMeta) return;

    const tokensCount = Reflect.getMetadata(TOKEN_COUNT, instance, key);
    const frequency = Reflect.getMetadata(REFILL_INTERVAL, instance, key);
    const funcKey = ulid();
    Limiter.initializeToken(key + funcKey, tokensCount, frequency);
    instance[key] = function (...args) {
      Limiter.useToken(key + funcKey);
      return methodRef.apply(instance, args);
    };
  }
}
