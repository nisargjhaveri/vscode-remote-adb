import * as vscode from 'vscode';
import { Server, setLogger as setRemoteAdbLogger } from 'remote-adb';

import { OutputLogger } from './logger';

let server: Server|undefined = undefined;
let serverUri: vscode.Uri;

export function activate(context: vscode.ExtensionContext) {
	setRemoteAdbLogger(new OutputLogger());

	context.subscriptions.push(vscode.commands.registerCommand('remote-android.openExternal', async () => {
		if (!server) {
			server = new Server(0);
		}
		if (!server.isListening()) {
			serverUri = vscode.Uri.parse(await server.start());
		}

		vscode.env.openExternal(serverUri);
	}));

	context.subscriptions.push(vscode.commands.registerCommand('remote-android.stopServer', async () => {
		await server?.stop();
	}));
}

export function deactivate() {}
