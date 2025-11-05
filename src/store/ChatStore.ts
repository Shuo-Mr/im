import { observable, action, computed, IObservableArray } from 'mobx';
import mainStore, { detailType } from './MainStore';
import { ChatList, MessageItem, ChatItem, MessageData, MessageStatus, MessageStatusType, GroupMember, ChatGrOrFrType, GroupControlState } from '../interface/IChat';
import { FriendItem } from '../interface/IFriend';
import { GroupItem } from '../interface/IGroup';
import Utils from '../utils/utils';
import { ChatType, MessageType, mentionsAllKey, MessageTypeWithSubName, transmitMesGroupTitle, transmitMesTitle, MesaageTips, notShowContent } from '../net/Const';
import friendStore from '../store/FriendStore';
import groupStore from '../store/GroupStore';
import imsdk from '../net/IMSDK';
import webIM from '../net/WebIM';
import systemStore from './SystemStore';
import { delMessageBy, updateMessageVerification, insertMessage, find, delMessageByChatId } from '../dbtemp/HandleDB';
import ipcRender from '../ipcRender';
import { requestStore } from './RequestStore';
import _ from 'underscore';
import { SelectItemType, SelectType } from '../interface/ITransmit';
import xmppSDK from './../net/XmppSDK';
import deviceManager from '../net/DeviceManager';
import message from 'antd/es/message';

import { mesDataCache } from '../dbCache/dbCacheData'

import { Observable, Subscriber } from 'rxjs';
import { sampleTime } from 'rxjs/operators';
import { isOpenDB, isOpenRead } from '../config/SystemConfig';
import { GroupMemRole } from '../interface/IGroup';

import msgAudioUrl from '../assets/audio/msg.mp3';
import eventBus from '../utils/eventBus';
import moment from 'moment';



export class ChatStore {

    constructor() {
        this.initSortFun();
    }
    _sbscriber: Subscriber<unknown>
    initSortFun = () => {
        let sortObserval = new Observable(subsctiber => {
            this._sbscriber = subsctiber;
        })
        let obervaleSortWithTime = sortObserval.pipe(sampleTime(500));
        obervaleSortWithTime.subscribe((t?: ChatItem[]) => {
            this.chatSortFun(t)
        });
    }
    chatSort = (Clist?: ChatItem[]) => {
        this._sbscriber && this._sbscriber.next(Clist)
    }
    chats: IObservableArray<ChatItem> = observable([]);

    private _messageData: MessageData = new Map();
    // 消息数据
    messageData = observable(this._messageData);


    // 消息 状态
    _messageStatus: MessageStatus = new Map()
    messageStatus = observable(this._messageStatus)
    currentChatInitData: ChatItem = { tags: [], lastContent: '', id: '', lastTime: '', messageId: '', name: '', account: '', timeSend: 0, type: 0, desc: '', gid: '', msgTalkTime: 0, isForbidden: false, isBacklock: false };
    limit = 50;
    listIsBottom = false;
    @computed get messageListInLimit() {
        let _id = this.currentChat.id;
        let messageList = this.messageData.get(_id + '');
        if (messageList) {
            // if (messageList.length > 50) {
            //     messageList = messageList.slice(messageList.length - 50, messageList.length)
            //     this.messageData.set(_id, messageList);
            // }
            return messageList
        }
        return []
    }
    setListIsBottom = (isBottom: boolean) => {
        this.listIsBottom = isBottom;
    }
    //当前聊天状态
    @observable currentChatData: ChatItem = this.currentChatInitData;

    //当前群的成员限制数量上限
    @observable maxUserSize: number = 100;
    @observable groupUserSize: number = 1;

    @observable groupControlState: GroupControlState = new Map();

    // @observable emojsList:EmojiItem[]=[];
    @observable amrRecorder: any;

    //登录后获取的所有数据库信息
    dbms: Map<any, any[]> = new Map();

    // emojsList: IObservableArray<EmojiItem> = observable([]);
    @observable emojsList: [{ url: string, name: string }];
    //消息多选模式
    @observable isMesSel = false;

    //消息多选模式
    @observable isReply: boolean = false;
    replyMessage: MessageItem = new MessageItem();

    // md5List: string[] = [];
    //转发消息列表

    @observable transmitMesList: MessageItem[] = [];
    @observable loadingChatDetailData: boolean = true;

    @action showTransMesListModal = (mes: MessageItem[]) => {
        this.transmitMesList = mes;
    }
    @action hideTransmitmes = () => {
        this.transmitMesList = []
    }

    // selected mes map
    @observable selectedMes: Map<string, MessageItem> = new Map();
    @action switchShowMesSel = () => {
        if (!this.isMesSel) {
            this.selectedMes.clear();
        }
        this.isMesSel = !this.isMesSel;
    }
    @action switchMesCheck = (mesItem: MessageItem) => {
        const mesId = mesItem.messageId;

        const mes = this.selectedMes.get(mesId + '');
        if (mes) {
            this.selectedMes.delete(mesId + '')
        } else {
            this.selectedMes.set(mesId + '', mesItem);
        }
    }
    // 消息转发
    @action transmitMes = (isSingle: boolean, mes?: MessageItem, target?: SelectItemType[]) => {
        const mesTransmit = mes ? [mes] : Array.from(this.selectedMes.values());
        if (target) {
            target.forEach(item => {
                if (item.transmitType == SelectType.chat) {
                    this.sendMessageWithChat(mesTransmit, (item.data as ChatItem), isSingle);
                }
                if (item.transmitType == SelectType.group || item.transmitType == SelectType.friend) {
                    let _chat = ChatItem.getChatItem(item.data as FriendItem | GroupItem);
                    this.addToChats(_chat);

                    this.sendMessageWithChat(mesTransmit, _chat, isSingle);
                }
            })
        }
    }
    @action sendMessageWithChat = (old_msg: MessageItem[], chat: ChatItem, isSingle: boolean) => {
        const msg = [...old_msg]
        if (isSingle) {
            msg.forEach(_msg => {
                const msgServer = webIM.createMessage(_msg.type, _msg.content, chat.id, chat.name);
                msgServer.fromUserName = chat.nickname
                    ? chat.nickname
                    : msgServer.fromUserName;
                ////转化数据
                let tip = ''
                if (_msg.type == MessageType.TEXT) {
                    tip = _msg.content;
                } else if (_msg.type == MessageType.IMAGE) {
                    if (Utils.isBase64(_msg.content)) {
                        message.error('图片上传失败，转发失败');
                        return
                    }
                    msgServer.location_x = _msg.location_x ? _msg.location_x : '';
                    msgServer.location_y = _msg.location_y ? _msg.location_y : '';
                    tip = '[图片]'
                    if (_msg.content.indexOf('gif') != -1) {
                        tip = '[动画表情]';
                    }
                } else if (_msg.type == MessageType.GIF) {
                    tip = '[动画表情]'
                } else if (_msg.type == MessageType.VIDEO) {
                    tip = '[视频]'
                } else if (_msg.type == MessageType.VOICE || _msg.type == MessageType.SIP_AUDIO) {
                    msgServer.timeLen = _msg.timeLen ? _msg.timeLen : 0;
                    tip = '[音频]'
                } else if (_msg.type == MessageType.CARD) {
                    msgServer.objectId = _msg.fromUserId;
                    tip = '[名片]'
                } else if (_msg.type == MessageType.FILE) {
                    msgServer.fileName = _msg.fileName ? _msg.fileName : '';
                    msgServer.fileSize = _msg.fileSize ? _msg.fileSize : '';
                    tip = '[文件]'
                } else if (_msg.type == MessageType.LOCATION) {
                    msgServer.location_x = _msg.location_x ? _msg.location_x : '';
                    msgServer.location_y = _msg.location_y ? _msg.location_y : '';
                    msgServer.objectId = _msg.objectId ? _msg.objectId : '';
                    tip = '[地理位置]'
                }
                this.addMessage(chat.id, msgServer, true);
                webIM.sendMessage(msgServer, '');
                this.updateMes(tip, msgServer.timeSend, chat.id);

            })
        } else {
            const _content = msg.map(item => JSON.stringify(item))
            const msgItem = webIM.createMessage(MessageType.TEXT_TRANSMIT_MANY, JSON.stringify(_content), chat.id, chat.name);
            msgItem.objectId = this.currentChatData.type == ChatGrOrFrType.group
                ? transmitMesGroupTitle
                : this.currentChatData.name + '和' + systemStore.nickname + ' ' + transmitMesTitle
            this.addMessage(chat.id, msgItem, true);
            this.updateMes('[图片]', msgItem.timeSend, chat.id);

            webIM.sendMessage(msgItem, '');
        }
        this.selectedMes.clear();
    }

    //设置消息多去状态
    @action setMesRead = (msgSendStatus: MessageStatus) => {
        this.messageStatus.replace(msgSendStatus);
    }
    // 聊天对象最近上线时间
    // @observable friendOnlineTime: ChatOnlineTime = {};
    //群成员数据
    @observable groupMemberData: GroupMember = {};

    //临时的对话数量存储数量
    @observable unReadMsgs: Map<string, MessageItem[]> = new Map();


    @action setSnapChat = async (chatId: string, snapChat: number) => {
        if (systemStore.isDelAfterReading == 0) {
            const content = snapChat < 1 ? '你关闭了阅后即焚' : '你设置了阅后即焚' + Utils.getDeadLineTime(snapChat).name + '消失';
            // let currentId = this.currentChatData.id;

            let msg = webIM.createMessage(
                MessageType.SNAP_CHAT,
                content,
                chatId,
                this.currentChatData.name
            );
            this.addMessage(chatId, msg, true);
            this.updateMes(content, msg.timeSend);
            webIM.sendMessage(msg, '');
            msg && mesDataCache.addmes(msg, chatId);
        }

        this.currentChatData.snapChat = snapChat
        // console.log('找到数据', this.currentChatData)

    }
    //阅后即焚已读数据
    @action changeMesReadData = (myReadDeadTime: number, readDeadTime: number, mes: MessageItem) => {

        let currentId = this.currentChatData.id;

        let mesList = this.messageData.get(currentId);
        if (mesList) {
            const indexTar = mesList.findIndex(mesItem => mesItem.messageId == mes.messageId);
            if (indexTar > -1) {
                mesList[indexTar].myReadDeadTime = myReadDeadTime;
                mesList[indexTar].readDeadTime = readDeadTime;
                this.messageData.set(currentId, mesList);
            }
        }
    }

