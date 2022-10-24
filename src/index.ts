import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';
import glob from 'glob';

const PROTO_PATHS = glob(
  __dirname + '../protos/*.proto',
  (err, files: string[]) => {
    if (err) {
      return;
    }

    return files;
  }
).found;

const packageDefinition = protoLoader.loadSync(PROTO_PATHS, {
  keepCase: false,
  longs: Number,
  enums: String,
  defaults: true,
  oneofs: true,
});

const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);

export * from './lib/logger';
