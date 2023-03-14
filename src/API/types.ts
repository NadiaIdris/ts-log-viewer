export enum LogLevel {
  Debug = "DEBUG",
  Info = "INFO",
  Warning = "WARNING",
  Error = "ERROR",
}

export interface LogLine {
  ts: number;
  level: LogLevel;
  msg: string;
  replica: string;
}
