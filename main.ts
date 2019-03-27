import { BrowserWindow, app } from 'electron'
import { platform, type } from 'os'

import { Preferences, prefPath, ServerType, readPref } from "./src/core/preferences"
import { ServerInterconnect } from './src/core/server';

let fs = require('fs');

let requireSetup = !fs.existsSync(prefPath)

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
    console.log(prefPath)
    let pref: Preferences
    if (requireSetup) {
        win.webContents.openDevTools()
        pref = new Preferences(false, {
            clientType: ServerType.ws,
            clientPort: 9090,
            playerType: ServerType.ws,
            playerPort: 9091
        })
        pref.save(prefPath)
    } else {
        pref = readPref(prefPath);
    }
    if (typeof(pref.server) != 'undefined') {
        servers = ServerInterconnect.initWithConf(pref.server)
    }
})

app.on('window-all-closed', () =>{
    if (platform() != "darwin"){
        app.quit();
    }
})

app.on('activate', createWindow)