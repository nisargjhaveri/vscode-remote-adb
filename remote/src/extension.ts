import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	let disposable = vscode.commands.registerCommand('remote-android.startServer', () => {
		// Start the remote-adb server
	});

	context.subscriptions.push(disposable);
}

export function deactivate() {}
