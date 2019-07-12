import { BrowserWindow, app, ipcMain, Event } from 'electron'
import { platform } from 'os'

import * as pref from "./shared/preferences"
import { PlayerServer, ClientServer } from "./core/server/server";
import { interconnectFrom } from "./core/server/util"

let requireSetup = !pref.canBeMerged(pref.path)
// let requireSetup = true

let player: PlayerServer
let client: ClientServer

async function firstTimeSetup() {
    return new Promise<pref.Preferences>((resolve, reject) => {
        let ftsWin = new BrowserWindow({
            height: 200,
            width: 400
        })
        ftsWin.loadFile("./dist/app/setup/index.html")
        ftsWin.show()
        ipcMain.on("ffs-finish", (event:Event, args:pref.PrefConstructorArgs) => {
            if (ftsWin.webContents == event.sender) resolve(new pref.Preferences(args))
        })
        ipcMain.on("ffs-err", (event) => {
            if (event.frameId == ftsWin.id) reject()
        })
    })
}

app.on('ready', async (launchParams) => {
    console.log(pref.path)
    let preferences: pref.Preferences
    if (requireSetup) {
        preferences = await firstTimeSetup()
        preferences.save(pref.path)
    } else {
        preferences = pref.read(pref.path);
    }
    console.log(preferences)
    if (typeof(preferences.server) != 'undefined') {
        ({client, player} = interconnectFrom(preferences.server))
    }
})

app.on('window-all-closed', () =>{
    if (platform() != "darwin"){
        app.quit();
    }
})

//TODO: app.on("activate", ()=>{})