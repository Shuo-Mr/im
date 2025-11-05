import xmppSDK from './XmppSDK';
import groupManager from './GroupManager';
import conversationManager from './ConversationManager';
import imsdk from './IMSDK';
import systemStore, { SystemStore } from '../store/SystemStore';
import { getServerTime } from './app.server';

import friendStore from '../store/FriendStore';
import groupStore from '../store/GroupStore';

import { GroupItem, GroupMemberList, GroupMemRole } from '../interface/IGroup';
import { MessageItem, MessageStatus, MessageStatusType } from '../interface/IChat';
import md5 from 'md5';
import Utils from '../utils/utils';
import { MessageType, ChatType, MesaageTips } from './Const';

import CryptoJS from 'crypto-js';

import chatStore from '../store/ChatStore';
import { initDB, updateGroupMemberNickname, updateReadStatus, insertMessage, find, delMessageBy } from '../dbtemp/HandleDB';
import ipcRender from '../ipcRender';
import { requestStore, RequestItem } from '../store/RequestStore';
import loginStore, { UserSetting } from '../store/LoginStore';

import antdMessage from 'antd/es/message'
import { toJS } from 'mobx'
import deviceManager from './DeviceManager';
import _ from 'underscore';
import uuid from 'uuid';
import { mesDataCache } from '../dbCache/dbCacheData';
import { isOpenDB, isOpenLogUpload, isOpenTwoContent, isOpenRead } from '../config/SystemConfig';



const iv = Utils.getStrFromBytes();

export class WebIM {

    // private ivKey:Array<number>=[1,2,3,4,5,6,7,8];
    /*消息ID 前缀 */

    userId: string = '';

    token: string = '';

    url: string;
    resource: string = 'web' + (Date.parse(new Date().toString()) / 1000 % 100000);
    password: string;
    pingTime: number;
    nickname: string;
    server: string;

    /*用户 jid 10004541/web */
    userIdStr: string;

    /*单聊标识*/
    CHAT: string = "chat";
    /*群聊标识*/
    GROUPCHAT: string = "groupchat";

    /*服务器连接地址 ws://localhost:5260 */
    serverUrl: string = '';

    /*消息超时 时间 默认 15 秒*/
    sendTimeOut: number = 15;
    /*等待消息回执的 消息Id 数组*/
    waitReceiptMessageIds: any = {};

    encrypt: boolean = false;
    isReadDel: boolean = false;

    /*时间差*/
    timeDelay: number = 0;

    /**设备登录冲突 */
    loginConflict: boolean = false;

    //处理消息重复问题 消息id 去重
    messageIdMap: Map<string, true> = new Map();
    constructor() {
        window.onbeforeunload = this.beforeUnlandWeb;
    }

    isReload: boolean = false;
    beforeUnlandWeb = (event: Event) => {

        if (!this.isReload) {
            if (this.userId && systemStore.access_token != '') {
                ipcRender.setLogoutTime(this.getServerTime());
                ipcRender.setItem({ type: "chats", userId: this.userId, value: chatStore.chats.slice() });
            }
        }
    }

    beforeUnland = async (event: any): Promise<any> => {
        // console.log('我要退出了～～～～～', this.getServerTime());
        if (this.userId && systemStore.access_token != '') {
            await this.save();

        }
        ipcRender.beforeUnland();
    }

    msgSendStatus = 'msg_send_status';
    groupsMembers = 'groups_mems_map';

    /**
     * 最近获取消息时间
     */
    lastReceiveMes = 'last_receive_mems_time'

    save = async (loginout?: boolean): Promise<any> => {
        ipcRender.setLogoutTime(this.getServerTime());

        systemStore.lastReceiveMsgTime = 0;

        // 保存消息 发送状态
        const _messageData = chatStore.messageStatus.toJS();
        // console.log('_messageData消息状态保存',Array.from(_messageData));
        ipcRender.setItem({ type: this.msgSendStatus, userId: this.userId, value: Array.from(_messageData) });
        // console.log(_messageData, 'set----保存消息读取状态');
        // 保存消息未读状态
        await ipcRender.setItem({ type: "msg_status", userId: this.userId, value: chatStore.tranUnreadMsgs() });
        //  console.log(JSON.stringify(chatStore.unReadMsgs), '-----保存消息状态');

        // 保存 群成员数据
        //todo 此处需要做处理 直接Array.from 不正确 此处去要优化一下
        await ipcRender.setItem({ type: this.groupsMembers, userId: this.userId, value: toJS(groupStore.groupMemberList) });
        // console.log(toJS(groupStore.groupMemberList), '-----保存 群成员数据');


        await ipcRender.setItem({ type: "chats", userId: this.userId, value: chatStore.chats.slice() });

        /**
         * 保存最近接收消息的时间
         */
        // console.log('11111111保存消息',systemStore.getLastRecMesTime())
        await ipcRender.setItem({ type: this.lastReceiveMes, userId: this.userId, value: systemStore.getLastRecMesTime() });

        // console.log(chatStore.chats.slice(), '-----保存 数据');
        loginout && chatStore.reset();
    }


    setUserIdAndToken = async (_userId: string, _token: string) => {
        this.userId = _userId;
        this.token = _token;
        // 初始化数据库
        return isOpenDB && await initDB(this.userId);
    }





    initWebIM = (_url: string, _userId: string, _resource: string, _password: string, _pingTime: number, _nickname: string, _server: string, _salt: string) => {
        this.url = _url;
        this.resource = _resource;
        this.password = _password;
        this.pingTime = _pingTime;
        this.nickname = _nickname;
        this.server = _server;
        xmppSDK.initApi(_url, _userId, _resource, this.password, _pingTime, _server, _salt);
        // console.log('xmpp连接配置',_url, _userId, _resource, this.password, _pingTime, _server);
        this.userIdStr = xmppSDK.userIdStr;
    }

    /*设备登录冲突
        0:异地登录，被迫下线
        1:你已离线
        2:
    */
    handlerLoginConflict = async (_type: number = 0) => {
        antdMessage.warn(_type == 0 ? '异地登录被迫下线' : "你已离线", 2);

        let statuslog =
            `冲突日志：
    时间:${new Date()}
    用户ID:${this.userId}
    连接:${this.userIdStr}
    条件:${_type}
    `;
        if (isOpenLogUpload) {
            imsdk.setLogRepot(ipcRender.getCurrectDeviceSource(), statuslog);
        }
        systemStore.access_token = '';
        await this.save();
        systemStore.setLoginConflict();
        xmppSDK.selfExit = true;
        xmppSDK.disconnect();
        // TODO 登录冲突处理
    }

    /** 处理消息回执 */
    handlerMsgReceipt = (messageId: string) => {
        // console.log('处理消息回执', messageId);

        // conversationManager.processReceived(messageId);
        delete this.waitReceiptMessageIds[messageId];
        chatStore.setMessageSendOk(messageId);

    }

    loginIM = async (): Promise<any> => {
        //添加IM登录成功的回调
        if (!xmppSDK.logincallBack) {
            xmppSDK.logincallBack = this.logincallBack;
            xmppSDK.setConnectionStatus = systemStore.setConnectionStatus;
        }
        return await xmppSDK.loginIM();
    }

