import React, { FunctionComponent, Children, useState, useEffect, useRef } from "react"

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

interface DropdownProps {
    title?: string;
}

export const Dropdown: FunctionComponent<DropdownProps> = props => {
    let [hidden, setHidden] = useState(true)
    let dropdownRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        function listener(event: MouseEvent) {
            let dropdown = dropdownRef.current
            if (dropdown && event.target && !dropdown.contains(event.target as Node)) setHidden(true)
        }
        document.addEventListener("click", listener)
        return () => {document.removeEventListener("click", listener)}
    }, [])

    return (
        <a className="layout-dropdown-top" onClick={()=>{
            setHidden(!hidden)
        }}>
            <span className="layout-dropdown-title">{props.title}</span>
            <img className="layout-dropdown-arrow" src=""/>
            <div ref={dropdownRef} className={"layout-dropdown-content" + (hidden ? "layout-dropdown-hidden" : "")}>{props.children}</div>
        </a>
    )
}