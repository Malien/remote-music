import { PlayerServerAdapter, ClientServerAdapter, StreamingClientServerAdapter } from "./adapters"
import { RemotePlayer, Sender } from "../components";
import { Cache } from "../util/cache"

export class PlayerServer {
    protected cache: Cache<RemotePlayer>
    protected adapter: PlayerServerAdapter
    protected lookuptable: Map<string, Sender> = new Map<string, Sender>()
    constructor(cache: Cache<RemotePlayer>, adapter: PlayerServerAdapter) {
        this.cache = cache
        this.adapter = adapter
        adapter.on("pong", (sender, status) => {
            if (typeof sender.id == 'string' && cache.has(sender.id)) {
                let player = cache.get(sender.id) as RemotePlayer
                player.status = status
                player.secondChance = true
                cache.set(sender.id, player)
            }
        }).on("heartbeat", (sender, status) => {
            if (typeof sender.id == 'string' && cache.has(sender.id)) {
                let player = cache.get(sender.id) as RemotePlayer
                player.status = status
                player.secondChance = true
                cache.set(sender.id, player)
            }
        }).on("register", (sender, name) => {
            let player = new RemotePlayer({ name, sender })
            this.lookuptable.set(player.id, sender)
            this.cache.set(player.id, player)
            let payload = {id: player.id, interval: this.cache.defaultTTL/2}
            sender.send({type: "register", payload})
        }).on("statusChange", (sender, statusChnage) => {
            if (typeof sender.id == 'string' && cache.has(sender.id)) {
                let player = cache.get(sender.id) as RemotePlayer
                Object.entries(statusChnage).forEach(([key, value]) => {
                    if (typeof value != 'undefined') {
                        player.status[key] = value
                    }
                })
                player.secondChance = true
                cache.set(sender.id, player)
            }
        }).on("unregister", (sender) => {
            if (typeof sender.id == 'string') {
                if (this.lookuptable.has(sender.id)) this.lookuptable.delete(sender.id)
                if (this.cache.has(sender.id)) this.cache.invalidate(sender.id)
                sender.id = undefined
            }
        })
        cache.changeEmitter.on("pre-invalidation", (key) => {
            let player = cache.get(key) as RemotePlayer
            if (player.secondChance) {
                let sender = player.sender as Sender
                sender.send({type: "ping"})
            }
            cache.set(key, player)
        })
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
        cache.changeEmitter.on("change", (key, value) => {
            if (this.subscriptions.has(key)) {
                let senders = this.subscriptions.get(key) as Sender[]
                senders.forEach((sender) => {
                    sender.send({type: "subscription", payload: value})
                })
                if (value == null) this.subscriptions.delete(key)
            }
        })
    }
}