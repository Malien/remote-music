import React from "react"
interface ButtonConstructionArgs {
    label?: string;
    enabled?: boolean;
    click: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}

export const Button = ({label, click, enabled=true}: ButtonConstructionArgs) => 
    <button className="form-button" disabled={!enabled} onClick={click}>{label}</button>
Button.displayName = "Button"
export const OkButton = ({label, click, enabled=true}: ButtonConstructionArgs) => 
    <button className="form-button form-ok" disabled={!enabled} onClick={click}>{label}</button>
OkButton.displayName = "OkButton"

interface InputFieldProps {
    label?: string;
    placeholder?: string;
    enabled?: boolean;
    value?: string;
    numeric?: boolean;
    change: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

let inputFieldCount = 0
export const InputField = ({label, placeholder, change, value, numeric, enabled}: InputFieldProps) => 
    <>
        <label className={"form-field-label" + (enabled ? "" : " form-disabled")} htmlFor={"form-field-"+ ++inputFieldCount}>{label}</label>
        <input 
            disabled={!enabled}
            className="form-field" 
            type={numeric ? "number" : "text"}
            name={label} 
            placeholder={placeholder} 
            onChange={change}
            value={value}
        />
    </>
InputField.displayName = "InputField"

interface DoubleInputFieldProps {
    nextPlaceholder?: string;
    nextValue?: string;
    label?: string;
    placeholder?: string;
    disabled?: boolean;
    value?: string;
    numeric?: boolean;
    nextNumeric?: boolean;
    change: (val1: string, val2: string) => void;
}

export class DoubleInputField extends React.Component<DoubleInputFieldProps> {
    private val1: string
    private val2: string
    private id: string = "form-double-filed-"+ ++DoubleInputField.count
    private static count = 0

    public constructor (props: DoubleInputFieldProps) {
        super(props)
    }

    public render = () => <>
        <label className={"form-field-label" + (this.props.disabled ? " form-disabled" : "")} htmlFor={this.id}>{this.props.label}</label>
        <div className="form-double-container">
            <input 
                disabled={this.props.disabled}
                name={this.id}
                className="form-field form-double-1" 
                type={this.props.numeric ? "number" : "text"} 
                placeholder={this.props.placeholder} 
                onChange={(event)=> {
                    this.val1 = event.target.value
                    this.props.change(this.val1, this.val2)
                }}
                value={this.props.value}
            />
            <input
                disabled={this.props.disabled}
                className="form-field form-double-2"
                type={this.props.nextNumeric ? "number" : "text"} 
                placeholder={this.props.nextPlaceholder} 
                onChange={(event)=> {
                    this.val2 = event.target.value
                    this.props.change(this.val1, this.val2)
                }}
                value={this.props.nextValue}
            />
        </div>
    </>
}

interface CheckboxProps {
    label: string;
    value?: string;
    disabled?: boolean;
    checked: boolean;
    check: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

let checkboxCount = 0
export const Checkbox = ({label, value, check, disabled, checked}: CheckboxProps) => 
    <>
        <input type="checkbox" className="form-checkbox" id={"form-checkbox-" + ++checkboxCount} value={value} disabled={disabled} checked={checked} onChange={check}/>
        <label className="form-checkbox-label" htmlFor={"form-checkbox-" + checkboxCount}>{label}</label>
    </>
Checkbox.displayName = "Checkbox"

export const CheckboxSpoiler: React.FunctionComponent<CheckboxProps> = props => <>
    <Checkbox label={props.label} disabled={props.disabled} checked={props.checked} value={props.value} check={props.check}/>
    <div className="form-spoiler-divider"/>
    <div className={"form-spoiler" + ((props.checked) ? " form-shown" : " form-hidden")}>
        {props.children}
    </div>
</>
