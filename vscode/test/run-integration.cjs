const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const { runTests } = require("@vscode/test-electron");

async function main() {
  const vscodeExecutable = process.env.VSCODE_EXECUTABLE_PATH;
  const rootformBinary = process.env.ROOTFORM_BINARY;
  assert.ok(vscodeExecutable, "Set VSCODE_EXECUTABLE_PATH to the installed VS Code executable.");
  assert.ok(
    rootformBinary,
    "Set ROOTFORM_BINARY to an explicitly provided local Rootform executable.",
  );

  const packageRoot = path.resolve(__dirname, "..");
  const temporaryRoot = await fs.mkdtemp(path.join(os.tmpdir(), "rootform-vscode-"));
  const workspaceRoot = path.join(temporaryRoot, "workspace");
  const firstRoot = path.join(workspaceRoot, "first");
  const secondRoot = path.join(workspaceRoot, "second");
  const jsonRoot = path.join(workspaceRoot, "json");
  const policyRoot = path.join(workspaceRoot, "policies");
  const userDataDir = path.join(temporaryRoot, "user-data");
  const extensionsDir = path.join(temporaryRoot, "extensions");

  try {
    await fs.mkdir(firstRoot, { recursive: true });
    await fs.mkdir(secondRoot, { recursive: true });
    await fs.mkdir(jsonRoot, { recursive: true });
    await fs.mkdir(policyRoot, { recursive: true });
    await fs.mkdir(path.join(userDataDir, "User"), { recursive: true });
    await fs.mkdir(extensionsDir, { recursive: true });
    await fs.cp(path.join(packageRoot, "fixtures/integration/first"), firstRoot, {
      recursive: true,
    });
    await fs.cp(path.join(packageRoot, "fixtures/integration/second"), secondRoot, {
      recursive: true,
    });
    await fs.cp(path.join(packageRoot, "fixtures/integration/json"), jsonRoot, { recursive: true });

    await fs.cp(path.join(packageRoot, "fixtures/integration/policies"), policyRoot, {
      recursive: true,
    });
    const workspaceFile = path.join(workspaceRoot, "rootform.code-workspace");
    await fs.writeFile(
      workspaceFile,
      JSON.stringify(
        {
          folders: [{ path: "first" }, { path: "second" }, { path: "json" }, { path: "policies" }],
        },
        null,
        2,
      ),
    );
    await fs.writeFile(
      path.join(userDataDir, "User/settings.json"),
      JSON.stringify(
        {
          "rootform.server.path": path.resolve(rootformBinary),
        },
        null,
        2,
      ),
    );

    const runEditor = (entry, phase = "full") =>
      runTests({
        vscodeExecutablePath: path.resolve(vscodeExecutable),
        extensionDevelopmentPath: packageRoot,
        extensionTestsPath: path.join(__dirname, "extensionHost.cjs"),
        extensionTestsEnv: {
          ROOTFORM_BINARY: path.resolve(rootformBinary),
          ROOTFORM_TEST_ROOT: workspaceRoot,
          ROOTFORM_TEST_PHASE: phase,
          ROOTFORM_TEST_USER_DATA: userDataDir,
        },
        launchArgs: [
          entry,
          "--disable-extensions",
          "--user-data-dir",
          userDataDir,
          "--extensions-dir",
          extensionsDir,
          "--skip-welcome",
          "--skip-release-notes",
        ],
      });
    await runEditor(workspaceFile);
    await runEditor(workspaceFile, "reopen");
    const looseFile = path.join(temporaryRoot, "loose", "main.rf.hcl");
    await fs.mkdir(path.dirname(looseFile), { recursive: true });
    await fs.writeFile(
      looseFile,
      'dialect "loose" { version = "0.1.0" }\nconcept "thing" { description = "Loose source." }\n',
    );
    await runEditor(looseFile, "standalone");
  } finally {
    await fs.rm(temporaryRoot, { recursive: true, force: true });
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
