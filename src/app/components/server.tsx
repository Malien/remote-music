import React from "react"
import { Song } from "../../shared/components"

export const noArtwork = ""

interface PlayerStatsProps {
    name: string;
    song?: Song;
}

export const PlayerStats = (props: PlayerStatsProps) => 
    <div className="server-player">
        <img 
            src={(props.song && props.song.artwork) ? props.song.artwork.toString(): noArtwork}
            className="server-player-artwork"
            alt="Album artwork"
        />
        <div className="server-player-text">
            <span className="server-player-title">{props.name}</span>
            <span className="server-player-subtitle">{(props.song) ? (props.song.title +  " — " + props.song.artist): "Nothing is playing"}</span>
        </div>
        <svg className="server-player-arrow">
            <path d="M0 1 L1 0 L0 -1 Z"/>
        </svg>
    </div> 