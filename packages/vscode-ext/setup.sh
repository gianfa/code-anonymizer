#!/usr/bin/env bash
set -euo pipefail

cat <<'DOC'
Code Anonymizer VSCode extension - setup rapido

1) Installa dipendenze del monorepo:
   pnpm install

2) Build della extension wrapper:
   pnpm --filter code-anonymizer-vscode build

3) Apri la cartella della extension in VSCode:
   code packages/vscode-ext

4) Avvia Extension Development Host:
   - premi F5 (Run and Debug)
   - si apre una nuova finestra VSCode con la extension caricata

5) Test manuale comando:
   - apri un file qualunque nella finestra host
   - click destro nell'editor -> "Anonymize"
   - viene aperto un nuovo tab con il contenuto anonimizzato

6) (Opzionale) Packaging VSIX per installazione locale:
   pnpm --filter code-anonymizer-vscode dlx @vscode/vsce package
   code --install-extension code-anonymizer-vscode-*.vsix
DOC
