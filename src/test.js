const codectrl = require("./codectrl");

const codectrlLogtest = () => {
  codectrl.log(
    (host = "localhost"),
    (port = 3001),
    (surround = 4),
    "messaet to display",
    "test"
  );
};

codectrlLogtest();
