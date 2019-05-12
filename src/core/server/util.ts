import { ClientServer, PlayerServer, ServerInterconnect } from './server'
import { ServerTuple, ServerType } from '../preferences'
import { WSClientServer, WSPlayerServer } from './ws'

export function interconnectFrom(conf: ServerTuple): ServerInterconnect {
    let client: ClientServer
    let player: PlayerServer
    switch (conf.client.type){
        case ServerType.ws:
            client = new WSClientServer(conf.client.port)
            break;
        default:
            throw new Error("invalid preferences object")
    }
    switch (conf.player.type){
        case ServerType.ws:
            player = new WSPlayerServer(conf.player.port)
            break;
        default:
            throw new Error("invalid preferences object")
    }
    return new ServerInterconnect(client, player)
}