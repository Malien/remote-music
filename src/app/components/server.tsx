/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { FunctionComponent } from "react"
import { Song } from "../../shared/components"

export const noArtwork = "../../../assets/SVG/no-artwork.svg"

export interface PlayerStatsProps {
    name: string;
    song?: Song;
    click?: (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => void;
    touch?: boolean;
}

export const PlayerStats: FunctionComponent<PlayerStatsProps> = props => 
    <a className={"server-player" + (props.touch ? " server-touch" : "")} onClick={props.click}>
        <img 
            src={(props.song && props.song.artwork) ? props.song.artwork.toString(): noArtwork}
            className="server-player-artwork"
            alt="Album artwork"
        />
        <div className="server-player-text">
            <span className="server-player-title">{props.name}</span>
            <span className="server-player-subtitle">{(props.song) ? (props.song.title +  " — " + props.song.artist): "Nothing is playing"}</span>
        </div>
        <img src="../../../assets/SVG/detail-arrow.svg" className="server-player-arrow"/>
    </a> 

export const CompactPlayerStats: FunctionComponent<PlayerStatsProps> = props => 
    <a className={"server-compact-player" + (props.touch ? " server-touch" : "")} onClick={props.click}>
        <img 
            src={(props.song && props.song.artwork) ? props.song.artwork.toString(): noArtwork}
            className="server-compact-player-artwork"
            alt="Album artwork"
        />
        <div className="server-compact-player-text">
            <span className="server-compact-player-title">{props.name}</span>
            <span className="server-compact-player-subtitle">{(props.song) ? (props.song.title +  " — " + props.song.artist): "Nothing is playing"}</span>
        </div>
        <img src="../../../assets/SVG/detail-arrow.svg" className="server-compact-player-arrow"/>
    </a> 
PlayerStats.displayName = "CompactPlayerStats"