import { Song, PlayerStatus, PlayerStatusChange, RemotePlayer } from "../components"
import { EventEmitter } from "events";
import { Cache } from "../util/cache"

interface Sender {
    send(msg: any, callback?: (...args: any[])=>any):void
}

export declare abstract class PlayerServerAdapter extends EventEmitter {
    on(event: "pong",                       listener: (sender: Sender, status: PlayerStatus)=>void):this
    on(event: "heartbeat",                  listener: (sender: Sender, status: PlayerStatus)=>void):this
    on(event: "register",                   listener: (sender: Sender, name: string)=>void):this
    on(event: "unregister",                 listener: (sender: Sender)=>void):this
    on(event: "statusChange",               listener: (sender: Sender, statusChange: PlayerStatusChange)=>void):this
    on(event: "close",                      listener: (sender: Sender)=>void):this
    on(event: string | symbol,              listener: (...args: any[])=>void):this

    off(event: "pong",                      listener: (sender: Sender, status: PlayerStatus)=>void):this
    off(event: "heartbeat",                 listener: (sender: Sender, status: PlayerStatus)=>void):this
    off(event: "register",                  listener: (sender: Sender, name: string)=>void):this
    off(event: "unregister",                listener: (sender: Sender)=>void):this
    off(event: "statusChange",              listener: (sender: Sender, statusChange: PlayerStatusChange)=>void):this
    off(event: "close",                     listener: (sender: Sender)=>void):this
    off(event: string | symbol,             listener: (...args: any[])=>void):this

    addListener(event: "pong",              listener: (sender: Sender, status: PlayerStatus)=>void):this
    addListener(event: "heartbeat",         listener: (sender: Sender, status: PlayerStatus)=>void):this
    addListener(event: "register",          listener: (sender: Sender, name: string)=>void):this
    addListener(event: "unregister",        listener: (sender: Sender)=>void):this
    addListener(event: "statusChange",      listener: (sender: Sender, statusChange: PlayerStatusChange)=>void):this
    addListener(event: "close",             listener: (sender: Sender)=>void):this
    addListener(event: string | symbol,     listener: (...args: any[])=>void):this

    removeListener(event: "pong",           listener: (sender: Sender, status: PlayerStatus)=>void):this
    removeListener(event: "heartbeat",      listener: (sender: Sender, status: PlayerStatus)=>void):this
    removeListener(event: "register",       listener: (name: string, connection: Sender)=>void):this
    removeListener(event: "unregister",     listener: (sender: Sender)=>void):this
    removeListener(event: "statusChange",   listener: (sender: Sender, statusChange: PlayerStatusChange)=>void):this
    removeListener(event: "close",          listener: (sender: Sender)=>void):this
    removeListener(event: string | symbol,  listener: (...args: any[])=>void):this

    emit(event: "pong",                     sender: Sender, status: PlayerStatus):boolean
    emit(event: "heartbeat",                sender: Sender, status: PlayerStatus):boolean
    emit(event: "register",                 sender: Sender, name: string):boolean
    emit(event: "unregister",               sender: Sender):boolean
    emit(event: "statusChange",             sender: Sender, statusChange: PlayerStatusChange):boolean
    emit(event: "close",                    sender: Sender):boolean
    emit(event: string | symbol,         ...args: any[]):boolean
}

export declare abstract class ClientServerAdapter extends EventEmitter {
    on(event: "players",                    listener: (sender: Sender)=>void):this
    on(event: "playerStatus",               listener: (id: string, sender: Sender, queueLimit?: number)=>void):this
    on(event: "statusChange",               listener: (id: string, statusChange: PlayerStatusChange)=>void):this
    on(event: "queueUp",                    listener: (id: string, position: number, queue: Song[])=>void):this
    on(event: string | symbol,              listener: (...args: any[])=>void):this
    
    off(event: "players",                   listener: (sender: Sender)=>void):this
    off(event: "playerStatus",              listener: (id: string, sender: Sender, queueLimit?: number)=>void):this
    off(event: "statusChange",              listener: (id: string, statusChange: PlayerStatusChange)=>void):this
    off(event: "queueUp",                   listener: (id: string, position: number, queue: Song[])=>void):this
    off(event: string | symbol,             listener: (...args: any[])=>void):this
    
    addListener(event: "players",           listener: (sender: Sender)=>void):this
    addListener(event: "playerStatus",      listener: (id: string, sender: Sender, queueLimit?: number)=>void):this
    addListener(event: "statusChange",      listener: (id: string, statusChange: PlayerStatusChange)=>void):this
    addListener(event: "queueUp",           listener: (id: string, position: number, queue: Song[])=>void):this
    addListener(event: string | symbol,     listener: (...args: any[])=>void):this
    
    removeListener(event: "players",        listener: (sender: Sender)=>void):this
    removeListener(event: "playerStatus",   listener: (id: string, sender: Sender, queueLimit?: number)=>void):this
    removeListener(event: "statusChange",   listener: (id: string, statusChange: PlayerStatusChange)=>void):this
    removeListener(event: "queueUp",        listener: (id: string, position: number, queue: Song[])=>void):this
    removeListener(event: string | symbol,  listener: (...args: any[])=>void):this

