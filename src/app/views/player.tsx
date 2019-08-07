/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react"
import ReactDOM from "react-dom"

import { PlayerStatus } from "../../shared/components"
import { PlayerConfig } from "../../shared/preferences"

import {  } from "../components/window"
import { Player } from "../components/player"
import { ipcRenderer } from "electron"
import { PlayerServerRequest } from "./comms"

class PlayerApp extends React.Component<PlayerConfig, PlayerStatus> {
    private ws: WebSocket
    private id?: string
    private interval: number

    public constructor(props: PlayerConfig) {
        super(props)
        this.state = {progress: 0, playing: false, queue: []}
        this.ws = new WebSocket(props.address + ":" + props.port)
        this.ws.onopen = (() => {
            this.ws.send(JSON.stringify({type:"register", payload:props.name}))
        }).bind(this)
        this.ws.onmessage = ((ev: MessageEvent) => {
            let msg = JSON.parse(ev.data) as PlayerServerRequest
            switch (msg.type) {
                case "register":
                    this.id = msg.payload.id
                    this.interval = msg.payload.interval
                    ipcRenderer.send("player-register", msg.payload.id)
                    setTimeout(this.statusReport, this.interval)
                    break
                case "unregister": 
                    delete this.id
                    break
                case "ping":
                    this.ws.send(JSON.stringify({type: "pong", payload:this.state}))
                    break
                case "statusChange":
                    this.setState(Object.assign({}, this.state, msg.payload))
                    break
            }
        }).bind(this)
    }

    private statusReport() {
        if (this.id) {
            this.ws.send(JSON.stringify({type:"heartbeat", payload:this.state}))
            setTimeout(this.statusReport, this.interval)
        }
    }

    public render = () => <Player current={this.state.current} progress={this.state.progress} playing={this.state.playing} queue={this.state.queue}/>
}

ipcRenderer.once("config", (event, config: PlayerConfig) => {
    ReactDOM.render(
        // <TitlebarWindow>
        <PlayerApp type={config.type} port={config.port} address={config.address} name={config.name}/>
        // </TitlebarWindow>
        ,document.getElementById("mount")
    )
})