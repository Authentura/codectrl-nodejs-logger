import * as jspb from 'google-protobuf'

import * as google_protobuf_empty_pb from 'google-protobuf/google/protobuf/empty_pb';


export class Name extends jspb.Message {
  getInner(): string;
  setInner(value: string): Name;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Name.AsObject;
  static toObject(includeInstance: boolean, msg: Name): Name.AsObject;
  static serializeBinaryToWriter(message: Name, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Name;
  static deserializeBinaryFromReader(message: Name, reader: jspb.BinaryReader): Name;
}

export namespace Name {
  export type AsObject = {
    inner: string,
  }
}

export class TokenPermissions extends jspb.Message {
  getRead(): boolean;
  setRead(value: boolean): TokenPermissions;

  getWrite(): boolean;
  setWrite(value: boolean): TokenPermissions;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): TokenPermissions.AsObject;
  static toObject(includeInstance: boolean, msg: TokenPermissions): TokenPermissions.AsObject;
  static serializeBinaryToWriter(message: TokenPermissions, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): TokenPermissions;
  static deserializeBinaryFromReader(message: TokenPermissions, reader: jspb.BinaryReader): TokenPermissions;
}

export namespace TokenPermissions {
  export type AsObject = {
    read: boolean,
    write: boolean,
  }
}

export class Token extends jspb.Message {
  getName(): Name | undefined;
  setName(value?: Name): Token;
  hasName(): boolean;
  clearName(): Token;

  getPermissions(): TokenPermissions | undefined;
  setPermissions(value?: TokenPermissions): Token;
  hasPermissions(): boolean;
  clearPermissions(): Token;

  getIntent(): TokenIntent;
  setIntent(value: TokenIntent): Token;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Token.AsObject;
  static toObject(includeInstance: boolean, msg: Token): Token.AsObject;
  static serializeBinaryToWriter(message: Token, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Token;
  static deserializeBinaryFromReader(message: Token, reader: jspb.BinaryReader): Token;
}

export namespace Token {
  export type AsObject = {
    name?: Name.AsObject,
    permissions?: TokenPermissions.AsObject,
    intent: TokenIntent,
  }
}

export class GenerateTokenRequest extends jspb.Message {
  getName(): Name | undefined;
  setName(value?: Name): GenerateTokenRequest;
  hasName(): boolean;
  clearName(): GenerateTokenRequest;

  getIntent(): TokenIntent;
  setIntent(value: TokenIntent): GenerateTokenRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GenerateTokenRequest.AsObject;
  static toObject(includeInstance: boolean, msg: GenerateTokenRequest): GenerateTokenRequest.AsObject;
  static serializeBinaryToWriter(message: GenerateTokenRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GenerateTokenRequest;
  static deserializeBinaryFromReader(message: GenerateTokenRequest, reader: jspb.BinaryReader): GenerateTokenRequest;
}

export namespace GenerateTokenRequest {
  export type AsObject = {
    name?: Name.AsObject,
    intent: TokenIntent,
  }
}

export class VerifyTokenRequest extends jspb.Message {
  getToken(): Token | undefined;
  setToken(value?: Token): VerifyTokenRequest;
  hasToken(): boolean;
  clearToken(): VerifyTokenRequest;

  getIntent(): TokenIntent;
  setIntent(value: TokenIntent): VerifyTokenRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): VerifyTokenRequest.AsObject;
  static toObject(includeInstance: boolean, msg: VerifyTokenRequest): VerifyTokenRequest.AsObject;
  static serializeBinaryToWriter(message: VerifyTokenRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): VerifyTokenRequest;
  static deserializeBinaryFromReader(message: VerifyTokenRequest, reader: jspb.BinaryReader): VerifyTokenRequest;
}

export namespace VerifyTokenRequest {
  export type AsObject = {
    token?: Token.AsObject,
    intent: TokenIntent,
  }
}

export class VerifyTokenRequestResult extends jspb.Message {
  getMessage(): string;
  setMessage(value: string): VerifyTokenRequestResult;

