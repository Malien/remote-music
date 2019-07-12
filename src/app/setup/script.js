let { ipcRenderer } = require("electron")
let { Preferences, ServerType } = require( "../../shared/preferences");

window.onload = () => {
    ipcRenderer.sendSync("ffs-finish", {
        hasClient: true, 
        server: {
            client: {
                type: ServerType.ws,
                port: 9090
            },
            player: {
                type: ServerType.ws,
                port: 9091
            }
        }
    })
};