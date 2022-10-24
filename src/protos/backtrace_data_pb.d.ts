import * as jspb from 'google-protobuf'



export class BacktraceData extends jspb.Message {
  getName(): string;
  setName(value: string): BacktraceData;

  getFilepath(): string;
  setFilepath(value: string): BacktraceData;

  getLinenumber(): number;
  setLinenumber(value: number): BacktraceData;

  getColumnnumber(): number;
  setColumnnumber(value: number): BacktraceData;

  getCode(): string;
  setCode(value: string): BacktraceData;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): BacktraceData.AsObject;
  static toObject(includeInstance: boolean, msg: BacktraceData): BacktraceData.AsObject;
  static serializeBinaryToWriter(message: BacktraceData, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): BacktraceData;
  static deserializeBinaryFromReader(message: BacktraceData, reader: jspb.BinaryReader): BacktraceData;
}

export namespace BacktraceData {
  export type AsObject = {
    name: string,
    filepath: string,
    linenumber: number,
    columnnumber: number,
    code: string,
  }
}

