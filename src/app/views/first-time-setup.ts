import { ipcRenderer } from "electron";

import { PrefConstructorArgs, ServerType } from "../../shared/preferences";

window.onload = () => {
    let prefConstructor: PrefConstructorArgs = {
        client: {
            client: {
                type: ServerType.ws,
                port: 9090,
                address: "localhost"
            },
            player: {
                type: ServerType.ws,
                port: 9091,
                address: "localhost"
            }
        },
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
    }
    console.log(prefConstructor)
    ipcRenderer.send("ffs-finish", prefConstructor)
};