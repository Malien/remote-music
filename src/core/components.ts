let uuid = require('uuid/v1')

export interface Comparartor<T>{
    compare(o1:T, o2:T): number
}

export class RemotePlayer {
    id: string
    name: string
    constructor(){
        this.id = uuid()
    }
}

export class Client {
    verified: boolean
    id: string
    constructor(){
        this.id = uuid()
    }
    verify = function(response: Float32Array): boolean {
        //TODO: write encryption implementation
        this.verified = true
        return true
    }
    encode(message: any): any{
        return null
    }
    encode64(message: any): string{
        return "null"
    }
}

export interface Change {
    progress?: number
    qeuue?: Song[]
    current?: Song
    action?: Action
}

export interface Song {
    title: string
    artist: string
    album: string
    length: Number
    artwork?: URL | string
    metadata?: any
}

export enum Action {
    Play,
    Pause,
    Next,
    Prev,
}

export class PlayerState{
    //TODO: write satate implementation
}