    emit(event: "players",                  sender: Sender):boolean
    emit(event: "playerStatus",             id: string, sender: Sender, queueLimit?: number):boolean
    emit(event: "statusChange",             id: string, statusChange: PlayerStatusChange):boolean
    emit(event: "queueUp",                  id: string, position: number, queue: Song[]):boolean
    emit(event: string | symbol,         ...args: any):boolean
}

export declare abstract class StreamingClientServerAdapter extends ClientServerAdapter {
    on(event: "players",                        listener: (sender: Sender)=>void):this
    on(event: "playerStatus",                   listener: (id: string, sender: Sender, queueLimit?: number)=>void):this
    on(event: "statusChange",                   listener: (id: string, statusChange: PlayerStatusChange)=>void):this
    on(event: "queueUp",                        listener: (id: string, position: number, queue: Song[])=>void):this
    on(event: "subscribe",                      listener: (id: string, sender: Sender, queueLimit?: number)=>void):this
    on(event: "unsubscribe",                    listener: (id: string, sender: Sender)=>void):this
    on(event: "subscriptionStatus",             listener: (id: string, sender: Sender)=>void):this
    on(event: "subscriptions",                  listener: (sender: Sender)=>void):this
    on(evnet: "close",                          listener: (sender: Sender)=>void):this
    on(event: string | symbol,                  listener: (...args: any[])=>void):this
    
    off(event: "players",                       listener: (sender: Sender)=>void):this
    off(event: "playerStatus",                  listener: (id: string, sender: Sender, queueLimit?: number)=>void):this
    off(event: "statusChange",                  listener: (id: string, statusChange: PlayerStatusChange)=>void):this
    off(event: "queueUp",                       listener: (id: string, position: number, queue: Song[])=>void):this
    off(event: "subscribe",                     listener: (id: string, sender: Sender, queueLimit?: number)=>void):this
    off(event: "unsubscribe",                   listener: (id: string, sender: Sender)=>void):this
    off(event: "subscriptionStatus",            listener: (id: string, sender: Sender)=>void):this
    off(event: "subscriptions",                 listener: (sender: Sender)=>void):this
    off(evnet: "close",                         listener: (sender: Sender)=>void):this
    off(event: string | symbol,                 listener: (...args: any[])=>void):this

    addListener(event: "players",               listener: (sender: Sender)=>void):this
    addListener(event: "playerStatus",          listener: (id: string, sender: Sender, queueLimit?: number)=>void):this
    addListener(event: "statusChange",          listener: (id: string, statusChange: PlayerStatusChange)=>void):this
    addListener(event: "queueUp",               listener: (id: string, position: number, queue: Song[])=>void):this
    addListener(event: "subscribe",             listener: (id: string, sender: Sender, queueLimit?: number)=>void):this
    addListener(event: "unsubscribe",           listener: (id: string, sender: Sender)=>void):this
    addListener(event: "subscriptionStatus",    listener: (id: string, sender: Sender)=>void):this
    addListener(event: "subscriptions",         listener: (sender: Sender)=>void):this
    addListener(evnet: "close",                 listener: (sender: Sender)=>void):this
    addListener(event: string | symbol,         listener: (...args: any[])=>void):this
    
    removeListener(event: "players",            listener: (sender: Sender)=>void):this
    removeListener(event: "playerStatus",       listener: (id: string, sender: Sender, queueLimit?: number)=>void):this
    removeListener(event: "statusChange",       listener: (id: string, statusChange: PlayerStatusChange)=>void):this
    removeListener(event: "queueUp",            listener: (id: string, position: number, queue: Song[])=>void):this
    removeListener(event: "subscribe",          listener: (id: string, sender: Sender, queueLimit?: number)=>void):this
    removeListener(event: "unsubscribe",        listener: (id: string, sender: Sender)=>void):this
    removeListener(event: "subscriptionStatus", listener: (id: string, sender: Sender)=>void):this
    removeListener(event: "subscriptions",      listener: (sender: Sender)=>void):this
    removeListener(evnet: "close",              listener: (sender: Sender)=>void):this
    removeListener(event: string | symbol,      listener: (...args: any[])=>void):this

    emit(event: "players",                      sender: Sender):boolean
    emit(event: "playerStatus",                 id: string, sender: Sender, queueLimit?: number):boolean
    emit(event: "statusChange",                 id: string, statusChange: PlayerStatusChange):boolean
    emit(event: "queueUp",                      id: string, position: number, queue: Song[]):boolean
    emit(event: "subscribe",                    id: string, sender: Sender, queueLimit?: number):boolean
    emit(event: "unsubscribe",                  id: string, sender: Sender):boolean
    emit(event: "subscriptionStatus",           id: string, sender: Sender):boolean
    emit(event: "subscriptions",                sender: Sender):boolean
    emit(event: "close",                        sender: Sender):boolean
    emit(event: string | symbol,             ...args: any):boolean
}

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