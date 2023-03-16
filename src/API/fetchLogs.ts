import { LogLevel, LogLine } from "./types";

const LEVELS = [
  LogLevel.Debug,
  LogLevel.Info,
  LogLevel.Warning,
  LogLevel.Error,
];

function sleep(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

/**
 * API that provides a series of logs asynchronously. You can treat the function implementation as a
 * black box and assume it's a thin wrapper around a REST API.
 *
 * @param start Minimum Unix time to include logs from, in seconds
 * @param end Unix time after which to not include logs (exclusive bound), in seconds
 * @param level The minimum level of logs to include. E.g. if `level` is `LogLevel.Warning`, both Warning
 * and Error logs will be returned
 * @returns An array of log lines
 */
export default async function fetchLogs(
  start: number,
  end: number,
  level: LogLevel = LogLevel.Debug
): Promise<LogLine[]> {
  const logs: LogLine[] = [];
  const levelIdx = LEVELS.indexOf(level);

  const nowTs = Math.floor(new Date().getTime() / 1000);

  for (let ts = Math.floor(start); ts < Math.min(end, nowTs); ts++) {
    if (ts % 5 === 0) {
      if (levelIdx === 0) {
        // Debug
        logs.push({
          ts,
          level: LogLevel.Debug,
          msg: "200 GET /healthz (172.17.0.1) 0.85ms",
          replica: "replica-1",
        });
      }
    }

    if (ts % 5 === 2) {
      if (levelIdx === 0) {
        logs.push({
          ts,
          level: LogLevel.Debug,
          msg: "200 GET /healthz (172.17.0.1) 0.85ms",
          replica: "replica-2",
        });
      }
    }

    if (ts % 60 === 34) {
      if (levelIdx <= 1) {
        // Info
        logs.push({
          ts,
          level: LogLevel.Info,
          msg: "Will fork 1 workers",
          replica: "replica-1",
        });
      }
    }

    if (ts % 30 === 22) {
      // Error
      logs.push({
        ts,
        level: LogLevel.Error,
        msg: "Caught exception in:",
        replica: "replica-1",
      });
      logs.push({
        ts,
        level: LogLevel.Error,
        msg: '  File "/home/runner/work/r3bl/r3bl/.venv/lib/python3.9/site-packages/promise/promise.py", line 489, in _resolve_from_executor',
        replica: "replica-1",
      });
      logs.push({
        ts,
        level: LogLevel.Error,
        msg: "    executor(resolve, reject)",
        replica: "replica-1",
      });
      logs.push({
        ts,
        level: LogLevel.Error,
        msg: '  File "/home/runner/work/r3bl/r3bl/.venv/lib/python3.9/site-packages/promise/promise.py", line 756, in executor',
        replica: "replica-1",
      });
      logs.push({
        ts,
        level: LogLevel.Error,
        msg: "    return resolve(f(*args, **kwargs))",
        replica: "replica-1",
      });
      logs.push({
        ts,
        level: LogLevel.Error,
        msg: '  File "/home/runner/work/r3bl/r3bl/.venv/lib/python3.9/site-packages/graphql/execution/middleware.py", line 75, in make_it_promise',
        replica: "replica-1",
      });
      logs.push({
        ts,
        level: LogLevel.Error,
        msg: "    return next(*args, **kwargs)",
        replica: "replica-1",
      });
      logs.push({
        ts,
        level: LogLevel.Error,
        msg: '  File "/home/runner/work/r3bl/r3bl/backend/users/services.py", line 88, in wrap_function',
        replica: "replica-1",
      });
      logs.push({
        ts,
        level: LogLevel.Error,
        msg: "    return function(*args, **kwargs)",
        replica: "replica-1",
      });
      logs.push({
        ts,
        level: LogLevel.Error,
        msg: '  File "/home/runner/work/r3bl/r3bl/backend/common/graphql/utils.py", line 170, in func_wrapper',
        replica: "replica-1",
      });
      logs.push({
        ts,
        level: LogLevel.Error,
        msg: "    raise GraphQLResourceNotValidatedError(e)",
        replica: "replica-1",
      });
      logs.push({
        ts,
        level: LogLevel.Error,
        msg: "graphql.error.located_error.GraphQLLocatedError: File is too large. It must be at most 4gb.",
        replica: "replica-1",
      });
    }
  }

  await sleep(100);

  return logs;
}