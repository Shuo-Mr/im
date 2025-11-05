import { observable, action } from 'mobx';
// import * as jsCookie from 'js-cookie';
import md5 from 'md5';
// import NetService from '../net/NetService';
import imsdk from '../net/IMSDK';
import webIM from '../net/WebIM';
// import systemStore, { SystemStore } from './SystemStore';
import systemStore from './SystemStore';
import dataUtils from '../dbtemp/DataUtils';
// import { isOpenScreactStrong } from '../config/SystemConfig';

import tigLocalStorage from '../dbtemp/localStorage';
import ipcRender from '../ipcRender';
import chatStore from './ChatStore';
import xmppSDK from '../net/XmppSDK';

// import { message } from 'antd';
// import Utils from '../utils/utils';
/**用户设置 */

export class UserSetting {
    @observable allowAtt: number = 0;
    @observable allowGreet: number = 1;
    @observable chatRecordTimeOut: string = '-1.0';
    @observable chatSyncTimeLen: number = -2;
    @observable closeTelephoneFind: number = 1;
    @observable friendFromList: string = '1,2,3,4,5';
    @observable friendsVerify: number = 1;
    @observable isEncrypt: number = 0;
    @observable isKeepalive: number = 1;
    @observable isTyping: number = 0;
    @observable isUseGoogleMap: number = 0;
    @observable isVibration: number = 0;
    @observable multipleDevices: number = 0; // 1 => 多端登录开启 0 => 关闭
    @observable nameSearch: number = 0;
    @observable openService: number = 0;
    @observable phoneSearch: number = 1;
    @observable showLastLoginTime: number = 1;
    @observable showTelephone: number = -1;

    constructor() {}

    @action
    setItem(_data: any): void {
        for (let key in _data) {
            this[key] = _data[key];
        }
    }
}

export class User {
    @observable account: string = '';
    @observable birthday: number = 1010010;
    @observable sex: number = 0;
    @observable nickname: string = '';

    @action
    setItem = (user: any) => {
        for (let key in user) {
            this[key] = user[key];
        }
    };
}

export class LoginStore {
    // @observable history: any;

    @observable telephone: string = '';

    @observable password: string = '';

    @observable imgCode: string = '';

    @observable isLogin: boolean = false;

    @observable prefix: string = '';

    @observable answer: { [optionKey: string]: string };

    @observable inviteCode: string = '';

    @observable sex: number = 0;

    @observable nickname: string = '';

    @observable hasSetSecret: boolean = false;

    @observable areaCode: string = '';

    @observable smsCode: string = '';

    @observable captchaSeed: string = '';

    @observable changState: boolean = true;

    @observable avatarFile: File;

    @observable loading: boolean=false;
    userSetting: UserSetting;
    //数据加载描述
    @observable onLoadingExplain: string = '';

    @action
    changeAnswer = (answer: { [optionKey: string]: string }) => {
        // console.log('答案', answer);
        this.answer = answer;
    };
    // @action changeQuestion= (question:string[])=>{
    //     console.log("问题",question)
    //     this.question=question
    // }

    @action
    hasChangeSecret = (_data: boolean) => {
        this.hasSetSecret = _data;
    };

    constructor() {
        this.userSetting = new UserSetting();
    }
    /** 缓存用户信息 */
    loginDataObj: any = {};

    init = async () => {
        // systemStore.password = await ipcRender.getCookie("password") || "";
        // systemStore.telephone = await ipcRender.getCookie("telephone") || "";
        // this.prefix = await ipcRender.getCookie("prefix") || "86";
        systemStore.backImageurl = localStorage.getItem('backImageurl') || '';
        systemStore.password = localStorage.getItem('password') || '';
        systemStore.telephone = localStorage.getItem('telephone') || '';
        this.prefix = localStorage.getItem('prefix') || '';
        systemStore.selectUrl=localStorage.getItem('selectUrl')||'';
        // console.log('获取的密码', systemStore.password )
    };

