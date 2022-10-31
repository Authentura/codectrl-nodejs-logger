import { ChannelCredentials, Metadata } from "@grpc/grpc-js";
import { GrpcTransport } from "@protobuf-ts/grpc-transport";
import callsites from "callsites";

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

  public static getStackTrace(log: Log) {
    Error.stackTraceLimit = Infinity;

    const stacklist: BacktraceData[] = [];

    callsites().forEach((trace, _index, _arr) => {
      const fileName = trace.getFileName();
      const methodName = trace.getMethodName();
      console.log(methodName);

      if (
        methodName &&
        fileName &&
        !(methodName == "getStackTrace" || methodName == "log") &&
        !(fileName.includes("/ava/") || fileName.startsWith("node:"))
      ) {
        stacklist.unshift(<BacktraceData>{
          filePath: fileName?.replace("file://", ""),
          lineNumber: trace.getLineNumber() ?? 0,
          columnNumber: trace.getColumnNumber() ?? 0,
          name: methodName,
        });
      }
    });

    log.stack = stacklist;
  }
}
