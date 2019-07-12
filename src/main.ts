import { BrowserWindow, app } from 'electron'
import { platform } from 'os'

import * as pref from "./core/preferences"
import { PlayerServer, ClientServer } from "./core/server/server";
import { interconnectFrom } from "./core/server/util"
import { Updater } from "./core/client/updater";
import { WSUpdaterAdapter } from "./core/client/ws";

let requireSetup = !pref.canBeMerged(pref.path)

let player: PlayerServer
let client: ClientServer

function createWindow(): BrowserWindow{
    let win = new BrowserWindow({
        width: 600,
        height: 400,
        frame: true,
        webPreferences: {
            nodeIntegration: true
        }
    })
    win.loadFile("src/app/index.html")
    win.webContents.openDevTools()
    return win
}

let upd: Updater

app.on('ready', (launchParams) => {
    console.log(pref.path)
    let preferences: pref.Preferences
    let win = createWindow()
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
        ({client, player} = interconnectFrom(preferences.server))
    }
    upd = new Updater(new WSUpdaterAdapter("ws://localhost:9091"))
})

app.on('window-all-closed', () =>{
    if (platform() != "darwin"){
        app.quit();
    }
})

app.on('activate', createWindow)