import * as vscode from 'vscode';
import { Logger } from 'remote-adb';

export class OutputLogger implements Logger {
    private channel = vscode.window.createOutputChannel("Remote Android", { log: true });

    private formatSingleMessage(message: any)
    {
        if (typeof(message) === "undefined") {
            return "undefined";
        }
        else if (message === null) {
            return "null";
        }
        else if (typeof message === "object") {
            return JSON.stringify(message, undefined, 4);
        }
        else if (message.toString) {
            return message.toString();
        }
        else {
            return message;
        }
    }

    private format(...data: any[]) {
        return data.map(this.formatSingleMessage).join(' ');
    }

    log(...data: any[]): void {
        this.channel.appendLine(this.format(...data));
    }

    debug(...data: any[]): void {
        this.channel.debug(this.format(...data));
    }
    info(...data: any[]): void {
        this.channel.info(this.format(...data));
    }
    warn(...data: any[]): void {
        this.channel.warn(this.format(...data));
    }
    error(...data: any[]): void {
        this.channel.error(this.format(...data));
    }
}
