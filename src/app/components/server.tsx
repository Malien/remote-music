/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { FunctionComponent } from "react"
import { Song } from "../../shared/components"

//TODO: Provide artwork
export const noArtwork = "../../../assets/SVG/no-artwork.svg"

export interface PlayerStatsProps {
    name: string;
    song?: Song;
    click?: (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => void;
}

export const PlayerStats: FunctionComponent<PlayerStatsProps> = props => 
    <a className="server-player" onClick={props.click}>
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
    </a> 
PlayerStats.displayName = "PlayerStats"