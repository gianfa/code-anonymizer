# Examples

Quick, real-world examples of how RedActor anonymizes sensitive data.

Each file shows:

- input
- output
- what gets detected

## Available examples

- **email.md** → anonymizing emails
- **url.md** → masking URLs
- **ip.md** → replacing IP addresses
- **aws-keys.md** → detecting AWS keys
- **cli.md** → using the CLI
- **custom-patterns.md** → custom regex pattern

## What to expect

RedActor replaces sensitive values with safe placeholders:

- emails → `user@email.com`
- URLs → `https://example.com`
- IPs → `0.0.0.0`
- secrets → `SECRET_X`

## Custom patterns

You can define your own rules using regex.

Example:

```json
{
  "/user_[0-9]+/g": "user_XXX"
}
```

👉 Start with any example and adapt it to your use case.
