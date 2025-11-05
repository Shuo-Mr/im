
import { observable, action, runInAction } from 'mobx';
import NetService from '../net/NetService';
import Axios, { AxiosRequestConfig } from 'axios';
import md5 from 'md5';
import '../dbtemp/TestDB'
import { switchToLanguage } from '../i18n/tr';
import ipcRender from '../ipcRender';
import imsdk from '../net/IMSDK';
import message from 'antd/es/message';
import webIM from '../net/WebIM';
import { User } from './LoginStore';
import routerStore from './RouterStore';
import { IServerUrlItem } from '../interface/IChat';
import { CryptoData } from './../net/ctyHelper';
import { observerServices } from '../service/obsService';
import { apiSwitchUrl, apiUrl } from '../config/SystemConfig';
import { inIt } from '../net/app.server';
import utils from '../utils/utils'
import eventBus from '../utils/eventBus'
/**
 * 存放系统信息
 *
 */
export class SystemStore {
    sendHelper: CryptoData.CtyHelper = new CryptoData.CtyHelper('', '', '', '');



    apiKey: string = '%In9AXC0#Za8kd&U'; // huahuagongzi
    appCID: string = '';

    projectLogo: string = '';

    obsPuk = 'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDg/CxgoI8m6EXa6QJsleT1k+X6Cg2cGC2aS9il05kW7zfIgoIUwqGO6EXlcIWsRFgJQWvxS94vtbbCWqC9Os4SvfazikT8TmyQtCNnfGSqM7eZKql/jR6XAGBEN4OIQOrtb8GdO4PSpi5NhBziaGEGeSC4LmmolFic9Fm6FHYD4wIDAQAB';

    puk = 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAtjCMVGtmfuy8XnGAmKHZZmowYoNjAaQba3hAYR3+J2n+aiI8DCBaNhOI9IArK8zKw2qzlvB1zFAsIABWkHYzNhCdDrwL1bSdSMVdVR2yKek5vuXQwRtMoNAZIUnzKIhJlnk1t8HWjJ9MltM6zUGOTQccdSEYn6Uu/5HQ3pAs3fzBMD6+QW/ivgYhmQfJo57H1XErI+7Qh3dAoPZey3+k9PNhk5jK+DH7V8N6P6argpf3m7aNS+Zn39G2lrzrS8m5MSPpiZAAc0RV+2G52ngSQa9RuZcjYO4UA6nBrd1078jnmQ4aUmV+x66Eidfmw9KKW/G5L4Enb+zWxA6kG6NacQIDAQAB'

    prk = 'MIICWwIBAAKBgQC4TOOvdfKPGACdkImYuSu2/OG8/ZLb4jwmnsik50kEEPTsqwFOsP7kMVpY90kw6VdqG1hluN3IIh38HRb482+HYAFxLZQnan7J46WOZBiY0VKwlr7b0XhvMlMCzc9SAX5MC4fUbAl+hn4tM1OFPwCotNBiBQJfvlm45ZdyoAQ9kQIDAQABAoGAJ/pFyWHEY9XJDGS19DL2kJL6RIyctqW0dowq6dphtEgZWN0fQ3qRT96EwpehgMKc+59C5Y3cTfVYm7+TpBzqLAySuuaqJkSPI2y+5lpvl5XK7zIUVHILLCPNF9222NO/Ssmcs7iesFpRCcU/P8wUcC/VSq8uEeb+i3RkqOluF4ECQQDyUc4STEFYritw4fznP0YgxVRizrRJxgmAmzBBgKLSURj+lHDi3f/3cUA0NHhCr0zTS5Lr3ezR2v+A4lnNxy9tAkEAwrSLdIJMqmyjtWxauD1pEQdvj6SMQmjQUb/3z1HhRYESCzsuIvxeRUPiXeV6jsDuUOzG8z1/E/XR+aqg/sWcNQJAQpR1kZOANPSOHRMK4SMCisiNWiS/ZrHSNJLvXGAS3MTJoFF6/urOhNeKM43jKTdvXXMbaFFu225X27rVv/OltQJAbnMuvNwBk5fnUk5yNBuaE2/taEXGzxFYQ1erwu7G5L+wNbDPnkcdTxuQOQWpfXuSdVOsFGXpRbBn+cJCa+Q7lQJAfoTNmgorpsZPx8ppSYLSEWdOqJG6L7NOnvjA3pSUPFAB/2FFEJ4Qv3CfW2s83ybVJwfLnUHOmBuR6YvtK4nlvA=='

