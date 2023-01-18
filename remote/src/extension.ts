import * as vscode from 'vscode';
import { Server, setLogger as setRemoteAdbLogger } from 'remote-adb';

import { OutputLogger } from './logger';

let server: Server;
let serverUri: vscode.Uri;

export function activate(context: vscode.ExtensionContext) {
	setRemoteAdbLogger(new OutputLogger());

	let disposable = vscode.commands.registerCommand('remote-android.openExternal', async () => {
		if (!server) {
			// Start the remote-adb server
			server = new Server(0);
			serverUri = vscode.Uri.parse(await server.start());
		}

		vscode.env.openExternal(serverUri);
	});

	context.subscriptions.push(disposable);
}

export function deactivate() {}
