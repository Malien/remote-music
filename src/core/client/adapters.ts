import { Transferable, PlayerStatusChange, PlayerStatus } from "../../shared/components";
import { EventEmitter } from "events";
import * as WebSocket from "ws";
import { on } from "cluster";

export interface Adapter {
    on(event: string | symbol, listener: (...args: any[])=>void):this
    off(event: string | symbol, listener: (...args: any[])=>void):this
    emit(event: string | symbol, ...args: any[]):boolean
    send(msg: Transferable, cb?:(...args:any[])=>void):void
}

export interface UpdaterAdapter extends Adapter {
    on(event: "register",       listener: (id: string, interval: number)=>void):this
    on(event: "unregister",     listener: ()=>void):this
    on(event: "ping",           listener: ()=>void):this
    // on(event: "close",          listener: ()=>void):this
    on(event: "open",          listener: ()=>void):this
    on(event: "statusChange",   listener: (change: PlayerStatusChange)=>void):this
    
    off(event: "register",      listener: (id: string, interval: number)=>void):this
    off(event: "unregister",    listener: ()=>void):this
    off(event: "ping",          listener: ()=>void):this
    // off(event: "close",         listener: ()=>void):this
    off(event: "open",         listener: ()=>void):this
    off(event: "statusChange",  listener: (change: PlayerStatusChange)=>void):this
    
    emit(event: "register",     id: string, interval: number):boolean
    emit(event: "unregister"    ):boolean
    emit(event: "ping"          ):boolean
    // emit(event: "close",        ):boolean
    emit(event: "open",        ):boolean
    emit(event: "statusChange", change: PlayerStatusChange):boolean
}

export interface ListenerAdapter extends Adapter {
    on(event: "players",        listener: (players: {string:string}[])=>void):this
    on(event: "playerStatus",   listener: (id: string, name: string, status: PlayerStatus)=>void):this
    
    off(event: "players",       listener: (players: {string:string}[])=>void):this
    off(event: "playerStatus",  listener: (id: string, name: string, status: PlayerStatus)=>void):this
    
    emit(event: "players",      players: {string:string}[]):boolean
    emit(event: "playerStatus", id: string, name: string, status: PlayerStatus):boolean
}

export interface StreamingListenerAdapter extends ListenerAdapter {
    on(event: "players",                listener: (players: {string:string}[])=>void):this
    on(event: "playerStatus",           listener: (id: string, name: string, status: PlayerStatus)=>void):this
    on(event: "subscription",           listener: (id: string, name: string, status: PlayerStatus)=>void):this
    on(event: "subscriptionStatus",     listener: (id: string, subscribed: boolean)=>void):this
    on(event: "subscriptions",          listener: (subscriptions: string[])=>void):this
    on(event: "close",                  listener: ()=>void):this
    on(event: "open",                  listener: ()=>void):this
    on(event: string | symbol,          listener: (...args: any[])=>void):this
    
    off(event: "players",               listener: (players: {string:string}[])=>void):this
    off(event: "playerStatus",          listener: (id: string, name: string, status: PlayerStatus)=>void):this
    off(event: "subscription",          listener: (id: string, name: string, status: PlayerStatus)=>void):this
    off(event: "subscriptionStatus",    listener: (id: string, subscribed: boolean)=>void):this
    off(event: "subscriptions",         listener: (subscriptions: string[])=>void):this
    off(event: "close",                 listener: ()=>void):this
    off(event: "open",                 listener: ()=>void):this
    off(event: string | symbol,         listener: (...args: any[])=>void):this
    
    emit(event: "players",              players: {string:string}[]):boolean
    emit(event: "playerStatus",         id: string, name: string, status: PlayerStatus):boolean
    emit(event: "subscription",         id: string, name: string, status: PlayerStatus):boolean
    emit(event: "subscriptionStatus",   id: string, subscribed: boolean):boolean
    emit(event: "subscriptions",        subscriptions: string[]):boolean
    emit(event: "close",                ):boolean
    emit(event: "open",                ):boolean
    emit(event: string | symbol,     ...args: any[]):boolean
}
