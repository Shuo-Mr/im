//XmppSDK用于通信第一通道
import * as strophe from 'strophe.js';
import { XmppConnectStatus } from './Const';
import systemStore, { SystemStore } from '../store/SystemStore';
import loginStore from '../store/LoginStore';
import deviceManager from './DeviceManager';
import Utils from '../utils/utils';
import imSDK from './IMSDK';
import ipcRender from '../ipcRender';
import * as jsCookie from 'js-cookie';



import WebIM from './WebIM';
import { insertMessage } from '../dbtemp/HandleDB';
import { mesDataCache } from '../dbCache/dbCacheData';
import { isOpenDB, isOpenLogUpload, isOpenTwoContent } from '../config/SystemConfig';
import md5 from 'md5';




// strophe.Strophe.log = function (l: strophe.Strophe.LogLevel, s: string) {
//     console.log('当前xmpp消息log', s);
// }

const CONNECTD_ESC: any = {
    [strophe.Strophe.Status.ERROR]: `错误 状态值：${strophe.Strophe.Status.ERROR}`,
    [strophe.Strophe.Status.CONNECTING]: `正在创建连接 状态值：${strophe.Strophe.Status.CONNECTING}`,
    [strophe.Strophe.Status.CONNFAIL]: `连接创建失败 状态值：${strophe.Strophe.Status.CONNFAIL}`,
    [strophe.Strophe.Status.AUTHENTICATING]: `正在验证 状态值：${strophe.Strophe.Status.AUTHENTICATING}`,
    [strophe.Strophe.Status.AUTHFAIL]: `验证失败 状态值：${strophe.Strophe.Status.AUTHFAIL}`,
    [strophe.Strophe.Status.CONNECTED]: `连接创建成功 状态值：${strophe.Strophe.Status.CONNECTED}`,
    [strophe.Strophe.Status.DISCONNECTED]: `连接已关闭 状态值：${strophe.Strophe.Status.DISCONNECTED}`,
    [strophe.Strophe.Status.DISCONNECTING]: `连接正在关闭 状态值：${strophe.Strophe.Status.DISCONNECTING}`,
    [strophe.Strophe.Status.ATTACHED]: `ATTACHED 状态值：${strophe.Strophe.Status.ATTACHED}`,
    [strophe.Strophe.Status.REDIRECT]: `REDIRECT 状态值：${strophe.Strophe.Status.REDIRECT}`,
    [strophe.Strophe.Status.CONNTIMEOUT]: `连接超时 状态值：${strophe.Strophe.Status.CONNTIMEOUT}`,

}
/**
 * xmpp 初始化
 */
export class XmppSDK {

    // private connect: strophe.Strophe.Connection;


    cont: string = "tigmweb_";
    connection: strophe.Strophe.Connection;
    /*服务器的 domain*/
    server: any = null;
    /*登录成功的回调*/
    logincallBack: Function;
    /*收到消息的回调*/
    messageReceiver: Function;
    /*消息回执 处理方法*/
    handlerMsgReceipt: Function;

    /**登录冲突 */
    handlerLoginConflict: Function;

    /**重新连接 */
    reConnectFun: Function;

    /** 同步登录状态 */
    setConnectionStatus: Function;

    userIdStr: string;
    resource: string;
    token: string;
    salt: string;
    /*心跳间隔时间*/
    pingTime: number = 10
    /*最后一次传递消息的时间*/
    // lastTransferTime: number = 0;
    /*是否启用批量发送消息回执 */
    enableAckReceipt: boolean = false;
    waitSendReceiptIds: Array<string> = [];
    /*自定义 服务器送达机制的 命名空间*/
    NS_SKACK: string = "xmpp:tig:ack";

    connectingCount: number = 0;

    serverUrl: string;
    nickname: string;
    userId: string;

    //第二通道对象
    eventSource: any = null;
    //第二通道是否连接上了
    isConnectTwo: boolean = false
    //第二通道重连次数
    trycontentTwoNum: number = 0;
    //第二通道链接计时器
    lookTwoTime: any;

    //表示没有重新连接过
    isReConnect: number = 0;


    // 发送ping试探次数
    pingErrorNum: number = 0;

    // 发送ping timeout timer
    pingTimer: NodeJS.Timeout | null;

    // 心跳间隔时间（s）
    pingInterval = 10;

    //重连次数
    trycontentNum: number = 0;

    connectStatus: number = -1;

    constructor() {

    }

    init = (boshUrl: string) => {
        // this.connect = new strophe.Strophe.Connection(boshUrl);
        // this.connect.connect(systemStore.jid)


    }




    initApi = (_url: string, _userId: string, _resource: string, _token: string, _pingTime: number, _server: string, _salt: string) => {
        this.serverUrl = _url;
        this.resource = _resource;
        this.userId = _userId;
        this.token = _token;
        this.salt = _salt;
        // this.pingTime = _pingTime || 10;
        // this.pingTime = 30;
        this.server = _server;
        this.userIdStr = this.getFullUserJid(_userId) + "/" + _resource;
        // 初始化 连接等待时间
        this.connectAwaitTime = 0;

        let log = Object.assign(ipcRender.getOSC(), { "用户ID": this.userId });
        if (isOpenLogUpload) {
            imSDK.setLogRepot(ipcRender.getCurrectDeviceSource(), log);
        }

        this.connectStatus = -1;
        // console.log('多端登录', this.resource)
    }

    getFullUserJid = (userId: string): string => {
        if (!userId)
            return userId;
        return userId + "@" + this.server;
    }
    //重连接等待的时间 每次重连加1 控制重连 间隔
    connectAwaitTime: number = 0;
    loginTimer: any;

    loginIM = async (): Promise<any> => {
        try {
            // debugger;
            // let timeAwait = this.connectAwaitTime;
            // if (timeAwait > 0) {
            //     timeAwait = timeAwait * 2
            // }
            // this.loginTimer = setTimeout(() => {

            // this.isConnect() &&
            this.sendReceiptTask && clearInterval(this.sendReceiptTask);
            this.sendReceiptTask = null as any;

            if (!this.connection) {
                this.connection = new strophe.Strophe.Connection(this.serverUrl, { keepalive: true });
                this.connection.maxRetries = 100;
                this.connection.xmlInput = this.onMessage;
                // this.connection.xmlOutput = this.onOutput;
                this.connect();
            } else {
                // debugger;
                // if (this.connected) {
                //     console.log('当前attachSid--', this.sid);
                //     this.connection.attach(this.userIdStr, this.sid, this.rid, this.onConnect);
                // } else {
                console.log('直接-----connect--', this.sid);
                this.enableAckReceipt = false;
                this.connection.disconnect("offline");
                this.connection.reset();
                this.connect();
                // }
            }
        } catch (e) {
            console.log(e.name + ": " + e.message);
        }
    }


