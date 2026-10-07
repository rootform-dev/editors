# Rootform editor integration contract

This public repository owns thin VS Code and Zed clients for `rootform lsp`.
Read `docs/editor-contract.md` and the affected editor package before editing.

- Parser, resolver, diagnostics and formatter belong to Rootform. Editors only
  provide syntax presentation, process lifecycle and LSP transport.
- Never embed a Rootform executable, compiler, provider, acquisition mechanism,
  telemetry or automatic server download. Select a configured local executable
  or `rootform` from PATH. Launch `lsp` directly, without a shell.
- Keep VS Code and Zed packages independent. Zed must package from `zed/` with
  its own license and pinned grammar. No shared semantic implementation.
- Use Bun 1.4.0 as the sole JavaScript package manager, exact direct pins and
  `bun.lock`. Use locked Cargo dependencies. Pin Actions by full commit SHA.
- Keep settings minimal, honor editor trust and stop/restart processes cleanly.
  Never launch a workspace-selected executable before the editor trusts it.
- Never promise an editor/platform capability without concrete evidence. Real
  binary integration tests supplement client tests and native application smoke.
- Source is Apache-2.0. Retain third-party licenses and exact provenance.
- Middle dots are forbidden as decorative UI/text separators. Use clear labels
  and ordinary punctuation.
- Run `bun run verify`; integration qualification also needs `ROOTFORM_BINARY`
  pointing to an explicitly provided compatible local executable. No test may
  download Rootform or trigger Terraform/provider/cloud execution.
- Work on a branch and open a PR into `dev`. Never push directly to `main` or
  `dev`, force push, bypass checks or modify another task's branch/PR.
- `main` moves only by promotion: a PR from `dev` into `main` whose head
  passed `verify`, fast-forwarded by `promote.yml`. Release tags name a
  `main` commit; `docs/releasing.md` describes the release.

Local development evidence stays outside the public repository. Do not commit
private implementation, project paths, inputs, credentials or operator notes.
