const assert = require("node:assert/strict");
const cp = require("node:child_process");
const fs = require("node:fs/promises");
const path = require("node:path");
const vscode = require("vscode");

function delay(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function completionLabel(item) {
  return typeof item.label === "string" ? item.label : (item.label?.label ?? "");
}

async function until(description, predicate, timeoutMs = 15000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const result = await predicate();
    if (result) return result;
    await delay(100);
  }
  const diagnostics = vscode.languages.getDiagnostics().map(([uri, items]) => ({
    file: uri.fsPath,
    diagnostics: items.map(({ code, message, range }) => ({ code, message, range })),
  }));
  throw new Error(`Timed out waiting for ${description}.\n${JSON.stringify(diagnostics, null, 2)}`);
}

async function replaceDocument(document, content) {
  const edit = new vscode.WorkspaceEdit();
  const entireDocument = new vscode.Range(
    document.positionAt(0),
    document.positionAt(document.getText().length),
  );
  edit.replace(document.uri, entireDocument, content);
  assert.equal(await vscode.workspace.applyEdit(edit), true);
}

async function openFile(filename) {
  const document = await vscode.workspace.openTextDocument(vscode.Uri.file(filename));
  await vscode.window.showTextDocument(document, { preview: false });
  return document;
}

async function rootformLogContains(message) {
  const logs = path.join(process.env.ROOTFORM_TEST_USER_DATA, "logs");
  for (const relative of await fs.readdir(logs, { recursive: true })) {
    if (relative.endsWith("Rootform.log")) {
      if ((await fs.readFile(path.join(logs, relative), "utf8")).includes(message)) return true;
    }
  }
  return false;
}

function referencePosition(document) {
  const line = document
    .getText()
    .split(/\r?\n/)
    .findIndex((text) => text.includes("concept.network"));
  assert.notEqual(line, -1, "Expected local Concept reference in the test document.");
  return new vscode.Position(line, document.lineAt(line).text.indexOf("network") + 1);
}

