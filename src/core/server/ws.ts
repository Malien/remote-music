import { PlayerServerAdapter, StreamingClientServerAdapter } from './server'
import { Client, RemotePlayer, PlayerStatus } from '../components'
import { Cache} from "../util/cache";
import * as WebSocket from 'ws'

interface WSRequest {
    type: string
    payload?: any
}

export class WSClientServer extends StreamingClientServerAdapter {
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
                            this.emit("players", client.send)
                            break;
                        case "playerStatus":
                            this.emit("playerStatus", obj.payload.id, client.send, obj.payload.queueLimit)
                            break;
                        case "subscribe":
                            this.emit("subscribe", )
                    }
                } catch (e) {
                    console.error(e)
                }
            }).addListener("error", (err) => {
                console.error(err)
            })
        })
    }
}

export class WSPlayerServer extends PlayerServerAdapter {
    constructor(port: number){
        super()
    }
}