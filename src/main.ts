import { BrowserWindow, app } from 'electron'
import { platform } from 'os'

import * as pref from "./core/preferences"
import { ServerInterconnect } from './core/server/server'
import { interconnectFrom } from "./core/server/util"
import { Updater } from "./core/client/updater"

let requireSetup = !pref.canBeMerged(pref.path)

let win: BrowserWindow
let servers: ServerInterconnect

function createWindow(): BrowserWindow{
    win = new BrowserWindow({
        width: 600,
        height: 400,
        frame: true,
    })

    win.loadFile("src/app/index.html")
    win.webContents.openDevTools()
    return win
}

let upd;

app.on('ready', (launchParams) => {
    win = createWindow()
    console.log(pref.path)
    let preferences: pref.Preferences
    if (requireSetup) {
        win.webContents.openDevTools()
        preferences = new pref.Preferences(false, {
            client: {
                type: pref.ServerType.ws,
                port: 9090
            },
            player: {
                type: pref.ServerType.ws,
                port: 9091
            }
        })
        preferences.save(pref.path)
    } else {
        preferences = pref.read(pref.path);
    }
    console.log(preferences)
    if (typeof(preferences.server) != 'undefined') {
        servers = interconnectFrom(preferences.server)
    }
    upd = new Updater({
        address: "ws://localhost:9090",
        id: "test",
        type: pref.ServerType.ws
    })
})

app.on('window-all-closed', () =>{
    if (platform() != "darwin"){
        app.quit();
    }
})

app.on('activate', createWindow)