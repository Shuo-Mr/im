import React, { Component } from 'react'
import Popover from 'antd/es/popover';
// import imsdk from '../../net/IMSDK';

interface Props {
    sendImg: (name: string, url: string) => void
    deleData: () => void
    // key:number,
    url: string,
    name: string,

}
interface State {
    list: { url: string, name: string }[],
    isLoading: boolean,
    visible: boolean
}
export class ImagWithPopover extends Component<Props, State>{
    constructor(props: Props) {
        super(props);
        this.state = {
            isLoading: true,
            list: [],
            visible: false
        }
    }
    render() {
        const { visible } = this.state;
        const { url, sendImg, name, deleData } = this.props;
        const content = (
            <div style={{ width:"50px",textAlign:"center"}}>
             <a onClick={() => { deleData(); this.setState({ visible: false });}} > 删除 </a>
            </div>
          );
        return (
            <Popover
                content={content}
                placement="top"
                title=""
                trigger="contextMenu"
                visible={visible}
                onVisibleChange={(isShow: boolean) => this.setState({ visible: isShow })}
            >
                <img
                    //    key={key}
                    src={url}
                    alt="imoji"
                    onClick={() => {
                        sendImg(name, url);
                        this.setState({ visible: false });
                    }}
                />
            </Popover>
        )
    }
}

