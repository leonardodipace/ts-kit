import { appendFileSync } from "node:fs";
import type { Formatter } from "./formatter.js";
import {
  type LogDataType,
  LogLevel,
  type LogLevelType,
  type ProviderOptions,
} from "./types.js";

export abstract class AbstractLogger {
  abstract debug(msg: string): void;
  abstract info(msg: string): void;
  abstract warning(msg: string): void;
  abstract error(msg: string): void;
  abstract critical(msg: string): void;

  protected createLogData(
    level: LogLevelType,
    msg: string,
    prefix: string,
  ): LogDataType {
    return {
      level,
      msg,
      prefix,
    };
  }
}

export class Logger extends AbstractLogger {
  private providers: LoggerProvider[];
  private prefix: string;

  constructor(prefix: string, providers: LoggerProvider[]) {
    super();
    this.prefix = prefix;
    this.providers = providers;
  }

  public debug(msg: string) {
    const data = this.createLogData("DEBUG", msg, this.prefix);
    this.run(data);
  }

  public info(msg: string) {
    const data = this.createLogData("INFO", msg, this.prefix);
    this.run(data);
  }

  public warning(msg: string) {
    const data = this.createLogData("WARNING", msg, this.prefix);
    this.run(data);
  }

  public error(msg: string) {
    const data = this.createLogData("ERROR", msg, this.prefix);
    this.run(data);
  }

  public critical(msg: string) {
    const data = this.createLogData("CRITICAL", msg, this.prefix);
    this.run(data);
  }

  private run(data: LogDataType) {
    for (let i = 0; i < this.providers.length; i++) {
      const provider = this.providers[i];
      provider?.execute(data);
    }
  }
}

export abstract class LoggerProvider {
  protected options: ProviderOptions;

  constructor(options: ProviderOptions) {
    this.options = options;
  }

  abstract execute(data: LogDataType): void;

  public getLogLevel() {
    if (!this.options.level) {
      return LogLevel.DEBUG;
    }

    return this.options.level;
  }

  public setFormatter(formatter: Formatter) {
    this.options.formatter = formatter;
  }
}

export class FileProvider extends LoggerProvider {
  private file: string;

  constructor(file: string, options: ProviderOptions) {
    super(options);
    this.file = file;
  }

  public execute(data: LogDataType): void {
    const level = this.getLogLevel();
    const userLevel = LogLevel[data.level];
    if (level > userLevel) return;

    let { msg } = data;
    if (this.options.formatter) {
      msg = this.options.formatter.format(data);
    }
    appendFileSync(this.file, msg);
    appendFileSync(this.file, "\n");
  }
}

export class ConsoleProvider extends LoggerProvider {
  constructor(options: ProviderOptions) {
    super(options);
  }

  public execute(data: LogDataType): void {
    const level = this.getLogLevel();
    const userLevel = LogLevel[data.level];
    if (level > userLevel) return;

    let { msg } = data;
    if (this.options.formatter) {
      msg = this.options.formatter.format(data);
    }

    switch (userLevel) {
      case LogLevel.DEBUG:
        console.debug(msg);
        break;
      case LogLevel.INFO:
        console.info(msg);
        break;
      case LogLevel.WARNING:
        console.warn(msg);
        break;
      case LogLevel.ERROR:
        console.error(msg);
        break;
      case LogLevel.CRITICAL:
        console.error(msg);
        break;
      default:
        console.debug(msg);
        break;
    }
  }
}
