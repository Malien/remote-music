import { ClientServer, StreamingClientServer, PlayerServer } from "./server"
import { ServerTuple, ServerType } from "../../shared/preferences"
import { RemotePlayer } from "../../shared/components"
import { Cache } from "../util/cache"
import { WSClientServerAdapter, WSPlayerServerAdapter } from "./ws"

export { ClientServerAdapter, StreamingClientServerAdapter, PlayerServerAdapter } from "./adapters"
export const ws = { WSClientServerAdapter, WSPlayerServerAdapter }
export { ClientServer, StreamingClientServer, PlayerServer } from "./server"

export function interconnectFrom(conf: ServerTuple): [ClientServer, PlayerServer] {
    let client: ClientServer
    let player: PlayerServer
    let cache = new Cache<RemotePlayer>()
    switch (conf.client.type) {
        case ServerType.ws:
            client = new StreamingClientServer(cache, new WSClientServerAdapter(conf.client.port))
            break
        default:
            throw new Error("invalid preferences object")
    }
    switch (conf.player.type) {
        case ServerType.ws:
            player = new PlayerServer(cache, new WSPlayerServerAdapter(conf.player.port))
            break
        default:
            throw new Error("invalid preferences object")
    }
    return [client, player]
}