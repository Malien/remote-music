/* eslint-disable @typescript-eslint/no-unused-vars */
import { ipcRenderer } from "electron"
import React, { FunctionComponent, Component, RefObject, useEffect, useRef } from "react"

import { PlayerStatus, Song } from "../../shared/components"
import { ServiceAvailability, Services } from "../../shared/apis"

import { noArtwork } from "./server"
import { ThumbList, Dropdown } from "./layout"

interface ServiceList {
    services: Map<Services, ServiceAvailability>;
    service?: Services;
    onSelect?: (service: Services) => void;
}

interface ServiceDisplayProps {
    service: Services;
    availability: ServiceAvailability;
    selected?: boolean;
    click?: (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => void;
}

export const ServiceDisplay: FunctionComponent<ServiceDisplayProps> = props => {
    return <>
        <a className="player-service" onClick={props.click}>
            <input type="checkbox" name={props.service} className="player-service-box" checked={props.selected}/>
            <span className="player-service-name">{props.service}</span>
            <span 
                className={"player-service-status" + (props.availability == ServiceAvailability.connected
                    ? " player-service-connected" 
                    : (props.availability == ServiceAvailability.notConnected
                        ? ""
                        : " player-service-disabled"))}>
                {props.availability}
            </span>
        </a>
    </>
}
ServiceDisplay.displayName = "ServiceDisplay"

export const Player: FunctionComponent<PlayerStatus & ServiceList & ControlsDelegate & SliderDelegate> = props => {
    let displayRef = useRef<HTMLDivElement>(null)
    useEffect(() => {
        function resize(ev: UIEvent) {
            let display = displayRef.current
            if (display) {
                ipcRenderer.send("player-height", display.clientHeight + 21)
            }
        } 
        window.addEventListener("resize", resize)
        return () => {
            window.removeEventListener("resize", resize)
        }
    }, [])

    let entries = Array<JSX.Element>()
    console.log(props.services)
    props.services.forEach((availability, service) => {
        entries.push(
            <ServiceDisplay 
                service={service} 
                availability={availability} 
                selected={props.service && props.service == service}
                click={() => {if (props.onSelect) props.onSelect(service)}}
                key={entries.length}
            />)
    })

    return <div className="player-container">
        <div className="player-display" ref={displayRef}>
            <Dropdown title={props.service ? props.service : "Select music provider"}>
                <ThumbList>{entries}</ThumbList>
            </Dropdown>
            <img draggable={false}  className="player-display-background" src={props.current ? (props.current.artwork || noArtwork) : noArtwork}/>
            <img className="player-display-artwork" src={props.current ? (props.current.artwork || noArtwork) : noArtwork} />
            <span className="player-display-title">{props.current ? props.current.title : "No song"}</span>
            <span className="player-display-subtitle">{props.current ? (props.current.artist + " ‒ " + props.current.album) : ""}</span>
            <Slider onScrub={props.onScrub} timestamp={true} min={0} max={props.current ? props.current.length : 0} val={props.progress}/>
            <MediaControls onPlay={props.onPlay} onNext={props.onNext} onPrev={props.onNext} playing={props.playing}></MediaControls>
        </div>
        <SongQueue songs={props.queue}></SongQueue>
    </div>
}
Player.displayName = "Player"

export const SongQueue: FunctionComponent<{songs: Song[]}> = ({songs}) => 
    <div className="player-queue">
        <span className="player-queue-title">Next Up:</span>
        <div className="player-padding">
            <ThumbList>
                {songs.map((song, index) => <SongDisplay song={song} key={index}/>)}
            </ThumbList>
        </div>
    </div>
SongQueue.displayName = "SongQueue"

export const SongDisplay: FunctionComponent<{song: Song}> = ({song}) => 
    <>
        <img src={song.artwork || noArtwork} className="player-song-img"/>
        <div className="player-song-text">
            <span className="player-song-title">{song.title}</span>
            <span className="player-song-subtitle`">{song.artist + " ‒ " + song.album}</span>
        </div>
    </>
SongDisplay.displayName = "SongDisplay"

interface ControlsDelegate {
    onPlay?: () => void;
    onNext?: () => void;
    onPrev?: () => void;
}

export const MediaControls: FunctionComponent<ControlsDelegate & {playing: boolean}> = props => 
    (<div className="player-media-controls">
        <img draggable={false} className="player-media-button" onClick={props.onPrev} src="../../../assets/SVG/controls-prev.svg"/>
        <img draggable={false} className="player-media-button" onClick={props.onPlay} src={`../../../assets/SVG/controls-${props.playing ? "pause" : "play"}.svg`}/>
        <img draggable={false} className="player-media-button" onClick={props.onNext} src="../../../assets/SVG/controls-next.svg"/>
    </div>)
MediaControls.displayName = "MediaControlls"

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