    @action setTop = async (chatId: string, isTop: boolean) => {
        const targetChat = this.chats.find(item => item.id == chatId);
        if (!targetChat) {
            return;
        }

        const isGroup = Utils.isGroup(chatId);
        const isRoom = isGroup ? 1 : 0;

        try {
            if (isTop) {
                // 添加置顶
                const toUserId = isGroup ? undefined : chatId;
                const roomId = isGroup ? targetChat.gid : undefined;
                
                const result = await imsdk.addChatPin(isRoom, toUserId, roomId);
                
                if (result && result.resultCode === 1) {
                    // 获取置顶列表，找到对应的 pinId
                    const pinListResult = await imsdk.getChatPinList();
                    if (pinListResult && pinListResult.resultCode === 1 && Array.isArray(pinListResult.data)) {
                        const pinItem = pinListResult.data.find((item: any) => {
                            if (isGroup) {
                                return item.isRoom === 1 && String(item.roomId) === String(roomId);
                            } else {
                                return item.isRoom === 0 && String(item.toUserId) === String(chatId);
                            }
                        });
                        
                        if (pinItem) {
                            targetChat.pinId = pinItem.id;
                        }
                    }
                    
                    targetChat.isTop = true;
                    this.chatSort();
                    message.success('置顶成功');
                } else {
                    message.error('置顶失败');
                }
            } else {
                // 删除置顶
                if (targetChat.pinId) {
                    const result = await imsdk.delChatPin(targetChat.pinId);
                    
                    if (result && result.resultCode === 1) {
                        targetChat.isTop = false;
                        targetChat.pinId = undefined;
                        this.chatSort();
                        message.success('取消置顶成功');
                    } else {
                        message.error('取消置顶失败');
                    }
                } else {
                    // 如果没有 pinId，尝试从服务器获取
                    const pinListResult = await imsdk.getChatPinList();
                    if (pinListResult && pinListResult.resultCode === 1 && Array.isArray(pinListResult.data)) {
                        const pinItem = pinListResult.data.find((item: any) => {
                            if (isGroup) {
                                return item.isRoom === 1 && String(item.roomId) === String(targetChat.gid);
                            } else {
                                return item.isRoom === 0 && String(item.toUserId) === String(chatId);
                            }
                        });
                        
                        if (pinItem) {
                            const delResult = await imsdk.delChatPin(pinItem.id);
                            if (delResult && delResult.resultCode === 1) {
                                targetChat.isTop = false;
                                targetChat.pinId = undefined;
                                this.chatSort();
                                message.success('取消置顶成功');
                            } else {
                                message.error('取消置顶失败');
                            }
                        } else {
                            // 如果服务器也没有找到，直接更新本地状态
                            targetChat.isTop = false;
                            targetChat.pinId = undefined;
                            this.chatSort();
                        }
                    } else {
                        // 获取置顶列表失败，直接更新本地状态
                        targetChat.isTop = false;
                        targetChat.pinId = undefined;
                        this.chatSort();
                    }
                }
            }
        } catch (error) {
            console.error('置顶操作失败:', error);
            message.error('置顶操作失败');
        }
    }

    /** 同步置顶状态 - 确保移动端更新置顶后能正确同步 */
    @action syncPinStatus = async () => {
        try {
            const pinListResult = await imsdk.getChatPinList();
            if (pinListResult && pinListResult.resultCode === 1 && Array.isArray(pinListResult.data)) {
                // 重置所有聊天项的置顶状态（避免本地状态与服务器不一致）
                this.chats.forEach(chat => {
                    chat.isTop = false;
                    chat.pinId = undefined;
                });

                // 根据服务器返回的置顶列表更新状态（确保移动端更新置顶后能正确同步）
                pinListResult.data.forEach((pinItem: any) => {
                    const chatItem = this.chats.find((chat: ChatItem) => {
                        if (pinItem.isRoom === 1) {
                            // 群组：根据 roomId 匹配
                            return String(chat.gid) === String(pinItem.roomId);
                        } else {
                            // 单聊：根据 toUserId 匹配
                            return String(chat.id) === String(pinItem.toUserId);
                        }
                    });

                    if (chatItem) {
                        chatItem.isTop = true;
                        chatItem.pinId = pinItem.id;
                    }
                });

                // 重新排序，确保置顶的聊天项排在前面
                this.chatSort();
            }
        } catch (error) {
            console.error('同步置顶状态失败:', error);
            // 同步失败时不抛出错误，避免影响其他初始化流程
        }
    }

    @action setNotice = (chatId: string, isNotice: boolean) => {
        let chatList = this.chats
        let targetIndex = chatList.findIndex(item => item.id == chatId);
        if (targetIndex > -1) {

            chatList[targetIndex].isNotice = isNotice;

        }
        this.chatSort()
    }

    @action resetChats = () => {
        this.chats = observable([]);
    }
    @action reset = () => {
        this.resetChats();
        this.currentChatInitData = this.currentChatInitData;
        let gm: GroupMember = {};
        this.messageData = observable(new Map());
        this.groupMemberData = observable(gm);
        this.isMesSel = false;
        this.unReadMsgs = new Map();
        this.currentChatData = this.currentChatInitData;
        mesDataCache.resetData();
    }

    //初始化当前数据
    @action initData = () => {
        this.reset()
    }

    @action setChats = async (_chats: ChatList): Promise<void> => {
        this.chats.replace(_chats);
        // 从本地存储恢复聊天列表后，同步置顶状态
        // 确保如果移动端更新了置顶，能够正确同步
        await this.syncPinStatus();
    }
    @action setMessageLoading = (messageId: string) => {
        this.messageStatus.set(messageId, MessageStatusType.loading)
    }
    @action setMessageReaded = (message: MessageItem) => {
        if (this.messageStatus.has(message.content)) {
            this.messageStatus.delete(message.content)
        }
    }
    /**
     * 设定消息 送达
     */
    @action setMessageSendOk = (messageId: string) => {
        if (this.messageStatus.has(messageId)) {
            this.messageStatus.set(messageId, MessageStatusType.sent)
        }
    }
    /**
     * 添加聊天列表
     */
    @action addToChats = (_chatItem: ChatItem) => {

        // return new Promise((r, j) => {
        //     let addTime = setTimeout(() => {
        //         clearTimeout(addTime);
        const targetIndex = this.chats.findIndex(item => item.id == _chatItem.id)
        if (targetIndex < 0) {
            this.chats.unshift(_chatItem);
            this.setChats(this.chats)
            // this.chatSort(this.chats);
        } else {
            this.chats[targetIndex] = _chatItem;
        }
        // }, 0)
        // })

    }
    //获取当前聊天详情数据
    @computed get currentChat() {
        const currentChat = this.chats.find((item: any) => this.currentChatData && item.id == this.currentChatData.id);
        if (currentChat) {
            return currentChat
        } else {
            //todo 出错了
            return this.chats[0];

        }
    }

    // 添加新聊天消息
    // isMyself 判断是不是本机发的消息
    @action addMessage = (id: string, message: MessageItem, isMyself?: boolean) => {
        this.messageStatus.set(message.messageId, MessageStatusType.loading);

        if (this.currentChatData.id == id) {
            this.recoverMessage(id, message);
        }
        // 判断发送的消息 是不是相同id 发送的
        const isMyIdSendMes = message.fromUserId == systemStore.userId;

        if (isMyIdSendMes && !isMyself) {
            this.messageStatus.set(message.messageId, MessageStatusType.sent);
        }
    }

    playAudio = () => {
        const tipSwitch: number = (localStorage.getItem('_tipSwitch') ? 0 : 1)
        if (tipSwitch == 0) return
        let noticeAudio = msgAudioUrl;
        let audio = new Audio(noticeAudio);
        audio.play(); //播放
    }

    @action updtateContent = (mes: MessageItem) => {

        let currentId = this.currentChatData.id;

        let mesList = this.messageData.get(currentId);
        if (mesList) {
            const indexTar = mesList.findIndex(mesItem => mesItem.messageId == mes.messageId);
            if (indexTar > -1) {
                mesList[indexTar].content = mes.content ? mes.content : '';
                mesList[indexTar].location_x = mes.location_x ? mes.location_x : '';
                mesList[indexTar].location_y = mes.location_y ? mes.location_y : '';
                this.messageData.set(currentId, mesList);
            }
        }
    }
    @action batchRecoverMessage = (msgMap: Map<string, MessageItem[]>) => {

        msgMap.forEach((items: MessageItem[], key: string) => {
            if (Boolean(this.messageData.get(key))) {
                let msgd = this.messageData.get(key) || [];
                let tempmsgs = msgd.slice().concat(items);
                this.messageData.set(key, tempmsgs);
            } else {
                this.messageData.set(key, items);
            }
        })
    }

    /**
     * 添加聊天消息
     */
    @action recoverMessage = (id: string, message: MessageItem) => {
        let msgd = this.messageData.get(id + '') || []
        msgd.push(message);
        if (msgd.length > this.limit) {
            msgd = msgd.slice(-this.limit)
            msgd = msgd.map(item => ({
                ...item,
                content: item.contentType === MessageType.DOUBLE_WITHDRAW ? '' : item.content
            }))
        }

        this.messageData.set(id + '', [...msgd]);
    }

