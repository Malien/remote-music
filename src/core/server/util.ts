import { ClientServer, StreamingClientServer, PlayerServer } from './server'
import { ServerTuple, ServerType } from '../../shared/preferences'
import { RemotePlayer } from '../../shared/components'
import { Cache } from '../util/cache'
import { WSClientServerAdapter, WSPlayerServerAdapter } from './ws'

interface ServerPair {client: ClientServer, player: PlayerServer}

export function interconnectFrom(conf: ServerTuple): ServerPair {
    let client: ClientServer
    let player: PlayerServer
    let cache = new Cache<RemotePlayer>()
    switch (conf.client.type){
        case ServerType.ws:
            let adapter = new WSClientServerAdapter(conf.client.port)
            client = new StreamingClientServer(cache, adapter)
            break;
        default:
            throw new Error("invalid preferences object")
    }
    switch (conf.player.type){
        case ServerType.ws:
            let adapter = new WSPlayerServerAdapter(conf.player.port)
            player = new PlayerServer(cache, adapter)
            break;
        default:
            throw new Error("invalid preferences object")
    }
    return { client, player }
}