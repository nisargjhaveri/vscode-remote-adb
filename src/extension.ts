import * as vscode from 'vscode';
import { setLogger as setRemoteAdbLogger } from 'remote-adb/logger';
import { TcpDeviceManager } from 'remote-adb/client';
import { RemoteAdbDeviceWrapper, RemoteAndroidDeviceListManager } from './remoteAndroidDevices';
import { logger } from './logger';

function logAndShowError(message: string) {
	logger.error(message);
	vscode.window.showErrorMessage(message);
}

export function activate(context: vscode.ExtensionContext) {
	setRemoteAdbLogger(logger);

	const remoteAndroidDeviceListManager = new RemoteAndroidDeviceListManager();
	let treeView = vscode.window.createTreeView("remote-adb", {
		"treeDataProvider": remoteAndroidDeviceListManager,
	});

	context.subscriptions.push(vscode.commands.registerCommand('remote-adb.connectDevice', async (treeItem: RemoteAdbDeviceWrapper) => {
		try {
			await remoteAndroidDeviceListManager.connect(treeItem);
		} catch (e: any) {
			logAndShowError("Failed to connect to device: " + e.message);
		}
	}));

	context.subscriptions.push(vscode.commands.registerCommand('remote-adb.disconnectDevice', async (treeItem: RemoteAdbDeviceWrapper) => {
		try {
			await remoteAndroidDeviceListManager.disconnect(treeItem);
		} catch (e: any) {
			logAndShowError("Failed to disconnect device: " + e.message);
		}
	}));

	context.subscriptions.push(vscode.commands.registerCommand('remote-adb.copyRemoteSerial', async (treeItem: RemoteAdbDeviceWrapper) => {
		if (treeItem?.device?.remoteSerial) {
			await vscode.env.clipboard.writeText(treeItem.device.remoteSerial);
		}
	}));

	context.subscriptions.push(vscode.commands.registerCommand('remote-adb.addTcpDevice', async () => {
		let serial = await vscode.window.showInputBox({
			"title": "Add a device via TCP/IP",
			"placeHolder": "e.g. 192.168.0.2:5555",
			"prompt": "HOST:PORT for the device to connect",
		});

		if (!serial) { return; }

		let device = await TcpDeviceManager.createDevice(serial);

		if (!device) {
			logAndShowError(`Cannot connect to '${serial}'. Please enter a valid hostname and port to connect`);
		}
	}));

	context.subscriptions.push(vscode.commands.registerCommand('remote-adb.removeTcpDevice', async (treeItem: RemoteAdbDeviceWrapper) => {
		let device = treeItem.device;

		if (!device) {
			return;
		}

		TcpDeviceManager.removeDevice(device.serial);
	}));
}

export function deactivate() {}
