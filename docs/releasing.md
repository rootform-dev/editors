# Releasing

Both editors ship one version. `vscode/package.json`, `zed/extension.toml`
and `zed/Cargo.toml` carry the same `major.minor.patch` version, and
`bun run verify` fails when they disagree. The Visual Studio Marketplace
accepts no pre-release suffix, and no store accepts the same version twice.

## Release a version

1. On a branch, set the new version in the three manifests, add an entry to
   `vscode/CHANGELOG.md` and open a pull request into `dev`.
2. After it merges, promote `dev`: open a pull request from `dev` into
   `main`; once `verify` passes on its head, run
   `gh workflow run promote.yml --ref dev -f pull_request=<number>`, which
   fast-forwards `main` to that exact commit.
3. Qualify the `main` commit with the Rootform release it targets:
   `bun run verify`, the VS Code extension-host suite with
   `ROOTFORM_BINARY`, and the Zed package installed as a dev extension.
4. Tag the `main` commit and push the tag:

   ```sh
   git tag -a v0.1.0 -m "Rootform editors 0.1.0" <main-commit>
   git push origin v0.1.0
   ```

5. Update the Zed registry, as described below.
6. Check each store page, then install from each store and open a `.rf.hcl`
   file with a released Rootform CLI.

The [release workflow](../.github/workflows/release.yml) refuses a tag whose
commit is not on `main` or did not pass `verify` in its promotion pull
request. It checks that the tag
matches the manifests, runs `verify`, packages one VSIX and attaches it with
`SHA256SUMS` to the GitHub release. It publishes that same file to Open VSX
and the Visual Studio Marketplace from the `release` environment, which only
version tags can use. A re-run skips a version that a store already has.

## Visual Studio Marketplace

The publisher is `rootform-dev`, displayed as Rootform. Azure DevOps retires
global personal access tokens on 1 December 2026; this repository uses none.

Automated publishing uses Microsoft Entra ID workload identity federation, as
the [publishing guide](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)
recommends:

1. Create a user-assigned managed identity in Azure. An app registration signs
   in but cannot publish.
2. Add a federated credential to it for GitHub Actions: organization
   `rootform-dev`, repository `editors`, entity type Environment, environment
   `release`.
3. Signed in as that identity, read its Azure DevOps profile id once:
   `az rest -u https://app.vssps.visualstudio.com/_apis/profile/profiles/me --resource 499b84ac-1321-427f-aa17-267ca6975798`.
4. Add that id to the `rootform-dev` publisher as a Contributor member.
5. Set the repository variables `AZURE_CLIENT_ID` and `AZURE_TENANT_ID`. The
   `vs-marketplace` job runs once they exist.

Until then, upload the VSIX attached to the GitHub release on the
[publisher management page](https://marketplace.visualstudio.com/manage/publishers/rootform-dev).
When the Marketplace opens trusted publishing (`vsce publish --oidc`), it
replaces the Azure identity.

## Open VSX

The namespace is `rootform-dev`, matching `publisher` exactly.

1. Sign the Eclipse Foundation Publisher Agreement from the open-vsx.org
   profile, using the GitHub account that publishes.
2. Create an access token on the open-vsx.org profile and store it as the
   `OVSX_PAT` secret of the `release` environment. The first release
   creates the `rootform-dev` namespace with it, then publishes.
3. After that first release, check the extension page.
4. Claim namespace ownership with an issue on
   [EclipseFdn/open-vsx.org](https://github.com/EclipseFdn/open-vsx.org/issues/new/choose).
5. Register a trusted publisher for `rootform-dev.rootform`: GitHub Actions,
   organization `rootform-dev`, repository `editors`, workflow
   `release.yml`, environment `release`.
6. Delete the `OVSX_PAT` secret and the token. The `open-vsx` job then
   publishes with its OIDC token.

## Zed extension registry

Zed publishes extensions from
[zed-industries/extensions](https://github.com/zed-industries/extensions).
Its [AI policy](https://github.com/zed-industries/extensions/blob/main/AI_POLICY.md)
expects a person to open the pull request and write its description, so this
step stays manual.

1. Install `zed/` as a dev extension at the tagged commit and test it.
2. In a fork of the registry, add or update the submodule
   `extensions/rootform` with `https://github.com/rootform-dev/editors.git`
   at the tagged commit, which must be on a branch.
3. Set the entry in `extensions.toml`:

   ```toml
   [rootform]
   submodule = "extensions/rootform"
   path = "zed"
   version = "0.1.0"
   ```

4. Run `pnpm sort-extensions`, then open one pull request for this extension.
   Answer review feedback within three weeks.

The registry builds the package with the Rust toolchain set in its CI,
currently 1.90. Keep `zed/rust-toolchain.toml` and `rust-version` at or below
that toolchain.
