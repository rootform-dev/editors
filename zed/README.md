# Rootform for Zed

The extension associates `.rf.hcl` files with Rootform syntax and starts the
existing `rootform lsp` server. Rootform owns parsing, diagnostics, completion,
navigation, and formatting; this package provides syntax presentation and LSP
transport.

To try the package locally, open Zed's command palette, run `zed: install dev extension`, and select this directory. Configure an installed Rootform
CLI in Zed's settings:

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

When `binary.path` is configured, Zed launches that executable directly. Set
`binary.arguments` to `["lsp"]` as shown above; omitting arguments starts
Rootform without a subcommand. Zed also passes `binary.env` to the process and
owns launch errors for this override.

Without `binary.path`, the extension finds `rootform` on Zed's worktree `PATH`
and supplies `["lsp"]`. A missing PATH executable produces a message with the
complete path-and-arguments setting. No server download or installation occurs. Use `editor: restart language server`
after correcting a failed launch or replacing the executable.

Zed may need network access to prepare the pinned HCL grammar and `wasi-sdk`
while building the development extension. That preparation is separate from
runtime: the language server always comes from the local Rootform executable.
Tree-sitter syntax supplies bracket matching, indentation, and Zed's default
syntax folding.
