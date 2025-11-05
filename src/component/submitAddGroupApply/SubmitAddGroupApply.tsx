import React, { Component } from 'react';
import Modal from 'antd/es/modal';
import { ChatGrOrFrType } from '../../interface/IChat';
import { AvatorWithPhoto } from '../avatorWithPhoto/AvatorWithPhoto';
import message from 'antd/es/message';
import Utils from '../../utils/utils';

interface ISubmitAddGroupApplyProps {
    title: string,
    id:string,
    toUserid:string,
    classN: string,
    roomid:string,
    sumitFun: () => Promise<boolean>,
    cancel: () => void,
  
}
interface ISubmitAddGroupApplyState {
    isLoading: boolean,
    inviteObj:any,
  
}
export class SubmitAddGroupApply extends Component<ISubmitAddGroupApplyProps, ISubmitAddGroupApplyState> {
    constructor(props: ISubmitAddGroupApplyProps) {
        super(props);
        this.state = {
            isLoading: false,
            // inviteObj:props.toUserid&&props.toUserid==''?'':(eval("(" + props.toUserid + ")")?eval("(" + props.toUserid + ")"):''),
            inviteObj:props.toUserid&&props.toUserid==''?'':(Utils.jsonWithParse(props.toUserid)?Utils.jsonWithParse(props.toUserid):''),
        }
    }
  
   
   
   
    submit= async () =>{
       
      const result= await this.props.sumitFun();;
      if(result)
      {
        message.success("邀请成功");
      }
      else
      {
        message.error("邀请失败");
      }

    }
    get touserids()
    {
        return this.state.inviteObj.userIds.split(',');
    }

    render() {
        const props = this.props;
        let count = this.state.inviteObj.userIds.split && this.state.inviteObj.userIds.split(",").length;
       let reason= this.state.inviteObj.reason;
        let userName=this.state.inviteObj.userNames.split(',');
        const content=" 想邀请 " + count + " 位朋友加入群聊  ";
        return (
          
            <Modal
                centered
                title={props.title}
                visible={true}
                width={400}
                okText={'确定'}
                cancelText={'拒绝'}
                onOk={this.submit}
                onCancel={props.cancel}
                confirmLoading={this.state.isLoading}
              
            >
                <div>
                    <div className="headAvator" style={{textAlign: "center"}}>
                      
                        <AvatorWithPhoto type={ChatGrOrFrType.friend} id={props.id} size={45}/>
                        
                        <div>{props.classN}</div>
                    </div>
                      
                    <div style={{textAlign:'center', margin: "4px"}}>
                    {content}
                    </div>
                    <div style={{textAlign:'center' ,  borderBottom:"1px solid  rgb(230, 229, 229)" }}>
                    {reason}
                    </div>
                   <div style={{width:"100%",textAlign:"center",verticalAlign:"middle" , overflow:"auto", maxHeight:"150px" }}>
                    {   
                        this.touserids.map((itemId:string,index:string)=>{
                            return <div className="item" style={{display: 'inline-block',margin: '10px'}} key={index}> <AvatorWithPhoto type={ChatGrOrFrType.friend} id={itemId}/> <div key={index}>{userName[index]}</div> </div>
                        })
                    }
                    </div>
                </div> 
               
            </Modal>
        )
    }
}