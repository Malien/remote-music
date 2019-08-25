import React, { FunctionComponent, Children } from "react"

export const List: FunctionComponent = props => {
    let liNodes = Children.map(props.children, (node) => <li className="layout-list-item">{node}<div className="layout-list-divider"/></li>)
    return (
        <ul className="layout-list">
            {liNodes}
        </ul>
    )
}
List.displayName = "List"

export const ThumbList: FunctionComponent = props => {
    let liNodes = Children.map(props.children, node => <>{node}<div className="layout-tlist-divider"/></>)
    return (
        <div className="layout-tlist">
            <div className="layout-tlist-divider"/>
            {liNodes}
        </div>
    )
}
ThumbList.displayName = "ThumbList"

interface LoadingAreaProps {
    loaded: boolean;
}

export const LoadingArea: React.FunctionComponent<LoadingAreaProps> = props => <>{props.loaded ? props.children : <div className="layout-loading"/>}</>
LoadingArea.displayName = "LoadingArea"