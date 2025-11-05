import React from 'react';
import './title.less';
import ipcRender from '../../ipcRender';
import {isH5}  from '../../config/web.config';
// import Button from 'antd/es/button';
// import { titleImg } from '../../config/imojiDataList';

export class Title extends React.Component<any, any>{
    constructor(props: any) {
        super(props);
    }

    render() {
        return (
            !isH5? <div className="top-title" >
                <button key={'close'} className="close" onClick={ipcRender.close}/>
                <button key={'max'} className="max" onClick={ipcRender.max}/>
                <button key={'mxin'} className="min" onClick={ipcRender.min}/>
            </div>:null
        )
    }
}