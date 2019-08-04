/* eslint-disable @typescript-eslint/no-unused-vars */
import { ipcRenderer, Event } from "electron"
import React from "react"
import ReactDOM from "react-dom"

import { ClientConfig } from "../../shared/preferences"
import { PlayerStatus } from "../../shared/components"

import { List, LoadingArea } from "../components/layout"
import { PlayerStats, PlayerStatsProps } from "../components/server"
import { ToolbarWindow } from "../components/window";

function strChecksum(str: string): number {
    let s = 0
    for (let i=0; i<str.length; i++) {
        s += str.charCodeAt(i)
    }
    return s
}

function playersChecksum(p: SelectionPlayer[]): number {
    let sum = 0
    p.forEach((val) => {
        sum += strChecksum(val.id)
    })
    return sum
}
interface SelectionPlayer {
    id: string;
    name: string;
    status: PlayerStatus;
}

interface PlayerDisplayState {
    players?: SelectionPlayer[];
}

interface PlayerUpdater {
    id: string; 
    update(props: PlayerStatsProps): void;
}

interface PlayerDisplayProps {
    config: ClientConfig;
    player?: PlayerUpdater;
}

class PlayerDisplay extends React.Component<PlayerDisplayProps, PlayerDisplayState> {
    private ws: WebSocket
    private playerList: SelectionPlayer[]

    public constructor(props: PlayerDisplayProps) {
        super(props)
        this.state = {}
        this.ws = new WebSocket(props.config.address + ":" + props.config.port)
        this.ws.onopen = (() => {setInterval(this.update.bind(this), 1000)}).bind(this)
    }

    private cmp(p: SelectionPlayer[]): boolean {
        if (this.state.players) {
            return playersChecksum(this.state.players) == playersChecksum(p)
        } else return false
    }

    private update() {
        let _this = this
        this.ws.send(JSON.stringify({type: "players"}))
        this.ws.onmessage = ev => {
            let state: PlayerDisplayState
            let playerCount = 0
            let res = JSON.parse(String(ev.data))
            if (res.type == "players") {
                state = Object.assign({}, _this.state)
                if (!state.players) {
                    state.players = []
                    _this.setState(state)
                }
                this.playerList = []
                let ids = Object.keys(res.payload)
                playerCount = ids.length
                ids.forEach((id) => {
                    _this.ws.send(JSON.stringify({type: "playerStatus", payload:{id}}))
                })
            }
            else if (res.type == "playerStatus") {
                let players = _this.playerList
                if (_this.props.player && res.payload.id == _this.props.player.id) {
                    _this.props.player.update({name: res.payload.id, song: res.payload.current})
                } else players.push(res.payload)
                if (playerCount <= _this.playerList.length && !_this.cmp(players)) _this.setState({players})
            }
        }
    }

    public render() {
        let items: JSX.Element[] = []
        if (this.state.players) {
            items = this.state.players.map(player => <PlayerStats name={player.name} song={player.status.current}/>)
        }
        return (
            <LoadingArea loaded={Boolean(this.state.players)}>
                {(this.state.players && this.state.players.length != 0) 
                    ? <List>{items}</List> 
                    : <span className="selection-noplayers">No players are connected to the server</span>}
            </LoadingArea>
        )
    }
}

class Loader extends React.Component<{updater?: PlayerUpdater}, {conf?: ClientConfig}> {
    public constructor(props: {} = {}) {
        super(props)
        this.state = {}
        ipcRenderer.on("config", (_, conf: ClientConfig) => {
            this.setState({conf})
        })
    }
    public render() {
        return this.state.conf ? <PlayerDisplay player={this.props.updater} config={this.state.conf}/> : <div className="layout-loading"/>
    }
}

class SelectionApp extends React.Component<{}, {player?: string; viewProps?: PlayerStatsProps}> {
    public constructor(props: {} = {}) {
        super(props)
        this.state = {}
        ipcRenderer.on("player-register", (event: Event, player: string) => {
            this.setState({player})
        })

        this.update = this.update.bind(this)
    }

    public update(props: PlayerStatsProps) {
        this.setState({player: this.state.player, viewProps: props})
    }

    public render = () => 
        <ToolbarWindow toolbar={
            this.state.player && this.state.viewProps
                ? <PlayerStats name={this.state.viewProps.name} song={this.state.viewProps.song}/> 
                : undefined}>
            <Loader updater={
                this.state.player 
                    ? {id: this.state.player, update: this.update} 
                    : undefined}/>
        </ToolbarWindow>
}

ReactDOM.render(
    <SelectionApp/>,
    document.getElementById("mount")
)