    getObjGroupMemberToMap = (objStr: Object) => {
        let reMap = new Map();
        if (objStr) {
            for (let gid in objStr) {
                if (objStr[gid]) {
                    let grMem = new Map();
                    for (let memId in objStr[gid]) {
                        objStr[memId] && grMem.set(memId, objStr[memId])
                    }
                    reMap.set(gid, grMem);
                }
            }
        }
        return reMap
    }
    clearDataMesTimer: NodeJS.Timeout;
    clearDataChatsTimer: NodeJS.Timeout;
    initData = async () => {
        try {

            xmppSDK.handlerMsgReceipt = this.handlerMsgReceipt;
            xmppSDK.messageReceiver = this.handlerMessage;
            xmppSDK.handlerLoginConflict = this.handlerLoginConflict;
            // xmppSDK.reConnectFun =  this.reConnectFun;



            // ----------------初始化storge---------------------------
            ipcRender.initStorage(this.userId);

            //加载好友、群组
            await Promise.all([this.loadFriendList(0), this.loadGroupList()])
            // console.log(res, '加载好友、群组')
            // TODO 获取最近聊天信息

            // -------------------------获取服务器时间，计算出与本地的时间差
            getServerTime();
            let ret = await imsdk.getCurrentTime(this._setTimeDelay);
            // console.log('获取时间了吗', ret, Math.abs(new Date().getTime() - ret.data), new Date().getTime())
            if (ret.resultCode == 1) {
                let _diff = Math.abs(new Date().getTime() - ret.data);
                if (_diff > (1 * 60 * 1000)) {
                    // message.warn('请调整本机时间')
                    return false
                }
            } else {
                // message.warn('获取服务器时间失败')
                return false;
            }



            //还原消息发送状态
            const msgSendStatus = ipcRender.getItem({ type: this.msgSendStatus, userId: this.userId })

            if (msgSendStatus) {
                const msgSend = JSON.parse(msgSendStatus);
                const mesSendData = new Map(msgSend) as MessageStatus;
                // console.log('消息读取状态---read', msgSend);
                chatStore.setMesRead(mesSendData);
            }
            // 还原群成员数据
            const groupMemData = ipcRender.getItem({ type: this.groupsMembers, userId: this.userId })
            if (groupMemData) {
                const groupsMem = JSON.parse(groupMemData);
                let targetGroupMemData = this.getObjGroupMemberToMap(groupsMem) as GroupMemberList;
                groupStore.setGroupsMember(targetGroupMemData);
            }

            //还原消息的未读状态

            let msgStatus = ipcRender.getItem({ type: "msg_status", userId: this.userId });
            if (msgStatus) {
                const mst = JSON.parse(msgStatus);

                chatStore.setUnRendMsgStatus(mst);
            }

            /**
             * 获取本地最近接收消息时间
             */
            let lastReceiveMesTime = await ipcRender.getItem({ type: this.lastReceiveMes, userId: this.userId });
            if (lastReceiveMesTime) {
                // console.log('11111111获取最近消息时间1',lastReceiveMesTime,Number(lastReceiveMesTime));
                systemStore.changeLastRecMesTime(Number(lastReceiveMesTime), true);
            }
            this.loadNewFriends();
            loginStore.onLoadingExplain = '加载最近消息列表...'

            // ---------------------获取上次退出的聊天列表----------------
            let chats = ipcRender.getItem({ type: "chats", userId: this.userId });


            if (chats) {
                let chatList = JSON.parse(chats);
                //多端删除好友或退群过滤
                chatList = chatList.filter((item: any) => {
                    if (Utils.isGroup(item.id)) {
                        let groupchatitem = groupStore.getGroupByJid(item.id)
                        if (groupchatitem) {
                            return true;
                        } else return false

                    } else {
                        let chatitem = friendStore.getFriendById(item.id)
                        if (chatitem) {
                            return true
                        } else return false
                    }
                })
                chatList && chatList.length != 0 && chatStore.setChats(chatList);
            }
            // -------------------------请求最新一条的消息
            const lastMsgsRet = await imsdk.getLastChatList(0, 200, 0);



            //todo 获取数据库数据
            if (lastMsgsRet.resultCode == 1 && lastMsgsRet.data && Array.isArray(lastMsgsRet.data)) {
                // const msgs =
                // await insertMessages(lastMsgsRet.data);
                const targetList = lastMsgsRet.data.map((msg: any) => {
                    if (msg.isEncrypt) {
                        msg.content = this.decryptMessage(msg);
                    }
                    return msg
                });
                console.log('获取最新消息列表', targetList);
                if (Array.isArray(targetList) && targetList.length > 0) {
                    chatStore.editNewChatsList(targetList);
                } else {
                    // 即使没有新消息，也要同步置顶状态（确保移动端更新置顶后能正确同步）
                    await chatStore.syncPinStatus();
                }
            } else {
                console.error('请求最近消息错误！！！！');
                // 请求失败时也要同步置顶状态
                await chatStore.syncPinStatus();
            }

            loginStore.onLoadingExplain = '加载数据库消息...';

            try {
                if (isOpenDB) {
                    let msgs = chatStore.chats.map((item: any) => {
                        let isGroup = false;
                        if (Utils.isGroup(item.id)) {
                            isGroup = true;
                        }
                        return find({ fromUserId: item.id, _sortField: 'timeSend', _currentPage: 0, _pageNum: 1000, _desc: -1, isGroup, myUserId: this.userId });
                    });

                    let dbs = await Promise.all(msgs)

                    chatStore.chats.forEach((item, index) => {
                        mesDataCache.setMeslistByChatId(item.id + '', dbs[index]);
                    })
                }

            } catch (e) {
                console.log('初始化数据库失败');

            }

            this.clearDataMesTimer = mesDataCache.startDataTest();
            mesDataCache.setUserId(systemStore.userId)

        } catch (e) {
            console.log('初始化数据失败，客官～～～～～', e);
        }
        return true;

    }
    loadFriendList = async (pageIndex: number) => {
        loginStore.onLoadingExplain = '加载好友信息...'
        // ----------------获取所有好友----------------------------
        await friendStore.setFriendList(this.userId, pageIndex);
    }
    loadGroupList = async () => {
        //------------------------获取或有的群组-----------------------

        loginStore.onLoadingExplain = '加载群组信息...'
        let groupRet = await groupManager.joinMyRoom(0);
        // const results = await Promise.all(groupRet);
        // console.log('获取或有的群组', results)
        if (groupRet.resultCode == 1) {
            let groups = (groupRet.data || []).map((item: any) => { return GroupItem.getGroupItem(item); });
            groupStore.setGroupList(groups);

            //获取群的信息

            // const groupInfos = groups.map(async (item: any, index: number) => {
            //     return await imsdk.getRoomWithMember(item.id);
            // })

            // const results = await Promise.all(groupInfos);

            // groups.map((item: any, index: number) => {
            //     if (results[index] && (results[index] as any).resultCode == 1 && (results[index] as any).data) {
            //         let _data = (results[index] as any).data as any;
            //         item.membersInfo = _data.members;
            //     } else {
            //         console.log('获取群成员错误！！！！！！');
            //     }
            // })
            // console.log('获取到的群成员信息', groups)
            // console.log(results,'-----------------results----------------');


        } else {
            // console.log('allFriendRet---', groupRet);
        }

    }

    loadNewFriends = async () => {
        loginStore.onLoadingExplain = '加载好友申请信息...';
        // ------------------------请求好友申请列表---------------------
        let requsts = await imsdk.getNeWFriendListWeb(this.userId);
        if (requsts) {
            if (requsts.resultCode == 1) {

                requestStore.setRequestList(requsts.data.pageData.map((item: any) => {
                    if (item.toUserId && +item.toUserId < 1000100) {
                        return null;
                    }
                    if (item.content != '') {
                        item.content = this.decryptMessage(item)
                    }
                    return RequestItem.getItem(item)
                }));
            } else {
                console.log('请求数据有～～～～～～问题');
            }
        } else {
            console.log('请求新好友列表失败！');

        }
    }

    // 登录回调 获取数据
    logincallBack = async (timeCurrent: number): Promise<any> => {

        try {

            //加入房间
            groupStore.groupList.map(async (item: any, index: number) => {
                let timer = setTimeout(() => {
                    clearTimeout(timer);
                    // console.log('加入群组～～～～',timeCurrent);
                    xmppSDK.joinGroupChat(item.jid, this.userId, Math.ceil(timeCurrent));

                    // console.log('进入群组聊天-->', item.jid, item.name, '------', index);
                }, index * 10);
            })

            deviceManager.init(this.userId);


        } catch (e) {
            console.log('初始化数据失败，========================～～～～～', e);
        }
    }
    timeOutGetHistoryServer = (pageIndex: number, startTime: number, endTime: number, isGroup: boolean, fromId: string, pageSize?: number) => {
        return Promise.race([this.getHistoryMsg(pageIndex, startTime, endTime, isGroup, fromId, pageSize), new Promise(function (resolve, reject) {
            setTimeout(() => {
                resolve();
            }, 10 * 1000);
        })
        ])
    }
    // //重新连接
    /** 打开当前聊天获取历史消息 */
    getHistoryMsg = async (pageIndex: number, startTime: number, endTime: number, isGroup: boolean, fromId: string, pageSize?: number) => {
        return new Promise(async (r) => {
            let historyRet = await imsdk.getHistory(pageIndex, Math.floor(startTime), Math.floor(endTime), isGroup, fromId, pageSize);
            if (historyRet.resultCode == 1) {
                r(historyRet.data ? historyRet.data : []);
            }
        })
    }

