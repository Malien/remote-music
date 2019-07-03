import { PlayerServerAdapter, ClientServerAdapter, StreamingClientServerAdapter, Sender } from "./adapters"
import { RemotePlayer } from "../components";
import { Cache } from "../util/cache"

export class PlayerServer {
    protected cache: Cache<RemotePlayer>
    protected adapter: PlayerServerAdapter
    constructor(cache: Cache<RemotePlayer>, adapter: PlayerServerAdapter) {

    }
}
export class ClientServer {
    protected cache: Cache<RemotePlayer>
    protected adapter: ClientServerAdapter
    constructor(cache: Cache<RemotePlayer>, adapter: ClientServerAdapter) {
        adapter.on("players", (sender) => {
            let players = Array.from(this.cache.keys())
            sender.send({type: "players", payload: players})
        }).on("playerStatus", (id, sender, queueLimit=0) => {
            //TODO: queueLimit implementation
            if (cache.has(id)) {
                let player = cache.get(id) as RemotePlayer 
                let status = player.status
                sender.send({type:"playerStatus", payload: {id, status}})
            }
        }).on("statusChange", (id, statusChange) => {
            if (cache.has(id)) {
                let player = cache.get(id) as RemotePlayer
                let status = player.status
                Object.entries(statusChange).forEach(([key, value]) => {
                    status[key] = value
                })
                cache.notify(id)
            }
        }).on("queueUp", (id, position, queue) => {
            if (cache.has(id)) {
                let player = cache.get(id) as RemotePlayer
                player.status.queue.splice(position, 0, ...queue)
                cache.notify(id)
            }
        })
    }
}

export class StreamingClientServer extends ClientServer {
    protected adapter: StreamingClientServerAdapter
    private subscriptions: Map<string, Sender[]>
    constructor(cache: Cache<RemotePlayer>, adapter: StreamingClientServerAdapter) {
        super(cache, adapter)
        this.adapter.on("subscribe", (id, sender, queueLimit) => {
            if (this.subscriptions.has(id)) {
                let senders = this.subscriptions.get(id) as Sender[]
                senders.push(sender)
            } else {
                this.subscriptions.set(id, [sender])
            }
        }).on("unsubscribe", (id, sender) => {
            if (this.subscriptions.has(id)) {
                let senders = this.subscriptions.get(id) as Sender[]
                for (let i=0; i<senders.length; i++) {
                    if (senders[i] == sender) {
                        senders.splice(i,1)
                        break;
                    }
                }
            }
        }).on("subscriptionStatus", (id, sender) => {
            let subscribed = false
            if (this.subscriptions.has(id)) {
                let senders = this.subscriptions.get(id) as Sender[]
                subscribed = senders.includes(sender)
            }
            sender.send({type:"subscriptionStatus", payload: {id, subscribed}})
        }).on("subscriptions", (sender) => {
            let payload:string[] = []
            this.subscriptions.forEach((senders, id) => {
                if (senders.includes(sender)) payload.push(id)
            })
            sender.send({type:"subscriptions", payload})
        }).on("close", (sender) => {
            for (let key in this.subscriptions.keys()) {
                let senders = this.subscriptions.get(key) as Sender[]
                this.subscriptions.set(key, senders.filter((_sender) => {
                    return _sender != sender
                }))
            }
        })
    }
}