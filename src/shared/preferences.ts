import { writeFile, readFileSync, readFile, existsSync, exists, mkdir } from "fs"
import { Comparartor } from "./components"
let currentVersion = require("./../../package.json").version as string

export interface PrefConstructorArgs {
    client?: ClientTuple;
    server?: ServerTuple;
}

var baseDirPath = process.env.APPDATA || (process.platform == "darwin" ? process.env.HOME + "/Library/Application Support" : process.env.HOME + "/.local/share")
baseDirPath += "/remote-music"
export const path = baseDirPath + "/remote-music-preference.json"

export class Preferences {
    public version: string
    public client?: ClientTuple
    public server?: ServerTuple
    public constructor(args: PrefConstructorArgs = {}){
        Object.assign(this, args)
        this.version = currentVersion
    }
    public async read(path: string) {
        return new Promise<Preferences>((resolve, reject) => {
            readFile(path, (err, data) => {
                if (err) reject(err)
                let parsedData = JSON.parse(data.toString())
                Object.assign(this, parsedData)
                resolve(this)
            })
        })
    }
    public save(path: string) {
        let str = JSON.stringify(this)
        exists(baseDirPath, exists => {
            if (exists) {
                writeFile(path, str, err => {if (err) console.error(err)})
            } else mkdir(baseDirPath, () => {
                writeFile(path, str, err => {if (err) console.error(err)})
            })
        })
    }
}

export interface ClientTuple {
    client: ClientConfig;
    player?: PlayerConfig;
}

export interface PlayerConfig extends ClientConfig {
    name: string;
}

export interface ClientConfig {
    type: ServerType;
    port: number;
    address: string;
}

export interface ServerTuple {
    client: ServerConfig;
    player: ServerConfig;
}

export interface ServerConfig {
    type: ServerType;
    port: number;
}

export enum ServerType {
    ws,
    //NOTE: none of the below have api implementation, nor do they have api spec
    http,
    https,
    tcp
}

export let versionComparator = new class implements Comparartor<string>{
    public compare(o1: string, o2: string): number {
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
//FIXME: Now it's redundant ((
export function merge(data: any): Preferences{
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

export async function read(path: string): Promise<Preferences> {
    return new Preferences().read(path)
}

export function canBeMerged(path: string): boolean {
    if (!existsSync(path)) return false
    let data = readFileSync(path).toString()
    let parsed = JSON.parse(data)
    if (versionComparator.compare(parsed.version, "1.0.0") < 0) return false
    return true
}
    
export function save(pref: Preferences, path: string){
    pref.save(path)
}

export default {Preferences, ServerType, versionComparator, merge, read, canBeMerged, path, save}