    onOutput = (elem: any) => {

        this.rid = elem.getAttribute("rid");
        if (!this.sid) {
            this.sid = elem.getAttribute("sid");
        } else {
            let tempSid = elem.getAttribute("sid");
            if (tempSid && tempSid == this.sid) {
                this.sid = tempSid;
            }
        }
    }

    connect = async() => {


        if (systemStore.access_token != "" && !this.connected) {
            console.log('source-->', this.userIdStr, this.token, '::', this.salt);
            //加密密码
            let pass = this.salt == '' ? this.token : md5(md5(this.salt + md5(this.token + this.salt)))
            this.connection.connect(this.userIdStr, pass, this.onConnect, 30);
        }

    }

    lookTime: any;
    connected: boolean;
    selfExit: boolean = false;
    disconnetTime: number = 0;
    //延时显示连接状态时间
    stateDelayTime: number = 20;  // 秒

    netStatusShowTimer: NodeJS.Timeout | null = null;
    status: number;

    //延时显示连接状态
    startSetnetStatus = (status: number) => {
        this.status = status;
        if (this.netStatusShowTimer) {
            return
        } else {
            this.netStatusShowTimer = setTimeout(() => {
                this.setConnectionStatus && this.setConnectionStatus(this.status);
            }, this.stateDelayTime * 1000)
        }
    }
    //设置xmpp连接状态 延迟显示
    setDisconnetTime = (status: number) => {
        console.log('网络连接状态', status);
        if (status == strophe.Strophe.Status.CONNECTED) {
            this.netStatusShowTimer && clearTimeout(this.netStatusShowTimer)
            this.netStatusShowTimer = null
            this.setConnectionStatus && this.setConnectionStatus(XmppConnectStatus.CONNECT_SUCCESS);
        } else if (status == strophe.Strophe.Status.CONNECTING) {
            this.startSetnetStatus(XmppConnectStatus.CONNECTIONING)
        } else {
            this.startSetnetStatus(XmppConnectStatus.OVER_DANGER)

        }
    }
    //根据重连次数获取重连时间间隔，防止死循环卡死
    getTryConnentInvelal = (): number => {
        return this.trycontentNum * 5000;
    }
    //重连xmpp轮回
    tryConnectXmpp = () => {
        if (this.trycontentNum < 9) {
            this.trycontentNum += 1;
            this.lookTime && clearTimeout(this.lookTime);
            this.lookTime = setTimeout(async() => {
                if (systemStore.access_token != "" && !this.connected) {
                    // this.connection.flush();
                    this.connection.disconnect('recontent');
                    this.connection.reset();
                    if(isOpenTwoContent){
                        let data =await systemStore.getData();
                        data.map((item:any)=>{
                            console.log('第二通道拉取的数据', JSON.parse(item))
                            xmppSDK.onJsonMessage(JSON.parse(item));
                        })
                    }
                    this.connect();
                    // this.tryConnectXmpp();
                }
            }, this.getTryConnentInvelal())
            console.log(this.getTryConnentInvelal(), '重连的时间间隔——————————》次数：', this.trycontentNum)
        }
    }
    //xmpp 连接状态回调
    onConnect = (status: number, condition: string) => {
        // console.log("xmpp server onconnect >>>>>>>>>>>>>>>>>>", status, this.sid);
        let statuslog =
            `连接日志：
        状态:${CONNECTD_ESC[status]}
        时间:${new Date()}
        用户ID:${this.userId}
        连接:${this.userIdStr}
        条件:${condition}
        `;
        if (status != strophe.Strophe.Status.CONNECTED) {
            systemStore.canChangeLastMesTime = false;
        }
        console.log('网络状态', new Date(), statuslog);

        this.lookTime && clearInterval(this.lookTime);
        if (isOpenLogUpload) {
            imSDK.setLogRepot(ipcRender.getCurrectDeviceSource(), statuslog);
        }
        this.connectStatus = status;
        if (status == strophe.Strophe.Status.CONNECTED) {
            this.connectStatus = strophe.Strophe.Status.CONNECTED
            this.trycontentNum = 0;
            this.connected = true;

            //连接成功 重置连接等待时间
            console.log("xmpp连接成功-----");
            this.selfExit = false;
            this.loginSuccess();

            //连接成功开始发送消息机制
            this.startTimeWithSendMes();
            // this.setConnectionStatus && this.setConnectionStatus(XmppConnectStatus.CONNECT_SUCCESS);
        } else if (status == strophe.Strophe.Status.CONNECTING) {
            this.connected = false;
            console.log('Strophe.Status.CONNECTING------------------------------------------------------');
        } else if (status == strophe.Strophe.Status.CONNFAIL) {
            if (systemStore.access_token != "") {
            }
        } else if (status == strophe.Strophe.Status.CONNTIMEOUT) {
            this.connection.disconnect("offline");
        } else if (status == strophe.Strophe.Status.DISCONNECTED) {
            this.connected = false;
            if (this.selfExit) {
                this.selfExit = false;
                return;
            }

            deviceManager.clearMutiDevice();
            this.tryConnectXmpp()
        } else if (status == strophe.Strophe.Status.AUTHFAIL) {
            if (systemStore.access_token != "") {
                this.connected = false;
            }

        } else if (status == strophe.Strophe.Status.ATTACHED) {
            if (systemStore.access_token != "") {
                if (this.connected) {
                    var presence = strophe.$pres()//.c("show").t("online");
                    this.send(presence);
                } else {
                    // this.connection.flush();
                    // this.connection.reset();
                    // this.connected = false;
                    // this.connect();
                }
            }


        } else if (status == strophe.Strophe.Status.ERROR) {
            this.connected = false;
            console.log('网络连接异常', condition);
            if (condition == 'conflict' || condition == 'terminate') {
                console.log('conflict');
                this.handlerLoginConflict && this.handlerLoginConflict();
            }
            console.log('Strophe.Status.CONNECTING------------------------------------------------------');
            // this.setConnectionStatus && this.setConnectionStatus(XmppConnectStatus.CONNECTIONING);
            // }
        }
        else {
            // this.setConnectionStatus && this.setConnectionStatus(XmppConnectStatus.OVER_DANGER);
        }
        if (status) {
            this.setDisconnetTime(status);
        }
        return true;
    }

