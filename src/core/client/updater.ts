import { UpdaterAdapter } from "./adapters";
import { PlayerStatus } from "../../shared/components";

//TODO: temporary updater

export class Updater {
    private adapter: UpdaterAdapter
    private id?: string
    private status: PlayerStatus = {
        progress: 0,
        playing: false,
        queue: []
    }
    private interval: number
    constructor(adapter: UpdaterAdapter) {
        let _this = this
        this.adapter = adapter
        adapter.on("register", (id, interval) => {
            _this.id = id
            _this.interval = interval
            console.log("Updater: register -> " + id)
            setTimeout(_this.heartbeat, interval * 100)
        }).on("ping", ()=>{
            console.log("Updater: ping")
            adapter.send(JSON.stringify({type:"pong", payload: _this.status}))
        }).on("statusChange", (change) => {
            Object.entries(change).forEach( ([key, value])=> {
                _this.status[key] = value
            })
        }).on("unregister", () => {
            _this.id = undefined
            console.log("Updater: unregister")
        }).on("open", () => {
            console.log("Updater: open")
            adapter.send(JSON.stringify({type:"register", payload:"smaple"}))
        })
    }
    heartbeat() {
        if (this.id) {
            console.log("Updater: heartbeat")
            this.adapter.send(JSON.stringify({type:"heartbeat", payload: this.status}))
            setTimeout(this.heartbeat, this.interval * 100)
        }
    }
}