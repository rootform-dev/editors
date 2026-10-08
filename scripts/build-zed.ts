import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join, resolve } from "node:path";
import { assertPublicMessage } from "./publication-safety.ts";

export function zedBuildEnvironment(environment: NodeJS.ProcessEnv): NodeJS.ProcessEnv {
  const cargoHome = resolve(environment.CARGO_HOME || join(homedir(), ".cargo"));
  const flags =
    environment.CARGO_ENCODED_RUSTFLAGS !== undefined
      ? environment.CARGO_ENCODED_RUSTFLAGS.split("\x1f").filter(Boolean)
      : (environment.RUSTFLAGS ?? "").split(/\s+/u).filter(Boolean);
  flags.push(`--remap-path-prefix=${join(cargoHome, "registry", "src")}=/cargo/registry/src`);
  return { ...environment, CARGO_ENCODED_RUSTFLAGS: flags.join("\x1f") };
}

if (import.meta.main) {
  const result = spawnSync(
    "cargo",
    [
      "+1.90",
      "build",
      "--manifest-path",
      "zed/Cargo.toml",
      "--locked",
      "--release",
      "--target",
      "wasm32-wasip2",
    ],
    { env: zedBuildEnvironment(process.env), stdio: "inherit", shell: false },
  );
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
  // Panic locations are data strings, so removing debug sections cannot sanitize them.
  assertPublicMessage(
    readFileSync("zed/target/wasm32-wasip2/release/rootform_zed.wasm").toString("utf8"),
  );
}