    isCanUse = (): boolean => {
        if (this.connectStatus == strophe.Strophe.Status.CONNECTED) {
            return true;
        } else {
            return false;
        }
    }
    reConn: boolean;
    loginSuccess = () => {

        // this.send(strophe.$pres().c("show").t("online"));
        this.sendEnableAckReceipt();
        this.send(strophe.$pres());
        this.connection.flush();
        // this.enableStream();

        const recMesLastTime = systemStore.getLastRecMesTime();
        const timeCurrent = recMesLastTime > 0 ? WebIM.getServerTime() - recMesLastTime : 0;
        this.logincallBack && this.logincallBack(timeCurrent);
        systemStore.canChangeLastMesTime = true;
        // clearInterval(this.ping);
        //XmppSdk.ping=null
        this.reConn = true;
        this.connectingCount = 0;
        this.startPing(true)
        //重连第二通道
        // if (!this.isConnectTwo) {
        //     this.onConnectTow();
        // }


        // this.ping && window.clearInterval(this.ping);

        // if (this.pingTime > 0) {
        //     this.ping = window.setInterval(() => {
        //         if (this.pingTime == 0) {
        //             window.clearInterval(this.ping);
        //         }
        //         this.sendPing();
        //     }, 10000);
        // } else {
        //     this.ping && window.clearInterval(this.ping);
        // }
    }

    //开始发送心跳
    startPing = (isInit?: boolean) => {
        if (isInit) {
            //初始化心跳初始值
            this.pingErrorNum = 0;
        }
        this.pingTimer && clearInterval(this.pingTime);
        this.pingTimer = null;
        if (this.pingTime > 0) {
            this.pingTimer = setInterval(() => {
                this.connected && this.sendPing();
            }, (this.pingTime ? this.pingTime : this.pingInterval) * 1000)
        }
    }

    presenceNum: number = 0;
    checkJSonPresence = (data: any) => {
        //第二通道多端在线设备添加，目前有问题
        if (data.nodeName == 'presence') {
            let tempjid: string = data.attributes.from;
            if (tempjid != '' && data.attributes.type == 'groupchat') {
                this.presenceNum++;
                return true;
            }
            if (1 == loginStore.userSetting.multipleDevices) {


                let resource = Utils.getResource(tempjid);

                if (tempjid != '' && systemStore.userId == this.getUserIdFromJid(tempjid) && -1 != deviceManager.allDeviceArr.indexOf(resource) && this.resource != resource) {

                    console.log(systemStore.userId == this.getUserIdFromJid(tempjid), '----systemStore.userId == this.getUserIdFromJid(tempjid)--');

                    let temptype = data.attributes.type || '';
                    // console.log('---------temptype---------', temptype);
                    if (temptype != 'unavailable') {
                        deviceManager.updateDeviceStatus(Utils.getResource(tempjid), 1);
                    } else {
                        deviceManager.updateDeviceStatus(Utils.getResource(tempjid), 0);
                    }
                }
                return true;
            }
            return true;
        }
        return false
    }

    checkPresence = (elem: Element) => {
        if (elem.nodeName == 'presence') {
            let tempjid: string = elem.getAttribute('from') || '';

            if (tempjid != '' && Utils.isGroup(this.getUserIdFromJid(tempjid))) {
                this.presenceNum++;
                // console.log('有多少个在线包～～～', this.presenceNum);


                return true;
            }
            if (1 == loginStore.userSetting.multipleDevices) {


                let resource = Utils.getResource(tempjid);

                if (tempjid != '' && systemStore.userId == this.getUserIdFromJid(tempjid) && -1 != deviceManager.allDeviceArr.indexOf(resource) && this.resource != resource) {

                    console.log(systemStore.userId == this.getUserIdFromJid(tempjid), '----systemStore.userId == this.getUserIdFromJid(tempjid)--');

                    let temptype = elem.getAttribute('type') || '';
                    // console.log('---------temptype---------', temptype);
                    if (temptype != 'unavailable') {
                        deviceManager.updateDeviceStatus(Utils.getResource(tempjid), 1);
                    } else {
                        deviceManager.updateDeviceStatus(Utils.getResource(tempjid), 0);
                    }
                }
                return true;
            }
            return true;

        }

        return false;
    }
    rid: any;
    sid: any;
    onMessage = (elem: Element): any => {
        // console.log('收到消息', elem);
        if (this.checkPresence(elem)) {
            return;
        }

        if (this.checkUnavailable(elem)) {
            this.handlerLoginConflict && this.handlerLoginConflict(1);
            return;
        }
        if (this.checkConflict(elem)) {
            console.log('elem-connect-disconnect', elem);
            return;
        }
        /*检查 是否 开启自定义送达机制*/
        if (!this.enableAckReceipt) {
            // this.handlerEnableAckResult(elem);
            // console.log(elem, '------enableAckReceipt---');
            if (this.handlerEnableAckResult(elem)) {
                return;
            }
        }


        // this.lastTransferTime = this.getCurrentSeconds();
        let msgArr = this.getMessages(elem, "message");

        if (null == msgArr)
            return;
        let message = null;

        // 设置获取消息的时间
        if (systemStore.canChangeLastMesTime) {
            systemStore.changeLastRecMesTime(WebIM.getServerTime());
        }

        for (let i = 0; i < msgArr.length; i++) {
            message = msgArr[i];
            if (!message)
                continue;
            else if (this.checkReceived(message)) {
                // console.log('收到消息回执', message);
                continue;
            }
            message = this.convertToClientMsg(message);
            if (!message)
                continue;
            // console.log('收到原始消息数据', message);
            // shikuLog("收到 receiver  "+Strophe.serialize(message));
            //处理单条消息
            // saveArray.push(message);

            // console.log('密111 onMessage');
            // console.log('密111 onMessage',message);
            message.content = WebIM.decryptMessage(message);
            isOpenDB && message.type != 26 && insertMessage(message);
            message.type != 26 && message.type != 200 && mesDataCache.addmes(message);
            this.messageReceiver && this.messageReceiver(message);

        }

        return true;

    }
    //处理第二通道Json数据
    onJsonMessage = (elem: Element): any => {
        // 判断多端在线
        // if (this.checkJSonPresence(elem)) {
        //     return;
        // }
        // this.lastTransferTime = this.getCurrentSeconds();
        let msgArr = this.getJsonMessages(elem, "message");

        if (null == msgArr)
            return;
        let message = null;

        // 设置获取消息的时间
        if (systemStore.canChangeLastMesTime) {
            systemStore.changeLastRecMesTime(WebIM.getServerTime());
        }

        for (let i = 0; i < msgArr.length; i++) {
            message = msgArr[i];
            if (!message)
                continue;
            //todo第二通道有消息回执的消息类型吗
            // else if (this.checkReceived(message)) {
            //     // console.log('收到消息回执', message);
            //     continue;
            // }
            message = this.convertJsonToClientMsg(message);
            if (!message)
                continue;
            // console.log('收到原始消息数据', message);
            // shikuLog("收到 receiver  "+Strophe.serialize(message));
            //处理单条消息
            // saveArray.push(message);

            // console.log('密111 onMessage');
            // console.log('密111 onMessage',message);
            message.content = WebIM.decryptMessage(message);
            // message.content= WebIM.decryptMessage(message);
            // console.log('消息解析出来了吗', message.content)
            isOpenDB && message.type != 26 && insertMessage(message);
            message.type != 26 && message.type != 200 && mesDataCache.addmes(message);
            this.messageReceiver && this.messageReceiver(message);

        }

        return true;

    }

