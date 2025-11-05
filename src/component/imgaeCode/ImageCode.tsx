import * as React from 'react';
import Spin from 'antd/es/spin';
import './imageCode.less'
import imsdk from '../../net/IMSDK';
import { message } from 'antd';
import loginStore from '../../store/LoginStore';
export interface IImageCodeProps {
    updateNum: number
}

export interface IImageCodeState {
    isLoading: boolean,
    imgUrl: string
}

export default class ImageCode extends React.Component<IImageCodeProps, IImageCodeState> {
    constructor(props: IImageCodeProps) {
        super(props);

        this.state = {
            isLoading: false,
            imgUrl: ''
        }
    }
    componentWillReceiveProps(nextProps:IImageCodeProps){
        if(nextProps.updateNum > this.props.updateNum){
            this.getTestData();
        }
    }

    componentDidMount(): void {
        this.getTestData()
    }
    getTestData = async() => {
        this.setState({
            isLoading: true
        })
        let res = await imsdk.getCaptcha();
        if (res.resultCode === 1) {
            this.setState({
                isLoading: false,
                imgUrl: res.data.code
            })
            // 设置参数
            loginStore.captchaSeed = res.data.captchaSeed
        } else {
            loginStore.captchaSeed = ''
            message.error('获取验证码失败')
        }
    }
    public render() {
        const {
            isLoading,
            imgUrl
        } = this.state;
        return (
            <div className="test-wraper">
                <div className = "img-wraper">
                    {
                        isLoading
                            ? <Spin />
                            : (
                                imgUrl
                                    ? <img src={imgUrl} onClick={this.getTestData} title= "点击重试"/>
                                    : <span onClick={this.getTestData} className = "get-but-imgae">点击获取 </span>
                            )
                    }
                </div>
                {/* <span className="get-but" >
                    重新获取
                </span> */}
            </div>
        );
    }
}
