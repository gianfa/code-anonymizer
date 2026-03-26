import { replaceHumanNamesInText } from "./names";

export type Findings = {
  secrets: number;
  emails: number;
  urls: number;
  ips: number;
  names: number;
};

export type CustomAnonymization = {
  pattern: RegExp;
  replacement: string;
};

export type AnonymizeOptions = {
  enableEmails?: boolean;
  enableUrls?: boolean;
  enableIps?: boolean;
  enableSecrets?: boolean;
  enableNames?: boolean;
  customAnonymizations?: CustomAnonymization[];
};

export type AnonymizedSpan = {
  start: number;
  end: number;
  kind: string;
  original: string;
  replacement: string;
};

export type AnonymizeResult = {
  code: string;
  findings: Findings;
  map: Record<string, string>;
  spans: AnonymizedSpan[];
};

type PendingReplacement = {
  start: number;
  end: number;
  kind: string;
  original: string;
  replacement: string;
};

const EMAIL_REGEX = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
const URL_REGEX = /\bhttps?:\/\/[^\s"']+/gi;
const IP_REGEX = /\b\d{1,3}(?:\.\d{1,3}){3}\b/g;
const AWS_KEY_REGEX = /\bAKIA[0-9A-Z]{16}\b/g;

export function anonymize(input: string, options: AnonymizeOptions = {}): AnonymizeResult {
  const map: Record<string, string> = {};
  const enableEmails = options.enableEmails ?? true;
  const enableUrls = options.enableUrls ?? true;
  const enableIps = options.enableIps ?? true;
  const enableSecrets = options.enableSecrets ?? true;
  const enableNames = options.enableNames ?? true;

  let secretCount = 0;
  let emailCount = 0;
  let urlCount = 0;
  let ipCount = 0;
  let nameCount = 0;

  const pending: PendingReplacement[] = [];

  for (const { pattern, replacement } of options.customAnonymizations ?? []) {
    collectReplacements(input, ensureGlobal(pattern), "custom", (match) => {
      if (!map[match]) {
        map[match] = replacement;
      }
      return map[match];
    }, pending);
  }

  if (enableEmails) {
    collectReplacements(input, EMAIL_REGEX, "emails", (match) => {
      if (!map[match]) {
        emailCount += 1;
        map[match] = "user@email.com";
      }
      return map[match];
    }, pending);
  }

  if (enableUrls) {
    collectReplacements(input, URL_REGEX, "urls", (match) => {
      if (!map[match]) {
        urlCount += 1;
        map[match] = "https://example.com";
      }
      return map[match];
    }, pending);
  }

  if (enableIps) {
    collectReplacements(input, IP_REGEX, "ips", (match) => {
      if (!map[match]) {
        ipCount += 1;
        map[match] = "0.0.0.0";
      }
      return map[match];
    }, pending);
  }

  if (enableSecrets) {
    collectReplacements(input, AWS_KEY_REGEX, "secrets", (match) => {
      if (!map[match]) {
        secretCount += 1;
        map[match] = `SECRET_${secretCount}`;
      }
      return map[match];
    }, pending);
  }

  const { code: partiallyAnonymizedCode, spans } = renderReplacements(input, pending);

  let code = partiallyAnonymizedCode;

  if (enableNames) {
    const nameResult = replaceHumanNamesInText(code, map);
    code = nameResult.text;
    nameCount = nameResult.replacements;
  }

  return {
    code,
    findings: {
      secrets: secretCount,
      emails: emailCount,
      urls: urlCount,
      ips: ipCount,
      names: nameCount
    },
    map,
    spans
  };
}

function collectReplacements(
  input: string,
  regex: RegExp,
  kind: string,
  getReplacement: (match: string) => string,
  pending: PendingReplacement[]
): void {
  const pattern = ensureGlobal(regex);
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(input)) !== null) {
    const original = match[0];
    const start = match.index;
    const end = start + original.length;
    const replacement = getReplacement(original);

    pending.push({
      start,
      end,
      kind,
      original,
      replacement
    });

    if (original.length === 0) {
      pattern.lastIndex += 1;
    }
  }
}

function renderReplacements(
  input: string,
  replacements: PendingReplacement[]
): { code: string; spans: AnonymizedSpan[] } {
  const sorted = [...replacements].sort((a, b) => {
    if (a.start !== b.start) {
      return a.start - b.start;
    }

    return b.end - a.end;
  });

  const filtered: PendingReplacement[] = [];
  let lastEnd = -1;

  for (const item of sorted) {
    if (item.start >= lastEnd) {
      filtered.push(item);
      lastEnd = item.end;
    }
  }

  let code = "";
  let cursor = 0;
  const spans: AnonymizedSpan[] = [];

  for (const item of filtered) {
    code += input.slice(cursor, item.start);

    const start = code.length;
    code += item.replacement;
    const end = code.length;

    spans.push({
      start,
      end,
      kind: item.kind,
      original: item.original,
      replacement: item.replacement
    });

    cursor = item.end;
  }

  code += input.slice(cursor);

  return { code, spans };
}

function ensureGlobal(regex: RegExp): RegExp {
  const flags = regex.flags.includes("g") ? regex.flags : `${regex.flags}g`;
  return new RegExp(regex.source, flags);
}

export function parseAnonymizations(raw: Record<string, string>): CustomAnonymization[] {
  return Object.entries(raw).map(([pattern, replacement]) => ({
    pattern: parseRegexLiteral(pattern),
    replacement
  }));
}

function parseRegexLiteral(input: string): RegExp {
  if (!input.startsWith("/")) {
    throw new Error(`Invalid regex key "${input}". Expected format /pattern/flags.`);
  }

  const closingSlashIndex = input.lastIndexOf("/");
  if (closingSlashIndex <= 0) {
    throw new Error(`Invalid regex key "${input}". Expected format /pattern/flags.`);
  }

  const source = input.slice(1, closingSlashIndex);
  const flags = input.slice(closingSlashIndex + 1);
  return new RegExp(source, flags);
}