    /*转换为 客户端的 消息*/
    convertToClientMsg = (elem: Element) => {
        let bodyElem = elem.getElementsByTagName('body')[0];
        let type = elem.getAttribute('type');
        if ((type != ChatType.CHAT && type != ChatType.GROUPCHAT) || bodyElem == undefined || bodyElem['length'] <= 0) {
            return null;
        }

        let bodyText = Strophe.getText(bodyElem);
        if ("{" != bodyText.charAt(0) || "}" != bodyText.charAt(bodyText.length - 1)) {
            return null;
        }


        let message = JSON.parse(bodyText.replace(/&quot;/gm, '"'));

        console.log('服务器转换过来的消息-->', type);

        message.chatType = type;

        message.from = elem.getAttribute('from');
        message.to = elem.getAttribute('to');


        let fromResource = this.getResource(message.from);
        if (fromResource && ChatType.CHAT == type) {
            message.from = this.getUserIdFromJid(message.from) + "/" + fromResource;
            let toResource = this.getResource(message.to);
            if (toResource) {
                message.to = this.getUserIdFromJid(message.to) + "/" + toResource;
            }
            else {
                message.to = this.getUserIdFromJid(message.to);
            }

        } else {
            message.from = this.getUserIdFromJid(message.from);
            message.to = this.getUserIdFromJid(message.to);
        }


        message.messageId = elem.getAttribute('id');

        if (this.enableAckReceipt && message.messageId) {

            // console.log('message.type----', message.type, message.messageId)
            /*
            开启了 送达机制的 情况  发送回执
            */
            console.log('发送批量回执-->', elem.getAttribute('to'), message.type, message.messageId, message);
            this.sendAckReceiptIds(message.messageId);
        }
        if (type == ChatType.CHAT) {//单聊
            // 收到消息立即发送回执给发送者
            let request = elem.getElementsByTagName('request');

            let delay = elem.getAttribute("delay");//有这个字段就代表是离线消息

            console.log('离线存在--->', delay);




            if (request && request.length > 0 && request[0].getAttribute('xmlns') == 'urn:xmpp:receipts') {

                console.log('发送回执给谁-->', elem.getAttribute('from'), message.type, message.messageId);

                // if (message.type != '200') {
                //     this.sendAckReceiptIds(message.messageId);
                // } else {
                this.sendReceipt(elem.getAttribute('from'), message.messageId);
                this.sendAckReceiptIds(message.messageId);
                // }

                //离线消息 不发送达回执
                /*if(SKIMSDK.hasRequestReceipt(elem)){
                   SKIMSDK.sendReceipt(elem.getAttribute('from'),message.messageId);
                }*/

            }
        }
        /* let dataStr=JSON.stringify(message);
         console.log("convertToClientMsg end  ===> "+dataStr);*/
        return message;
    }
    //将第二通道的消息转换成客户端消息
    convertJsonToClientMsg = (elem: any) => {
        //  console.log('存储消息0000002222', elem.outerHTML);

        let bodyElem;
        for (let i = 0; i < elem.children.length; i++) {
            if (elem.children[i].cData) {
                bodyElem = elem.children[i]
                break;
            }
        }
        // if(!bodyElem)return null;
        let type = elem.attributes.type;
        if ((type != ChatType.CHAT && type != ChatType.GROUPCHAT) || bodyElem == undefined || elem.children.length <= 0) {
            return null;
        }

        // let bodyText = Strophe.getText(bodyElem);
        // if ("{" != bodyText.charAt(0) || "}" != bodyText.charAt(bodyText.length - 1)) {
        //     return null;
        // }


        let message = JSON.parse(bodyElem.cData.replace(/&quot;/gm, '"'));

        console.log('服务器转换过来的消息-->', message);

        message.chatType = type;

        message.from = elem.attributes.from;
        message.to = elem.attributes.to;


        let fromResource = this.getResource(message.from);
        if (fromResource && ChatType.CHAT == type) {
            message.from = this.getUserIdFromJid(message.from) + "/" + fromResource;
            let toResource = this.getResource(message.to);
            if (toResource) {
                message.to = this.getUserIdFromJid(message.to) + "/" + toResource;
            }
            else {
                message.to = this.getUserIdFromJid(message.to);
            }

        } else {
            message.from = this.getUserIdFromJid(message.from);
            message.to = this.getUserIdFromJid(message.to);
        }


        message.messageId = elem.attributes.id;

        if (this.enableAckReceipt && message.messageId) {

            // console.log('message.type----', message.type, message.messageId)
            /*
            开启了 送达机制的 情况  发送回执
            */
            // console.log('发送批量回执-->', elem.getAttribute('to'), message.type, message.messageId, message);
            // this.sendAckReceiptIds(message.messageId);
        }
        if (type == ChatType.CHAT) {//单聊
            // 收到消息立即发送回执给发送者
            let request = [];
            for (let i = 0; i < elem.children; i++) {
                if (elem.children[i].name == 'request') {
                    request.push(elem.children[i])
                }
            }
            // let request = elem.children[2];

            let delay = elem.delay;//有这个字段就代表是离线消息

            console.log('离线存在--->', delay);




            if (request && request.length > 0 && request[0].xMLNS == 'urn:xmpp:receipts') {

                console.log('发送回执给谁-->', elem.attributes.from, message.type, message.messageId);

                if (message.type != '200') {
                    this.sendAckReceiptIds(message.messageId);
                } else {
                    this.sendReceipt(elem.attributes.from, message.messageId);
                    this.sendAckReceiptIds(message.messageId);
                }

                //离线消息 不发送达回执
                /*if(SKIMSDK.hasRequestReceipt(elem)){
                   SKIMSDK.sendReceipt(elem.attributes.from,message.messageId);
                }*/

            }
        }
        /* let dataStr=JSON.stringify(message);
         console.log("convertToClientMsg end  ===> "+dataStr);*/
        return message;
    }
    sendReceipt = (from: any, id: string) => {

        console.log('发送多端回执～～～～～', from, id);

        var receipt = $msg({
            to: from,
            from: this.userIdStr,
            type: 'chat',
            id: Utils.randomUUID(),
        }).c("received", {
            xmlns: "urn:xmpp:receipts",
            id: id
        });
        this.send(receipt.tree());
    }

    /**
     * 待发消息队列
     */
    messageWaitSendList: Map<string, any> = new Map();