    //修改消息 状态
    @action updateMesStatus = (msgId: string, status: MessageStatusType) => {
        this.messageStatus.set(msgId, status);
    }
    //设定消息超时
    @action mesSendTimeOut = (msgId: string) => {
        if (this.messageStatus.get(msgId) == MessageStatusType.loading) {
            this.messageStatus.set(msgId, MessageStatusType.error);
        }
    }
    //更新聊天项 状态
    @action updateMes = (content: string, time: string, id?: string) => {
        if (!content || !time) {
            return;
        }
        const _id = id ? id : this.currentChatData.id
        const targetIndex = this.chats.findIndex(item => item.id == _id);
        if (targetIndex > -1) {
            this.chats[targetIndex].lastContent = content;
            this.chats[targetIndex].lastTime = time;
            if (!this.chats[targetIndex].isTop) {
                this.chatSort();
            }

        }
    }
    //清空@消息内容
    @action clearMentionText = (id: string) => {

        let currentId = this.currentChatData.id;
        if (id == currentId) {
            return;
        }
        const changeChat = this.chats.find((chat: any) => chat.id == id);
        if (changeChat) {
            changeChat.mentionText = ''
        }
    }
    editGetHistoryData = (_result: any, id: string, isoldMes?: boolean, _startTime?: number, _endTime?: number) => {
        const startTime = Math.floor(_startTime || 0);
        const endTime = Math.floor(_endTime || 0);
        if (Array.isArray(_result) && _result.length > 0) {
            //对当前chatmessage 去重
            let _mesTarget = this.messageData.get(id + '') || [];
            const messageMap = {}
            _mesTarget.forEach(item => {
                if (!item) {
                    return;
                }
                messageMap[item.messageId + ''] = true;
            })
            let addMesList: MessageItem[] = [];
            //这个地方为了处理前插数据的顺序正确
            const result = !isoldMes ? [..._result].reverse() : _result
            result.forEach((xmppmsg: any) => {
                if (messageMap[xmppmsg.messageId]) {
                    if (!_mesTarget) return;
                    const indexTar = _mesTarget.findIndex(mesItem => mesItem.messageId == xmppmsg.messageId);
                    if (indexTar > -1) {
                        _mesTarget[indexTar].unreadCount = xmppmsg.unreadCount;
                        this.messageData.set(xmppmsg.messageId + '', _mesTarget);
                    }
                } else {
                    messageMap[xmppmsg.messageId] = true;
                    let msg = JSON.parse(xmppmsg.body.replace(/&quot;/gm, '"'));
                    if (MesaageTips.indexOf(msg.type) == -1) {
                        msg.isRead = xmppmsg.isRead;
                        msg.fromJid = xmppmsg.sender_jid;
                        msg.toJid = msg.toJid ? msg.toJid : xmppmsg.receiver_jid;
                        msg.id = xmppmsg.messageId;
                        msg.messageId = xmppmsg.messageId;
                        msg.unreadCount = xmppmsg.unreadCount;
                    }
                    // console.log('远端的消息',msg)
                    msg.content = webIM.decryptMessage(msg);
                    if (msg.chatType != undefined) {
                        msg.chatType = msg.chatType == ChatType.GROUPCHAT ? ChatType.GROUPCHAT : ChatType.CHAT;
                    } else if (xmppmsg.message) {
                        try {
                            let eleMes: HTMLElement = document.createElement('message');
                            eleMes.innerHTML = xmppmsg.message;
                            const _typeDom = eleMes.getElementsByTagName('message');
                            if (_typeDom && _typeDom[0]) {
                                const _type = _typeDom[0].getAttribute('type');
                                if (_type) {
                                    msg.chatType = _type == ChatType.GROUPCHAT ? ChatType.GROUPCHAT : ChatType.CHAT
                                }
                            }
                        } catch (e) {
                            console.error('解析xml 出错了', e)
                        }
                    }
                    // else{
                    //     webIM.converGroupMsg(msg)
                    // }
                    let isInLimit = false;
                    let msgTS = Math.floor(msg.timeSend) || 0;
                    if (startTime && endTime) {
                        isInLimit = endTime >= msgTS && msgTS >= startTime;
                    } else if (startTime) {
                        isInLimit = msgTS >= startTime;
                    } else if (endTime) {
                        isInLimit = msgTS <= endTime;
                    } else {
                        isInLimit = true;
                    }
                    if (isInLimit) {
                        addMesList.push(msg);
                        isOpenDB && msg && insertMessage(msg);
                        // console.log('数据库3',msg.content)
                        msg && mesDataCache.addmes(msg, '', isoldMes);
                    }
                }
            })
            return !isoldMes ? addMesList : [...addMesList].reverse();
        }
        return []

    }

    getMesTimer: NodeJS.Timeout;
    /**
     * 获取本地 及 远程消息
     */
    @action getChatMessages = async (id: string, startTime?: number | string, isGroup?: boolean, limit?: number, offset?: number, gid?: string) => {
        let targetList: MessageItem[] = [];
        // const timeCUr = new Date().valueOf();
        const limitDefault = 30;
        const amountMsg = limit ? limit : (offset ? offset : limitDefault);
        if (id == this.currentChatData.id) {
            if (!startTime) {
                this.loadingChatDetailData = true;
            }


            let mesTarget = this.messageData.get(id + '') || [];
            let offsetMes = 0;
            if (mesTarget && mesTarget.length > 0) {
                offsetMes = mesTarget.length
            }
            const msgList = mesDataCache.getMesListByChatIdWithPage(id + '', offsetMes, amountMsg);
            // console.log('获取本地消息', msgList);
            if (Array.isArray(msgList)) {
                targetList = [...msgList].reverse();
            }
            if (id == this.currentChatData.id && Array.isArray(msgList)) {
                // const mesTarget = this.messageData.get(id);
                // let targetList = mesTarget?mesTarget:[];

                /**
                 * 数据库最晚的时间
                 */
                const dataLastMsgTime = msgList.length > 0 ? (Number(msgList[0].timeSend) > Number(msgList[msgList.length - 1].timeSend) ? Number(msgList[0].timeSend) : Number(msgList[msgList.length - 1].timeSend)) || 0 : 0;
                /**
                 * 请求远程消息结果
                 */
                let result = null;

                /**
                 * 请求远程消息转换的消息列表
                 */
                let getServerMes: MessageItem[] = [];
                /**
                 * 判断是加在列表的前后 true 是后面 fasle=》 加在列表前面
                 */
                const currentChat = this.chats.find(item => item.id == id);
                let mesNeedNew = false;
                let getServerStartTime = 0;
                let getServerEndTime = 0;
                let hasGoServer = false;
                if (!startTime) {
                    if (currentChat && (
                        !dataLastMsgTime
                        || Math.floor(Number(currentChat.lastTime)) > Math.floor(dataLastMsgTime)
                    )) {
                        // console.log('需要加载到后面的', currentChat.lastTime, msgList[0].timeSend)
                        getServerStartTime = Number(dataLastMsgTime) || 0;
                        getServerEndTime = Number(currentChat.lastTime) >= 1 ? Number(currentChat.lastTime) || 0 : 0;
                        result = await webIM.timeOutGetHistoryServer(0, getServerStartTime, getServerEndTime, currentChat.type == ChatGrOrFrType.group, id, amountMsg);
                        hasGoServer = true;
                        mesNeedNew = true;
                    }
                }
                if (!result && !hasGoServer && Array.isArray(msgList) && msgList.length < Math.ceil(amountMsg * 0.6)) {
                    let _endTime = 0;
                    let _startTime = 0
                    if (msgList && msgList.length > 0) {
                        _endTime = Number(msgList[0].timeSend) || 0
                    } else if (startTime) {
                        _endTime = Number(startTime) || 0 // 此处传的开始时间 是 消息列表额开始时间 及 数据库的时间小于这个的
                    }
                    if (!_endTime) {
                        const _chat = this.lastChatMesMap.get(this.currentChatData.id);
                        if (_chat && _chat.timeSend) {
                            _endTime = _chat.timeSend
                        }
                    }
                    // console.log('需要加载到前面的', _endTime);
                    if (startTime && _endTime >= 1) {
                        _endTime = _endTime - 1;
                    }
                    getServerStartTime = _startTime;
                    getServerEndTime = _endTime ? _endTime : 0;
                    result = await webIM.timeOutGetHistoryServer(0, _startTime, _endTime ? _endTime : 0, Boolean(isGroup), id, amountMsg);
                    if (result) {
                        mesNeedNew = false;
                    }
                }
                if (result) {
                    getServerMes = this.editGetHistoryData(result, id, !mesNeedNew, Math.floor(getServerStartTime), Math.floor(getServerEndTime));
                    // console.log('获取本地消息获取远程的消息', getServerMes, mesNeedNew)
                }
                if (getServerMes.length > 0) {
                    if (mesNeedNew) {
                        targetList = targetList.concat(getServerMes);
                        targetList = this.distictMsg(targetList, []);
                    } else {
                        targetList = getServerMes.concat(targetList);
                        targetList = this.distictMsg(targetList, []);
                    }
                }
                let _targetMessageList = [];
                if (startTime) {
                    _targetMessageList = targetList.concat(mesTarget);

                } else {
                    _targetMessageList = targetList;

                }
                if (_targetMessageList.length != 0) {
                    _targetMessageList = this.messageWithEdit(_targetMessageList);
                    this.messageData.set(id + '', _targetMessageList);
                }
                if (!startTime && currentChat) {
                    let lastMesTime = targetList.length > 0 ? targetList[targetList.length - 1].timeSend : 0 + '';
                    if (!lastMesTime && currentChat.lastTime) {
                        lastMesTime = currentChat.lastTime + '';
                    }
                    this.getServerNewMes(id, lastMesTime, currentChat.type == ChatGrOrFrType.group);
                }
                if (amountMsg && targetList.length >= amountMsg) {
                    this.loadingChatDetailData = false;
                    this.getMesTimer && clearTimeout(this.getMesTimer)
                    return {
                        hasMore: true,
                        amount: targetList.length
                    }
                }
                this.loadingChatDetailData = false;
                this.getMesTimer && clearTimeout(this.getMesTimer)
                return {
                    hasMore: false,
                    amount: targetList.length
                }
            }
        }
        this.loadingChatDetailData = false;
        this.getMesTimer && clearTimeout(this.getMesTimer)
        return {
            hasMore: false,
            amount: 0
        }
    }
    messageWithEdit = (mesList: MessageItem[]) => {
        let _targetMessageList = [];
        if (Array.isArray(mesList) && mesList.length > 0) {
            _targetMessageList = mesList.map(item => {
                if (item.type && MesaageTips.indexOf(item.type) > -1) {
                    return webIM.converGroupMsg(item)
                }
                return item || {}
            });
            // console.log('消息列表数据', JSON.parse(JSON.stringify(_targetMessageList)))
            _targetMessageList = _targetMessageList.filter(item => item.timeSend)
            _targetMessageList = _targetMessageList.sort((m1, m2) => m1.timeSend <= m2.timeSend ? -1 : 1);
        }
        return _targetMessageList
    }

    /**
     * 进入聊天列表 获取本地及服务端消息 每次进入，拉取服务端消息最新
     */
    @action getServerNewMes = async (id: string, startTime: string, isGroup: boolean) => {
        let _mesTarget = this.messageData.get(id + '') || [];
        let start_current = Number(startTime ? startTime : 0);
        const result_confirm = await webIM.getHistoryMsg(0, start_current, 0, isGroup, id, 100);
        if (Array.isArray(result_confirm) && result_confirm.length > 0) {
            let confirmEditMes = this.editGetHistoryData(result_confirm, id, false, Math.floor(start_current));
            // console.log('获取补偿本地消息', 'confirmEditMes==>', confirmEditMes, 'start_current==>', start_current);
            if (Array.isArray(confirmEditMes) && confirmEditMes.length > 0) {
                _mesTarget = _mesTarget.concat(confirmEditMes);
                _mesTarget = this.distictMsg(_mesTarget, []);
                _mesTarget = this.messageWithEdit(_mesTarget);
                this.messageData.set(id + '', _mesTarget);
            }
        }
    }

    distictMsg = (originData: Array<MessageItem>, netData: Array<MessageItem>): Array<MessageItem> => {

        // console.log("originData的长度", originData.length, "netData的长度", netData.length)
        originData = _.uniq(originData, false, (item: any) => { return item.messageId });
        // originData =  _.uniq(originData, true, (item: any) => { return item.id});
        netData = _.uniq(netData, false, (item: any) => { return item.messageId });
        if (originData.length != 0 && netData.length != 0) {
            let exit: boolean = false;
            let originLen: number = originData.length;
            netData.forEach((item, index) => {
                for (let i = 0; i < originLen; i++) {
                    // console.log(item.id == originData[i].id, item.id, originData[i].id);

                    if (item.messageId == originData[i].messageId || item.id == originData[i].id) {
                        exit = true;
                        break;
                    }
                }
                if (!exit) {
                    originData.push(item);
                }
            })

            return originData as any;
        }
        else if (originData.length == 0) {
            return netData as any;
        } else if (netData.length == 0) {
            return originData as any;
        } else {
            return [];
        }


    }

