import { EventEmitter } from "events";
import { Adapter, UpdaterAdapter } from "./adapters";
import { Transferable } from "../../shared/components";
import * as WebSocket from "ws";

interface WSRequest {
    type: string
    payload?: any
}

export class WSListenerAdapter extends EventEmitter implements Adapter {
    private ws: WebSocket
    constructor(url: string) {
        super()
        this.ws = new WebSocket(url)
        let _this = this
        this.ws.addListener("message", (data) => {
            try {
                let obj = JSON.parse(data.toString()) as WSRequest
                switch (obj.type) {
                    case "players": 
                        _this.emit("players", obj.payload)
                        break;
                    case "playerStatus": 
                        _this.emit("playerStatys", obj.payload.id, obj.payload.name, obj.payload.status)
                        break;
                    case "subscription":
                        _this.emit("subscription", obj.payload.id, obj.payload.name, obj.payload.status)
                        break;
                    case "subscriptionStatus":
                        _this.emit("subscriptionStatus", obj.payload.id, obj.payload.subscribed)
                        break;
                    case "subscriptions": 
                        _this.emit("subscriptions", obj.payload)
                        break;
                }
            } catch (e) {
                console.error(e)
            }
        })
        .addListener("close", (code, reason) => {
            _this.emit("close")
        })
        .addListener("error", (err) => {
            console.error(err)
        })
        .addListener("open", ()=> {
            _this.emit("open")
        })
    }
    send(msg: Transferable, cb?: (...args:any[])=>void) {
        this.ws.send(msg, cb)
    }
}

export class WSUpdaterAdapter extends EventEmitter implements UpdaterAdapter {
    private ws: WebSocket
    constructor(url:string) {
        super()
        this.ws = new WebSocket(url)
        let _this = this
        this.ws.addListener("message", (data) => {
            try {
                let obj = JSON.parse(data.toString()) as WSRequest
                switch(obj.type) {
                    case "register": 
                        _this.emit("register", obj.payload.id, obj.payload.interval)
                        break;
                    case "unregister":
                        _this.emit("unregister")
                        break;
                    case "ping":
                        _this.emit("ping")
                        break;
                    case "statusChange":
                        _this.emit("statusChange", obj.payload)
                        break;
                }
            } catch (e) {
                console.error(e)
            }
        })
        .addListener("close", (code, reason) => {
            _this.emit("unregister")
        })
        .addListener("error", (err) => {
            console.error(err)
        })
        .addListener("open", () => {
            _this.emit("open")
        })
    }
    send(msg:Transferable, cb?: (...args: any[])=>void):void {
        this.ws.send(msg, cb)
    }
}