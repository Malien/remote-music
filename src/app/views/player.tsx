/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { FunctionComponent, useState, useEffect } from "react"
import ReactDOM from "react-dom"
import { ipcRenderer } from "electron"

import { PlayerStatusChange, PlayerStatus, AuthTokensBundle, ServiceAvailability, Services, APIServiceState } from "../../shared/components"
import { PlayerConfig } from "../../shared/preferences"
import { PlayerSessionLike, ServiceMap, ServiceInfo } from "../../shared/session"
import { PlayerServerRequest } from "../../shared/comms"

import { TransparentTitlebar } from "../components/window"
import { Player } from "../components/player"
import SpotifyWebApi from "spotify-web-api-js"

interface Req {
    type: string;
    payload?: any;
}

interface PlayerAppProps {
    config: PlayerConfig;
    session: PlayerSessionLike;
}
class PlayerApp extends React.Component<PlayerAppProps, PlayerSessionLike> {
    private ws: WebSocket
    private id?: string
    private interval: number
    private statusUpdateQueue: PlayerStatusChange[] = []
    private spotifyPlayer: Spotify.SpotifyPlayer | undefined
    private spotifyAPI = new SpotifyWebApi()

    public constructor(props: PlayerAppProps) {
        super(props)
        this.state = props.session

        ipcRenderer.on("close", (event) => ipcRenderer.send("session-update", this.state))
        ipcRenderer.on("auth-token", (event, service, { token, refreshToken, ttl }: AuthTokensBundle) => {
            if (service === "spotify") {
                let spotify: ServiceInfo
                if (this.state.services.spotify.refreshToken) {
                    spotify = {
                        availability: ServiceAvailability.connected,
                        token,
                        ttl,
                        refreshToken: this.state.services.spotify.refreshToken
                    }
                } else {
                    spotify = {
                        availability: ServiceAvailability.connected,
                        token,
                        ttl,
                        refreshToken
                    }
                }
                let services: ServiceMap = {
                    ...this.state.services,
                    spotify
                }
                let statusServices = { ...this.state.status.services, "spotify": APIServiceState.authorized }
                let status = { ...this.state.status, ...statusServices }
                this.setState({ status, services, service: "spotify" })
                this.spotifyAPI.setAccessToken(token)
                if (!this.spotifyPlayer) this.spotifyPlayer = this.setupSpotify(() => this.state.services.spotify.token)
                setTimeout(this.refreshSpotifyToken, ttl * 1000 * 0.9)
            }
        })

        this.ws = new WebSocket(props.config.address + ":" + props.config.port)
        this.ws.onopen = () => {
            this.send({ type: "register", payload: props.config.name })
        }

        this.onServiceSelect = this.onServiceSelect.bind(this)
        this.onNext = this.onNext.bind(this)
        this.onPlay = this.onPlay.bind(this)
        this.onPrev = this.onPrev.bind(this)
        this.onScrub = this.onScrub.bind(this)
    }

    private setupSpotify(tokenFunc: () => string | undefined): Spotify.SpotifyPlayer {
        let player = new Spotify.Player({
            name: "Remote Music",
            getOAuthToken: (cb => {
                let tkn = tokenFunc()
                if (tkn) cb(tkn)
            })
        })
        player.addListener("account_error", console.error)
        player.addListener("initialization_error", console.error)
        player.addListener("authentication_error", this.refreshSpotifyToken.bind(this))
        player.addListener("playback_error", console.error)
        player.addListener("ready", console.log)
        player.addListener("not_ready", console.log)
        return player
    }

    private auth(service: Services) {
        switch (service) {
            case Services.spotify:
                ipcRenderer.send("auth-request", "spotify")
                break
            default: break
        }
    }

    private refreshSpotifyToken() {
        if (this.state.services.spotify &&
            this.state.services.spotify.refreshToken &&
            this.state.status.services.spotify !== APIServiceState.ivalid) {
            ipcRenderer.send("refresh-request", "spotify", this.state.services.spotify.refreshToken)
        } else {
            ipcRenderer.send("auth-request", "spotify")
        }
    }

    private updateStatus(newData: PlayerStatusChange) {
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

    private onServiceSelect(service: string) {
        let availability = this.state.services[service].availability
        switch (availability) {
            case "Connected":
                this.setState({ ...this.state, service: service })
                if (service === "spotify" && this.state.service !== "spotify") {
                    if (!this.spotifyPlayer) this.spotifyPlayer = this.setupSpotify(() => this.state.services.spotify.token)
                    this.spotifyPlayer.connect()
                } else {
                    if (this.state.service === "spotify" && this.spotifyPlayer) this.spotifyPlayer.disconnect()
                }
                break
            case "Not connected":
                this.auth(Services[service])
                break
            case "Not supported":
            case "Not reachable":
            default:
        }
    }

    private onPlay() {
        switch (this.state.service) {
            case "spotify":
                if (this.spotifyPlayer) this.spotifyPlayer.togglePlay()
                break
        }
        if (this.state.service) this.updateStatus({ playing: !this.state.status.playing })
    }

    private onNext() {
        switch (this.state.service) {
            case "spotify":
                if (this.spotifyPlayer) this.spotifyPlayer.nextTrack()
                break
        }
        if (this.state.service) {
            if (this.state.status.queue.length > 0) {
                let current = this.state.status.queue[0]
                this.updateStatus({ queue: this.state.status.queue.slice(1), current })
            } else {
                this.updateStatus({ current: null })
            }
        }
    }

    //TODO: Yeaah... I should've had a history somwhere in the state
    private onPrev() {
        switch(this.state.service) {
            case "spotify":
                if (this.spotifyPlayer) this.spotifyPlayer.previousTrack()
                break
        }
    }

    private onScrub(progress: number) {
        switch(this.state.service) {
            case "spotify":
                if (this.spotifyPlayer) this.spotifyPlayer.seek(progress*1000)
                break
        }
        if (this.state.status.current && this.state.service)
            this.updateStatus({ progress })
    }

    public componentDidMount() {
        this.ws.onmessage = (ev: MessageEvent) => {
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
        }
        window.onSpotifyWebPlaybackSDKReady = () => {
            if (this.state.services.spotify.token) this.spotifyPlayer = this.setupSpotify(() => this.state.services.spotify.token)
        }
    }

    public componentWillUpdate(prevProps: PlayerAppProps, prevState: PlayerSessionLike) {
        if (prevState.status != this.state.status) {
            let out = {}
            Object.entries(prevState.status).forEach(([key, val]) => {
                if (this.state.status[key] != val) out[key] = val
            })
            if (this.ws.readyState == WebSocket.OPEN) this.statusUpdate(out)
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
                        .map(([service, info]) => [service, { availability: info.availability, displayName: Services[service] }])
                )}
                service={this.state.service}
                onScrub={this.onScrub}
                onPlay={this.onPlay}
                onNext={this.onNext}
                onPrev={this.onPrev}
                onSelect={this.onServiceSelect} />
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