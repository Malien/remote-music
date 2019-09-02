import { platform } from "os"
import { writeFile, readFile } from "fs"
import { ObservableMap } from "../core/util/observable";
import { ipcMain, WebContents } from "electron";

export enum ServiceAvailability{
    connected = "Connected", 
    notSupported = "Not supported", 
    notConnected = "Not connected", 
    notReachable = "Not reachable"
}
export enum Services {
    spotify = "Spotify",
    apple = "Apple Music",
    local = "Local Machine"
}

let _path: string | undefined
export function path(): string {
    if (_path) return _path
    else {
        let os = platform()
        let path: string
        switch (os) {
            case "win32":
                path = process.env.APPDATA + "/RemoteMusic"
                break
            case "darwin":
                path = process.env.HOME + "/Library/Application Support/RemoteMusic"
                break
            default:
                //other hopefully unix based systems
                path = process.env.HOME + "./local/share/RemoteMusic"
        }
        _path = path
        return path
    }
}

export function save(service: Services, data: {}) {
    let savePath = `${path()}/${service}.json`
    writeFile(savePath, data, console.error)
}

export async function read(service: Services | string): Promise<[Services | string, {}]> {
    let readPath = `${path()}/${service}.json`
    return new Promise((resolve, reject) => {
        readFile(readPath, (err, data) => {
            if (err.errno) reject(err)
            else resolve([service, JSON.parse(data.toString())])
        })
    })
}

export async function readAll(): Promise<Map<Services | string, {}>> {
    let plist: Promise<[Services | string, {}]>[] = []
    for (let service in Services) {
        plist.push(read(Services[service]))
    }
    return Promise.all(plist).then(vals => {
        return new Map(vals)
    })
}

export namespace RemoteUse {
    export const notify = (sender: WebContents) => {
        readAll().then(map => sender.send("service-data", map))
    }
}