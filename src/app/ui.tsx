/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react"
import ReactDOM from "react-dom"

import Hello from "./components/Hello"
//TODO: remove cause webpack does not have right configuration for multiple entries
ReactDOM.render(
    <Hello name="Steve" />,
    document.getElementById("insertion")
)