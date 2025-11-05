import React, { Component } from 'react'
import Spin from 'antd/es/spin';
import imsdk from '../../net/IMSDK';
import { ImagWithPopover } from './ImagWithPopover';
import { message } from 'antd';
// import CryptoJS from 'crypto-js';

interface Props {
    //发送表情的方法
    sendImg: (name: string, url: string) => void
    // updataNum: number,
    list: { url: string, name: string }[],
    isLoading: boolean,
    getData:()=>void
}
interface State {

}

export class ImojiBoard extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
       
    }
   
    // componentDidMount() {
    //     console.log('加载了')
    //     this.getData();
    // }
    // ipdateNum =-1;
    // componentDidUpdate(preprops: Props) {
    //     console.log('更新了');
    //     if (preprops.updataNum < this.props.updataNum && (this.ipdateNum == -1 || this.ipdateNum != this.props.updataNum)) {
    //         this.ipdateNum = this.props.updataNum;
    //         this.getData();
    //     }
    // }
    deleData = async (imgid: string) => {
        console.log(imgid, '删除的对象');
        let src = await imsdk.delImog(imgid);
        if (src && src.resultCode == 1) {
            this.props.getData()
        } else {
            message.warn('删除失败')
        }

    }
    render() {
        //  console.log('获取的表情数据1111111111111',  this.state.list)
        const { sendImg } = this.props;
        const { list, isLoading } = this.props;
        if (isLoading) {
            return <Spin />
        }
        if (list.length <= 0) {
            return <h4>
                暂无表情，赶紧添加表情吧
            </h4>
        }
        return (
            list.map((imojItem, index) => {
                return (
                    <div key={index} style={{height:"50px"}} >
                        <ImagWithPopover
                            // key={index}
                            sendImg={() => {
                                sendImg(imojItem.name, imojItem.url);
                            }}
                            deleData={() => {
                                this.deleData(imojItem.name)
                            }}
                            url={imojItem.url}
                            name={imojItem.name}
                        >
                        </ImagWithPopover>
                    </div>

                );
            })
        )
    }
}

