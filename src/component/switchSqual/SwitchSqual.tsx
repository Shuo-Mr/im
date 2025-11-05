import * as React from 'react';
import './switchSqual.less'
import { tr } from '../../i18n/tr';

export interface ISwitchSqualProps {
    changeValue: (isRight: boolean) => void,
    value: boolean
}

export class SwitchSqual extends React.Component<ISwitchSqualProps, any> {
    public render() {
        return (
            <button onClick = {() => this.props.changeValue(!this.props.value)} className = "but-wraper">
                <span className = {`left ${this.props.value?'':'selected'}`}>{tr(57)}</span>
                <span className = {`right ${this.props.value?'selected':''}`}>{tr(58)}</span>
            </button>
        );
    }
}