    timerChangeSelect: NodeJS.Timeout;
    //左侧聊天 列表 切换聊天 --1
    @action changeSelectChat = async (id: string): Promise<any> => {

        // console.log('我在切换数据！！！！！！！！changeSelectChat=---->',this.currentChatData,id);
        if (this.currentChatData && this.currentChatData.id) {
            if (detailType.none != mainStore.detailType && id == this.currentChatData.id) {
                return;
            }
        }
        const changeChat = this.chats.find((chat: any) => chat.id == id);
        if (changeChat) {
            changeChat.mentionText = '';
            this.currentChatData = changeChat;
            // console.log('我在切换数据！！！！！！！！changeSelectChat=---->', this.currentChatData.id,this.currentChat.name);
            // try {
            //     if (Utils.isGroup(changeChat.id)) {
            //         xmppSDK.joinGroupChat(changeChat.id, xmppSDK.userId, 0);
            //     }
            // } catch (e) {
            //     console.log('我错了！');

            // }
            this.messageData.clear();
            this.getChatMessages(changeChat.id,
                undefined,
                changeChat.type == ChatGrOrFrType.group,
                undefined,
                undefined,
                changeChat.gid ? changeChat.gid : undefined);
            mainStore.changeShowDetailType(detailType.message);
            this.timerChangeSelect && clearTimeout(this.timerChangeSelect);
            //todo  这里是异步 可能有问题
            this.timerChangeSelect = setTimeout(() => {
                this.timerChangeSelect && clearTimeout(this.timerChangeSelect);
                this.getUserOrGroupInfo(changeChat);
                // this.getUserOrGroupInfo(this.currentChatData);
                // console.log(this.currentChatData.id, '666666');
                this.sendMessagesReadReceipt(changeChat);
                // this.sendMessagesReadReceipt(this.currentChatData);
                //取消补偿的消息
                // this.getOffsetMsg(id);
            }, 0)
            //todo 消息补偿机制
        }
    }
    /**
     * 会话最近一条聊天列表
     */
    lastChatMesMap: Map<string, any> = new Map();

    /**
     * 处理最新聊天最新一条消息列表
     */
    @action editNewChatsList = async (lastMessageList: any) => {
        // console.log('最新一条消息列表', lastMessageList);
        if (Array.isArray(lastMessageList)) {
            lastMessageList.forEach((item: any) => {
                const isMySend = item.from == systemStore.userId;
                const id = item.isRoom ? item.jid : (isMySend ? item.to : item.from);
                this.lastChatMesMap.set(id + '', item);
                const messageItem = MessageItem.getMessageBylastmes(item);
                this.updateChatlistMyLastmes(messageItem);
            })
        }
        // 同步置顶状态
        await this.syncPinStatus();
        this.chatSort();
    }
    /** 消息补偿机制 (目前未用)*/
    @action getOffsetMsg = async (id: string | number) => {
        //获取当前时间6个小时的消息作为补偿
        // 然后更本地消息比较

        let time = webIM.getServerTime();
        let hmsg = await webIM.timeOutGetHistoryServer(0, time - 1 * 12 * 60 * 60, time, Utils.isGroup(id + ''), id + '');



        if (Array.isArray(hmsg) && hmsg.length > 0) {
            // console.log('获取历史数据12小时以前的用于测试-->', hmsg.length);
            // 获取特定类型的消息
            let abcMsg = hmsg.map((xmppmsg: any) => {
                let msg = JSON.parse(xmppmsg.body.replace(/&quot;/gm, '"'));
                if (MesaageTips.indexOf(msg.type) == -1) {
                    msg.isRead = xmppmsg.isRead;
                    msg.fromJid = xmppmsg.sender_jid;
                    msg.toJid = xmppmsg.receiver_jid;
                    msg.id = xmppmsg.messageId;
                    msg.messageId = xmppmsg.messageId;

                    // console.log('密8888 getOffsetMsg');
                    msg.content = webIM.decryptMessage(msg);

                    msg.chatType = Utils.isGroup(msg.fromJid) ? ChatType.GROUPCHAT : ChatType.CHAT;
                    return msg;
                } else {
                    return null;
                }
            });


            let tempMsgs: any = this.messageData.get(id as any);
            //避免客服公告两次消息 问题
            if (tempMsgs && id == '10000') {
                return;
            }

            // console.log('当前系统的数据-->', tempMsgs.length);
            if (tempMsgs && tempMsgs.length > 0) {
                let emp = abcMsg.filter((item: any) => { return !!item });
                // console.log('过滤的消息--->', emp.length);

                emp.reverse().map((info: any) => {

                    let exist = tempMsgs.filter((item: any) => { return item.messageId == info.messageId; });

                    // console.log('可能用于补偿的数据条数-->', exist.length);
                    if (exist && exist.length == 0) {
                        isOpenDB && insertMessage(info);
                        // console.log('数据库4',info.content)
                        mesDataCache.addmes(info)
                        tempMsgs.push(info);
                        //更新左侧聊天列表状态
                        this.updateMes(info.content || '', info.timeSend || '');
                        // console.log('更新内容',info.content || '' , info.timeSend);
                        this.messageData.set(id as string, tempMsgs);
                        // console.log('我补偿了消息-->', info);
                    }
                })
            } else {
                let temps = abcMsg.filter((item: any) => { return item }).map((item: any) => {
                    isOpenDB && insertMessage(item);
                    // console.log('数据库5',item.content)
                    mesDataCache.addmes(item);
                    return item;
                })
                //批量添加消息--------------------------------
                temps = temps.reverse();
                this.batchCreateMsg(temps, new Map());
            }

            this.sortMsg(id);
        }
    }


    @action sortMsg = (_id: any) => {
        let msgs = this.messageData.get(_id);
        if (msgs && msgs.length > 0) {
            let tempList = msgs.slice();

            tempList.sort((a: MessageItem, b: MessageItem) => {
                if (a.timeSend > b.timeSend) {
                    return 1;
                } else {
                    return -1;
                }
            })

            this.messageData.set(_id + '', tempList);

        }
    }

    /** 点击好友、群组的相应方法 */
    @action changeCurrentChat = async (_fg: FriendItem | GroupItem): Promise<any> => {
        const isSame = this.chats.find((chat: ChatItem) => {
            return _fg['toUserId'] == this.currentChatData.id || _fg['jid'] == this.currentChatData.id || _fg['id'] == this.currentChatData.id
        });
        if (detailType.none != mainStore.detailType && isSame) {
            return;
        }
        // ------------点击好友列表的相应方法
        const changeChat = this.chats.find((chat: ChatItem) => {
            return _fg['toUserId'] == chat.id || _fg['jid'] == chat.id || _fg['id'] == chat.id
        });
        console.log('changeCurrentChat', changeChat)
        if (changeChat) {
            this.getChatMessages(changeChat.id)
            if (changeChat.lastContent == notShowContent) {
                changeChat.lastContent = '';
                changeChat.lastTime = '';
            }
            this.currentChatData = changeChat;
        } else {
            const currentChatData = ChatItem.getChatItem(_fg);
            this.currentChatData = currentChatData;
            this.getChatMessages(currentChatData.id)
            try {
                if (Utils.isGroup(this.currentChatData.id)) {
                    xmppSDK.joinGroupChat(this.currentChatData.id, xmppSDK.userId, 0);
                }
            } catch (e) {
                console.log('我错了！');
            }

            setTimeout(() => {
                //todo: 从数据库中获取当前到聊天数据
                this.currentChatData.lastContent = '';
                this.chats.push(this.currentChatData);
                this.chatSort();
            }, 80)
        }

        if (this.currentChatData) {
            await this.getUserOrGroupInfo(this.currentChatData);
            this.messageData.clear();
            this.getChatMessages(this.currentChatData.id,
                undefined,
                this.currentChatData.type == ChatGrOrFrType.group,
                undefined,
                undefined,
                this.currentChatData.gid ? this.currentChatData.gid : undefined);
            // 保持当前 右侧 为聊天状态
            mainStore.changeShowDetailType(detailType.message);
            this.sendMessagesReadReceipt(this.currentChatData);
        }

    }




    //判断该对象是否存在
    // @action cheackHasCurrent = async (_chatItem: ChatItem): Promise<any> => {
    //     try {
    //         if (this.currentChatData) {
    //             if (Utils.isGroup(_chatItem.id)) {
    //                 const group = await imsdk.getRoom(_chatItem.gid);
    //                 console.log('当前对象存在吗');
    //                 if (group.resultCode == 1 && group.data) {

    //                 }
    //         }
    //     }
    //     } catch (e) {
    //         console.log('getUserOrGroupInfo--------挂掉了');
    //     }
    // }

