import { execFileSync, spawnSync } from "node:child_process";
import { copyFileSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";

if (Bun.version !== "1.4.0") throw new Error("Bun 1.4.0 is required");

/* Both editors ship the same release: one version and one description across
   the VS Code manifest, the Zed manifest and the Zed crate. */
const vscode = JSON.parse(readFileSync("vscode/package.json", "utf8"));
const zed = Bun.TOML.parse(readFileSync("zed/extension.toml", "utf8")) as Record<string, unknown>;
const crate = Bun.TOML.parse(readFileSync("zed/Cargo.toml", "utf8")) as {
  package: { version: string };
};
const mismatches = [
  ["version", vscode.version, zed.version, crate.package.version],
  ["description", vscode.description, zed.description],
  ["name", vscode.displayName, zed.name],
].filter(([, ...values]) => new Set(values).size !== 1);
for (const [field, ...values] of mismatches) {
  console.error(
    `Editor manifests disagree on ${field}: ${values.map((v) => JSON.stringify(v)).join(" / ")}`,
  );
}
if (mismatches.length > 0) process.exit(1);

const scanRoot = mkdtempSync(join(tmpdir(), "rootform-editor-scan-"));
try {
  const candidates = execFileSync("git", [
    "ls-files",
    "--cached",
    "--others",
    "--exclude-standard",
    "-z",
  ])
    .toString()
    .split("\0")
    .filter(Boolean);
  for (const path of candidates) {
    const stat = lstatSync(path);
    if (!stat.isFile() || stat.isSymbolicLink())
      throw new Error("Unexpected tracked entry in secret scan");
    const target = join(scanRoot, path);
    mkdirSync(dirname(target), { recursive: true });
    copyFileSync(path, target);
  }
  const scan = spawnSync(
    "gitleaks",
    ["dir", "--no-banner", "--redact", "--config", join(process.cwd(), ".gitleaks.toml"), scanRoot],
    { stdio: "inherit" },
  );
  if (scan.status !== 0) process.exit(scan.status ?? 1);
} finally {
  rmSync(scanRoot, { recursive: true, force: true });
}

for (const command of [
  ["bun", "scripts/check-publication.ts"],
  ["bun", "test", "scripts/publication-safety.test.ts", "scripts/build-zed.test.ts"],
  ["gitleaks", "git", "--no-banner", "--redact", "--config", ".gitleaks.toml", "."],
  ["bun", "run", "check:format"],
  ["bun", "run", "build:vscode"],
  ["bun", "run", "--cwd", "vscode", "test:unit"],
  ["cargo", "+1.90", "fmt", "--manifest-path", "zed/Cargo.toml", "--", "--check"],
  ["cargo", "+1.90", "test", "--manifest-path", "zed/Cargo.toml", "--locked"],
  ["bun", "run", "build:zed"],
]) {
  const result = spawnSync(command[0]!, command.slice(1), { stdio: "inherit", shell: false });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}
