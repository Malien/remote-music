import React from "react"

export const List = ({nodes}: {nodes: React.ReactNode[]} = {nodes: []}) => {
    let liNodes = nodes.map((node) => <li className="layout-list-item">{node}<div className="layout-list-divider"/></li>)
    return (
        <ul className="layout-list">
            {liNodes}
        </ul>
    )
}