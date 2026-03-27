# RedActor — Anonymize Code in 1 Click

**Stop leaking secrets to AI, issues, and chats.**

RedActor anonymizes sensitive data directly in VS Code, locally.

## Why people install it
- Fast: run from context menu or command palette
- Safe: no cloud, no API calls, no data exfiltration
- Practical: preview diff before sharing

## What it anonymizes
- Emails → `user@email.com`
- URLs → `https://example.com`
- IPs → `0.0.0.0`
- Secrets/keys → `SECRET_1`, `SECRET_2`, ...
- Names → `PERSON_1`, `PERSON_2`, ...
- Your custom regex patterns

## Commands
- `Anonymize Code` (`redactor.anonymize`)
- `Anonymize Code (Preview Diff)` (`redactor.diff`)

## 20-second setup
1. Select code (or keep file open)
2. Run **Anonymize Code**
3. Share safely

## Custom rules (team-ready)
```json
"redActor.customPatterns": [
  {
    "name": "Internal Ticket",
    "regex": "/TICKET-[0-9]+/g",
    "replace": "TICKET-XXX"
  }
]
```

## Recommended settings
```json
"redActor.openInNewTab": true,
"redActor.highlight.enabled": true,
"redActor.highlight.color": "rgba(0, 255, 0, 0.15)"
```

## Positioning
If you use AI tools daily, this should be always-on.

**Copy less risk. Paste with confidence.**