async function run() {
  const rootformBinary = process.env.ROOTFORM_BINARY;
  const testRoot = process.env.ROOTFORM_TEST_ROOT;
  assert.ok(rootformBinary, "ROOTFORM_BINARY was not passed to the extension host.");
  assert.ok(testRoot, "ROOTFORM_TEST_ROOT was not passed to the extension host.");
  await until(
    "fixture workspace trust granted through VS Code",
    () => vscode.workspace.isTrusted,
    60000,
  );

  const extension = vscode.extensions.getExtension("rootform-dev.rootform");
  assert.ok(extension, "Rootform extension did not load in the extension host.");
  await extension.activate();

  if (process.env.ROOTFORM_TEST_PHASE === "reopen") {
    const rule = await openFile(path.join(testRoot, "first", "rule.rf.hcl"));
    await until(
      "saved workspace definition after reopening",
      async () =>
        (
          await vscode.commands.executeCommand(
            "vscode.executeDefinitionProvider",
            rule.uri,
            referencePosition(rule),
          )
        )?.length > 0,
    );
    await until(
      "saved workspace without diagnostics",
      () => vscode.languages.getDiagnostics(rule.uri).length === 0,
    );
    console.log("Rootform workspace reopen passed.");
    return;
  }
  if (process.env.ROOTFORM_TEST_PHASE === "standalone") {
    assert.equal(vscode.workspace.workspaceFolders?.length ?? 0, 0);
    const document = vscode.window.activeTextEditor?.document;
    assert.ok(document);
    assert.equal(document.languageId, "rootform");
    const source = document.getText();
    await replaceDocument(document, source.replace('version = "0.1.0"', 'version = "0.1"'));
    await until(
      "standalone file diagnostic",
      () => vscode.languages.getDiagnostics(document.uri).length > 0,
    );
    await replaceDocument(document, source);
    await until(
      "standalone source recovering",
      () => vscode.languages.getDiagnostics(document.uri).length === 0,
    );
    console.log("Rootform standalone file passed.");
    return;
  }

  const firstRoot = path.join(testRoot, "first");
  const secondRoot = path.join(testRoot, "second");
  const jsonRoot = path.join(testRoot, "json");
  const dialect = await openFile(path.join(firstRoot, "dialect.rf.hcl"));
  assert.equal(dialect.languageId, "rootform");
  const rule = await openFile(path.join(firstRoot, "rule.rf.hcl"));
  const peerDialect = await openFile(path.join(secondRoot, "dialect.rf.hcl"));
  const jsonDialect = await openFile(path.join(jsonRoot, "dialect.rf.json"));
  const policy = await openFile(path.join(testRoot, "policies", "checks.rf.hcl"));

  assert.equal(
    vscode.workspace.workspaceFolders?.length,
    4,
    "The fixture must open all workspace folders.",
  );
  assert.equal(
    jsonDialect.languageId,
    "json",
    "JSON source keeps VS Code's JSON editor presentation.",
  );
  const settings = vscode.workspace.getConfiguration("rootform");
  assert.equal(path.resolve(settings.get("server.path")), path.resolve(rootformBinary));

  await replaceDocument(
    peerDialect,
    peerDialect.getText().replace('version = "0.1.0"', 'version = "0.1"'),
  );
  await until(
    "a real Rootform diagnostic in the second workspace root",
    () => vscode.languages.getDiagnostics(peerDialect.uri).length > 0,
  );
  await replaceDocument(
    peerDialect,
    peerDialect.getText().replace('version = "0.1"', 'version = "0.1.0"'),
  );
  await until(
    "diagnostics clearing in the second workspace root",
    () => vscode.languages.getDiagnostics(peerDialect.uri).length === 0,
  );

  await replaceDocument(dialect, dialect.getText().replace('version = "0.1.0"', 'version = "0.1"'));
  await until(
    "a real Rootform diagnostic in the first workspace root",
    () => vscode.languages.getDiagnostics(dialect.uri).length > 0,
  );
  assert.equal(
    vscode.languages.getDiagnostics(peerDialect.uri).length,
    0,
    "Root diagnostics must stay inside their workspace folder.",
  );
  assert.equal(
    vscode.languages.getDiagnostics(jsonDialect.uri).length,
    0,
    "Root diagnostics must not leak into other workspace folders.",
  );
  await replaceDocument(dialect, dialect.getText().replace('version = "0.1"', 'version = "0.1.0"'));
  await until(
    "diagnostics clearing after a valid edit",
    () => vscode.languages.getDiagnostics(dialect.uri).length === 0,
  );

  await replaceDocument(
    jsonDialect,
    jsonDialect.getText().replace('"version": "0.1.0"', '"version": "0.1"'),
  );
  await until(
    "Rootform diagnostics for a JSON source document",
    () => vscode.languages.getDiagnostics(jsonDialect.uri).length > 0,
  );
  await replaceDocument(
    jsonDialect,
    jsonDialect.getText().replace('"version": "0.1"', '"version": "0.1.0"'),
  );
  await until(
    "diagnostics clearing for a JSON source document",
    () => vscode.languages.getDiagnostics(jsonDialect.uri).length === 0,
  );

  const partialRule = rule.getText().replace("as=concept.network", "as=concept.");
  await replaceDocument(rule, partialRule);
  const completionLine = partialRule.split(/\r?\n/).findIndex((line) => line.includes("concept."));
  const completionPosition = new vscode.Position(
    completionLine,
    partialRule.split(/\r?\n/)[completionLine].length,
  );
  const completionResult = await vscode.commands.executeCommand(
    "vscode.executeCompletionItemProvider",
    rule.uri,
    completionPosition,
  );
  const completions = Array.isArray(completionResult)
    ? completionResult
    : (completionResult?.items ?? []);
  const networkCompletion = completions.find((item) => {
    const label = completionLabel(item);
    return label === "network" || label.endsWith(".network");
  });
  assert.ok(networkCompletion, "Rootform completion should offer the local Concept reference.");
  assert.equal(
    completions.some((item) => {
      const label = completionLabel(item);
      return (
        label === "service" ||
        label.endsWith(".service") ||
        label === "json-service" ||
        label.endsWith(".json-service")
      );
    }),
    false,
    "Completion in the first root must not include a Concept from the second root.",
  );

  const completionEdit = new vscode.WorkspaceEdit();
  const textEdit = networkCompletion.textEdit;
  if (textEdit && "range" in textEdit) {
    completionEdit.replace(rule.uri, textEdit.range, textEdit.newText);
  } else if (networkCompletion.range && networkCompletion.insertText) {
    const range =
      networkCompletion.range instanceof vscode.Range
        ? networkCompletion.range
        : networkCompletion.range.replacing;
    completionEdit.replace(rule.uri, range, String(networkCompletion.insertText));
  } else if (networkCompletion.insertText) {
    completionEdit.insert(rule.uri, completionPosition, String(networkCompletion.insertText));
  } else {
    completionEdit.insert(rule.uri, completionPosition, String(networkCompletion.label));
  }
  assert.equal(
    await vscode.workspace.applyEdit(completionEdit),
    true,
    "Completion edit should apply to the document.",
  );
  await until("completion text being applied", () =>
    rule.getText().includes("as=demo.concept.network"),
  );
  assert.equal(rule.getText().includes("concept.concept."), false);
  await until(
    "completed source being valid",
    () => vscode.languages.getDiagnostics(rule.uri).length === 0,
  );

  const beforeAmbiguousOwner = dialect.getText();
  await replaceDocument(
    dialect,
    beforeAmbiguousOwner + '\ndialect "other" { version = "0.1.0" }\n',
  );
  await until(
    "conflicting owner diagnostic",
    () => vscode.languages.getDiagnostics(dialect.uri).length > 0,
  );
  const ambiguousResult = await vscode.commands.executeCommand(
    "vscode.executeCompletionItemProvider",
    rule.uri,
    referencePosition(rule),
  );
  const ambiguousItems = Array.isArray(ambiguousResult)
    ? ambiguousResult
    : (ambiguousResult?.items ?? []);
  assert.ok(ambiguousItems.some((item) => completionLabel(item).startsWith("rf.")));
  assert.equal(
    ambiguousItems.some((item) => completionLabel(item).startsWith("demo.")),
    false,
    "Completion must not choose an owner from conflicting headers in one file.",
  );
  await replaceDocument(dialect, beforeAmbiguousOwner);
  await until(
    "owner conflict recovering",
    () => vscode.languages.getDiagnostics(dialect.uri).length === 0,
  );

  const hover = await vscode.commands.executeCommand(
    "vscode.executeHoverProvider",
    rule.uri,
    referencePosition(rule),
  );
  assert.ok(
    Array.isArray(hover) && hover.some((item) => item.contents?.length),
    "Hover provider should return Rootform information.",
  );
  const definitions = await vscode.commands.executeCommand(
    "vscode.executeDefinitionProvider",
    rule.uri,
    referencePosition(rule),
  );
  assert.ok(
    Array.isArray(definitions) && definitions.length > 0,
    "Definition provider should find the local Concept.",
  );

  const formatting = await vscode.commands.executeCommand(
    "vscode.executeFormatDocumentProvider",
    rule.uri,
    { tabSize: 2, insertSpaces: true },
  );
  assert.ok(
    Array.isArray(formatting) && formatting.length > 0,
    "Formatter should offer edits for the deliberately unformatted fixture.",
  );
  const formatEdit = new vscode.WorkspaceEdit();
  for (const item of formatting) formatEdit.replace(rule.uri, item.range, item.newText);
  assert.equal(
    await vscode.workspace.applyEdit(formatEdit),
    true,
    "Rootform formatting edits should apply.",
  );
  await until("canonical formatting being applied", () => /^  match \{/m.test(rule.getText()));

  const peerBefore = peerDialect.getText();
  await replaceDocument(peerDialect, peerBefore.replace('version = "0.1.0"', 'version = "0.1"'));
  await replaceDocument(
    peerDialect,
    peerDialect.getText().replace('version = "0.1"', 'version = "0.1.0"'),
  );
  await replaceDocument(
    dialect,
    dialect
      .getText()
      .replace(
        'description = "Synthetic symbol for the VS Code integration fixture."',
        'description = "rapid edit one"',
      ),
  );
  await replaceDocument(
    dialect,
    dialect.getText().replace('description = "rapid edit one"', 'description = "rapid edit two"'),
  );
  await fs.writeFile(path.join(firstRoot, "rootform.lock"), 'format_version: "1"\n');
  await fs.writeFile(
    path.join(firstRoot, ".terraform.lock.hcl"),
    "# Synthetic lock watcher fixture.\n",
  );
  await until(
    "both workspace roots remaining diagnostic-free",
    () =>
      vscode.languages.getDiagnostics(dialect.uri).length === 0 &&
      vscode.languages.getDiagnostics(peerDialect.uri).length === 0 &&
      vscode.languages.getDiagnostics(jsonDialect.uri).length === 0 &&
      vscode.languages.getDiagnostics(rule.uri).length === 0,
  );

  // Policy source uses its compiler and can navigate a fully qualified authored symbol.
  const policyDefinitions = await vscode.commands.executeCommand(
    "vscode.executeDefinitionProvider",
    policy.uri,
    referencePosition(policy),
  );
  assert.ok(
    policyDefinitions?.some((item) => (item.uri ?? item.targetUri).fsPath === dialect.uri.fsPath),
  );
  const policySource = policy.getText();
  await replaceDocument(policy, policySource.replace("demo.concept.network", "concept.network"));
  await until(
    "Policy compiler rejecting an unqualified target",
    () => vscode.languages.getDiagnostics(policy.uri).length > 0,
  );
  await replaceDocument(policy, policySource);
  await until(
    "Policy source recovering",
    () => vscode.languages.getDiagnostics(policy.uri).length === 0,
  );

  // Temporary syntax failure must not poison subsequent documents or requests.
  const ruleSource = rule.getText();
  await replaceDocument(rule, ruleSource + '\nrule "unfinished" {\n');
  await until(
    "temporary syntax diagnostic",
    () => vscode.languages.getDiagnostics(rule.uri).length > 0,
  );
  await replaceDocument(rule, ruleSource);
  await until("syntax recovery", () => vscode.languages.getDiagnostics(rule.uri).length === 0);

  // Closed sibling files are read from disk. Creation and deletion must both refresh references.
  const networkBlock = /concept "network" \{[^}]*\}\n?/;
  const declaration = dialect.getText().match(networkBlock)?.[0];
  assert.ok(declaration);
  await replaceDocument(dialect, dialect.getText().replace(networkBlock, ""));
  await dialect.save();
  await until("broken sibling reference", () =>
    vscode.languages.getDiagnostics(rule.uri).some((item) => item.code === "CONCEPT_UNKNOWN"),
  );
  const newSibling = path.join(firstRoot, "network.rf.hcl");
  await fs.writeFile(newSibling, declaration);
  await until(
    "created sibling restoring reference",
    () => vscode.languages.getDiagnostics(rule.uri).length === 0,
  );
  await fs.unlink(newSibling);
  await until("deleted sibling breaking reference", () =>
    vscode.languages.getDiagnostics(rule.uri).some((item) => item.code === "CONCEPT_UNKNOWN"),
  );
  await fs.writeFile(newSibling, declaration);
  await until(
    "recreated sibling restoring reference",
    () => vscode.languages.getDiagnostics(rule.uri).length === 0,
  );
  await rule.save();
  await peerDialect.save();
  await jsonDialect.save();
  await policy.save();
  cp.execFileSync(rootformBinary, ["validate", "dialects", firstRoot, "--no-pager"], {
    stdio: "pipe",
  });

  if (process.platform === "darwin" || process.platform === "linux") {
    // A process that exits before initialize must fail once, then recover when
    // the configured executable is corrected. Use a local recording fixture.
    const incompatible = path.join(testRoot, "incompatible-server");
    await fs.writeFile(incompatible, '#!/bin/sh\nprintf "attempt\\n" >> "$0.attempts"\nexit 0\n');
    await fs.chmod(incompatible, 0o755);
    await settings.update("server.path", incompatible, vscode.ConfigurationTarget.Global);
    await until("incompatible executable attempted", async () => {
      try {
        return (await fs.readFile(`${incompatible}.attempts`, "utf8")).length > 0;
      } catch {
        return false;
      }
    });
    await delay(500);
    assert.equal(
      await fs.readFile(`${incompatible}.attempts`, "utf8"),
      "attempt\n",
      "A failed initial handshake must not start an automatic retry loop.",
    );
    await until("incompatible handshake reported as failure", () =>
      rootformLogContains(`Rootform language server could not initialize from "${incompatible}"`),
    );
    await settings.update("server.path", rootformBinary, vscode.ConfigurationTarget.Global);
    await until(
      "hover after correcting an incompatible executable",
      async () =>
        (
          await vscode.commands.executeCommand(
            "vscode.executeHoverProvider",
            rule.uri,
            referencePosition(rule),
          )
        )?.length > 0,
    );
    const stalled = path.join(testRoot, "stalled-server");
    await fs.writeFile(stalled, '#!/bin/sh\nprintf "%s" "$$" > "$0.pid"\nexec /bin/sleep 60\n');
    await fs.chmod(stalled, 0o755);
    await settings.update("server.path", stalled, vscode.ConfigurationTarget.Global);
    const stalledPid = await until("silent executable started", async () => {
      try {
        return Number(await fs.readFile(`${stalled}.pid`, "utf8"));
      } catch {
        return false;
      }
    });
    try {
      await settings.update("server.path", rootformBinary, vscode.ConfigurationTarget.Global);
      await until("silent initialize timeout reported with its cause", () =>
        rootformLogContains(
          `Rootform language server did not initialize within 10 seconds from "${stalled}"`,
        ),
      );
      await until(
        "silent initialize timing out and corrected path recovering",
        async () =>
          (
            await vscode.commands.executeCommand(
              "vscode.executeHoverProvider",
              rule.uri,
              referencePosition(rule),
            )
          )?.length > 0,
      );
      assert.throws(() => process.kill(stalledPid, 0), { code: "ESRCH" });
    } finally {
      try {
        process.kill(stalledPid, "SIGKILL");
      } catch (error) {
        if (error.code !== "ESRCH") throw error;
      }
    }
    const children = () =>
      cp
        .execFileSync("ps", ["-axo", "pid=,ppid=,command="], { encoding: "utf8" })
        .split("\n")
        .map((line) => /^\s*(\d+)\s+(\d+)\s+(.*)$/.exec(line))
        .filter(Boolean)
        .filter(
          (item) =>
            Number(item[2]) === process.pid &&
            item[3].includes(rootformBinary) &&
            item[3].endsWith(" lsp"),
        )
        .map((item) => Number(item[1]));
    const [serverPid] = await until(
      "one running local Rootform child",
      () => children().length === 1 && children(),
    );
    process.kill(serverPid, "SIGKILL");
    await until(
      "Rootform child restarting after process death",
      () => children().length === 1 && children()[0] !== serverPid,
    );
    await until(
      "hover after process death",
      async () =>
        (
          await vscode.commands.executeCommand(
            "vscode.executeHoverProvider",
            rule.uri,
            referencePosition(rule),
          )
        )?.length > 0,
    );
  }

  await vscode.commands.executeCommand("rootform.restartLanguageServer");
  const postRestartHover = await vscode.commands.executeCommand(
    "vscode.executeHoverProvider",
    rule.uri,
    referencePosition(rule),
  );
  assert.ok(
    Array.isArray(postRestartHover) && postRestartHover.length > 0,
    "Providers should work after a serialized restart.",
  );
}

module.exports = {
  run: async () => {
    try {
      await run();
      console.log("Rootform real extension-host scenarios passed.");
    } catch (error) {
      console.error(error);
      throw error;
    }
  },
};
