// / import Form from 'antd/es/form';
import { FormComponentProps } from 'antd/lib/form/Form';
import * as React from "react";
import { RouterProps } from "react-router";

import { observer, inject } from 'mobx-react';

import { RouterStore } from '../../store/RouterStore'
import { SystemStore } from '../../store/SystemStore';
import { LoginStore } from '../../store/LoginStore';
import { message } from 'antd';



interface LoadingViewProps extends RouterProps, FormComponentProps {
    loginStore: LoginStore;
    systemStore: SystemStore;
    routerStore: RouterStore;
}
interface LoadingViewStates {
    xmppStatus: number;
}

@inject("systemStore", 'routerStore', 'loginStore')
@observer
export default class LoadingView extends React.Component<LoadingViewProps, LoadingViewStates> {

    constructor(props: any) {
        super(props);
        this.props.routerStore.setHistory(this.props.history);
        this.state = {
            xmppStatus: 0,
        };
    }

    get injected() {
        return this.props as LoadingViewProps;
    }
    componentDidMount() {
        this.loadingData()

    }
    loadingData = async () => {
        const isOk = await this.injected.loginStore.loadingData();

        console.log('----loadingData----',isOk);
        
        // var loadingNum = 0;
        // let timer = setInterval(() => {
        //     this.setState({ xmppStatus: this.injected.systemStore.xmppStatus });
        //     loadingNum+=1;
        //     if (this.state.xmppStatus == 2) {
                if(isOk == 2){
                    message.warn('系统时间与服务器时间差异太大，请校对本地时间');
                    this.props.history.push('/login')
                }
               else if (isOk) {
                    this.props.history.push('/main')
                } else {
                    message.warn('获取失败，请重新登录');
                    this.props.history.push('/login')
                }
        //         loadingNum=0;
        //         clearTimeout(timer);
        //     } else if (this.state.xmppStatus == 3) {
        //         loadingNum=0;
        //         clearTimeout(timer);
        //         message.warn('请检查网络环境！！！');
        //         this.props.history.push('/login')
        //     }else if (this.state.xmppStatus == 4) {
        //         loadingNum=0;
        //         clearTimeout(timer);
        //         message.warn('请检查网络环境！！！');
        //         this.props.history.push('/login')
        //     }
        //     if(loadingNum>8000){
        //         loadingNum=0;
        //         clearTimeout(timer);
        //         message.warn('请检查网络环境！！！');
        //         this.props.history.push('/login')
        //     }

        // }, 10);
        
        // if (isOk) {
        //     this.props.history.push('/main')
        // } else {
        //     message.warn('获取失败，请重新登录');
        //     this.props.history.push('/login')
        // }

    }
    // mystyle = {
    //     width: "35px",
    //     height: "35px",
    //     borderRadius: "50%",
    //     // opacity:0, 
    //     animation: " warn 3s ease-in",
    //     animationIterationCount: "infinite",
    //     backgroundColor: " rgba(255,185,15，1)",
    // }

    render() {
        const explain=this.injected.loginStore.onLoadingExplain;
        return (
            <div className="loadingView">
                <img
                    src={require('./../../assets/image/loading.gif')}
                ></img>
                <h3 style={{ textAlign: "center" }}>{explain}</h3>
                {/* <img
                    src={require('./../../assets/image/loading-preitem.png')}
                ></img> */}
            </div>
        );
    }
}