    amapKey: string = "2485d9905c8f57d2d12eb753371c7359";
    amapServiceKey: string = "2485d9905c8f57d2d12eb753371c7359";

    static apiUrl: string = apiUrl;// 接口地址
    static _apiUrl: string = apiSwitchUrl;// 用于切换预保留接口地址
    static apiSwitchUrl: string = apiUrl; //节点的ip



    //  @observable  apiUrl:  string  =  "http://api.kuajingep.com:8092/";//  接口地址
    @observable boshWebUrl = utils.apiJudge(apiUrl) ? 'ws://im.' + apiUrl : 'ws://' + apiUrl;
    @action changeUrl = (url: string) => {
        const urlAll = url + `:${this.boshUrlPort}/websocket/`;
        if (urlAll.indexOf('https://') != -1) {
            this.boshUrl = urlAll.replace('https', 'ws')
        } else if (urlAll.indexOf('http://') != -1) {
            this.boshUrl = urlAll.replace('http', 'ws')
        } else {
            this.boshUrl = urlAll.indexOf("ws://") != -1 ? urlAll : 'ws://' + urlAll;
        }
        return this.boshUrl
    }

    @observable showUpdate: boolean = false;
    latestVersion: string = '';
    updateLog: string = '';
    @observable precentP: number = 0;
    @observable totalP: number = 0;
    @observable deltaP: number = 0;

    // 是否是在国外
    isForeigner: boolean = false;
    //用户IP
    userIp: string = '';
    //切换节点
    selectUrl: string = '';


    boshUrlPort: string = '5290'
    boshUrl: string = this.boshWebUrl + `:${this.boshUrlPort}/websocket/`;//  http://+（XMPP主机IP或域名）+（:5280）
    // 多线路
    static boshUrls: string[] = [apiUrl];


    uploadServer: string = utils.apiJudge(apiUrl) ? 'http://upload.' + apiUrl.replace('/', '') + ':8088/' : 'http://' + apiUrl.replace('/', '') + ':8088/';

    fileServer: string = utils.apiJudge(apiUrl) ? 'http://file.' + apiUrl : 'http://' + apiUrl;

    jitsiDomain: string = utils.apiJudge(apiUrl) ? 'meet.' + apiUrl : apiUrl;


    companyId: string = "5cd2fdfd0c03d03c19a109c7"; //客服模块公司id

    departmentId: string = "5cd2fdfd0c03d03c19a109c9"; //客服部门id

    isOpenReceipt: number = 1;

    isOpenSMSCode: number = 0;  //是否开短信验证码

    registerInviteCode: number = 0;//注册邀请码  0：关闭 1:一码一用(注册型邀请码)  2：一码多用（推广型邀请码）


    XMPPDomain: string = "";
    XMPPHost: string = "";
    XMPPTimeout: number = 15;
    address: string = "CN";
    appleId: string = "";
    audioLen: string = "20";
    chatRecordTimeOut: number = -1;
    displayRedPacket: number = 1;
    distance: number = 50;
    downloadAvatarUrl: string = "";
    //多节点列表
    @observable isNodesList: (IServerUrlItem | null)[] = []
    downloadUrl: string = "";
    fileValidTime: number = -1;
    headBackgroundImg: string = "";
    helpUrl: string = "";
    hideSearchByFriends: number = 1;
    iosAppUrl: string = "";
    iosDisable: string = "";
    iosExplain: string = "";
    iosVersion: number = 100;
    ipAddress: string = "219.155.4.20";
    isCommonCreateGroup: number = 0;
    isCommonFindFriends: number = 0;
    isOpenCluster: number = 0;
    isOpenGoogleFCM: number = 0;
    isOpenPositionService: number = 1;
    isOpenReadReceipt: number = 1;
    isOpenRegister: number = 1;
    isDelAfterReading: number = 0;//是否开启阅后即焚：0开启   1关闭
    jitsiServer: string = "";
    liveUrl: string = "";
    macAppUrl: string = "";
    macDisable: string = "";
    macExplain: string = "";
    macVersion: number = 100;
    nicknameSearchUser: number = 2;
    pcAppUrl: string = "";
    pcDisable: string = "";
    pcExplain: string = "";
    pcVersion: number = 100;
    popularAPP: string = "{\"lifeCircle\":1,\"videoMeeting\":1,\"liveVideo\":1,\"shortVideo\":1,\"peopleNearby\":1,\"scan\":1}";
    @observable regeditPhoneOrName: number = 0;    //0:手机号登录 1：账号登录  2：全开
    isQestionOpen: number = 0;//是否开启密保问题 0：否 1：是
    shareUrl: string = "";
    showContactsUser: number = 1;
    softUrl: string = "";
    uploadUrl: string = "";
    videoLen: string = "20";
    website: string = "";
    xMPPDomain: string = utils.apiJudge(apiUrl) ? 'api.' + apiUrl : apiUrl;
    xMPPHost: string = utils.apiJudge(apiUrl) ? 'api.' + apiUrl : apiUrl;
    xMPPTimeout: number = 15;
    xmppPingTime: number = 10;
    wechatAppId: string = 'wxe973eb4f2cd0bf36';
    wechatSecret: string = 'd0600aba0fcb24b4b8785a3177ca34c2';
    wxLoginUrl: string = "wxe973eb4f2cd0bf36";

