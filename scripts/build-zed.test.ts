import { expect, test } from "bun:test";
import { join, resolve } from "node:path";
import { zedBuildEnvironment } from "./build-zed.ts";

test("remaps dependency source locations without splitting paths containing spaces", () => {
  const cargoHome = resolve("fixture Cargo cache");
  const result = zedBuildEnvironment({ CARGO_HOME: cargoHome });
  expect(result.CARGO_ENCODED_RUSTFLAGS).toBe(
    `--remap-path-prefix=${join(cargoHome, "registry", "src")}=/cargo/registry/src`,
  );
});

test("preserves existing encoded flags and unrelated build environment", () => {
  const result = zedBuildEnvironment({
    CARGO_HOME: resolve("fixture-cargo"),
    CARGO_ENCODED_RUSTFLAGS: "-C\x1fopt-level=z",
    RUSTFLAGS: "ignored-by-cargo",
    CARGO_NET_OFFLINE: "true",
  });
  expect(result.CARGO_ENCODED_RUSTFLAGS?.split("\x1f").slice(0, 2)).toEqual(["-C", "opt-level=z"]);
  expect(result.CARGO_NET_OFFLINE).toBe("true");
});

test("preserves whitespace-separated RUSTFLAGS when no encoded flags were supplied", () => {
  const result = zedBuildEnvironment({
    CARGO_HOME: resolve("fixture-cargo"),
    RUSTFLAGS: "-C opt-level=2",
  });
  expect(result.CARGO_ENCODED_RUSTFLAGS?.split("\x1f").slice(0, 2)).toEqual(["-C", "opt-level=2"]);
});
