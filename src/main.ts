import { BrowserWindow, app, ipcMain, Event } from 'electron'
import { platform } from 'os'

import pref, {Preferences, PrefConstructorArgs, ClientConfig} from "./shared/preferences"
import { PlayerServer, ClientServer } from "./core/server/server";
import { interconnectFrom } from "./core/server/util"

// let requireSetup = !pref.canBeMerged(pref.path)
let requireSetup = true

let player: PlayerServer
let client: ClientServer

async function firstTimeSetup() {
    return new Promise<Preferences>((resolve, reject) => {
        let ftsWin = new BrowserWindow({
            height: 200,
            width: 400
        })
        ftsWin.loadFile("./dist/app/views/first-time-setup.html")
        ftsWin.show()
        ftsWin.once("close", (event) => {
            reject()
        })
        ipcMain.once("ffs-finish", (event:Event, args:PrefConstructorArgs) => {
            if (ftsWin.webContents == event.sender) {
                ftsWin.close()
                resolve(new pref.Preferences(args))
            }
        })
        ipcMain.once("ffs-err", (event:Event) => {
            if (ftsWin.webContents == event.sender) reject()
        })
    })
}

function selectionMenu(config: ClientConfig, onSelection: (id: string)=>void) {
    let selectionWin = new BrowserWindow({
        height: 600,
        width: 300
    })
    selectionWin.loadFile("./dist/app/views/selection.html")
    selectionWin.webContents.send("config", config)
    selectionWin.show()
    ipcMain.on("selection-select", (event:Event, id: string) => {
        onSelection(id)
    })
}

function playerWindow(config: ClientConfig) {
    let playerWin = new BrowserWindow({
        height: 600,
        width: 400
    })
    playerWin.loadFile("./dist/app/views/player.html")
    playerWin.webContents.send("config", config)
    playerWin.show()
}

function clientWin(config: ClientConfig, id: string) {
    let playerWin = new BrowserWindow({
        height: 600,
        width: 400
    })
    playerWin.loadFile("./dist/app/views/client.html")
    playerWin.webContents.send("config", config, id)
    playerWin.show()
}

app.on('ready', async () => {
    console.log(pref.path)
    let preferences: Preferences
    if (requireSetup) {
        try {
            preferences = await firstTimeSetup()
        } catch (e) {
            app.quit()
            return
        }
        preferences.save(pref.path)
    } else {
        preferences = pref.read(pref.path);
    }
    console.log(preferences)
    if (typeof(preferences.server) != 'undefined') {
        ({client, player} = interconnectFrom(preferences.server))
    }
    if (typeof(preferences.client) != 'undefined') {
        selectionMenu(preferences.client.client, (id) => {
            clientWin(preferences.client.client, id)
        })
        if (typeof(preferences.client.player) != 'undefined') {
            playerWindow(preferences.client.player)
        }
    }
})

app.on('window-all-closed', () =>{
    if (platform() != "darwin"){
        app.quit();
    }
})

//TODO: app.on("activate", ()=>{})