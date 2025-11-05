
import Button from 'antd/es/button';
import Form from 'antd/es/form';
import Input from 'antd/es/input';
import message from 'antd/es/message';
import Select from 'antd/es/select';
import Row from 'antd/es/row';
import Col from 'antd/es/col';

import { FormComponentProps } from 'antd/lib/form/Form';
import { FormEvent } from "react";
import * as React from "react";
import { RouterProps } from "react-router";
import countryCode from "../../config/contryData";
import { Link } from 'react-router-dom';

import loginBanner from './../../assets/image/login-banner.png'
import { observer, inject } from 'mobx-react';

import loginStore from '../../store/LoginStore';
import { RouterStore } from '../../store/RouterStore'
import { SystemStore } from '../../store/SystemStore';
import ImageCode from '../../component/imgaeCode/ImageCode';
import imsdk from '../../net/IMSDK';
import { tr } from '../../i18n/tr';
import PersonalInformationFrom from '../../component/regester/PersonalInformation';
import { RadioDouble } from '../../component/radioDouble/RadioDouble';

import { Title } from '../../page/title/Title';
import ipcRender from '../../ipcRender';

const { Option } = Select;

function fakeFinger() {
    if (!localStorage.fakeFinger) {
        localStorage.fakeFinger = Math.random().toString(16)
    }

    return Promise.resolve(localStorage.fakeFinger)
}
const globalFinger = global['finger'] || fakeFinger()
interface RegesterProps extends RouterProps, FormComponentProps {
    // loginStore: LoginStore;
    systemStore: SystemStore;
    routerStore: RouterStore;
}
interface RegesterStates {
    showPerInfromations: boolean,
    mesTimes: number,
    confirmDirty: boolean,
    isLoading: boolean,
    telephone: string,
    inviteCode: string,

}
//核验手机号
function checkTelephone(telephone: string) {
    // let telphoneReg = /^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1}))+\d{8})$/;
    let telphoneReg = /^(([1-9]{1})+\d{4,})$/;
    if (!telphoneReg.test(telephone)) {
        return false;
    } else {
        return true;
    }

}
@inject("loginStore", "systemStore", 'routerStore')
@observer
class RegesterView extends React.Component<RegesterProps, RegesterStates> {

    constructor(props: any) {
        super(props);;
        this.props.routerStore.setHistory(this.props.history);
    }


    state = {
        showPerInfromations: false,
        confirmDirty: false,
        mesTimes: 0,
        isLoading: false,
        telephone: loginStore.telephone ? loginStore.telephone : '',
        password: loginStore.password ? loginStore.password : '',
        inviteCode: loginStore.inviteCode ? loginStore.inviteCode : '',

    };

    componentWillUnmount() {
        this.mesTimer && clearInterval(this.mesTimer);
    }
    goTurnMain = () => {
        // if (this.props.store.isLogin) {
        //     this.props['history'].push({ pathname: '/main' });
        // }
    };
    getCode = () => {
        const form = this.props.form;
        if (!form.getFieldValue('telephone')) {
            message.warn('请输入手机号')
            return;
        }
        this.sendMesCode();
    }
    sendMesCode = async () => {
        const form = this.props.form;
        //数据核验
        const imgCode = form.getFieldValue('imgCode');
        const areaCode = form.getFieldValue('areaCode');
        const telephone = form.getFieldValue('telephone');

        if (!checkTelephone(telephone)) {
            message.warn("请输入正确的手机号", 2);
            return;
        }

        if (!Boolean(imgCode)) {
            message.warn("请输入图形码", 2);
            return;
        }
        const params = {
            telephone,
            areaCode,
            version: 0,
            imgCode,
            isRegister: 1,
        }
        this.mesTimeControl();
        const res = await imsdk.getMsgCode(params);
        if (res.resultCode == 1) {
            message.success('验证码已发送!');
        } else {
            message.warn(res.resultMsg || '验证码发送失败，请重试!');
            this.mesTimer && clearInterval(this.mesTimer);
            this.setState({
                mesTimes: 0
            })
        }
    }
    mesTimer: any;
    mesTimeControl = () => {
        this.setState({ mesTimes: 60 });
        this.mesTimer = setInterval(() => {
            if (this.state.mesTimes < 1) {
                this.mesTimer && clearInterval(this.mesTimer);
            }
            this.setState({ mesTimes: this.state.mesTimes - 1 })
        }, 1000) as any;
    }
    validateToNextPassword = (rule: any, value: any, callback: any) => {
        const form = this.props.form;
        if (value && value !== form.getFieldValue('password')) {
            callback('两次密码不一致!');
        } else {
            callback();
        }
    };
    handleConfirmBlur = (e: any) => {
        const value = e.target.value;
        this.setState({ confirmDirty: this.state.confirmDirty || !!value });
    };
    regTimer: any = null;


