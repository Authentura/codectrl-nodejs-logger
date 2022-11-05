import test from "ava";

import { Logger, RequestStatus } from "./index.js";

// TODO: Figure out why tests are "failing", even though they are working properly.

test("Standard log", async (t) => {
  const result = (await logLayerOne()).unwrap();

  if (result) {
    if (result.status === RequestStatus.ERROR) {
      t.fail(result.message);
    }

    t.pass(result.message);
  }

  t.fail("result was null");
});

test("Conditional log", async (t) => {
  const result = (await logIfLayerOne()).unwrap();

  if (result) {
    if (result.status === RequestStatus.ERROR) {
      t.fail(result.message);
    }

    t.pass(result.message);
  }


  t.fail("Condition was not true");
});

test("Conditional log (environment variable)", async (t) => {
  const result = (await logWhenEnvLayerOne()).unwrap();

  if (result) {
    if (result.status === RequestStatus.ERROR) {
      t.fail(result.message);
    }

    t.pass(result.message);
  }

  t.fail("CODECTRL_DEBUG environment variable is not present");
});

test("Batched logs", async t => {
  await logBatchLayerOne();

  t.pass();
});

async function logLayerOne() {
  return await logLayerTwo();
}

async function logLayerTwo() {
  return await logLayerThree();
}

async function logLayerThree() {
  return await logLayerFinal();
}

async function logLayerFinal() {
  return await Logger.log("Log");
}

async function logIfLayerOne() {
  return await logIfLayerTwo();
}

async function logIfLayerTwo() {
  return await logIfLayerThree();
}

async function logIfLayerThree() {
  return await logIfLayerFinal();
}

async function logIfLayerFinal() {
  return await Logger.logIf(() => {
    return true;
  }, "Log if");
}

async function logWhenEnvLayerOne() {
  return await logWhenEnvLayerTwo();
}

async function logWhenEnvLayerTwo() {
  return await logWhenEnvLayerThree();
}

async function logWhenEnvLayerThree() {
  return await logWhenEnvLayerFinal();
}

async function logWhenEnvLayerFinal() {
  return await Logger.logWhenEnv("Log when env");
}

async function logBatchLayerOne() {
  return await logBatchLayerTwo();
}

async function logBatchLayerTwo() {
  return await logBatchLayerThree();
}

async function logBatchLayerThree() {
  return await logBatchLayerFinal();
}

async function logBatchLayerFinal() {
  return await Logger
    .startBatch()
    .addLog(new Date())
    .addLog("Batched hello")
    .addLogIf(() => { return true }, "Batched hello conditional")
    .addLogIf(() => { return false }, "This won't show")
    .addLogWhenEnv("Batched env")
    .build()
    .sendBatch();
}
