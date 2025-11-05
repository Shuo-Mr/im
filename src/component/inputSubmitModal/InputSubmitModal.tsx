import React, { Component } from 'react';
import Input from 'antd/es/input';
import Modal from 'antd/es/modal';
import DatePicker from 'antd/es/date-picker';
import message from "antd/es/message";

import moment, { Moment } from 'moment';

interface IInputSubmitModalProps {
    title: string,
    labelTitle: string,
    value: string,
    sumitFun: (value: string) => Promise<boolean>,
    cancel: () => void,
    type?: string
}
interface IInputSubmitModalState {
    isLoading: boolean,
    value: string
}
export class InputSubmitModal extends Component<IInputSubmitModalProps, IInputSubmitModalState> {
    constructor(props: IInputSubmitModalProps) {
        super(props);
        this.state = {
            isLoading: false,
            value: this.props.value
        }
    }
    submit = async () => {
        if(!this.state.value){
            message.warn(`${this.props.labelTitle}不能为空`);
            return;
        }
        this.setState({
            isLoading: true
        })
        const isOk = await this.props.sumitFun(this.state.value);
        if (isOk) {
            message.success(`${this.props.title}修改成功`);
            this.props.cancel()
        } else {
            this.setState({
                isLoading: false
            })
            message.warn(`${this.props.title}修改失败`);
        }
    }
    timeChange = (date: Moment) => {
        let value = date?date.valueOf() / 1000 + '' : ''
        this.setState({ value})
    }
    disabledDate = (current: Moment) =>  {
        // Can not select days before today and today
        return current && current > moment().endOf('day');
      }
    render() {
        const props = this.props;
        let inputDom = <Input value={this.state.value} onChange={(e) => { this.setState({ value: e.target.value }) }} />;
        if (props.type && props.type == 'time') {
            inputDom = <DatePicker disabledDate={this.disabledDate} value={this.state.value ? moment(Number(this.state.value) * 1000) : undefined} onChange={this.timeChange} />
        }
        return (
            <Modal
                centered
                title={props.title}
                visible={true}
                width={340}
                okText={'确定'}
                cancelText={'取消'}
                onOk={this.submit}
                onCancel={props.cancel}
                confirmLoading={this.state.isLoading}
            >
                <div>
                    <span>
                        <span style ={{marginRight:'8px'}}>
                            {props.labelTitle}
                        </span>
                        {inputDom}
                    </span>
                </div>
            </Modal>
        )
    }
}