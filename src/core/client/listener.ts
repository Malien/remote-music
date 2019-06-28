import * as WebSocket from "ws";
import { BrowserWindow } from "electron"

import { ServerType } from "../preferences"

interface ListenerConstructorOptions {
    type: ServerType
    address: string
    password?: string
    id: string
}

export class Listener {
    window: BrowserWindow
    constructor(clientServer: ListenerConstructorOptions) {
        this.window = new BrowserWindow({
            width: 600,
            height: 400,
            frame: true,
            webPreferences: {
                nodeIntegration: true
            }
        })
        this.window.loadFile("./src/app/updater/index.html")
        this.window.webContents.openDevTools()
        this.window.webContents.on("did-finish-load", () => {
            this.window.webContents.send("test", "Sup")
        })
        switch (clientServer.type) {
            case ServerType.ws:
                let ws = new WebSocket(clientServer.address)
                let updater = this
                ws.on("open", () => {
                    ws.send("subscribe " + clientServer.id)
                })
                ws.on("message", data => {
                    try {
                        updater.emit("change", JSON.parse(data.toString()))
                    } catch (e) {
                        console.error(e)
                    }
                })
                ws.on("close", (code, reason) => {
                    updater.emit("close", code, reason)
                })
                ws.on("error", err => {
                    updater.emit("error", err)
                })
                break;
            default:
                throw new Error("Unsupported connection type: " + clientServer.type)
        }
    }
    emit = function (channel:string, ...args: any[]) {
        this.window.webContents.send(channel, args)
    }
}