    /*
	批量发送 到服务器 消息回执
	*/
    sendAckReceiptIds = (messageId: string) => {
        this.waitSendReceiptIds.push(messageId);
        if (systemStore.access_token != "" && this.connected) {
            if (!this.sendReceiptTask) {
                this.sendReceiptTask = window.setInterval(() => {
                    if (this.waitSendReceiptIds.length == 0)
                        return;
                    // var receipt = $iq({
                    //     "from": this.userIdStr,
                    //     "to": this.server,
                    //     "type": 'set',
                    //     "version": '1.0'
                    // }).c("body", { xmlns: this.NS_SKACK }, this.waitSendReceiptIds.join());
                    // this.connected && this.send(receipt);
                    this.sendAck(this.waitSendReceiptIds);
                    console.log(" waitSendReceiptIds===> " + this.waitSendReceiptIds.length)
                    this.waitSendReceiptIds = [];
                }, 3000);
                // if (this.waitSendReceiptIds && this.waitSendReceiptIds.length > 59) {
                //     this.sendAck(this.waitSendReceiptIds);
                //     this.waitSendReceiptIds = [];
                // }
            }
        }


    }

    sendAck = (_msgArr: Array<string>) => {
        // var receipt = $iq({
        //     "from": this.userIdStr,
        //     "to": this.server,
        //     "type": 'set',
        //     "version": '1.0'
        // }).c("body", { xmlns: this.NS_SKACK }, _msgArr.join());
        // this.connected && this.send(receipt);
        let tmpArr = [];
        for(let i=0;i<_msgArr.length;i++){
            tmpArr.push(_msgArr[i]);
            if(i%20 == 0 && i > 0){
                var receipt = $iq({
                    "from": this.userIdStr,
                    "to": this.server,
                    "type": 'set',
                    "version": '1.0'
                }).c("body", { xmlns: this.NS_SKACK }, tmpArr.join());
                this.connected && this.send(receipt);
                tmpArr = [];
            }
        }
        if(tmpArr.length > 0){
            var receipt = $iq({
                "from": this.userIdStr,
                "to": this.server,
                "type": 'set',
                "version": '1.0'
            }).c("body", { xmlns: this.NS_SKACK }, tmpArr.join());
            this.connected && this.send(receipt);
            tmpArr = [];
        }
        _msgArr = [];
    }


    /**
     * 增加发送消息
     * 增加需要多端同步消息
     */
    addMesToAlignment = (message: any) => {
        console.log('发送消息', message);
        if (message && message.messageId && this.connection) {
            this.messageWaitSendList.set(message.messageId + '' + message.to, message);
            if (!this.isSendinng) {
                this.startTimeWithSendMes();
            }
        }
    }
    /**
     * 发送消息的计时器timer
     */
    sendMesTimer: NodeJS.Timeout

    /**
     * 发送消息状态
     */
    isSendinng = false;
    /**
     * 发送消息 计时器
     */
    startTimeWithSendMes = () => {
        // let time = 100;
        // this.sendMesTimer && clearInterval(this.sendMesTimer);
        // this.sendMesTimer = setInterval(() => {
        this.startSendMessage()
        // }, time)
    }
    /**
     * 开始发送消息
     */
    startSendMessage = () => {
        // console.log('当前个数', this.messageWaitSendList)
        if (!this.messageWaitSendList || this.messageWaitSendList.size < 1 || !this.connected) {
            this.isSendinng = false;
            // this.sendMesTimer && clearInterval(this.sendMesTimer);
            return;
        }

        // let size: number = 30;
        // }

        // let msgs: any = [];
        const targetKeys = Array.from(this.messageWaitSendList.keys()).slice(0, this.messageWaitSendList.size);
        // console.log('当前发送个数',targetKeys.length,size);
        targetKeys.forEach(item => {
            const targetMes = this.messageWaitSendList.get(item);
            // targetMes.chatType = Utils.isGroup(targetMes.to) ? ChatType.GROUPCHAT : ChatType.CHAT;
            console.log('0000000000------targetMes', targetMes.chatType);
            // targetMes.chatType = (Utils.isGroup(targetMes.to) || Utils.isGroup(targetMes.from) )? ChatType.GROUPCHAT : ChatType.CHAT;
            console.log('0000000000------targetMes1', targetMes.chatType);
            let elem = this.buildMessage(targetMes);
            // msgs.push(elem.tree());
            this.send(elem.tree());
            this.messageWaitSendList.delete(item);
            WebIM.waitMessageReceipt(targetMes, targetMes.toJid, targetMes.isResendMes);
        })
        // console.log('当前发送完',this.messageWaitSendList);

        // this.send(msgs);
    }

    /**
     * 发送消息节流机制
     */
    controllerWidthSendMessage = () => {
        this.messageWaitSendList
    }


    // getResource = (jid: string) => {
    //     if (!jid)
    //         return null;
    //     jid += "";
    //     let arr = jid.split("/");
    //     if (arr.length < 2) { return null; }
    //     arr.splice(0, 1);
    //     return arr.join('/');
    // }

    // send = (elem: Element|any) => {
    //     this.connection.send(elem);
    // }

    /*创建消息*/
    buildMessage = (msgObj: any) => {
        let elem = null;
        let message = msgObj;
        // let chatType = message.chatType;
        //delete message['chatType'];
        let to = this.getUserIdFromJid(message.to);


        if (Utils.isGroup(to)) {
            message.chatType = 'groupchat';
            elem = $msg({
                from: this.userIdStr,
                to: this.getFullGroupJid(message.to),
                type: 'groupchat',
                id: message.messageId

            }).c("body", null, JSON.stringify(message));

        } else {
            message.chatType = 'chat';
            let resource = this.getResource(message.to);
            if (resource)
                to = this.getFullUserJid(message.fromUserId) + "/" + resource;
            else
                to = this.getFullUserJid(to);
            elem = $msg({
                from: this.userIdStr,
                to: to,
                type: 'chat',
                id: message.messageId
            }).c("body", null, JSON.stringify(message));

        }

        console.log('-----chatType-------', to, '------', message.chatType, '------', Utils.isGroup(to));

        if (message.type != 200) {
            elem.c("request", {
                xmlns: "urn:xmpp:receipts"
            });
        }

        // let text = Strophe.serialize(elem);
        // console.log("send Message" + text.replace(/&quot;/gm, '"'));
        return elem;
    }


    getFullGroupJid = (jid: string) => {
        if (!jid)
            return jid;
        return jid + "@muc." + this.server;
    }

    sendReceiptTask: number;


    getResource = (jid: string): string => {
        if (!jid)
            return '';
        jid += "";
        let arr = jid.split("/");
        if (arr.length < 2) { return ''; }
        arr.splice(0, 1);
        return arr.join('/');
    }

