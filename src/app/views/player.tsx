/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { FunctionComponent, useState, useEffect } from "react"
import ReactDOM from "react-dom"

import { PlayerStatusChange } from "../../shared/components"
import { PlayerConfig } from "../../shared/preferences"
import { PlayerSessionLike } from "../../shared/session"
import { Services } from "../../shared/apis"

import { TransparentTitlebar } from "../components/window"
import { Player } from "../components/player"
import { ipcRenderer } from "electron"
import { PlayerServerRequest } from "../../shared/comms"
import { AuthTokensBundle } from "../../shared/apis/common"

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
interface PlayerAppState {
    session: PlayerSessionLike;
    serivces: ServiceAuthState;
}
class PlayerApp extends React.Component<PlayerAppProps, PlayerAppState> {
    private ws: WebSocket
    private id?: string
    private interval: number
    private statusUpdateQueue: PlayerStatusChange[] = []

    public constructor(props: PlayerAppProps) {
        super(props)
        this.state = { session: props.session, serivces: {} }

        ipcRenderer.on("close", (event) => ipcRenderer.send("session-update", this.state.session))
        ipcRenderer.on("auth-token", (event, service, bundle: AuthTokensBundle) => {
            if (service === "spoitify") {
                let serivces = { ...this.state.serivces, spotify: bundle }
                this.setState({ serivces, session: this.state.session })
                setTimeout(this.refreshSpotifyToken, bundle.ttl * 1000 * 0.9)
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

    private updateSession(newData: any) {
        let session = { ...this.state.session, ...newData }
        this.setState({ session, serivces: this.state.serivces })
    }

    private statusReport() {
        if (this.id) {
            this.ws.send(JSON.stringify({ type: "heartbeat", payload: this.state.session }))
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
                    this.send({ type: "pong", payload: this.state.session })
                    break
                case "statusChange":
                    this.setState(Object.assign({}, this.state.session, msg.payload))
                    break
            }
        }).bind(this)
    }

    public componentWillUpdate(prevProps: PlayerAppProps, prevState: PlayerAppState) {
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
        if (this.state.session.current) {
            title += `: ${this.state.session.playing ? "playing" : "paused"} ${this.state.session.current.title}`
        }
        return <TransparentTitlebar title={title}>
            <Player
                current={this.state.session.current}
                progress={this.state.session.progress}
                playing={this.state.session.playing}
                queue={this.state.session.queue}
                services={this.state.session.services}
                service={this.state.session.service}
                onScrub={progress => {
                    if (this.state.session.current)
                        this.updateSession({ progress })
                }}
                onPlay={() => {
                    this.updateSession({ playing: !this.state.session.playing })
                }}
                onSelect={(service) => {
                    let availability = this.state.session.services[service]
                    switch (availability) {
                        case "Connected":
                            this.updateSession({ service: service })
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