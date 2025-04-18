import { Message } from '../../queue/index.js';

export type ScheduleOptions = {
  name?: string;
  timezone?: string;
  purpose?: string;
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
