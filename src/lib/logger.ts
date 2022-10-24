import { BacktraceData, Log } from "./data";

function createLog<T extends string>(
  message: T,
  surround: number,
  _functionName?: string,
  _functionNameOccurences?: string
): Log {
  const functionName = _functionName ?? "";
  const log = new Log();

  log.setMessage(message);
  log.setMessagetype(typeof message);
  log.setLanguage("JavaScript");

  return log;
}

class Logger {
  public static log<T extends string>(
    message: T,
    _surround?: number,
    _host?: string,
    _port?: string
  ) {
    const surround = _surround ?? 3;
    const host = _host ?? "127.0.0.1";
    const port = _port ?? "3002";

    const log = createLog(message, surround);
  }

  public static getStackTrace(log: Log) {
    const dummy = new Error();
    const traces: NodeJS.CallSite[] = [];
    const origPrepareStackTrace = Error.prepareStackTrace;

    Error.prepareStackTrace = (_, stacktraces) => {
      traces.concat(stacktraces);
    };

    Error.captureStackTrace(dummy, Logger.getStackTrace);

    Error.prepareStackTrace = origPrepareStackTrace;

    traces.forEach((trace, _index, _arr) => {
      const backtrace = new BacktraceData();
      backtrace.setFilepath(trace.getFileName() ?? "");
      backtrace.setLinenumber(trace.getLineNumber() ?? 0);
      backtrace.setColumnnumber(trace.getColumnNumber() ?? 0);
      backtrace.setName(trace.getMethodName() ?? "");

      log.getStackList().unshift(backtrace);
    });
  }
}

export { Logger };
