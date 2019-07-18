import React from "react"

export class FormAgregator {
    public state: Map<string, string> = new Map<string, string>()
    private callback: (name: string, state: Map<string, string>) => void
    public constructor(callback: (name: string, state: Map<string, string>) => void) {
        this.callback = callback
    }
    public handleField(name: string, value: string) {
        this.state.set(name, value)
    }
    public handleButton(name: string) {
        this.callback(name, this.state)
    }
    public button(name: string, label?: string) {
        let _this = this
        return <Button label={label} click={() => _this.handleButton(name)}/>
    }
    public okButton(name: string, label?: string) {
        let _this = this
        return <OkButton label={label} click={() => _this.handleButton(name)}/>
    }
    public field(name: string, label?: string, placeholder?: string) {
        let _this = this
        return <InputField label={label} placeholder={placeholder} change={(event) => _this.handleField(name, event.target.value)}/>
    }
}

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

export const InputField = ({label, placeholder, change, value, className = "", numeric, enabled=true}: InputFieldProps) => 
    <div className={"form-field-container " + className}>
        {label}
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
    private val1: string;
    private val2: string;

    public constructor (props: DoubleInputFieldProps) {
        super(props)
    }

    public render() {
        return <div className={"form-field-container " + this.props.className}>
            {this.props.label}
            <input 
                disabled={this.props.disabled}
                className="form-field form-double-1" 
                type={this.props.numeric ? "number" : "text"} 
                name={this.props.label} 
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
                name={this.props.label} 
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

export const Checkbox = ({label, value, check, disabled, checked}: CheckboxProps) => 
    <div>
        <input type="checkbox" className="form-checkbox-box" value={value} disabled={disabled} checked={checked} onChange={check}/>
        {label}
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
