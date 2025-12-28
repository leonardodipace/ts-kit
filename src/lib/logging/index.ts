import { Formatter } from "./formatter.js";
import { LogDataType, type LoggingOptions, LogLevel, LogLevelType } from "./types.js";


class Logger {
  protected options: LoggingOptions;
  protected formatter!: Formatter;

  constructor(options: LoggingOptions) {
    this.options = options;
  }

  protected getLogLevel() {
    if (!this.options.level) {
      return LogLevel.DEBUG;
    }

    return this.options.level;
  }

  public setFormatter(formatter: Formatter) {
    this.formatter = formatter;
  }

  protected createLogData(level: LogLevelType, msg: string): LogDataType {
    return {
      level, msg, prefix: this.options.prefix
    };
  }
}


export class StreamLogger extends Logger {
  constructor(options: LoggingOptions) {
    super(options);
  }

  public debug(msg: string) {
    const level = this.getLogLevel();
    if (level > LogLevel.DEBUG) return;

    if (this.formatter) {
      const data = this.createLogData("DEBUG", msg);
      console.log(this.formatter.format(data));
    } else {
      console.debug(msg);
    }
  }

  public info(msg: string) {
    const level = this.getLogLevel();
    if (level > LogLevel.INFO) return;

    if (this.formatter) {
      const data = this.createLogData("INFO", msg);
      console.log(this.formatter.format(data));
    } else {
      console.debug(msg);
    }
  }

  public warning(msg: string) {
    const level = this.getLogLevel();
    if (level > LogLevel.WARNING) return;

    if (this.formatter) {
      const data = this.createLogData("WARNING", msg);
      console.log(this.formatter.format(data));
    } else {
      console.debug(msg);
    }
  }

  public error(msg: string) {
    const level = this.getLogLevel();
    if (level > LogLevel.ERROR) return;

    if (this.formatter) {
      const data = this.createLogData("ERROR", msg);
      console.log(this.formatter.format(data));
    } else {
      console.debug(msg);
    }
  }

  public critical(msg: string) {
    const level = this.getLogLevel();
    if (level > LogLevel.CRITICAL) return;

    if (this.formatter) {
      const data = this.createLogData("CRITICAL", msg);
      console.log(this.formatter.format(data));
    } else {
      console.debug(msg);
    }
  }
}

