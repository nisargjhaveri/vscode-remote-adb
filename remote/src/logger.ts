import * as vscode from 'vscode';
import { Logger } from 'remote-adb';

export class OutputLogger implements Logger {
    private channel = vscode.window.createOutputChannel("Remote Android");

    private getFormattedTime()
    {
        let time = new Date();
        return `${time.getFullYear()}-${time.getMonth()+1}-${time.getDate()} ${time.getHours()}:${time.getMinutes()}`;
    }

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
        const message = data.map(this.formatSingleMessage).join(' ');
        return `[${this.getFormattedTime()}] ${message}`;
    }

    log(...data: any[]): void {
        this.channel.appendLine(this.format(...data));
    }

    debug(...data: any[]): void {
        this.log(...data);
    }
    info(...data: any[]): void {
        this.log(...data);
    }
    warn(...data: any[]): void {
        this.log(...data);
    }
    error(...data: any[]): void {
        this.log(...data);
    }
}
