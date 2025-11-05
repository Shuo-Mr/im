import * as React from 'react';
import './noneData.less'
export interface INoneDataProps {
}

export function NoneData (props: INoneDataProps) {
    return (
      <div className = "no-data">
        <img src={require('./../../assets/image/default-statsu.png')} alt="chart"/>
        <span className='content'>快选择一个对话开始聊天吧</span>
      </div>
    );
}
