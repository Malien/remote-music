/* eslint-disable @typescript-eslint/no-unused-vars */
import { BrowserWindow, app, ipcMain, IpcMainEvent } from "electron"
require("electron-reload")(__dirname, {electron: require("./../node_modules/electron")})
import { platform } from "os"

import pref, {Preferences, PrefConstructorArgs, ClientConfig, PlayerConfig, ServerType} from "./shared/preferences"
import Session, { PlayerSession, PlayerSessionLike } from "./shared/session"
import { PlayerServer, ClientServer } from "./core/server/server"
import { interconnectFrom } from "./core/server/util"
import { Spotify } from "./shared/apis"
import { sendViaClient } from "./processComms"
let requireSetup = !pref.canBeMerged(pref.path)

let player: PlayerServer
let client: ClientServer

let preferences: Preferences

let selection: BrowserWindow
let playerId: string | undefined
let playerWin: BrowserWindow | undefined

async function firstTimeSetup() {
    return new Promise<Preferences>((resolve, reject) => {
        let ftsWin = new BrowserWindow({
            height: 212,
            width: 500,
            minHeight: 212,
            minWidth: 500,
            maxWidth: 500,
            resizable: true,
            titleBarStyle: "hiddenInset",
            title:"First time setup",
            frame: false,
            fullscreen: false,
            maximizable: false,
            webPreferences: {
                nodeIntegration: true,
                enableRemoteModule: false
            }
        }).on("blur", () => {
            ftsWin.webContents.send("window-blur")
        }).on("focus", () => {
            ftsWin.webContents.send("window-focus")
        }).once("ready-to-show", () => {
            ftsWin.show()
        })
        ftsWin.loadFile("./dist/app/views/first-time-setup.html")
        ipcMain.once("ffs-finish", (event: IpcMainEvent, args: PrefConstructorArgs) => {
            if (ftsWin.webContents == event.sender) {
                ftsWin.close()
                resolve(new pref.Preferences(args))
            }
        }).on("ffs-initial", (event: IpcMainEvent, height: number) => {
            if (ftsWin.webContents == event.sender) {
                ftsWin.setContentSize(500, height, false)
            }
        }).on("ffs-expand", (event: IpcMainEvent, height: number) => {
            if (ftsWin.webContents == event.sender) {
                ftsWin.setContentSize(500, height, true)
            }
        }).once("ffs-err", (event: IpcMainEvent) => {
            if (ftsWin.webContents == event.sender) reject()
        })
    })
}

//FIXME: why did this stopped working?
function selectionMenu(config: ClientConfig, onSelection: (id: string) => void) {
    let selectionWin = new BrowserWindow({
        height: 500,
        width: 300,
        frame: false,
        titleBarStyle: "hidden",
        minHeight: 110,
        minWidth: 200,
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: false
        }
    }).on("blur", () => {
        selectionWin.webContents.send("window-blur")
    }).on("focus", () => {
        selectionWin.webContents.send("window-focus")
    })
    selectionWin.loadFile("./dist/app/views/selection.html")
    selectionWin.webContents.on("dom-ready", () => {selectionWin.webContents.send("config", config)})
    selectionWin.show()
    ipcMain.on("selection-select", (event: IpcMainEvent, id: string) => {
        onSelection(id)
    })
    return selectionWin
}

function playerWindow(config: PlayerConfig) {
    let playerWin = new BrowserWindow({
        height: 600,
        width: 350,
        minWidth: 300,
        minHeight: 475,
        frame: false,
        titleBarStyle: "hidden",
        show: true,
        webPreferences: {
            nodeIntegration: true,
        }
    }).on("blur", () => {
        playerWin.webContents.send("window-blur")
    }).on("focus", () => {
        playerWin.webContents.send("window-focus")
    }).on("close", () => {playerWin.webContents.send("close")})
    ipcMain.on("player-height", (event, height) => {
        if (playerWin.webContents == event.sender) {
            let width = playerWin.getMinimumSize()[0]
            playerWin.setMinimumSize(width, height)
        }
    }).on("player-init", (event) => {
        if (playerWin.webContents == event.sender) playerWin.show()
    }).on("session-update", (event, session: PlayerSessionLike) => {
        Session.save(Session.path, session)
    }).on("player-auth-request", async (event, service) => {
        if (playerWin.webContents == event.sender)
            if (service === "spotify") {
                let tokens = await Spotify.authorize([Spotify.Scopes.userLibraryRead, Spotify.Scopes.streaming])
                playerWin.webContents.send("auth-token", "spotify", tokens)
                if (preferences.client) sendViaClient(preferences.client.client, {
                    type: "serviceToken", 
                    payload: {
                        service: "spotify",
                        refreshToken: tokens.refreshToken
                    }
                })
            }
    })
    playerWin.loadFile("./dist/app/views/player.html")
    ipcMain.on("player-ready", (event) => {
        if (event.sender == playerWin.webContents) {
            playerWin.webContents.send("config", config)
            Session.read(Session.path)
                .then(session => {playerWin.webContents.send("session", session)})
                .catch(err => {playerWin.webContents.send("session", new PlayerSession())})
        }
    })
    // RemoteUse.notify(playerWin.webContents)
    // playerWin.show()
    return playerWin
}

function clientWin(config: ClientConfig, id: string) {
    let playerWin = new BrowserWindow({
        height: 600,
        width: 350
    })
    playerWin.loadFile("./dist/app/views/client.html")
    playerWin.webContents.send("config", config, id)
    playerWin.show()
    return clientWin
}

app.requestSingleInstanceLock()
app.setAsDefaultProtocolClient("remote-music")

app.on("ready", async () => {
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
        preferences = await pref.read(pref.path)
    }
    console.log(preferences)
    //Server creation
    if (preferences.server) {
        ({client, player} = interconnectFrom(preferences.server))
    }
    //Selection menu creation
    if (preferences.client) {
        selection = selectionMenu(preferences.client.client, (id) => {
            //Client creation
            if (preferences.client){
                if (preferences.client.player && id == playerId) {
                    if (playerWin) playerWin.show()
                    else playerWin = playerWindow(preferences.client.player)
                }
                else clientWin(preferences.client.client, id)
            }
        })
        //Player creation
        if (typeof(preferences.client.player) != "undefined") {
            let playerWin = playerWindow(preferences.client.player)
            ipcMain.on("player-register", (event: IpcMainEvent, id: string) => {
                playerId = id
                if (event.sender == playerWin.webContents) {
                    selection.webContents.send("player-register", id)
                }
            })
        }
    }
})

app.on("window-all-closed", () =>{
    if (platform() != "darwin"){
        app.quit()
    }
})

app.on("activate", (event, hasVisibleWindows) => {
    if (!hasVisibleWindows && preferences.client) selectionMenu(preferences.client.client, (id) => {
        if (preferences.client) clientWin(preferences.client.client, id)
    })
})

//TODO: listen for macOS url events
// app.addListener("open-url", )