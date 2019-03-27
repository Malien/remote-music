let uuid = require('uuid/v1')

export class RemotePlayer {
    id: string
    name: string
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

export class Change {
    scrub: number | undefined
    qeuue: Queue | undefined
    action: Action | undefined
    constructor(scrub: number | undefined, queue: Queue | undefined, action: Action | undefined){
        this.scrub = scrub
        this.qeuue = queue
        this.action = action
    }
}

export class Queue {
    songs: Song[]
    constructor(songs: Song[]){
        this.songs = songs
    }
}

export class Song {
    songURL: URL | string
    constructor(songURL: URL | string){
        this.songURL = songURL
    }
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