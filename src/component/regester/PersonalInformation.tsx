
import * as React from "react";
import { observer } from 'mobx-react';
import Form from 'antd/es/form';
import Input from 'antd/es/input';
import './PersonalInformation.less'
import Button from 'antd/es/button';
import Radio from 'antd/es/radio'
import { FormEvent } from "react";

import Icon from 'antd/es/icon';
import Avatar from 'antd/es/avatar';
import message from 'antd/es/message';
import { RadioChangeEvent } from 'antd/lib/radio';
import { FormComponentProps } from 'antd/lib/form/Form';
import SecurityFrom from './Security';
import loginStore from '../../store/LoginStore';
import imsdk from '../../net/IMSDK';
import systemStore from '../../store/SystemStore';
import { tr } from '../../i18n/tr';



interface IPersonalInformationprops extends FormComponentProps {
    goBack: () => void,
    submit: (e: FormEvent) => void,
    isPhone: boolean,
    loading: boolean
}
interface IPersonalInformationState {
    showSecurity: boolean,
    imgurl: string

}

@observer
export class PersonalInformation extends React.Component<IPersonalInformationprops, IPersonalInformationState> {
    constructor(props: any) {
        super(props);
        this.state = {
            showSecurity: false,
            imgurl: '',

        }

    }
    regester = (e: FormEvent) => {
        e.preventDefault();

        if (systemStore.isQestionOpen !== 0) {
            if (systemStore.regeditPhoneOrName == 1 || (systemStore.regeditPhoneOrName == 2 && !loginStore.changState)) {
                if (!loginStore.hasSetSecret) {
                    message.warn('密保未设置')
                    return;
                }
            }
        }
        this.props.form.validateFields((err: any, values: any) => {
            const { ...otherParams } = values;


            if (!err) {
                loginStore.sex = otherParams.sex;
                loginStore.nickname = otherParams.nickname;

                this.props.submit(e);
            }
            else {
                message.warn('提交失败');
            }


        });

    }
    showSecurity = () => {
        this.props.form.validateFields((err: any, values: any) => {
            const { ...otherParams } = values;
            // console.log(...otherParams, '读表值');
            if (!err) {
                loginStore.sex = otherParams.sex;
                loginStore.nickname = otherParams.nickname;
                imsdk.getquestion().then(data => {

                    if (data && data.data) {
                        if (data.data.length <= 0) {
                            message.warn('请求数据失败');
                        }
                        else {
                            this.setState({
                                showSecurity: !this.state.showSecurity
                            })
                        }
                    } else {
                        message.warn('请求数据失败');
                    }

                })
            }
            else {
                console.log('读取值失败');
            }
        });
    }
    showPersonalInformation = () => {
        this.setState({
            showSecurity: !this.state.showSecurity
        })
    }
    setSex = (e: RadioChangeEvent) => {
        loginStore.sex = e.target.value;
    }
    getBase64 = (img: any, callback: any) => {
        const reader = new FileReader();
        reader.addEventListener('load', () => { callback(reader.result) });
        reader.readAsDataURL(img);
    }
    // fileUploadGetUrl = async (url: string, file: File): Promise<string> => {
    // 	return new Promise((resolve, reject) => {
    // 		const form = new FormData();
    // 		form.append('file', file);
    // 		const xhr = new XMLHttpRequest();
    // 		xhr.open('post', url, true);
    // 		xhr.onload = (evt: any) => {
    // 			if (!evt || !evt.target) {
    // 				if (!Boolean(evt.target.responseText)) {
    // 					resolve('');
    // 					return;
    // 				}
    // 				resolve('');
    // 			}
    // 			const data = JSON.parse(evt.target.responseText);
    // 			resolve(data.url);
    // 		};
    // 		xhr.onerror = () => resolve('');
    // 		xhr.send(form);
    // 	});
    // };
    imgInput: HTMLInputElement | null;

