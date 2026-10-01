# Rootform editors

Thin VS Code and Zed integrations for `.rf.hcl`, powered by `rootform lsp`.
The extensions do not include or download Rootform.

Use a compatible local Rootform executable during development. Editor package
instructions live in [VS Code](vscode/README.md) and [Zed](zed/README.md).

```sh
bun install --frozen-lockfile
bun run verify
```

Real integration qualification requires `ROOTFORM_BINARY` set to an explicitly
provided Rootform executable. Language semantics come from Rootform's compiler;
the clients only own syntax presentation, launch and lifecycle.

Source is [Apache-2.0](LICENSE). Third-party syntax dependencies retain their
original licenses.