    @action getUserOrGroupInfo = async (_chatItem: ChatItem): Promise<any> => {
        this.maxUserSize = 100 // 默认100个
        this.groupUserSize = 1
        try {
            // console.log('进的是这里吗', this.currentChatData, _chatItem)
            if (this.currentChatData) {
                // 获取用户|群信息
                if (Utils.isGroup(_chatItem.id)) {
                    const group = await imsdk.getRoom(_chatItem.gid);
                    //判断当前聊天是否变化
                    if (this.currentChatData.id != _chatItem.id) {
                        return
                    }
                    if (group.resultCode == 1 && group.data) {
                        // console.log('群信息：', JSON.stringify(group), '群员个数：', group.data.userSize)
                        _chatItem.desc = '群员个数：' + group.data.userSize;
                        this.maxUserSize = group.data.maxUserSize
                        // 群组人数
                        this.currentChatData.groupUserSize = group.data.userSize
                        this.currentChatData.desc = group.data.desc ? group.data.desc + '' : '';
                        // this.currentChatData.allowFriends = group.data.allowSendCard == '1';
                        // this.currentChatData.msgTalkTime = Number(group.data.talkTime ? group.data.talkTime : 0);
                        // this.currentChatData.groupInvitNeedTest = group.data.isNeedVerify == '1';
                        this.groupControlState.set('allowFriends', group.data.allowSendCard == '1');
                        this.groupControlState.set('msgTalkTime', Number(group.data.talkTime > 0 ? group.data.talkTime : 0));
                        this.groupControlState.set('groupInvitNeedTest', group.data.isNeedVerify == '1');
                        // console.log('群控制信息', this.groupControlState, group.data);
                        if (!this.currentChat.role && group.data.role) {
                            this.currentChat.role = group.data.role;
                        }
                        // console.log('锁定了吗3333',group.data)
                        this.currentChatData.isBacklock = group.data && group.data.s == 1 ? false : true;
                        this.currentChat.nickname = group.data
                            && group.data.member
                            && group.data.member.nickname
                            ? group.data.member.nickname
                            : ""
                        if (group.data.member) {
                            this.currentChatData.role = Number(group.data.member.role);
                        }
                    } else {
                        // console.log('user-getUserOrGroupInfo->', group);
                    }
                } else {
                    this.currentChatData.remarkName = _chatItem.remarkName || '';
                    const user = await imsdk.getUser(_chatItem.id);
                    //判断当前聊天是否变化
                    // console.log('用户上线时间：', JSON.stringify(user), '最后上线时间：', Utils.getTimeText(user.data.showLastLoginTime, 1, 1))
                    if (this.currentChatData.id != _chatItem.id) {
                        return
                    }
                    // console.log('请求用户信息');--2

                    if (user.resultCode == 1 && user.data) {
                        _chatItem.desc = Utils.getTimeText(user.data.showLastLoginTime, 1, 1) + '上线';
                        this.currentChatData.onlinestate = user.data.onlinestate
                        this.currentChatData.loginIp = user.data.loginIp
                        this.currentChatData.locationInfo = user.data.locationInfo
                        // 描述
                        this.currentChatData.loginTime = user.data.loginLog.loginTime
                        this.currentChatData.offlineTime = user.data.loginLog.offlineTime
                        this.currentChatData.offlineDate = moment(user.data.loginLog.offlineTime * 1000).format('YYYY-MM-DD HH:mm')
                        this.currentChatData.loginDate = moment(user.data.loginLog.loginTime * 1000).format('YYYY-MM-DD HH:mm')
                        // 最后格式化上线时间
                        this.currentChatData.loginTimeFormat = Utils.getDifferenceTime(user.data.loginLog.loginTime, 1);
                        // 最后离线格式时间
                        this.currentChatData.offlineTimeFormat = Utils.getDifferenceTime(user.data.loginLog.offlineTime, 1);
                        const friendData = user.data.friends;
                        // console.log('user-getUserOrGroupInfo->', friendData);
                        if (friendData) {
                            let remarkName = friendData.remarkName || '';
                            this.currentChatData.describe = friendData.describe || ''
                            friendStore.changeRemark(friendData.toUserId, remarkName);
                            if (_chatItem.remarkName != remarkName) {
                                this.currentChatData.remarkName = remarkName;
                            }
                            // if(friendData.status!=2){
                            //     friendStore.addDefaultFriend(_chatItem.id);
                            // }

                        }
                    } else {
                        // console.log('user-getUserOrGroupInfo->', user);
                    }
                    // console.log(user, ' 获取用户|群信息');
                }
                eventBus.emit('timeUpdate')
            }
        } catch (e) {
            console.log('getUserOrGroupInfo--------挂掉了');

        }

    }
    @action changeUserTime = async (key: string, value: any) => {
        this.currentChatData[key] = value;
    }
    groupStatusTypeWithServerKey = {
        msgTalkTime: 'talkTime',
        allowFriends: 'allowSendCard',
        groupInvitNeedTest: 'isNeedVerify',
    }
    //默认禁止时间
    forbitTime = 1000 * 60 * 60 * 24 * 7;
    //禁言 进群验证 好友聊天 请求
    @action changeGroupStatusWithServer = async (type: string) => {
        this.changeGroupStatus(type);
        let updateResult = this.groupControlState.get(type) ? 1 : 0;


        if (type == 'msgTalkTime') {
            updateResult = this.groupControlState.get(type) ? this.forbitTime : 0
        }
        const res = await imsdk.updateGroupState(this.currentChatData.gid, this.groupStatusTypeWithServerKey[type], updateResult + ''),
            isOk = res && res.resultCode == 1
        if (!isOk) {
            this.changeGroupStatus(type);
        }

        return isOk
    }
    @action changeGroupStatus = (type: string, value?: number | boolean) => {
        if (value != undefined) {
            this.groupControlState.set(type, value);
            return;
        }
        if (this.groupControlState.get(type)) {
            this.groupControlState.set(type, typeof this.groupControlState.get(type) == 'number' ? 0 : false);
        } else {
            this.groupControlState.set(type, typeof this.groupControlState.get(type) == 'number' ? this.forbitTime : true);
        }
    }

    /**发送已读回执 */
    @action sendMessagesReadReceipt = (_chat: ChatItem) => {
        if (!_chat) {
            return;
        }
        if (this.currentChatData.id != _chat.id || _chat.id === '') {
            return
        }
        if ((systemStore.isOpenGroupOwnerRead == 0 && _chat.type) || _chat.role == 1 || !isOpenRead) {
            this.unReadMsgs.delete(_chat.id + '');
            return;
        }


        let existUnReadMsg: MessageItem[] | undefined = this.unReadMsgs.get(_chat.id + '');
        let msgIds = '';
        if (existUnReadMsg && !systemStore.ismin) {

            existUnReadMsg.map((item, index: number) => {
                if (!item.isRead) {
                    //给服务器发送已读回执
                    if (item.chatType && item.chatType != 'groupchat')
                        webIM.sendMessageRead(item.fromUserId, item.from, item.messageId);
                    else {
                        let groupOwerId = groupStore.getOwerId(_chat.id);
                        if (groupOwerId == item.fromUserId)
                            msgIds += (item.messageId + ',')
                    }

                }
            });
            if (msgIds !== '')
                imsdk.reportReadMsg(this.currentChatData.gid, msgIds)

            this.unReadMsgs.delete(_chat.id + '');
        }
    }

    //设置未读状态
    @action setUnRendMsgStatus = (msgStatus: { string: MessageItem[] }) => {
        for (let key in msgStatus) {
            const existStatus = this.unReadMsgs.get(key + '');
            if (existStatus) {
                let existArray = existStatus.slice();
                existArray = existArray.concat(msgStatus[key]);
                this.unReadMsgs.set(key + '', existArray);
            } else {
                this.unReadMsgs.set(key + '', msgStatus[key]);
            }
        }
    }


    //设置消息读取状态
    @action setMsgSendStatus = (msgStatus: any) => {
        this.messageStatus = msgStatus;
    }

    tranUnreadMsgs = () => {
        let retData = {}
        this.unReadMsgs.forEach((msgs, key) => {
            if (msgs) {
                retData[key] = msgs.map(item => {
                    return { from: item.from, messageId: item.messageId }
                })
            }
        })
        return retData;
    }
    getChatItemById = (_id: string): ChatItem | undefined => {
        return this.chats.find((item: any) => {
            return item.id == _id;
        })
    }



    /**批量插入数据  (目前未用)*/
    @action batchCreateMsg = (msgs: MessageItem[], msgMap: Map<string, MessageItem[]>) => {

        let chatSet: Set<any> = new Set();
        msgs.map((item: MessageItem) => {
            let chatItem;
            if (item.fromUserId && item.fromUserId == webIM.userId && !Utils.isGroup(item.toUserId)) { //消息同步时 ，不同设备的消息
                chatItem = this.getChatItemById(item.toUserId);
            } else if (item.chatType == ChatType.GROUPCHAT && item.fromUserId != '10000') {
                chatItem = this.getChatItemById(item.toUserId);
            } else {
                item.chatType = (Utils.isGroup(item.jid || item.fromUserId) ? "groupchat" : "chat");
                chatItem = this.getChatItemById(item.jid || item.fromUserId);
            }
            if (chatItem) {
                chatItem.lastTime = item.timeSend;
                // this.addMessage(chatItem.id, item);
            } else {
                let entity: FriendItem | GroupItem | undefined;
                if (item.fromUserId && item.fromUserId == webIM.userId && !Utils.isGroup(item.toUserId)) {
                    entity = groupStore.getGroupByJid(item.toUserId);
                }
                else if (item.chatType == ChatType.GROUPCHAT) {
                    entity = groupStore.getGroupByJid(item.jid || item.toUserId);
                } else {
                    entity = friendStore.getFriendById(item.fromUserId);
                }
                if (entity) {
                    chatItem = ChatItem.getChatItem(entity);
                    chatSet.add(chatItem);
                }
            }

            // TODO 处理撤回消息,可能还需要删除数据

            // console.log('收到撤回消息', message.type);

            if (MessageType.REVOKE == item.type) {
                item.messageId = item.content;
                item.contentType = item.type;
                if (webIM.userId == item.fromUserId) {
                    item.content = '你撤回了一条消息'
                } else {
                    item.content = `${item.fromUserName} 撤回了一条消息`
                }
            }

            this.messageStatus.set(item.messageId, MessageStatusType.sent);

            //TODO 判断是不是自己
            // const isMyIdSendMes = item.fromUserId == systemStore.userId;

            // if (isMyIdSendMes && !isMyself) {
            //     this.messageStatus.set(item.messageId, MessageStatusType.sent);
            // }


            // if (chatItem && this.currentChatData.id == chatItem.id) {
            //     // 此处离线消息，也需要设为已读
            //     if (item.chatType != "groupchat") {
            //         webIM.sendMessageRead(item.fromUserId, item.from, item.messageId);
            //     }
            // } else {
            //     if (chatItem) {
            //         let existUnReadMsg: MessageItem[] | undefined = this.unReadMsgs.get((chatItem as ChatItem).id + '');
            //         if (existUnReadMsg) {
            //             this.unReadMsgs.set(chatItem.id + '', [...existUnReadMsg, item]);
            //         } else {
            //             this.unReadMsgs.set(chatItem.id + '', [item])
            //         }
            //     }
            // }
            if (chatItem) {
                let content = '';
                // 群控制消息 type 类型都在 contentType里面 正常消息
                let targetType = item.type;
                if ((item.contentType && item.contentType && item.chatType == ChatType.GROUPCHAT) || item.contentType == MessageType.REVOKE) {
                    targetType = item.contentType;
                }
                if (targetType) {
                    if (targetType == MessageType.TEXT || targetType == MessageType.TEXT_REPLY) {

                        // console.log('密9999 batchCreateMsg');
                        content = webIM.decryptMessage(item);
                    } else {
                        if (MessageTypeWithSubName[targetType]) {
                            content = MessageTypeWithSubName[targetType];
                        } else {
                            content = "收到一条消息，请在手机查看";
                        }
                    }
                }
                chatItem.lastContent = Utils.htmlRestore(content);
                //@人的消息类型 必须是 文字类型
                if (item.objectId && item.toUserId != this.currentChatData.id && item.type == MessageType.TEXT) {
                    if (item.objectId == chatItem[mentionsAllKey]) {
                        chatItem.mentionText = '@全体成员';
                    } else {
                        if (item.objectId.indexOf(systemStore.userId) > -1) {
                            chatItem.mentionText = '有人@你';
                        }
                    }
                }
            }

            if (chatItem) {
                let msgValue = msgMap.get(chatItem.id);
                if (msgValue) {
                    msgValue.push(item);
                } else {
                    msgMap.set(chatItem.id, [item])
                }
            }

            return chatItem;
        });

        this.batchAddToChats(Array.from(chatSet));
        this.batchAddMessage(msgMap);

    }
    /** 获取选中项的本地数据库数据、和网络数据  (目前未用)*/
    getNewChatDBAndNetData = async (_id: any) => {

        let isGroup = false;
        if (Utils.isGroup(_id)) {
            isGroup = true;
        }
        let findData = await find({ fromUserId: _id, _sortField: 'timeSend', _currentPage: 0, _pageNum: 1000, _desc: -1, isGroup, myUserId: webIM.userId });

        if (findData) {

            // console.log('密000000 getNewChatDBAndNetData');
            findData.map((item: any) => {
                item.content = webIM.decryptMessage(item);
                // console.log('getNewChatDBAndNetData item.type---->',item.content);

            });
            this.messageData.set(_id, findData);
        } else {
            this.messageData.set(_id, []);
        }
        // await this.getOffsetMsg(_id);
    }


