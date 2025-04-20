import { Message } from '../../queue/index.js';

export type ScheduleOptions = {
  name?: string;
  timezone?: string;
  purpose?: string;
  outputFile?: { file: string; append?: boolean };
};

export enum HandlerType {
  COMMAND,
  JOB,
  FUNCTION,
  SHELL,
}

export type ScheduleHandler =
  | { type: HandlerType.COMMAND; value: string }
  | { type: HandlerType.JOB; value: Message }
  | { type: HandlerType.FUNCTION; value: any }
  | { type: HandlerType.SHELL; value: any }
  | null;

export type PingOptions = {
  url: string;
  ifCb: undefined | ((...args: any[]) => Promise<boolean> | boolean);
};

export type SchedulerConfig = {
  autoStart?: boolean;
};
