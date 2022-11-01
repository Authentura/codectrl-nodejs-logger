import test from "ava";

import { RequestStatus } from "./lib/cc-service.js";

import { Logger } from "./index.js";

async function logLayerFinal() {
  return await Logger.log("Log");
}

async function logLayerThree() {
  return await logLayerFinal();
}

async function logLayerTwo() {
  return await logLayerThree();
}

async function logLayerOne() {
  return await logLayerTwo();
}

test("Send single log", async (t) => {
  const result = await logLayerOne();

  if (result.status === RequestStatus.ERROR) {
    t.fail(result.message);
  }

  t.pass(result.message);
});
