import * as vscode from 'vscode';
import { ServerConnection } from 'remote-adb/client';
import { logger } from './logger';

let _serverConnection: ServerConnection;

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
    if (!_serverConnection) {
        let uri: vscode.Uri|undefined = await vscode.commands.executeCommand("remote-adb.getExternalUrl");

        if (!uri) {
            throw new Error("Could not get server url");
        }

        _serverConnection = await createServerConnection(uri.toString());
    }

    return _serverConnection;
}
