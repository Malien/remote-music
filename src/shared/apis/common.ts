// import { EventEmitter } from "events"

export enum ServiceAvailability{
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
    refreshToken: string;
}

// interface ServiceEmitterProtocol {
//     on(event: "spotify-connect", listener: (token: string, expiresIn: number, refreshable: boolean) => void): this;
//     off(event: "spotify-connect", listener: (token: string, expiresIn: number, refreshable: boolean) => void): this;
//     addListener(event: "spotify-connect", listener: (token: string, expiresIn: number, refreshable: boolean) => void): this;
//     removeListener(event: "spotify-connect", listener: (token: string, expiresIn: number, refreshable: boolean) => void): this;
//     emit(event: "spotify-connect", token: string, expiresIn: number, refreshable: boolean): boolean;
// }

// export const ServiceEmitter: ServiceEmitterProtocol = new EventEmitter()