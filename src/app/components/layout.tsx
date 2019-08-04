import React, { FunctionComponent, Children } from "react"

export const List: FunctionComponent = props => {
    let liNodes = Children.map(props.children, (node) => <li className="layout-list-item">{node}<div className="layout-list-divider"/></li>)
    return (
        <ul className="layout-list">
            {liNodes}
        </ul>
    )
}

interface LoadingAreaProps {
    loaded: boolean;
}

export const LoadingArea: React.FunctionComponent<LoadingAreaProps> = props => <>{props.loaded ? props.children : <div className="layout-loading"/>}</>