import * as vscode from 'vscode';
import { setLogger as setRemoteAdbLogger, TcpDeviceManager } from 'remote-adb';
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

	context.subscriptions.push(vscode.commands.registerCommand('remote-android.addTcpDevice', async () => {
		let serial = await vscode.window.showInputBox({
			"title": "Add a device via TCP/IP",
			"placeHolder": "e.g. 192.168.0.2:5555",
			"prompt": "HOST:PORT for the device to connect",
		});

		if (!serial) { return; }

		let device = await TcpDeviceManager.createDevice(serial);

		if (!device) {
			throw new Error(`Cannot connect to '${serial}'. Please enter a valid hostname and port to connect`);
		}
	}));

	context.subscriptions.push(vscode.commands.registerCommand('remote-android.removeTcpDevice', async (treeItem: RemoteAndroidTreeItem) => {
		let device = treeItem.device;

		if (!device) {
			return;
		}

		TcpDeviceManager.removeDevice(device.serial);
	}));
}

export function deactivate() {}