    uploadAvatarUrlGroup: string = ''
    uploadAvatarUrl: string = "";
    uploadVoiceUrl: string = "";
    deleteFileUrl: string = "";
    avatarBase: string = "";
    @observable avatarUpdateId: string = "--";
    defaultAvatarUrl: string = "";


    mucJID: string = ""
    @observable access_token: string = '';


    userId: string = '';
    userAccount: string = ''; // ID 号 设置我的里面
    birthday: string = ''; //生日
    sex: string = '0'; //生日
    isCreateRoom = 1;

    // //////////////////////////////这里w的数据咱们用下啊////////////////////////////
    isReadDel: number = 0;
    isAutoOpenCustomer: number = 1;  //是否自动开启客服模式
    @observable resource: string = "web" + (Date.parse(new Date().toString()) / 1000 % 100000);//多点登录 用到的 设备标识
    jid: any = null;
    @observable telephone: string = ''
    birth: string = ''
    @observable password: string = ''
    salt: string = ''
    loginResult: any = null;
    @observable user: User = new User();
    nickname: string = '';
    locateParams: any = null;
    keepalive: number = 25;//xmpp 心跳间隔
    charArray: Array<string> = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
    isShowGroupMsgReadNum: boolean = false;  //是否显示群组消息已读人数，false：不显示 true:显示 默认不显示

    xmppHost: string = '';
    boshDomain: string = '';//
    meetingHost: string = '';//

    ismin: boolean = false;//系统是否是最小化
    isWindowChange: boolean = false;//系统是否变化

    @observable language: string = 'zh-CN';
    @observable backImageurl: string = '';

    /** 设备登录冲突 */
    loginConflict: boolean = false;

    lastReceiveMsgTime: number = 0;
    online: boolean = true;

    isOpenGroupOwnerRead: number = 0;
    /**
     * 是否可以设置最新消息接收时间
     */
    canChangeLastMesTime = false;
    /**
     * 本地最近接收消息时间
     */
    private recMesLastTime = 0;
    changeLastRecMesTime = (timeCur: number, isInit?: boolean) => {
        if (timeCur && (this.canChangeLastMesTime || isInit)) {
            this.recMesLastTime = timeCur;
            // console.log('11111111设置最近时间',timeCur,this.recMesLastTime);
        }
    }

    getLastRecMesTime = () => {
        // console.log('11111111获取最近时间',this.recMesLastTime);
        return this.recMesLastTime
    }


    tabBarConfigList: {
        tabBarId: string,
        tabBarImg: string,
        tabBarImg1: string,
        tabBarLinkUrl: string,
        tabBarName: string,
        tabBarNum: number,
        tabBarStatus: number,
        tabBarUpdateTime: number
    }



    /** xmpp 链接状态 0 未开始连接 1 连接中 2 连接成功 -1 初始状态 3 连接断开 */
    @observable xmppStatus: number = -1;
    @action changeXmppStatus = (status: number) => {
        this.xmppStatus = status
    }


    //语言设置

