import React from "react"
import { ipcRenderer } from "electron"

interface WindowConstructor {
    title?: string;
}

export class TitlebarWindow extends React.Component<WindowConstructor, {focused: boolean}> {
    public constructor(props: WindowConstructor) {
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
                <div className={"window-titlebar" + (this.state.focused ? "" : " window-disabled")}>
                    {this.props.title}
                </div>
                <div className="window-contents">
                    {this.props.children}
                </div>
            </>
        )
    }
}
export class InsetTitlebarWindow extends TitlebarWindow {
    public render() {
        return (
            <>
                <div className={"window-inset window-titlebar" + (this.state.focused ? "" : " window-disabled")}>
                    {this.props.title}
                </div>
                <div className="window-contents">
                    {this.props.children}
                </div>
            </>
        )
    }
}

interface ToolbarWindowProps extends WindowConstructor{
    toolbar?: JSX.Element;
}

export class ToolbarWindow extends React.Component<ToolbarWindowProps, {focused: boolean}> {
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
                <div className={"window-titlebar window-toolbar" + (this.state.focused ? "" : " window-disabled")}>
                    {this.props.title}
                    {this.props.toolbar}
                </div>
                <div className="window-contents">
                    {this.props.children}
                </div>
            </>
        )
    }
}