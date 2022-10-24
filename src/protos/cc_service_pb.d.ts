import * as jspb from 'google-protobuf'

import * as log_pb from './log_pb';
import * as auth_pb from './auth_pb';
import * as google_protobuf_empty_pb from 'google-protobuf/google/protobuf/empty_pb';


export class Connection extends jspb.Message {
  getUuid(): string;
  setUuid(value: string): Connection;

  getToken(): auth_pb.Token | undefined;
  setToken(value?: auth_pb.Token): Connection;
  hasToken(): boolean;
  clearToken(): Connection;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Connection.AsObject;
  static toObject(includeInstance: boolean, msg: Connection): Connection.AsObject;
  static serializeBinaryToWriter(message: Connection, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Connection;
  static deserializeBinaryFromReader(message: Connection, reader: jspb.BinaryReader): Connection;
}

export namespace Connection {
  export type AsObject = {
    uuid: string,
    token?: auth_pb.Token.AsObject,
  }

  export enum TokenCase { 
    _TOKEN_NOT_SET = 0,
    TOKEN = 2,
  }
}

export class RequestResult extends jspb.Message {
  getMessage(): string;
  setMessage(value: string): RequestResult;

  getStatus(): RequestStatus;
  setStatus(value: RequestStatus): RequestResult;

  getAuthstatus(): auth_pb.GenerateTokenRequestResult | undefined;
  setAuthstatus(value?: auth_pb.GenerateTokenRequestResult): RequestResult;
  hasAuthstatus(): boolean;
  clearAuthstatus(): RequestResult;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): RequestResult.AsObject;
  static toObject(includeInstance: boolean, msg: RequestResult): RequestResult.AsObject;
  static serializeBinaryToWriter(message: RequestResult, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): RequestResult;
  static deserializeBinaryFromReader(message: RequestResult, reader: jspb.BinaryReader): RequestResult;
}

export namespace RequestResult {
  export type AsObject = {
    message: string,
    status: RequestStatus,
    authstatus?: auth_pb.GenerateTokenRequestResult.AsObject,
  }

  export enum AuthstatusCase { 
    _AUTHSTATUS_NOT_SET = 0,
    AUTHSTATUS = 3,
  }
}

export class ServerDetails extends jspb.Message {
  getHost(): string;
  setHost(value: string): ServerDetails;

  getPort(): number;
  setPort(value: number): ServerDetails;

  getUptime(): number;
  setUptime(value: number): ServerDetails;

  getRequiresauthentication(): boolean;
  setRequiresauthentication(value: boolean): ServerDetails;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ServerDetails.AsObject;
  static toObject(includeInstance: boolean, msg: ServerDetails): ServerDetails.AsObject;
  static serializeBinaryToWriter(message: ServerDetails, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ServerDetails;
  static deserializeBinaryFromReader(message: ServerDetails, reader: jspb.BinaryReader): ServerDetails;
}

export namespace ServerDetails {
  export type AsObject = {
    host: string,
    port: number,
    uptime: number,
    requiresauthentication: boolean,
  }
}

export enum RequestStatus { 
  CONFIRMED = 0,
  ERROR = 1,
}
