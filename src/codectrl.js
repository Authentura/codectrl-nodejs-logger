const StackTrace = require("stacktrace-js");
const cbor = require("cbor");
const assert = require("assert");
const socket = require("net").Socket();
const fs = require("fs");

let encoded = cbor.encode(true);
cbor.decodeFirst(encoded, (error, obj) => {
  assert.ok(obj === true);
});

module.exports.log = async function (...args) {
  let appHost = "127.0.0.1";
  let appPort = "3001";
  let appSurround = 3;

  if ({ host }) {
    appHost = host;
    args = args.filter((item) => item !== host);
  }
  if ({ port }) {
    appPort = port;
    args = args.filter((item) => item !== port);
  }

  if ({ surround }) {
    appSurround = surround;
    args = args.filter((item) => item !== surround);
  }

  const messageBody = args.toString();
  const messageBody_type = typeof messageBody;

  const callback = function (stackframes) {
    let LineNumber = stackframes[1].lineNumber;
    let firstLine = LineNumber;
    let lastLine = LineNumber + appSurround;

    /*
    check if the lineNumber if greater than the number user requested if so we will calculate the first Line based on that
    */

    if (LineNumber >= appSurround) {
      firstLine = LineNumber - appSurround;
    }
    code_lines = {};

    for (let i = firstLine; i < lastLine; i++) {
      let file_line = ReadFileLines(stackframes[1].fileName, i);
      code_lines[i] = file_line.toString();
    }
    const finalstack = buildStack(stackframes[1]);

    const obj = {
      message: messageBody,
      message_type: messageBody_type,
      line_number: LineNumber,
      code_snippet: code_lines,
      file_name: stackframes[1].fileName,
      stack: [finalstack],
      warnings: [],
      address: "127.0.0.1",
    };

    encoded = cbor.encode(obj);
    sendData(encoded, appPort);
  };

  const errback = function (err) {
    console.log(err.message);
  };

  StackTrace.get().then(callback).catch(errback);
};

const ReadFileLines = (filename, line_no) => {
  const data = fs.readFileSync(filename, "utf8");
  const lines = data.split("\n");

  if (+line_no > lines.length) {
    return "";
  }
  return lines[+line_no];
};

const buildStack = (stackTrace) => {
  return {
    name: stackTrace.functionName,
    code: stackTrace.source,
    file_path: stackTrace.fileName,
    line_number: stackTrace.lineNumber,
    column_number: stackTrace.columnNumber,
  };
};

const sendData = async (data, port) => {
  socket.connect(port);
  socket.write(data);
  socket.end();
};