    /**批量添加消息 */
    @action batchAddMessage = (msgMap: Map<string, MessageItem[]>) => {
        msgMap.forEach((items: MessageItem[], key: string) => {
            let msgs = this.messageData.get(key);
            if (msgs) {
                let mlist = msgs.slice();
                mlist = mlist.concat(items);
                mlist = _.sortBy(mlist, "timeSend");
                mlist = _.uniq(mlist, true, info => { return info.messageId });
                this.messageData.set(key, mlist);
            } else {
                let itemsA = _.sortBy(items, "timeSend");
                let itemsB = _.uniq(itemsA, true, info => { return info.messageId });
                this.messageData.set(key, itemsB);
            }
        })
        //此处需要更新列表
        // listForceUpdate.updateChatList();
        // // 判断发送的消息 是不是相同id 发送的
        // const isMyIdSendMes = message.fromUserId == systemStore.userId;

        // if (isMyIdSendMes && !isMyself) {
        //     this.messageStatus.set(message.messageId, MessageStatusType.sent);
        // }
    }

    //添加聊天列表
    @action batchAddToChats = (_chatItem: any[]) => {

        if (_chatItem.length > 0) {
            this.chats.unshift(..._chatItem);
        }

        let _chats = _.uniq(this.chats.slice(), false, (item: ChatItem) => { return item.id });
        this.chatSort(_chats);
    }

    /**
     * 创建新会话 by last Data
     * @msg 单个消息
     */
    @action updateChatlistMyLastmes = (msg: MessageItem) => {
        if (!msg) {
            return
        }
        const isMesFromMe = msg.fromUserId == systemStore.userId;
        const userId = isMesFromMe ? msg.toUserId || msg.to : msg.fromUserId || msg.from;
        let chatItem;
        if (msg.chatType == ChatType.CHAT) {
            chatItem = this.getChatItemById(userId);
        } else {
            msg.chatType = msg.chatType ? msg.chatType : (Utils.isGroup(msg.jid || userId) ? "groupchat" : "chat");
            chatItem = this.getChatItemById(msg.jid || userId);
        }
        if (chatItem) {
            if (chatItem.lastContent == notShowContent) {
                return;
            }
            chatItem.lastTime = msg.timeSend;
        } else {
            let entity: FriendItem | GroupItem | undefined;
            if (msg.chatType == ChatType.GROUPCHAT) {
                entity = groupStore.getGroupByJid(msg.jid || msg.toJid || userId);
            } else {
                entity = friendStore.getFriendById(userId);
            }
            if (entity) {
                chatItem = ChatItem.getChatItem(entity);
                chatItem.lastTime = msg.timeSend;
            }
        }
        if (chatItem) {
            let content = '';
            // 群控制消息 type 类型都在 contentType里面 正常消息
            let targetType = msg.type;
            // let targetType = item.contentType;
            if ((msg.contentType && msg.contentType && msg.chatType == ChatType.GROUPCHAT) || msg.contentType == MessageType.REVOKE || msg.contentType == MessageType.DOUBLE_WITHDRAW) {
                targetType = msg.contentType;
            }
            if (targetType) {
                if (targetType == MessageType.TEXT) {
                    content = msg.content;
                } else {
                    if (MessageTypeWithSubName[targetType]) {
                        content = MessageTypeWithSubName[targetType];
                    } else {
                        content = "收到一条消息，请在手机查看";
                    }
                }
            }
            //过滤消息特殊字符
            chatItem.lastContent = Utils.htmlRestore(content);
            // 设置消息类型
            chatItem.contentType = msg.type

            //@人的消息类型 必须是 文字类型
            if (msg.objectId && msg.toUserId != this.currentChatData.id && msg.type == MessageType.TEXT) {
                if (msg.objectId == chatItem[mentionsAllKey]) {
                    chatItem.mentionText = '@全体成员';
                } else {
                    if (msg.objectId.indexOf(systemStore.userId) > -1) {
                        chatItem.mentionText = '有人@你';
                    }
                }
            }
            this.addToChats(chatItem);
        }
    }

    /**
     * 通过消息 创建 会话列表
     */
    // todo  消息列表  1、单聊 找到单聊的这个人 FriendItem 2、群聊 GroupItem
    @action createChatItemsByMsgs = (msgs: MessageItem[], ignore: boolean = false) => {
        let chatItem: any;
        msgs.map(item => {
            if (item.contentType === MessageType.DOUBLE_WITHDRAW) {
                item.content = ''
            }

            //在线xmpp推送的消息直接有了消息类型

            // if (item.type == MessageType.NEW_MEMBER)
            // console.log('获得群控制消息群消息-->', item);

            if (item.chatType == ChatType.GROUPCHAT) {
                chatItem = this.getChatItemById(item.toUserId || item.from);
            } else {
                item.chatType = item.chatType ? item.chatType : (Utils.isGroup(item.jid || item.fromUserId) ? "groupchat" : "chat");
                chatItem = this.getChatItemById(item.jid || item.fromUserId);

            }
            // console.log('获得群控制消息新增列表', chatItem, item,groupStore.groupList);
            if (chatItem) {
                chatItem.lastTime = item.timeSend;
                this.addToChats(chatItem);
                this.addMessage(chatItem.id, item);
            } else {

                let entity: FriendItem | GroupItem | undefined;
                if (item.chatType == ChatType.GROUPCHAT) {
                    entity = groupStore.getGroupByJid(item.jid || item.toUserId);
                } else {
                    entity = friendStore.getFriendById(item.fromUserId);
                }
                // console.log('获得群控制消息新增列表4444', entity);
                if (entity) {
                    chatItem = ChatItem.getChatItem(entity);
                    chatItem.lastTime = item.timeSend;
                    this.addToChats(chatItem);
                    this.addMessage(chatItem.id, item);
                } else {
                    //处理默认好友发来的消息
                    // if (item.contentType) return;
                    if (item.chatType == ChatType.CHAT) {
                        chatItem = ChatItem.getChatItem(item);
                        chatItem.id = item.fromUserId;
                        chatItem.name = item.fromUserName ? item.fromUserName : '';
                        chatItem.type = ChatGrOrFrType.friend;
                        chatItem.lastContent = item.content ? item.content : '';
                        chatItem.lastTime = item.timeSend ? item.timeSend : new Date().getTime() + '';
                        // this.addToChats(chatItem);
                        // this.addMessage(chatItem.id, item);
                        friendStore.addDefaultFriend(item.fromUserId, item);
                    }


                }
            }
            // 处理聊天列表内容
            if (chatItem) {
                //处理已读消息
                let existUnReadMsg: MessageItem[] | undefined = this.unReadMsgs.get((chatItem as ChatItem).id + '');
                if (existUnReadMsg) {
                    existUnReadMsg.push(item);
                    this.unReadMsgs.set(chatItem.id + '', existUnReadMsg);
                } else {
                    chatItem && this.unReadMsgs.set(chatItem.id + '', [item]);
                }
                this.sendMessagesReadReceipt(this.currentChatData);

                //群控消息转换
                let content = '';
                // 群控制消息 type 类型都在 contentType里面 正常消息
                let targetType = item.type;
                // let targetType = item.contentType;
                if ((item.contentType && item.contentType && item.chatType == ChatType.GROUPCHAT) || item.contentType == MessageType.REVOKE || item.contentType == MessageType.DOUBLE_WITHDRAW) {
                    targetType = item.contentType;
                }
                if (targetType) {
                    if (targetType == MessageType.TEXT || targetType == MessageType.TEXT_REPLY) {
                        content = item.content;
                    } else {
                        const _type = targetType == MessageType.TIP && item.contentType ? item.contentType : targetType;
                        if (MessageTypeWithSubName[_type]) {
                            content = MessageTypeWithSubName[_type];
                        } else {
                            content = "收到一条消息，请在手机查看";
                        }
                    }
                }
                //过滤消息特殊字符
                chatItem.lastContent = Utils.htmlRestore(content);

                //@人的消息类型 必须是 文字类型
                if (item.objectId && item.toUserId != this.currentChatData.id && item.type == MessageType.TEXT) {
                    if (item.objectId == chatItem[mentionsAllKey]) {
                        chatItem.mentionText = '@全体成员';
                    } else {
                        if ((item.objectId + "").indexOf(systemStore.userId) > -1) {
                            chatItem.mentionText = '有人@你';
                        }
                    }
                }
                //------------消息免打扰不弹窗--------------------------
                const targetChat = this.chats.find(item => item.id == item.id);
                if (targetChat) {
                    if (!targetChat.isNotice && !ignore) {
                        this.playAudio()
                        ipcRender.showMessageNotification({ title: item.fromUserName, body: content })
                    }
                }

            }

        })
        if (chatItem && chatItem.isTop) {
            return;
        }
        this.chatSort();
    }


    checkInSelectedItem = (_msg: MessageItem) => {
        let chatId = '';
        if (_msg.chatType == ChatType.GROUPCHAT) {
            chatId = _msg.toUserId || _msg.from;
        } else {
            chatId = _msg.jid || _msg.fromUserId;
        }
        if (chatId) {
            let msgs = this.messageData.get(chatId);
            if (msgs) {
                let exitObj = msgs.findIndex(item => { return item.messageId == _msg.messageId });
                if (exitObj != -1) {
                    return true;
                } else {
                    return false;
                }
            } else {
                return false;
            }
        } else {
            return false;
        }
    }


