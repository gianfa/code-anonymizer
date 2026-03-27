# RedActor

A lightweight TypeScript library to quickly anonymize sensitive data in code snippets or logs.

It currently replaces:
- emails
- URLs
- IPv4 addresses
- AWS Access Key IDs (`AKIA...`)

## Installation

### Monorepo (local development)
```bash
pnpm install
pnpm build
```

### Install core package
```bash
pnpm add @code-anonymizer/core
```

## Quick usage

```ts
import { anonymize } from "@code-anonymizer/core";

const input = `
const email = "dev@company.com";
const api = "https://intranet.local";
const ip = "10.0.0.12";
const aws = "AKIA1234567890ABCDEF";
`;

const result = anonymize(input);

console.log(result.code);
console.log(result.findings);
console.log(result.map);
```

Typical output:

```txt
const email = "user@email.com";
const api = "https://example.com";
const ip = "0.0.0.0";
const aws = "SECRET_1";
```

## CLI

After building the core package:

```bash
pnpm --filter @code-anonymizer/core build
node packages/core/dist/cli.js ./input.txt
```

Anonymized code is printed to `stdout`, while the findings summary is printed to `stderr`.

### Custom anonymizations from JSON

You can pass a JSON file that maps JavaScript regex literals (as keys) to replacements (as values):

```json
{
  "/\\b\\w*identity\\w*-\\d{3}\\b/g": "my-identity"
}
```

Use either:

```bash
node packages/core/dist/cli.js ./input.txt ./anonymizations.json
```

or:

```bash
ANONYMIZE_JSON=./anonymizations.json node packages/core/dist/cli.js ./input.txt
```

## Practical examples

See [`docs/examples`](./docs/examples):
- [Email](./docs/examples/email.md)
- [URL](./docs/examples/url.md)
- [IP](./docs/examples/ip.md)
- [AWS Keys](./docs/examples/aws-keys.md)
- [CLI](./docs/examples/cli.md)
