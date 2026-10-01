# Editor integration contract

Status: Accepted. Owner: @soulbah. Approved: 2026-10-01.

VS Code and Zed recognize `.rf.hcl` as Rootform and use one existing
`rootform lsp` implementation for diagnostics, completion, hover, definition
and formatting. Rootform owns all semantic interpretation. Syntax highlighting,
comments, brackets, indentation and folding are editor presentation.

Both clients use an explicitly configured local Rootform executable or PATH.
They invoke `rootform lsp` through argument arrays without a shell, installer,
network acquisition or provider execution. Stdio carries only LSP frames.
Missing or incompatible executables produce actionable errors. Restart and
shutdown must not leak child processes.

The server negotiates full document synchronization and UTF-16 positions.
One process may handle multiple workspace folders; folder and source changes
must reach it. Workspace trust guards executable launch. Unsaved files remain
overlays owned by the server. Policy authoring compiles source; it does not
select, acquire, link or evaluate a Policy Pack against infrastructure.

VS Code package lives in `vscode/`; Zed package lives in `zed/`, a self-contained
registry-supported subdirectory. Source license is Apache-2.0. Zed's HCL
Tree-sitter dependency retains its own license. Neither package ships Rootform.

Qualification includes real local-binary requests and native editor journeys,
broken references and syntax, multi-file changes, rapid edits, process death,
missing executable and workspace reopen. Platform claims distinguish native
runtime proof from package/compile checks. Distributed-binary qualification
belongs to release verification, separately from local executable development.
