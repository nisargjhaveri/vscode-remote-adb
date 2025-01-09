import * as vscode from 'vscode';
import { ServerConnection } from 'remote-adb/client';
import { logger } from './logger';

let _serverConnection: ServerConnection|undefined = undefined;

const companionExtensionId = "nisargjhaveri.remote-adb-server";
const companionExtensionName = "Remote Android Debugging (Server)";

async function isCompanionAvailable(): Promise<boolean> {
    try {
        await vscode.commands.executeCommand("remote-adb-server.activate");
        return true;
    } catch (e) {
        return false;
    }
}

async function promptInstallCompanion(): Promise<boolean> {
    logger.log("Showing prompt to install companion");

    try {
        logger.log(`Installing companion extension (${companionExtensionId})`);
        await vscode.commands.executeCommand("workbench.extensions.installExtension", companionExtensionId, {
            justification: "This is required to connect local Android device to remote for debugging.",
            enable: true,
        });
        await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (e) {
        logger.error("Error installing companion extension:", e);
    }

    if (!await isCompanionAvailable()) {
        const OPEN = "Install Extension";
        vscode.window.showErrorMessage(
            `[${companionExtensionName}](https://marketplace.visualstudio.com/items?itemName=${companionExtensionId}) extension is required. Please install manually and try again.`,
            OPEN
        ).then((choice) => {
            if (choice === OPEN) {
                // vscode.commands.executeCommand("workbench.extensions.search", `@id:${companionExtensionId}`);
                vscode.env.openExternal(vscode.Uri.parse(`vscode:extension/${companionExtensionId}`));
            }
        });

        return false;
    }

    logger.log("Companion extension installed.");
    return true;
}

async function getServerUri(): Promise<vscode.Uri> {
    if (!await isCompanionAvailable()) {
        if (!await promptInstallCompanion()) {
            throw new Error(`Could not install and enable extension: [${companionExtensionName}](https://marketplace.visualstudio.com/items?itemName=${companionExtensionId})`);
        }
    }

    const uri: vscode.Uri|undefined = await vscode.commands.executeCommand("remote-adb-server.getExternalUrl");
    if (!uri) {
        throw new Error("Could not start remote-adb server and get url");
    }

    return uri;
}

function getPassword(password?: string) {
    //TODO: Ask for password if not provided?
    return password;
}

async function createServerConnection(server: string, password?: string): Promise<ServerConnection> {
    logger.log(`Connecting to ${server}`);
    const serverConnection = new ServerConnection(server);

    logger.log("Connecting to server for status");
    const status = await serverConnection.getServerStatus();

    if (status._error) {
        throw new Error(`Cannot get server status: ${status._error}`);
    }
    else if (status.loginSupported && status.loginRequired) {
        password = getPassword(password);

        if (!password) {
            throw new Error("Server requires authentication. Please provide a password.");
        }

        logger.log("Server requires authentication. Trying to login.");
        try {
            await serverConnection.login(password);
        }
        catch (e: any) {
            throw new Error(`Authentication failed: ${e.message}`);
        }
        logger.log("Authentication successful");
    }

    return serverConnection;
}

export async function getServerConnection(): Promise<ServerConnection> {
    if (_serverConnection) {
        logger.log("Checking server status by connecting to server");
        const status = await _serverConnection.getServerStatus();

        if (status._error) {
            logger.log(`Cannot get server status: ${status._error}`);
            _serverConnection = undefined;
        }
    }

    if (!_serverConnection) {
        logger.log("Getting server url from companion extension");
        let uri: vscode.Uri = await getServerUri();

        _serverConnection = await createServerConnection(uri.toString());
    }

    return _serverConnection;
}