    @action
    login = async (
        config: { telephone: string; password: string; dialCode: string; userId: string; serial: any; loginIp: any },
        code?: string
    ): Promise<any> => {
        let loginData: any = {};
        loginData.field = {};
        let ret: any;
        if (!code) {
            loginData.field.areaCode = config['prefix'] || '86';
            loginData.field.telephone = md5(config.telephone);
            loginData.field.password = md5(config.password);
            ret = await imsdk.login(
                'user/login',
                {
                    areaCode: config['prefix'] || '86',
                    telephone: md5(config.telephone),
                    password: md5(config.password),
                    serial: md5(config.serial),
                    loginIp: config.loginIp,
                    appBrand:'web'
                },
                {}
            );

            // 同步服务端系统设置
            if (ret && ret.resultCode == 1 && ret.data && ret.data.settings) {
                console.log('---同步系统设置', ret.data.settings)
                this.userSetting.setItem(ret.data.settings)
            }
        } else {
            ret = await imsdk.login(
                'user/otherLogin',
                {
                    code,
                    otherType: 4,
                    xmppVersion: '12',
                    osVersion: 'wechat',
                    serial:config.serial,
                    loginIp:config.loginIp,
                    latitude: '',
                    longitude: '',
                    appBrand:'web'
                },
                {}
            );
        }

        if (code ? ret.resultCode == 1 && ret.data && ret.data.code == 1 : ret.resultCode == 1) {
            if (code && ret.data.password) {
                loginData.field.password = ret.data.password;
            }
            this.ret = ret;
            this.loginData = loginData;
        }
        systemStore.salt = ret.data && ret.data.salt ? ret.data.salt : '';
        // console.log("source-->",ret.salt)
        return ret;
    };
    ret: any;
    loginData: any;
    loadingData = async () => {
        if (!this.ret || !this.loginData) {
            return false;
        }
        this.onLoadingExplain = '初始化数据...';
        const ret = this.ret,
            loginData = this.loginData;
        chatStore.initData();
        //   console.log(ret.data, '---login---');

        // } else {
        let loginDataTemp: any = {};
        // 常用数据缓存
        // console.log(loginData,'扫码登录信息',ret);
        loginDataTemp.telephone = loginData.field ? loginData.field.telephone : loginData.telephone;
        loginDataTemp.password = loginData.field ? loginData.field.password : loginData.password;
        loginDataTemp.access_token = ret.data.access_token || loginData.access_token;
        loginDataTemp.loginResult = ret.data;
        systemStore.access_token = ret.data.access_token;
        systemStore.userId = ret.data.userId;
        tigLocalStorage.userId = ret.data.userId;

        let logoutTime: number = dataUtils.getLogoutTime();

        // jsCookie.set('loginData', JSON.stringify(loginDataTemp));

        // if (sessionStorage) {
        //     sessionStorage.setItem('loginData', JSON.stringify(loginDataTemp));
        // }
        try {
            if (0 == logoutTime) {
                logoutTime = ret.data.login.offlineTime;
                dataUtils.setLogoutTime(logoutTime);
            }
        } catch (e) {
            console.log('设置离线时间失败');
        }
        systemStore.password = loginData.field ? loginData.field.password : loginData.password;
        systemStore.access_token = ret.data.access_token || loginData.access_token;
        systemStore.loginResult = ret.data.loginResult;

        this.onLoadingExplain = '初始化数据库...';
        await webIM.setUserIdAndToken(systemStore.userId, systemStore.access_token);

        this.onLoadingExplain = '获取用户信息并保存...';
        // 获取用户信息
        let users = await imsdk.getUser(systemStore.userId, false);

        // console.log(users, '----');
        if (users.resultCode == 1) {
            this.loginDataObj.user = users.data;

            systemStore.user.setItem(this.loginDataObj.user);
            systemStore.nickname = this.loginDataObj.user.nickname;
            systemStore.website = this.loginDataObj.user.website ? this.loginDataObj.user.website : '';
            systemStore.birthday = this.loginDataObj.user.birthday ? this.loginDataObj.user.birthday + '' : '';
            systemStore.isCreateRoom = this.loginDataObj.user.isCreateRoom;
            // systemStore.salt= this.loginDataObj.user.salt?this.loginDataObj.user.salt:'';
            this.userSetting.setItem(this.loginDataObj.user.settings);

            systemStore.resource = ipcRender.getCurrectDeviceSource();

            // console.log(ipcRender.getCurrectDeviceSource(),'----getCurrectDeviceSource---');

            // console.log('login-resource',systemStore.resource);
            // console.log('登录的密码', systemStore.password);
            // const str = systemStore.boshUrl.replace('5290', '5292').trim()

            webIM.initWebIM(
                systemStore.boshUrl,
                // str,
                systemStore.userId,
                systemStore.resource,
                systemStore.password,
                systemStore.xmppPingTime,
                systemStore.nickname,
                systemStore.boshDomain,
                systemStore.salt
            );

            let ret = await webIM.initData();
            if (!ret) {
                return 2;
            }
            webIM.loginIM();
           //链接第二通道
            xmppSDK.onConnectTow();
            return true
        } else {
            //获取失败
        }
        return false;
    };

    @action
    testRegeister = async (params: any) => {
        let regeisterParams = params;
        regeisterParams.telephone = regeisterParams.telephone;
        regeisterParams.password = md5(regeisterParams.password);
        regeisterParams.registerType = systemStore.regeditPhoneOrName;
        params.serial=md5(params.serial);
        if (systemStore.registerInviteCode != 0) {
            //邀请码
            regeisterParams.inviteCode = regeisterParams.inviteCode || '';
        }
        const res = await imsdk.regeister('verify/telephone', regeisterParams, {});
        if (res.resultCode == 1) {
            return {
                status: true,
                info: '',
            };
        } else {
            return {
                status: false,
                info: res.data && res.data.resultMsg ? res.data.resultMsg : res.resultMsg || '账户已存在',
            };
        }
    };

