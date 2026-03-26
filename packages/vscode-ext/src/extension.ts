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
    const { code } = anonymize(originalCode, options);

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

export function deactivate(): void {}
