import { findSourceMap } from "module";
import * as fs from "node:fs";

import { ChannelCredentials } from "@grpc/grpc-js";
import { GrpcTransport } from "@protobuf-ts/grpc-transport";
import callsites from "callsites";

import { translate } from "../third-party/line-numbers.js";

import { LogClient, RequestResult, RequestStatus } from "./cc-service.js";
import { BacktraceData, Log } from "./data.js";

// TODO(STBoyden): Docmentation!

type Nothing = undefined;

export type ErrorMessage = string;

/**
 * An enum that describes the nature of the error returned by any of the `log`
 * functions.
 */
export enum LoggerError {
  BATCH_EMPTY,
  REQUEST_ERROR,
}

/**
 * A "result" type that is used in conjuction with the `LoggerError` enum to
 * describe and handle a possible error returned from the `log` functions.
 */
export class LoggerResult<T> {
  private inner: T | LoggerError | null = null;
  private message?: string;

  private constructor(inner: T | LoggerError, message?: string) {
    this.inner = inner;
    this.message = message;
  }

  /**
   * Create a new `LoggerResult<T>` that is guaranteed to have an `inner` data
   * of type `T`.
   *
   * @param { T } data - The `T` data to insert into the inner value of this result type.
   */
  public static Ok<T>(data: T): LoggerResult<T> {
    return new LoggerResult(data);
  }

  /**
   * Create a new `LoggerResult<T>` that is guaranteed to have an `inner` data
   * of `LoggerError` with an optional accompanying `message` string.
   *
   * @param { LoggerError } error - The enum describes the reason behind the error.
   * @param { string | undefined } message - The optional message for additional context to the `error`.
   */
  public static Err<T>(error: LoggerError, message?: string): LoggerResult<T> {
    return new LoggerResult<T>(error, message);
  }

  /**
   * Returns the `T` value if the `inner` value is expected to be `T`,
   * otherwise return `null`.
   */
  public unwrap(): T | null {
    if ((this.inner as T) !== undefined) return this.inner as T;

    if (this.message) console.error(this.message);

    return null;
  }

  /**
   * Returns an object containing the `inner` data and the optional message if
   * it is expected to be a `LoggerError`, otherwise return `null`.
   */
  public unwrapErr(): {
    error: LoggerError;
    message: string | undefined;
  } | null {
    if ((this.inner as LoggerError) !== undefined)
      return { error: this.inner as LoggerError, message: this.message };

    return null;
  }

  /**
   * Returns whether or not the inner value of this result type is `T`.
   */
  public isOk(): boolean {
    return (this.inner as T) !== undefined;
  }

  /**
   * Returns whether or not the inner value of this result type is `LoggerError`.
   */
  public isErr(): boolean {
    return (this.inner as LoggerError) !== undefined;
  }
}

/**
 * A generic interface that simply requires that everything that implements it
 * has a `toString` function.
 */
export interface ToString {
  toString: () => string;
}

/**
 * The `LogBatch` helper class to help with creating multiple logs without
 * sending, and sending the created logs at a chosen point in time. Use in
 * conjunction with `Logger.startBatch()` and `Logger.sendBatch()`.
 */
export class LogBatch {
  private logBatch: Log[] = [];
  private host = "127.0.0.1";
  private port = "3002";
  private surround = 3;
  private logger: Logger | null = null;

  /**
   * Set the `host` for this batch of logs.
   *
   * @param { string } host - This hostname/IP/domain of the remote CodeCTRL server.
   */
  public setHost(host: string): this {
    this.host = host;

    return this;
  }

  /**
   * Set the `port` for this batch of logs.
   *
   * @param { string } port - The port of that the remote CodeCTRL server is listening on.
   */
  public setPort(port: string): this {
    this.port = port;

    return this;
  }

  /**
   * Set the `surround` for this batch of logs.
   *
   * @param { number } surround - The amount of code lines to include in the code snippet surrounding the log line.
   */
  public setSurround(surround: number): this {
    this.surround = surround;

    return this;
  }

  /**
   * Adds a `log` to the current `LogBatch`.
   *
   * @param { T } message - The message for the current log.
   * @param { number | undefined } surround - The optional surrounding amount of code lines to include in the code snippet.
   */
  public addLog<T extends ToString>(message: T, surround?: number): this {
    const _surround = surround ?? this.surround;

    this.logBatch.push(Logger.createLog(message, _surround));

    return this;
  }

