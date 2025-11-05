import React, { Component } from 'react';
import message from 'antd/es/message';
import Checkbox from 'antd/es/checkbox';
import Row from 'antd/es/row';
import Col from 'antd/es/col';
import Modal from 'antd/es/modal';
import loginStore from '../../store/LoginStore';
import webIM from '../../net/WebIM';
import deviceManager from '../../net/DeviceManager';

interface ICheackBoxSubmitModalProps {
    title: string,
    sumitFun: (value: string[]) => void,
    cancel: () => void,

}
interface ICheackBoxSubmitModalState {
    isLoading: boolean,
    checkedValues:string[]
   
}

export class CheackBoxSubmitModal extends Component<ICheackBoxSubmitModalProps, ICheackBoxSubmitModalState> {
    constructor(props: ICheackBoxSubmitModalProps) {
        super(props);
        this.state = {
            isLoading: false,
            checkedValues:this.getName()?this.getName():['1','2','3','4','5']
        }
        this.onChange = this.onChange.bind(this);
    }

    getName = () => {
      return loginStore.userSetting.friendFromList.split(',')        
      }
    submit = async () => {
        if(!this.state.checkedValues){
            message.warn("不能为空");
            return;
        }
        this.setState({
            isLoading: true
        })   

    let settings :any= Object.assign({},loginStore.userSetting);

    
    settings["friendFromList"]=String(this.state.checkedValues.join(","));
  
      await webIM.userSettingUpdate(settings);
    deviceManager.sendUpdateSelfInfoMsg();
      await this.props.sumitFun(this.state.checkedValues);
       
    }
  
       onChange(checkedValues:any) {
        this.setState({
            checkedValues
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
                    
                     <Checkbox.Group style={{ width: '100%' }} onChange={this.onChange} defaultValue={this.state.checkedValues}>
                       <Row>
                            <Col span={8}>
                                <Checkbox  value="1">二维码</Checkbox>
                            </Col>
                            <Col span={8}>
                                <Checkbox value="2">名片</Checkbox>
                            </Col>
                            <Col span={8}>
                                <Checkbox value="3">群组</Checkbox>
                            </Col>
                            <Col span={8}>
                                <Checkbox value="4">手机搜索</Checkbox>
                            </Col>
                            <Col span={8}>
                                <Checkbox value="5">昵称搜索</Checkbox>
                            </Col>
                            <Col span={8}>
                                <Checkbox value="6">其他</Checkbox>
                            </Col>
                            </Row>
                    </Checkbox.Group>
                </div>
            </Modal>
           
        )
    }
}