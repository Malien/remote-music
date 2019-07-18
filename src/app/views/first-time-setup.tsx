/* eslint-disable @typescript-eslint/no-unused-vars */
import ReactDOM from "react-dom"
import React, { Component } from "react"

import { PrefConstructorArgs, ServerType, ClientConfig, ServerTuple, ClientTuple } from "../../shared/preferences"

import { OkButton, InputField, DoubleInputField, Checkbox, CheckboxSpoiler } from "../components/form"
import { ipcRenderer } from "electron"

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
    address?: string;
    clientPort?: string;
    playerPort?: string;
    client: boolean;
    server: boolean;
    player: boolean;
}

class Form extends Component<{}, FormState> {
    public constructor(props: {} = {}){
        super(props)
        this.state = {connectionType: ServerType.ws, client: true, server: false, player: false}
    }

    private validate(): boolean {
        return ((!this.state.client) || (this.state.client && this.state.address != undefined && this.state.clientPort != undefined))
                && ((!this.state.server) || (this.state.server && this.state.clientPort != undefined && this.state.playerPort != undefined))
                && ((!this.state.player) || (this.state.player && this.state.address != undefined && this.state.playerPort != undefined))
                && (this.state.client || this.state.server || (this.state.client && this.state.player))
    }

    public render() {
        return (
            <div>
                <DoubleInputField 
                    label="Server address" 
                    value={this.state.address} 
                    nextValue={this.state.clientPort} 
                    placeholder="ws://" 
                    nextPlaceholder="port" 
                    disabled={this.state.server} 
                    nextNumeric={true}
                    change={(address, portstr)=>{
                        this.setState(Object.assign({}, this.state, {address: address, clientPort: portstr}))
                    }}
                />
                <CheckboxSpoiler checked={this.state.server} label="Host own server" check={(event)=>{
                    if (event.target.checked) this.setState(Object.assign({}, this.state, {server: true, address:"ws://localhost"}))
                    else this.setState(Object.assign({}, this.state, {server: false}))
                }}>
                    <InputField numeric={true} value={this.state.clientPort} label="Client server port" enabled={this.state.server} change={(event)=>{
                        this.setState(Object.assign({}, this.state, {clientPort: event.target.value}))
                    }}/>
                    <InputField numeric={true} value={(this.state.playerPort)} label="Player server port" enabled={this.state.server} change={(event)=>{
                        this.setState(Object.assign({}, this.state, {playerPort: event.target.value}))
                    }}/>
                    <Checkbox disabled={!this.state.server} checked={!this.state.client && !this.state.player} label="Headless" check={(event)=>{
                        if (event.target.checked) this.setState(Object.assign({}, this.state, {client: false, player: false}))
                        else this.setState(Object.assign({}, this.state, {client: true}))
                    }}/>
                </CheckboxSpoiler>
                <CheckboxSpoiler disabled={!this.state.client} checked={this.state.player} label="Includes player" check={(event)=>{
                    this.setState(Object.assign({}, this.state, {player: event.target.checked}))
                }}>
                    <InputField numeric={true} value={(this.state.playerPort)} label="Player server port" enabled={this.state.player} change={(event)=>{
                        this.setState(Object.assign({}, this.state, {playerPort: event.target.value}))
                    }}/>
                </CheckboxSpoiler>
                <OkButton label="Continue" click={()=>{
                    let client: ClientTuple | undefined
                    let player: ClientConfig | undefined
                    let server: ServerTuple | undefined
                    if (this.state.player) {
                        player = {
                            type: this.state.connectionType,
                            port: parseInt(this.state.clientPort as string),
                            address: this.state.address as string
                        }
                    }
                    if (this.state.client) {
                        client = {
                            client: {
                                type: this.state.connectionType,
                                port: parseInt(this.state.playerPort as string),
                                address: this.state.address as string
                            },
                            player
                        }
                    }
                    if (this.state.server) {
                        server = {
                            client: {
                                type: this.state.connectionType,
                                port: parseInt(this.state.clientPort as string)
                            },
                            player: {
                                type: this.state.connectionType,
                                port: parseInt(this.state.playerPort as string)
                            }
                        }
                    }
                    let pref: PrefConstructorArgs = { client, server }
                    ipcRenderer.send("ffs-finish", pref)
                }} enabled={this.validate()}/>
            </div>
        )
    }
}

ReactDOM.render(
    <Form />,
    document.getElementById("form")
)