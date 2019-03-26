import { BrowserWindow, app } from 'electron'
import { platform } from 'os'

import {Preferences, prefPath} from "./src/core/preferences"

let fs = require('fs');

let requireSetup = !fs.existsSync(prefPath)

let win: BrowserWindow

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
    if (requireSetup) {
        win.webContents.openDevTools()
        let pref = new Preferences("localhost", true, true)
        pref.save(prefPath)
    }
})

app.on('window-all-closed', () =>{
    if (platform() != "darwin"){
        app.quit();
    }
})

app.on('activate', createWindow)