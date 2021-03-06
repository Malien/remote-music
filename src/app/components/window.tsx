import React from "react"
import { ipcRenderer } from "electron"

export function windowResize() {
    let frame = document.getElementById("window-frame")
    let contents = document.getElementById("window-contents")
    if (frame && contents) contents.style.height = window.outerHeight - frame.clientHeight - 20 + "px"
}

interface BarConstructor {
    title?: string;
}

export class Titlebar extends React.Component<BarConstructor, {focused: boolean}> {
    public constructor(props: BarConstructor) {
        super(props)
        this.state = {focused: true}
    }
    
    public render() {
        return (
            <>
                <div className={"window-titlebar" + (this.state.focused ? "" : " window-disabled")}>
                    {this.props.title}
                </div>
                <div id="window-contents">
                    {this.props.children}
                </div>
            </>
        )
    }
    
    public componentDidMount() {
        ipcRenderer.on("window-blur", () => {
            this.setState({focused: false})
        })
        ipcRenderer.on("window-focus", () => {
            this.setState({focused: true})
        })
        let frame = document.getElementById("window-frame")
        let contents = document.getElementById("window-contents")
        if (frame && contents) contents.style.height = window.outerHeight - frame.clientHeight - 16 + "px"
    }
}
export class InsetTitlebar extends Titlebar {
    public render() {
        return (
            <>
                <div className={"window-inset window-titlebar" + (this.state.focused ? "" : " window-disabled")}>
                    {this.props.title}
                </div>
                <div id="window-contents">
                    {this.props.children}
                </div>
            </>
        )
    }
}

interface ToolbarWindowProps extends BarConstructor{
    toolbar?: JSX.Element;
}

export class Toolbar extends React.Component<ToolbarWindowProps, {focused: boolean; barHeight?: number}> {
    public constructor(props: ToolbarWindowProps) {
        super(props)
        this.state = {focused: true}
        ipcRenderer.on("window-blur", () => {
            this.setState({focused: false})
        })
        ipcRenderer.on("window-focus", () => {
            this.setState({focused: true})
        })
    }

    public render() {
        return (
            <>
                <div id="window-frame" className={"window-titlebar window-toolbar" + (this.state.focused ? "" : " window-disabled")}>
                    {this.props.title}
                    {this.props.toolbar}
                </div>
                <div id="window-contents" style={this.state.barHeight ? {marginTop: this.state.barHeight + "px"} : undefined}>
                    {this.props.children}
                </div>
            </>
        )
    }

    public componentDidMount() {
        //FIXME: this is quite error prone! Should somehow detect when toolbar is rendered fully
        setTimeout(windowResize, 2000)
    }
}

export class TransparentTitlebar extends Titlebar {
    public render = () => 
        <>
            <div id="window-frame" className={"window-titlebar window-transparent" + (this.state.focused ? "" : " window-disabled")}>
                {this.props.title}
            </div>
            <div id="window-contents" className={"window-passtrough"}>
                {this.props.children}
            </div>
        </>

    public componentDidMount(){}
}