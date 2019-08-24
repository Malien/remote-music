/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { FunctionComponent, Component, RefObject } from "react"

import { PlayerStatus, Song } from "../shared/components"
import { noArtwork } from "./server"
import { List } from "./layout"

export const Player: FunctionComponent<PlayerStatus & ControlsDelegate & SliderDelegate> = props => 
    <div className="player-container">
        <div className="player-display">
            <img draggable={false}  className="player-display-background" src={props.current ? (props.current.artwork || noArtwork) : noArtwork}/>
            <img className="player-display-artwork" src={props.current ? (props.current.artwork || noArtwork) : noArtwork} />
            <span className="player-display-title">{props.current ? props.current.title : "No song"}</span>
            <span className="player-display-subtitle">{props.current ? (props.current.artist + " ‒ " + props.current.album) : ""}</span>
            <Slider onScrub={props.onScrub} timestamp={true} min={0} max={props.current ? props.current.length : 0} val={props.progress}/>
            <MediaControls onPlay={props.onPlay} onNext={props.onNext} onPrev={props.onNext} playing={props.playing}></MediaControls>
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
}

export const MediaControls: FunctionComponent<ControlsDelegate & {playing: boolean}> = props => 
    <div className="player-media-controls">
        <img draggable={false} className="player-media-button" onClick={props.onPrev} src="../../../assets/SVG/controls-prev.svg"/>
        <img draggable={false} className="player-media-button" onClick={props.onPlay} src={`../../../assets/SVG/controls-${props.playing ? "pause" : "play"}.svg`}/>
        <img draggable={false} className="player-media-button" onClick={props.onNext} src="../../../assets/SVG/controls-next.svg"/>
    </div>

interface SliderProps {
    min: number;
    max: number;
    val: number;
    timestamp?: boolean;
    disabled?: boolean;
}

interface SliderDelegate {
    onScrub?: (val: number) => void;
}

export class Slider extends Component<SliderProps & SliderDelegate, {per: number}> {
    private dotRef: RefObject<HTMLDivElement>
    private contRef: RefObject<HTMLDivElement>
    private timeRef: RefObject<HTMLSpanElement>

    private innerPer: number

    public constructor(props) {
        super(props)
        this.dotRef = React.createRef()
        this.contRef = React.createRef()
        this.timeRef = React.createRef()
        this.state = {per: (this.props.val - this.props.min) / (this.props.max - this.props.min)}
    }

    public componentDidMount() {
        let dot = this.dotRef.current
        let cont = this.contRef.current
        let time = this.timeRef.current
        if (dot && cont) {
            cont.style.setProperty("--val", String(this.state.per))
            let _this = this
            dot.addEventListener("mousedown", (ev) => {
                _this.innerPer = this.state.per
                function move(ev: MouseEvent) {
                    if (cont) {
                        let left: number, width: number
                        ({ left, width } = cont.getBoundingClientRect())
                        let x = ev.clientX
                        if (x < left) _this.innerPer = 0
                        else if (x > left + width) _this.innerPer = 1
                        else _this.innerPer = (x - left) / width
                        cont.style.setProperty("--val", String(_this.innerPer))
                        let v = _this.innerPer * _this.props.max + _this.props.min
                        if (time) time.innerText = _this.props.disabled ? "--:--" : `${Math.floor(v / 60)}:${Math.floor(v % 60)}`
                    }
                }
                document.addEventListener("mousemove", move)
                document.addEventListener("mouseup", function add() {
                    document.removeEventListener("mouseup", add)
                    document.removeEventListener("mousemove", move)
                    if (_this.props.onScrub) _this.props.onScrub(_this.innerPer * (_this.props.max - _this.props.min) + _this.props.min)
                })
            })
        }
    }

    public static getDerivedStateFromProps({val, min, max}: SliderProps, {per}: {per: number}) {
        return (val - min) / (max - min) == per ? null : {per: (val - min) / (max - min)}
    }

    public componentDidUpdate() {
        let cont = this.contRef.current
        if (cont) cont.style.setProperty("--val", String(this.state.per))
    }

    public render = () => 
        <div className="player-slider" ref={this.contRef}>
            <div className="player-slider-fill"/>
            <div className="player-slider-dot" ref={this.dotRef}/>
            {this.props.timestamp && <>
                <span className="player-slider-left player-slider-time" ref={this.timeRef}>{this.props.disabled ? "--:--" : `${Math.floor(this.props.val / 60)}:${Math.floor(this.props.val % 60)}`}</span>
                <span className="player-slider-right player-slider-time">{this.props.disabled ? "--:--" : `${Math.floor(this.props.max / 60)}:${Math.floor(this.props.max % 60)}`}</span>
            </>}
        </div>
}