    @action changeLangua = (langua: string) => {
        this.language = langua;

        switchToLanguage(langua);

        ipcRender.setLanguage(langua);
    }

    private netService: NetService;


    private netConfig: { apiUrl: string, boshUrl: string };
    constructor() {

        this.netConfig = ipcRender.getNetConfig();

        if (this.netConfig && this.netConfig.apiUrl) {
            SystemStore.apiUrl = this.netConfig.apiUrl;
        }


        this.netService = NetService.getInstance(this.prk, this.puk, this.apiKey, this.appCID);
        window.addEventListener('online', this.onlineHandle);
        window.addEventListener('offline', this.offlineHandle)

        // 初始化
        this.initConfig();

        this.getLocal();
    }
    //第二通道拉取数据
    getData = async () => {
        try {
            let requestConfig: AxiosRequestConfig = {};
            // requestConfig.headers = { 'Access-Control-Allow-Origin': '*', "Content-Type": "application/x-www-form-urlencoded" ,"Access-Control-Allow-Credentials":true};
            // config.data["access_token"] = this.access_token;
            // requestConfig.params = this.createOpenApiSecret(config.data);
            console.log('第二通道---数据')
            requestConfig.method = 'GET';
            let data = await this.netService.initConfig(requestConfig, `${SystemStore.apiUrl}:8095/messages/sync?device=web&token=${this.access_token}&delete=true`, {});
            return data;
        } catch {
            return [];
        }

    }
    changXmmppUrl = (boshUrl: string) => {
        this.netService = NetService.getInstance(this.prk, this.puk, this.apiKey, this.appCID);
        imsdk.reSetIMSDK();

        // this.netService = NetService.getInstance(this.prk, this.puk, this.apiKey, this.appCID);
        window.addEventListener('online', this.onlineHandle);
        window.addEventListener('offline', this.offlineHandle)

        this.initConfig(boshUrl);

        this.getLocal();
    }
    @action onlineHandle = () => {
        this.online = true;

        if (routerStore.history && routerStore.history.location.pathname == '/main') {
            webIM.loginIM();
        }
    }
    @action changeAvatarUpdateId = (id: string) => {
        this.avatarUpdateId = id
    }

    @action offlineHandle = () => {
        this.online = false;
        webIM.logout();

        // this.setConnectionStatus(3)
    }

    getLocal = async () => {
        let local = await ipcRender.getLocal();
        this.changeLangua(local);
    }
    //设置手机号
    @action changeTelephone = async (telephone: string) => {
        const res = await imsdk.changeTelephone(telephone);
        if (res && res.resultCode == 1) {
            this.telephone = telephone;
            message.success(" 设置成功")
            return true
        } else {
            // message.success(" 设置失败")
            return false
        }

    }
    @action changeLocalTelephone = (telephone: string) => {
        this.telephone = telephone;
    }
    //设置出生日期
    @action changeBirth = async (brith: string) => {
        const res = await imsdk.changeBirth(brith);
        if (res && res.resultCode == 1) {
            this.user.birthday = Number(brith);
            return true
        } else {
            return false
        }

    }
    //设置昵称
    @action changeNickname = async (nickname: string) => {
        const res = await imsdk.changeNickname(nickname);
        if (res && res.resultCode == 1) {
            this.user.nickname = nickname;
            this.nickname = nickname;
            setTimeout(() => {
                // 抛出事件
                eventBus.emit('changeNickname', nickname)
            })
            return true
        } else {
            return false
        }

    }

    getLocalCountry = async () => {
        let url = 'https://api.ip.sb/geoip';

        let pos = await Axios.post(url).catch(error => {
            return null;
        });
        console.log('获取的位置信息', pos);
        if (pos && pos.data) {
            this.userIp = pos.data.ip;
        }

        return pos;
    }

