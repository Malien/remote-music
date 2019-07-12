import { EventEmitter } from "events";

interface ApplicationEventEmitter {
    on(event: string | symbol, listener: (...args: any[])=>void):this
    off(event: string | symbol, listener: (...args: any[])=>void):this
    addListener(event: string | symbol, listener: (...args: any[])=>void):this
    removeListener(event: string | symbol, listener: (...args: any[])=>void):this
    emit(event: string | symbol, ...args: any[]):boolean
}

export let MainEventEmitter:ApplicationEventEmitter = new EventEmitter()