# Rootform for VS Code

Rootform adds the `rootform` language mode for `.rf.hcl`, HCL lexical coloring,
comments, bracket matching, automatic closing, indentation and folding. The
Rootform language server supplies diagnostics, completion, hover, definitions
and formatting. The extension contains no compiler, executable or provider.

Install Rootform separately, then set **Rootform: Server Path** to an absolute
path to the local executable or leave it as `rootform` to resolve it through
`PATH`. In an untrusted workspace the extension does not launch a process. Trust
the workspace to start the configured executable. Run **Rootform: Restart
Language Server** after changing the executable outside VS Code.

A process that does not complete LSP initialization within 10 seconds is
stopped with a setting remediation. A failed initial handshake is not retried
automatically; a process that dies after successful initialization uses the
language client's bounded restart policy.

The package supports VS Code 1.133.0 and later. `.rf.json` files are also sent
to the same language server; VS Code keeps their JSON editor presentation.

## Development

The editor repository uses Bun workspaces. From the repository root, install
the lockfile once and run `bun run verify`. To qualify the real extension host,
provide both locally installed executables:

```sh
VSCODE_EXECUTABLE_PATH="/Applications/Visual Studio Code.app/Contents/MacOS/Code" \
ROOTFORM_BINARY="/absolute/path/to/rootform" \
bun run --filter rootform test:integration
```

The integration runner uses a temporary multi-root fixture workspace and unique
VS Code user-data and extension directories. It does not download VS Code or
Rootform. The fixture language source is synthetic and contains no production
Engine implementation.

Source is licensed under Apache-2.0.
