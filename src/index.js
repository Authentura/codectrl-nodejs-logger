const ReadFile = require("./ReadFile");

const log = async (...args) => {
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

  const message = args.toString();

  console.log(message);
};

log(
  (host = "localhost"),
  (port = 3001),
  (surround = 5),
  "messaet to display",
  "test"
);
