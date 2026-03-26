export type Findings = {
  secrets: number;
  emails: number;
  urls: number;
  ips: number;
};

export type AnonymizeResult = {
  code: string;
  findings: Findings;
  map: Record<string, string>;
};

const EMAIL_REGEX = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
const URL_REGEX = /\bhttps?:\/\/[^\s"']+/gi;
const IP_REGEX = /\b\d{1,3}(?:\.\d{1,3}){3}\b/g;
const AWS_KEY_REGEX = /\bAKIA[0-9A-Z]{16}\b/g;

export function anonymize(input: string): AnonymizeResult {
  let code = input;
  const map: Record<string, string> = {};
  let secretCount = 0;
  let emailCount = 0;
  let urlCount = 0;
  let ipCount = 0;

  code = code.replace(EMAIL_REGEX, (match) => {
    if (!map[match]) {
      emailCount += 1;
      map[match] = "user@email.com";
    }
    return map[match];
  });

  code = code.replace(URL_REGEX, (match) => {
    if (!map[match]) {
      urlCount += 1;
      map[match] = "https://example.com";
    }
    return map[match];
  });

  code = code.replace(IP_REGEX, (match) => {
    if (!map[match]) {
      ipCount += 1;
      map[match] = "0.0.0.0";
    }
    return map[match];
  });

  code = code.replace(AWS_KEY_REGEX, (match) => {
    if (!map[match]) {
      secretCount += 1;
      map[match] = `SECRET_${secretCount}`;
    }
    return map[match];
  });

  return {
    code,
    findings: {
      secrets: secretCount,
      emails: emailCount,
      urls: urlCount,
      ips: ipCount
    },
    map
  };
}