    // todo  其他设备我发的消息
    @action createRemoteChatItemsByMsgs = (msgs: MessageItem[]) => {
        let chatItem: any;
        msgs.map(item => {

            //在线xmpp推送的消息直接有了消息类型

            // console.log('远程消息--------------------------', msgs);

            let id = ''
            if (item.chatType == ChatType.GROUPCHAT) {
                chatItem = this.getChatItemById(item.fromUserId);
            } else {
                item.chatType = (Utils.isGroup(item.jid || item.fromUserId) ? "groupchat" : "chat");

                if (item.from.includes(item.fromUserId) && item.to.includes(item.fromUserId)) {
                    id = item.toUserId;
                } else {
                    id = item.fromUserId;
                }
                chatItem = this.getChatItemById(item.jid || id);
            }

            //TODO 获取多端同步消息的话更新响应的值

            if (chatItem) {
                chatItem.lastTime = item.timeSend;
                this.addMessage(chatItem.id, item);
            } else {
                let entity: FriendItem | GroupItem | undefined;
                if (item.chatType == ChatType.GROUPCHAT) {
                    entity = groupStore.getGroupByJid(item.jid);
                } else {
                    entity = friendStore.getFriendById(item.jid || id);
                }
                if (entity) {
                    chatItem = ChatItem.getChatItem(entity);
                    chatItem.lastTime = item.timeSend;
                    this.addToChats(chatItem);
                    this.addMessage(chatItem.id, item);
                } else {
                    if (item.chatType == ChatType.CHAT) {
                        // console.log('默认好友消息',item,ignore)
                        chatItem = ChatItem.getChatItem(item);
                        chatItem.id = item.fromUserId;
                        chatItem.name = item.fromUserName ? item.fromUserName : '';
                        chatItem.type = ChatGrOrFrType.friend;
                        chatItem.lastContent = item.content ? item.content : '';
                        chatItem.lastTime = item.timeSend ? item.timeSend : new Date().getTime() + '';
                        // this.addToChats(chatItem);
                        // this.addMessage(chatItem.id, item);
                        friendStore.addDefaultFriend(item.fromUserId, item);
                    }
                }
            }

            if (chatItem) {
                //处理已读消息
                let existUnReadMsg: MessageItem[] | undefined = this.unReadMsgs.get((chatItem as ChatItem).id + '');
                if (existUnReadMsg) {
                    existUnReadMsg.push(item);
                    this.unReadMsgs.set(chatItem.id + '', existUnReadMsg);
                } else {
                    chatItem && this.unReadMsgs.set(chatItem.id + '', [item]);
                }
                this.sendMessagesReadReceipt(this.currentChatData);

                //群控消息转换
                let content = '';
                // 群控制消息 type 类型都在 contentType里面 正常消息
                let targetType = item.type;
                // let targetType = item.contentType;
                if ((item.contentType && item.contentType && item.chatType == ChatType.GROUPCHAT) || item.contentType == MessageType.REVOKE || item.contentType == MessageType.DOUBLE_WITHDRAW) {
                    targetType = item.contentType;
                }
                if (targetType) {
                    if (item.type == MessageType.TEXT || item.type == MessageType.TEXT_REPLY) {
                        content = item.content;
                    } else {
                        const _type = targetType == MessageType.TIP && item.contentType ? item.contentType : targetType;
                        if (MessageTypeWithSubName[_type]) {
                            content = MessageTypeWithSubName[_type];
                        } else {
                            content = '发送一条消息，请在手机查看';
                        }
                    }
                }
                chatItem.lastContent = Utils.htmlRestore(content);
                //------------消息免打扰不弹窗--------------------------
                const targetChat = this.chats.find(item => item.id == item.id);
                if (targetChat) {
                    if (!targetChat.isNotice) {
                        this.playAudio()
                        ipcRender.showMessageNotification({ title: item.fromUserName, body: content })
                    }
                }
            }

        })
        if (chatItem && chatItem.isTop) {
            return;
        }
        this.chatSort();
    }

    //删除当前聊天好友
    @action delCrrentChatFriend = async () => {
        let cid = this.currentChat.id;
        const currentChatIndex = this.chats.findIndex(item => item.id == this.currentChat.id);
        if (currentChatIndex > -1) {
            const currentChat = this.chats[currentChatIndex];
            const result = await imsdk.delFriend('friends/delete', cid, {});

            if (result.resultCode == 1) {
                // debugger
                const type = MessageType.DELALL;
                let msg = webIM.createMessage(type, "", cid, name);
                webIM.sendMessage(msg, currentChat.id);
                deviceManager.sendUpdateDelectFriendMsg();//多端同步
                friendStore.removeFriend(Number(cid));
                this.chats.splice(currentChatIndex, 1);

                requestStore.requestList.replace(requestStore.requestList.filter(item => { return item.toUserId != cid; }))
                // console.log('当前的对象111',currentChat)
                this.cleanChatMess(cid, true);
                //  console.log( requestStore.requestList,"--------------------------requestStore.requestList");
                this.currentChatData = this.currentChatInitData;
                mainStore.initChatDetail()
            } else {
                message.error(result.resultMsg ? result.resultMsg + "" : '删除失败')
                if (friendStore.getFriendById(cid)) {
                    friendStore.removeFriend(Number(cid));
                }
                this.chats.splice(currentChatIndex, 1);

                requestStore.requestList.replace(requestStore.requestList.filter(item => { return item.toUserId != cid; }))
                //  console.log( requestStore.requestList,"--------------------------requestStore.requestList");
                this.currentChatData = this.currentChatInitData;
                mainStore.initChatDetail()
            }
        }
    }
    //离开当前群
    @action exitGroup = () => {
        const currentChatIndex = this.chats.findIndex(item => item.id == this.currentChat.id);
        if (currentChatIndex > -1) {
            const currentChat = this.chats[currentChatIndex]
            this.chats.splice(currentChatIndex, 1);
            this.currentChatData = this.currentChatInitData;
            mainStore.initChatDetail();
            groupStore.delGroup(currentChat.gid);
            imsdk.exitGroup('room/member/delete', currentChat.gid, {});
        }
    }
    //解散当前群
    @action delGroup = async (roomid: string) => {

        let res = await imsdk.delGroup(roomid);
        if (res && res.resultCode == 1) {
            if (this.currentChatData && this.currentChatData.id == roomid) {
                mainStore.detailType = detailType.none;
            }

            groupStore.delGroup(roomid);
            // this.delChat(roomid);

            let chats = this.chats.slice().filter(item => { return item.gid != roomid });
            this.setChats(chats);
            this.currentChatData = this.currentChatInitData;
            // mainStore.initChatDetail()
        }

    }


    @action removeLocalGroupAndChat = (roomid: string) => {
        if (this.currentChatData && this.currentChatData.id == roomid) {
            mainStore.detailType = detailType.none;
        }
        groupStore.delGroupByJid(roomid);
        let chats = this.chats.slice().filter(item => { return item.id != roomid });
        this.setChats(chats);
    }

    @action chatSortFun = (_chats?: ChatItem[]) => {
        // console.log('排序',new Date());
        let list: ChatItem[] = _chats ? _chats : this.chats.slice();

        list.sort((a: ChatItem, b: ChatItem) => {
            if (a.isTop && !b.isTop) {
                return -1;
            }
            else if (b.isTop && !a.isTop) {
                return 1;
            }
            else if (b.isTop && a.isTop) {
                return 0;
            }

            if (!a.lastTime && b.lastTime) {
                return 1;
            }
            else if (!b.lastTime && a.lastTime) {
                return -1;
            }
            else if (!a.lastTime && !b.lastTime) {
                return a.name > b.name ? 1 : -1;
            }

            else if (a.lastTime > b.lastTime) {
                return -1;
            }
            else if (a.lastTime < b.lastTime) {
                return 1;
            }

            return a.name > b.name ? 1 : -1;
        })
        this.chats.replace(list);
    }
    //修改为右侧 新好友列表
    @action goNewFriend = () => {
        mainStore.changeShowDetailType(detailType.newFriend)
    }
    //群修改昵称
    @action groupChangeNick = async (nickname: string, notToServer?: boolean) => {
        this.currentChatData.nickname = nickname ? nickname : systemStore.nickname;
        groupStore.changeRemark(this.currentChatData.id, nickname);
        // console.log('this.currentChatData.nickname', this.currentChatData.nickname);
        if (!notToServer) {
            await imsdk.changeGrNickname(nickname, this.currentChatData.gid);
        }

    }

    @action updateFriendTags = async (data: {
        tags: string
    }) => {
        const res = await imsdk.changeFriendTags(data.tags, this.currentChatData.id)
        if (res && res.resultCode == 1) {
            // this.currentChatData.tags = data.tags.split(',')
            // 更改
            message.success('修改成功')
            return true
        } else {
            message.error('修改失败')
            return false
        }
    }

    @action getTagsData = async () => {
        const res = await imsdk.getFriendTagsById();
        const ls = (res.data || []).filter((i: any) => i.userIdList.includes(this.currentChatData.id))
        return {
            selectTags: ls,
            allTags: res.data || []
        }
    }

    @action addTagsData = async(name: string) => {
        const res = await imsdk.addFrendTags(name, this.currentChatData.id)
        return res
    }

    //好友修改备注 和标签
    @action friendChangeMark = async (data: {
        remarkName: string
        desc: string
    }) => {
        const res = await imsdk.changeFriMarkName(data.remarkName, this.currentChatData.id, data.desc);

        if (res && res.resultCode == 1) {
            const targetChat = this.chats.find(item => item.id == this.currentChatData.id);
            if (targetChat) {
                targetChat.remarkName = data.remarkName;
                this.chatSort();
            }
            // 更改
            this.currentChatData.describe = data.desc
            friendStore.changeRemark(this.currentChatData.id, data.remarkName)
            message.success('修改成功')
        } else {
            message.error('修改失败')
        }

    }
    //修改 群名称
    @action changeGrName = async (grName: string) => {

        let gid = this.currentChatData.id;
        const res = await imsdk.changeGrName(this.currentChatData.gid, grName);
        if (res && res.resultCode == 1) {

            if (this.currentChatData.id == gid) {
                this.currentChatData.name = grName
            }
            groupStore.changeGroupName(gid, grName);

            return true
        } else {
            return false
        }
    }

    //群验证结果
    @action getGroupVerification = async (mes: MessageItem) => {

        return mes.verification;

    }

    @action setGroupVerification = async (mes: MessageItem, verification: number) => {
        // console.log(mes, "-----------------------------------");
        isOpenDB && updateMessageVerification(mes.messageId, verification);
        return mes.verification = verification;

    }
    //删除本地聊天消息
    @action delLocalMes = async (mes: MessageItem, chatId?: string) => {
        const _chatId = chatId ? chatId + '' : mes.toUserId == systemStore.userId ? mes.fromUserId + '' : mes.toUserId + '';
        let tMessageData = this.messageData.get(_chatId + '');
        // console.log('删除消息', tMessageData,mes,this.messageData,_chatId);
        if (!tMessageData) {
            let idT: any = Number(_chatId)
            tMessageData = this.messageData.get(idT)
        }
        if (tMessageData) {
            tMessageData = tMessageData.filter(item => item.messageId != mes.messageId);
            // console.log('删除消息结束2', tMessageData);
            this.messageData.set(_chatId, tMessageData);
            isOpenDB && delMessageBy(mes.messageId);
            mesDataCache.deleteMes(mes);

        }
    }

