import { RemotePlayer, Client, Change, PlayerState } from "../components";

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
    constructor (client: ClientServer, player: PlayerServer){
        this.client = client
        this.player = player
        this.client.registerHook(this)
        this.player.registerHook(this)
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