  getStatus(): VerifyTokenRequestResultEnum;
  setStatus(value: VerifyTokenRequestResultEnum): VerifyTokenRequestResult;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): VerifyTokenRequestResult.AsObject;
  static toObject(includeInstance: boolean, msg: VerifyTokenRequestResult): VerifyTokenRequestResult.AsObject;
  static serializeBinaryToWriter(message: VerifyTokenRequestResult, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): VerifyTokenRequestResult;
  static deserializeBinaryFromReader(message: VerifyTokenRequestResult, reader: jspb.BinaryReader): VerifyTokenRequestResult;
}

export namespace VerifyTokenRequestResult {
  export type AsObject = {
    message: string,
    status: VerifyTokenRequestResultEnum,
  }
}

export class RevokeTokenRequestResult extends jspb.Message {
  getMessage(): string;
  setMessage(value: string): RevokeTokenRequestResult;

  getStatus(): RevokeTokenRequestResultEnum;
  setStatus(value: RevokeTokenRequestResultEnum): RevokeTokenRequestResult;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): RevokeTokenRequestResult.AsObject;
  static toObject(includeInstance: boolean, msg: RevokeTokenRequestResult): RevokeTokenRequestResult.AsObject;
  static serializeBinaryToWriter(message: RevokeTokenRequestResult, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): RevokeTokenRequestResult;
  static deserializeBinaryFromReader(message: RevokeTokenRequestResult, reader: jspb.BinaryReader): RevokeTokenRequestResult;
}

export namespace RevokeTokenRequestResult {
  export type AsObject = {
    message: string,
    status: RevokeTokenRequestResultEnum,
  }
}

export class GenerateTokenRequestResult extends jspb.Message {
  getStatus(): GenerateTokenRequestResultEnum;
  setStatus(value: GenerateTokenRequestResultEnum): GenerateTokenRequestResult;

  getToken(): Token | undefined;
  setToken(value?: Token): GenerateTokenRequestResult;
  hasToken(): boolean;
  clearToken(): GenerateTokenRequestResult;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GenerateTokenRequestResult.AsObject;
  static toObject(includeInstance: boolean, msg: GenerateTokenRequestResult): GenerateTokenRequestResult.AsObject;
  static serializeBinaryToWriter(message: GenerateTokenRequestResult, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GenerateTokenRequestResult;
  static deserializeBinaryFromReader(message: GenerateTokenRequestResult, reader: jspb.BinaryReader): GenerateTokenRequestResult;
}

export namespace GenerateTokenRequestResult {
  export type AsObject = {
    status: GenerateTokenRequestResultEnum,
    token?: Token.AsObject,
  }

  export enum TokenCase { 
    _TOKEN_NOT_SET = 0,
    TOKEN = 2,
  }
}

export class LoginUrl extends jspb.Message {
  getUrl(): string;
  setUrl(value: string): LoginUrl;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): LoginUrl.AsObject;
  static toObject(includeInstance: boolean, msg: LoginUrl): LoginUrl.AsObject;
  static serializeBinaryToWriter(message: LoginUrl, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): LoginUrl;
  static deserializeBinaryFromReader(message: LoginUrl, reader: jspb.BinaryReader): LoginUrl;
}

export namespace LoginUrl {
  export type AsObject = {
    url: string,
  }
}

export enum TokenIntent { 
  LOGGER = 0,
  FRONTEND = 1,
}
export enum VerifyTokenRequestResultEnum { 
  UNAUTHORISED = 0,
  NOTFOUND = 1,
  AUTHORISED = 2,
}
export enum GenerateTokenRequestResultEnum { 
  NAME_ALREADY_EXISTS = 0,
  TOKEN_ALREADY_EXISTS = 1,
  TOKEN_GENERATION_SUCCEEDED = 2,
}
export enum RevokeTokenRequestResultEnum { 
  TOKEN_NOT_FOUND = 0,
  TOKEN_REVOKATION_SUCCEEDED = 1,
}
