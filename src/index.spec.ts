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

test("Logger.log", async (t) => {
  const result = await logLayerOne();

  if (result.status === RequestStatus.ERROR) {
    t.fail(result.message);
  }

  t.pass(result.message);
});

async function logIfLayerFinal() {
  return await Logger.logIf(() => {
    return true;
  }, "LogIf");
}

async function logIfLayerThree() {
  return await logIfLayerFinal();
}

async function logIfLayerTwo() {
  return await logIfLayerThree();
}

async function logIfLayerOne() {
  return await logIfLayerTwo();
}

test("Logger.logIf", async (t) => {
  const result = await logIfLayerOne();

  if (result && result.status === RequestStatus.ERROR) {
    t.fail(result.message);
  } else if (!result) {
    t.fail("Condition was not true");
  }

  t.pass(result?.message);
});
