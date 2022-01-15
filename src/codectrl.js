const StackTrace = require("stacktrace-js");
const ReadFile = require("./ReadFile");

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

    if (LineNumber >= appSurround) {
      firstLine = LineNumber - appSurround;
    }
    code_lines = {};

    for (let i = firstLine; i <= lastLine; i++) {
      let file_line = ReadFile.ReadFileLines(stackframes[1].fileName, i);
      code_lines[i] = file_line;
    }

    getJson(
      (message = messageBody),
      (stack = stackframes[1]),
      (message_type = messageBody_type),
      (lineNumber = LineNumber),
      (file_name = stackframes[1].fileName),
      (code_snippet = code_lines)
    );
  };

  const errback = function (err) {
    console.log(err.message);
  };

  StackTrace.get().then(callback).catch(errback);
};

const getJson = (...args) => {
  console.log({
    message: Object.values({ message }).toString(),
    message_type: Object.values({ message_type }).toString(),
    line_number: parseInt(Object.values({ lineNumber })),
    code_snippet: Object.values({ code_snippet }),
    file_name: Object.values({ file_name }).toString(),
    stack: Object.values({ stack }),
    warnings: [],
    address: "127.0.0.1",
  });
};
