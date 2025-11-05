import React from 'react';
import { SelectItemType, SelectType } from '../../interface/ITransmit';
import { ChatGrOrFrType } from '../../interface/IChat';
import Tag from 'antd/es/tag';

interface ISelectItemProps extends SelectItemType {
    onClose: (chat:SelectItemType) => void
}

function SelectTransmitItem (props: ISelectItemProps){
    let name = '';
    const data : any= props.data
    if(props.transmitType == SelectType.chat){
        if(data.type == ChatGrOrFrType.group){
            name = data.name;
        } else {
            
            name = data.remarkName || data.name;
        }
    } else if (props.transmitType == SelectType.group){
        name = data.name
    } else if (props.transmitType == SelectType.friend) {
        name = data.remarkName || data.toNickname
    }
    return (
        <Tag onClick = {()=> props.onClose(props)} closable style = {{marginBottom:'4px'}}>
            {name}
        </Tag>
    )
}

export default React.memo(SelectTransmitItem)