import { describe, expect, it } from "vitest";
import { anonymize, parseAnonymizations } from "./index";

describe("anonymize", () => {
  it("replaces email", () => {
    const input = 'const email = "marco@startup.it";';
    const result = anonymize(input);

    expect(result.code).toContain("user@email.com");
    expect(result.findings.emails).toBe(1);
  });

  it("replaces AWS key", () => {
    const input = 'const key = "AKIA1234567890ABCDEF";';
    const result = anonymize(input);

    expect(result.code).toContain("SECRET_1");
    expect(result.findings.secrets).toBe(1);
  });

  it("replaces URL and IP", () => {
    const input = `
      const url = "https://internal.api";
      const ip = "192.168.1.1";
    `;

    const result = anonymize(input);

    expect(result.code).toContain("https://example.com");
    expect(result.code).toContain("0.0.0.0");
    expect(result.findings.urls).toBe(1);
    expect(result.findings.ips).toBe(1);
  });

  it("keeps consistent mapping", () => {
    const input = `
      const a = "marco@startup.it";
      const b = "marco@startup.it";
    `;

    const result = anonymize(input);

    const matches = result.code.match(/user@email\.com/g) || [];
    expect(matches.length).toBe(2);
  });

  it("applies custom anonymizations from regex map", () => {
    const input = 'const id = "customer-identity-123";';
    const customAnonymizations = parseAnonymizations({
      "/\\b\\w*identity\\w*-\\d{3}\\b/g": "my-identity"
    });

    const result = anonymize(input, { customAnonymizations });

    expect(result.code).toContain("my-identity");
    expect(Object.values(result.map)).toContain("my-identity");
  });
});

it("replaces human names", () => {
  const input = `const author = "Marco and Giulia";`;
  const result = anonymize(input);

  expect(result.code).toContain("PERSON_1");
  expect(result.code).toContain("PERSON_2");
  expect(result.findings.names).toBe(2);
});

it("keeps human name mapping consistent", () => {
  const input = `"Marco" + "Marco"`;
  const result = anonymize(input);

  const matches = result.code.match(/PERSON_1/g) || [];
  expect(matches.length).toBe(2);
});
