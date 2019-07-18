/* eslint-disable @typescript-eslint/no-unused-vars */
import { ipcRenderer, BrowserWindow } from "electron"
import ReactDOM from "react-dom"
import React, { Component } from "react"

import { PrefConstructorArgs, ServerType, ClientConfig, ServerConfig, ServerTuple } from "../../shared/preferences"

import { Button, OkButton, InputField, DoubleInputField, Checkbox, CheckboxSpoiler } from "../components/form"

// let form = new FormAgregator((name, state) => {console.log(state)})

// let formView = 
// <div className="form">
//     {form.field("test", "label", "placeholder")}
//     {/* <div style={{"display":"flex"}}> */}
//     {form.okButton("Submit")}
//     {/* </div> */}
// </div>

interface FormState {
    connectionType: ServerType;
    connectionAddr?: string;
    connectionPort?: number;
    server?: {clientPort?: number; playerPort?: number};
    playerPort?: number;
}

class Form extends Component<{}, FormState> {
    public constructor(props: {} = {}){
        super(props)
        this.state = {connectionType: ServerType.ws}
    }

    private validate(): boolean {
        return ((typeof this.state.server != "undefined" && this.state.server != null)
            && typeof this.state.server.clientPort != "undefined"
            && typeof this.state.server.playerPort != "undefined")
            || (typeof this.state.connectionAddr != "undefined"
            && typeof this.state.connectionPort != "undefined")
    }

    public render() {
        return (
            <div>
                <DoubleInputField label="Server address" placeholder="ws://" nextPlaceholder="port" change={(address, portstr)=>{
                    let port = parseInt(portstr)
                    if (!isNaN(port) && port > 80) {
                        this.setState(Object.assign({}, this.state, {connectionAddr: address, connectionPort: port}))
                    }
                }}/>
                <CheckboxSpoiler label="Host own server" check={(event)=>{
                    if (event.target.checked) this.setState(Object.assign({}, this.state, {server: {}}))
                    else this.setState(Object.assign({}, this.state, {server: null}))
                }}>
                    <InputField label="Client server port " change={(event)=>{
                        let port = parseInt(event.target.value)
                        if (!isNaN(port) && port > 80 && this.state.server) {
                            let state = Object.assign({}, this.state)
                            let server = state.server as {clientPort?: number; playerPort?: number}
                            server.clientPort = port
                            this.setState(state)
                        }
                    }}/>
                    <InputField label="Player server port " change={(event)=>{
                        let port = parseInt(event.target.value)
                        if (!isNaN(port) && port > 80 && this.state.server) {
                            let state = Object.assign({}, this.state)
                            let server = state.server as {clientPort?: number; playerPort?: number}
                            server.playerPort = port
                        }
                    }}/>
                </CheckboxSpoiler>
                <CheckboxSpoiler label="Includes player" check={(event)=>{
                    if (!event.target.checked) {
                        let state: FormState = Object.assign({}, this.state)
                        delete state.playerPort
                        this.setState(state)
                    }
                }}>
                    <InputField label="Player server port" change={(event)=>{
                        let port = parseInt(event.target.value)
                        if (!isNaN(port) && port > 80 && this.state.server) {
                            this.setState(Object.assign({}, this.state, {playerPort: port}))
                        }
                    }}/>
                </CheckboxSpoiler>
                <OkButton label="Continue" click={()=>{
                    let clientClient: ClientConfig
                    let clientPlayer: ClientConfig
                    let server: ServerTuple
                    if (this.state.server) {
                        let serverClient = {
                            type: ServerType.ws,
                            port: this.state.server.clientPort as number
                        }
                        clientClient = Object.assign({}, serverClient, {address: "localhost"})
                        let serverPlayer = Object.assign({}, serverClient, {port: this.state.server.playerPort})
                        server = {client: serverClient, player: serverPlayer}
                        if (this.state.playerPort) {
                            clientPlayer = Object.assign({}, clientClient, {port: this.state.server.playerPort})
                        }
                    } else {
                        clientClient = {
                            type: ServerType.ws, 
                            port: this.state.connectionPort as number,
                            address: this.state.connectionAddr as string
                        }
                        if (this.state.playerPort) {
                            clientPlayer = Object.assign({}, clientClient, {port: this.state.playerPort})
                        }
                    }
                }} enabled={this.validate()}/>
            </div>
        )
    }
}

ReactDOM.render(
    <Form />,
    document.getElementById("form")
)

let prefConstructor: PrefConstructorArgs = {
    client: {
        client: {
            type: ServerType.ws,
            port: 9090,
            address: "localhost"
        },
        player: {
            type: ServerType.ws,
            port: 9091,
            address: "localhost"
        }
    },
    server: {
        client: {
            type: ServerType.ws,
            port: 9090
        },
        player: {
            type: ServerType.ws,
            port: 9091
        }
    }
}
console.log(prefConstructor)
// ipcRenderer.send("ffs-finish", prefConstructor)s