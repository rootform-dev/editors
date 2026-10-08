# Rootform for VS Code

Write `.rf.hcl` with diagnostics, completion, hover, definitions and formatting.
The extension adds syntax highlighting and launches `rootform lsp` from your
local CLI. It ships no compiler and downloads no Rootform binary. Editing
executes no providers and makes no cloud calls.

## Get started

1. [Install Rootform](https://docs.rootform.dev/installation/) and verify
   `rootform version`.
2. Install the extension in VS Code 1.133 or later.
3. Open a trusted workspace containing `.rf.hcl` files.

The extension uses `rootform` from VS Code's `PATH`. For another location, set
**Rootform: Server Path**:

```json
{
  "rootform.server.path": "/absolute/path/to/rootform"
}
```

The setting accepts an absolute path or a command name. Run **Rootform: Restart
Language Server** after changing the executable. `.rf.json` files also reach the
server, while VS Code keeps their JSON presentation.

## Trust and troubleshooting

In Restricted Mode, syntax highlighting works and no process starts. A workspace
cannot change the executable path until you trust it.

If Rootform is missing, set an absolute path; VS Code may have a different
`PATH` from your terminal. Initialization times out after 10 seconds. Fix the
setting, then restart the language server. After a successful start, unexpected
server exits have a bounded number of automatic retries.

[VS Code guide](https://docs.rootform.dev/integrations/vscode/) |
[`rootform lsp`](https://docs.rootform.dev/reference/cli/lsp/) |
[Report an issue](https://github.com/rootform-dev/editors/issues)

## License

[Apache-2.0](https://github.com/rootform-dev/editors/blob/dev/vscode/LICENSE).
[Third-party notices](https://github.com/rootform-dev/editors/blob/dev/vscode/THIRD_PARTY_NOTICES.md)
and [Rootform trademark terms](https://github.com/rootform-dev/rootform/blob/dev/TRADEMARKS.md) apply.
