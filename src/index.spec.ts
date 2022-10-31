import test from "ava";

import { RequestStatus } from "./lib/cc-service.js";

import { Logger } from "./index.js";

test("Send single log", async (t) => {
  const result = await Logger.log("Hello, world!");

  if (result.status == RequestStatus.ERROR) {
    t.fail(result.message);
  }

  t.pass(result.message);
});
