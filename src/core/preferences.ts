let fs = require('fs');

export class Preferences {
    serverAddr: string
    isClient: boolean
    isServer: boolean
    constructor(serverAddr?: string, isClient?: boolean, isServer?: boolean){
        if (typeof(serverAddr) != undefined){
            this.serverAddr = serverAddr as string
        }
        if (typeof(isClient) != undefined){
            this.isClient = isClient as boolean
        }
        if (typeof(isServer) != undefined){
            this.isServer = isServer as boolean
        }
    }
    read = function(path: string) {
        let data = fs.readSync(path)
        let parsedData = JSON.parse(data)
        this.serverAddr = parsedData["serverAddr"]
        this.isClient = parsedData["isClient"]
        this.isServer = parsedData["isServer"]
    }
    save = function(path: string) {
        console.log(this);
        let str = JSON.stringify(this)
        fs.writeFileSync(path, str)
        console.log(str);
    }
}

export function readPref(path: string): Preferences {
    let data = fs.readSync(path)
    let parsedData = JSON.parse(data)
    return new Preferences(parsedData["serverAddr"], parsedData["isCleint"], parsedData["isServer"])
}

var preferencePath = process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + 'Library/Preferences' : process.env.HOME + "/.local/share")
preferencePath += "/remote-music-preference.json"

export let prefPath = preferencePath
    

export function savePref(pref: Preferences, path: string){
    pref.save(path)
}