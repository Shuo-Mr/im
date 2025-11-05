import Button  from 'antd/es/button';
import Form from 'antd/es/form/';
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
// import { Store } from '../../Store';
import loginBanner from './../../assets/image/login-banner.png'
import { observer, inject } from 'mobx-react';
import { LoginStore } from '../../store/LoginStore';
import { RouterStore } from '../../store/RouterStore';
import { SystemStore } from '../../store/SystemStore';
// import ImageCode from '../../component/imgaeCode/ImageCode';
import imsdk from '../../net/IMSDK';
import { Title } from '../title/Title';
import ipcRender from './../../ipcRender';

const { Option } = Select;

interface RegesterProps extends RouterProps, FormComponentProps {
    loginStore: LoginStore;
    routerStore: RouterStore;
    systemStore: SystemStore;
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
@inject("loginStore", "systemStore",'routerStore')
@observer
class ForgetView extends React.Component<RegesterProps> {

    constructor(props: any) {
        super(props);
        this.props.routerStore.setHistory(this.props.history);
    }
    state = {
        confirmDirty: false,
        mesTimes: 0,
        isLoading: false
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
            isRegister: 0,
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
        if (value && value !== form.getFieldValue('newPassword')) {
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
    resetpassword = async (e: FormEvent) => {
        e.preventDefault();
        this.props.form.validateFields(async (err: any, values: any) => {
            if (!err) {
              //  console.log('Received values of form: ', values);
                const { repassword, ...otherParams } = values;
                this.setState({
                    isLoading: true
                })
                this.regTimer && clearTimeout(this.regTimer)
                let ret = await this.props.loginStore.resetpassword(otherParams);
                const regTimeOut = this.regTimeOut;
                this.regTimer = setTimeout(regTimeOut, 15 * 1000);
                if (ret.status) {
                    this.props.history.push('/login')
                    message.success('修改成功')
                    this.regTimer && clearTimeout(this.regTimer)
                } else {
                    message.error(ret.info, 2);
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
        message.warn('修改超时，请重试')
        this.setState({
            isLoading: false
        });

    }
    componentWillUnMount() {
        this.regTimer && clearTimeout(this.regTimer)
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
        // const { systemStore } = this.props;
        const isPhone = this.props.systemStore.regeditPhoneOrName == 0;
        return (
            <div className="login regeister">
                <img src={loginBanner} className="login-banner" />
                <div className="form-wraper">
                    <Form onSubmit={this.resetpassword} className="login-form" id="login-view" layout="vertical">
                        <h1 className="title">
                            忘记密码
                        </h1>
                        {
                            isPhone
                                ? (
                                    <>
                                        <Form.Item label="手机号">
                                            {getFieldDecorator('telephone', {
                                                rules: [{ required: true, message: '请输入手机!' }],
                                            })(<Input  addonBefore={prefixSelector} style={{ width: '100%' }} />)}
                                        </Form.Item>
                                        {
                                            // systemStore.isOpenSMSCode != 0
                                            //     ?
                                                <>
                                                    {/* <Form.Item label="图形验证码" extra="">
                                                        <Row gutter={8}>
                                                            <Col span={12}>
                                                                {getFieldDecorator('imgCode', {
                                                                    rules: [{ required: true, message: '请填写图形验证码!' }],
                                                                })(<Input />)}
                                                            </Col>
                                                            <Col span={12}>
                                                                <ImageCode telephone={this.props.form.getFieldValue('telephone')} areaCode={this.props.form.getFieldValue('areaCode')} updateNum={0} />
                                                            </Col>
                                                        </Row>
                                                    </Form.Item> */}
                                                    <Form.Item label="手机验证码" extra="">
                                                        <Row gutter={8}>
                                                            <Col span={12}>
                                                                {getFieldDecorator('randcode', {
                                                                    rules: [{ required: true, message: '请输入手机验证码!' }],
                                                                })(<Input  />)}
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
                                                // : null
                                        }
                                    </>
                                )
                                : (
                                    <Form.Item label="账号">
                                        {getFieldDecorator('userId', {
                                            rules: [{ required: true, message: '请输入帐号!' }],
                                        })(
                                            <Input
                                              //  placeholder="帐号"
                                            />,
                                        )}
                                    </Form.Item>
                                )
                        }
                        <Form.Item label="新密码">
                            {getFieldDecorator('newPassword', {
                                rules: [{ required: true, message: '请输入新密码!' }],
                            })(
                                <Input
                                    type="password"
                                   // placeholder="密码"
                                />,
                            )}
                        </Form.Item>
                        <Form.Item label="确认新密码">
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
                        {/* <Form.Item label="昵称">
                            {getFieldDecorator('nickname', {
                                rules: [{ required: true, message: '请输入昵称!' }],
                            })(
                                <Input
                                    placeholder="昵称"
                                />,
                            )}
                        </Form.Item> */}
                        {/* {
                            systemStore.registerInviteCode != 0
                                ? (
                                    <Form.Item label="邀请码">
                                        {getFieldDecorator('inviteCode', {
                                            rules: [{ required: true, message: '请输入邀请码!' }],
                                        })(
                                            <Input
                                                placeholder="邀请码"
                                            />,
                                        )}
                                    </Form.Item>
                                )
                                : null
                        } */}
                        <Form.Item >
                            <div className="edit-wraper">
                                <Button type="primary" htmlType="submit" className="login-button" loading={this.state.isLoading}>
                                    修改密码
                                </Button>
                                <span className="sub-text">
                                    <Link to="./login">  现在登录> </Link>
                                </span>
                            </div>

                        </Form.Item>
                    </Form>
                </div>
                {ipcRender.isElectron ? <Title /> : null}
            </div >
        );
    }
}
const ResetPassword = Form.create<RegesterProps>()(ForgetView);
export default ResetPassword;
