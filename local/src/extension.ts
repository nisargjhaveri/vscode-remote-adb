import * as vscode from 'vscode';
import { setLogger as setRemoteAdbLogger } from 'remote-adb';
import { RemoteAndroidTreeDataProvider } from './remoteAndroidDevices';
import { logger } from './logger';

export function activate(context: vscode.ExtensionContext) {
	setRemoteAdbLogger(logger);

	let treeView = vscode.window.createTreeView("remote-android", {
		"treeDataProvider": new RemoteAndroidTreeDataProvider(),
	});
}

export function deactivate() {}
