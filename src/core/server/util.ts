import { ClientServer, PlayerServer } from './server'
import { ServerTuple, ServerType } from '../preferences'
import { WSClientServer, WSPlayerServer } from './ws'

interface ServerPair {client: ClientServer, player: PlayerServer}

export function interconnectFrom(conf: ServerTuple): ServerPair {
    let client: ClientServer
    let player: PlayerServer
    //TODO: construct servers properly
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
    return { client, player }
}