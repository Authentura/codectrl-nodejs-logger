import { findSourceMap } from "module";
import * as fs from "node:fs";

import { ChannelCredentials, Metadata } from "@grpc/grpc-js";
import { GrpcTransport } from "@protobuf-ts/grpc-transport";
import callsites from "callsites";

import { translate } from "../third-party/line-numbers.js";

import { LogClient, RequestResult, RequestStatus } from "./cc-service.js";
import { BacktraceData, Log } from "./data.js";

// TODO(STBoyden): Docmentation!

type Nothing = undefined;

export type ErrorMessage = string;

export enum LoggerError {
  BATCH_EMPTY,
  REQUEST_ERROR,
}

export class LoggerResult<T> {
  private inner: T | LoggerError | null = null;
  private message?: string;

  private constructor(inner: T | LoggerError, message?: string) {
    this.inner = inner;
    this.message = message;
  }

  public static Ok<T>(data: T): LoggerResult<T> {
    return new LoggerResult(data);
  }

  public static Err<T>(error: LoggerError, message?: string): LoggerResult<T> {
    return new LoggerResult<T>(error, message);
  }

  public unwrap(): T | null {
    if (this.inner as T != undefined)
      return this.inner as T;

    if (this.message)
      console.error(this.message);

    return null;
  }
}

/**
 * A generic interface that simply requires that everything that implements it
 * has a `toString` function.
 */
export interface ToString {
  toString: () => string;
}

class LogBatch {
  private logBatch: Log[] = [];
  private host = "127.0.0.1";
  private port = "3002";
  private surround = 3;
  private logger: Logger | null = null;

  public setHost(host: string): this {
    this.host = host;

    return this;
  }

  public setPort(port: string): this {
    this.port = port;

    return this;
  }

  public setSurround(surround: number): this {
    this.surround = surround;

    return this;
  }


  public addLog<T extends ToString>(message: T, surround?: number): this {
    const _surround = surround ?? this.surround;


    this.logBatch.push(
      Logger.createLog(
        message,
        _surround,
      )
    );

    return this;
  }

  public addLogIf<T extends ToString>(condition: () => boolean, message: T, surround?: number): this {
    const _surround = surround ?? this.surround;


    if (condition())
      this.logBatch.push(
        Logger.createLog(
          message,
          _surround,
        )
      );

    return this;
  }


  public addLogWhenEnv<T extends ToString>(message: T, surround?: number): this {
    const _surround = surround ?? this.surround;


    if (process.env.CODECTRL_DEBUG)
      this.logBatch.push(
        Logger.createLog(
          message,
          _surround,
        )
      );

    return this;
  }

  public build(): Logger {
    this.logger = new Logger(this.logBatch, this.host, this.port);

    return this.logger;
  }
}

export class Logger {
  private logBatch: Log[];
  private batchHost: string;
  private batchPort: string;

  public constructor(logs: Log[], host: string, port: string) {
    this.logBatch = logs;
    this.batchHost = host;
    this.batchPort = port;
  }

  public static startBatch(): LogBatch {
    return new LogBatch();
  }

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

    if (result.status === RequestStatus.ERROR) // TODO: check auth
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
    _surround: number,
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
        _surround,
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
    surround: number,
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

    for (let i = offset; i <= end; i++)
      lines[i] = fileData[i - 1];

    return lines;
  }
}
