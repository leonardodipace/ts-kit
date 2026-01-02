import type { Formatter } from "./formatter.js";

export enum LogLevel {
  DEBUG = 10,
  INFO = 20,
  WARNING = 30,
  ERROR = 40,
  CRITICAL = 50,
}

export type LogLevelType = keyof typeof LogLevel;

export type LogMessageType = string | object | number;

export type LogDataType = {
  prefix: string;
  level: LogLevelType;
  msg: LogMessageType;
};

export type ProviderOptions = {
  level?: LogLevel;
  formatter?: Formatter;
};
