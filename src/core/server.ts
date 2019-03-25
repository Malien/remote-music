import { RemotePlayer, Client } from "./components";
import * as http from 'http';

export class PlayerServer {
    players: Map<number, RemotePlayer>
}

export class ClientServer {
    clients: Map<number, Client>
}

function findClient(map: Map<number, Client>, address: string): Client {
    map.forEach((client) => {
        if (client.address == address) return client
    })
    return null
}

export class HTTPClientServer extends ClientServer {
    server: http.Server
    constructor(port: number = 8100){
        super()
        this.server = http.createServer((req, res) => {
            let addr = req.socket.address as unknown as string
            let client = findClient(this.clients, addr)
            if (client == null){
                this.clients.set(this.clients.size, new Client(addr))
            }
            res.writeHead(200, {
                'auth-req':client.id
            })
        }).listen(port)
    }
}

export class WSCientServer extends ClientServer {

}

export class WSPlayerServer extends PlayerServer {

}