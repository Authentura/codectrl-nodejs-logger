const StackTrace = require("stacktrace-js");
const cbor = require("cbor");
const assert = require("assert");
const net = require("net");
const fs = require("fs");

let encoded = cbor.encode(true);
cbor.decodeFirst(encoded, (error, obj) => {
  assert.ok(obj === true);
});

module.exports.log = async function (...args) {
  /*
  Create `Log` object and send to codeCTRL server in cbor format.
  The codectrl.log function collects and formats information about
  the file/function/line of code it got called on and sends it to
  the codeCTRL server, if available.
  Usage:
      The function takes any number of arbitrary positional
      and keyword arguments. All positional arguments get included in the log `message`

  Reserved arguments:
      * host:
          By default set to `127.0.0.1`, this argument
          holds the address of the codeCTRL server.
      * port:
          By default set to `30001`, this is the port
          the codeCTRL server should be contacted at.
      * surround:
          By default `3`, this argument specifies the
          number of lines of code that should be displayed
          around the call to `codectrl.log`.
  */

  let appHost = "127.0.0.1";
  let appPort = 3001;
  let appSurround = 3;

  if (typeof host !== "undefined") {
    appHost = host;
    args = args.filter((item) => item !== host);
  }
  if (typeof port !== "undefined") {
    appPort = port;
    args = args.filter((item) => item !== port);
  }

  if (typeof surround !== "undefined") {
    appSurround = surround;
    args = args.filter((item) => item !== surround);
  }

  const messageBody = args.toString();
  const messageBody_type = typeof messageBody;

  const callback = function (stackframes) {
    let LineNumber = stackframes[1].lineNumber;
    let firstLine = LineNumber;
    let lastLine = LineNumber + appSurround;

    if (LineNumber >= appSurround) {
      // check if the lineNumber if greater than the number user requested if so we will calculate the first Line based on that
      firstLine = LineNumber - appSurround;
    }
    code_lines = {};

    for (let i = firstLine; i < lastLine; i++) {
      let file_line = ReadFileLines(stackframes[1].fileName, i);
      code_lines[i] = file_line;
    }
    const finalstack = buildStack(
      stackframes[1],
      (code = ReadFileLines(stackframes[1].fileName, stackframes[1].lineNumber))
    );

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
    connectSocket(appPort, appHost, encoded);
  };

  let issues = [];

  const errback = function (err) {
    issues.push(err.message);
  };

  StackTrace.get().then(callback).catch(errback);
};

const ReadFileLines = (filename, line_no) => {
  /*
  read the file content by the line and return the content of each line
  if its not possible to read the line send a empty string.
   */
  const data = fs.readFileSync(filename, "utf8");
  const lines = data.split("\n");

  if (+line_no > lines.length) {
    return "";
  }
  return lines[+line_no];
};

const buildStack = (stackTrace, code) => {
  /*
    Get the current stack and format it according to spec:
    https://github.com/pwnCTRL/codectrl/blob/main/loggers/SCHEMA.md
  */
  return {
    name: stackTrace.functionName,
    code: code,
    file_path: stackTrace.fileName,
    line_number: stackTrace.lineNumber,
    column_number: stackTrace.columnNumber,
  };
};

const connectSocket = (port, ip, message) => {
  /*
    Trying to connect to codectrl server and write the message. 
  */
  const client = new net.Socket();

  client.connect(port, ip, function () {
    client.write(message);
    client.end();
  });

  client.on("data", function (data) {
    client.destroy();
  });

  client.on("close", function () {});

  client.on("error", function (error) {
    console.log(`[codeCTRL] Could not reach codeCTRL server. ${error}`);
  });
};
