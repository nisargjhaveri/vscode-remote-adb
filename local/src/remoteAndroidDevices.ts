import * as vscode from 'vscode';
import { UsbDeviceManager, RemoteAdbDevice } from 'remote-adb';

export class RemoteAndroidTreeItem extends vscode.TreeItem {
	device: RemoteAdbDevice;

	constructor(device: RemoteAdbDevice) {
		super(`${device.name} (${device.serial})`);

		this.device = device;
		this.id = device.serial;

		this.description = device.connected ? "Connected" : undefined;

		this.contextValue = device.connected ? "remoteAndroidConnected" : "remoteAndroidDisconnected";
	}
}

export class RemoteAndroidTreeDataProvider implements vscode.TreeDataProvider<RemoteAndroidTreeItem> {
	private _onDidChangeTreeData: vscode.EventEmitter<RemoteAndroidTreeItem | undefined | void> = new vscode.EventEmitter<RemoteAndroidTreeItem | undefined | void>();
	readonly onDidChangeTreeData: vscode.Event<RemoteAndroidTreeItem | undefined | void> = this._onDidChangeTreeData.event;

	private devices: RemoteAdbDevice[] = [];

	constructor() {
		if (!UsbDeviceManager.isSupported()) {
			return;
		}

		UsbDeviceManager.monitorDevices((devices) => {
			this.devices = devices;
			this._onDidChangeTreeData.fire();
		});
	}

	getTreeItem(element: RemoteAndroidTreeItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
		return element;
	}
	getChildren(element?: RemoteAndroidTreeItem): vscode.ProviderResult<RemoteAndroidTreeItem[]> {
		if (element) {
			return [];
		}
		else {
			return this.devices.map((d) => new RemoteAndroidTreeItem(d));
		}
	}
}