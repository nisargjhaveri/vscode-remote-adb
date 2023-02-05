import * as vscode from 'vscode';
import { RemoteAdbDevice, UsbDeviceManager, TcpDeviceManager } from 'remote-adb';

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

	private usbDevices: RemoteAdbDevice[] = [];
	private tcpDevices: RemoteAdbDevice[] = [];

	constructor() {
		if (!UsbDeviceManager.isSupported()) {
			return;
		}

		UsbDeviceManager.monitorDevices((devices) => {
			this.usbDevices = devices;
			this._onDidChangeTreeData.fire();
		});
		TcpDeviceManager.monitorDevices((devices) => {
			this.tcpDevices = devices;
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
			return this.usbDevices.concat(this.tcpDevices).map((d) => new RemoteAndroidTreeItem(d));
		}
	}
}