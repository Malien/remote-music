import { EventEmitter } from "events"
import * as WebSocket from "ws";
import { BrowserWindow } from "electron"

import { ServerType } from "../preferences"
import { Change } from "../components";

interface UpdaterConstructorConfig {
    type: ServerType
    address: string
    password?: string
    id: string
}

export class Updater extends EventEmitter {
    window: BrowserWindow
    constructor(clientServer: UpdaterConstructorConfig) {
        super()
        this.window = new BrowserWindow({
            width: 600,
            height: 400,
            frame: true
        })
        this.window.loadFile("./src/app/updater/index.html")
        switch (clientServer.type) {
            case ServerType.ws:
                let ws = new WebSocket(clientServer.address)
                ws.send("subscribe " + clientServer.id)
                let updater = this
                ws.on("message", data => {
                    updater.emit("change", JSON.parse(data.toString()))
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
}