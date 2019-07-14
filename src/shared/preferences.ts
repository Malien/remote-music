import * as fs from 'fs';
import { Comparartor } from './components';
let currentVersion = require('./../../package.json').version as string

export interface PrefConstructorArgs {
    client?: ClientTuple,
    server?: ServerTuple
}

export class Preferences {
    version: string
    client: ClientTuple
    server: ServerTuple
    constructor({ client, server }: PrefConstructorArgs = {}){
        if (typeof(server) != 'undefined'){
            this.server = server as ServerTuple
        }
        if (typeof(client) != 'undefined'){
            this.client = client as ClientTuple
        }
        this.version = currentVersion
    }
    read(path: string) {
        let data = fs.readFileSync(path).toString()
        let parsedData = JSON.parse(data)
        
        this.server = parsedData["server"]
        this.client = parsedData["client"]
        this.version = parsedData["version"]
    }
    save(path: string) {
        let str = JSON.stringify(this)
        fs.writeFileSync(path, str)
    }
}

export interface ClientTuple {
    client: ClientConfig
    player?: ClientConfig
}

export interface ClientConfig {
    type: ServerType
    port: number
    address: string
}

export interface ServerTuple {
    client: ServerConfig
    player: ServerConfig
}

export interface ServerConfig {
    type: ServerType
    port: number
}

export enum ServerType {
    ws,
    //NOTE: none of the below have api implementation, nor do they have api spec
    http,
    https,
    tcp
}

export let versionComparator = new class implements Comparartor<string>{
    compare(o1:string, o2:string): number {
        let o1p = o1.split(".")
        let o2p = o2.split(".")
        if (o1p[0] > o2p[0]) return 1
        if (o1p[0] < o2p[0]) return -1
        if (o1p[1] > o2p[1]) return 1
        if (o1p[1] < o2p[1]) return -1
        if (o1p[2] > o2p[2]) return 1
        if (o1p[2] < o2p[2]) return -1
        return 0
    }
}()

//TODO: provide more sophisticated preference merge algorithm
export function merge(data:any): Preferences{
    let version = data.version
    if (versionComparator.compare(version, currentVersion) == 0) {
        return data as Preferences
    }
    if (versionComparator.compare(version, "1.0.1") <= 0){
        return new Preferences({ 
            server: {
                client: {
                    type: data.server.clientType,
                    port: data.server.clientPort
                },
                player: {
                    type: data.server.playerType,
                    port: data.server.playerPort
                }
            }
            })
    }
    throw new Error("Can't merge preferences")
}

export function read(path: string): Preferences {
    let data = fs.readFileSync(path).toString()
    let parsedData = JSON.parse(data)
    if (parsedData.version != currentVersion) {
        let merged = merge(parsedData)
        merged.save(path)
        return merged
    }
    return parsedData as Preferences
}

export function canBeMerged(path: string): boolean {
    if (!fs.existsSync(path)) return false
    let data = fs.readFileSync(path).toString()
    let parsed = JSON.parse(data)
    if (versionComparator.compare(parsed.version, "1.0.0") < 0) return false
    return true
}

var preferencePath = process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + "/.local/share")
preferencePath += "/remote-music-preference.json"
export const path = preferencePath
    
export function save(pref: Preferences, path: string){
    pref.save(path)
}

export default {Preferences, ServerType, versionComparator, merge, read, canBeMerged, path, save}