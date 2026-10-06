# Rootform for Zed

Write Rootform `.rf.hcl` source with diagnostics, completion, hover, go to
definition and formatting. The extension adds Rootform syntax highlighting,
bracket matching, indentation and folding, and starts `rootform lsp` from your
local Rootform CLI.

Rootform owns parsing, compilation and formatting. The extension does not
include or download Rootform.

## Get started

1. [Install Rootform](https://docs.rootform.dev/installation/) and check that
   `rootform version` works.
2. In Zed, open **Extensions**, search for **Rootform** and install it.
3. Open a `.rf.hcl` file.

The extension finds `rootform` on the worktree `PATH` and starts it with the
`lsp` argument. If Rootform is installed elsewhere, set both the path and the
arguments in Zed's settings:

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

With `binary.path` set, Zed launches that executable directly and passes
`binary.env` to it. Keep `arguments` set to `["lsp"]`: without it, Rootform
starts without a subcommand.

## Troubleshooting

A missing executable produces a message with the complete setting. After
fixing a launch error or replacing Rootform, run
`editor: restart language server`.

## Learn more

- [Rootform in Zed](https://docs.rootform.dev/integrations/zed/)
- [Edit Rootform source](https://docs.rootform.dev/language/editors/)
- [Report an issue](https://github.com/rootform-dev/editors/issues)

## License

The extension source is licensed under [Apache-2.0](LICENSE). The pinned HCL
Tree-sitter grammar and the Rust crates compiled into the extension keep their
own licenses, listed in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
Rootform name and logo: trademark rights reserved, see
[TRADEMARKS.md](https://github.com/rootform-dev/rootform/blob/dev/TRADEMARKS.md).
