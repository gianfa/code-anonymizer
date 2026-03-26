import * as vscode from "vscode";
import { anonymize, parseAnonymizations, type CustomAnonymization } from "@code-anonymizer/core";

export function activate(context: vscode.ExtensionContext): void {
  const command = vscode.commands.registerCommand("code-anonymizer.anonymize", async () => {
    const editor = vscode.window.activeTextEditor;

    if (!editor) {
      void vscode.window.showWarningMessage("No active editor found.");
      return;
    }

    const config = vscode.workspace.getConfiguration("codeAnonymizer");

    const customPatterns = config.get<Array<{ name: string; regex: string; replace: string }>>(
      "customPatterns",
      []
    );
    const customAnonymizations: CustomAnonymization[] = [];

    for (const pattern of customPatterns) {
      try {
        customAnonymizations.push(...parseAnonymizations({ [pattern.regex]: pattern.replace }));
      } catch {
        void vscode.window.showWarningMessage(
          `Skipping invalid custom pattern "${pattern.name}". Expected regex literal format like /pattern/gi.`
        );
      }
    }

    const options = {
      enableEmails: config.get<boolean>("enableEmails", true),
      enableUrls: config.get<boolean>("enableUrls", true),
      enableIps: config.get<boolean>("enableIps", true),
      enableSecrets: config.get<boolean>("enableSecrets", true),
      enableNames: config.get<boolean>("enableNames", false),
      customAnonymizations
    };

    const openInNewTab = config.get<boolean>("openInNewTab", true);

    const originalCode = editor.document.getText();
    const { code, findings } = anonymize(originalCode, options);

    const { summary, total } = summarizeFindings(findings);

    if (total === 0) {
      void vscode.window.showInformationMessage("No sensitive patterns found.");
    } else {
      void vscode.window.showInformationMessage(`Anonymized: ${summary}`);
    }

    if (openInNewTab) {
      const doc = await vscode.workspace.openTextDocument({
        content: code,
        language: editor.document.languageId
      });

      await vscode.window.showTextDocument(doc, {
        preview: false,
        viewColumn: vscode.ViewColumn.Beside
      });
    } else {
      const fullRange = new vscode.Range(
        editor.document.positionAt(0),
        editor.document.positionAt(originalCode.length)
      );

      await editor.edit((editBuilder) => {
        editBuilder.replace(fullRange, code);
      });
    }
  });

  context.subscriptions.push(command);
}

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
    const pluralized =
      count === 1 || label === "IP" ? label : `${label}s`;

    parts.push(`${count} ${pluralized}`);
  }

  return {
    summary: parts.length > 0 ? parts.join(", ") : "No sensitive patterns found.",
    total
  };
}

export function deactivate(): void {}