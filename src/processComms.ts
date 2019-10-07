import { ClientServerRequest } from "./shared/comms"
import { ClientConfig, ServerType } from "./shared/preferences"
import WebSocket from "ws"

let clientWS: WebSocket | undefined
export async function sendViaClient({ type, address, port }: ClientConfig, req: ClientServerRequest) {
    switch (type) {
        case ServerType.ws:
            if (!clientWS) {
                clientWS = await new Promise<WebSocket>((resolve) => {
                    let ws = new WebSocket(address + ":" + port)
                    ws.onopen = () => resolve(ws)
                })
            }
            clientWS.send(JSON.stringify(req))
            break
        default: break
    }
}