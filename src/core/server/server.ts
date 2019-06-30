import { Song, PlayerStatus, PlayerStatusChange } from "../components"
import { EventEmitter } from "events";
import { on, addListener, removeListener } from "cluster";

type Sender = (msg: any)=>void
type CSender = (msg: any, callback: (...args: any[])=>any)=>void
type IDSetter = (id: string)=>void

export declare abstract class PlayerServerAdapter extends EventEmitter {
    on(event: "pong", listener: (id: string, status: PlayerStatus)=>void):this
    on(event: "heartbeat", listener: (id: string, status: PlayerStatus)=>void):this
    on(event: "register", listener: (name: string, connection: Sender | CSender, idSetter: IDSetter)=>void):this
    on(event: "unregister", listener: (id: string)=>void):this
    on(event: "statusChange", listener: (id: string, statusChange: PlayerStatusChange)=>void):this
    on(event: "close", listener: (id: string)=>void):this
    on(event: string | symbol, listener: (...args: any[])=>void):this
    send(id: string, message: any):void
}

export declare abstract class ClientServerAdapter extends EventEmitter {
    on(event: "players", listener: (sender: Sender)=>void):this
    on(event: "playerStatus", listener: (id: string, sender: Sender)=>void):this
    on(event: "statusChange", listener: (id: string, statusChange: PlayerStatusChange)=>void):this
    on(event: "queueUp", listener: (id: string, position: number, queue: Song[])=>void):this
    on(event: string | symbol, listener: (...args: any[])=>void):this
    
    off(event: "players", listener: (sender: Sender)=>void):this
    off(event: "playerStatus", listener: (id: string, sender: Sender)=>void):this
    off(event: "statusChange", listener: (id: string, statusChange: PlayerStatusChange)=>void):this
    off(event: "queueUp", listener: (id: string, position: number, queue: Song[])=>void):this
    off(event: string | symbol, listener: (...args: any[])=>void):this
    
    addListener(event: "players", listener: (sender: Sender)=>void):this
    addListener(event: "playerStatus", listener: (id: string, sender: Sender)=>void):this
    addListener(event: "statusChange", listener: (id: string, statusChange: PlayerStatusChange)=>void):this
    addListener(event: "queueUp", listener: (id: string, position: number, queue: Song[])=>void):this
    addListener(event: string | symbol, listener: (...args: any[])=>void):this
    
    removeListener(event: "players", listener: (sender: Sender)=>void):this
    removeListener(event: "playerStatus", listener: (id: string, sender: Sender)=>void):this
    removeListener(event: "statusChange", listener: (id: string, statusChange: PlayerStatusChange)=>void):this
    removeListener(event: "queueUp", listener: (id: string, position: number, queue: Song[])=>void):this
    removeListener(event: string | symbol, listener: (...args: any[])=>void):this

    emit(event: "players", sender: Sender):boolean
    emit(event: "playerStatus", id: string, sender: Sender):boolean
    emit(event: "statusChange", id: string, statusChange: PlayerStatusChange):boolean
    emit(event: "queueUp", id: string, position: number, queue: Song):boolean
    emit(event: string | symbol, ...args: any):boolean
}

export declare abstract class StreamingClientServerAdapter extends ClientServerAdapter {
    on(event: "players", listener: (sender: Sender)=>void):this
    on(event: "playerStatus", listener: (id: string, sender: Sender, queueLimit?: number)=>void):this
    on(event: "statusChange", listener: (id: string, statusChange: PlayerStatusChange)=>void):this
    on(event: "queueUp", listener: (id: string, position: number, queue: Song[])=>void):this
    on(event: "subscribe", listener: (id: string, sender: Sender | CSender, queueLimit?: number)=>void):this
    on(event: "unsubscribe", listener: (id: string, sender: Sender | CSender)=>void):this
    on(event: "subscriptionStatus", listener: (sender: Sender | CSender)=>void):this
    on(event: "subscriptions", listener: (sender: Sender | CSender)=>void):this
    on(event: string | symbol, listener: (...args: any[])=>void):this
    
    off(event: "players", listener: (sender: Sender)=>void):this
    off(event: "playerStatus", listener: (id: string, sender: Sender, queueLimit?: number)=>void):this
    off(event: "statusChange", listener: (id: string, statusChange: PlayerStatusChange)=>void):this
    off(event: "queueUp", listener: (id: string, position: number, queue: Song[])=>void):this
    off(event: "subscribe", listener: (id: string, sender: Sender | CSender, queueLimit?: number)=>void):this
    off(event: "unsubscribe", listener: (id: string, sender: Sender | CSender)=>void):this
    off(event: "subscriptionStatus", listener: (sender: Sender | CSender)=>void):this
    off(event: "subscriptions", listener: (sender: Sender | CSender)=>void):this
    off(event: string | symbol, listener: (...args: any[])=>void):this

    addListener(event: "players", listener: (sender: Sender)=>void):this
    addListener(event: "playerStatus", listener: (id: string, sender: Sender, queueLimit?: number)=>void):this
    addListener(event: "statusChange", listener: (id: string, statusChange: PlayerStatusChange)=>void):this
    addListener(event: "queueUp", listener: (id: string, position: number, queue: Song[])=>void):this
    addListener(event: "subscribe", listener: (id: string, sender: Sender | CSender, queueLimit?: number)=>void):this
    addListener(event: "unsubscribe", listener: (id: string, sender: Sender | CSender)=>void):this
    addListener(event: "subscriptionStatus", listener: (sender: Sender | CSender)=>void):this
    addListener(event: "subscriptions", listener: (sender: Sender | CSender)=>void):this
    addListener(event: string | symbol, listener: (...args: any[])=>void):this
    
    removeListener(event: "players", listener: (sender: Sender)=>void):this
    removeListener(event: "playerStatus", listener: (id: string, sender: Sender, queueLimit?: number)=>void):this
    removeListener(event: "statusChange", listener: (id: string, statusChange: PlayerStatusChange)=>void):this
    removeListener(event: "queueUp", listener: (id: string, position: number, queue: Song[])=>void):this
    removeListener(event: "subscribe", listener: (id: string, sender: Sender | CSender, queueLimit?: number)=>void):this
    removeListener(event: "unsubscribe", listener: (id: string, sender: Sender | CSender)=>void):this
    removeListener(event: "subscriptionStatus", listener: (sender: Sender | CSender)=>void):this
    removeListener(event: "subscriptions", listener: (sender: Sender | CSender)=>void):this
    removeListener(event: string | symbol, listener: (...args: any[])=>void):this

    emit(event: "players", sender: Sender):boolean
    emit(event: "playerStatus", listener: (id: string, sender: Sender, queueLimit?: number)=>void):this
    emit(event: "statusChange", id: string, statusChange: PlayerStatusChange):boolean
    emit(event: "queueUp", id: string, position: number, queue: Song):boolean
    emit(event: "subscribe", id: string, sender: Sender | CSender, queueLimit?: number):boolean
    emit(event: "unsubscribe", id: string, sender: Sender | CSender):boolean
    emit(event: "subscriptionStatus", sender: Sender | CSender):boolean
    emit(event: "subscriptions", sender: Sender | CSender):boolean
    emit(event: string | symbol, ...args: any):boolean
}

export class PlayerServer {}
export class ClientServer {}

export class StreamingClientServer extends ClientServer {}