    /** 检查 插入 */
    checkAndInset = (id: string, msg: MessageItem, _msgMap: Map<string, MessageItem[]>) => {
        if (_msgMap.has(id)) {
            let msgs = _msgMap.get(id);
            msgs && msgs.push(msg);
            return
        } else {
            _msgMap.set(id, [msg]);
        }
    }

    _setTimeDelay = (_diff: number) => {
        this.timeDelay = this.getMilliSeconds() - _diff;
    }


    /*构建一条消息*/
    createMessage = (type: number, content: string, toUserId?: string, toUserName?: string): MessageItem => {

        // let timeSend = this.getServerTime();
        let timeSend = getServerTime().server / 1000;
        let messageId = Utils.randomUUID();
        let msg: any = {
            messageId: messageId,
            fromUserId: this.userId + "",
            fromUserName: this.nickname,
            content: content,
            timeSend: timeSend,
            type: type
        };
        // console.log('添加对方为好友', msg, msg.fromUserId, msg.fromUserName)
        // if (true == this.encrypt)
        // if (true == Boolean(loginStore.userSetting.isEncrypt))
        //     msg.isEncrypt = 1;
        if (4 > type && 6 != type && true == this.isReadDel)
            msg.isReadDel = this.isReadDel;

        if (toUserId)
            msg.toUserId = toUserId + "";
        else
            msg.toUserId = chatStore.currentChatData.id;
        // console.log('修改了消息id',msg)
        if (toUserName)
            msg.toUserName = toUserName;
        else {
            msg.toUserName = chatStore.currentChatData.name;
        }

        msg.to = msg.toUserId;
        msg.chatType = (Utils.isGroup(msg.to) ? "groupchat" : "chat");
        // console.log('添加对方为好友', msg, msg.fromUserId, msg.fromUserName)
        return msg;
    }


    /*收到服务端的聊天消息*/
    handlerMessage = async (message: any) => {
        console.log("收到 新消息 " + JSON.stringify(message));

        // systemStore.lastReceiveMsgTime = this.getServerTime();
        // console.log('最后接受时间--->', new Date(systemStore.lastReceiveMsgTime * 1000));
        // ipcRender.setLogoutTime(systemStore.lastReceiveMsgTime);
        //记录消息是否是丢失
        // ipcRender.logMessage(message);
        this.handlerMessageByType(message);
    }


    /*根据消息类型处理逻辑*/
    handlerMessageByType = async (message: MessageItem) => {
        if (message.type === MessageType.BLOCKED_IP) {
            systemStore.access_token = '';
            await this.save(); 
            systemStore.setLoginConflict();
            xmppSDK.selfExit = true;
            xmppSDK.disconnect();
            antdMessage.warn('当前设备已禁用', 5);
            return
        }

        if (message.type == MessageType.TYPE_REMOVE) {//同步删除本地消息
            let _message: any = message.content;
            try {
                let _messagebody: any = JSON.parse(_message && _message.body);
                if (_messagebody) {
                    chatStore.delLocalMesByMessageID(_messagebody);
                }
            } catch (e) {
                console.error(_message, '同步删除', e)
            }
            // let _messagebody: any = JSON.parse(_message && _message.body);
            // if (_messagebody) {
            //     chatStore.delLocalMesByMessageID(_messagebody);
            // }
            return;
        }
        if (message.type == 83 && this.userId == Utils.getUserId(message.from) && this.userId == Utils.getUserId(message.to)) {
            return;
        }
        //踢人时判断自己是什么角色，没用应判断发送者角色，但消息对象里没有发送者，这条消息是后台推过来的，目前先注释掉
        // if(message.type == MessageType.DELETE_MEMBER ){
        //    const targetRole =  groupStore.getRoleWithId(message.toUserId || message.roomJid || message.objectId || '');
        //    console.log('获取角色',targetRole);
        //    if(!targetRole ||  targetRole == GroupMemRole.member){
        //     return
        //    }
        // }
        if (parseInt(message.type / 100 + '') == 9 || 401 == message.type || 402 == message.type || message.type == 83) {
            // if(message.type == 83 && this.userId == Utils.getUserId(message.from) && this.userId == Utils.getUserId(message.to) ){
            //     return ;
            // }
            let messageEdit = await this.handlerGroupGontrolMessage(message, true);
            // console.log('获得群控制消息群消息问题1111',messageEdit,this.messageIdMap.has(messageEdit.messageId),Utils.isGroup(messageEdit.toUserId));

            if (messageEdit && messageEdit.messageId && !this.messageIdMap.has(messageEdit.messageId)) {
                //刷新群控消息
                // if (messageEdit.objectId && messageEdit.objectId == chatStore.currentChatData.id) {
                //     chatStore.getUserOrGroupInfo(chatStore.currentChatData);
                //     groupStore.updataSingleGroupList();
                // }
                if (message.contentType == MessageType.NEW_MEMBER) {
                    if (Utils.isGroup(messageEdit.from) || message.roomJid) {
                        message.chatType = ChatType.GROUPCHAT;
                        // if(message.from.indexOf('/Smack')!=-1)
                        // {
                        //     // console.log('获得群控制消息群消息',message)
                        //    return;
                        // }
                        // todo 这里要找到为什么消息类型发生变化 暂且这样负值
                        messageEdit && this.processMsg(messageEdit);
                        this.messageIdMap.set(messageEdit.messageId + '', true);
                    }
                    return;
                }


                else if (message.contentType == 916) {
                    if (systemStore.isJSON(messageEdit.roomJid)) {
                        messageEdit.toUserId = JSON.parse(messageEdit.roomJid).roomJid;
                        // console.log('修改了消息id2',messageEdit)
                        messageEdit.verification = 0;
                    }

                    messageEdit.chatType = ChatType.GROUPCHAT;
                    messageEdit && this.processMsg(messageEdit);
                    this.messageIdMap.set(messageEdit.messageId + '', true);
                    return;
                } else if (message.contentType == 904) {
                    message.chatType = ChatType.GROUPCHAT;
                    //  console.log(message,this.userId,message.toUserId,'进来了吗===============')
                    // if (message.to == message.fromUserId) {
                    //     if (this.userId == message.to) {
                    //         message.roomJid && chatStore.removeLocalGroupAndChat(message.roomJid);
                    //     }
                    // }

                }
                //处理禁言发给个人的BUG
                if (message.contentType == 906 && message.from.indexOf('/Smack') != -1) {
                    return;
                }
                messageEdit && this.processMsg(messageEdit);
                this.messageIdMap.set(messageEdit.messageId + '', true);
                return;
            }
            return;

        } else if (message.type > 99 && message.type < 130) {
            return this.handlerAudioOrVideoMessage(message);
        } else if (parseInt(message.type / 100 + '') == 5) {
            console.log(message);
            return this.handlerNewFriendMessage(message);
            // 修改 好友信息
        } else if (parseInt(message.type / 1000 + '') == 3 && message.type !== MessageType.DOUBLE_WITHDRAW) {
            return this.updateUserInfo(message);
        }

        switch (message.type) {
            case MessageType.READ: {
                console.log("-------------------已读？", message);
                this.handlerReadReceipt(message);
                break;
            }
            case MessageType.INPUT: {
                this.handlerInputingMessage(message)
                break;
            }
            case MessageType.REVOKE:
                //删除本地消息
                chatStore.delLocalMes({ ...message, messageId: message.content });
                mesDataCache.deleteMes(message);
                this.handlerRevokeMessage(message)
                break;

            case MessageType.DEVICEONLINE: //当前用户在其他设备上线
                //用于更新设备状态
                deviceManager.receiveReceived(message);
                break;
            case MessageType.DOUBLE_WITHDRAW://双向撤回消息
                //TODO 清除本地数据
                let roomJid = message.roomJid;
                if (roomJid) {
                    chatStore.cleanChatMess(roomJid, false, true);
                }
                break;
            case MessageType.TYPE_GROUP_MESSAGE_READ://群组已读消息
                isOpenRead && chatStore.changeMesUnReadNum(message);
                break;

            default:
                let resource = Utils.getResource(message.from);
                let fromUserId = this.getUserIdFromJid(message.from);
                console.log('到这里了吗', systemStore.resource, resource, this.userId, fromUserId)
                // 处理当前设备发出的消息
                if (systemStore.resource == resource && this.userId == fromUserId) {
                    return;
                }
                //处理黑名单

                //判断是否 同一id的漫游消息
                // console.log(loginStore.userSetting.multipleDevices,'到这里了吗',fromUserId,resource,fromUserId,message)
                if (loginStore.userSetting.multipleDevices == 1 && fromUserId == this.userId) {
                    if (ChatType.CHAT == message.chatType) {
                        if (fromUserId != this.userId) {
                            deviceManager.receiverMessage(message);
                            this.processRemoteMsg(message)
                        } else {
                            //处理
                            deviceManager.receiverDeviceMessage(message);
                            if (this.messageIdMap.get(message.messageId + '')) {
                                return;
                            } else {

                                this.processRemoteMsg(message)
                            }
                        }

                        this.messageIdMap.set(message.messageId + '', true);
                        return;
                    }

                    chatStore.messageStatus.set(message.messageId, MessageStatusType.sent);
                }

                if (message.messageId) {
                    if (this.messageIdMap.get(message.messageId + '')) {
                        return;
                    } else {
                        this.messageIdMap.set(message.messageId + '', true);
                        this.processMsg(message);

                    }
                }

                //预防map 数据量太大 最大两千条记录
                if (this.messageIdMap.size > 2000) {
                    this.messageIdMap.delete(this.messageIdMap.keys()[0] + "")
                }
                break;
        }
    }
    updateUserInfo = async (message: MessageItem) => {

        if (message.objectId) {
            const friId = message.objectId
            if (friId) {
                const user = await imsdk.getUser(friId + '');
                if (user.resultCode == 1 && user.data) {
                    const friendData = user.data.friends;
                    friendData && friendStore.changeRemark(friId + '', friendData.remarkName || '');
                    if (friId == chatStore.currentChatData.id) {
                        chatStore.changeCurrentMark(friendData.remarkName || '');
                    }
                }
            }
        }
        return
    }
    processRemoteMsg = (message: MessageItem) => {
        // TODO 保存单条消息
        // insertMessages([message]);
        chatStore.createRemoteChatItemsByMsgs([message]);
        //下面的有问题，因为判断chatitem判断不对
        // chatStore.createChatItemsByMsgs([message]);//显示角标createChatItemsByMsgs
    }


