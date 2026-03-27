# @gianfa/redactor-core

<img src="https://github.com/gianfa/code-anonymizer/blob/develop/assets/logo/logo-1.png?raw=true" width='600px'>

Ship logs, snippets, and demos fast — **without leaking real data**.

`@gianfa/redactor-core` anonymizes sensitive text in one call.

## What it masks out of the box

- Emails → `user@email.com`
- URLs → `https://example.com`
- IPv4 addresses → `0.0.0.0`
- AWS Access Key IDs → `SECRET_1`, `SECRET_2`, ...
- Common human names → `PERSON_1`, `PERSON_2`, ...

## Install

```bash
npm i @gianfa/redactor-core
```

## 15-second quickstart

```ts
import { anonymize } from "@gianfa/redactor-core";

const input = `
const owner = "Marco";
const email = "marco@startup.it";
const key = "AKIA1234567890ABCDEF";
`;

const { code, findings } = anonymize(input);

console.log(code);
console.log(findings);
```

## Return value

`anonymize(input, options)` returns:

- `code`: anonymized text
- `findings`: counters by type (`secrets`, `emails`, `urls`, `ips`, `names`)
- `map`: deterministic `original -> replacement`
- `spans`: replaced ranges (`start`, `end`, `kind`, `original`, `replacement`)

## Options

All detectors are enabled by default.

```ts
import { anonymize } from "@gianfa/redactor-core";

const result = anonymize("Marco uses marco@startup.it", {
  enableNames: false,
  enableEmails: true,
  enableUrls: false,
  enableIps: false,
  enableSecrets: false,
});
```

Available flags:

- `enableEmails`
- `enableUrls`
- `enableIps`
- `enableSecrets`
- `enableNames`
- `customAnonymizations`

## Custom rules (regex)

Need project-specific masking? Add your own rules.

```ts
import { anonymize, parseAnonymizations } from "@gianfa/redactor-core";

const customAnonymizations = parseAnonymizations({
  "/\\b\\w*identity\\w*-\\d{3}\\b/g": "my-identity",
});

const result = anonymize('const id = "customer-identity-123";', {
  customAnonymizations,
});
```

Regex keys must use `/pattern/flags` format.

## CLI

This package also ships a CLI command: `redactor`.

```bash
npx @gianfa/redactor-core ./sample.txt
```

With custom rules file:

```bash
npx @gianfa/redactor-core ./sample.txt ./anonymizations.json
```

Or with env var:

```bash
ANONYMIZE_JSON=./anonymizations.json npx @gianfa/redactor-core ./sample.txt
```

`anonymizations.json` example:

```json
{
  "/user_[0-9]+/g": "user_XXX"
}
```

## Why devs like it

- No setup ceremony
- Predictable replacements
- Easy to plug into tooling, CI, demos, and bug reports
- Safer sharing, faster collaboration

If your team shares code in tickets, chats, or AI tools, this is a tiny dependency with big upside.
