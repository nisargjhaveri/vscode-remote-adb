import * as vscode from 'vscode';
import { Server, setLogger as setRemoteAdbLogger } from 'remote-adb';

import { logger } from './logger';

let server: Server|undefined = undefined;
let serverUri: vscode.Uri|undefined = undefined;

async function ensureServerListening() {
	if (!server) {
		server = new Server(0);
	}
	if (!server.isListening()) {
		serverUri = vscode.Uri.parse(await server.start());
	}
}

export function activate(context: vscode.ExtensionContext) {
	setRemoteAdbLogger(logger);

	context.subscriptions.push(vscode.commands.registerCommand('remote-android.openExternal', async () => {
		await ensureServerListening();

		if (serverUri) {
			await vscode.env.openExternal(serverUri);
		}
	}));

	context.subscriptions.push(vscode.commands.registerCommand('remote-android.getExternalUrl', async (): Promise<vscode.Uri|undefined> => {
		await ensureServerListening();

		if (serverUri) {
			return await vscode.env.asExternalUri(serverUri);
		}
	}));

	context.subscriptions.push(vscode.commands.registerCommand('remote-android.stopServer', async () => {
		await server?.stop();
	}));
}

export function deactivate() {}