    //设置通信号
    @action changeReport = async (report: string) => {
        const res = await imsdk.changeReport(report);
        if (res && res.resultCode == 1) {
            //  this.report = report;
            message.success(" 设置成功")
            return true
        } else {
            // message.success(" 设置失败")
            return false
        }

    }
    //设置性别
    @action changeSex = async (sex: number) => {
        const res = await imsdk.changeSex(sex);
        if (res && res.resultCode == 1) {
            this.user.sex = sex;
            return true
        } else {
            return false
        }

    }
    // 退出
    @action loginOut = () => {
        this.access_token = ''
    }
    /**
     *初始化配置文件
     *
     * @memberof SystemStore
     */
    @action initConfig = async (spoceSelect?: string, config: any = {}): Promise<any> => {
        if (!config.data) {
            config.data = {};
        }

        let requestConfig: AxiosRequestConfig = {};

        requestConfig.method = 'POST';

        try {

            // 初始化
            let configRet = await this.netService.initConfig(requestConfig, '/config', config.data);

            // 待废弃
            if (configRet.data && configRet.data.PCXMPPPort) {
                this.boshUrlPort = configRet.data.PCXMPPPort
            }

            // 多线路配置
            if (configRet.data && configRet.data.apiUrls) {
                let u: string[] = [apiUrl]
                SystemStore.apiUrl = u.concat(configRet.data.apiUrls.split('|'))[0]
                SystemStore.boshUrls = u.concat(configRet.data.apiUrls.split('|'))
            }

            runInAction(() => {
                if (configRet.resultCode == 1) {
                    inIt(configRet.currentTime)

                    for (let entry in configRet.data) {
                        // 赋值
                        this[entry] = configRet.data[entry];
                        // if (entry == 'XMPPHost') {
                        //     // 设置xmpp地址
                        //     console.log('for entry')
                        //     this.boshUrl = "ws://" + this[entry] + `:${this.boshUrlPort}/websocket/`;
                        // }
                        if (entry == 'uploadUrl') {
                            this.uploadServer = this[entry];
                        }
                    }

                    // console.log('this---', this)
                    if (this['PCXMPPHost']) {
                        this.boshUrl = "ws://" + this['PCXMPPHost'] + `:${this.boshUrlPort}/websocket/`;
                    } else if (this.netConfig.boshUrl && !spoceSelect) {
                        this.boshUrl = "ws://" + this.netConfig.boshUrl + `:${this.boshUrlPort}/websocket/`;
                    }

                    if (spoceSelect && spoceSelect.length > 0) {

                        this.boshUrl = spoceSelect;
                    }

                    if (!this.isNil(this.XMPPDomain)) {
                        this.mucJID = "muc." + this.XMPPDomain;
                    }


                    if (!this.isNil(configRet.data.XMPPHost)) {
                        this.xmppHost = configRet.data.XMPPHost;
                    }
                    if (!this.isNil(configRet.data.XMPPDomain)) {
                        this.boshDomain = configRet.data.XMPPDomain;
                        this.mucJID = "muc." + this.boshDomain;
                    }
                    if (!this.isNil(configRet.data.meetingHost)) {
                        this.meetingHost = configRet.data.meetingHost;
                    }
                    if (configRet.data.jitsiServer) {
                        this.jitsiServer = configRet.data.jitsiServer;
                    }
                    if (!this.isNil(configRet.data.wechatAppId)) {
                        this.wechatAppId = configRet.data.wechatAppId;
                        this.wxLoginUrl += this.wechatAppId;
                    }

                    this.uploadUrl = this.uploadServer + "upload/UploadifyServlet";
                    this.uploadAvatarUrlGroup = this.uploadServer + 'upload/GroupAvatarServlet';
                    this.uploadAvatarUrl = this.uploadServer + "upload/UploadifyAvatarServlet";
                    this.uploadVoiceUrl = this.uploadServer + "upload/UploadVoiceServlet";
                    this.deleteFileUrl = this.uploadServer + "upload/deleteFileServlet";
                    this.sendHelper = new CryptoData.CtyHelper('', this.obsPuk, this.apiKey, this.apiKey, true);
                    // console.log('获取配置',configRet.data);
                    if (configRet.data && configRet.data.isOpenOSStatus == 1 && configRet.data.bucketName) {
                        //华为云
                        if (configRet.data.osType == 1) {
                            let obsConfig = this.getObsConfig(configRet.data);
                            observerServices.setObsConfig({
                                access_key_id: obsConfig.access_key_id + '',
                                secret_access_key: obsConfig.secret_access_key + '',
                                server: obsConfig.server + '',
                                timeout: obsConfig.timeout,
                                downloadAvatarUrl: this.downloadAvatarUrl,
                                downloadUrl: this.downloadUrl,
                            }, configRet.data.bucketName)
                        }

                    }

                    this.avatarBase = this.fileServer + "avatar/o/";
                    this.defaultAvatarUrl = this.fileServer + "avatar/t/104/10000104.jpg";
                    this.defaultAvatarUrl = this.fileServer + "image/ic_avatar.png";
                    if (configRet.data.downloadAvatarUrl) {
                        this.avatarBase = configRet.data.downloadAvatarUrl + "avatar/o/";
                    }
                    // console.log('节点数据',configRet.data.isNodesStatus,configRet.data.nodesInfoList)
                    //多节点配置
                    const nodeList = configRet.data.nodesInfoList;
                    // console.log('节点1', configRet.data.isNodesStatus, nodeList)
                    if (configRet.data.isNodesStatus == '1'
                        &&
                        nodeList
                        && Array.isArray(nodeList)
                        && nodeList.length > 0
                    ) {
                        this.isNodesList = nodeList.map((item: any) => {
                            if (item.nodeIp) {
                                if (this.isForeigner) {
                                    if (SystemStore.apiSwitchUrl.indexOf(item.nodeIp) != -1) {
                                        this.changeUrl(item.nodeIp);
                                    }
                                }
                                return {
                                    name: item.nodeName ? item.nodeName + '' : item.nodeIp + '',
                                    url: item.nodeIp ? item.nodeIp + '' : '',
                                    id: item.id ? item.id : ''
                                } as IServerUrlItem
                            }
                            return null
                        })
                        console.log('节点', this.isNodesList)
                    }
                    // console.log('节点列表',this.isNodesList)
                } else {

                }
            })
        } catch (e) {
            console.log(e);
        }
    }