  /**
   * Adds a `log` to the current `LogBatch` that only sends if the `condition`
   * resolves to `true`.
   *
   * @param { () => boolean } condition - The condition function that determines whether the log gets sent to the remote.
   * @param { T } message - The message for the current log.
   * @param { number | undefined } surround - The optional surrounding amount of code lines to include in the code snippet.
   */
  public addLogIf<T extends ToString>(
    condition: () => boolean,
    message: T,
    surround?: number
  ): this {
    const _surround = surround ?? this.surround;

    if (condition()) this.logBatch.push(Logger.createLog(message, _surround));

    return this;
  }

  /**
   * Adds a `log` to the current `LogBatch` if the `CODECTRL_DEBUG` environment
   * variable is present.
   *
   * @param { T } message - The message for the current log.
   * @param { number | undefined } surround - The optional surrounding amount of code lines to include in the code snippet.
   */
  public addLogWhenEnv<T extends ToString>(
    message: T,
    surround?: number
  ): this {
    const _surround = surround ?? this.surround;

    if (process.env.CODECTRL_DEBUG)
      this.logBatch.push(Logger.createLog(message, _surround));

    return this;
  }

  /**
   * Creates the final `Logger` that will be used to send the batch of logs
   * created with the `addLog`, `addLogIf` and `addLogWhenEnv` functions.
   */
  public build(): Logger {
    this.logger = new Logger(this.logBatch, this.host, this.port);

    return this.logger;
  }
}

export class Logger {
  private logBatch: Log[];
  private batchHost: string;
  private batchPort: string;

  /**
   * Creates a new `Logger` with a pre-defined log batch, hostname and port.
   *
   * @param { Log[] } logs - The log batch to be sent with this `Logger`.
   * @param { string } host - The hostname/IP/domain of the remote CodeCTRL server for this batch to be sent to.
   * @param { string } port - The port that the remote CodeCTRL server is listening on.
   */
  public constructor(logs: Log[], host: string, port: string) {
    this.logBatch = logs;
    this.batchHost = host;
    this.batchPort = port;
  }

  /**
   * Starts a new `LogBatch` to add multiple logs at once.
   */
  public static startBatch(): LogBatch {
    return new LogBatch();
  }

  /**
   * Sends the current `logBatch` created created by the `LogBatch` helper
   * class or the constructor of this class.
   */
  public async sendBatch(): Promise<LoggerResult<Nothing>> {
    if (this.logBatch.length === 0) {
      return LoggerResult.Err(LoggerError.BATCH_EMPTY);
    }

    const transport = new GrpcTransport({
      host: `${this.batchHost}:${this.batchPort}`,
      channelCredentials: ChannelCredentials.createInsecure(),
    });
    const client = new LogClient(transport);
    const call = client.sendLogs({});

    this.logBatch.forEach(
      async (log, _index, _arr) => await call.requests.send(log)
    );

    await call.requests.complete();

    const result = await call.response;

    if (result.status === RequestStatus.ERROR)
      // TODO: check auth
      return LoggerResult.Err(LoggerError.REQUEST_ERROR, result.message);

    return LoggerResult.Ok(undefined);
  }

  /**
   * The basic log function.
   *
   * @param { T extends {toString: () => string } } message - The message to be
   * sent to the logger. Accepts any `T` that implements a `toString` function.
   *
   * @param { number | null } surround - The amount of surrounding code to
   * include in the code snippet.
   *
   * @param { string | null } host - The host of the CodeCTRL instance.
   *
   * @param { string | null } port - The port of the CodeCTRL instance.
   *
   */
  public static async log<T extends ToString>(
    message: T,
    surround?: number,
    host?: string,
    port?: string
  ): Promise<LoggerResult<RequestResult>> {
    const __surround = surround ?? 3;
    const __host = host ?? "127.0.0.1";
    const __port = port ?? "3002";

    const log = this.createLog(message, __surround);

    const transport = new GrpcTransport({
      host: `${__host}:${__port}`,
      channelCredentials: ChannelCredentials.createInsecure(),
    });
    const client = new LogClient(transport);
    const result = await client.sendLog(log).response;

    return LoggerResult.Ok(result);
  }

