import React, { FunctionComponent, Children, useState, useEffect, useRef } from "react"

export function useKeyDown(listener: (this: Document, event: KeyboardEvent) => void) {
    useEffect(() => {
        document.addEventListener("keydown", listener)
        return () => {document.removeEventListener("keydown", listener)}
    })
}

export const List: FunctionComponent = props => {
    let liNodes = Children.map(props.children, (node) => <li className="layout-list-item">{node}<div className="layout-list-divider"/></li>)
    return (
        <ul className="layout-list">
            {liNodes}
        </ul>
    )
}
List.displayName = "List"

export const ThumbList: FunctionComponent = ({children}) => {
    let liNodes = Children.map(children, node => <>{node}<div className="layout-tlist-divider"/></>)
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
    let buttonRef = useRef<HTMLButtonElement>(null)

    useEffect(() => {
        function documentClick(event: MouseEvent) {
            let dropdown = dropdownRef.current
            let button = buttonRef.current
            if (dropdown 
                && button
                && event.target 
                && !button.contains(event.target as Node)
                && !dropdown.contains(event.target as Node)
            ) {
                setHidden(true)
            }
        }
        document.addEventListener("click", documentClick)
        return () => {
            document.removeEventListener("click", documentClick)
        }
    }, [])
    useKeyDown((event) => {
        if (event.key == "Escape" && !hidden) setHidden(true)
    })

    return <>
        <div className={"layout-dropdown-dimming" + (hidden ? " layout-dropdown-hidden" : "")}/>
        <div className="layout-dropdown-spacer"/>
        <div className={"layout-dropdown" + (hidden ? " layout-dropdown-hidden" : "")}>
            <div className={"layout-dropdown-background" + (hidden ? " layout-dropdown-hidden" : "")}/>
            <button ref={buttonRef} className="layout-dropdown-top" onClick={() => {
                setHidden(!hidden)
            }}>
                <span className="layout-dropdown-title">{props.title}</span>
                <img className={"layout-dropdown-arrow" + (hidden ? " layout-dropdown-hidden" : "")} src="../../../assets/SVG/dropdown-arrow.svg"/>
            </button>
            <div ref={dropdownRef} className={"layout-dropdown-content " + (hidden ? "layout-dropdown-hidden" : "")}>
                {props.children}
            </div>
        </div>
    </>
}
Dropdown.displayName = "Dropdown"
