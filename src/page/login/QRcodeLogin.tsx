import React from "react";
import { Link } from 'react-router-dom';
import QRCode from 'qrcode.react';
import Form from 'antd/es/form';

import './qrcodeLogin.less';
import loginstore from '../../store/LoginStore';
// import { ipcRenderer } from "electron";
// import { User } from "render/model/Entity";
import Icon from 'antd/es/icon';
// import { initDB } from "render/model/db";
// import HeaderView from "render/header/Header";
import message from 'antd/es/message';
import { FormComponentProps } from 'antd/lib/form/Form';
import { RouterProps } from "react-router";
import { RouterStore } from '../../store/RouterStore'
import loginBanner from './../../assets/image/login-banner.png'
import ipcRender from './../../ipcRender';
import { Title } from '../title/Title';
import mainStore, { detailType } from '../../store/MainStore';
// import { LoginStore } from '../../store/LoginStore';
// import systemStore from '../../store/SystemStore';
import { observer, inject } from 'mobx-react';
import systemStore from '../../store/SystemStore';
/**
 * 二维码登录
 */
interface IQRcodeLoginProps extends RouterProps, FormComponentProps {
    routerStore: RouterStore;
    // loginStore: LoginStore;

}
@inject("routerStore")
@observer
class QRcodeLogin extends React.Component<IQRcodeLoginProps, any>{

    // private loginHandler: LoginHandler;

    private timer: any;

    private outTimer: any;

    constructor(props: any) {
        super(props);
        // this.loginHandler = new LoginHandler();
        this.props.routerStore.setHistory(this.props.history);
        this.state = {
            qrUrl: "欢迎使用沟通！",
            isOuter: false,
            loading: true
        }
    }


    componentDidMount() {
        this.getQrcode();
    }

    componentWillUnmount() {
        clearTimeout(this.outTimer);
        clearInterval(this.timer);
    }

    getQrcode = () => {
        loginstore.getQRCodeUrl().then(ret => {
            // console.log("扫码返回值********************", ret);
            clearTimeout(this.outTimer);
            this.setState({ loading: false });

            if (ret.resultCode == '1') {
                let time = 300 * 1000;
                if (ret.data && ret.data.outTime) {
                    time = Number(ret.data.outTime) * 1000
                }
                this.outTimer = setTimeout(() => {
                    this.setState({ isOuter: true });
                    clearInterval(this.timer);
                    clearTimeout(this.outTimer);
                }, time);
                this.setState({
                    qrUrl: ret.data,
                    isOuter: false,
                    loading: false
                }, () => {
                    this.timer = setInterval(async () => {
                        let loginRet = await loginstore.checkQRCodeUrl(ret.data,'');
                        // console.log(loginRet.resultMsg,'连接成功')
                        if (loginRet.resultMsg == 'ok') {
                            console.log(loginRet.data, '连接成功')
                            systemStore.salt= loginRet.data.salt?loginRet.data.salt:'';
                            clearInterval(this.timer);
                            mainStore.changeTabIndex(0);
                            mainStore.changeShowDetailType(detailType.none);
                            // systemStore.changeLocalTelephone(loginRet.data.telephone);
                            this.props.routerStore.history.push({ pathname: '/main' })
                            this.props.history.push('/main');
                            // this.loginTimer && clearTimeout(this.loginTimer)

                        } else if (loginRet.resultMsg == 'unavaliable') {
                            message.error(ret.resultMsg, 2);
                            this.setState({
                                isOuter: true,
                                loading: false,
                            })
                        }

                    }, 3000);
                })
            }
        })
    }

    update = () => {
        this.setState({
            loading: true
        })
        this.getQrcode();
    }

    render() {
        console.log("渲染的二维码号", this.state.isOuter)
        return (

            <div className="login">
                <img src={loginBanner} className="login-banner" />
                {/* <HeaderView allHeader /> */}
                <div className="qrconde-content">
                    <div className="right_ma">
                        <div className="title_ma">
                            {/* <p>手机商旅通扫码登录</p> */}
                            <p>请打开APP-扫一扫验证登录</p>
                        </div>
                        <div className="ma">
                            {
                                this.state.isOuter
                                    ? (
                                        <div className="outle">
                                            {
                                                this.state.loading
                                                    ? (
                                                        <span >
                                                            <Icon type="sync" spin style={{ fontSize: '-webkit-xxx-large' }} />
                                                        </span>
                                                    )
                                                    : (
                                                        <span className="refresh" onClick={this.update}>
                                                            <Icon type="sync" style={{ fontSize: '-webkit-xxx-large' }} />
                                                        </span>
                                                    )
                                            }
                                        </div>
                                    )
                                    : null
                            }

                            <QRCode value={this.state.qrUrl} size={280} level="L"></QRCode>
                        </div>
                        <div className="foot_ma">
                            <ul>
                                <li style={{ color: "0x3896FF" }} ><Link to="/login">账号登录</Link></li>
                            </ul>
                        </div>
                    </div>
                </div>
                {ipcRender.isElectron ? <Title /> : null}
            </div>

        );
    }
}
const QRLogin = Form.create<IQRcodeLoginProps>()(QRcodeLogin);
export default QRLogin;