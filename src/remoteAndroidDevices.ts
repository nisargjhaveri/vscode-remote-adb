import * as vscode from 'vscode';
import { RemoteAdbDevice, UsbDeviceManager, TcpDeviceManager } from 'remote-adb';
import { getServerConnection } from './serverConnection';

export class RemoteAdbDeviceWrapper {
	device: RemoteAdbDevice;
	type: "USB" | "TCP";
	isConnecting: boolean = false;

	constructor(device: RemoteAdbDevice, type: "USB" | "TCP") {
		this.device = device;
		this.type = type;
	}
}

export class RemoteAndroidDeviceListManager implements vscode.TreeDataProvider<RemoteAdbDeviceWrapper> {
	private _onDidChangeTreeData: vscode.EventEmitter<RemoteAdbDeviceWrapper | undefined | void> = new vscode.EventEmitter<RemoteAdbDeviceWrapper | undefined | void>();
	readonly onDidChangeTreeData: vscode.Event<RemoteAdbDeviceWrapper | undefined | void> = this._onDidChangeTreeData.event;

	private usbDevices: RemoteAdbDevice[] = [];
	private tcpDevices: RemoteAdbDevice[] = [];

	constructor() {
		if (UsbDeviceManager.isSupported()) {
			UsbDeviceManager.monitorDevices((devices) => {
				this.usbDevices = devices;
				this.usbDevices.forEach((d) => {
					this.populateDeviceWrapper(d, "USB");
				});
				this._onDidChangeTreeData.fire();
			});
		}

		if (TcpDeviceManager.isSupported()) {
			TcpDeviceManager.monitorDevices((devices) => {
				this.tcpDevices = devices;
				this.tcpDevices.forEach((d) => {
					this.populateDeviceWrapper(d, "TCP");
				});
				this._onDidChangeTreeData.fire();
			});
		}
	}

	getTreeItem(element: RemoteAdbDeviceWrapper): vscode.TreeItem | Thenable<vscode.TreeItem> {
		const device = element.device;

		const treeItem = new vscode.TreeItem(`${device.name} (${device.serial})`);

		treeItem.id = device.serial;

		treeItem.description = device.connected ? "Connected" : undefined;

		let context = [
			"remote-android",
			device.connected ? "connected" : element.isConnecting ? "connecting" : "disconnected",
			element.type,
		];

		treeItem.iconPath = device.connected ? new vscode.ThemeIcon("check") : element.isConnecting ? new vscode.ThemeIcon("loading~spin") : undefined;

		if (element.type === "TCP" && TcpDeviceManager.canRemoveDevice(device.serial)) {
			context.push("removable");
		}

		treeItem.contextValue = `;${context.join(";")};`;

		return treeItem;
	}

	getChildren(element?: RemoteAdbDeviceWrapper): vscode.ProviderResult<RemoteAdbDeviceWrapper[]> {
		if (element) {
			return [];
		}
		else {
			return this.usbDevices.map(this.getDeviceWrapper)
				.concat(this.tcpDevices.map(this.getDeviceWrapper));
		}
	}

	async connect(element: RemoteAdbDeviceWrapper) {
		if (!element.device.connected && !element.isConnecting) {
			try {
				this.setConnecting(element, true);
				const serverConnection = await getServerConnection();
				await element.device.connect(serverConnection);
			} catch(e) {
				throw e;
			} finally {
				this.setConnecting(element, false);
			}
		}
	}

	async disconnect(element: RemoteAdbDeviceWrapper) {
		await element.device.disconnect();
	}

	private setConnecting(element: RemoteAdbDeviceWrapper, isConnecting: boolean) {
		if (element.isConnecting === isConnecting) {
			return;
		}

		element.isConnecting = isConnecting;
		this._onDidChangeTreeData.fire(element);
	}

	private getDeviceWrapper(device: RemoteAdbDevice): RemoteAdbDeviceWrapper {
		return (device as any)._vscodeRemoteDeviceExtended;
	}
	private populateDeviceWrapper(device: RemoteAdbDevice, type: "USB" | "TCP") {
		(device as any)._vscodeRemoteDeviceExtended ??= new RemoteAdbDeviceWrapper(device, type);
	}
}