    //检测是否为消息回执
    checkReceived = (message: any): boolean => {
        let received = message.getElementsByTagName('received')[0];

        // let from = message.getAttribute('from');
        if (!received)
            return false;
        //shikuLog("收到回执 checkReceived  "+Strophe.serialize(message));
        let id = received.getAttribute('id');
        let xmlns = received.getAttribute('xmlns');
        if (!xmlns && !id) {
            return false;
        }
        // console.log('设备检测',from,Utils.getResource(from),message)
        //多设备模块的  回执处理

        //todo 暂时保留 多端同步，修改为从在线消息中获取

        // if (1 == loginStore.userSetting.multipleDevices
        //     && systemStore.userId == this.getUserIdFromJid(from)
        //     && -1 != deviceManager.allDeviceArr.indexOf(Utils.getResource(from))
        // ) {
        //     deviceManager.updateDeviceStatus(Utils.getResource(from), 1);
        //     return true;
        // }

        this.handlerMsgReceipt && this.handlerMsgReceipt(id);
        return true;
    }

    getUserIdFromJid = (jid: string): string => {
        jid += "";
        return jid ? jid.split("@")[0] : "";
    }

    getMessages = (elem: Element, nodeName: any): Array<any> => {


        let msgArr = new Array();
        // if (elem.firstChild && "message" == elem.firstChild.nodeName && elem.childNodes.length == 0) {
        //     msgArr.push(elem);
        //     return msgArr;
        // }

        if (elem && "message" == elem.nodeName) {
            msgArr.push(elem);
            return msgArr;
        }


        // if(msgArr.length > 0) return msgArr;

        let child = null;
        for (let i = 0; i < elem.childNodes.length; i++) {
            child = elem.childNodes[i];
            if (nodeName != child.nodeName)
                continue;
            msgArr.push(child);
        }

        return msgArr;
    }
    //
    getJsonMessages = (elem: any, nodeName: any): Array<any> => {


        let msgArr = new Array();
        // if (elem.firstChild && "message" == elem.firstChild.nodeName && elem.childNodes.length == 0) {
        //     msgArr.push(elem);
        //     return msgArr;
        // }

        if (elem && "message" == elem.name) {
            msgArr.push(elem);
            return msgArr;
        }


        // if(msgArr.length > 0) return msgArr;

        // let child = null;
        // for (let i = 0; i < elem.childNodes.length; i++) {
        //     child = elem.childNodes[i];
        //     if (nodeName != child.nodeName)
        //         continue;
        //     msgArr.push(child);
        // }

        return msgArr;
    }

    // handlerEnableAckResult = (elem: Element): void => {

    //     elem.childNodes.forEach((item: Element) => {
    //         if (item && item.firstChild && "iq" == item.nodeName) {
    //             if ("enable" == item.firstChild.nodeName && this.NS_SKACK == item.firstChild.namespaceURI) {
    //                 // shikuLog("handlerEnableAckResult  " + Strophe.serialize(elem));
    //                 /*启用成功发送消息回执机制*/
    //                 this.enableAckReceipt = true;
    //                 console.log("启用消息送达机制 成功=====>");

    //             }
    //         }
    //     })
    // }

    handlerEnableAckResult = (elem: Element): boolean => {
        if ("iq" == elem.nodeName && elem.firstChild) {
            if ("enable" == elem.firstChild.nodeName && this.NS_SKACK == elem.firstChild.namespaceURI) {
                // shikuLog("handlerEnableAckResult  " + Strophe.serialize(elem));
                /*启用成功发送消息回执机制*/
                this.enableAckReceipt = true;
                console.log("waitSendReceiptIds启用消息送达机制 成功=====>");

                return true;
            }
        }
        return false;
    }

    checkUnavailable = (elem: Element) => {
        if (elem.nodeName == "presence" && elem.getAttribute("type") == "unavailable" && elem.getAttribute('from') == this.userIdStr) {
            //服务器主动关闭
            let statuslog =
                `服务器断开:
    用户ID:${this.userId}
    连接:${this.userIdStr}
    服务器断开:${elem.outerHTML}
    `;
            if (isOpenLogUpload) {
                imSDK.setLogRepot(ipcRender.getCurrectDeviceSource(), statuslog);
            }
            return true;
        }
        return false;
    }

    //检测是否为下线消息
    checkConflict = (elem: Element): boolean => {

        let type = elem.getAttribute('type');
        let condition = elem.getAttribute('condition');
        if (!type || !condition)
            return false;
        if ("remote-stream-error" == condition && "terminate" == type) {
            let statuslog =
                `checkConflict 检测是否为下线消息:
        用户ID:${this.userId}
        连接:${this.userIdStr}
        条件:${condition} ${type}
        `;
            if (isOpenLogUpload) {
                imSDK.setLogRepot(ipcRender.getCurrectDeviceSource(), statuslog);
            }
            this.handlerLoginConflict && this.handlerLoginConflict();
            return true;
        }
        return false;
    }
    sendEnableAckReceipt = () => {
        /*发送启用批量发送消息回执机制命令*/
        let enable = $iq({
            "from": this.userIdStr,
            "to": this.server,
            "type": 'set',
            "version": '1.0',
        }).c("enable", { xmlns: this.NS_SKACK, resource: systemStore.resource }, "enable");

        this.send(enable.tree());
    }

    send = (elem: any) => {
        if (this.connection && this.isCanUse()) {
            this.connection.send(elem);
            // this.connection.flush();
        } else {
            console.log('当前网络异常,请重新发送')
        }
    }

    sendIQ = (elem: any, succ?: Function, err?: Function, ) => {
        if (this.connection && this.isCanUse()) {
            this.connection.sendIQ(elem, (stanza: any) => {
                succ && succ(stanza);
            }, (stanza: any) => {
                err && err(stanza);
            });
            // this.connection.flush();
        }
    }

    isConnect = () => {
        if (!this.connection)
            return false;
        return this.connection;
    }
    sendPing = () => {
        let messageId = Utils.randomUUID();
        let iq = $iq({
            id: messageId,
            to: this.server,
            type: "get"
        }).c("ping", {
            xmlns: "urn:xmpp:ping"
        });

        this.sendIQ(iq.tree(), (s: any) => {
            this.pingErrorNum = 0;
            // this.startPing();
            // console.log('----发送心跳成功!', new Date())
        }, (e: any) => {
            this.pingErrorNum++;
            if (this.pingErrorNum > 5) {
                this.pingTimer && clearTimeout(this.pingTimer);
                this.connection.disconnect("offline");

                this.connection.reset();
                this.connected = false;
                this.connect();
            } else {
                // this.startPing();
            }
        });
        // this.send && this.send(iq.tree());
    }

    disconnect = (e: any = null) => {
        if (!this.connection) {
            return;
        }
        console.log('----主动断开连接')
        // this.connection.flush();
        this.enableAckReceipt = false;
        this.connection.reset();
        this.connected = false;
        if (this.selfExit) {
            this.connection.disconnect("offline");
            this.waitSendReceiptIds = [];
            this.connection = null as any;
        }
        // this.selfExit = false;
        // this.connection.disconnect("offline");
        // console.log('时间差---断开')
        // this.setConnectionStatus && this.setConnectionStatus(XmppConnectStatus.OVER_CONNECT);
        deviceManager.clearMutiDevice();
        systemStore.changeXmppStatus(-1);
        ipcRender.notifyTask && clearInterval(ipcRender.notifyTask);

        // 断开连接 取消心跳
        this.pingTimer && clearTimeout(this.pingTimer);
        clearInterval(this.lookTime);
        this.lookTime = null as any;
        this.pingTimer = null as any;

        clearInterval(this.sendReceiptTask);
        this.sendReceiptTask = null as any;

        // console.log('logout dicconnect');
        // this.connection && this.connection.disconnect("离线");
        // (this.connection as any) = null;

    }

