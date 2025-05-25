export type Payload = Record<string, any> | string | number;

export interface JobOptions {
  delay?: number | string | Date;
  tries?: number;
  queue?: string;
  timeout?: number;
  connection?: string;
}

export interface Message extends JobOptions {
  job: string;
  data: Payload | Payload[];
}

export interface InternalMessage extends Message {
  attemptCount: number;
  id: string;
  delay?: number;
  netDelayInSeconds?: number;
}
