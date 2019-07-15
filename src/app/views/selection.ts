import { ipcRenderer } from "electron"
import { ClientConfig } from "../../shared/preferences"

ipcRenderer.on("config", (config: ClientConfig) => {
    console.log(config)
})