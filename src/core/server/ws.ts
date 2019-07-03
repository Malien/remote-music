import { PlayerServerAdapter, StreamingClientServerAdapter } from './server'
import * as WebSocket from 'ws'

interface WSRequest {
    type: string
    payload?: any
}

export class WSClientServerAdapter extends StreamingClientServerAdapter {
    ws: WebSocket.Server
    constructor(port: number){
        super()
        this.ws = new WebSocket.Server({port})
        this.ws.addListener("connection", (client) => {
            client.addListener("message", (data) => {
                try {
                    let obj = JSON.parse(data.toString()) as WSRequest
                    switch (obj.type) {
                        case "players":
                            this.emit("players", client)
                            break;
                        case "playerStatus":
                            this.emit("playerStatus", obj.payload.id, client, obj.payload.queueLimit)
                            break;
                        case "subscribe":
                            this.emit("subscribe", obj.payload.id, client, obj.payload.queueLimit)
                            break;
                        case "unsubscribe":
                            this.emit("unsubscribe", obj.payload, client)
                            break;
                        case "subscriptionStatus":
                            this.emit("subscriptionStatus", obj.payload, client)
                            break;
                        case "subscriptions":
                            this.emit("subscriptions", client)
                            break;
                        case "statusChange":
                            this.emit("statusChange", obj.payload.id, obj.payload)
                            break;
                        case "queueUp":
                            this.emit("queueUp", obj.payload.id, obj.payload.position, obj.payload.queue)
                            break;
                    }
                } catch (e) {
                    console.error(e)
                }
            }).addListener("error", (err) => {
                console.error(err)
            }).addListener("close", (code, message) => {
                this.emit("close", client)
                console.log("Disconnected client: " + client.url + ", with code: " + code + ", for reason: " + message)
            })
        }).addListener("error", (err) => {
            console.error(err)
        })
    }
}

export class WSPlayerServerAdapter extends PlayerServerAdapter {
    ws: WebSocket.Server
    constructor(port: number){
        super()
        this.ws = new WebSocket.Server({port})
        this.ws.addListener("connection", (client) => {
            client.addListener("message", (data) => {
                let obj = JSON.parse(data.toString()) as WSRequest
                switch (obj.type) {
                    case "pong":
                        this.emit("pong", client, obj.payload)
                        break;
                    case "heartbeat":
                        this.emit("heartbeat", client, obj.payload)
                        break;
                    case "register":
                        this.emit("register", client, obj.payload)
                        break;
                    case "unregister":
                        this.emit("unregister", client)
                        break;
                    case "statusChange":
                        this.emit("statusChange", client, obj.payload)
                        break;
                }
            }).addListener("close", (code, msg) => {
                this.emit("close", client)
            }).addListener("error", (err) => {
                console.error(err)
            })
        }).addListener("error", (err) => {
            console.error(err)
        })
    }
}