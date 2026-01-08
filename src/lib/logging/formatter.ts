import type { DateFmtFnType, LogDataType } from "./types.js";

export abstract class Formatter<Input = LogDataType, Output = string> {
  protected dateFmt: DateFmtFnType;

  public constructor(dateFmt: DateFmtFnType) {
    this.dateFmt = dateFmt;
  }

  public abstract format(logData: Input): Output;
}

export class BaseFormatter extends Formatter {
  public constructor(dateFmt: DateFmtFnType = isoDateTimeFormat) {
    super(dateFmt);
  }

  public format(logData: LogDataType): string {
    let { prefix, level, msg } = logData;
    const timestamp = this.dateFmt();
    const levelType = level.toUpperCase();
    if (typeof msg === "object") {
      msg = JSON.stringify(msg);
    }

    return `${timestamp}  [${levelType}]\t[${prefix}] : ${msg}`;
  }
}

export class JSONFormatter extends Formatter {
  public constructor(dateFmt: DateFmtFnType = isoDateTimeFormat) {
    super(dateFmt);
  }

  public format(logData: LogDataType): string {
    let { prefix, level, msg } = logData;
    const timestamp = this.dateFmt();
    const levelType = level.toUpperCase();

    const data = {
      timestamp,
      level: levelType,
      prefix,
      msg
    };
    return JSON.stringify(data);
  }
}

export function isoDateTimeFormat() {
  return new Date().toISOString();
}

export function isoDateFormat() {
  const date = new Date();
  const day = date.getUTCDate();
  const month = date.getUTCMonth() + 1;
  const year = date.getUTCFullYear();

  return `${year}-${month}-${day}`;
}

export function dmyFormat() {
  const date = new Date();
  const day = date.getUTCDate();
  const month = date.getUTCMonth() + 1;
  const year = date.getUTCFullYear();

  return `${day}-${month}-${year}`;
}

export function mdyFormat() {
  const date = new Date();
  const day = date.getUTCDate();
  const month = date.getUTCMonth() + 1;
  const year = date.getUTCFullYear();

  return `${month}-${day}-${year}`;
}
