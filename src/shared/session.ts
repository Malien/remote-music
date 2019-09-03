import { writeFile, readFile, PathLike } from "fs"
import { platform } from "os"
import { PlayerStatus, Song } from "./components"
import { Services, ServiceAvailability } from "./apis"

export interface PlayerSessionLike extends PlayerStatus {
    services: Map<Services, ServiceAvailability>;
    service?: Services;
}

export class PlayerSession implements PlayerSessionLike {
    public services: Map<Services, ServiceAvailability> = new Map([
        [Services.spotify, ServiceAvailability.notConnected],
        [Services.apple, ServiceAvailability.notSupported],
        [Services.local, ServiceAvailability.notSupported],
    ])
    public service?: Services | undefined
    public current: Song | null = null;
    public progress: number = 0;
    public playing: boolean = false;
    public queue: Song[] = [];

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
        writeFile(path, JSON.stringify(this), err => {if (err) console.error(err)})
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
    writeFile(path, JSON.stringify(session), err => {if (err) console.error(err)})
}

export const read = (path: PathLike): Promise<PlayerSession> => new PlayerSession().read(path)

export default { read, PlayerSession, path: PlayerSession.path, save }