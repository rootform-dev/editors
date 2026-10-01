# Third-party notices for the VS Code extension

The pinned `vscode-languageclient` 10.1.2 includes the repository's
[startup lifecycle patch](https://github.com/rootform-dev/editors/blob/dev/patches/vscode-languageclient%4010.1.2.patch).
It keeps the original startup promise after an early transport close and
handles cleanup of failed initialization. Upstream license text is unchanged.

The Rootform VS Code extension's own source is licensed under Apache-2.0; see
[`LICENSE`](LICENSE). The bundled `dist/extension.js` also contains the npm
runtime packages listed below. Package versions and SHA-512 integrity values
are recorded in the repository's `bun.lock`. Upstream repositories and
subdirectories come from each package's metadata. Each linked license file is a
verbatim copy of that package's distributed license file.

Build and packaging dependencies are excluded. The list covers the packages
present in the Bun bundle, including transitive runtime dependencies.

- **balanced-match@4.0.4**, MIT. Upstream:
  [juliangruber/balanced-match](https://github.com/juliangruber/balanced-match).
  License copied from `LICENSE.md` to
  [`licenses/balanced-match-4.0.4-LICENSE.md`](licenses/balanced-match-4.0.4-LICENSE.md).
  Lock integrity: `sha512-BLrgEcRTwX2o6gGxGOCNyMvGSp35YofuYzw9h1IMTRmKqttAZZVU67bdb9Pr2vUHA8+j3i2tJfjO6C6+4myGTA==`.
- **brace-expansion@5.0.12**, MIT. Upstream:
  [juliangruber/brace-expansion](https://github.com/juliangruber/brace-expansion).
  License copied from `LICENSE` to
  [`licenses/brace-expansion-5.0.12-LICENSE`](licenses/brace-expansion-5.0.12-LICENSE).
  Lock integrity: `sha512-YovQ3rzhaLMIrDjNDMkNS01tea93qhEhG5xy8f6+R0l+dw3Ki+5sCoIoI942iuLZTHWogWktgwVDhU09iNEimQ==`.
- **minimatch@10.2.6**, Blue Oak Model License 1.0.0
  (`BlueOak-1.0.0`). Upstream:
  [isaacs/minimatch](https://github.com/isaacs/minimatch). License copied from
  `LICENSE.md` to
  [`licenses/minimatch-10.2.6-LICENSE.md`](licenses/minimatch-10.2.6-LICENSE.md).
  Lock integrity: `sha512-vpLQEs+VLCr1nU0BXS07maYoFwlDAH0gngQuuttxIwutDFEMHq2blX+8vpgxDdK3J1PwjCJiep77OitTZ4Ll1A==`.
- **semver@7.8.5**, ISC. Upstream:
  [npm/node-semver](https://github.com/npm/node-semver). License copied from
  `LICENSE` to [`licenses/semver-7.8.5-LICENSE`](licenses/semver-7.8.5-LICENSE).
  Lock integrity: `sha512-Y7/KDsb8LjooZpwaqGyulO6DQlksgCncchHGk+sZIY4SBvUocMBEFH5Ur1fI4dV+Jvl0w6cjvucaIi40puRioA==`.
- **vscode-jsonrpc@9.0.3**, MIT. Upstream:
  [Microsoft/vscode-languageserver-node, `jsonrpc`](https://github.com/microsoft/vscode-languageserver-node/tree/main/jsonrpc).
  License copied from `License.txt` to
  [`licenses/vscode-jsonrpc-9.0.3-LICENSE.txt`](licenses/vscode-jsonrpc-9.0.3-LICENSE.txt).
  Lock integrity: `sha512-qETYf9PCl1lVfwR+oBmMfc4vP2nqLNA35ABxorw3j06+xlKRgDVxbLgKm4Y/xPL0YWdeDjLoI4ImICIT3nB0zQ==`.
- **vscode-languageclient@10.1.2**, MIT. Upstream:
  [Microsoft/vscode-languageserver-node, `client`](https://github.com/microsoft/vscode-languageserver-node/tree/main/client).
  License copied from `License.txt` to
  [`licenses/vscode-languageclient-10.1.2-LICENSE.txt`](licenses/vscode-languageclient-10.1.2-LICENSE.txt).
  Lock integrity: `sha512-cOv5SMvtAhfVeo5m2r9L2rVHAD0J5CFOsmvH1WgNmPaI61VYjJNc3XUDLOKeFSDtWoAXIEoK6KetuBEL/3hErg==`.
- **vscode-languageserver-protocol@3.18.4**, MIT. Upstream:
  [Microsoft/vscode-languageserver-node, `protocol`](https://github.com/microsoft/vscode-languageserver-node/tree/main/protocol).
  License copied from `License.txt` to
  [`licenses/vscode-languageserver-protocol-3.18.4-LICENSE.txt`](licenses/vscode-languageserver-protocol-3.18.4-LICENSE.txt).
  Lock integrity: `sha512-CCXbyr99dafRJzJH/0Ryk7ly5T8XPmSR0//OuF2w4m+9JiOin7zcAT5iET8GRE7Z9taFBejb3GbM0a0mbjdbrg==`.
- **vscode-languageserver-textdocument@1.0.15**, MIT. Upstream:
  [Microsoft/vscode-languageserver-node, `textDocument`](https://github.com/microsoft/vscode-languageserver-node/tree/main/textDocument).
  License copied from `License.txt` to
  [`licenses/vscode-languageserver-textdocument-1.0.15-LICENSE.txt`](licenses/vscode-languageserver-textdocument-1.0.15-LICENSE.txt).
  Lock integrity: `sha512-Gsfr9S8LU3S6885cS+NaleasJ0n3V5y/SOTqHCifQiXWFw3G9w9/YItDfwHrlCz+dSZWWZ8ilYVMcJe7Sz7Sxw==`.
- **vscode-languageserver-types@3.18.4**, MIT. Upstream:
  [Microsoft/vscode-languageserver-node, `types`](https://github.com/microsoft/vscode-languageserver-node/tree/main/types).
  License copied from `License.txt` to
  [`licenses/vscode-languageserver-types-3.18.4-LICENSE.txt`](licenses/vscode-languageserver-types-3.18.4-LICENSE.txt).
  Lock integrity: `sha512-nQsacoiijvl0fRf2q28uFDrAVwRhdCa3QveiF7/CX0r18mLR5FU/1WskSsCKOjmEbtteKUnY8x8Yzxop+k0zwg==`.
