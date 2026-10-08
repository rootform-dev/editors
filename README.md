# Rootform editors

VS Code and Zed extensions for `.rf.hcl` source: diagnostics, completion,
hover, definitions and formatting through `rootform lsp`.

Install a local [Rootform CLI](https://docs.rootform.dev/installation/), then
choose your editor:

| Editor | Setup |
| --- | --- |
| VS Code (Visual Studio Marketplace, Open VSX) | [Extension guide](vscode/README.md) |
| Zed (extension registry) | [Extension guide](zed/README.md) |

Both clients launch an existing executable from settings or `PATH`. They ship
no compiler, download no Rootform binary and execute no providers.
See [editing Rootform source](https://docs.rootform.dev/language/editors/).

## Develop

```sh
bun install --frozen-lockfile
bun run verify
```

The gate validates manifests, formatting, VS Code build and tests, Zed grammar
queries and the `wasm32-wasip2` package with Rust 1.90. Real editor integration
requires an explicitly provided local Rootform executable; see the
[editor contract](docs/editor-contract.md).
Native editor qualification covers macOS arm64. Linux and Windows runtime
qualification remains separate from package checks.

[Releasing](docs/releasing.md) covers versioning and store publication.

## License

[Apache-2.0](LICENSE). Third-party dependencies retain their licenses.
[Rootform trademark terms](https://github.com/rootform-dev/rootform/blob/dev/TRADEMARKS.md) apply.