  /**
   * A log function that takes an anonymous function, and only logs if the
   * function returns a true condition.
   *
   * @param { () => boolean } condition - The anonymous function that
   * determines whether a log is sent.
   *
   * @param { T extends {toString: () => string } } message - The message to be
   * sent to the logger. Accepts any `T` that implements a `toString` function.
   *
   * @param { number | null } surround - The amount of surrounding code to
   * include in the code snippet.
   *
   * @param { string | null } host - The host of the CodeCTRL instance.
   *
   * @param { string | null } port - The port of the CodeCTRL instance.
   *
   */
  public static async logIf<T extends ToString>(
    condition: () => boolean,
    message: T,
    surround?: number,
    host?: string,
    port?: string
  ): Promise<LoggerResult<RequestResult | false>> {
    if (condition()) {
      return await this.log(message, surround, host, port);
    }

    return LoggerResult.Ok(false);
  }

  /**
   * A log function similar to `Logger.logIf` that only takes effect if the
   * environment variable `CODECTRL_DEBUG` is present or not.
   *
   * @param { T extends {toString: () => string } } message - The message to be
   * sent to the logger. Accepts any `T` that implements a `toString` function.
   *
   * @param { number | null } surround - The amount of surrounding code to
   * include in the code snippet.
   *
   * @param { string | null } host - The host of the CodeCTRL instance.
   *
   * @param { string | null } port - The port of the CodeCTRL instance.
   *
   */
  public static async logWhenEnv<T extends ToString>(
    message: T,
    surround?: number,
    host?: string,
    port?: string
  ): Promise<LoggerResult<RequestResult | false>> {
    if (process.env.CODECTRL_DEBUG) {
      return await this.log(message, surround, host, port);
    }

    return LoggerResult.Ok(false);
  }

  public static createLog<T extends ToString>(
    message: T,
    _surround: number
  ): Log {
    const log = <Log>{
      uuid: "",
      stack: [] as BacktraceData[],
      lineNumber: 0,
      codeSnippet: {},
      message: message.toString(),
      messageType: typeof message,
      fileName: "",
      address: "",
      language: "JavaScript",
      warnings: [] as string[],
    };

    this.getStackTrace(log);

    const last = log.stack.pop();
    if (last) {
      log.lineNumber = last.lineNumber;
      log.fileName = last.filePath;

      log.codeSnippet = this.getCodeSnippet(
        last.filePath,
        last.lineNumber,
        _surround
      );

      log.stack.push(last);
    }

    return log;
  }

  private static getStackTrace(log: Log) {
    Error.stackTraceLimit = Infinity;

    const stacklist: BacktraceData[] = [];

    callsites().forEach((trace, _index, _arr) => {
      let fileName = trace.getFileName();
      const functionName = trace.getFunctionName();

      if (
        functionName &&
        fileName &&
        !(
          functionName === "getStackTrace" ||
          functionName === "log" ||
          functionName === "logIf" ||
          functionName === "logWhenEnv" ||
          functionName === "addLog" ||
          functionName === "addLogIf" ||
          functionName === "addLogWhenEnv" ||
          functionName === "createLog"
        ) &&
        !(fileName.startsWith("node:") || fileName.includes("node_modules"))
      ) {
        const sourceMap = findSourceMap(fileName);

        const {
          fileName: originalFileName,
          line,
          column,
        } = translate(sourceMap, {
          line: trace.getLineNumber() ?? 0,
          column: trace.getColumnNumber() ?? 0,
        });

        if (originalFileName) {
          // whenever syntect gets support for TypeScript syntax highlighting, uncomment
          // this for "TypeScript". For now, use default "JavaScript".
          // log.language = "TypeScript";
          fileName = originalFileName ?? fileName;
        }

        fileName = fileName.replace("file://", "");

        stacklist.unshift(<BacktraceData>{
          filePath: fileName,
          lineNumber: line,
          columnNumber: column,
          name: functionName,
          code: this.getCode(fileName, line - 1),
        });
      }
    });

    log.stack = stacklist;
  }

  private static getCode(filePath: string, lineNumber: number): string {
    const file = fs.readFileSync(filePath, "utf8");

    return file.split("\n")[lineNumber].trim();
  }

  private static getCodeSnippet(
    filePath: string,
    lineNumber: number,
    surround: number
  ): { [key: number]: string } {
    const file = fs.readFileSync(filePath, "utf8");
    const fileData = file.split("\n");

    let offset = lineNumber - surround;

    if (offset < 0) {
      offset = 0;
    }

    let end = lineNumber + surround;
    if (end > Number.MAX_SAFE_INTEGER) {
      end = Number.MAX_SAFE_INTEGER;
    }

    const lines: { [key: number]: string } = {};

    for (let i = offset; i <= end; i++) lines[i] = fileData[i - 1];

    return lines;
  }
}