    getCurrentSeconds = () => {
        return Math.round(new Date().getTime());
    }


    /*是否为群组 Jid*/
    isGroup = (userId: string): boolean => {
        let reg = /^[0-9]*$/;
        if (!reg.test(userId))
            return true;
        else
            return false;
    }
    //创建房间
    creatRoom = () => {

    }

    /*加入群组*/
    joinGroupChat = (jid: string, userId: string, seconds?: number) => {
        this._XEP_0045_037(jid, userId, seconds);
    }

    /**
	 * [_XEP_0045_0137 用户请求不发送历史消息]
	 * @param  {[type]} groupId [群组JID]
	 * @param  {[type]} userId [用户userId]
	 * @return {[type]}         [description]
	 */
    _XEP_0045_037 = (groupId: string, userId: string, seconds?: number) => {
        let id = Utils.randomUUID();
        let to = this.getFullGroupJid(groupId) + "/" + userId;

        // if(!seconds){
        //  	let logOutTime=DataUtils.getLogoutTime();
        // 	if(logOutTime>0)
        // 	  seconds=getCurrentSeconds()-DataUtils.getLogoutTime();
        // 	else
        // 	    seconds=0;
        // }

        // shikuLog(to+" to _XEP_0045_037 seconds "+seconds);
        let pres = $pres({
            id: id,
            to: to
        }).c("x", {
            xmlns: "http://jabber.org/protocol/muc"
        }).c("history", { seconds: seconds });
        ///maxstanzas:'100',

        // 发送报文
        this.send(pres.tree());
        //console.log(" 037 "+pres.tree());
    }
    /**
         * 143. Jabber用户新建一个群组并声明对多用户聊天的支持
         *
         * @param groupId
         * @param groupName
         * @param groupDesc
         * @param userId
         * @param cb
         */
    _XEP_0045_143 = (groupId: string, groupName: string, groupDesc: string, userId: string, cb: any) => {
        var id = Utils.randomUUID();
        var to = this.getFullGroupJid(groupId) + "/" + userId;
        var pres = $pres({
            id: id,
            to: to
        }).c("x", {
            xmlns: "http://jabber.org/protocol/muc"
        });
        // 监听回调
		/*var handler = GroupManager.getCon().addHandler(function(stanza) {
			// 回调成功
		}, null, 'presence', null, id, null, null);*/

        // 发送报文
        // this.send(pres.tree());
        this.sendIQ(pres.tree(), (stanza: any) => {
            console.log("_XEP_0045_143 result " + Strophe.serialize(stanza));
        }, (stanza: any) => {
            console.log("_XEP_0045_143 error " + Strophe.serialize(stanza));
        });

        this._XEP_0045_144(groupId, groupName, groupDesc, userId, cb);
    }
	/**
	 * 144. 服务承认群组新建成功
	 *
	 * @param groupId
	 * @param groupName
	 * @param groupDesc
	 * @param userId
	 * @param cb
	 */
    _XEP_0045_144 = (groupId: string, groupName: string, groupDesc: string, userId: string, cb: any) => {
        // 服务承认群组新建成功
        this._XEP_0045_146(groupId, groupName, groupDesc, userId, cb);
    }
	/**
	 * 146. 所有者请求配置表单
	 *
	 * @param groupId
	 * @param groupName
	 * @param groupDesc
	 * @param userId
	 * @param cb
	 */
    _XEP_0045_146 = (groupId: string, groupName: string, groupDesc: string, userId: string, cb: any) => {
        var id = Utils.randomUUID();
        var to = this.getFullGroupJid(groupId) + "/" + userId;
        var iq = $iq({
            id: id,
            to: to,
            type: "get"
        }).c("query", {
            xmlns: "http://jabber.org/protocol/muc#owner"
        });

        this.send(iq.tree());
        this.sendIQ(iq, (stanza: any) => {
            // 147. 服务发送配置表单
            // 148. 服务通知所有者没有配置可用
            this._XEP_0045_149(groupId, groupName, groupDesc, userId, cb);
        }, (stanza: any) => {
            // 请求配置表单失败
            cb(0, "请求配置表单失败");
        });
    }
	/**
	 * 149. 所有者提交配置表单
	 *
	 * @param groupId
	 * @param groupName
	 * @param groupDesc
	 * @param userId
	 * @param cb
	 */
    _XEP_0045_149 = (groupId: string, groupName: string, groupDesc: string, userId: string, cb: any) => {
        var x = $build("x", {
            xmlns: "jabber:x:data",
            type: "submit"
        });
        x.cnode($build("field", {
            "var": "muc#roomconfig_roomname",
            "type": "text-single"
        }).c("value", null, groupName).tree());
        x.up().cnode($build("field", {
            "var": "muc#roomconfig_roomdesc",
            "type": "text-single"
        }).c("value", null, groupDesc).tree());
        x.up().cnode($build("field", {
            "var": "muc#roomconfig_persistentroom",
            "type": "boolean"
        }).c("value", null, "1").tree());
        x.up().cnode($build("field", {
            "var": "muc#roomconfig_publicroom",
            "type": "boolean"
        }).c("value", null, "1").tree());
        x.up().cnode($build("field", {
            "var": "muc#roomconfig_enablelogging",
            "type": "boolean"
        }).c("value", null, "1").tree());

        var id = Utils.randomUUID();
        var to = this.getFullGroupJid(groupId) + "/" + userId;
        var iq = $iq({
            id: id,
            to: to,
            type: 'set'
        }).c("query", {
            xmlns: "http://jabber.org/protocol/muc#owner"
        }).cnode(x.tree());
        this.send(iq.tree());


        this.sendIQ(iq.tree(), (stanza: any) => {
            // 150. 服务通知新群组所有者成功
            // 151. 服务通知所有者请求的配置选项不被接受
            cb(0, "");
        }, (stanza: any) => {
            cb(0, "");
            //cb(1, "提交配置表单失败");
        });
    }

    enableStream = () => {
        /*启用流管理*/

        /*
        启用流管理  XEP-0198
        */
        this.connection['streamManagement'].logging = true;
        var streamId = this.connection['streamId'];
        if (!Utils.isNil(streamId)) {
            this.connection['streamManagement'].enable();
            //this.resumeStream(streamId);
        } else {
            this.connection['streamManagement'].enable();
        }

    }

