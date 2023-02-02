import * as vscode from 'vscode';
import { setLogger as setRemoteAdbLogger } from 'remote-adb';
import { RemoteAndroidTreeDataProvider, RemoteAndroidTreeItem } from './remoteAndroidDevices';
import { logger } from './logger';
import { getServerConnection } from './serverConnection';

export function activate(context: vscode.ExtensionContext) {
	setRemoteAdbLogger(logger);

	let treeView = vscode.window.createTreeView("remote-android", {
		"treeDataProvider": new RemoteAndroidTreeDataProvider(),
	});

	context.subscriptions.push(vscode.commands.registerCommand('remote-android.connectDevice', async (treeItem: RemoteAndroidTreeItem) => {
		let device = treeItem.device;

		if (!device) {
			return;
		}

		if (!device.connected) {
			const serverConnection = await getServerConnection();
			await device.connect(serverConnection);
		}
	}));

	context.subscriptions.push(vscode.commands.registerCommand('remote-android.disconnectDevice', async (treeItem: RemoteAndroidTreeItem) => {
		let device = treeItem.device;

		if (!device) {
			return;
		}

		if (device.connected) {
			await device.disconnect();
		}
	}));
}

export function deactivate() {}
