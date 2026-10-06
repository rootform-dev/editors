# Rootform for VS Code

Write Rootform `.rf.hcl` source with diagnostics, completion, hover, go to
definition and formatting. The extension adds the Rootform language mode, with
syntax highlighting, comments, bracket matching, automatic closing,
indentation and folding, and connects VS Code to `rootform lsp` from your
local Rootform CLI.

Rootform owns parsing, compilation and formatting. The extension contains no
compiler and does not include or download Rootform. Editing runs no Terraform,
OpenTofu, provider or cloud call.

## Requirements

- Rootform on your machine. Follow
  [Install Rootform](https://docs.rootform.dev/installation/), then check that
  `rootform version` works.
- VS Code 1.133 or later.

## Get started

1. Install Rootform, then this extension.
2. Open a trusted workspace containing `.rf.hcl` files.
3. Edit a Dialect or Policy Pack. Diagnostics follow your unsaved changes.

The extension starts `rootform` from VS Code's `PATH`. If Rootform is
installed elsewhere, set **Rootform: Server Path** to the absolute path of the
executable:

```json
{
  "rootform.server.path": "/absolute/path/to/rootform"
}
```

`.rf.json` source files also reach the language server; VS Code keeps its JSON
presentation for them.

## Settings and commands

| Setting or command | Purpose |
| --- | --- |
| `rootform.server.path` | Absolute path, or command name resolved through `PATH`, of the local Rootform executable. Default: `rootform`. |
| **Rootform: Restart Language Server** | Restarts `rootform lsp`, for example after replacing the executable outside VS Code. |

## Workspace trust

The extension starts the configured executable only in a trusted workspace.
In Restricted Mode, syntax highlighting still works and no process starts. A
workspace cannot change `rootform.server.path` until you trust it.

## Troubleshooting

- **Rootform executable was not found**: install Rootform or set
  `rootform.server.path` to an absolute path. A desktop application may not
  see the `PATH` of your terminal.
- If the process does not complete LSP initialization within 10 seconds, the
  extension stops it and points to the setting. A failed first start is not
  retried: fix the setting, then run **Rootform: Restart Language Server**.
- A server that stops after a successful start is restarted by the language
  client, within a bounded number of attempts.

## Learn more

- [Rootform in VS Code](https://docs.rootform.dev/integrations/vscode/)
- [Edit Rootform source](https://docs.rootform.dev/language/editors/)
- [`rootform lsp` reference](https://docs.rootform.dev/reference/cli/lsp/)
- [Report an issue](https://github.com/rootform-dev/editors/issues)

## License

The extension source is licensed under
[Apache-2.0](https://github.com/rootform-dev/editors/blob/dev/vscode/LICENSE).
Bundled runtime packages keep their own licenses, listed in
[THIRD_PARTY_NOTICES.md](https://github.com/rootform-dev/editors/blob/dev/vscode/THIRD_PARTY_NOTICES.md).
Rootform name and logo: trademark rights reserved, see
[TRADEMARKS.md](https://github.com/rootform-dev/rootform/blob/dev/TRADEMARKS.md).