    testRegester = async (e: FormEvent) => {
        e.preventDefault();
        this.props.form.validateFields(async (err: any, values: any) => {
            if (!err) {
                const { ...otherParams } = values;
                this.setState({
                    isLoading: true,

                })
                this.regTimer && clearTimeout(this.regTimer)
                let reg = /^[0-9a-zA-Z]+$/;
                if (this.props.systemStore.regeditPhoneOrName === 2 && loginStore.changState || this.props.systemStore.regeditPhoneOrName === 0) {

                } else {
                    if (!reg.test(otherParams.telephone)) {
                        message.warn('账户必须数字和字符组合');
                        this.setState({
                            isLoading: false,

                        })
                        return;
                    }
                }



                loginStore.telephone = otherParams.telephone;
                loginStore.password = otherParams.password;
                loginStore.imgCode = otherParams.imgCode;

                this.props.systemStore.telephone = loginStore.telephone;
                this.props.systemStore.password = loginStore.password;
                if (otherParams.areaCode) {
                    loginStore.areaCode = otherParams.areaCode
                }
                if (otherParams.smsCode) {
                    loginStore.smsCode = otherParams.smsCode
                }
                const serial: any = await globalFinger
                otherParams.serial = serial;
                let ret = await loginStore.testRegeister(otherParams);
                const regTimeOut = this.regTimeOut;
                this.regTimer = setTimeout(regTimeOut, 15 * 1000);
                if (ret.status) {
                    this.regTimer && clearTimeout(this.regTimer)


                    this.setState({
                        isLoading: false,
                        showPerInfromations: !this.state.showPerInfromations

                    })
                }
                else {
                    //由于是账号注册，显示手机号已被注册
                    message.error(ret.info, 2);
                    this.setState({
                        isLoading: false
                    })
                    this.regTimer && clearTimeout(this.regTimer)
                }
            }
        });
    }

    regester = async (e: FormEvent) => {
        e.preventDefault();

        this.props.form.validateFields(async (err: any, values: any) => {
            if (!err) {
                // console.log('Received values of form: ', values);
                // const { repassword, ...otherParams } = values;
                this.setState({
                    isLoading: true
                })
                this.regTimer && clearTimeout(this.regTimer)
                const serial: any = await globalFinger
                console.log(serial, '???????', values)
                let ret = await loginStore.regeister(serial);
                const regTimeOut = this.regTimeOut;
                this.regTimer = setTimeout(regTimeOut, 15 * 1000);
                if (ret.status) {

                    this.props.systemStore.sex = String(loginStore.sex);
                    this.props.systemStore.user.nickname = loginStore.nickname;
                    this.props.systemStore.user.sex = loginStore.sex;
                    loginStore.telephone = '';
                    loginStore.password = '';
                    loginStore.sex = 0;
                    loginStore.nickname = '';
                    loginStore.hasSetSecret = false;
                    this.props.history.push('/login')
                    message.success('注册成功')
                    this.regTimer && clearTimeout(this.regTimer)
                } else {
                    message.error(ret.info, 2);
                    //由于是账号注册，显示手机号已被注册
                    // message.error("注册失败", 2);
                    this.setState({
                        isLoading: false
                    })
                    this.regTimer && clearTimeout(this.regTimer)
                }
            }
        });
    };
    regTimeOut = () => {
        this.regTimer && clearTimeout(this.regTimer);
        message.warn('注册超时，请重试')
        this.setState({
            isLoading: false
        });
    }
    backToRegester = () => {

        this.setState({
            showPerInfromations: !this.state.showPerInfromations
        })
    }
    componentWillUnMount() {
        this.regTimer && clearTimeout(this.regTimer)
    }
    changeForm = (e: FormEvent) => {
        e.preventDefault();
    }