    /**处理单条消息 */
    processMsg = (message: MessageItem) => {
        // TODO 保存单条消息

        // console.log('保存单条消息-->', message);
        // TODO p用
        if (message.chatType == ChatType.GROUPCHAT) {
            if (!message.toUserId) {
                message.toUserId = message.from;
                // console.log('修改了消息id3',message)
            }
        }
        if (message.chatType == ChatType.CHAT) {
            //101000  支付公众号
            if ((message.toUserId != systemStore.userId) || (message.toUserId == '10100')) {
                return;
                // console.log('修改了消息id3',message)
            }
        }
        // insertMessages([message]);
        // console.log([message],"[message]==============================")
        // todo 这里不知道为什么这样做 所有 先隐藏
        // if (message.objectId) {
        //     message.toUserId = message.objectId
        // }
        //  console.log(333333333,message);
        // console.log('获得群控制消息发起',message);

        // 消息解密
        message.content = this.decryptMessage(message)
        chatStore.createChatItemsByMsgs([message]);
    }
    /*处理撤回消息*/
    handlerRevokeMessage = (message: MessageItem) => {
        // ConversationManager.handlerRevokeMessage(message);
        // TODO 处理撤回消息
        message.messageId = message.content;
        console.log("撤回消息了吗", message);
        // 判断，如果是群主则往下执行，如果不是则不执行
        let _groupData = localStorage.getItem('_groupList')
        let _groupList = {}
        if (_groupData) _groupList = JSON.parse(_groupData)
        let thisGroupList = _groupList[message.from]
        if (thisGroupList && thisGroupList[this.userId]) {
            let role = thisGroupList[this.userId].role
            console.log('---role', role)
            if (role != 1) return // 如果不是当前群的管理员则看不见撤回消息
        }
        console.log('----群组数据', _groupList)
        console.log('-----userId', this.userId)
        console.log('----this.userIdStr', this.userIdStr)

        if (MessageType.REVOKE == message.type) {
            message.contentType = message.type;

            let name = '你'
            // chatStore.delMes(message, 2);
            if (this.userId != message.fromUserId) {
                name = message.fromUserName
            }
            message.content = `${name}撤回了一条消息` + "  (" + Utils.toDateTimeFormat(Number(message.timeSend), "YYYY-MM-DD HH:mm") + ")";
            // }

            // mesDataCache.deleteMes(message);

            // mesDataCache.deleteMes(message);
            isOpenDB && insertMessage(message);


            chatStore.createChatItemsByMsgs([message]);
        }

    }

    /**获取用户信息 */
    userGet = async () => {
        let user = await imsdk.userGet(this.userId);

        //
        console.log('-------获取用户信息---------', user);
        if (user.resultCode == 1) {
            // Object.assign(systemStore.user,user.data);
            systemStore.user.setItem(user.data);
            console.log('----同步系统设置')
            loginStore.userSetting.setItem(user.data.settings);
        }
    }


    userSettingUpdate = async (setting: UserSetting) => {
        let user = await imsdk.userSettingUpdate(setting);

        if (user.resultCode == 1) {
            antdMessage.success("设置成功");
            systemStore.user.setItem(user.data);
            loginStore.userSetting.setItem(user.data.settings);
        }
        else {
            antdMessage.success("设置失败");
        }
    }
    /*处理正在输入消息*/
    handlerInputingMessage = (message: MessageItem) => {
        // TODO 处理正在输入消息

        console.log('处理正在输入消息---->');
    }

    /*收到消息已读回执*/
    handlerReadReceipt = (message: MessageItem) => {
        // ConversationManager.handlerReadReceipt(message);
        // TODO 收到消息已读回执
        chatStore.setMessageReaded(message);
        console.log('收到消息已读回执---->', message.content, message);
    }

    // todo wangwei 修改此判断是否是群
    //发送消息回执 判断 消息 是否是同一id 发送的
    sendMessageRead = async (fromId: string, to: string, messageId: string) => {

        return new Promise((r, j) => {
            let sendTime = setTimeout(() => {
                if (fromId != systemStore.userId) {
                    this.sendMessageReadReceipt(to, messageId);

                }
                clearTimeout(sendTime);
            }, 60);
        })
    }
    /*发送消息已读回执*/
    private sendMessageReadReceipt = (to: string, messageId: string) => {
        return new Promise((r, j) => {
            let sendTime = setTimeout(() => {
                let msg: MessageItem = this.createMessage(26, messageId);
                msg.to = to;
                if (Utils.isGroup(to)) {
                    msg.chatType = ChatType.GROUPCHAT;
                } else {
                    msg.chatType = ChatType.CHAT;
                }
                console.log('发送消息已读回执', msg, to, updateReadStatus);

                this.sendMessage(msg, to);
                isOpenDB && updateReadStatus(messageId);
                clearTimeout(sendTime);
            }, 10);
        })
    }

