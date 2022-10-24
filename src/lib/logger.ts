function createLog<T>(
  message: T,
  surround: number,
  functionName?: string,
  functionNameOccurences?: string
) {
  return;
}

class Logger {
  public log<T>(
    message: T,
    _surround?: number,
    _host?: string,
    _port?: string
  ) {
    const surround = _surround ?? 3;
    const host = _host ?? '127.0.0.1';
    const port = _port ?? '3002';

    const log = createLog(message, surround);
  }
}

export { Logger };