    render() {
        const { getFieldDecorator } = this.props.form;

        const prefixSelector = getFieldDecorator('areaCode', {
            initialValue: '86',
        })(
            <Select style={{ width: 96 }}>
                {
                    countryCode.map((item, index) => {
                        return <Option key={index} value={item.value}>{item.label}</Option>
                    })
                }
            </Select>,
        );
        const { systemStore } = this.props;
        const isPhone = systemStore.regeditPhoneOrName === 0;
        const isAllOpen = systemStore.regeditPhoneOrName === 2;
        // const isPhone=false
        // const isAllOpen =true;
        // console.log(loginStore.changState,'----------------------------------');
        if (!this.state.showPerInfromations) {
            return (
                <div className="login regeister">
                    <img src={loginBanner} className="login-banner" />

                    <div className="form-wraper">
                        <Form
                            onSubmit={this.testRegester}
                            // onSubmit={this.backToRegester}
                            className="login-form"
                            id="login-view"
                            layout="vertical">
                            <h1 className="title">
                                {
                                    isAllOpen ?
                                        <RadioDouble
                                            titleOne={'手机号注册'}
                                            titleTwo={'账号注册'}
                                            preventDefault={this.changeForm}
                                        />
                                        : tr(59)
                                }

                            </h1>
                            {
                                (isAllOpen && loginStore.changState || isPhone)
                                    ? (
                                        <>
                                            <Form.Item label={tr(48)}>
                                                {getFieldDecorator('telephone', {
                                                    rules: [{ required: true, message: '请输入手机!' }],
                                                    getValueFromEvent: (event) => {
                                                        return event.target.value.replace(/\D/g, '')
                                                    },
                                                    initialValue: loginStore.telephone ? loginStore.telephone : ''
                                                })(<Input addonBefore={prefixSelector} style={{ width: '100%' }} />)}
                                            </Form.Item>
                                            <Form.Item label={tr(1)} >
                                                {getFieldDecorator('password', {
                                                    rules: [{ required: true, message: '请输入密码!' }],
                                                    initialValue: loginStore.password ? loginStore.password : ''
                                                })(
                                                    <Input.Password />
                                                )}
                                            </Form.Item>
                                            {
                                                <>
                                                    <Form.Item label={tr(64)} extra="">
                                                        <Row gutter={8}>
                                                            <Col span={12}>
                                                                {getFieldDecorator('smsCode', {
                                                                    rules: [{ required: true, message: '请输入手机验证码!' }],
                                                                })(<Input />)}
                                                            </Col>
                                                            <Col span={12} style={{ textAlign: 'center' }}>
                                                                {
                                                                    this.state.mesTimes > 0
                                                                        ? this.state.mesTimes + 's后重试'
                                                                        : <a onClick={this.getCode}>获取验证码</a>
                                                                }
                                                            </Col>
                                                        </Row>
                                                    </Form.Item>
                                                </>
                                            }
                                        </>
                                    )
                                    : (
                                        <>
                                            <Form.Item label={tr(60)}>
                                                {getFieldDecorator('telephone', {
                                                    rules: [{
                                                        required: true,
                                                        pattern: new RegExp(/[A-Za-z]/, "g"),
                                                        message: '请输入帐号(必须包含字母)!'
                                                    }],
                                                    getValueFromEvent: (event) => {
                                                        return event.target.value
                                                    },
                                                    initialValue: loginStore.telephone ? loginStore.telephone : ''
                                                })
                                                    (
                                                        <Input
                                                            maxLength={30}
                                                            minLength={5}
                                                            placeholder="请输入帐号"
                                                        />,
                                                    )}
                                            </Form.Item>
                                            <Form.Item label={tr(1)} >
                                                {getFieldDecorator('password', {
                                                    rules: [{ required: true, message: '请输入密码!' }],
                                                    initialValue: loginStore.password ? loginStore.password : ''
                                                })(
                                                    <Input.Password placeholder='请输入密码' />
                                                )}
                                            </Form.Item>
                                            <Form.Item label={tr(63)} extra="">
                                                <Row gutter={8}>
                                                    <Col span={12}>
                                                        {getFieldDecorator('imgCode', {
                                                            rules: [{ required: true, message: '请填写图形验证码!' }],
                                                            initialValue: loginStore.imgCode ? loginStore.imgCode : ''
                                                        })
                                                            (<Input />)}
                                                    </Col>
                                                    <Col span={12}>
                                                        <ImageCode updateNum={0} />
                                                    </Col>
                                                </Row>
                                            </Form.Item>
                                        </>
                                    )
                            }
                            {/* <Form.Item label={tr(1)} >
                                {getFieldDecorator('password', {
                                    rules: [{ required: true, message: '请输入密码!' }],
                                    initialValue: loginStore.password?loginStore.password:''
                                })(
                                    // <Input
                                    //     type="password"
                                    // // placeholder="密码"
                                    // />,
                                    <Input.Password/>
                                )}
                            </Form.Item> */}
                            {/* <Form.Item label={tr(55)}>
                                {getFieldDecorator('repassword', {
                                    rules: [
                                        { required: true, message: '必须输入!' },
                                        {
                                            validator: this.validateToNextPassword,
                                        },
                                    ],
                                })(
                                    <Input
                                        onBlur={this.handleConfirmBlur}
                                        type="password"
                                    // placeholder="请再次密码"
                                    />,
                                )}
                            </Form.Item>
                            <Form.Item label={tr(61)}>
                                {getFieldDecorator('nickname', {
                                    rules: [{ required: true, message: '请输入昵称!' }],
                                })(
                                    <Input
                                    // placeholder="昵称"
                                    />,
                                )}
                            </Form.Item> */}
                            {/* {
                                systemStore.registerInviteCode != 0
                                    ? (
                                        <Form.Item label={tr(65)}>
                                            {getFieldDecorator('inviteCode', {
                                                // registerInviteCode ; //0:关闭 1:开启一对一邀请（一码一用，且必填）2:开启一对多邀请（一码多用，选填项） 3:开启一对多邀请（一码多用，必填项）
                                                rules: systemStore.registerInviteCode == 2 ? [] : [{ required: true, message: '请输入邀请码!' }],
                                                initialValue: loginStore.inviteCode ? loginStore.inviteCode : ''
                                            })(
											    <Input
                                                   onChange={(e)=>{ window.sessionKey = e.target.value }} 
                                                   placeholder="邀请码"
                                                />
                                            )}
                                        </Form.Item>
                                    )
                                    : null
                            } */}
                            <Form.Item >
                                <div className="edit-wraper">
                                    <Button type="primary" htmlType="submit" className="login-button" loading={this.state.isLoading}>
                                        {tr(66)}
                                    </Button>
                                    <span className="sub-text">
                                        {tr(62)}?<Link to="./login">  {tr(67)}> </Link>
                                    </span>
                                </div>

                            </Form.Item>
                        </Form>
                    </div>
                    {ipcRender.isElectron ? <Title /> : null}
                </div >
            );
        } else {
            return (
                <div className="login regeister">
                    <img src={loginBanner} className="login-banner" />
                    <div className="form-wraper">
                        <PersonalInformationFrom
                            goBack={this.backToRegester}
                            submit={this.regester}
                            isPhone={isPhone}
                            loading={loginStore.loading}
                        />
                    </div>
                    {ipcRender.isElectron ? <Title /> : null}
                </div>
            );
        }



    }
}
const Regester = Form.create<RegesterProps>()(RegesterView);
export default Regester;
