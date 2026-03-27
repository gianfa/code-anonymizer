# Release PR Notes — Merge `develop` into `main`

## Context
This PR represents the first public npm release baseline for the RedActor monorepo, with `@redactor/core` as the publishable package (`0.1.0`).

## What is included

### 1) Core npm package (`@redactor/core`)
- Typed API for anonymizing code/text before sharing.
- Built-in detectors for:
  - emails
  - URLs
  - IPv4 addresses
  - AWS access key identifiers
  - human names from bundled dataset
- Deterministic replacement map and structured span output for traceability.
- Config flags to enable/disable each anonymization category.
- Custom regex-based anonymization rules for organization-specific patterns.

### 2) CLI entrypoint
- `redactor` binary exposed via package `bin`.
- File input processing with anonymized output for terminal/automation usage.
- Optional JSON-based custom rules support.

### 3) Package and publishing readiness
- `package.json` prepared for npm publication:
  - public access config
  - dist/types export wiring
  - `files` whitelist for shipping only runtime artifacts
- Build outputs include JavaScript + type declarations.

### 4) Examples and docs baseline
- Usage examples for common sensitive data patterns.
- CLI and custom-pattern docs to support first-time adoption.

## Why this merge is important
- Establishes a production-ready starting point for npm distribution.
- Gives developers an immediate local-first privacy tool for AI/code-sharing workflows.
- Creates the base to iterate on:
  - stronger detectors
  - CI release automation
  - tighter editor and team integrations

## Suggested post-merge follow-ups
- Tag release and publish `@redactor/core@0.1.0`.
- Add automated npm publish workflow on version tags.
- Add smoke tests for built CLI artifact in CI.
- Expand dataset refresh process and documented update policy.
