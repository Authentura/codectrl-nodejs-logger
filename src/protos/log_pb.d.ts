import * as jspb from 'google-protobuf'

import * as backtrace_data_pb from './backtrace_data_pb';


export class Log extends jspb.Message {
  getUuid(): string;
  setUuid(value: string): Log;

  getStackList(): Array<backtrace_data_pb.BacktraceData>;
  setStackList(value: Array<backtrace_data_pb.BacktraceData>): Log;
  clearStackList(): Log;
  addStack(value?: backtrace_data_pb.BacktraceData, index?: number): backtrace_data_pb.BacktraceData;

  getLinenumber(): number;
  setLinenumber(value: number): Log;

  getCodesnippetMap(): jspb.Map<number, string>;
  clearCodesnippetMap(): Log;

  getMessage(): string;
  setMessage(value: string): Log;

  getMessagetype(): string;
  setMessagetype(value: string): Log;

  getFilename(): string;
  setFilename(value: string): Log;

  getAddress(): string;
  setAddress(value: string): Log;

  getLanguage(): string;
  setLanguage(value: string): Log;

  getWarningsList(): Array<string>;
  setWarningsList(value: Array<string>): Log;
  clearWarningsList(): Log;
  addWarnings(value: string, index?: number): Log;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Log.AsObject;
  static toObject(includeInstance: boolean, msg: Log): Log.AsObject;
  static serializeBinaryToWriter(message: Log, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Log;
  static deserializeBinaryFromReader(message: Log, reader: jspb.BinaryReader): Log;
}

export namespace Log {
  export type AsObject = {
    uuid: string,
    stackList: Array<backtrace_data_pb.BacktraceData.AsObject>,
    linenumber: number,
    codesnippetMap: Array<[number, string]>,
    message: string,
    messagetype: string,
    filename: string,
    address: string,
    language: string,
    warningsList: Array<string>,
  }
}

