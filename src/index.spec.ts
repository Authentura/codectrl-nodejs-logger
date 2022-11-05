import test from "ava";

import { Logger, RequestStatus } from "./index.js";

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
  const result = (await logLayerOne()).unwrap();

  if (result) {
    if (result.status === RequestStatus.ERROR) {
      t.fail(result.message);
    }

    t.pass(result.message);
  }

  t.fail("result was null");
});

async function logIfLayerFinal() {
  return await Logger.logIf(() => {
    return true;
  }, "Log if");
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

  if (result) {
    const res = result.unwrap();

    if (res) {
      if (res.status === RequestStatus.ERROR) {
        t.fail(res.message);
      }

      t.pass(res.message);
    }

  }

  t.fail("Condition was not true");
});

async function logWhenEnvLayerFinal() {
  return await Logger.logWhenEnv("Log when env");
}

async function logWhenEnvLayerThree() {
  return await logWhenEnvLayerFinal();
}

async function logWhenEnvLayerTwo() {
  return await logWhenEnvLayerThree();
}

async function logWhenEnvLayerOne() {
  return await logWhenEnvLayerTwo();
}

test("Logger.logWhenEnv", async (t) => {
  const result = await logWhenEnvLayerOne();

  if (result) {
    const res = result.unwrap();

    if (res) {

      if (res.status === RequestStatus.ERROR) {
        t.fail(res.message);
      }

      t.pass(res.message);
    }

  }

  t.fail("CODECTRL_DEBUG environment variable is not present");
});

test("Log batch", async t => {
  Logger.startBatch().addLog("Test").addLog("Hello").build().sendBatch();

  t.pass();
});
