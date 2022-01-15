const codectrl = require("./codectrl");

const codectrlLogtest = () => {
  codectrl.log(
    (host = "127.0.0.1"),
    (port = 3001),
    (surround = 2),
    "messaet to display 1",
    "test"
  );
};

codectrlLogtest();

codectrlLogtest();
