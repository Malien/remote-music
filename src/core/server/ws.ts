import { PlayerServer, ClientServer, ServerInterconnect } from './server'
import { Client, RemotePlayer, Change, PlayerState } from '../components'
import * as WebSocket from 'ws'

export interface WebSocketed {
    ws: WebSocket
}

export class WSClient extends Client implements WebSocketed {
    ws: WebSocket
    constructor(ws: WebSocket){
        super()
        this.ws = ws
    }
}

export class WSPlayer extends RemotePlayer implements WebSocketed {
    ws: WebSocket
    constructor(ws: WebSocket){
        super()
        this.ws = ws
    }
}

export class WSClientServer implements ClientServer {
    clients: WSClient[];
    hook: ServerInterconnect
    private server: WebSocket.Server
    constructor(port:number){
        this.server = new WebSocket.Server({
            port: port
        })
        this.server.on('connection', this.onConnection.bind(this))
    }
    private onConnection(ws: WebSocket){
        ws.send("Hello")
        let clientServer = this
        ws.on('message', function (this, data) {
            clientServer.onMessage.call(clientServer, this, data)
        })
        ws.on('close', (code, reason) => {
            console.log("[server.ts]: ", code, reason)
        })
    }
    onMessage(ws:WebSocket, data:WebSocket.Data){
        let message = data.toString().trim();
        let strmsg = message.split(/[(),]/)
        if (strmsg[0].trim() == "getPlayers") {
            let players = this.hook.getPlayers()
            ws.send(players)
        } else if (strmsg[0].trim() == "getStats") {
            let state = this.hook.getStats(strmsg[1].trim())
            ws.send(JSON.stringify(state))
        } else if (strmsg[0].trim() == "send") {
            this.hook.send(strmsg[1].trim(), JSON.parse(strmsg[2].trim()) as Change)
        }
    }

    registerHook(hook: ServerInterconnect) {
        this.hook = hook
    }
}

export class WSPlayerServer implements PlayerServer {
    players: Map<string, WSPlayer> = new Map()
    hook: ServerInterconnect
    private server: WebSocket.Server
    constructor(port: number){
        this.server = new WebSocket.Server({
            port: port
        })
        this.server.on('connection', this.onConnection.bind(this))
    }
    private onConnection(ws:WebSocket){
        let playerServer = this
        let player = new WSPlayer(ws)
        this.players.set(player.id, player)
        ws.on('message', (data) => {
            playerServer.onMessage.call(playerServer, this, player, data)
        })
        ws.on('close', (code, reason) => {
            playerServer.players.delete(player.id)
        })
    }
    private onMessage(ws:WebSocket, player:RemotePlayer, data:string){
        
    }

    getPlayers(): RemotePlayer[] {
        //TODO: Implement this
        return [new RemotePlayer(), new RemotePlayer()]
    }
    getStats(id:string): PlayerState {
        //TODO: Implement this
        return new PlayerState()
    }
    send(id: string, change: Change): void {
        //TODO: You guessed, implement this
    }
    registerHook(hook: ServerInterconnect){
        this.hook = hook
    }
}