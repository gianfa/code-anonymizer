#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import { anonymize } from "./index";

async function main() {
  const filePath = process.argv[2];

  if (!filePath) {
    process.stderr.write("Usage: anonymize <file>\n");
    process.exit(1);
  }

  const input = await readFile(filePath, "utf8");
  const result = anonymize(input);

  process.stdout.write(result.code);
  if (!result.code.endsWith("\n")) {
    process.stdout.write("\n");
  }

  process.stderr.write("Findings:\n");
  process.stderr.write(`${formatFindings(result.findings)}\n`);
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
