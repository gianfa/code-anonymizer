# Practical examples: AWS Access Key ID

## Example 1: single key

Input:

```ts
const key = "AKIA1234567890ABCDEF"; // gitleaks:allow
```

Output:

```ts
const key = "SECRET_1";
```

## Example 2: two different keys

Input:

```ts
const first = "AKIA1111111111111111";
const second = "AKIA2222222222222222";
```

Output:

```ts
const first = "SECRET_1";
const second = "SECRET_2";
```
