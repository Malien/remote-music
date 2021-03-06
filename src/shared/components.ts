import { v1 as uuid } from "uuid"

export type Transferable = string | ArrayBuffer | Buffer | Buffer[]

export interface Sender {
    send(msg: Transferable, callback?: (...args: any) => any): void;
    id?: string;
}

export interface Comparartor<T> {
    compare(o1: T, o2: T): number;
}

export class RemotePlayer {
    public id: string
    public name: string
    public status: PlayerStatus
    public secondChance: boolean = true
    public sender?: Sender
    public constructor({ name, status, sender }: { name?: string; status?: PlayerStatus; sender?: Sender } = {}) {
        this.id = uuid()
        this.name = name || "Unnamed"
        this.status = status || { progress: 0, playing: false, queue: [], current: null, services: {} }
        this.sender = sender
        if (typeof sender != "undefined") {
            sender.id = this.id
        }
    }
}

export class Client {
    public verified: boolean
    public id: string
    public constructor() {
        this.id = uuid()
    }
    // public verify = function(response: Float32Array): boolean {
    //     //TODO: write encryption implementation
    //     this.verified = true
    //     return true
    // }
    // public encode(message: any): any{
    //     return null
    // }
    // public encode64(message: any): string{
    //     return "null"
    // }
}

export enum ServiceAvailability {
    connected = "Connected",
    notSupported = "Not supported",
    notConnected = "Not connected",
    notReachable = "Not reachable"
}
export enum Services {
    apple = "Apple Music",
    spotify = "Spotify",
    local = "Local Machine"
}

export interface AuthTokensBundle {
    token: string;
    ttl: number;
    refreshToken?: string;
}

export enum APIServiceState {
    unauthorized = 0,
    ivalid = 1,
    authorized = 2
}

export interface PlayerStatus {
    current: Song | null;
    progress: number;
    playing: boolean;
    queue: Song[];
    services: { [key: string]: APIServiceState };
}

export interface PlayerStatusChange {
    current?: Song | null;
    progress?: number;
    playing?: boolean;
    queue?: Song[];
}

export interface Song {
    title: string;
    artist: string;
    album: string;
    length: number;
    artwork?: string;
    metadata?: any;
}