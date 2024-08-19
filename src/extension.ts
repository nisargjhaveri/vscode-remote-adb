import * as vscode from 'vscode';
import { setLogger as setRemoteAdbLogger, TcpDeviceManager } from 'remote-adb';
import { RemoteAdbDeviceWrapper, RemoteAndroidDeviceListManager } from './remoteAndroidDevices';
import { logger } from './logger';

export function activate(context: vscode.ExtensionContext) {
	setRemoteAdbLogger(logger);

	const remoteAndroidDeviceListManager = new RemoteAndroidDeviceListManager();
	let treeView = vscode.window.createTreeView("remote-android", {
		"treeDataProvider": remoteAndroidDeviceListManager,
	});

	context.subscriptions.push(vscode.commands.registerCommand('remote-android.connectDevice', async (treeItem: RemoteAdbDeviceWrapper) => {
		await remoteAndroidDeviceListManager.connect(treeItem);
	}));

	context.subscriptions.push(vscode.commands.registerCommand('remote-android.disconnectDevice', async (treeItem: RemoteAdbDeviceWrapper) => {
		await remoteAndroidDeviceListManager.disconnect(treeItem);
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

	context.subscriptions.push(vscode.commands.registerCommand('remote-android.removeTcpDevice', async (treeItem: RemoteAdbDeviceWrapper) => {
		let device = treeItem.device;

		if (!device) {
			return;
		}

		TcpDeviceManager.removeDevice(device.serial);
	}));
}

export function deactivate() {}