import { transports, format, transport } from 'winston';

export enum Transports {
  Default,
  Console,
  File,
  Http,
  Stream,
}

export type TransportOptions =
  | transports.ConsoleTransportOptions
  | transports.HttpTransportOptions
  | transports.FileTransportOptions
  | transports.StreamTransportOptions;

export enum Formats {
  Default,
  Simple,
  Align,
  Cli,
  Colorize,
  Combine,
  Errors,
  Json,
  Label,
  Logstash,
  Metadata,
  Ms,
  PadLevels,
  PrettyPrint,
  Printf,
  Splat,
  Timestamp,
  Uncolorize,
}

export interface LoggerConfig {
  level?: LogLevel;
  transports?: {
    format?: Formats | Formats[];
    transport?: Transports | transport;
    labels?: Record<string, any>;
    options?: TransportOptions;
  }[];
}
export const defaultLoggerOptions = (): {
  level: LogLevel;
  [key: string]: any;
} => ({
  level: 'debug',
  transports: [{ transport: Transports.Default, format: Formats.Default }],
});

export interface LoggerOptions {
  default: string;
  disableConsole: boolean;
  loggers: {
    [key: string]: LoggerConfig;
  };
}

export const TransportsMap = {
  [Transports.Default]: transports.Console,
  [Transports.Console]: transports.Console,
  [Transports.File]: transports.File,
  [Transports.Http]: transports.Http,
  [Transports.Stream]: transports.Stream,
};

const defaultFormat = () => {
  const date = new Date().toISOString();
  const logFormat = format.printf(info => {
    return `[${info.level}] ${date} : ${JSON.stringify(info.message)}`;
  });
  return format.combine(format.colorize(), logFormat);
};

export const FormatsMap = {
  [Formats.Default]: defaultFormat,
  [Formats.Simple]: format.simple,
  [Formats.Align]: format.align,
  [Formats.Cli]: format.cli,
  [Formats.Colorize]: format.colorize,
  [Formats.Combine]: format.combine,
  [Formats.Errors]: format.errors,
  [Formats.Json]: format.json,
  [Formats.Label]: format.label,
  [Formats.Logstash]: format.logstash,
  [Formats.Metadata]: format.metadata,
  [Formats.Ms]: format.ms,
  [Formats.PadLevels]: format.padLevels,
  [Formats.PrettyPrint]: format.prettyPrint,
  [Formats.Printf]: format.printf,
  [Formats.Splat]: format.splat,
  [Formats.Timestamp]: format.timestamp,
  [Formats.Uncolorize]: format.uncolorize,
};

export type LogLevel = 'error' | 'warn' | 'info' | 'http' | 'verbose' | 'debug';
