import { DiscoveryService, MetadataScanner } from '@nestjs/core';
import { CommandMeta, CommandMetaOptions } from './console/index.js';
import { ConsoleConstants } from './console/constants.js';
import { EventMetadata } from './events/index.js';
import { IntentEventConstants } from './events/constants.js';
import { GenericFunction } from './interfaces/index.js';
import { JOB_NAME, JOB_OPTIONS } from './queue/constants.js';
import { QueueMetadata } from './queue/metadata.js';
import { Injectable } from './foundation/decorators.js';
import { TASK_SCHEDULE, TASK_SCHEDULE_OPTIONS } from './scheduler/constants.js';
import { SchedulerRegistry } from './scheduler/metadata.js';
import { ScheduleOptions } from './scheduler/options/interface.js';
import { ulid } from 'ulid';

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
          this.lookupSchedules(instance, key);
        },
      );
    });
  }

  lookupSchedules(instance: Record<string, GenericFunction>, key: string) {
    const methodRef = instance[key];
    const hasSchedule = Reflect.hasMetadata(TASK_SCHEDULE, instance, key);
    const isClassScheduleTask = Reflect.hasMetadata(
      TASK_SCHEDULE,
      instance.constructor,
    );

    if (!hasSchedule && !isClassScheduleTask) return;

    if (isClassScheduleTask && key != 'handle') return;

    const command =
      Reflect.getMetadata(TASK_SCHEDULE, instance, key) ||
      Reflect.getMetadata(TASK_SCHEDULE, instance.constructor);

    const options: ScheduleOptions =
      Reflect.getMetadata(TASK_SCHEDULE_OPTIONS, instance, key) ||
      Reflect.getMetadata(TASK_SCHEDULE_OPTIONS, instance.constructor);

    /**
     * Check if the schedule is class based,
     * if yes, then fill the name of the schedule with the name of the class, if not already filled.
     * if no, then assign a ulid() to it.
     */
    const name = options.name
      ? options.name
      : isClassScheduleTask
        ? `${instance.constructor.name}#handle`
        : ulid();
    SchedulerRegistry.addSchedule(command, methodRef.bind(instance), {
      ...options,
      name,
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
}
