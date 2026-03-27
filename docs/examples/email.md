# Practical examples: Email

## Example 1: single email

Input:
```ts
const owner = "mario.rossi@startup.it";
```

Output:
```ts
const owner = "user@email.com";
```

## Example 2: repeated email (consistent mapping)

Input:
```ts
const a = "team@company.com";
const b = "team@company.com";
```

Output:
```ts
const a = "user@email.com";
const b = "user@email.com";
```
