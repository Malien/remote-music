export class RemotePlayer {
    address: string
}

export class Client {
    address: string
    verified: boolean
    id: string
    constructor(address: string){
        this.address = address
    }
    verify = function(response: Float32Array): boolean {
        this.verified = true
        return true
    }
}