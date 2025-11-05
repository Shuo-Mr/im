import Input from "antd/es/input";
import Form from "antd/es/form";
import Button from "antd/es/button";
import Checkbox from "antd/es/checkbox";
import message from "antd/es/message";
import Select from "antd/es/select";
import Spin from "antd/es/spin";
import utils from '../../utils/utils'

import QRCode from "qrcode.react";

import "./Login.less";

import { FormComponentProps } from "antd/lib/form/Form";

import { FormEvent } from "react";
import * as React from "react";
import { RouterProps } from "react-router";
import countryCode from "../../config/contryData";
import { observer, inject } from "mobx-react";
import loginData, { LoginStore } from "../../store/LoginStore";
import { RouterStore } from "../../store/RouterStore";
import loginBanner from "./../../assets/image/login-banner.png";
import systemStore, { SystemStore } from "../../store/SystemStore";
import loginStore from "../../store/LoginStore";
import { MainStore, detailType } from "../../store/MainStore";
import ipcRender from "./../../ipcRender";
import { tr } from "../../i18n/tr";
import { Title } from "../title/Title";
import { RadioDouble } from "../../component/radioDouble/RadioDouble";
import Icon from "antd/lib/icon";
// import Switch from "antd/lib/switch";
import { isH5 } from "../../config/web.config";
import { ServerLineSelectModal } from "../../component/serverLineSelectModal/ServerLineSelectModal";



const { Option } = Select;
function fakeFinger() {
  if (!localStorage.fakeFinger) {
    localStorage.fakeFinger = Math.random().toString(16)
  }

  return Promise.resolve(localStorage.fakeFinger)
}
const globalFinger = global['finger'] || fakeFinger()
interface LoginProps extends RouterProps, FormComponentProps {
  loginStore: LoginStore;
  routerStore: RouterStore;
  telephone: string;
  password: string;
  prefix: string;
  mainStore: MainStore;
  systemStore: SystemStore;
}
interface LoginState {
  loginLoading: boolean;
  loginSwitch: boolean;
  isOuter: boolean;
  loading: boolean;
  qrUrl: string;
  showServerLineModal: boolean;
  wxShow: boolean;
  isLoading: boolean;
}