    resumeStream = (streamId: string) => {
        /*0198 恢复流*/

        if (!Utils.isNil(streamId)) {
            this.connection['streamManagement'].resumeStream(streamId);
        }

    }

    enabledStream = (streamId: string) => {
        /*启用成功流*/
        console.log('启用成功流')
        this.connection['streamId'] = streamId;
        jsCookie.set(this.userId + '_streamId', streamId);
        this.connection['streamManagement'].requestResponseInterval = 1;
    }



    selfSend = (stanza: any, callback: any) => {
        // todo 解决 Failed to execute 'send' on 'XMLHttpRequest': The object's state must be OPENED.问题
        try {
            var xhr = this.newXHR();
            var data = Strophe.serialize(stanza);
            console.log("selfSend  " + data);
            xhr.responseCall = callback;
            xhr && xhr.send(data);
            if (xmppSDK.connection) {
                xmppSDK.connection.xmlOutput(stanza);
                xmppSDK.connection.rawOutput(stanza);
            }
        } catch (e) {
            console.log('selfSend 出错了', e)
        }
    }

    newXHR = () => {
        var xhr: any = null;
        if (XMLHttpRequest) {
            xhr = new XMLHttpRequest();
            if (xhr.overrideMimeType) {
                xhr.overrideMimeType("text/xml; charset=utf-8");
            }
        } else if (ActiveXObject) {
            xhr = new ActiveXObject("Microsoft.XMLHTTP");
        }
        //xhr.responseType = "document";
        // use Function.bind() to prepend ourselves as an argument
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 && xhr.status == 200) {
                //    console.log("onreadystatechange  responseText "+xhr.responseText);
                var node = null;
                if (xhr.responseXML && xhr.responseXML.documentElement) {
                    node = xhr.responseXML.documentElement;
                } else if (xhr.responseText) {
                    node = new DOMParser().parseFromString(xhr.responseText, 'application/xml').documentElement;
                }
                if (xhr.responseCall) {
                    xhr.responseCall(node);
                }
            } else {
                //console.log("onreadystatechange  statusText "+xhr.statusText);
            }
        };
        xhr.ontimeout = function (e: any) {
            console.log("ontimeout   " + e);
        };
        xhr.onerror = function (e: any) {
            console.log("onerror   " + e);
        };
        if (xmppSDK.connection) {
            var contentType = xmppSDK.connection['options'].contentType || "text/xml; charset=utf-8";
            //myConnection.options.sync ? false : true
            xhr.open("POST", xmppSDK.connection['service'], true);
            if (typeof xhr.setRequestHeader !== 'undefined') {
                // IE9 doesn't have setRequestHeader
                xhr.setRequestHeader("Content-Type", contentType);

            }
            //xhr.withCredentials = true;
            if (xmppSDK.connection && xmppSDK.connection['options'].withCredentials) {
                xhr.withCredentials = true;
            }
        } else {
            xhr.open("POST", '');
        }

        xhr.getResponse = function () {
            var node = null;
            if (xhr.responseXML && xhr.responseXML.documentElement) {
                node = xhr.responseXML.documentElement;
                if (node.tagName && node.tagName === "parsererror") {

                    console.log("responseText: " + xhr.responseText);
                    console.log("responseXML: " +
                        Strophe.serialize(xhr.responseXML));
                    throw "parsererror";
                }
            } else if (xhr.responseText) {
                // In React Native, we may get responseText but no responseXML.  We can try to parse it manually.

                node = new DOMParser().parseFromString(xhr.responseText, 'application/xml').documentElement;
                if (!node) {
                    throw new Error('Parsing produced null node');
                } else if (node.querySelector('parsererror')) {
                    // node ? console.log("invalid response received: " + node['querySelector']('parsererror').textContent) : console.log('cuowu');
                    console.log("responseText: " + xhr.responseText);
                    throw "badformat";
                }
            }
            return node;
        };
        return xhr;
    }

    ///第二通道连接
    getTryConnentInvelalTwo = (): number => {
        return this.trycontentTwoNum * 5000;
    }
    ///第二通道连接 重连
    tryConnectTwo = () => {
        if (this.trycontentTwoNum < 9) {
            this.trycontentTwoNum += 1;
            this.lookTwoTime && clearTimeout(this.lookTwoTime);
            this.lookTwoTime = setTimeout(() => {
                if (systemStore.access_token != "" && !this.eventSource && !this.isConnectTwo) {
                    this.onConnectTow();
                }
            }, this.getTryConnentInvelalTwo())
            console.warn(this.getTryConnentInvelalTwo(), '第二通道重连的时间间隔——————————》次数：', this.trycontentTwoNum)
        }
    }
    //第二通道连接

    onConnectTow =async  () => {
        if (systemStore.access_token != '' && !this.eventSource && isOpenTwoContent) {
            this.eventSource = new EventSource(`${SystemStore.apiUrl}:8095/messages/feed?device=web&token=${systemStore.access_token}`); //  /springSSE/connect

            this.eventSource.onmessage = function (event: any) {

                console.log('接收到第二通道的信息--------------------》》》》', event, event.data)
                if (event.data == 'ok') {
                    this.isConnectTwo = true;
                    this.trycontentTwoNum = 0;
                    this.lookTwoTime && clearTimeout(this.lookTwoTime);
                    return
                }
                try {
                    // let xml=   Utils.createXml(event.data)
                    xmppSDK.onJsonMessage(JSON.parse(event.data));
                } catch (e) {

                    console.error('出错了吗', e, JSON.parse(event.data))
                }

            };

            this.eventSource.onerror = function (event: any) {

                try {
                    if (this.eventSource) {
                        this.eventSource.close();
                        this.isConnectTwo = false;
                        console.error('第二消息通道出现问题111已关闭' + "有token吗", typeof (systemStore.access_token))
                    } else {
                        this.tryConnectTwo();
                    }

                } catch{
                    if (this.eventSource) {
                        this.eventSource.close();
                        this.isConnectTwo = false;
                        console.log('第二消息通道出现问题失败')
                    }
                }
            };

            let data =await systemStore.getData();
            data&&data.map((item:any)=>{
                console.log('第二通道拉取的数据', JSON.parse(item))
                xmppSDK.onJsonMessage(JSON.parse(item));
            })
            // xmppSDK.onJsonMessage(JSON.parse(event.data));

        }
    }

}

const xmppSDK = new XmppSDK();

export default xmppSDK;


export const ChatType = {
    UNKNOW: 0,
    /**
     * 单聊
     */
    CHAT: "chat",
    /**
     * 群聊
     */
    GROUPCHAT: "groupchat",
    /**
     * 广播
     */
    ALL: 3,

    /*授权*/
    AUTH: 5,

    /**
     *心跳消息
     */
    PING: "ping",
    /**
     * 返回结果
     */
    RESULT: "result",
    /**
     * 消息回执
     */
    RECEIPT: 11,
}
