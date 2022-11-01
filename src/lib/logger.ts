import { ChannelCredentials, Metadata } from "@grpc/grpc-js";

import { findSourceMap } from "module";
import * as fs from "node:fs";

import { GrpcTransport } from "@protobuf-ts/grpc-transport";
import callsites from "callsites";

import { translate } from "../third-party/line-numbers.js";

import { LogClient, RequestResult } from "./cc-service.js";
import { BacktraceData, Log } from "./data.js";

function createLog<T extends { toString: () => string }>(
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

  Logger.getStackTrace(log);

  const last = log.stack.pop();
  if (last) {
    log.lineNumber = last.lineNumber;
    log.fileName = last.filePath;
    log.stack.push(last);
  }

  return log;
}

export class Logger {
  public static async log<T extends { toString: () => string }>(
    message: T,
    _surround?: number,
    _host?: string,
    _port?: string
  ): Promise<RequestResult> {
    const surround = _surround ?? 3;
    const host = _host ?? "127.0.0.1";
    const port = _port ?? "3002";

    const log = createLog(message, surround);

    const transport = new GrpcTransport({
      host: `${host}:${port}`,
      channelCredentials: ChannelCredentials.createInsecure(),
    });
    const client = new LogClient(transport);
    const result = await client.sendLog(log).response;

    return result;
  }

  public static async logIf<T extends { toString: () => string }>(
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

  public static getStackTrace(log: Log) {
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
          log.language = "TypeScript";
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

  static getCode(filePath: string, lineNumber: number): string {
    const file = fs.readFileSync(filePath, "utf8");

    return file.split("\n")[lineNumber].trim();
  }
}
