import { RemotePlayer, Client, Change, PlayerState } from "./components";
import { Preferences, ServerType, ServerConfig } from "./preferences";
import * as WebSocket from 'ws';

export interface PlayerServer {
    players: Array<RemotePlayer>
    hook: ServerInterconnect
    registerHook: (interconnect: ServerInterconnect) => void

    getPlayers(): Promise<RemotePlayer[]>
    getStats(id:string): Promise<PlayerState>
    send(id: string, change: Change): Promise<void>
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
                client = new WSCientServer(conf.clientPort)
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

    getPlayers(): Promise<RemotePlayer[]>{
        return this.player.getPlayers()
    }
    getStats(id:string): Promise<PlayerState>{
        return this.player.getStats(id)
    }
    send(id: string, change: Change): Promise<void>{
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

export class WSCientServer implements ClientServer {
    clients: WSClient[];
    hook: ServerInterconnect
    private wsServer: WebSocket.Server
    constructor(port:number){
        this.wsServer = new WebSocket.Server({
            port: port
        })
        this.wsServer.on('connection', this.onConnection)
    }
    registerHook(hook: ServerInterconnect) {
        this.hook = hook
    }

    private onConnection(ws: WebSocket){
        ws.send("Hello")
        ws.on('message', (data) => {
            this.onMessage(ws, new WSClient(ws), data)
        })
    }
    private onMessage(ws:WebSocket, client:Client, message:WebSocket.Data){
        //FIXME: on any message server crashes
        let strmsg = message.toString().split("[(),]")
        if (strmsg[0].trim() == "getPlayers"){
            this.hook.getPlayers().then((val) => {ws.send(val)})
        } else if (strmsg[0].trim() == "getStats") {
            this.hook.getStats(strmsg[1].trim()).then((val) => {ws.send(JSON.stringify(val))})
        } else if (strmsg[0].trim() == "send"){
            this.hook.send(strmsg[1].trim(), JSON.parse(strmsg[2].trim()) as Change)
        }
    }
}

export class WSPlayerServer implements PlayerServer {
    players: Array<RemotePlayer>
    hook: ServerInterconnect
    registerHook(hook: ServerInterconnect){
        this.hook = hook
    }
    constructor(port: number){
        //TODO: Implement this
    }

    getPlayers(): Promise<RemotePlayer[]> {
        //TODO: Implement this
        return new Promise(() => {})
    }
    getStats(id:string): Promise<PlayerState> {
        //TODO: Implement this
        return new Promise(() => {})
    }
    send(id: string, change: Change): Promise<void> {
        return new Promise(() => {})
    }
}