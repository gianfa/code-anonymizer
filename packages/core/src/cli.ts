#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import { anonymize, parseAnonymizations } from "./index";

async function main() {
  const filePath = process.argv[2];
  const anonymizationsPath = process.argv[3] ?? process.env.ANONYMIZE_JSON;

  if (!filePath) {
    process.stderr.write("Usage: anonymize <file> [anonymizations.json]\n");
    process.exit(1);
  }

  const input = await readFile(filePath, "utf8");
  const customAnonymizations = anonymizationsPath
    ? await loadCustomAnonymizations(anonymizationsPath)
    : undefined;
  const result = anonymize(input, { customAnonymizations });

  process.stdout.write(result.code);
  if (!result.code.endsWith("\n")) {
    process.stdout.write("\n");
  }

  process.stderr.write("Findings:\n");
  process.stderr.write(`${formatFindings(result.findings)}\n`);
}

async function loadCustomAnonymizations(path: string) {
  const raw = await readFile(path, "utf8");
  const parsed = JSON.parse(raw) as unknown;

  if (!isRecordOfStrings(parsed)) {
    throw new Error("anonymizations.json must be an object with regex keys and string values.");
  }

  return parseAnonymizations(parsed);
}

function isRecordOfStrings(value: unknown): value is Record<string, string> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  return Object.values(value).every((entry) => typeof entry === "string");
}

function formatFindings(findings: {
  secrets: number;
  emails: number;
  urls: number;
  ips: number;
}) {
  return `{ secrets: ${findings.secrets}, emails: ${findings.emails}, urls: ${findings.urls}, ips: ${findings.ips} }`;
}

main().catch((error: unknown) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exit(1);
});
