import { describe, expect, it } from "vitest";
import { anonymize } from "./index";

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
});
