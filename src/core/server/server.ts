import { PlayerServerAdapter, ClientServerAdapter, StreamingClientServerAdapter } from "./adapters"
import { RemotePlayer, Sender } from "../../shared/components"
import { Cache } from "../util/cache"
import { getPassword, setPassword, deletePassword } from "keytar"
import { PlayerServerResponse } from "../../shared/comms"

function sendObj(this: Sender, msg: Record<string, any>, callback?: (...args: any[]) => any): void {
    this.send(JSON.stringify(msg), callback)
}

export class PlayerServer {
    protected cache: Cache<RemotePlayer>
    protected adapter: PlayerServerAdapter
    protected lookuptable: Map<string, Sender> = new Map<string, Sender>()
    public constructor(cache: Cache<RemotePlayer>, adapter: PlayerServerAdapter) {
        this.cache = cache
        this.adapter = adapter
        adapter.on("pong", (sender, status) => {
            if (typeof sender.id == "string" && cache.has(sender.id)) {
                let player = cache.get(sender.id) as RemotePlayer
                player.status = status
                player.secondChance = true
                cache.set(sender.id, player)
            }
        }).on("heartbeat", (sender, status) => {
            if (typeof sender.id == "string" && cache.has(sender.id)) {
                let player = cache.get(sender.id) as RemotePlayer
                player.status = status
                player.secondChance = true
                cache.set(sender.id, player)
            }
        }).on("register", (sender, name) => {
            let player = new RemotePlayer({ name, sender })
            this.lookuptable.set(player.id, sender)
            this.cache.set(player.id, player)
            let payload = { id: player.id, interval: this.cache.defaultTTL / 2 }
            sendObj.call(sender, { type: "register", payload })
        }).on("statusChange", (sender, statusChnage) => {
            if (typeof sender.id == "string" && cache.has(sender.id)) {
                let player = cache.get(sender.id) as RemotePlayer
                Object.entries(statusChnage).forEach(([key, value]) => {
                    if (typeof value != "undefined") {
                        player.status[key] = value
                    }
                })
                player.secondChance = true
                cache.set(sender.id, player)
            }
        }).on("unregister", (sender) => {
            if (typeof sender.id == "string") {
                if (this.lookuptable.has(sender.id)) this.lookuptable.delete(sender.id)
                if (this.cache.has(sender.id)) this.cache.invalidate(sender.id)
                sender.id = undefined
            }
        })
        cache.changeEmitter.on("pre-invalidation", (key) => {
            let player = cache.get(key) as RemotePlayer
            let sender = player.sender as Sender
            if (player.secondChance) {
                player.secondChance = false
                cache.set(key, player, cache.defaultTTL / 2)
                sendObj.call(sender, { type: "ping" })
            } else {
                sendObj.call(sender, { type: "unregister" })
            }
        })
        cache.changeEmitter.on("token-transfer", (service: string, token: string, ids: string[]) => {
            ids.map(this.lookuptable.get).forEach(sender => {
                if (sender) {
                    let msg: PlayerServerResponse = {
                        type: "tokenTransfer",
                        payload: { service, token }
                    }
                    sender.send(JSON.stringify(msg))
                }
            })
        })
    }
}
export class ClientServer {
    protected cache: Cache<RemotePlayer>
    protected adapter: ClientServerAdapter
    public constructor(cache: Cache<RemotePlayer>, adapter: ClientServerAdapter) {
        let _this = this
        adapter.on("players", (sender) => {
            let payload = {}
            let keys = Array.from(_this.cache.keys())
            for (let index in keys) {
                payload[keys[index]] = (_this.cache.get(keys[index]) as RemotePlayer).name
            }
            sendObj.call(sender, { type: "players", payload })
        }).on("playerStatus", (id, sender, queueLimit = 0) => {
            //TODO: queueLimit implementation
            if (cache.has(id)) {
                let player = cache.get(id) as RemotePlayer
                let status = player.status
                let name = player.name
                sendObj.call(sender, { type: "playerStatus", payload: { id, name, status } })
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
        }).on("serviceToken", (service, token) => {
            if (token) {
                setPassword("remote-music", service, token)
            } else {
                deletePassword("remote-music", service)
            }
        }).on("tokenTransfer", (service, ids) => {
            getPassword("remote-music", service).then(token => {
                cache.changeEmitter.emit("token-transfer", service, token, ids)
            })
        })
    }
}

export class StreamingClientServer extends ClientServer {
    protected adapter: StreamingClientServerAdapter
    private subscriptions: Map<string, Sender[]> = new Map<string, Sender[]>()
    public constructor(cache: Cache<RemotePlayer>, adapter: StreamingClientServerAdapter) {
        super(cache, adapter)
        this.adapter = adapter
        this.cache = cache
        let _this = this
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
                for (let i = 0; i < senders.length; i++) {
                    if (senders[i] == sender) {
                        senders.splice(i, 1)
                        break
                    }
                }
            }
        }).on("subscriptionStatus", (id, sender) => {
            let subscribed = false
            if (this.subscriptions.has(id)) {
                let senders = this.subscriptions.get(id) as Sender[]
                subscribed = senders.includes(sender)
            }
            sendObj.call(sender, { type: "subscriptionStatus", payload: { id, subscribed } })
        }).on("subscriptions", (sender) => {
            let payload: string[] = []
            this.subscriptions.forEach((senders, id) => {
                if (senders.includes(sender)) payload.push(id)
            })
            sendObj.call(sender, { type: "subscriptions", payload })
        }).on("close", (sender) => {
            for (let key in this.subscriptions.keys()) {
                let senders = this.subscriptions.get(key) as Sender[]
                this.subscriptions.set(key, senders.filter((_sender) => {
                    return _sender != sender
                }))
            }
        })
        cache.changeEmitter.on("change", (key, value) => {
            if (_this.subscriptions.has(key)) {
                let senders = _this.subscriptions.get(key) as Sender[]
                senders.forEach((sender) => {
                    sendObj.call(sender, { type: "subscription", payload: value })
                })
                if (value == null) _this.subscriptions.delete(key)
            }
        })
    }
}