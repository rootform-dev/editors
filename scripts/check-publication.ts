#!/usr/bin/env bun
import { execFileSync } from "node:child_process";
import { lstatSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { assertPublicMessage, publicationIssues } from "./publication-safety.ts";

export function trackedPublicationIssues(
  directory: string,
  revision?: string,
): Array<{ path: string; rule: string; line: number }> {
  const git = (args: string[]) => execFileSync("git", args, { cwd: directory });
  const names = git(
    revision && revision !== ":"
      ? ["ls-tree", "-r", "--name-only", "-z", revision]
      : ["ls-files", "-z"],
  )
    .toString()
    .split("\0")
    .filter(Boolean);
  return names.flatMap((path) => {
    const full = join(directory, path);
    let body: Buffer;
    if (revision) body = git(["show", `${revision === ":" ? "" : revision}:${path}`]);
    else {
      try {
        const stat = lstatSync(full);
        if (stat.isSymbolicLink()) return [{ path, rule: "symlink", line: 1 }];
        body = readFileSync(full);
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
        throw error;
      }
    }
    // Binary metadata is included; a tracked path is never skipped because it is ignored.
    return publicationIssues(body.toString("utf8")).map((issue) => ({ path, ...issue }));
  });
}

export function checkPublication(args: string[]): void {
  const option = (name: string) => {
    const index = args.indexOf(name);
    return index < 0 ? undefined : args[index + 1];
  };
  const directory = resolve(option("--repo") ?? process.cwd());
  const git = (args: string[]) => execFileSync("git", args, { cwd: directory }).toString();
  const message = option("--message-file");
  if (message) assertPublicMessage(readFileSync(message, "utf8"));
  if (args.includes("--metadata-env"))
    assertPublicMessage([process.env.PUBLIC_TITLE ?? "", process.env.PUBLIC_BODY ?? ""]);
  const issues = message
    ? []
    : trackedPublicationIssues(directory, args.includes("--staged") ? ":" : undefined);
  const range = option("--range");
  if (range) {
    for (const commit of git(["rev-list", range]).trim().split("\n").filter(Boolean)) {
      assertPublicMessage(git(["show", "-s", "--format=%B", commit]));
      issues.push(...trackedPublicationIssues(directory, commit));
    }
  }
  const issue = issues[0];
  if (issue) {
    // A malicious filename can itself contain sensitive text.
    const location = publicationIssues(issue.path).length ? "tracked file" : issue.path;
    throw new Error(`Publication refused: ${issue.rule} (${location}:${issue.line})`);
  }
}

if (import.meta.main) checkPublication(process.argv.slice(2));
