# RedActor

> Anonymize code before sharing or using AI.

<img src="https://github.com/gianfa/code-anonymizer/blob/develop/assets/logo/logo-1.png?raw=true" width='400px'>

Automatically detect and remove sensitive data from your code, logs, and prompts — locally, with zero setup.

## 🚀 Why RedActor

Developers constantly copy/paste code into:

- AI tools (Copilot, ChatGPT)
- GitHub issues / PRs
- StackOverflow / Slack

👉 This often leaks:

- API keys
- internal URLs
- emails
- IPs

**RedActor prevents that — instantly.**

## ⚡ What it does

RedActor automatically anonymizes:

- Emails → `user@email.com`
- URLs → `https://example.com`
- IP addresses → `0.0.0.0`
- AWS keys → `SECRET_1`
- **Your custom patterns → fully configurable**

Runs **fully local**. No data leaves your machine.

## 🧠 Example

### Input

```ts
const email = "dev@company.com";
const api = "https://intranet.local";
const ip = "10.0.0.12";
const aws = "AKIA1234567890ABCDEF";
```

### Output

```ts
const email = "user@email.com";
const api = "https://example.com";
const ip = "0.0.0.0";
const aws = "SECRET_1";
```

## 🔧 Custom patterns (power feature)

Define your own anonymization rules using regex.

### Replace internal IDs

```json
{
  "/user_[0-9]+/g": "user_XXX"
}
```

Example:  
`const id = "user_12345";` → `const id = "user_XXX";`

### Mask company domains

```json
{
  "/https:\\/\\/.*\\.internal/g": "https://example.com"
}
```

Example:  
`const api = "https://payments.internal";` → `const api = "https://example.com";`

### Replace tokens

```json
{
  "/token_[a-zA-Z0-9]+/g": "TOKEN"
}
```

Example:  
`const token = "token_abC123XYZ";` → `const token = "TOKEN";`

👉 Adapt RedActor to your company rules or any custom format.

## 🧩 VSCode Extension

Use RedActor directly in VSCode:

- Command: **Anonymize Code**
- Works instantly on your file
- Opens anonymized version side-by-side

## 📦 Installation

### Monorepo (local dev)

```bash
pnpm install
pnpm build
```

### Core package

```bash
pnpm add @code-anonymizer/core
```

## ⚙️ Usage

```ts
import { anonymize } from "@code-anonymizer/core";

const result = anonymize(code);

console.log(result.code);
console.log(result.findings);
console.log(result.map);
```

## 🖥 CLI

```bash
node packages/core/dist/cli.js ./input.txt
```

- anonymized code → `stdout`
- findings → `stderr`

## 🔧 Use custom rules from JSON

```bash
node packages/core/dist/cli.js ./input.txt ./anonymizations.json
```

or

```bash
ANONYMIZE_JSON=./anonymizations.json node packages/core/dist/cli.js ./input.txt
```

## 🎯 Use cases

- Safe AI usage (no leaks)
- Sharing code publicly
- Cleaning logs before debugging
- Protecting internal data

## 🏢 For teams

Using AI with real code?

You might be leaking sensitive data across your organization.

→ Contact for a team-ready solution (policies, CI integration, custom rules)

## 📚 Examples

See [`docs/examples`](./docs/examples)

## 💡 Keywords (SEO)

anonymize code, remove secrets, redact code, AI privacy, sanitize logs, protect API keys