@inject("systemStore", "mainStore")
@inject("routerStore")
@inject("loginStore")
@observer
class LoginView extends React.Component<LoginProps, LoginState> {
  constructor(props: any) {
    super(props);

    // this.props.routerStore.setHistory(this.props.history);
    this.state = {
      loginLoading: false,
      loginSwitch: true,
      isOuter: false,
      loading: true,
      qrUrl: "",
      showServerLineModal: false,
      wxShow: false,
      isLoading: true,
    };

    ipcRender.getLocal();
  }
  componentDidMount() {
    const code = window.sessionStorage.getItem(window.sessionKey);
    if (code && this.isWX()) {
      this.withChatLogin(code);
      window.sessionStorage.removeItem(window.sessionKey);
    } else {
      this.setState({
        isLoading: false,
      });
    }
  }
  withChatLogin = async (code: string) => {
    //检测获取token地址
    //https://api.weixin.qq.com/sns/oauth2/access_token?appid=wxe973eb4f2cd0bf36&secret=d0600aba0fcb24b4b8785a3177ca34c2&code=011fHHzZ0pY7cY1dZnxZ0PMJzZ0fHHzg&grant_type=authorization_code
    const serial: any = await globalFinger
    const loginIp: any = systemStore.userIp
    const res = await this.props.loginStore.login({ telephone: '', password: '', dialCode: '', userId: '', serial, loginIp }, code);
    this.loginResultEdit(res, null, true);
  };
  goTurnMain = () => {
    if (this.props.loginStore.isLogin) {
      this.props.routerStore.history.push({ pathname: "/main" });
    }
  };
  //登录
  onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    this.props.form.validateFields(async (err: any, values: any) => {
      if (!err) {
        // console.log('Received values of form: ', values);
        const serial: any = await globalFinger
        const loginIp: any = systemStore.userIp

        const { remember, ...otherParams } = values;
        if (remember) {
          // this.props.loginStore.rememeber(values);
          localStorage.setItem("password", values.password + "");
          localStorage.setItem("telephone", values.telephone + "");
          localStorage.setItem('selectUrl', systemStore.selectUrl + '')
          values.prefix && localStorage.setItem("prefix", values.prefix + "");
        } else {
          this.props.loginStore.rememeber(null);
          localStorage.removeItem("password");
          localStorage.removeItem("telephone");
          localStorage.removeItem("prefix");
          localStorage.removeItem('selectUrl')
        }
        this.setState({
          loginLoading: true,
        });
        this.loginTimer && clearTimeout(this.loginTimer);
        const loginTimeOut = this.loginTimeOut;
        this.loginTimer = setTimeout(loginTimeOut, 15 * 1000);
        let ret = await this.props.loginStore.login({ ...otherParams, serial, loginIp });
        // let ret = await this.props.loginStore.login(otherParams);
        this.loginResultEdit(ret, values);
      }
    });
  };
  loginResultEdit = (ret: any, values?: any, isWx?: boolean) => {
    if (
      isWx
        ? ret.resultCode == 1 && ret.data && ret.data.code == 1
        : ret.resultCode == 1
    ) {
      this.props.mainStore.changeTabIndex(0);
      this.props.mainStore.changeShowDetailType(detailType.none);
      values && systemStore.changeLocalTelephone(values.telephone);

      // systemStore.password=values.password;
      // this.props.routerStore.history.push({ pathname: '/main' })
      this.loginTimer && clearTimeout(this.loginTimer);
      this.setState({
        isLoading: false,
      });
      this.props.history.push("/loadingView");
    } else {
      message.error(
        ret.resultMsg
          ? ret.resultMsg
          : ret.data && ret.data.msg
            ? ret.data.msg
            : "登录失败",
        2
      );
      this.setState({
        loginLoading: false,
      });
      this.loginTimer && clearTimeout(this.loginTimer);
      this.setState({
        isLoading: false,
      });
    }
  };
  loginTimeOut = () => {
    this.loginTimer && clearTimeout(this.loginTimer);
    message.warn(tr(20));
    this.setState({
      loginLoading: false,
    });
  };
  regeister = () => {
    this.props.loginStore.telephone = "";
    this.props.loginStore.password = "";
    this.props.history.push("/regeister");
  };
  forgetPassword = () => {
    const isphone = systemStore.regeditPhoneOrName == 0; //0:手机号登录 1：账号登录  2：全开
    console.log(
      "systemStore.regeditPhoneOrName",
      systemStore.regeditPhoneOrName
    );
    isphone
      ? this.props.history.push("/forget")
      : message.warn("请联系客服，找回密码");
  };

  goQrLogin = () => {
    this.setState({ loginSwitch: false });
    this.getQrcode();
  };

  outTimer: any;
  timer: any;

  getQrcode = () => {
    this.props.loginStore.getQRCodeUrl().then((ret) => {
      // console.log('扫码返回值********************', ret.data);
      clearTimeout(this.outTimer);
      this.setState({ loading: false });

      if (ret.resultCode == "1") {
        let time = 300 * 1000;
        if (ret.data && ret.data.resultMsg == "unavaliable") {
          time = 0;
        }
        this.outTimer = setTimeout(() => {
          this.setState({ isOuter: true });
          clearInterval(this.timer);
          clearTimeout(this.outTimer);
        }, time);
        this.setState(
          {
            qrUrl: ret.data,
            isOuter: false,
            loading: false,
          },
          async () => {
            const serial: any = await globalFinger
            this.timer = setInterval(async () => {
              let loginRet = await this.props.loginStore.checkQRCodeUrl(
                ret.data, serial
              );
              if (loginRet.resultMsg == "ok") {
                console.log(loginRet.data, "连接成功");
                clearInterval(this.timer);
                this.props.loginStore.loginData = loginRet.data;
                this.props.loginStore.ret = loginRet;
                systemStore.salt = loginRet.data.salt ? loginRet.data.salt : "";
                systemStore.changeLocalTelephone(loginRet.data.telephone);
                // console.log('扫码登录的',systemStore.telephone,loginRet.data)
                this.props["history"].push({ pathname: "/loadingView" });

                // this.props.loginStore.getLoginInfo(loginRet.data);
                this.props.mainStore.changeTabIndex(0);
                this.props.mainStore.changeShowDetailType(detailType.none);
              } else if (loginRet.resultMsg == "unavaliable") {
                message.error(loginRet.resultMsg, 2);
                this.setState({
                  isOuter: true,
                  loading: false,
                });
                clearTimeout(this.timer);
              } else if (loginRet.resultCode == 0) {
                message.error(loginRet.data.resultMsg, 2);
                this.setState({
                  isOuter: true,
                  loading: false,
                });
                clearTimeout(this.timer);
              }
            }, 1000);
          }
        );
      }
    });
  };

  loginTimer: NodeJS.Timeout;
  componentWillUnMount() {
    this.loginTimer && clearTimeout(this.loginTimer);
    this.timer && clearInterval(this.timer);
    this.outTimer && clearTimeout(this.outTimer);
  }

  changeForm = (e: FormEvent) => {
    e.preventDefault();
  };
  update = () => {
    this.setState({
      loading: true,
    });
    this.getQrcode();
  };

  warnMesage = () => {
    message.warn("功能未开放");
  };

  compareImg = () => {
    var x = new XMLHttpRequest();
    // let hash1 = ''
    x.open(
      "GET",
      "https://Tigase-top.obs.cn-south-1.myhuaweicloud.com/651d4edc9cb047f092b8006e1e7f5318.jpg"
    );
    x.responseType = "blob";
    var fr = new FileReader();
    x.onload = function () {
      var blob = x.response;
      fr.onloadend = function () {
        // var dataUrl = fr.result;
        // document.body.appendChild(img);
      };
      fr.readAsDataURL(blob);
      fr.onload = (evt: any) => {
        if (evt) {
        }
      };
    };
  };
  changeServerLine = () => { };
  cancelModal = () => {
    this.setState({
      showServerLineModal: false,
    });
  };
  showServerLineModal = () => {
    this.setState({
      showServerLineModal: true,
    });
  };
  wxLogin = async () => {
    //  await this.props.loginStore.wxLogin();

    this.setState({ wxShow: true });
    window.location.href = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=
		wx59c1b6aa9c2ba1b8&redirect_uri=${encodeURIComponent(
      "http://m.Tigase.top"
    )}&response_type=code&scope=snsapi_userinfo#wechat_redirect`;
  };
  isWX = () => {
    var ua = navigator.userAgent.toLowerCase();
    var isWeixin = ua.indexOf("micromessenger") != -1;
    if (isWeixin) {
      return true;
    } else {
      return false;
    }
  };
  onChange = (checked: boolean) => {

    //true:国外   false：国内
    loginStore.changState = checked;

    if (checked) {
      SystemStore.apiUrl = SystemStore.apiSwitchUrl;
    } else {
      SystemStore.apiUrl = SystemStore._apiUrl;
    }
    systemStore.selectUrl = SystemStore.apiUrl;
    let boshWebUrl = utils.apiJudge(SystemStore.apiUrl) ?  SystemStore.apiUrl.replace('api', 'im') : SystemStore.apiUrl;
    let url =  systemStore.changeUrl( boshWebUrl);
    systemStore.changXmmppUrl(url);
  };
  render() {
    if (this.state.isLoading) {
      return <Spin />;
    }
    const { getFieldDecorator } = this.props.form;
    const prefixSelector = getFieldDecorator("prefix", {
      initialValue:
        Boolean(this.props.loginStore.prefix) &&
          this.props.loginStore.prefix != "undefined"
          ? this.props.loginStore.prefix
          : "86",
    })(
      <Select style={{ width: 126 }} dropdownClassName="selectdrop">
        {countryCode.map((item, index) => {
          return (
            <Option key={index} value={item.value + ""}>
              {item.label}
            </Option>
          );
        })}
      </Select>
    );
    const { loginLoading } = this.state;
    const isTelePhoneLogin = false;//this.props.systemStore.regeditPhoneOrName == 0;
    const isAllOpen = true;//this.props.systemStore.regeditPhoneOrName == 2;

    console.log('节点选择',systemStore.selectUrl, loginStore.changState, this.props.systemStore.regeditPhoneOrName);

    let componentLogin =
      this.state.loginSwitch == true ? (
        <div className="form-wraper">
          <Form
            onSubmit={this.onSubmit}
            className="login-view"
            layout="vertical"
          >
            {!isH5 ? (
              <img
                src={require("./../../assets/image/login-code.png")}
                alt=""
                className="qrco-img"
                onClick={this.goQrLogin}
              />
            ) : null}
            <h1 className="title">
              {isAllOpen ? (
                <RadioDouble
                  titleOne={"手机号登录"}
                  titleTwo={"账号登录"}
                  preventDefault={this.changeForm}
                />
              ) : (
                  tr(10)
                )}
              {/* {tr(10)} */}
            </h1>
            {(isAllOpen && loginStore.changState) || isTelePhoneLogin ? (
              <Form.Item label={tr(11)}>
                {getFieldDecorator("telephone", {
                  rules: [
                    {
                      required: true,
                      // pattern: new RegExp(/^[1-9]\d*$/, "g"),
                      message: "请输入手机号!",
                    },
                  ],
                  getValueFromEvent: (event) => {
                    return event.target.value.replace(/\D/g, "");
                  },
                  initialValue: this.props.systemStore.telephone || "",
                })(
                  <Input
                    addonBefore={prefixSelector}
                    style={{ width: "100%" }}
                  />
                )}
              </Form.Item>
            ) : (
                <Form.Item label={tr(60)}>
                  {getFieldDecorator("telephone", {
                    rules: [{ required: true, message: "请输入帐号!" }],
                    getValueFromEvent: (event) => {
                      return event.target.value;
                    },
                    initialValue: this.props.systemStore.telephone || "",
                  })(<Input />)}
                </Form.Item>
              )}

            <Form.Item label={tr(1)}>
              {getFieldDecorator("password", {
                rules: [{ required: true, message: tr(18) }],
                initialValue: this.props.systemStore.password || "",
              })(<Input type="password" />)}
            </Form.Item>
            <Form.Item>
              <div className="edit-wraper">
                {getFieldDecorator("remember", {
                  valuePropName: "checked",
                  initialValue: Boolean(
                    this.props.systemStore.telephone &&
                    this.props.systemStore.password
                  ),
                })(<Checkbox> {tr(12)}</Checkbox>)}
                <a className="login-form-forgot" onClick={this.forgetPassword}>
                  {tr(13)}
                </a>
              </div>
            </Form.Item>
            <Form.Item>
              <div className="edit-wraper">
                <Button
                  type="primary"
                  loading={loginLoading}
                  htmlType="submit"
                  className="login-button"
                >
                  {tr(14)}
                </Button>
                {isH5 || true ? (
                  <span className="sub-text">
                    {tr(15)}
                    <a onClick={this.regeister}> {tr(16) + '>'}</a>
                  </span>
                ) : null}
                {/* <span className="sub-text">
                            {tr(15)}<a onClick={this.regeister}>  {tr(16)}></a>
                        </span> */}
                {this.state.showServerLineModal ? (
                  <ServerLineSelectModal
                    serverList={systemStore.isNodesList}
                    cancelModal={this.cancelModal}
                  />
                ) : null}
              </div>
            </Form.Item>
          </Form>
        </div>
      ) : (
          <div className="qrconde-content">
            <div className="right_ma">
              <div className="title_ma">
                {/* <p>手机商旅通扫码登录</p> */}

                <img
                  src={require("./../../assets/image/login-pc.png")}
                  alt=""
                  className="qr-img"
                  onClick={() => {
                    this.timer && clearInterval(this.timer);
                    this.outTimer && clearTimeout(this.outTimer);
                    this.setState({
                      loginSwitch: true,
                      loading: true,
                      isOuter: false,
                      qrUrl: "",
                    });
                  }}
                />
              </div>
              <div className="ma">
                <div className="qrcode">
                  <QRCode value={this.state.qrUrl} size={280} level="L" />
                  <h2>手机扫码登录</h2>
                  <p>请打开APP-扫一扫验证登录</p>
                </div>
                {this.state.isOuter ? (
                  <div className="outle">
                    {this.state.loading ? (
                      <span>
                        <Icon
                          type="sync"
                          spin
                          style={{ fontSize: "-webkit-xxx-large" }}
                        />
                      </span>
                    ) : (
                        <span className="refresh" onClick={this.update}>
                          <Icon
                            type="sync"
                            style={{ fontSize: "-webkit-xxx-large" }}
                          />
                        </span>
                      )}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        );

    return (
      <div className="login">
        <img src={loginBanner} className="login-banner" />

        {componentLogin}

        {ipcRender.isElectron ? <Title /> : null}
        
      </div>
    );
  }
}
const Login = Form.create<LoginProps>({
  async mapPropsToFields(props) {
    const userData = await loginData.loginDataUser();

    let remember = false;
    if (userData.password && userData.telephone) {
      remember = true;
    }
    return {
      telephone: Form.createFormField({ value: userData.telephone }),
      password: Form.createFormField({ value: userData.password }),
      prefix: Form.createFormField({ value: userData.prefix }),
      remember: Form.createFormField({ value: remember }),
    };
  },
})(LoginView);

export default Login;
