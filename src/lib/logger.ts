import { findSourceMap } from "module";
import * as fs from "node:fs";

import { ChannelCredentials, Metadata } from "@grpc/grpc-js";
import { GrpcTransport } from "@protobuf-ts/grpc-transport";
import callsites from "callsites";
import mnemosist from "mnemonist";

import { translate } from "../third-party/line-numbers.js";

import { LogClient, RequestResult } from "./cc-service.js";
import { BacktraceData, Log } from "./data.js";


/**
 * A generic interface that simply requires that everything that implements it
 * has a `toString` function.
 */
export interface ToString {
  toString: () => string;
}

export class LogBatch<T extends ToString> {
  private logBatch: Log[] = [];
  private host = "127.0.0.1";
  private port = "3002";
  private surround = 3;
  functionNameOccurences: mnemosist.MultiSet<string> = new mnemosist.MultiSet();

  public constructor() {
    return;
  }
}

export class Logger {
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
  ): Promise<RequestResult> {
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

    return result;
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
  ): Promise<RequestResult | null> {
    if (condition()) {
      return await this.log(message, surround, host, port);
    }

    return new Promise(() => {
      return;
    });
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
  ): Promise<RequestResult | null> {
    if (process.env.CODECTRL_DEBUG) {
      return await this.log(message, surround, host, port);
    }

    return new Promise(() => {
      return;
    });
  }

  private static createLog<T extends ToString>(
    message: T,
    _surround: number,
    functionName?: string,
    functionNameOccurences?: mnemosist.MultiSet<string>
  ): Log {
    functionName = functionName ?? "";

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
        functionName,
        functionNameOccurences
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
    functionName: string,
    functionNameOccurences?: mnemosist.MultiSet<string>
  ): { [key: number]: string } {
    const file = fs.readFileSync(filePath, "utf8");
    const fileData = file.split("\n");

    const lines: { [key: number]: string } = {};

    fileData.forEach((line, _lineNumber, _) => {
      lines[_lineNumber + 1] = line;
    });

    // TODO: for batch log sending
    // if (functionNameOccurences) {
    //   if (functionName && functionName !== "") {
    //     const offset = 1;
    //     const occurences = functionNameOccurences.multiplicity(functionName);
    //   }
    // }

    let offset = lineNumber - surround;

    if (offset < 0) {
      offset = 0;
    }

    let end = lineNumber + surround;
    if (end > Number.MAX_SAFE_INTEGER) {
      end = Number.MAX_SAFE_INTEGER;
    }

    const finalLines: { [key: number]: string } = {};

    for (let i = offset; i <= end; i++)
      finalLines[i] = lines[i];

    return finalLines;
  }
}
