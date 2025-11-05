import React from 'react'
import { MessageItem } from '../../interface/IChat';
import { MessageTypeWithSubName } from '../../net/Const';
import chatStore from '../../store/ChatStore';

interface ITransmitMesProps {
    mes: MessageItem
}
export function parseContent(content: string):MessageItem[]{
    if(!content){
        return []
    }
    try{

        const resultArray = JSON.parse(content);
        let resArr : MessageItem[]= []
        if(Array.isArray(resultArray)){
            resultArray.forEach(item => {
                resArr.push(JSON.parse(item) as MessageItem)
            })
        }
        return resArr
    }catch(e){
        console.error('转发消息类型，解析失败');
        return []
    }
}
export function TransmitMes(props:ITransmitMesProps){
    const mesList = parseContent(props.mes.content);
    if(Array.isArray(mesList)&& mesList.length < 1){
        console.log('消息解析失败',props.mes);
        
        return <div className = "transmit-message">
            消息解析失败
        </div>
    }
    // console.log('转发消息',mesList,props.mes);
    
    return (
        <div className = "transmit-message" onClick = {() => chatStore.showTransMesListModal(mesList)}>
            <div className = "title">
                {props.mes.objectId?props.mes.objectId:'聊天记录'}
            </div>
            {
                mesList.map((item,index)=>{
                    if(index>3){
                        return null;
                    }
                    return (
                        <div key = {item.messageId}>
                            {item.fromUserName}: {MessageTypeWithSubName[item.type]?MessageTypeWithSubName[item.type]:item.content}
                        </div>
                    )
                })
            }
            {
                mesList.length > 3 ?'...':''
            }
            <div className = "title">
                聊天记录
            </div>
        </div>
    )
}