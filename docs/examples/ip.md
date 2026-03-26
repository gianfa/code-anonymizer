# Practical examples: IPv4

## Example 1: IP in config

Input:
```ts
const host = "192.168.1.44";
```

Output:
```ts
const host = "0.0.0.0";
```

## Example 2: multiple IPs

Input:
```ts
const source = "10.1.2.3";
const target = "172.16.0.9";
```

Output:
```ts
const source = "0.0.0.0";
const target = "0.0.0.0";
```
