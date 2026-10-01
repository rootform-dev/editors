export const MAX_RESTART_COUNT = 4;
export const INITIALIZE_TIMEOUT_MS = 10_000;

export interface LanguageServerClient {
  start(): Promise<void>;
  dispose(): Promise<void>;
}

export interface ServerControllerHost {
  isTrusted(): boolean;
  executablePath(): string;
  createClient(executablePath: string): LanguageServerClient;
  reportStartupFailure(executablePath: string, error: unknown): void;
  reportStopFailure(error: unknown): void;
}

export class ServerController {
  private currentClient: LanguageServerClient | undefined;
  private queue: Promise<void> = Promise.resolve();
  private disposed = false;

  constructor(private readonly host: ServerControllerHost) {}

  start(): Promise<void> {
    return this.enqueue(async () => {
      if (!this.host.isTrusted()) {
        await this.stopCurrentClient();
        return;
      }
      await this.startIfNeeded();
    });
  }

  restart(): Promise<void> {
    return this.enqueue(async () => {
      if (this.disposed) return;
      await this.stopCurrentClient();
      if (this.host.isTrusted()) await this.startIfNeeded();
    });
  }

  dispose(): Promise<void> {
    return this.enqueue(async () => {
      this.disposed = true;
      await this.stopCurrentClient();
    });
  }

  private enqueue(operation: () => Promise<void>): Promise<void> {
    const result = this.queue.then(operation, operation);
    this.queue = result.catch(() => undefined);
    return result;
  }

  private async startIfNeeded(): Promise<void> {
    if (this.disposed || this.currentClient) return;

    const executablePath = this.host.executablePath().trim();
    if (!executablePath) {
      this.host.reportStartupFailure(executablePath, new Error("The executable path is empty."));
      return;
    }

    let client: LanguageServerClient;
    try {
      client = this.host.createClient(executablePath);
    } catch (error) {
      this.host.reportStartupFailure(executablePath, error);
      return;
    }

    this.currentClient = client;
    try {
      await client.start();
    } catch (error) {
      if (this.currentClient === client) this.currentClient = undefined;
      try {
        await client.dispose();
      } catch (stopError) {
        this.host.reportStopFailure(stopError);
      }
      this.host.reportStartupFailure(executablePath, error);
    }
  }

  private async stopCurrentClient(): Promise<void> {
    const client = this.currentClient;
    this.currentClient = undefined;
    if (!client) return;

    try {
      await client.dispose();
    } catch (error) {
      this.host.reportStopFailure(error);
    }
  }
}

export function startupFailureMessage(executablePath: string, error: unknown): string {
  if (!executablePath) {
    return 'Rootform executable path is empty. Set "rootform.server.path" to a local Rootform executable or the command rootform.';
  }

  const code = errorCode(error);
  if (code === "ROOTFORM_LSP_INITIALIZE_TIMEOUT") {
    return `Rootform language server did not initialize within ${INITIALIZE_TIMEOUT_MS / 1000} seconds from "${executablePath}". Confirm it supports "rootform lsp" or change "rootform.server.path".`;
  }
  if (code === "ENOENT") {
    return `Rootform executable "${executablePath}" was not found. Install Rootform or set "rootform.server.path" to a local executable.`;
  }
  if (code === "EACCES" || code === "EPERM") {
    return `Rootform executable "${executablePath}" could not be run. Check its permissions or change "rootform.server.path".`;
  }

  return `Rootform language server could not initialize from "${executablePath}". Confirm it supports "rootform lsp", then inspect the Rootform output channel.`;
}

function errorCode(error: unknown): string | undefined {
  // vscode-languageclient 10.1.2 serializes failed spawn errors in this form.
  // Do not classify arbitrary initialization text as an operating-system error.
  if (typeof error === "string") {
    return /^Launching server using command .+ failed\. Error: spawn .+ (ENOENT|EACCES|EPERM)$/s.exec(
      error,
    )?.[1];
  }
  if (typeof error !== "object" || error === null || !("code" in error)) return undefined;
  const code = error.code;
  return typeof code === "string" ? code : undefined;
}
