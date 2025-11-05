
import React from 'react'
import QRCode from 'qrcode.react';
import systemStore from '../../store/SystemStore';

interface Iprops {
    userId: string,
    isGroup: boolean,
    size?:number
}
export const QrcodeView = (props: Iprops) => {
    let action = '';
    if (props.isGroup) {
        action = "group";

    } else {
        action = "user";

    }
    const url = systemStore.website + "?action=" + action + "&tigId=" + props.userId;
    return (
        <QRCode value={url} size ={props.size?props.size: undefined}/>
    )
}