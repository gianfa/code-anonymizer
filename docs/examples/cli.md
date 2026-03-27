# Practical examples: CLI

## Example 1: single file

```bash
node packages/core/dist/cli.js ./sample.txt
```

- `stdout`: anonymized content
- `stderr`: `Findings: { secrets: X, emails: Y, urls: Z, ips: W }`

## Example 2: redirect anonymized output

```bash
node packages/core/dist/cli.js ./sample.txt > ./sample.anonymized.txt
```

This saves the anonymized output into a separate file.
