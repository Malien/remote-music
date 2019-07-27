/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { BrowserWindow, app, ipcMain, Event } from "electron"
require("electron-reload")(__dirname, {electron: require("./../node_modules/electron")})
import { platform } from "os"

import pref, {Preferences, PrefConstructorArgs, ClientConfig} from "./shared/preferences"
import { PlayerServer, ClientServer } from "./core/server/server"
import { interconnectFrom } from "./core/server/util"

// let requireSetup = !pref.canBeMerged(pref.path)
let requireSetup = true

let player: PlayerServer
let client: ClientServer

let preferences: Preferences

async function firstTimeSetup() {
    return new Promise<Preferences>((resolve, reject) => {
        let ftsWin = new BrowserWindow({
            height: 200,
            width: 500,
            //I'm not so sure about resisable false here
            resizable: true,
            titleBarStyle: "hiddenInset",
            title:"First time setup",
            frame: false,
            fullscreen: false,
            maximizable: false
        }).on("blur", () => {
            ftsWin.webContents.send("window-blur")
        }).on("focus", () => {
            ftsWin.webContents.send("window-focus")
        }).once("ready-to-show", () => {
            ftsWin.show()
        })
        ftsWin.loadFile("./dist/app/views/first-time-setup.html")
        ipcMain.once("ffs-finish", (event: Event, args: PrefConstructorArgs) => {
            if (ftsWin.webContents == event.sender) {
                ftsWin.close()
                resolve(new pref.Preferences(args))
            }
        }).on("ffs-initial", (event: Event, height: number) => {
            if (ftsWin.webContents == event.sender) {
                ftsWin.setContentSize(500, height, false)
            }
        }).on("ffs-expand", (event: Event, height: number) => {
            if (ftsWin.webContents == event.sender) {
                ftsWin.setContentSize(500, height, true)
            }
        }).once("ffs-err", (event: Event) => {
            if (ftsWin.webContents == event.sender) reject()
        })
    })
}

function selectionMenu(config: ClientConfig, onSelection: (id: string) => void) {
    let selectionWin = new BrowserWindow({
        height: 500,
        width: 300
    })
    selectionWin.loadFile("./dist/app/views/selection.html")
    selectionWin.webContents.send("config", config)
    selectionWin.show()
    ipcMain.on("selection-select", (event: Event, id: string) => {
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

app.on("ready", async () => {
    // reload(__dirname, {
    //     electron
    // })
    console.log(pref.path)
    if (requireSetup) {
        try {
            preferences = await firstTimeSetup()
        } catch (e) {
            if (!preferences) {
                app.quit()
            }
        }
        preferences.save(pref.path)
    } else {
        preferences = pref.read(pref.path)
    }
    console.log(preferences)
    if (typeof(preferences.server) != "undefined") {
        ({client, player} = interconnectFrom(preferences.server))
    }
    if (typeof(preferences.client) != "undefined") {
        selectionMenu(preferences.client.client, (id) => {
            clientWin(preferences.client.client, id)
        })
        if (typeof(preferences.client.player) != "undefined") {
            playerWindow(preferences.client.player)
        }
    }
})

app.on("window-all-closed", () =>{
    if (platform() != "darwin"){
        app.quit()
    }
})

app.on("activate", (event, hasVisibleWindows) => {
    if (!hasVisibleWindows) selectionMenu(preferences.client.client, (id) => {
        clientWin(preferences.client.client, id)
    })
})