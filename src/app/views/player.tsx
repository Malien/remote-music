/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { FunctionComponent, useState, useEffect } from "react"
import ReactDOM from "react-dom"
import { ipcRenderer } from "electron"

import { PlayerStatusChange, PlayerStatus, AuthTokensBundle, ServiceAvailability, Services } from "../../shared/components"
import { PlayerConfig } from "../../shared/preferences"
import { PlayerSessionLike, ServiceMap } from "../../shared/session"
import { PlayerServerRequest } from "../../shared/comms"

import { TransparentTitlebar } from "../components/window"
import { Player } from "../components/player"

interface Req {
    type: string;
    payload?: any;
}
// declare namespace MusicKit {}

interface PlayerAppProps {
    config: PlayerConfig;
    session: PlayerSessionLike;
}
interface ServiceAuthState {
    spotify?: AuthTokensBundle;
}
class PlayerApp extends React.Component<PlayerAppProps, PlayerSessionLike> {
    private ws: WebSocket
    private id?: string
    private interval: number
    private statusUpdateQueue: PlayerStatusChange[] = []

    public constructor(props: PlayerAppProps) {
        super(props)
        this.state = props.session

        ipcRenderer.on("close", (event) => ipcRenderer.send("session-update", this.state))
        ipcRenderer.on("auth-token", (event, service, { token, refreshToken, ttl }: AuthTokensBundle) => {
            alert(service + ": " + token)
            if (service === "spoitify") {
                let services: ServiceMap = { 
                    ...this.state.services, 
                    "spotify": { availability: ServiceAvailability.connected, token, ttl, refreshToken} 
                }
                this.setState({ ...this.state, services })
                setTimeout(this.refreshSpotifyToken, ttl * 1000 * 0.9)
            }
        })

        this.ws = new WebSocket(props.config.address + ":" + props.config.port)
        this.ws.onopen = (() => {
            this.send({ type: "register", payload: props.config.name })
        }).bind(this)
    }

    private auth(service: Services) {
        switch (service) {
            case Services.spotify:
                ipcRenderer.send("player-auth-request", "spotify")
                break
            default: break
        }
    }

    private refreshSpotifyToken() { }

    private updateStatus(newData: any) {
        let status: PlayerStatus = { ...this.state.status, ...newData }
        this.setState({ ...this.state, status })
    }

    private statusReport() {
        if (this.id) {
            this.ws.send(JSON.stringify({ type: "heartbeat", payload: this.state.status }))
            setTimeout(this.statusReport, this.interval)
        }
    }

    private send(req: Req) {
        this.ws.send(JSON.stringify(req))
    }

    private statusUpdate(payload: PlayerStatusChange) {
        this.send({ type: "statusChange", payload })
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
                    this.send({ type: "pong", payload: this.state.status })
                    break
                case "statusChange":
                    this.setState(Object.assign({}, this.state.status, msg.payload))
                    break
            }
        }).bind(this)
    }

    public componentWillUpdate(prevProps: PlayerAppProps, prevState: PlayerSessionLike) {
        if (prevState.status != this.state.status) {
            let out = {}
            Object.entries(prevState.status).forEach(([key, val]) => {
                if (this.state.status[key] != val) out[key] = val
            })
            if (out && this.ws.readyState == WebSocket.OPEN) this.statusUpdate(out)
            else this.statusUpdateQueue.push(out)
        }
    }

    public render = () => {
        let title = this.props.config.name
        if (this.state.status.current) {
            title += `: ${this.state.status.playing ? "playing" : "paused"} ${this.state.status.current.title}`
        } 
        return <TransparentTitlebar title={title}>
            <Player
                current={this.state.status.current}
                progress={this.state.status.progress}
                playing={this.state.status.playing}
                queue={this.state.status.queue}
                services={Object.fromEntries(
                    Object.entries(this.state.services)
                        .map(([service, info]) => [service, info.availability])
                )}
                service={this.state.service}
                onScrub={progress => {
                    if (this.state.status.current)
                        this.updateStatus({ progress })
                }}
                onPlay={() => {
                    this.updateStatus({ playing: !this.state.status.playing })
                }}
                onSelect={(service) => {
                    let availability = this.state.services[service].availability
                    switch (availability) {
                        case "Connected":
                            this.updateStatus({ service: service })
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
                }} />
        </TransparentTitlebar>
    }
}

const AwaitedPlayerApp: FunctionComponent = props => {
    let [config, setConfig] = useState<PlayerConfig | null>(null)
    let [session, setSession] = useState<PlayerSessionLike | null>(null)

    useEffect(() => {
        ipcRenderer.once("config", (event, config: PlayerConfig) => { setConfig(config) })
        ipcRenderer.once("session", (event, session: PlayerSessionLike) => { setSession(session) })
        ipcRenderer.send("player-ready")
        return () => { ipcRenderer.removeAllListeners("config") }
    }, [])

    return config && session
        ? <PlayerApp config={config} session={session} />
        : <TransparentTitlebar title="Loading">
            <Player current={null} progress={0} queue={[]} playing={false} services={{}} />
        </TransparentTitlebar>
}

ReactDOM.render(
    <AwaitedPlayerApp />,
    document.getElementById("mount")
)