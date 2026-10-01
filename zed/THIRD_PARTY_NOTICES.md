# Third-party notices

## tree-sitter-hcl

The extension uses the HCL Tree-sitter grammar from
[`tree-sitter-grammars/tree-sitter-hcl`](https://github.com/tree-sitter-grammars/tree-sitter-hcl),
pinned in `extension.toml` to commit
[`fad991865fee927dd1de5e172fb3f08ac674d914`](https://github.com/tree-sitter-grammars/tree-sitter-hcl/tree/fad991865fee927dd1de5e172fb3f08ac674d914)
(v1.2.0). The upstream Apache License 2.0 text is retained at
[`licenses/tree-sitter-hcl-LICENSE`](licenses/tree-sitter-hcl-LICENSE), copied
from that exact commit's `LICENSE` file.

## Rust runtime dependencies

The WASM extension uses the following locked runtime dependencies. License
texts are retained below. Host-only procedural macros and test dependencies
are excluded from this runtime inventory.

| Crate | Version | Retained license |
| --- | --- | --- |
| [bitflags](https://crates.io/crates/bitflags/2.13.2) | 2.13.2 | [MIT](licenses/bitflags-2.13.2-LICENSE-MIT) |
| [equivalent](https://crates.io/crates/equivalent/1.0.2) | 1.0.2 | [MIT](licenses/equivalent-1.0.2-LICENSE-MIT) |
| [futures](https://crates.io/crates/futures/0.3.34) | 0.3.34 | [MIT](licenses/futures-0.3.34-LICENSE-MIT) |
| [futures-channel](https://crates.io/crates/futures-channel/0.3.34) | 0.3.34 | [MIT](licenses/futures-channel-0.3.34-LICENSE-MIT) |
| [futures-core](https://crates.io/crates/futures-core/0.3.34) | 0.3.34 | [MIT](licenses/futures-core-0.3.34-LICENSE-MIT) |
| [futures-executor](https://crates.io/crates/futures-executor/0.3.34) | 0.3.34 | [MIT](licenses/futures-executor-0.3.34-LICENSE-MIT) |
| [futures-io](https://crates.io/crates/futures-io/0.3.34) | 0.3.34 | [MIT](licenses/futures-io-0.3.34-LICENSE-MIT) |
| [futures-sink](https://crates.io/crates/futures-sink/0.3.34) | 0.3.34 | [MIT](licenses/futures-sink-0.3.34-LICENSE-MIT) |
| [futures-task](https://crates.io/crates/futures-task/0.3.34) | 0.3.34 | [MIT](licenses/futures-task-0.3.34-LICENSE-MIT) |
| [futures-util](https://crates.io/crates/futures-util/0.3.34) | 0.3.34 | [MIT](licenses/futures-util-0.3.34-LICENSE-MIT) |
| [hashbrown](https://crates.io/crates/hashbrown/0.17.1) | 0.17.1 | [MIT](licenses/hashbrown-0.17.1-LICENSE-MIT) |
| [indexmap](https://crates.io/crates/indexmap/2.14.2) | 2.14.2 | [MIT](licenses/indexmap-2.14.2-LICENSE-MIT) |
| [itoa](https://crates.io/crates/itoa/1.0.18) | 1.0.18 | [MIT](licenses/itoa-1.0.18-LICENSE-MIT) |
| [memchr](https://crates.io/crates/memchr/2.8.3) | 2.8.3 | [MIT](licenses/memchr-2.8.3-LICENSE-MIT) |
| [once_cell](https://crates.io/crates/once_cell/1.21.4) | 1.21.4 | [MIT](licenses/once_cell-1.21.4-LICENSE-MIT) |
| [pin-project-lite](https://crates.io/crates/pin-project-lite/0.2.17) | 0.2.17 | [MIT](licenses/pin-project-lite-0.2.17-LICENSE-MIT) |
| [serde](https://crates.io/crates/serde/1.0.229) | 1.0.229 | [MIT](licenses/serde-1.0.229-LICENSE-MIT) |
| [serde_core](https://crates.io/crates/serde_core/1.0.229) | 1.0.229 | [MIT](licenses/serde_core-1.0.229-LICENSE-MIT) |
| [serde_json](https://crates.io/crates/serde_json/1.0.151) | 1.0.151 | [MIT](licenses/serde_json-1.0.151-LICENSE-MIT) |
| [slab](https://crates.io/crates/slab/0.4.12) | 0.4.12 | [MIT](licenses/slab-0.4.12-LICENSE) |
| [wit-bindgen](https://crates.io/crates/wit-bindgen/0.41.0) | 0.41.0 | [MIT](licenses/wit-bindgen-0.41.0-LICENSE-MIT) |
| [wit-bindgen-rt](https://crates.io/crates/wit-bindgen-rt/0.41.0) | 0.41.0 | [MIT](licenses/wit-bindgen-rt-0.41.0-LICENSE-MIT) |
| [zed_extension_api](https://crates.io/crates/zed_extension_api/0.7.0) | 0.7.0 | [Apache-2.0](licenses/zed_extension_api-0.7.0-LICENSE-APACHE) |
| [zmij](https://crates.io/crates/zmij/1.0.23) | 1.0.23 | [MIT](licenses/zmij-1.0.23-LICENSE-MIT) |