    /*处理新的朋友消息*/
    handlerNewFriendMessage = (msg: MessageItem) => {
        //多端同步的消息处理,把同端消息转化
        console.log('----1', this.getUserIdFromJid(msg.from), this.getUserIdFromJid(msg.to))
        if (this.getUserIdFromJid(msg.from) == this.getUserIdFromJid(msg.to)) {
            let touserId = msg.fromUserId;
            let touserName = msg.fromUserName;
            msg.fromUserId = msg.toUserId;
            msg.fromUserName = msg.toUserName;
            msg.toUserId = touserId;
            msg.toUserName = touserName;
            msg.direction = true;
        }

        if (msg.type == 503) msg.type = 500 // 按照下边逻辑500才是有好友申请，但是后台返回的是503
        if (msg.toUserId == systemStore.userId) {
            if (msg.type == MessageType.FRIEND || msg.type == MessageType.PASS) {
                friendStore.addFriend(msg.fromUserId);
            }
            else if (msg.type == 502) {

                requestStore.refeshContent(msg.fromUserId, msg.content);
            }
            else if (msg.type == 500) {
                const selectIndex = requestStore.requestList.findIndex(item => item.toUserId == msg.fromUserId);
                requestStore.addReadRequest();
                if (selectIndex > -1) {
                    requestStore.requestList[selectIndex].direction = msg.direction ? 0 : 1;
                    requestStore.updateToRemote(toJS(msg));
                    return;
                }
                requestStore.addRequestList(toJS(msg));



            } else if (504 == msg.type || 505 == msg.type) {
                const targetFri = friendStore.friendList.find(item => item.toUserId == Number(msg.fromUserId));

                if (targetFri) {

                    friendStore.removeFriend(targetFri.toUserId);

                }

                chatStore.delChart({ id: msg.fromUserId } as any);

                requestStore.delFriendRequest(msg.fromUserId)
            }
            requestStore.updateToRemote(toJS(msg));


        }





    }

    /*收到音视频通话消息*/
    handlerAudioOrVideoMessage = (message: MessageItem) => {
        // conversationManager.handlerAudioOrVideoMessage(message);
        // TODO 收到音视频通话消息
        console.log('收到音视频通话消息-->');

    }



    /*收到 群控制消息 */
    handlerGroupGontrolMessage = async (message: any, isSend: boolean = false) => {
        if (MessageType.CHANGE_NICK_NAME == message.type) { // 修改昵称901
            //修改昵称 群
            if (message.objectId && message.content && message.roomJid) {
                if (message.objectId == chatStore.currentChat.id && isSend) {
                    // 修改我在群里面的昵称
                    if (message.toUserId == systemStore.userId && message.fromUserId != message.toUserId) {
                        chatStore.groupChangeNick(message.content);
                    } else {
                        // 修改群友的消息 有可能是群友设置在群里的昵称
                        groupStore.updateGroupMemNick(message.objectId, message.toUserId, message.content);
                    }
                } else {
                    groupStore.changeRemark(message.objectId, message.content);
                }
            }
            // 更新好友的备注名
            //else  if(message.conten && message.objectId) {
            //     friendStore.changeRemark(message.objectId, message.content);
            // }
            // 1、查询当前id ，更新之前用户发送过的消息的名字统一修改掉 a、本地、b、数据库
            // 要给本地添加一个类型为10 的本地消息
            if (chatStore.messageData[message.from] && chatStore.messageData[message.from].length != 0) {
                let mls: Array<MessageItem> = chatStore.messageData[message.from].slice();
                const res = mls.map((item: MessageItem) => {
                    if (item.fromUserId == message.fromUserId) {
                        item.fromUserName = message.content;
                    }
                    return item;
                });
                (chatStore.messageData[message.from] as any).replace(res);
                // 更新数据库的数据
                isOpenDB && isSend && updateGroupMemberNickname(message.fromUserId, message.from, message.content);
            }
        } else if (MessageType.NEW_MEMBER == message.type) { //增加新成员 907
            //根据群id 查询数据
            //   if(message.msgType==1)return;
            if (isSend && message.toUserId == this.userId) {
                // 查询数据
                let roomRet = await imsdk.getRoomWithMember(message.fileName);
                // let res=await imsdk.getRoomMember(message.fileName)

                // console.log('新增成员消息',message);
                if (roomRet.resultCode == 1) {
                    const groupItem = GroupItem.getGroupItem(roomRet.data);
                    xmppSDK.joinGroupChat(groupItem.jid, this.userId, 0);
                    groupStore.addGroup(groupItem)
                }
            } else {
                // TODO 显示某人加入了群
            }
        } else if (MessageType.DELETE_ROOM == message.type) { //删除群 903
            //1、删除本地聊天信息，聊天列表、对话信息
            //2、清除本地数据信息
            chatStore.removeLocalGroupAndChat(message.objectId);
        } else if (MessageType.CHANGE_ROOM_NAME == message.type) { // 修改房间名902
            //1、修改对话中的名字
            //2、修改数据库中的名字
            console.log('禁修改房间名902--》', message);
            let chatItem = chatStore.chats.find(item => { return item.id == message.roomJid });
            if (chatItem) {
                chatItem.name = message.content;
            }

            let groupItem = groupStore.groupList.find(item => { return item.jid == message.roomJid });
            if (groupItem) {
                groupItem.name = message.content;
            }
        } else if (MessageType.DELETE_MEMBER == message.type) {// 删除成员904
            //
            // console.log('删除成员904--》', message,message.toUserId,message.roomJid);
            // message.chatType=
            if (isSend && (this.userId == message.toUserId)) {
                let groupItem = groupStore.groupList.find(item => { return message.roomJid ? item.jid == message.roomJid : item.jid == message.objectId });
                // console.log('删除成员904--》', groupItem);
                if (groupItem) {
                    groupStore.removeGroupMemeber(groupItem.jid, message.toUserId);

                    // 如果是自己的呢？

                    chatStore.removeLocalGroupAndChat(message.roomJid ? message.roomJid : groupItem.jid);
                }
            }
            // else if(this.userId == ){

            // }

        } else if (MessageType.GAG == message.type) {// 禁言906
            // console.log('禁言906--》', message);
            groupStore.gag(message.objectId, message.toUserId, message.content);
        } else if (MessageType.GROUP_FORBIT == message.type) {// 全体禁言920
            console.log('禁言920--》', message);
            // if (message.roomJid == chatStore.currentChatData.id) {
            if (message.roomJid == chatStore.currentChatData.id) {
                chatStore.changeGroupStatus('msgTalkTime', Number(message.content) >= 0 ? Number(message.content) : undefined);
            }
            groupStore.groupAllStatup(message.roomJid, message.content);
        } else if (MessageType.NEW_NOTICE == message.type) {// 新公告905
            // console.log('新公告905--》', message);
        } else if (MessageType.MANAGE_CHANGE == message.type) {//913 设置/取消管理员
            // console.log('设置/取消管理员913--》', message);
            //此处content 1===》 代笔设置 其他为取消管理员
            if (message.chatType != this.GROUPCHAT) return
            const role = message.content == '1' ? GroupMemRole.manage : GroupMemRole.member
            groupStore.changeMemberRole(message.toUserId, role, message.roomJid);
        } else if (MessageType.TYPE_GROUP_EXPLAIN == message.type) {//群说明934
            // console.log('新群说明934--》', message);
        } else if (MessageType.REVOKE == message.type) {
            //删除本地消息
            mesDataCache.deleteMes({ messageId: message.content } as any);
            isOpenDB && delMessageBy(message.content);
        } else if (MessageType.DOUBLE_WITHDRAW == message.type) {
            //TODO:
            let roomJid = message.roomJid;
            if (roomJid) {
                chatStore.cleanChatMess(roomJid, false, true);
                console.log("双向撤回2")
            }
        }


        // static CHANGE_NICK_NAME:number =  ;// 修改昵称901
        // static CHANGE_ROOM_NAME:number =  ;// 修改房间名902
        // static DELETE_ROOM:number =  903;// 删除房间
        // static DELETE_MEMBER: number = ;// 删除成员904
        // static NEW_NOTICE: number = ;// 新公告905
        // static GAG:number =  ;// 禁言906
        // static NEW_MEMBER: number = 907// 增加新成员

        // if()
        // TODO 播放声音 调整控制信息  401 群文件上传  402 群文件删除
        message = this.converGroupMsg(message, isSend);
        // console.log('获得群控制消息',message);

        if (!message) {
            return;
        }

        message.isGroup = 1;
        message.roomJid = message.objectId;

        if (MessageType.CHANGE_NICK_NAME == message.type) { //修改昵称

            //todo
            // 1、查询当前id ，更新之前用户发送过的消息的名字统一修改掉 a、本地、b、数据库
            // console.log(message, '=============================');



            // }

            // if(!Utils.isNil(DataUtils.getDeleteFirend(msg.roomJid))){
            // 	/*已退出或删除 解散 这个群组*/
            // 	return true;
            // }

            if (916 != message.contentType) {
                // UI.moveFriendToTop(msg,msg.objectId,msg.fromUserName,
                // (ConversationManager.isOpen&&msg.objectId==ConversationManager.fromUserId)?0:1,1);
            } else {
                if (Utils.isNil(message.text)) {
                    //邀请好友
                    // console.log("-----------------------------邀请好友");
                    // let inviteObj = eval("(" + message.objectId + ")");
                    let inviteObj = Utils.jsonWithParse(message.objectId);
                    message.roomJid = inviteObj.roomJid;
                    // UI.moveFriendToTop(msg,msg.roomJid,msg.fromUserName,
                    // (ConversationManager.isOpen&&msg.roomJid==ConversationManager.fromUserId)?0:1,1);
                } else {
                    // UI.moveFriendToTop(msg,msg.objectId,msg.fromUserName,
                    // (ConversationManager.isOpen&&msg.objectId==ConversationManager.fromUserId)?0:1,1);
                }
            }
            // DataUtils.saveMessage(msg);
            // groupManager.processGroupControlMsg(msg);
            // if(ConversationManager.isOpen&&msg.roomJid==ConversationManager.fromUserId){
            // 	UI.showMsg(msg,msg.roomJid,0);
            // }
            // return message
        }
        // console.log('--------------33333333333------------');

        return message;
    }


