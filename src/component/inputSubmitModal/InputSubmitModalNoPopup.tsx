
import Input from 'antd/es/input';
import Modal from 'antd/es/modal';
import message from "antd/es/message";
import React,{ Component } from 'react';

interface IInputSubmitModalNoPopupProps {
    title: string,
    labelTitle: string,
    value: string,
    sumitFun: (value: string) => Promise<boolean>,
    cancel: () => void
}
interface IInputSubmitModalNoPopupState {
    isLoading: boolean,
    value: string
}

export class InputSubmitModalNoPopup extends Component<IInputSubmitModalNoPopupProps,IInputSubmitModalNoPopupState> {
    constructor(props:IInputSubmitModalNoPopupProps) {
        super(props);
        this.state = {
            isLoading: false,
            value: this.props.value
        }
    }
    submit = async() => {
        this.setState({
            isLoading: true
        })
         const isOk = await this.props.sumitFun(this.state.value);
         if(isOk){
          
            this.props.cancel()
         }else{
            message.warn('发送失败');
         }
         this.setState({
            isLoading: false
        })
    }
    render() {
        const props = this.props;
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
                        {props.labelTitle}
                        <Input value = {this.state.value} onChange = {(e) => {this.setState({value: e.target.value})}}/>
                    </span>
                </div>
            </Modal>
        )
    }
}

