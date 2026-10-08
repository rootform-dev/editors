# Rootform for Zed

Write `.rf.hcl` with diagnostics, completion, hover, definitions and formatting.
The extension adds syntax highlighting and launches `rootform lsp` from your
local CLI. It ships no compiler and downloads no Rootform binary.

## Get started

1. [Install Rootform](https://docs.rootform.dev/installation/) and verify
   `rootform version`.
2. In Zed's **Extensions**, install **Rootform**.
3. Open a `.rf.hcl` file.

The extension finds `rootform` on the worktree `PATH`. To choose another
executable, set both its path and arguments:

```json
{
  "lsp": {
    "rootform": {
      "binary": {
        "path": "/absolute/path/to/rootform",
        "arguments": ["lsp"]
      }
    }
  }
}
```

Zed launches that executable directly and passes `binary.env` to it.
Keep `arguments` set to `["lsp"]`. After a launch error or executable replacement,
run `editor: restart language server`.

[Zed guide](https://docs.rootform.dev/integrations/zed/) |
[`rootform lsp`](https://docs.rootform.dev/reference/cli/lsp/) |
[Report an issue](https://github.com/rootform-dev/editors/issues)

## License

[Apache-2.0](LICENSE). [Third-party notices](THIRD_PARTY_NOTICES.md) cover the
pinned HCL grammar and Rust dependencies.
[Rootform trademark terms](https://github.com/rootform-dev/rootform/blob/dev/TRADEMARKS.md) apply.
