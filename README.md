# Rootform editors

VS Code and Zed extensions for Rootform `.rf.hcl` source, powered by
`rootform lsp` from a local Rootform CLI. The extensions do not include or
download Rootform; language semantics come from Rootform's compiler, and the
clients own syntax presentation, launch and lifecycle.

- [VS Code](vscode/README.md), for the Visual Studio Marketplace and Open VSX
- [Zed](zed/README.md), for the Zed extension registry

## Development

```sh
bun install --frozen-lockfile
bun run verify
```

`verify` checks that both manifests share one version and description, checks
formatting, builds and unit-tests the VS Code client, tests the Zed queries
against the pinned HCL grammar and builds the Zed package for `wasm32-wasip2`
with Rust 1.90, the toolchain the Zed registry packages with.

Real integration qualification uses an explicitly provided Rootform executable
and a local VS Code. Nothing is downloaded:

```sh
VSCODE_EXECUTABLE_PATH="/Applications/Visual Studio Code.app/Contents/MacOS/Code" \
ROOTFORM_BINARY="/absolute/path/to/rootform" \
bun run --cwd vscode test:integration
```

The runner uses a temporary multi-root fixture workspace with unique VS Code
user-data and extension directories. The fixture source is synthetic.

To try the Zed package, run `zed: install dev extension` in Zed and select the
`zed/` directory. Zed may need network access to prepare the pinned HCL
grammar and `wasi-sdk` while building it; the language server always comes
from the local Rootform executable.

Native editor runtime qualification currently covers macOS arm64. The Zed
package also builds for `wasm32-wasip2`; Linux and Windows editor runtimes
have not yet been qualified.

## Releasing

[Releasing](docs/releasing.md) covers versioning, the release workflow and
publication to each store.

## License

Source is [Apache-2.0](LICENSE). Third-party dependencies retain their original
licenses. Rootform name and logo: trademark rights reserved, see
[TRADEMARKS.md](https://github.com/rootform-dev/rootform/blob/dev/TRADEMARKS.md).
