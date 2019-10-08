import { writeFile, readFile, PathLike } from "fs"
import { platform } from "os"

import { PlayerStatus, ServiceAvailability, Services } from "./components"


export interface ServiceInfo {
    availability: ServiceAvailability;
    token?: string;
    ttl?: number;
    refreshToken?: string;
}
export interface ServiceMap { 
    [key: string]: ServiceInfo;
}
export interface PlayerSessionLike {
    status: PlayerStatus;
    services: ServiceMap;
    service?: string;
}

export class PlayerSession implements PlayerSessionLike {
    public services = {}
    public service?: Services | undefined
    // public current: Song | null = null;
    // public progress: number = 0;
    // public playing: boolean = false;
    // public queue: Song[] = [];
    public status = { progress: 0, playing: false, queue: [], current: null, services: {} }

    public constructor(session?: PlayerSessionLike) {
        if (session) Object.assign(this, session)
    }

    private static _path: string | undefined;
    private static baseDirPath: string | undefined;
    public static get path(): string {
        if (this._path) return this._path
        else {
            let os = platform()
            let path: string
            switch (os) {
                case "win32":
                    path = process.env.APPDATA + ""
                    break
                case "darwin":
                    path = process.env.HOME + "/Library/Application Support"
                    break
                default:
                    //other hopefully unix based systems
                    path = process.env.HOME + "./local/share"
            }
            this.baseDirPath = path + "/remote-music"
            this._path = this.baseDirPath + "/remote-music-session.json"
            return this._path
        }
    }

    public save(path: PathLike) {
        let services: ServiceMap = {}
        Object.entries<ServiceInfo>(this.services).forEach(([service, info]) => {
            services[service] = { availability: info.availability, refreshToken: info.refreshToken }
        })
        let saveObj: PlayerSessionLike = { services, status: this.status, service: this.service }
        writeFile(path, JSON.stringify(saveObj), err => { if (err) console.error(err) })
    }

    public read(path: PathLike): Promise<PlayerSession> {
        return new Promise((resolve, reject) => {
            readFile(path, (err, data) => {
                if (err) reject(err)
                else Object.assign(this, JSON.parse(data.toString()))
                resolve(this)
            })
        })
    }
}

export function save(path: PathLike, session: PlayerSessionLike) {
    writeFile(path, JSON.stringify(session), err => { if (err) console.error(err) })
}

export const read = (path: PathLike): Promise<PlayerSession> => new PlayerSession().read(path)

export default { read, PlayerSession, path: PlayerSession.path, save }