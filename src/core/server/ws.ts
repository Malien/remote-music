import { PlayerServerAdapter, StreamingClientServerAdapter } from './adapters'
import * as WebSocket from 'ws'
import { EventEmitter } from 'events';

interface WSRequest {
    type: string
    payload?: any
}

export class WSClientServerAdapter extends EventEmitter implements StreamingClientServerAdapter {
    ws: WebSocket.Server
    constructor(port: number){
        super()
        this.ws = new WebSocket.Server({port})
        let _this = this
        this.ws.addListener("connection", (client) => {
            client.addListener("message", (data) => {
                try {
                    let obj = JSON.parse(data.toString()) as WSRequest
                    switch (obj.type) {
                        case "players":
                            _this.emit("players", client)
                            break;
                        case "playerStatus":
                            _this.emit("playerStatus", obj.payload.id, client, obj.payload.queueLimit)
                            break;
                        case "subscribe":
                            _this.emit("subscribe", obj.payload.id, client, obj.payload.queueLimit)
                            break;
                        case "unsubscribe":
                            _this.emit("unsubscribe", obj.payload, client)
                            break;
                        case "subscriptionStatus":
                            _this.emit("subscriptionStatus", obj.payload, client)
                            break;
                        case "subscriptions":
                            _this.emit("subscriptions", client)
                            break;
                        case "statusChange":
                            _this.emit("statusChange", obj.payload.id, obj.payload)
                            break;
                        case "queueUp":
                            _this.emit("queueUp", obj.payload.id, obj.payload.position, obj.payload.queue)
                            break;
                    }
                } catch (e) {
                    console.error(e)
                }
            }).addListener("error", (err) => {
                console.error(err)
            }).addListener("close", (code, message) => {
                _this.emit("close", client)
                console.log("Disconnected client: " + client.url + ", with code: " + code + ", for reason: " + message)
            })
        }).addListener("error", (err) => {
            console.error(err)
        })
    }
}

export class WSPlayerServerAdapter extends EventEmitter implements PlayerServerAdapter {
    ws: WebSocket.Server
    constructor(port: number){
        super()
        this.ws = new WebSocket.Server({port})
        let _this = this
        this.ws.addListener("connection", (client) => {
            client.addListener("message", (data) => {
                let str = data.toString()
                try {
                    let obj = JSON.parse(str) as WSRequest
                    switch (obj.type) {
                        case "pong":
                            _this.emit("pong", client, obj.payload)
                            break;
                        case "heartbeat":
                            _this.emit("heartbeat", client, obj.payload)
                            break;
                        case "register":
                            _this.emit("register", client, obj.payload)
                            break;
                        case "unregister":
                            _this.emit("unregister", client)
                            break;
                        case "statusChange":
                            _this.emit("statusChange", client, obj.payload)
                            break;
                    }
                } catch (e) {
                    console.error(e)
                }
            }).addListener("close", (code, msg) => {
                _this.emit("close", client)
            }).addListener("error", (err) => {
                console.error(err)
            })
        }).addListener("error", (err) => {
            console.error(err)
        })
    }
}