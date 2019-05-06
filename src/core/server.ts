import { RemotePlayer, Client, Change, PlayerState } from "./components";
import { ServerType, ServerConfig } from "./preferences";
import * as WebSocket from 'ws';

export interface PlayerServer {
    players: Map<string, RemotePlayer>
    hook: ServerInterconnect
    registerHook: (interconnect: ServerInterconnect) => void

    getPlayers: () => RemotePlayer[]
    getStats: (id:string) => PlayerState
    send: (id: string, change: Change) => void
}

export interface ClientServer {
    clients: Array<Client>
    hook: ServerInterconnect
    registerHook: (interconnect: ServerInterconnect) => void
}

export class ServerInterconnect {
    client: ClientServer
    player: PlayerServer
    private constructor (client: ClientServer, player: PlayerServer){
        this.client = client
        this.player = player
        this.client.registerHook(this)
        this.player.registerHook(this)
    }
    static initWithServers(client: ClientServer, player: PlayerServer): ServerInterconnect {
        return new ServerInterconnect(client, player)
    }
    static initWithConf(conf: ServerConfig): ServerInterconnect {
        let client: ClientServer
        let player: PlayerServer
        switch (conf.clientType){
            case ServerType.ws:
                client = new WSClientServer(conf.clientPort)
                break;
            default:
                throw new Error("invalid preferences object")
        }
        switch (conf.playerType){
            case ServerType.ws:
                player = new WSPlayerServer(conf.playerPort)
                break;
            default:
                throw new Error("invalid preferences object")
        }
        return new ServerInterconnect(client, player)
    }

    getPlayers(): RemotePlayer[]{
        return this.player.getPlayers()
    }
    getStats(id:string): PlayerState{
        return this.player.getStats(id)
    }
    send(id: string, change: Change): void{
        return this.player.send(id, change)
    }
}

export class WSClient extends Client {
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
    onMessage(ws:WebSocket, message:string){
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
    players: Map<string, RemotePlayer>
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
        let player = new RemotePlayer()
        this.players[player.id] = player
        ws.on('message', (data) => {
            playerServer.onMessage.call(playerServer, this, player, data)
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