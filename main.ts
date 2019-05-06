import { BrowserWindow, app } from 'electron'
import { platform } from 'os'

import * as pref from "./src/core/preferences"
import { ServerInterconnect } from './src/core/server';

let requireSetup = !pref.canBeMerged(pref.path)

let win: BrowserWindow
let servers: ServerInterconnect

function createWindow(): BrowserWindow{
    win = new BrowserWindow({
        width: 600,
        height: 400,
        frame: true
    })

    win.loadFile("src/app/index.html")
    return win
}

app.on('ready', (launchParams) => {
    win = createWindow()
    console.log(pref.path)
    let preferences: pref.Preferences
    if (requireSetup) {
        win.webContents.openDevTools()
        preferences = new pref.Preferences(false, {
            clientType: pref.ServerType.ws,
            clientPort: 9090,
            playerType: pref.ServerType.ws,
            playerPort: 9091
        })
        preferences.save(pref.path)
    } else {
        preferences = pref.read(pref.path);
    }
    console.log(preferences)
    if (typeof(preferences.server) != 'undefined') {
        servers = ServerInterconnect.initWithConf(preferences.server)
    }
})

app.on('window-all-closed', () =>{
    if (platform() != "darwin"){
        app.quit();
    }
})

app.on('activate', createWindow)