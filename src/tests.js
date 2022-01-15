const codectrl = require("./codectrl");

const codectrlLogtest = () => {
  codectrl.log(
    (host = "localhost"),
    (port = 3001),
    (surround = 2),
    "messaet to display",
    "test"
  );
};

codectrlLogtest();

codectrl.log(
  (host = "localhost"),
  (port = 3001),
  (surround = 3),
  "messaet to display",
  "test"
);
