/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react"
import ReactDOM from "react-dom"

import { PlayerStatus, Song, PlayerStatusChange } from "../../shared/components"
import { PlayerConfig } from "../../shared/preferences"

import { TransparentTitlebar, windowResize } from "../components/window"
import { Player, Services, ServiceAvailability } from "../components/player"
import { ipcRenderer } from "electron"
import { PlayerServerRequest } from "./comms"

interface Req {
    type: string;
    payload?: any;
}
// declare namespace MusicKit {}

class PlayerApp extends React.Component<PlayerConfig, PlayerStatus> {
    private ws: WebSocket
    private id?: string
    private interval: number

    public constructor(props: PlayerConfig) {
        super(props)
        let song: Song = {
            title: "Jumpsuit", 
            album:"Trench", 
            artist:"twenty one pilots", 
            artwork:"/Users/yaroslav/Downloads/twenty one pilots - Trench (2018) [ALAC]/cover.jpg", 
            length:239
        }
        this.state = {current: song, progress: 100, playing: false, queue: [song, song, song, song, song, song, song, song, song, song, song, song, song, song, song, song]}
        this.ws = new WebSocket(props.address + ":" + props.port)
        this.ws.onopen = (() => {
            this.send({type:"register", payload:props.name})
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
                    this.send({type: "pong", payload:this.state})
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

    private send(req: Req) {
        this.ws.send(JSON.stringify(req))
    }

    private statusUpdate(payload: PlayerStatusChange) {
        this.send({type: "statusChange", payload})
    }

    public componentDidMount() {
        document.addEventListener("musickitloaded", () => {
            // let MKInstance = MusicKit.configure({
            //     developerToken: "",
            //     app: {
            //         name: "remote-music",
            //         build: "1.0.2"
            //     }
            // })
        })
    }

    public componentWillUpdate(prevProps: PlayerConfig, prevState: PlayerStatus) {
        if (prevState != this.state) {
            let out = {}
            Object.entries(prevState).forEach(([key, val]) => {
                if (this.state[key] != val) out[key] = val
            })
            if (out) this.statusUpdate(out)
        }
    }

    public render = () => {
        let title = this.props.name
        if (this.state.current) {
            title += `: ${this.state.playing ? "playing" : "paused"} ${this.state.current.title}`
        }
        return <TransparentTitlebar title={title}>
            <Player 
                current={this.state.current} 
                progress={this.state.progress} 
                playing={this.state.playing} 
                queue={this.state.queue}
                services={new Map<Services, ServiceAvailability>([
                    [Services.spotify, ServiceAvailability.notConnected],
                    [Services.apple, ServiceAvailability.notReachable],
                    [Services.local, ServiceAvailability.notSupported],
                ])}
                onScrub={progress => {
                    if (this.state.current)
                        this.setState(Object.assign({}, this.state, {progress}))
                }}
                onPlay={() => {
                    this.setState({...this.state, playing: !this.state.playing})
                }}/>
        </TransparentTitlebar>
    }
}

ipcRenderer.once("config", (event, config: PlayerConfig) => {
    ReactDOM.render(
        // <TitlebarWindow>
        <PlayerApp type={config.type} port={config.port} address={config.address} name={config.name}/>
        // </TitlebarWindow>
        ,document.getElementById("mount")
    )
})

// window.addEventListener("resize", windowResize)