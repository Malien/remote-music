import { ipcRenderer } from "electron"
import React from "react"
import ReactDOM from "react-dom"

import { ClientConfig } from "../../shared/preferences"
import { Song } from "../../shared/components"

import { List } from "../components/layout"
import { PlayerStats } from "../components/server"

ipcRenderer.on("config", (config: ClientConfig) => {
    
})

interface PlayerDisplayState {
    players: {name: string; song?: Song}[]
}

class PlayerDisplay extends React.Component<{}, PlayerDisplayState> {
    public constructor(props: {} = {}) {
        super(props)
        this.state = {players:[]}
    }

    public render() {
        let items = this.state.players.map(player => <PlayerStats name={player.name} song={player.song}/>)
        return <List>{items}</List>
    }
}

ReactDOM.render(
    <PlayerDisplay/>,
    document.getElementById("mount")
)