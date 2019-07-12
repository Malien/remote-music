let uuid = require('uuid/v1')

export type Transferable = string | ArrayBuffer | Buffer | Buffer[]

export interface Sender {
    send(msg: Transferable, callback?: (...args: any[])=>any):void
    id?:string
}

export interface Comparartor<T>{
    compare(o1:T, o2:T): number
}

export class RemotePlayer {
    id: string
    name: string
    status: PlayerStatus
    secondChance: boolean = true
    sender?: Sender
    constructor({ name, status, sender }: { name?: string; status?: PlayerStatus; sender?: Sender; } = {}){
        this.id = uuid()
        this.name = name || "Unnamed"
        this.status = status || {progress: 0, playing: false, queue: []}
        this.sender = sender
        if (typeof sender != 'undefined') {
            sender.id = this.id
        }
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

export interface PlayerStatus {
    current?: Song
    progress: number
    playing: boolean
    queue: Song[]
}

export interface PlayerStatusChange {
    current?: Song | null
    progress?: number
    playing?: boolean
    queue?: Song[]
}

export interface Song {
    title: string
    artist: string
    album: string
    length: Number
    artwork?: URL | string
    metadata?: any
}