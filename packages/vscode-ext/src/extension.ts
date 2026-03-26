import * as vscode from "vscode";
import { anonymize } from "@code-anonymizer/core";

export function activate(context: vscode.ExtensionContext): void {
  const command = vscode.commands.registerCommand("code-anonymizer.anonymize", async () => {
    const editor = vscode.window.activeTextEditor;

    if (!editor) {
      void vscode.window.showWarningMessage("No active editor found.");
      return;
    }

    const originalCode = editor.document.getText();
    const { code } = anonymize(originalCode);

    const doc = await vscode.workspace.openTextDocument({
      content: code,
      language: editor.document.languageId
    });

    await vscode.window.showTextDocument(doc, {
      preview: false,
      viewColumn: vscode.ViewColumn.Beside
    });
  });

  context.subscriptions.push(command);
}

export function deactivate(): void {}
