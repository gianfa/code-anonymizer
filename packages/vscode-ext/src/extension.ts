import * as vscode from "vscode";
import { anonymize } from "@code-anonymizer/core";

export function activate(context: vscode.ExtensionContext): void {
  const command = vscode.commands.registerCommand("code-anonymizer.anonymize", async () => {
    const editor = vscode.window.activeTextEditor;

    if (!editor) {
      void vscode.window.showWarningMessage("No active editor found.");
      return;
    }

    const config = vscode.workspace.getConfiguration("codeAnonymizer");

    const options = {
      enableNames: config.get<boolean>("enableNames", false),
      customPatterns: config.get<Array<{ name: string; regex: string; replace: string }>>(
        "customPatterns",
        []
      )
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