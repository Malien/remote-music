import { ipcRenderer } from "electron"
import React from "react"
import ReactDOM from "react-dom"

import { ClientConfig } from "../../shared/preferences"

import { List } from "../components/layout"
import { PlayerStats } from "../components/server"

ipcRenderer.on("config", (config: ClientConfig) => {
    
})

ReactDOM.render(
    <></>,
    document.getElementById("mount")
)