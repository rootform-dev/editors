import * as vscode from "vscode";
import type {
  ErrorHandler,
  LanguageClientOptions,
  ServerOptions,
} from "vscode-languageclient/node";
import { CloseAction, LanguageClient } from "vscode-languageclient/node";
import {
  INITIALIZE_TIMEOUT_MS,
  MAX_RESTART_COUNT,
  ServerController,
  startupFailureMessage,
} from "./serverController";

let controller: ServerController | undefined;

class RootformLanguageClient extends LanguageClient {
  private initializing = false;
  private initializedSuccessfully = false;

  override async start(): Promise<void> {
    this.initializing = true;
    let timedOut = false;
    const deadline = setTimeout(() => {
      timedOut = true;
      this.serverProcess?.kill("SIGKILL");
    }, INITIALIZE_TIMEOUT_MS);
    try {
      await super.start();
      this.initializedSuccessfully = true;
    } catch (error) {
      if (timedOut) {
        throw Object.assign(new Error("Rootform LSP initialization timed out."), {
          code: "ROOTFORM_LSP_INITIALIZE_TIMEOUT",
        });
      }
      throw error;
    } finally {
      clearTimeout(deadline);
      this.initializing = false;
    }
  }

  override error(
    message: string,
    data?: unknown,
    showNotification: boolean | "force" = true,
  ): void {
    // The controller presents startup failures once, with the setting remediation.
    // Keep SDK logging and notifications for failures after startup.
    super.error(message, data, this.initializing ? false : showNotification);
  }

  override createDefaultErrorHandler(maxRestartCount?: number): ErrorHandler {
    const handler = super.createDefaultErrorHandler(maxRestartCount);
    return {
      error: (error, message, count) => handler.error(error, message, count),
      closed: () =>
        this.initializedSuccessfully
          ? handler.closed()
          : { action: CloseAction.DoNotRestart, handled: true },
    };
  }
}

export function activate(context: vscode.ExtensionContext): void {
  const output = vscode.window.createOutputChannel("Rootform", { log: true });
  context.subscriptions.push(output);

  const watchers = [
    "**/*.rf.hcl",
    "**/*.rf.json",
    "**/rootform.lock",
    "**/.terraform.lock.hcl",
  ].map((pattern) => vscode.workspace.createFileSystemWatcher(pattern));
  context.subscriptions.push(...watchers);

  const host = {
    isTrusted: () => vscode.workspace.isTrusted,
    executablePath: () =>
      vscode.workspace.getConfiguration("rootform").get<string>("server.path", "rootform"),
    createClient: (executablePath: string) => {
      const serverOptions: ServerOptions = {
        command: executablePath,
        args: ["lsp"],
        options: {
          cwd: context.extensionPath,
          shell: false,
        },
      };
      const clientOptions: LanguageClientOptions = {
        documentSelector: [
          { scheme: "file", language: "rootform" },
          { scheme: "file", pattern: "**/*.rf.json" },
        ],
        synchronize: { fileEvents: watchers },
        outputChannel: output,
        connectionOptions: { maxRestartCount: MAX_RESTART_COUNT },
        initializationFailedHandler: () => false,
      };

      // Leave transport unset. Rootform accepts `lsp` without a `--stdio` flag.
      return new RootformLanguageClient("rootform", "Rootform", serverOptions, clientOptions);
    },
    reportStartupFailure: (executablePath: string, error: unknown) => {
      const message = startupFailureMessage(executablePath, error);
      output.error(message);
      output.error(error instanceof Error ? (error.stack ?? error.message) : String(error));
      void vscode.window.showErrorMessage(message, "Open Setting").then((choice) => {
        if (choice === "Open Setting") {
          void vscode.commands.executeCommand(
            "workbench.action.openSettings",
            "rootform.server.path",
          );
        }
      });
    },
    reportStopFailure: (error: unknown) => {
      output.error("Rootform language server shutdown failed.");
      output.error(error instanceof Error ? (error.stack ?? error.message) : String(error));
    },
  };

  controller = new ServerController(host);
  const activeController = controller;

  context.subscriptions.push(
    vscode.workspace.onDidGrantWorkspaceTrust(() => {
      void activeController.start();
    }),
    vscode.workspace.onDidChangeConfiguration((event) => {
      if (event.affectsConfiguration("rootform.server.path")) {
        void activeController.restart();
      }
    }),
    vscode.commands.registerCommand("rootform.restartLanguageServer", () =>
      activeController.restart(),
    ),
  );

  if (vscode.workspace.isTrusted) void activeController.start();
}

export async function deactivate(): Promise<void> {
  const activeController = controller;
  controller = undefined;
  if (activeController) await activeController.dispose();
}
