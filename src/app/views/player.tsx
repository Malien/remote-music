/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { FunctionComponent, useState, useEffect } from "react"
import ReactDOM from "react-dom"

import { PlayerStatusChange } from "../../shared/components"
import { PlayerConfig } from "../../shared/preferences"
import { PlayerSessionLike } from "../../shared/session"

import { TransparentTitlebar } from "../components/window"
import { Player } from "../components/player"
import { ipcRenderer } from "electron"
import { PlayerServerRequest } from "./comms"

interface Req {
    type: string;
    payload?: any;
}
// declare namespace MusicKit {}

interface PlayerAppProps {
    config: PlayerConfig;
    session: PlayerSessionLike;
}
class PlayerApp extends React.Component<PlayerAppProps, PlayerSessionLike> {
    private ws: WebSocket
    private id?: string
    private interval: number
    private statusUpdateQueue: PlayerStatusChange[] = []

    public constructor(props: PlayerAppProps) {
        super(props)
        this.state = props.session

        ipcRenderer.on("close", (event) => ipcRenderer.send("session-update", {...this.state}))

        this.ws = new WebSocket(props.config.address + ":" + props.config.port)
        this.ws.onopen = (() => {
            this.send({type:"register", payload:props.config.name})
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
    }

    public componentWillUpdate(prevProps: PlayerAppProps, prevState: PlayerSessionLike) {
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
        let title = this.props.config.name
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
                    let availability = this.state.services[service]
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
    let [config, setConfig] = useState<PlayerConfig | null>(null)
    let [session, setSession] = useState<PlayerSessionLike | null>(null)

    useEffect(() => {
        ipcRenderer.once("config", (event, config: PlayerConfig) => {setConfig(config)})
        ipcRenderer.once("session", (event, session: PlayerSessionLike) => {setSession(session)})
        ipcRenderer.send("player-ready")
        return () => {ipcRenderer.removeAllListeners("config")}
    }, [])

    return config && session
        ? <PlayerApp config={config} session={session}/> 
        : <TransparentTitlebar title="Loading">
            <Player current={null} progress={0} queue={[]} playing={false} services={{}}/>
        </TransparentTitlebar>
}

ReactDOM.render(
    <AwaitedPlayerApp/>,
    document.getElementById("mount")
)