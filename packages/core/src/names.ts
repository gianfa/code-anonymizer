import { readFileSync } from "node:fs";

const NAMES_FILE_URL = new URL("../data/names.txt", import.meta.url);

const BLACKLIST = new Set([
  "admin",
  "root",
  "test",
  "user",
  "null",
  "undefined",
  "true",
  "false",
  "api",
  "key",
  "token",
  "email",
  "url",
  "ip"
]);

let cachedNames: Set<string> | null = null;

function stripDiacritics(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function normalizeToken(value: string): string {
  return stripDiacritics(value).toLowerCase().replace(/[^a-z]/g, "");
}

function loadNames(): Set<string> {
  if (cachedNames) return cachedNames;

  const raw = readFileSync(NAMES_FILE_URL, "utf8");
  cachedNames = new Set(
    raw
      .split("\n")
      .map((line) => normalizeToken(line))
      .filter((line) => line.length >= 3 && line.length <= 20)
  );

  return cachedNames;
}

function isCandidateName(rawToken: string): boolean {
  const token = normalizeToken(rawToken);
  if (token.length < 3 || token.length > 20) return false;
  if (BLACKLIST.has(token)) return false;
  return loadNames().has(token);
}

export type NameReplacementResult = {
  text: string;
  replacements: number;
  map: Record<string, string>;
};

export function replaceHumanNamesInText(
  input: string,
  existingMap: Record<string, string> = {}
): NameReplacementResult {
  const map = existingMap;
  let replacements = 0;
  let personCounter =
    Object.values(map).filter((value) => /^PERSON_\d+$/.test(value)).length;

  const text = input.replace(/(?<![A-Za-zÀ-ÿ])[A-ZÀ-Ý][a-zà-ÿ'-]+(?![A-Za-zÀ-ÿ])/g, (match) => {
    if (!isCandidateName(match)) return match;

    const normalized = normalizeToken(match);
    if (!map[normalized]) {
      personCounter += 1;
      map[normalized] = `PERSON_${personCounter}`;
    }

    replacements += 1;
    return map[normalized];
  });

  return { text, replacements, map };
}