    /**
	 * 加入群聊
	 * @param  {[type]} groupJid [群组Jid]
	 */
    joinGroupChat = (groupJid: string, userId: string, seconds: number) => {
        // if(!seconds){
        //  	let logOutTime=DataUtils.getLogoutTime();
        // 	if(logOutTime>0)
        // 	  seconds=getCurrentSeconds()-DataUtils.getLogoutTime();
        // 	else
        // 	    seconds=0;
        // }
        // console.log(groupJid + "  joinGroup seconds " + seconds);
        xmppSDK.joinGroupChat(groupJid, userId, seconds);

    }

    //消息解密
    decryptMessage = (msg: any): string => {
        //检查消息是否加密 并解密
		/*if(msg.type==26){
			return cb(msg,o);
		}*/

        if (msg && msg.isEncrypt == true) {
            try {

                // msg.content = msg.content.replace(" ", "");
                const key = this.getMsgKey(msg);
                // console.time('密decryptMessage' + msg.messageId);
                const content = this.decryptDES(msg.content, key);
                // console.timeEnd('密decryptMessage' + msg.messageId);
                // console.log('解密前-->', msg.content, '加密后-->', content);
                if (!content) {
                    //todo 没有解密开的数据
                    ipcRender.setErrorEncrypted(msg);
                    return Utils.htmlRestore(msg.content);
                }
                let tempContent = Utils.htmlRestore(content);


                return tempContent;
            } catch (e) {
                ipcRender.setErrorEncrypted(msg);
                return msg.content;
            }
        } else {
            return Utils.htmlRestore(msg.content);
        }

    }


    encryptDES = (message: string, key: string): string => {

        const keyHex = CryptoJS.enc.Utf8.parse(key);

        message = CryptoJS.enc.Utf8.parse(message);

        const encrypted = CryptoJS.TripleDES.encrypt(
            message,
            keyHex, {
                iv: CryptoJS.enc.Utf8.parse(iv),
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.Pkcs7
            });

        const result = encrypted.toString();

        return result;
    }


    decryptDES = (message: string, key: string) => {

        const keyHex = CryptoJS.enc.Utf8.parse(key);

        const decrypted = CryptoJS.TripleDES.decrypt(message,

            keyHex,

            {

                mode: CryptoJS.mode.CBC,

                padding: CryptoJS.pad.Pkcs7,

                iv: CryptoJS.enc.Utf8.parse(iv)

            });

        return decrypted.toString(CryptoJS.enc.Utf8);
    }

    getMsgKey = (msg: any) => {
        let key = systemStore.apiKey + parseInt(msg.timeSend) + msg.messageId;
        return md5(key);
    }



    /*判断消息是否加密*/
    isEncrypt = (msg: any): boolean => {
        let isEncrypt = 0;  //是否为加密  0:不是  1:是
        if (!msg.content)
            return false;
        if (null != msg.isEncrypt)
            isEncrypt = msg.isEncrypt;
        if (1 == isEncrypt)
            return true;
        else return false;
    }
    //发送需要保存本地的消息
    insertMesTypeArray: number[] = [
        MessageType.TEXT,
        MessageType.IMAGE,
        MessageType.VOICE,
        MessageType.LOCATION,
        MessageType.GIF,
        MessageType.VIDEO,
        MessageType.SIP_AUDIO,
        MessageType.CARD,
        MessageType.FILE,
        MessageType.TEXT_TRANSMIT_MANY
    ]
    sendMessageRetry = (message: MessageItem, toJid: string, isResendMes?: boolean) => {
        const serverTime = this.getServerTime();
        const messageId = message.messageId;
        // console.log('当前消息重发一次0', message.content, message.timeSend)
        if (serverTime - Number(message.timeSend) > 1.5 * 60) {
            this.sendMessageTimeOut(message.messageId);
            // console.log('当前消息重发一次1', message.content, message.timeSend)
        } else {
            // console.log('当前消息重发一次2', message.content, message.timeSend)
            if (chatStore.messageStatus.get(messageId) == MessageStatusType.loading && systemStore.access_token) {
                let timer = setTimeout((message, toJid, isResendMes) => {
                    clearTimeout(timer);
                    // console.log('当前消息重发一次', message.content, message.timeSend)
                    this.sendMessage(message, toJid, isResendMes)
                }, 5 * 1000, message, toJid, isResendMes)
            }

        }
    }
    sendMessage = (message: MessageItem, toJid: string, isResendMes?: boolean) => {
        let timer = setTimeout(() => {
            clearTimeout(timer);
            if (systemStore.xmppStatus != 2 || !xmppSDK.isConnect()) {
                let timerC = setTimeout(() => {
                    clearTimeout(timerC);
                    this.sendMessageRetry(message, toJid, isResendMes)
                }, 15 * 1000)
                return;
            } else {
                //组装xmpp 消息体 继续发送
                // let type=message.type;
                let from = this.userIdStr;
                message.id = message.messageId;
                // toJid指定的消息接受者
                // Temp.toJid 临时的消息接受者
                // ConversationManager.from  聊天框的消息接受者

                /*if(myFn.isNil(toJid))
                    toJid=Temp.toJid;*/
                if (Utils.isNil(toJid))
                    toJid = from;
                if (Utils.isNil(message.toUserId)) {
                    message.toUserId = this.getUserIdFromJid(toJid);
                    // console.log('修改了消息id99',message)
                }
                message.to = message.toUserId;
                message.toJid = message.toUserId;
                // let content=message.content;
                let msgObj = message;
                //存入数据库
                // if (this.insertMesTypeArray.indexOf(Number(message.type)) > -1 && !isResendMes) {
                //     // 解密存入数据库

                //     // console.log('密444 sendMessage', msgObj.content, msgObj.isEncrypt);
                //     // msgObj.content = this.decryptMessage(message);
                //     insertMessage(msgObj);
                // }
                //判断是否需要加密消息内容,哪些消息不加密
                const contentSend = MesaageTips.includes(msgObj.type) ? msgObj.content : this.checkEncrypt(msgObj);

                this.messageIdMap.set(msgObj.messageId + '', true);
                //添加到消息队列
                xmppSDK.addMesToAlignment({ ...msgObj, content: contentSend, isResendMes });
                // console.log ('是否存数据',message.type);
                if (this.insertMesTypeArray.indexOf(Number(message.type)) > -1 && !isResendMes) {

                    isOpenDB && insertMessage(msgObj);
                    // console.log('数据库1',msgObj.content);
                    if (msgObj.chatType != this.GROUPCHAT) {
                        // console.log ('存储消息111',msgObj);
                        mesDataCache.addmes(msgObj);
                    }
                    // mesDataCache.addmes
                }

                if (ChatType.CHAT == msgObj.chatType && this.userId != message.toUserId && 1 == loginStore.userSetting.multipleDevices) {
                    deviceManager.sendMsgToMyDevices(msgObj);
                }

                //这里并不是真的发送出去
                /*调用等待消息回执*/
                // this.waitMessageReceipt(message, toJid, isResendMes);
            }
        }, 0);
    }