    getObsConfig = (_data: any) => {

        let accessKeyId = this.sendHelper.parsePukPer(_data.accessKeyId);
        let accessSecretKey = this.sendHelper.parsePukPer(_data.accessSecretKey);

        // _data.accessKeyId;
        // _data.accessSecretKey;
        _data.bucketName;
        _data.endPoint;

        console.log('--getObsConfig--', {
            access_key_id: accessKeyId,
            secret_access_key: accessSecretKey,
            server: _data.endPoint,
            timeout: 60 * 5,
        });


        return {
            access_key_id: accessKeyId,
            secret_access_key: accessSecretKey,
            server: _data.endPoint,
            timeout: 60 * 5,
        }
    }
    isNil = (s: any) => {
        return undefined == s || "undefined" == s || null == s || s == '' || s.trim && s.trim() == "" || s.trim && s.trim() == "null" || NaN == s;
    }

    isJSON = (str: string) => {
        if (typeof str == 'string') {
            try {
                var obj = JSON.parse(str);
                if (typeof obj == 'object' && obj) {
                    return true;
                } else {
                    return false;
                }

            } catch (e) {
                console.log('error：' + str + '!!!' + e);
                return false;
            }
        }
        else {
            return false
        }
    }
    /**
     * 创建API密钥
     */
    public createOpenApiSecret = (data: any) => {
        if (!data) {
            data = {};
        }
        data.time = this.getCurrentSeconds();
        let api_time = this.apiKey + data.time + (this.userId || '') + (this.access_token || '');
        data.access_token = this.access_token;
        let md5Key = md5(api_time);
        data.secret = md5Key;
        return data;
    }

    /**
     * 获取本地时间
     */
    getCurrentSeconds = () => {
        return Math.round(new Date().getTime() / 1000);
    }


    /*是否为阅后即焚消息*/
    isReadDelMsg = (msg: any): boolean => {
        try {
            if (!(msg.isReadDel)) {
                return false;
            }
            return ("true" == msg.isReadDel || 1 == msg.isReadDel);
        } catch (e) {
            //console.log(e.name + ": " + e.message);
            return false;
        }

    }

    //处理xmpp 连接状态
    @action setConnectionStatus = async (_status: number): Promise<any> => {
        // console.log('时间差修改状态', _status);
        this.xmppStatus = _status;
    }

    @action setLoginConflict = () => {
        this.lastReceiveMsgTime = 0;
        this.access_token = '';
        this.loginConflict = true
    }

}

export default new SystemStore();

export const languaConfig = {
    'zh-CN': '简体中文',
    // 'zh-hant': '繁體中文（香港）',
    'en-US': 'English',
}

