const assert = require("node:assert/strict");
const { test } = require("node:test");
const {
  MAX_RESTART_COUNT,
  ServerController,
  startupFailureMessage,
} = require("../out/serverController.js");

function deferred() {
  let resolve;
  const promise = new Promise((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

function harness({
  trusted = true,
  executable = "rootform",
  createClient,
  reportStartupFailure,
  reportStopFailure,
} = {}) {
  const state = { trusted, executable, created: [], startupFailures: [], stopFailures: [] };
  const controller = new ServerController({
    isTrusted: () => state.trusted,
    executablePath: () => state.executable,
    createClient: (path) => {
      const client = createClient
        ? createClient(path, state)
        : {
            start: async () => {},
            dispose: async () => {},
          };
      state.created.push({ path, client });
      return client;
    },
    reportStartupFailure: (path, error) => {
      state.startupFailures.push({ path, error });
      reportStartupFailure?.(path, error);
    },
    reportStopFailure: (error) => {
      state.stopFailures.push(error);
      reportStopFailure?.(error);
    },
  });
  return { controller, state };
}

test("serializes start and restart, stopping the old process before replacement", async () => {
  const events = [];
  const firstStart = deferred();
  let count = 0;
  const { controller, state } = harness({
    createClient: () => {
      const id = ++count;
      return {
        start: async () => {
          events.push(`start-${id}`);
          if (id === 1) await firstStart.promise;
          events.push(`started-${id}`);
        },
        dispose: async () => {
          events.push(`stop-${id}`);
        },
      };
    },
  });

  const starting = controller.start();
  await Promise.resolve();
  state.executable = "/opt/rootform/rootform";
  const restarting = controller.restart();
  assert.deepEqual(events, ["start-1"]);
  firstStart.resolve();
  await Promise.all([starting, restarting]);
  assert.deepEqual(events, ["start-1", "started-1", "stop-1", "start-2", "started-2"]);
  assert.deepEqual(
    state.created.map(({ path }) => path),
    ["rootform", "/opt/rootform/rootform"],
  );
  await controller.dispose();
  assert.equal(events.at(-1), "stop-2");
});

test("does not create a client until workspace trust is granted", async () => {
  const { controller, state } = harness({ trusted: false });
  await controller.start();
  assert.equal(state.created.length, 0);

  state.trusted = true;
  await controller.start();
  assert.equal(state.created.length, 1);
  assert.equal(state.created[0].path, "rootform");

  state.trusted = false;
  await controller.restart();
  assert.equal(state.created.length, 1);
  await controller.dispose();
});

test("reports one actionable startup error without an automatic retry loop", async () => {
  let starts = 0;
  const { controller, state } = harness({
    createClient: () => ({
      start: async () => {
        starts += 1;
        throw Object.assign(new Error("missing"), { code: "ENOENT" });
      },
      dispose: async () => {},
    }),
  });

  await controller.start();
  assert.equal(starts, 1);
  assert.equal(state.startupFailures.length, 1);
  assert.match(startupFailureMessage("rootform", state.startupFailures[0].error), /not found/);
  assert.equal(MAX_RESTART_COUNT, 4);
  await controller.dispose();
});

test("rejects an empty executable setting with a direct configuration fix", async () => {
  const { controller, state } = harness({ executable: "   " });
  await controller.start();
  assert.equal(state.created.length, 0);
  assert.match(startupFailureMessage("", new Error()), /rootform\.server\.path/);
  await controller.dispose();
});

test("preserves the cause serialized by the pinned language-client spawn path", () => {
  const executable = "/opt/Rootform Tools/rootform";
  const sdkError = (code) =>
    `Launching server using command ${executable} failed. Error: spawn ${executable} ${code}`;
  assert.match(startupFailureMessage(executable, sdkError("ENOENT")), /was not found/);
  assert.match(startupFailureMessage(executable, sdkError("EACCES")), /permissions/);
  assert.match(startupFailureMessage(executable, sdkError("EPERM")), /permissions/);
  assert.match(
    startupFailureMessage(executable, "initialize response mentions ENOENT"),
    /could not initialize/,
  );
});

test("names an initialization timeout and its executable remediation", () => {
  const error = Object.assign(new Error("timeout"), { code: "ROOTFORM_LSP_INITIALIZE_TIMEOUT" });
  const message = startupFailureMessage("rootform", error);
  assert.match(message, /did not initialize within 10 seconds/);
  assert.match(message, /rootform\.server\.path/);
});
