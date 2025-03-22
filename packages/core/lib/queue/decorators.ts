import 'reflect-metadata';
import { ListensTo } from '../events/index.js';
import { events, JOB_NAME, JOB_OPTIONS } from './constants.js';
import { JobOptions } from './strategy/index.js';

export function Job(job: string, options?: JobOptions) {
  options = options || {};
  return function (target: Record<string, any>, propertyKey: string) {
    Reflect.defineMetadata(JOB_NAME, job, target, propertyKey);
    Reflect.defineMetadata(JOB_OPTIONS, options, target, propertyKey);
  };
}

/**
 * Decorator for running methods on any failed jobs
 */
export function OnJobFailed() {
  return function (target: Record<string, any>, propertyKey: string) {
    ListensTo(events.jobFailed)(target, propertyKey);
  };
}

/**
 * Decorator for running methods on job processing
 */
export function OnJobProcessing() {
  return function (target: Record<string, any>, propertyKey: string) {
    ListensTo(events.jobProcessing)(target, propertyKey);
  };
}

/**
 * Decorator for running methods on any processed jobs
 */
export function OnJobProcessed() {
  return function (target: Record<string, any>, propertyKey: string) {
    ListensTo(events.jobProcessed)(target, propertyKey);
  };
}