    //后台只给消息id撤回消息
    @action delLocalMesByMessageID = async (mes: MessageItem, chatId?: string) => {
        const _chatId = chatId ? chatId + '' : mes.toUserId == systemStore.userId ? mes.fromUserId + '' : mes.toUserId + '';
        let tMessageData = this.messageData.get(_chatId + '');
        // console.log('删除消息', tMessageData,mes,this.messageData,_chatId);
        if (!tMessageData) {
            let idT: any = Number(_chatId)
            tMessageData = this.messageData.get(idT)
        }
        if (tMessageData) {
            tMessageData = tMessageData.filter(item => item.messageId != mes.messageId);
            // console.log('删除消息结束2', tMessageData);
            this.messageData.set(_chatId, tMessageData);
            isOpenDB && delMessageBy(mes.messageId);
            mesDataCache.deleteMes(mes);

        }

    }

    selMesWithLocal = (mes: MessageItem) => {
        const idChat = this.currentChatData.id;
        let tMessageData = this.messageData.get(idChat + '');
        if (!tMessageData) {
            let idT: any = Number(idChat) == 0 ? Number(mes.fromUserId) : Number(idChat)
            tMessageData = this.messageData.get(idT)
        }
        if (tMessageData) {
            tMessageData = tMessageData.filter(item => item.messageId != mes.messageId);
            this.messageData.set(idChat + '', tMessageData);
        } else {
            console.warn('删除本地消息失败')
        }
    }
    //删除聊天消息 del:1 单向 2双向
    @action delMes = async (mes: MessageItem, del: number, opendRead: boolean) => {
        const idChat = this.currentChatData.id;
        let tMessageData = this.messageData.get(idChat + '');
        if (!tMessageData) {
            let idT: any = Number(idChat) == 0 ? Number(mes.fromUserId) : Number(idChat)
            tMessageData = this.messageData.get(idT + '')
        }
        if (tMessageData) {
            tMessageData = tMessageData.filter(item => item.messageId != mes.messageId);
            if (idChat) {
                imsdk.deleteMsg(this.currentChatData.type == ChatGrOrFrType.group ? 2 : 1, del, mes.messageId, idChat);
                // if ( opendRead) {
                if (del == 1) {
                    this.updateMes('你删除一条消息', webIM.getServerTime() + '', idChat)
                    // this.currentChatData.lastContent = '你删除一条消息';
                } else if (del == 2) {
                    const msg = webIM.createMessage(202, mes.messageId);
                    msg.chatType = this.currentChatData.type == ChatGrOrFrType.group ? 'group' : 'chat';
                    msg.to = idChat;
                    if (msg.chatType != 'chat') {
                        msg.toJid = idChat;
                    }
                    msg.toUserName = this.currentChatData.name;
                    this.updateMes('你撤回一条消息', webIM.getServerTime() + '', idChat)
                    // this.currentChatData.lastContent = '你撤回一条消息';
                    webIM.sendMessage(msg, '', true);
                    // console.log('撤回的消息',msg);
                    if (msg.chatType == 'chat') {
                        // console.log('撤回的消息', msg);
                        const _msg = { ...msg, contentType: 202, type: 10, content: '你撤回一条消息' };
                        tMessageData.push(_msg);
                        _msg && mesDataCache.addmes(_msg, idChat);
                    }
                }
                this.messageData.set(idChat + '', tMessageData);
            }
            // else {
            //     // message.warn('撤回失败');
            //     this.messageData.set(idChat + '', tMessageData);
            // }
            // } else {
            //     let tar: any = Number(mes.fromUserId)
            //     this.messageData.set(tar, tMessageData);
            // }
            mesDataCache.deleteMes(mes);
            isOpenDB && delMessageBy(mes.messageId);
        }
    }

    //撤回聊天消息
    @action withDrawMes = async (mes: MessageItem) => {
        this.delMes(mes, 2, false);
        // const msg = webIM.createMessage(202, mes.messageId);

    }
    //双向撤回消息
    @action doubledelMessage = async (roomid: string) => {

        // console.log('会话列表一项', chat, id)
        //   let res=
        let res = await imsdk.doubledeleteMessage(roomid);
        if (res.resultCode === 1) {
            //清除本地数据
            this.cleanChatMess(roomid, false);
        } else {
            message.error('清除失败')
        }

        // await imsdk.emptyMyMsg(id);
    }

    //删除会话列表一项
    @action delChart = async (chat: ChatItem) => {

        // let id: any = chat.type == ChatGrOrFrType.group ? chat.gid : chat.id;
        this.chats.replace(this.chats.filter(item => item.id != chat.id));
        if (this.currentChatData.id == chat.id) {
            this.currentChatData = this.currentChatInitData;
            mainStore.changeShowDetailType(detailType.none);
        }
        // console.log('会话列表一项', chat, id)
        await imsdk.deleteOneLastChat(chat.id);
        //清除本地数据
        this.cleanChatMess(chat.id, false);
        // await imsdk.emptyMyMsg(id);
    }
    //删除会话列表一项通过ID
    @action delChartByID = (id: string) => {
        if (this.currentChatData.id == id) {
            this.currentChatData = this.currentChatInitData;
            mainStore.changeShowDetailType(detailType.none)
        }
        this.chats.replace(this.chats.filter(item => item.id != id));
    }

    @action addGrop = (gim: GroupItem) => {
        this.addToChats(ChatItem.getChatItem(gim));
    }
    @action changeInfo = (info: string) => {
        this.currentChatData.desc = info
    }
    //发布 群公告
    @action updateGroupNotice = async (roomId: string, notice: string) => {

        const res = await imsdk.updateGroupNotice(roomId, notice);

        if (res && res.resultCode == 1) {

            // console.log(res,'---updateGroupNotice--------');

            this.currentChatData.name = roomId
            return true
        } else {
            return false
        }

    }
    // 更改当前聊天 的 备注名
    @action changeCurrentMark = (markName: string) => {
        this.currentChatData.remarkName = markName;
    }


    //添加表情/收藏
    @action addImog = async (url: string, content: string) => {
        // let arry = new Array();
        let item = {
            type: "6",
            msg: (url),
            url: (url)
        }
        let emoji = JSON.stringify(item);

        let res = await imsdk.addImog(emoji);
        if (res && res.resultCode == 1) {
            message.success('添加成功')
        } else {
            let messageEro = res.resultMsg ? res.resultMsg : '添加失败'
            message.error(messageEro)
        }
    }

    //详情返回 清除当前聊天数据
    @action detailBack = () => {
        this.currentChatData = this.currentChatInitData;
        mainStore.changeShowDetailType(detailType.none)
    }

    // 更新会话最新消息
    @action updateChatContent = (chatId: string, content: string) => {
        if (!chatId) {
            return;
        }
        const targetIndex = this.chats.findIndex(item => item.id == chatId);
        if (targetIndex > -1) {
            // console.log('更新一条会话列表内容',targetIndex,content);
            this.chats[targetIndex].lastContent = content;
        }
    }

    //清空会话的消息数据
    @action cleanChatMess = (chatId: string, isSendEmptyMyMsg: boolean, isDoubleDele?: boolean) => {
        const mess = this.messageData.get(chatId + '');
        if (mess) {
            this.messageData.set(chatId + '', []);
            this.updateChatContent(chatId, '');
            mesDataCache.delMessByChatId(chatId);
            isOpenDB && delMessageByChatId(chatId);
            if (isSendEmptyMyMsg) {
                imsdk.emptyMyMsg(chatId + '');
            }
        } else {
            if (isDoubleDele) {
                mesDataCache.delMessByChatId(chatId);
                isOpenDB && delMessageByChatId(chatId);
            }
        }
    }
    //普通成员签到或查询积分
    @action getIntegration = async (content: string) => {
        if (content.trim() == '签到') {
            //用于群成员签到，查看积分
            const res = await imsdk.setIntegration(1, this.currentChatData.gid, '', '')
            if (res && res.resultCode == 1) {
                message.success('请求成功，请稍等')
            } else {
                message.warn('请求失败')
            }
        } else if (content.trim() == '积分') {
            const res = await imsdk.setIntegration(2, this.currentChatData.gid, '', '')
            if (res && res.resultCode == 1) {
                message.success('请求成功，请稍等')
            } else {
                message.warn('请求失败')
            }
        }
    }
    //根据发送特定字段管理员、群主控制积分
    /*
    content:发送的内容
    role:角色
    roomId：房间id
    uId:@那个人的id
    */
    @action setIntegration = async (content: string, ps: any[], uIds: string) => {
        if (this.currentChatData.role !== GroupMemRole.owner && this.currentChatData.role !== GroupMemRole.manage) {
            return
        }
        let parse = Utils.judgeIntegration(content, ps)

        if (!parse.res) {
            return
        }
        if (parse.content === '积分') {
            const res = await imsdk.setIntegration(3, this.currentChatData.gid, uIds, "0")

            if (res && res.resultCode == 1)
                message.success('请求成功，请稍等')
            else
                message.warn('请求失败')
        }
        //用于群管理、群组设置签到积分
        if (parse.content === '设置') {
            let fraction = parse.value
            const res = await imsdk.setIntegration(4, this.currentChatData.gid, uIds, fraction)

            if (res && res.resultCode == 1)
                message.success('请求成功，请稍等')
            else
                message.warn('请求失败')
        }
    }

    //获取群已读消息
    getReadInfo = async (msgid: string) => {
        const res = await imsdk.getUnreadInfo(this.currentChatData.gid, msgid)
        if (res && res.resultCode == 1 && res.data) {
            return res.data
        }
        else {
            message.warn('请求失败')
            return {
                unreadCount: 0,
                members: []
            };
        }

    }
    //更改未读数据计数
    @action changeMesUnReadNum = (mes: MessageItem) => {
        let currentId = mes.objectId;
        if (!currentId) return;
        let mesList = this.messageData.get(currentId);
        if (mesList) {
            const indexTar = mesList.findIndex(mesItem => mesItem.messageId == mes.content);
            if (indexTar > -1) {
                let groupNum = groupStore.getGroupMemberNum() - 1;
                if (!mesList[indexTar].unreadCount) {
                    mesList[indexTar].unreadCount = groupNum > 0 ? groupNum - 1 : 0;
                } else {
                    mesList[indexTar].unreadCount = mesList[indexTar].unreadCount > 0 ? mesList[indexTar].unreadCount - 1 : 0;
                }
                this.messageData.set(currentId, mesList);
            }
        }
    }
}
export default new ChatStore()