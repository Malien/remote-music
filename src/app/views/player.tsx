/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { FunctionComponent, useState, useEffect } from "react"
import ReactDOM from "react-dom"

import { PlayerStatus, Song, PlayerStatusChange } from "../../shared/components"
import { PlayerConfig } from "../../shared/preferences"
import { Services, ServiceAvailability } from "../../shared/apis"
import { PlayerSessionLike } from "../../shared/session";

import { TransparentTitlebar, windowResize } from "../components/window"
import { Player } from "../components/player"
import { ipcRenderer } from "electron"
import { PlayerServerRequest } from "./comms"

interface Req {
    type: string;
    payload?: any;
}
// declare namespace MusicKit {}

class PlayerApp extends React.Component<PlayerConfig, PlayerSessionLike> {
    private ws: WebSocket
    private id?: string
    private interval: number
    private statusUpdateQueue: PlayerStatusChange[] = []

    public constructor(props: PlayerConfig) {
        super(props)
        let song: Song = {
            title: "Jumpsuit", 
            album:"Trench", 
            artist:"twenty one pilots", 
            artwork:"/Users/yaroslav/Downloads/twenty one pilots - Trench (2018) [ALAC]/cover.jpg", 
            length:239
        }
        this.state = {
            current: song, 
            progress: 100, 
            playing: false, 
            queue: [song, song, song, song, song, song, song, song, song, song, song, song, song, song, song, song],
            services: new Map([
                [Services.spotify, ServiceAvailability.notConnected],
                [Services.apple, ServiceAvailability.notSupported],
                [Services.local, ServiceAvailability.notSupported],
            ])
        }

        ipcRenderer.on("close", (event) => ipcRenderer.send("session-update", {...this.state}))

        this.ws = new WebSocket(props.address + ":" + props.port)
        this.ws.onopen = (() => {
            this.send({type:"register", payload:props.name})
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
        // ipcRenderer.on("session", (event, session: PlayerSessionLike) => {
        //     this.setState({...this.state, ...session})
        // })
        this.ws.onmessage = ((ev: MessageEvent) => {
            let msg = JSON.parse(ev.data) as PlayerServerRequest
            switch (msg.type) {
                case "register": 
                    this.id = msg.payload.id
                    this.interval = msg.payload.interval
                    ipcRenderer.send("player-register", msg.payload.id)
                    setTimeout(this.statusReport, this.interval)
                    {
                        let status = this.statusUpdateQueue.pop()
                        while (status) {
                            this.statusUpdate(status)
                            status = this.statusUpdateQueue.pop()
                        }
                    }
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
        // requestAnimationFrame(() => ipcRenderer.send("player-init"))
        // document.addEventListener("musickitloaded", () => {
        // let MKInstance = MusicKit.configure({
        //     developerToken: "",
        //     app: {
        //         name: "remote-music",
        //         build: "1.0.2"
        //     }
        // })
        // })
    }

    public componentWillUpdate(prevProps: PlayerConfig, prevState: PlayerSessionLike) {
        if (prevState != this.state) {
            let out = {}
            Object.entries(prevState).forEach(([key, val]) => {
                if (this.state[key] != val) out[key] = val
            })
            if (out && this.ws.readyState == WebSocket.OPEN) this.statusUpdate(out)
            else this.statusUpdateQueue.push(out)
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
                services={this.state.services}
                service={this.state.service}
                onScrub={progress => {
                    if (this.state.current)
                        this.setState(Object.assign({}, this.state, {progress}))
                }}
                onPlay={() => {
                    this.setState({...this.state, playing: !this.state.playing})
                }}
                onSelect={(service) => {
                    let availability = this.state.services.get(service)
                    switch (availability) {
                        case "Connected":
                            this.setState({...this.state, service: service})
                            break
                        case "Not connected":
                            switch (service) {
                                case "Spotify":
                                    break
                                case "Apple Music":
                                case "Local Machine":
                            }
                            break
                        case "Not supported":
                        case "Not reachable":
                        case undefined:
                    }
                }}/>
        </TransparentTitlebar>
    }
}

const AwaitedPlayerApp: FunctionComponent = props => {
    let [config, setConfig] = useState<PlayerConfig | undefined>(undefined)

    useEffect(() => {
        ipcRenderer.once("config", (event, config: PlayerConfig) => {console.log(config); setConfig(config)})
        ipcRenderer.send("player-ready")
        return () => {ipcRenderer.removeAllListeners("config")}
    }, [])

    return config ? <PlayerApp type={config.type} port={config.port} address={config.address} name={config.name}/> : <>Loading</>

    // return <div draggable={Boolean(config)}/>

    // return config 
    //     ? <PlayerApp type={config.type} port={config.port} address={config.address} name={config.name}/>
    //     : <TransparentTitlebar title="Loading">
    //         <Player current={null} progress={0} queue={[]} playing={false} services={new Map()}/>
    //     </TransparentTitlebar>
}

ReactDOM.render(
    <AwaitedPlayerApp/>,
    document.getElementById("mount")
)

// ipcRenderer.once("config", (event, config: PlayerConfig) => {
//     ReactDOM.render(
//         // <TitlebarWindow>
//         <PlayerApp type={config.type} port={config.port} address={config.address} name={config.name}/>
//         // </TitlebarWindow>
//         ,document.getElementById("mount")
//     )
// }).once("service-data", console.log)

// window.addEventListener("resize", windowResize)