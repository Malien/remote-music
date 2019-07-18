import React from "react"

interface ButtonConstructionArgs {
    label?: string;
    enabled?: boolean;
    click: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}

export const Button = ({label, click, enabled=true}: ButtonConstructionArgs) => 
    <button className="form-button" disabled={!enabled} onClick={click}>{label}</button>
export const OkButton = ({label, click, enabled=true}: ButtonConstructionArgs) => 
    <button className="form-button form-ok" disabled={!enabled} onClick={click}>{label}</button>

interface InputFieldProps {
    label?: string;
    placeholder?: string;
    enabled?: boolean;
    value?: string;
    numeric?: boolean;
    change: (event: React.ChangeEvent<HTMLInputElement>) => void;
    className?: string;
}

let inputFieldCount = 0
export const InputField = ({label, placeholder, change, value, className = "", numeric, enabled=true}: InputFieldProps) => 
    <div className={"form-field-container " + className}>
        <label htmlFor={"form-field-"+ ++inputFieldCount}>{label}</label>
        <input 
            disabled={!enabled}
            className="form-field" 
            type={numeric ? "number" : "text"}
            name={label} 
            placeholder={placeholder} 
            onChange={change}
            value={value}
        />
    </div>

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
    className?: string;
}

export class DoubleInputField extends React.Component<DoubleInputFieldProps> {
    private val1: string
    private val2: string
    private id: string = "form-double-filed-"+ ++DoubleInputField.count
    private static count = 0

    public constructor (props: DoubleInputFieldProps) {
        super(props)
    }

    public render() {
        return <div className={"form-field-container " + this.props.className}>
            <label htmlFor={this.id}>{this.props.label}</label>
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
    }
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
    <div>
        <input type="checkbox" className="form-checkbox" id={"form-checkbox-" + ++checkboxCount} value={value} disabled={disabled} checked={checked} onChange={check}/>
        <label htmlFor={"form-checkbox-" + checkboxCount}>{label}</label>
    </div>

export class CheckboxSpoiler extends React.Component<CheckboxProps, {shown: boolean}> {
    public constructor(props: CheckboxProps) {
        super(props)
        this.state = {shown: false}
    }

    public render() {
        return (
            <div>
                <Checkbox label={this.props.label} disabled={this.props.disabled} checked={this.props.checked} value={this.props.value} check={(event)=>{
                    this.setState({shown: event.target.checked})
                    this.props.check(event)}} />
                <div className="form-spoiler-divider"/>
                <div className={"form-spoiler " + this.state ? "form-shown" : "form-hidden"}>
                    {this.props.children}
                </div>
            </div>
        )
    }
}