    changeImg = (e: React.ChangeEvent<HTMLInputElement>) => {

        if (e.target.files && e.target.files.length > 0) {
            const fileImg = e.target.files[0];
            loginStore.avatarFile = fileImg;
            this.getBase64(fileImg, (imageUrl: any) =>
                this.setState({
                    imgurl: imageUrl,
                }),
            )
        }
    };
    isQestionOpen = () => {
        if (systemStore.isQestionOpen === 0) {
            return true;
        } else {
            if (this.props.isPhone || (systemStore.regeditPhoneOrName == 2 && loginStore.changState)) {
                return true
            } else {
                return false
            }
        }

    }
    render() {
        // const {defaultName,defaultSex}=this.state;
        // console.log('获取初始值sex',defaultSex);
        // console.log(systemStore.isQestionOpen, '渲染 nickname============================');
        //  console.log(this.isQestionOpen() , '渲染1 nickname============================',systemStore.isQestionOpen,':',this.props.isPhone);

        const { getFieldDecorator } = this.props.form;
        const { imgurl } = this.state;
        if (!this.state.showSecurity) {
            return (
                <div className="login-regeister">
                    <div className="form-wraper">

                        <Form onSubmit={this.regester} className="login-form" id="login-view" layout="vertical">
                            {/* <Button icon="left-circle" onClick={this.props.goBack} className="icon"></Button> */}
                            <div className="head-back">
                                <Icon type="left-circle" onClick={this.props.goBack} ></Icon>
                            </div>
                            <div className="head">
                                <div>
                                    <h1 className="title">
                                        设置个人信息
                                </h1>
                                    <div className='title-Notes'>填写信息，完成账号注册 </div>
                                </div>
                                <label>
                                    <Avatar icon="user" size={76} className="headavator" src={imgurl} ></Avatar>
                                    <input
                                        type="file"
                                        ref={ref => this.imgInput = ref}
                                        accept="image/png,image/jpeg,image/gif"
                                        style={{ display: 'none' }}
                                        onChange={this.changeImg}
                                    />
                                    {/* < AvatarWithUpload></AvatarWithUpload> */}

                                </label>

                            </div>

                            {/* <AvatorWithPhoto type={0} id={systemStore.userId.toString()} classN="headavator" size={76} /> */}

                            <Form.Item label='昵称'>
                                {
                                    getFieldDecorator('nickname', {
                                        rules: [{ required: true, message: tr(182) }],
                                        initialValue: loginStore.nickname ? String(loginStore.nickname) : '',

                                    })(
                                        <Input
                                            maxLength={30}
                                            minLength={2}
                                            placeholder="2-30个字符"
                                        />
                                    )}
                            </Form.Item>
                            <Form.Item label='性别'>
                                {/* <Button className='male'>男</Button>
                                <Button className='female'>女</Button> */}
                                {
                                    getFieldDecorator('sex', {
                                        rules: [{ required: true, message: tr(183) }],
                                        initialValue: loginStore.sex ? String(loginStore.sex) : '1'
                                    })(
                                        <Radio.Group size="large" onChange={this.setSex}>
                                            <Radio.Button value="1" className='male'>男</Radio.Button>
                                            <Radio.Button value="0" className='female'>女</Radio.Button>
                                        </Radio.Group>
                                    )}
                            </Form.Item>
                            {
                                this.isQestionOpen() ? null :
                                    <Form.Item label='密保' required={true}>
                                        <div onClick={this.showSecurity}>
                                            <Input
                                                type="password"
                                                prefix="密保问题"
                                                suffix={
                                                    loginStore.hasSetSecret ? "设置密保/已设置>" : "设置密保/未设置>"
                                                }
                                            />
                                        </div>
                                    </Form.Item>
                            }

                            <Button type="primary" loading={this.props.loading} htmlType="submit" className='submit'>确定</Button>
                        </Form>
                    </div>
                    {/* {ipcRender.isElectron ? <Title /> : null} */}
                </div>
            )
        }
        else {
            return (
                <div>
                    <SecurityFrom
                        goback={this.showPersonalInformation}
                    ></SecurityFrom>
                    {/* {ipcRender.isElectron ? <Title /> : null} */}
                </div>

            )
        }

    }
}
const PersonalInformationFrom = Form.create<IPersonalInformationprops>({ name: 'personalInformation_login' })(PersonalInformation);

export default PersonalInformationFrom;