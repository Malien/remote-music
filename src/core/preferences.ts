import * as fs from 'fs';

export class Preferences {
    hasClient: boolean
    server: ServerConfig
    constructor(hasClient?: boolean, server?: ServerConfig){
        if (typeof(server) != 'undefined'){
            this.server = server as ServerConfig
        }
        if (typeof(hasClient) != 'undefined'){
            this.hasClient = hasClient as boolean
        }
    }
    read = function(path: string) {
        let data = fs.readFileSync(path).toString()
        let parsedData = JSON.parse(data)
        
        this.server = parsedData["server"]
        this.hasClient = parsedData["hasClient"]
    }
    save = function(path: string) {
        console.log(this);
        let str = JSON.stringify(this)
        fs.writeFileSync(path, str)
        console.log(str);
    }
}

export class ServerConfig {
    clientType: ServerType
    clientPort: number
    playerType: ServerType
    playerPort: number
}

export enum ServerType {
    ws,
    http,
    https,
    tcp
}

export function readPref(path: string): Preferences {
    let data = fs.readFileSync(path).toString()
    let parsedData = JSON.parse(data)
    return parsedData as Preferences
}

var preferencePath = process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + "/.local/share")
preferencePath += "/remote-music-preference.json"
export let prefPath = preferencePath
    
export function savePref(pref: Preferences, path: string){
    pref.save(path)
}