    //注册账号
    @action
    regeister = async (serial:string) => {
        let params = {
            telephone: this.telephone,
            password: md5(this.password),
            registerType: systemStore.regeditPhoneOrName == 2 ? (this.smsCode ? 0 : 1) : systemStore.regeditPhoneOrName,
            nickname: this.nickname,
            sex: this.sex,
            inviteCode: '',
            questions: '',
            areaCode: '',
            smsCode: '',
            captchaSeed: this.captchaSeed,
            captchaCode: this.imgCode,
            serial:md5(serial),
        };

        if (this.answer) {
            let question = [
                {
                    q: this.answer.questionone,
                    a: this.answer.answerone,
                },
                {
                    q: this.answer.questiontwo,
                    a: this.answer.answertwo,
                },
                {
                    q: this.answer.questionthree,
                    a: this.answer.answerthree,
                },
            ];
            params.questions = JSON.stringify(question);
        } else {
            params.questions = '[]';
        }

        if (this.areaCode) {
            params.areaCode = this.areaCode;
        }
        if (this.smsCode) {
            params.smsCode = this.smsCode;
        }

        if (systemStore.registerInviteCode != 0) {
            params.inviteCode = this.inviteCode || '';
        }
        this.loading=true;
        const res = await imsdk.regeister('user/register', params, {});
        this.loading=false;
        if (res.resultCode == 1) {
            //  console.log(res.data.userId,"得到返回值==================================》",res);
            this.loading=true;
            await imsdk.uploadAvata(res.data.userId, this.avatarFile, null, null);
            this.loading=false
            return {
                status: true,
                info: '',
            };
        } else {
            return {
                status: false,
                info: (res.data && res.data.resultMsg) ? res.data.resultMsg
                    : (res.resultMsg ? res.resultMsg : '注册失败')
            }
        }
    };
    //修改密码
    @action
    resetpassword = async (params: any) => {
        let resetpasswordParams = params;
        resetpasswordParams.telephone = resetpasswordParams.telephone;
        resetpasswordParams.newPassword = md5(resetpasswordParams.newPassword);
        resetpasswordParams.registerType = systemStore.regeditPhoneOrName == 2 ? (this.smsCode ? 0 : 1) : systemStore.regeditPhoneOrName;

        const res = await imsdk.regeister('user/password/reset', resetpasswordParams, {});
        if (res.resultCode == 1) {
            return {
                status: true,
                info: '',
            };
        } else {
            return {
                status: false,
                info: res.data && res.data.resultMsg ? res.data.resultMsg : res.resultMsg || '修改失败',
            };
        }
    };
    //请求二维码
    @action
    getQRCodeUrl = async () => {
        return await imsdk.getQRCodeUrl();
    };
    //检测二维码请求
    @action
    checkQRCodeUrl = async (_data: string,serial:string) => {
        return await imsdk.checkQRCodeUrl(_data,md5(serial));
    };

    @action
    changePas = async (params: any) => {
        let changeParams = params;
        changeParams.telephone = md5(changeParams.telephone);
        changeParams.oldPassword = md5(changeParams.oldPassword);
        changeParams.newPassword = md5(changeParams.newPassword);
        const res = await imsdk.login('user/password/update', changeParams, {});
        if (res.resultCode == 1) {
            return {
                status: true,
                info: '',
            };
        } else {
            return {
                status: false,
                info: res.data && res.data.resultMsg ? res.data.resultMsg : '修改失败',
            };
        }
    }
    @action rememeber = (data: { telephone: string, password: string, prefix: string ,selectUrl:string} | null): void => {
        //  console.log('获取登录信息',data);
        if (!data) {
            ipcRender.setCookies('password', '86');
        } else {
            // console.log("password", data.password)
            ipcRender.setCookies("password", data.password);
            ipcRender.setCookies("telephone", data.telephone);
            ipcRender.setCookies("prefix", data.prefix);
            ipcRender.setCookies('selectUrl',data.selectUrl)
        }
    };
    loginDataUser = async (): Promise<{ telephone: any; password: any; prefix: string }> => {
        await this.init();

        const _password = systemStore.password;
        const _telephone = systemStore.telephone;
        const _prefix = this.prefix;
        return {
            telephone: _telephone ? _telephone : '',
            password: _password ? _password : '',
            prefix: _prefix ? _prefix : '86',
        };
    };
}

export default new LoginStore();
