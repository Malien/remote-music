import React, { FunctionComponent } from "react"

import { PlayerStatus, Song } from "../../shared/components"
import { noArtwork } from "./server"
import { List } from "./layout";

export const Player: FunctionComponent<PlayerStatus & ControlsDelegate> = props => 
    <div className="player-container">
        <div className="player-display">
            <img src={props.current ? (props.current.artwork || noArtwork) : noArtwork} />
            <span className="player-display-title">{props.current ? props.current.title : "No song"}</span>
            <span className="player-display-subtitle">{props.current ? (props.current.artist + " ‒ " + props.current.album) : ""}</span>
            <MediaControls onPlay={props.onPlay} onNext={props.onNext} onPrev={props.onNext} playing={props.playing} progress={props.progress}></MediaControls>
        </div>
        <SongQueue songs={props.queue}></SongQueue>
    </div>
Player.displayName = "Player"

export const SongQueue: FunctionComponent<{songs: Song[]}> = ({songs}) => 
    <>
        <span className="player-queue-title">Next Up:</span>
        <List>
            {songs.map(song => <SongDisplay song={song}/>)}
        </List>
    </>
SongQueue.displayName = "SongQueue"

export const SongDisplay: FunctionComponent<{song: Song}> = ({song}) => 
    <div className="player-song-container">
        <img src={song.artwork || noArtwork} className="player-song-img"/>
        <div className="player-song-text">
            <span>{song.title}</span>
            <span>{song.artist + " ‒ " + song.album}</span>
        </div>
    </div>
SongDisplay.displayName = "SongDisplay"

interface ControlsDelegate {
    onPlay?: () => void;
    onNext?: () => void;
    onPrev?: () => void;
    onScrub?: (val: number) => void;
}

export const MediaControls: FunctionComponent<ControlsDelegate & {progress: number; playing: boolean}> = props => 
    <>
        <div className="player-media-container">
            <div className="player-media-scrub">
                <div className="player-media-before"/>
                <div className="player-media-after"/>
                <div className="player-media-dot"/>
            </div>
            <div className="player-media-controls">
                <button onClick={props.onPrev}><svg /></button>
                <button onClick={props.onPlay}><svg /></button>
                <button onClick={props.onNext}><svg /></button>
            </div>
        </div>
    </>