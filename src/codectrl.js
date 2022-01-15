const StackTrace = require("stacktrace-js");

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
    getJson(
      (message = messageBody),
      (stack = stackframes[1]),
      (message_type = messageBody_type),
      (lineNumber = stackframes[1].lineNumber)
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
    stack: Object.values({ stack }),
    address: "127.0.0.1",
  });
};
