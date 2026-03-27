# Custom Patterns

Common regex patterns you can use to anonymize sensitive data.

Each example shows a useful rule and what it transforms.

---

## 🔑 API Tokens

```json
{
  "/token_[a-zA-Z0-9]+/g": "TOKEN"
}
```

Example:  
`token_abC123XYZ` → `TOKEN`

---

## 👤 User IDs

```json
{
  "/user_[0-9]+/g": "user_XXX"
}
```

Example:  
`user_12345` → `user_XXX`

---

## 🏢 Internal Domains

```json
{
  "/https:\\/\\/.*\\.internal/g": "https://example.com"
}
```

Example:  
`https://payments.internal` → `https://example.com`

---

## 📧 Custom Emails (strict domains)

```json
{
  "/[a-zA-Z0-9._%+-]+@company\\.com/g": "user@company.com"
}
```

Example:  
`john@company.com` → `user@company.com`

---

## 🧪 Generic secrets (long strings)

```json
{
  "/[A-Za-z0-9]{32,}/g": "SECRET"
}
```

Example:  
`a8F3kLm9PqR2sT4uV6wX8yZ0a1B2c3D4` → `SECRET`

---

## 🧰 Tips

- Start specific → avoid false positives
- Prefer scoped patterns (e.g. `company.com`)
- Test on real code snippets
- Combine multiple rules for best results
