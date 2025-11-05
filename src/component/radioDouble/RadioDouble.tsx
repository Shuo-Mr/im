import * as React from 'react';
import loginStore from '../../store/LoginStore';
import { FormEvent } from "react";
interface IRadioDoubleProps {
    titleOne: string,
    titleTwo: string
    preventDefault: (e: FormEvent) => void;

}
interface IRadioDoubleStates {
    changColorOne: boolean,
    changColorTwo: boolean,
}

export class RadioDouble extends React.Component<IRadioDoubleProps, IRadioDoubleStates>{
    constructor(props: IRadioDoubleProps) {
        super(props);
        this.state = {
            changColorOne: loginStore.changState,
            changColorTwo: !loginStore.changState,
        }

    }
    changeStyleOne = (e: FormEvent) => {
        loginStore.changState = true;
        this.props.preventDefault(e);
        loginStore.telephone="";
        loginStore.password='';
        this.setState({
            changColorOne: !this.state.changColorOne,
            changColorTwo: !this.state.changColorTwo,
        })
    }
    changeStyleTwo = (e: FormEvent) => {
        loginStore.changState = false;
        this.props.preventDefault(e);
        loginStore.telephone="";
        loginStore.password='';
        this.setState({
            changColorOne: !this.state.changColorOne,
            changColorTwo: !this.state.changColorTwo,
        })
    }
    render() {
        const imgStyleOne = {
            border: "none",
            background: 'white',
            WebkitUserDrag: "none",
            color: this.state.changColorOne ? "#222222" : "#969BA5"
            // color: this.state.changColorOne ? "#2C2F36" : "#969BA5"
        }
        const imgStyleTwo = {
            border: "none",
            background: 'white',
            WebkitUserDrag: "none",
            color: this.state.changColorTwo ? "#222222" : "#969BA5"
            // color: this.state.changColorOne ? "#2C2F36" : "#969BA5"
        }
        return (
            <div>
                <button onClick={this.changeStyleOne} style={{ marginRight: "40px", ...imgStyleOne }} className='button_One'>{this.props.titleOne}</button>
                <button onClick={this.changeStyleTwo} style={{ color: '#969BA5', ...imgStyleTwo }} className='button_Two'>{this.props.titleTwo}</button>
            </div>
        )
    }
}