    // reSendMessage = (message: MessageItem, toJid: string) => {

    //     return new Promise((r, j) => {
    //         let sendTime = setTimeout(() => {
    //             clearTimeout(sendTime);
    //             if (systemStore.xmppStatus != 2 || !xmppSDK.isConnect()) {
    //                 this.sendMessageTimeOut(message.messageId,message);
    //                 return;
    //             } else {
    //                 xmppSDK.sendMessage(message);
    //                 deviceManager.sendMsgToMyDevices(message);
    //                 /*调用等待消息回执*/
    //                 this.waitMessageReceipt(message.messageId,message);
    //             }
    //         }, 0);
    //     })
    // }
    checkEncrypt = (msg: MessageItem): string => {
        //检测消息加密  如果加密 调用接口加密
        // let content=msg.content;
        //防止消息二次加密
        if (msg.isEncrypt == 1) {
            // console.log('加密的进来了吗',msg)
            return msg.content;
        } else if (!Utils.isNil(msg.content) && loginStore.userSetting.isEncrypt) {
            return this.encryptMessage(msg);
        } else {
            return msg.content;
        }
    }

    //消息加密
    encryptMessage = (msg: MessageItem) => {
        let key = this.getMsgKey(msg);
        let content = this.encryptDES(msg.content, key);
        msg.isEncrypt = 1;
        // console.log('加密数据-->', msg.content, '加密后--->', content);
        return content;
    }


    /*等待服务器消息回执*/
    waitMessageReceipt = (message: MessageItem, toJid: string, isResendMes?: boolean) => {
        // console.log('当前等待超时',message,toJid,isResendMes)
        const messageId = message.messageId;
        this.waitReceiptMessageIds[messageId] = 1;
        let sendTime = setTimeout(() => {
            this.sendMessageRetry(message, toJid, isResendMes);
            clearTimeout(sendTime);

        }, this.sendTimeOut * 1000);
    }

    /*发送消息超时 没有收到消息回执 处理 页面逻辑*/
    sendMessageTimeOut = (messageId: string) => {
        conversationManager.sendTimeout(messageId);
    }



    getUserIdFromJid = (jid: string): string => {
        jid += "";
        return jid ? jid.split("/")[0] : "";
    }

    /*获取服务器的当前时间秒*/
    getServerTime = (): number => {
        const ret = (this.getMilliSeconds() - this.timeDelay) / 1000;

        // console.log('获取服务器的当前时间秒-----', ret);
        return ret;
    }

    getMilliSeconds = () => {
        return Math.round(new Date().getTime());
    }

    randomUUID = () => {
        return uuid().replace(/-/g, '');//this.cont + this.userId + this.getTimeSecond() + Math.round(Math.random() * 1000);
    }


    getTimeSecond = () => {
        return Math.round(new Date().getTime() / 1000);
    }

