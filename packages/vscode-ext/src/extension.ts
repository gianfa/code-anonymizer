import * as vscode from "vscode";
import {
  anonymize,
  parseAnonymizations,
  type CustomAnonymization
} from "@redactor/core";

type CustomPatternConfig = {
  name: string;
  regex: string;
  replace: string;
};

function summarizeFindings(findings: Record<string, number>): { summary: string; total: number } {
  const labels: Record<string, string> = {
    emails: "email",
    urls: "URL",
    ipv4: "IP",
    ips: "IP",
    awsKeys: "AWS key",
    secrets: "secret",
    names: "name"
  };

  const parts: string[] = [];
  let total = 0;

  for (const [key, count] of Object.entries(findings)) {
    if (!count) {
      continue;
    }

    total += count;

    const label = labels[key] ?? key;
    const pluralized = count === 1 || label === "IP" ? label : `${label}s`;
    parts.push(`${count} ${pluralized}`);
  }

  return {
    summary: parts.length > 0 ? parts.join(", ") : "No sensitive patterns found.",
    total
  };
}

function computeChangedLineRanges(
  originalText: string,
  anonymizedText: string,
  targetDocument: vscode.TextDocument
): vscode.Range[] {
  const originalLines = originalText.split("\n");
  const anonymizedLines = anonymizedText.split("\n");
  const maxLines = Math.max(originalLines.length, anonymizedLines.length);

  const ranges: vscode.Range[] = [];

  if (targetDocument.lineCount === 0) {
    return ranges;
  }

  for (let i = 0; i < maxLines; i++) {
    const originalLine = originalLines[i] ?? "";
    const anonymizedLine = anonymizedLines[i] ?? "";

    if (originalLine !== anonymizedLine) {
      const lineIndex = Math.min(i, targetDocument.lineCount - 1);
      const line = targetDocument.lineAt(lineIndex);
      ranges.push(new vscode.Range(line.range.start, line.range.end));
    }
  }

  return ranges;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function computeHighlightRangesFromFinalCode(
  text: string,
  findings: Record<string, number>,
  targetDocument: vscode.TextDocument
): vscode.Range[] {
  const patterns: RegExp[] = [];

  if (findings.names > 0) {
    patterns.push(/\bPERSON_\d+\b/g);
  }

  if (findings.secrets > 0) {
    patterns.push(/\bSECRET_\d+\b/g);
  }

  if (findings.emails > 0) {
    patterns.push(new RegExp(escapeRegExp("user@email.com"), "g"));
  }

  if (findings.urls > 0) {
    patterns.push(new RegExp(escapeRegExp("https://example.com"), "g"));
  }

  if (findings.ips > 0) {
    patterns.push(new RegExp(escapeRegExp("0.0.0.0"), "g"));
  }

  const ranges: vscode.Range[] = [];

  for (const pattern of patterns) {
    let match: RegExpExecArray | null;

    while ((match = pattern.exec(text)) !== null) {
      const start = targetDocument.positionAt(match.index);
      const end = targetDocument.positionAt(match.index + match[0].length);
      ranges.push(new vscode.Range(start, end));

      if (match[0].length === 0) {
        pattern.lastIndex += 1;
      }
    }
  }

  return ranges;
}

function createDecorationType(): vscode.TextEditorDecorationType {
  const config = vscode.workspace.getConfiguration("redActor");
  const highlightEnabled = config.get<boolean>("highlight.enabled", true);
  const highlightColor = config.get<string>("highlight.color", "rgba(0, 255, 0, 0.15)");

  return vscode.window.createTextEditorDecorationType({
    backgroundColor: highlightEnabled ? highlightColor : undefined,
    borderRadius: "2px"
  });
}

function buildCustomAnonymizations(
  customPatterns: CustomPatternConfig[]
): {
  customAnonymizations: CustomAnonymization[];
  invalidPatternNames: string[];
} {
  const customAnonymizations: CustomAnonymization[] = [];
  const invalidPatternNames: string[] = [];

  for (const pattern of customPatterns) {
    try {
      customAnonymizations.push(
        ...parseAnonymizations({ [pattern.regex]: pattern.replace })
      );
    } catch {
      invalidPatternNames.push(pattern.name);
    }
  }

  return { customAnonymizations, invalidPatternNames };
}

export function activate(context: vscode.ExtensionContext): void {
  const hoverProvider = vscode.languages.registerHoverProvider("*", {
    provideHover(document, position) {
      const wordRange = document.getWordRangeAtPosition(position);
      if (!wordRange) {
        return;
      }

      const word = document.getText(wordRange);

      if (
        word.startsWith("PERSON_") ||
        word.startsWith("SECRET_") ||
        word === "user@email.com" ||
        word === "https://example.com" ||
        word === "0.0.0.0"
      ) {
        return new vscode.Hover(`Anonymized value: ${word}`);
      }

      return;
    }
  });

  const anonymizeCommand = vscode.commands.registerCommand(
    "redactor.anonymize",
    async () => {
      const sourceEditor = vscode.window.activeTextEditor;

      if (!sourceEditor) {
        void vscode.window.showWarningMessage("No active editor found.");
        return;
      }

      const config = vscode.workspace.getConfiguration("redActor");

      const customPatterns = config.get<CustomPatternConfig[]>("customPatterns", []);
      const { customAnonymizations, invalidPatternNames } =
        buildCustomAnonymizations(customPatterns);

      for (const patternName of invalidPatternNames) {
        void vscode.window.showWarningMessage(
          `Skipping invalid custom pattern "${patternName}". Expected regex literal format like /pattern/gi.`
        );
      }

      const options = {
        enableEmails: config.get<boolean>("enableEmails", true),
        enableUrls: config.get<boolean>("enableUrls", true),
        enableIps: config.get<boolean>("enableIps", true),
        enableSecrets: config.get<boolean>("enableSecrets", true),
        enableNames: config.get<boolean>("enableNames", true),
        customAnonymizations
      };

      const openInNewTab = config.get<boolean>("openInNewTab", true);
      const highlightEnabled = config.get<boolean>("highlight.enabled", true);

      const originalCode = sourceEditor.document.getText();
      const { code, findings } = anonymize(originalCode, options);
      const { summary, total } = summarizeFindings(findings);

      if (total === 0) {
        void vscode.window.showInformationMessage("No sensitive patterns found.");
        return;
      }

      void vscode.window.showInformationMessage(`Anonymized: ${summary}`);
      void vscode.window.setStatusBarMessage(`$(shield) ${total} anonymizations`, 3000);

      const decorationType = createDecorationType();
      context.subscriptions.push(decorationType);

      if (openInNewTab) {
        const targetDocument = await vscode.workspace.openTextDocument({
          content: code,
          language: sourceEditor.document.languageId
        });

        const targetEditor = await vscode.window.showTextDocument(targetDocument, {
          preview: false,
          viewColumn: vscode.ViewColumn.Beside
        });

        if (highlightEnabled) {
          const ranges = computeHighlightRangesFromFinalCode(code, findings, targetDocument);
          targetEditor.setDecorations(decorationType, ranges);
        }

        return;
      }

      const fullRange = new vscode.Range(
        sourceEditor.document.positionAt(0),
        sourceEditor.document.positionAt(originalCode.length)
      );

      await sourceEditor.edit((editBuilder) => {
        editBuilder.replace(fullRange, code);
      });

      if (highlightEnabled) {
        const updatedEditor = vscode.window.activeTextEditor;

        if (updatedEditor && updatedEditor.document === sourceEditor.document) {
          const ranges = computeHighlightRangesFromFinalCode(
            code,
            findings,
            updatedEditor.document
          );
          updatedEditor.setDecorations(decorationType, ranges);
        }
      }
    }
  );

  const diffCommand = vscode.commands.registerCommand(
    "redactor.diff",
    async () => {
      const editor = vscode.window.activeTextEditor;

      if (!editor) {
        void vscode.window.showWarningMessage("No active editor found.");
        return;
      }

      const config = vscode.workspace.getConfiguration("redActor");

      const customPatterns = config.get<CustomPatternConfig[]>("customPatterns", []);
      const { customAnonymizations, invalidPatternNames } =
        buildCustomAnonymizations(customPatterns);

      for (const patternName of invalidPatternNames) {
        void vscode.window.showWarningMessage(
          `Skipping invalid custom pattern "${patternName}". Expected regex literal format like /pattern/gi.`
        );
      }

      const options = {
        enableEmails: config.get<boolean>("enableEmails", true),
        enableUrls: config.get<boolean>("enableUrls", true),
        enableIps: config.get<boolean>("enableIps", true),
        enableSecrets: config.get<boolean>("enableSecrets", true),
        enableNames: config.get<boolean>("enableNames", false),
        customAnonymizations
      };

      const original = editor.document.getText();
      const { code } = anonymize(original, options);

      const originalDoc = await vscode.workspace.openTextDocument({
        content: original,
        language: editor.document.languageId
      });

      const anonymizedDoc = await vscode.workspace.openTextDocument({
        content: code,
        language: editor.document.languageId
      });

      await vscode.commands.executeCommand(
        "vscode.diff",
        originalDoc.uri,
        anonymizedDoc.uri,
        "Anonymized Diff"
      );
    }
  );

  context.subscriptions.push(hoverProvider, anonymizeCommand, diffCommand);
}

export function deactivate(): void {}
