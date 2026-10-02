import { spawnSync } from "node:child_process";

if (Bun.version !== "1.4.0") throw new Error("Bun 1.4.0 is required");
for (const command of [
  ["bun", "run", "check:format"],
  ["bun", "run", "build:vscode"],
  ["bun", "run", "--cwd", "vscode", "test:unit"],
  ["cargo", "+1.93.1", "fmt", "--manifest-path", "zed/Cargo.toml", "--", "--check"],
  ["cargo", "+1.93.1", "test", "--manifest-path", "zed/Cargo.toml", "--locked"],
  ["bun", "run", "build:zed"],
]) {
  const result = spawnSync(command[0]!, command.slice(1), { stdio: "inherit", shell: false });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}