    /*转换 群控制消息*/
    converGroupMsg = (msg: any, isSend: boolean = false) => {
        msg.text = msg.content;
        let appendTime = true;
        const commonName = "群主或管理员";
        switch (msg.type) {
            case 83:
                msg.content = msg.fromUserName + " 领取了你的红包 ";
                msg.chatType = ChatType.GROUPCHAT;
                break;
            case MessageType.REVOKE:
                // console.log('撤回一条消息', msg)
                // msg.messageId = msg.content;
                // msg.chatType =this.isGroupType(msg.chatType)? ChatType.GROUPCHAT:ChatType.CHAT;
                if (this.userId == msg.fromUserId) {

                    // console.log('--你撤回了一条消息--id------', msg);

                    msg.content = '你撤回了一条消息'
                } else {
                    msg.content = `${msg.fromUserName} 撤回了一条消息`
                }
                // delMessageBy(msg.messageId);
                break
            // case MessageType.SAYHELLO:
            //         msg.content = '你们已经成为好友，开始聊天吧'
            //     break
            case 401:
                let fileName = msg.fileName.substring(msg.fileName.lastIndexOf("/") + 1);
                msg.content = msg.fromUserName + " 上传了群文件 " + fileName;
                break;
            case 402:
                msg.content = msg.fromUserName + " 删除了群文件 ";
                break;
            case MessageType.CHANGE_NICK_NAME:
                msg.content = msg.toUserName + " 群内昵称修改为 " + msg.content;
                break;
            case MessageType.CHANGE_ROOM_NAME:
                msg.content = "群组名称修改为： " + msg.content;
                break;
            case MessageType.DELETE_ROOM:
                appendTime = false;
                msg.content = "群组已被解散";
                break;
            case MessageType.DELETE_MEMBER:
                if (msg.fromUserId == msg.toUserId)
                    msg.content = msg.toUserName + " 已退出群组";
                else
                    msg.content = msg.toUserName + " 已被移出群组";
                break;
            case MessageType.NEW_NOTICE:
                if (msg && msg.text && msg.text.text && msg.text.nickname) {
                    msg.content = msg.text.nickname + " 发布新公告: " + msg.text.text;
                } else {
                    msg.content = "";
                }
                break;
            case MessageType.TYPE_GROUP_EXPLAIN:
                if (msg && msg.text && msg.text.text && msg.text.nickname) {
                    msg.content = msg.text.nickname + " 修改群说明: " + msg.text.text;
                } else {
                    msg.content = "";
                }
                break;
            case MessageType.GAG:
                // if (!this.isGroupType(msg.chatType))
                //     return null;
                msg.talkTime = msg.content;
                if (0 == Number(msg.content) || "0" == msg.content) {
                    msg.content = msg.toUserName + " 已被取消禁言 ";
                } else {
                    msg.content = msg.toUserName + " 已被禁言 ";
                }

                break;
            case MessageType.NEW_MEMBER:
                // console.log('进到这里了吗', msg);
                // if (msg.fromUserId == msg.toUserId) {
                if (msg.toUserId == this.userId) {
                    msg.content = "你加入群组，开始聊天吧";
                } else {
                    // msg.content = msg.fromUserName + " 加入群组";
                    // msg.content = msg.fromUserName + " 邀请 " + msg.toUserName + " 加入群组";
                    msg.content = msg.toUserName + " 加入群组";
                }
                // }
                // else msg.content = msg.fromUserName + " 邀请 " + msg.toUserName + " 加入群组";

                break;
            case MessageType.MANAGE_CHANGE:
                // if (!this.isGroupType(msg.chatType))
                //     return null;
                if (1 == msg.content || "1" == msg.content)
                    msg.content = msg.toUserName + " 被设置管理员 ";
                else
                    msg.content = msg.toUserName + " 被取消管理员 ";
                break;
            case 915:
                //群已读消息开关
                if (1 == msg.content || "1" == msg.content) {
                    msg.content = msg.fromUserName + " 开启了显示消息已读人数";
                } else
                    msg.content = msg.fromUserName + " 关闭了显示消息已读人数";
                break;
            case MessageType.GROUP_INVITE:
                if (Utils.isNil(msg.content)) {
                    //邀请好友
                    if (msg.objectId) {
                        appendTime = false;
                        // let inviteObj = eval("(" + msg.objectId + ")");
                        let inviteObj = Utils.jsonWithParse(msg.objectId);
                        if (msg.fromUserId == systemStore.userId) {
                            msg.content = "群聊邀请已发送给群主，请等待群主验证";
                            break;
                        }
                        if ("0" == inviteObj.isInvite || 0 == inviteObj.isInvite) {
                            let count = inviteObj.userIds.split && inviteObj.userIds.split(",").length;
                            msg.content = msg.fromUserName + " 想邀请 " + count + " 位朋友加入群聊  ";
                        } else {
                            msg.content = msg.fromUserName + " 申请加入群聊 ";
                        }
                    }

                    // TODO 这里需要确认
                    // msg.content += groupManager.createGroupVerifyContent(msg.messageId);
                } else {
                    if (msg.roomJid == chatStore.currentChatData.id) {
                        chatStore.changeGroupStatus('groupInvitNeedTest', msg.content == 1)
                    }
                    if (msg.content == 1) {
                        // msg.content = msg.fromUserName + " 开启了进群验证";
                        msg.content = commonName + " 开启了进群验证";
                    } else
                        // msg.content = msg.fromUserName + " 关闭了进群验证";
                        msg.content = commonName + " 关闭了进群验证";
                }
                break;
            case 917:
                //群公开状态
                if (1 == msg.content || "1" == msg.content) {
                    msg.content = msg.fromUserName + " 修改为隐私群组";
                } else
                    msg.content = msg.fromUserName + " 修改为公开群组";
                break;
            case 918:
                if (1 == msg.content || "1" == msg.content) {
                    msg.content = msg.fromUserName + " 开启了显示群成员列表";
                } else
                    msg.content = msg.fromUserName + " 关闭了显示群成员列表";
                break;
            case MessageType.GROUP_FRIEND:
                if (msg.roomJid == chatStore.currentChatData.id) {
                    chatStore.changeGroupStatus('allowFriends', msg.content == 1)
                }
                if (1 == msg.content) {
                    // msg.content = msg.fromUserName + " 开启了允许普通群成员私聊";
                    msg.content = commonName + " 开启了允许普通群成员私聊";
                } else
                    // msg.content = msg.fromUserName + " 关闭了允许普通群成员私聊";
                    msg.content = commonName + " 关闭了允许普通群成员私聊";
                break;
            case MessageType.GROUP_FORBIT:
                // console.log('开启全体禁言',msg)
                if (0 == msg.content || "0" == msg.content) {
                    // msg.content = msg.fromUserName + "已取消全体禁言";
                    msg.content = commonName + "已取消全体禁言";
                } else {
                    // msg.content = msg.fromUserName + "已开启全体禁言";
                    msg.content = commonName + "已开启全体禁言";
                }
                break;
            case 921:
                if (1 == msg.content || "1" == msg.content) {
                    msg.content = msg.fromUserName + " 开启了允许普通成员邀请好友";
                } else
                    msg.content = msg.fromUserName + " 关闭了允许普通成员邀请好友";
                break;
            case 922:
                if (1 == msg.content || "1" == msg.content) {
                    msg.content = msg.fromUserName + " 开启了允许普通成员上传群共享文件";
                } else
                    msg.content = msg.fromUserName + " 关闭了允许普通成员上传群共享文件";
                break;
            case 923:
                if (1 == msg.content || "1" == msg.content) {
                    msg.content = msg.fromUserName + " 开启了允许普通成员召开会议";
                } else
                    msg.content = msg.fromUserName + " 关闭了允许普通成员召开会议";
                break;
            case 924:
                if (1 == msg.content || "1" == msg.content) {
                    msg.content = msg.fromUserName + " 开启了允许普通成员讲课";
                } else
                    msg.content = msg.fromUserName + " 关闭了允许普通成员讲课";
                break;

            case MessageType.GROUP_OWNER_CHANGE:
                if (!this.isGroupType(msg.chatType) && msg.msgType != 1) {
                    return null;
                }
                // console.log(msg,'转让群主——————————》')
                // if (!this.isGroupType(msg.chatType)) {
                //     return null;
                // }
                // console.log(msg, '转让群主——————————》')
                msg.content = msg.toUserName + " 已成为新群主";
                break;

            case 931:  //群锁定、解锁
                let chatItem = chatStore.chats.find(item => { return item.id == msg.roomJid });
                // let groupItem = groupStore.groupList.find(item => { return item.jid == message.roomJid });
                // console.log('锁定了吗', msg.content, msg, chatItem)
                if (chatItem) {
                    if (msg.content == -1) {
                        // console.log('锁定了吗1111')
                        chatItem.isBacklock = true;
                    } else if (msg.content == 1) {
                        chatItem.isBacklock = false;
                        // console.log('锁定了吗2222',chatItem)
                    }
                }
                msg.content = "此群已" + (msg.content == -1 ? "被锁定" : "解除锁定");
                break;
            case MessageType.TYPE_GROUP_EXPLAIN:
                // console.log(msg, '收到群说明');
                if (msg && msg.fromUserName) {
                    msg.content = msg.fromUserName + " 发布新的群说明 ";
                } else {
                    msg.content = "";
                }
                break;
            // case MessageType.DOUBLE_WITHDRAW:
            //     msg.content = "";
            //     break;
            default: {
                break;
            }
            //群消息，更新群数据

        }

        if (msg.objectId && msg.objectId == chatStore.currentChatData.id && isSend) {
            chatStore.getUserOrGroupInfo(chatStore.currentChatData);
            groupStore.updataSingleGroupList();
        }
        msg.contentType = msg.type;
        // console.log('修改了消息id--1',msg.toUserId)
        if (msg.objectId) {
            msg.toUserId = msg.objectId;
        }
        // console.log('修改了消息id',msg.toUserId)
        msg.type = 10;
        if (true == appendTime) {
            msg.content += "  (" + Utils.toDateTimeFormat(Number(msg.timeSend), "YYYY-MM-DD HH:mm") + ")";
        }
        return msg;
    }

    toDate = (timestamp: number): string => {
        return Utils.toDateTimeFormat(timestamp, "yyyy-MM-dd");
    }

    /*是否是 群组消息*/
    isGroupType = (chatType: string): boolean => {
        return this.GROUPCHAT == chatType;
    }


    logout = async (isLoginout: boolean = false): Promise<any> => {
        deviceManager.sendOffLineMessage();
        xmppSDK.selfExit = true;
        xmppSDK.disconnect();
        //第二通道断开
        if (isLoginout ) {

            systemStore.access_token = '';
            friendStore.init();
            if (xmppSDK.eventSource) {
                xmppSDK.eventSource.close();
                xmppSDK.eventSource = null;
            }
            if (isOpenTwoContent) {
                var eventSource = new EventSource(`${SystemStore.apiUrl}:8095/messages/feed/off?device=web&token=${systemStore.access_token}`); //  /springSSE/connect
                eventSource.onmessage = function (event) {

                    console.log('第二通道断开--------------------》》》》成功', event, event.data)

                };
                eventSource.onerror = function (event) {
                    try {
                        console.log('第二通道断开--------------------》》》》', SystemStore.apiUrl, event, systemStore.access_token)
                        eventSource && eventSource.close();

                    } catch{
                        eventSource && eventSource.close();
                        console.log('第二通道断开--------------------》》》》失败', event)
                    }
                };
            }
        }

        this.clearDataMesTimer && clearInterval(this.clearDataMesTimer);
        this.clearDataChatsTimer && clearInterval(this.clearDataChatsTimer);
        await this.save(Boolean(isLoginout));
    }

}


export const webIMConfig = {

}

export default new WebIM();
