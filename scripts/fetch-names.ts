#!/usr/bin/env tsx

import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const OUTPUT_DIR = "packages/core/data";
const OUTPUT_FILE = "names.txt";

const SOURCES = [
  {
    name: "english-first-names",
    url: "https://raw.githubusercontent.com/dominictarr/random-name/master/first-names.txt"
  },
  {
    name: "italian-first-names",
    url: "https://gist.githubusercontent.com/pdesterlich/2562329/raw/nomi_italiani.txt"
  }
];

function stripDiacritics(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function normalizeLine(input: string): string | null {
  const firstField = input.split(",")[0]?.trim() ?? "";
  if (!firstField) return null;

  const normalized = stripDiacritics(firstField)
    .toLowerCase()
    .replace(/[^a-z]/g, "");

  if (normalized.length < 3 || normalized.length > 20) return null;
  return normalized;
}

async function fetchText(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} for ${url}`);
  }
  return await res.text();
}

async function main() {
  const allNames: string[] = [];
  const failures: string[] = [];

  console.log("Fetching name datasets...");

  for (const source of SOURCES) {
    try {
      console.log(`-> ${source.name}: ${source.url}`);
      const text = await fetchText(source.url);

      const names = text
        .split("\n")
        .map((line) => normalizeLine(line))
        .filter((x): x is string => Boolean(x));

      console.log(`   loaded ${names.length} normalized names`);
      allNames.push(...names);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      failures.push(`${source.name}: ${message}`);
      console.warn(`   failed: ${message}`);
    }
  }

  const unique = Array.from(new Set(allNames)).sort();

  if (unique.length === 0) {
    throw new Error("No names fetched from any source");
  }

  mkdirSync(OUTPUT_DIR, { recursive: true });

  const outPath = join(OUTPUT_DIR, OUTPUT_FILE);
  writeFileSync(outPath, unique.join("\n") + "\n", "utf8");

  console.log(`Saved ${unique.length} names to ${outPath}`);

  if (failures.length > 0) {
    console.warn("\nSome sources failed:");
    for (const failure of failures) {
      console.warn(`- ${failure}`);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});