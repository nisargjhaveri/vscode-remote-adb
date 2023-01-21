import * as vscode from 'vscode';
import { RemoteAndroidTreeDataProvider } from './remoteAndroidDevices';

export function activate(context: vscode.ExtensionContext) {
	let treeView = vscode.window.createTreeView("remote-android", {
		"treeDataProvider": new RemoteAndroidTreeDataProvider(),
	});
}

export function deactivate() {}
