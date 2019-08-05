import React, { FunctionComponent } from "react"

import { PlayerStatus, Song } from "../../shared/components"

export const Player: FunctionComponent<PlayerStatus> = () => <>Player</>
Player.displayName = "Player"

export const SongQueue: FunctionComponent<{songs: Song[]}> = () => <>SongQueue</>
SongQueue.displayName = "SongQueue"

export const SongDisplay: FunctionComponent<Song> = () => <>SongDisplay</>
SongDisplay.displayName = "SongDisplay"

interface ControlsFeedback {
    onPlay: () => void;
    onNext: () => void;
    onPrev: () => void;
    playing: boolean;
}

export const MediaControls: FunctionComponent<ControlsFeedback> = () => <>MediaControls</>