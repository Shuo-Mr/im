import systemStore, { SystemStore } from '../store/SystemStore';
import NetService from './NetService';
import { AxiosRequestConfig, Method } from 'axios';
import Utils from '../utils/utils';
// import { GroupItem } from '../interface/IGroup';
// import uuid from 'uuid';
import { UserSetting } from '../store/LoginStore';
import Axios from 'axios';
import chatStore from '../store/ChatStore'
import { MessageStatusType } from '../interface/IChat'



/**
 * 所有的http请求
 */
export class IMSDK {

    private _netService: NetService;
    constructor() {

        this._netService = NetService.getInstance(systemStore.prk, systemStore.puk, systemStore.apiKey, systemStore.appCID);
        // console.log('啥时候进来的的',this._netService)
    }
    reSetIMSDK = () => {
        this._netService = NetService.getInstance(systemStore.prk, systemStore.puk, systemStore.apiKey, systemStore.appCID);
    }

    setLogRepot = async (type: string, logContext: string): Promise<any> => {
        let path = '/logReport';
        let data: any = { type, logContext };
        data.apiURL = SystemStore.apiUrl;
        data = this._decorateData(data, path);
        let configRet = await this._netService.commonPost(path, data);
        return configRet;
    }


    getLocalPosition = async (_serviceKey: string, _position: number[]) => {

        let url = `http://restapi.amap.com/v3/geocode/regeo?key=${_serviceKey}&location=${_position.join()}&poitype=&radius=&extensions=base&batch=true&roadlevel=%22`

        let pos = await Axios.post(url);
        console.log('获取的位置信息', pos);
        return pos;

    }



    getThumbnailLocal = (_serviceKey: string, _position: number[]) => {
        let local: any = _position.join();
        let url = `https://restapi.amap.com/v3/staticmap?location=${local}&zoom=10&size=750*300&markers=mid,,A:${local}&key=${_serviceKey}`;

        console.log('获取缩略图--', url);

        return url;
    }
    //双向撤回
    doubledeleteMessage = async (id: string): Promise<any> => {

        let secret = systemStore.createOpenApiSecret(null);
        let path: string = `/tigase/delectRoomMsg?roomId=${id}&time=${secret.time}&access_token=${secret.access_token}&secret=${secret.secret}`;
        let configRet = await this._netService.commonGet(path);
        return configRet;
    }
    deleteOneLastChat = async (id: string): Promise<any> => {
        let path: string = '/tigase/deleteOneLastChat';
        // let type = Utils.isGroup(id) ? "jid" : 'userId';
        let _data = { jid: id };
        _data = this._decorateData(_data, path);
        let configRet = await this._netService.commonPost(path, _data);
        return configRet;
    }

    getUser = async (userId: string, isHttp: boolean = false): Promise<any> => {
        let path = '/user/get';
        let data = { userId };
        data = this._decorateData(data, path);
        let configRet = await this._netService.commonPost(path, data, {
            headers: {
                "originate": "1"
            }
        });
        return configRet;
    }

    login = async (url: any, data: any, config: AxiosRequestConfig): Promise<any> => {
        let path = '/' + url;
        data = this._decorateData(data, path);
        return this._netService.commonPost(path, data);
    }

    getTestData = (url: any, areaCode: string, telephone: string): string => {
        let path = SystemStore.apiUrl + (SystemStore.apiUrl.charAt(SystemStore.apiUrl.length - 1) == '/' ? '' : '/') + url + `?telephone=${areaCode}${telephone}&n=${Math.random()}`;
        return path;
    }

    getCaptcha = () => {
        let path = '/newCaptcha'
        return this._netService.commonGet(path)
    }

    getMsgCode = async (params: any): Promise<any> => {
        let path = '/basic/randcode/sendSms';
        params = this._decorateData(params, path);
        return this._netService.commonPost(path, params);
    }

    regeister = async (url: any, data: any, config: AxiosRequestConfig): Promise<any> => {
        let path = '/' + url;
        data.access_token = systemStore.access_token;
        data = this._decorateData(data, path);
        return this._netService.commonPost(path, data);
    }
    getquestion = async (): Promise<any> => {
        let path = '/question/list';
        let data = {};
        data = this._decorateData(data, path);
        let configRet = await this._netService.commonPost(path, data);
        return configRet;

    }

    getQRCodeUrl = async (): Promise<any> => {
        let path = '/user/login/QCCode';
        let data = {
            access_token: systemStore.access_token
        };

        let axiosConfig: AxiosRequestConfig = this._decorateData(data, path);
        let configRet = await this._netService.commonPost(path, data, axiosConfig);
        return configRet;
    }

    checkQRCodeUrl = async (qcCodeToken: string, serial: string): Promise<any> => {
        let path = '/user/getResponse/' + qcCodeToken + '?serial=' + serial;
        console.log("请求的路径", path)
        let data = {};
        data = this._decorateData(data, path);
        let configRet = await this._netService.commonPost(path, data);
        return configRet;
    }

    delFriend = async (url: any, toUserId: string, config: AxiosRequestConfig): Promise<any> => {
        let path = '/' + url;
        let params: any = {
            toUserId
        }
        params = this._decorateData(params, path);
        return this._netService.commonPost(path, params);
    }
    /**
     * 离开群组
     */
    exitGroup = async (url: any, groupId: string, config: AxiosRequestConfig): Promise<any> => {
        let path = '/' + url;
        let params = {
            access_token: systemStore.access_token,
            roomId: groupId,
            time: new Date().valueOf() / 1000,
            userId: systemStore.userId
        }
        params = this._decorateData(params, path);
        return this._netService.commonPost(path, params);
    }

    // 查询聊天历史记录
    getHistoryList = async (
        pageIndex: number,
        pageSize: number,
        keyword: string,
        contentType: Array<number>,
        isGroup: boolean,
        fromId: any
    ) => {
        let path = (isGroup ? '/tigase/tig_muc_msgs_regex' : "/tigase/tig_msgs_regex");
        let from = isGroup ? 'roomId' : 'receiver';
        let params: any = {
            pageIndex,
            pageSize,
            keyword,
            contentType,
            [from]: fromId,
        }
        params = this._decorateData(params, path)
        return this._netService.commonPost(path, params).then(res => {
            return res
        });
    }

    // 检测单聊消息是否被服务端收到
    checkMessageArrived = async (messageId: string) => {
        const path = '/tigase/tig_msg_check'
        let params = {
            messageId: messageId,
        }
        params = this._decorateData(params, path)
        const res = await this._netService.commonPost(path, params)
        if (res.data) { // 服务端收到
            chatStore.updateMesStatus(messageId, MessageStatusType.sent)
        } else { // 服务端没收到
            chatStore.updateMesStatus(messageId, MessageStatusType.error)
        }
        return res
    }
    // 检测群聊消息是否被服务端收到
    checkGropuMessageArrived = async (messageId: string, roomId: string) => {
        const path = '/tigase/tig_muc_msg_check'
        let params = {
            roomId: roomId,
            messageId: messageId,
        }
        params = this._decorateData(params, path)
        const res = await this._netService.commonPost(path, params)
        if (res.data) { // 服务端收到
            chatStore.updateMesStatus(messageId, MessageStatusType.sent)
        } else { // 服务端没收到
            chatStore.updateMesStatus(messageId, MessageStatusType.error)
        }
        return res
    }

    /**
     * 获得历史消息
     *
     * @memberof IMSDK
     */
    getHistory = async (pageIndex: number, startTime: number, endTime: number, isGroup: boolean, fromId: string, pageSize?: number): Promise<any> => {
        let path = '/' + (isGroup ? 'tigase/tig_muc_msgs' : "tigase/tig_msgs");
        let from = isGroup ? 'roomId' : 'receiver';

        let params: any = {
            pageIndex,
            startTime: startTime * 1000,
            pageSize: pageSize ? pageSize : 400,
            endTime: endTime * 1000,
            [from]: fromId,
            maxType: isGroup ? 0 : 0,
            time: new Date().valueOf() / 1000
        }
        params = this._decorateData(params, path);

        return this._netService.commonPost(path, params).then(res => {
            if (res) {
                let newData = (res.data || []).slice().filter((item: any) => item.content !== '双向撤回消息')
                res.data = newData
            }
            return res
        });

        // 先去掉获取历史聊天记录
        //return new Promise(r => r({resultCode:0,data:[]}));
    }
    /**
     * 同意好友请求
     */
    agreeNewFriend = async (url: any, toUserId: string, config: AxiosRequestConfig): Promise<any> => {
        let path = '/' + url;
        let params: any = {
            access_token: systemStore.access_token,
            toUserId
        }
        params = this._decorateData(params, path);
        return this._netService.commonPost(path, params);
    }

    /**
     * 获取用户设置信息
     */
    userSettings = async (userId: string, config: AxiosRequestConfig): Promise<any> => {
        let path = '/user/settings';
        let data: any = { userId };
        data = this._decorateData(data, path);
        let configRet = await this._netService.commonPost(path, data);
        return configRet;
    }

    /**
    * 获取用户设置信息，获取自己
    */
    userGet = async (userId: string): Promise<any> => {
        let path = '/user/get';
        let data: any = { userId };
        data = this._decorateData(data, path);
        let configRet = await this._netService.commonPost(path, data);
        return configRet;
    }

    /**
     * 查找好友
     */
    searchUser = async (access_token: string, userId: string, keyword: string): Promise<any> => {

        let path = '/nearby/nearbyUserWeb';
        let data = {
            pageIndex: 0,
            pageSize: 10,
            nickname: keyword,
            time: new Date().valueOf(),
            access_token: access_token
        };
        data = this._decorateData(data, path);
        let configRet = await this._netService.commonPost(path, data);
        return configRet;
    }
    /**
     * 申请添加好友好友
     */
    applyAddFriend = async (toUserId: string, access_token: string): Promise<any> => {

        let path = '/friends/attention/add';
        let data = this._decorateData({
            toUserId,
            access_token,
            fromAddType: 5,
            type: 1,
            time: new Date().valueOf(),
        }, path);
        let configRet = await this._netService.commonPost(path, data);
        data = this._decorateData({
            toUserId,
            access_token,
            fromAddType: 4,
            type: 1,
            time: new Date().valueOf(),
        }, path);
        await this._netService.commonPost(path, data);
        return configRet;
    }



    /**
     * 获得服务端时间
     *
     * @memberof IMSDK
     */

    getCurrentTime = async (_diffFun?: Function): Promise<any> => {
        let path = '/getCurrentTime';
        let data = {};
        data = this._decorateData(data, path);
        let timeRet = await this._netService.commonPost(path, data);
        // TODO 这里需要做下错误处理
        if (timeRet.resultCode == 1) {
            _diffFun && _diffFun(timeRet.data);
        }

        // console.log(timeRet, '--------timeRet-------');
        return timeRet;
    }



    /**
     * 获取群信息
     * data ==> member为当前群自己的信息 members 为群主的信息
     */
    getRoom = (roomId: string): Promise<any> => {
        let path = '/room/getRoom';
        let data = { roomId };
        data = this._decorateData(data, path);
        return this._netService.commonPost(path, data);
    }


    /**
    * 获取群成员
    */
    getRoomWithMember = (roomId: string, pageSize: number = 1000000, pageIndex: number = 0): Promise<any> => {
        let path = '/room/get';
        let data = { roomId, pageIndex, pageSize };
        data = this._decorateData(data, path);
        return this._netService.commonPost(path, data);
    }

    /**
     * 下载所有好友
     */
    downloadAllFriends = (_userId: string, pageIndex: number): Promise<any> => {
        let path = '/friends/page';
        let data = { userId: _userId, pageIndex: pageIndex, status: 2, pageSize: 10000 };
        data = this._decorateData(data, path);
        return this._netService.commonPost(path, data);
    }

    /**
     *获取我的房间
     *
     * @memberof IMSDK
     */
    getMyRoom = async (_room: { pageIndex: number, pageSize: number }): Promise<any> => {
        let path = '/room/list/his';
        _room = this._decorateData(_room, path);

        return this._netService.commonPost(path, _room);
    }

    /** 同步服务器 最近聊天列表*/
    getLastChatList = (startTime: number = 0, pageSize: number = 20, endTime: number = 0) => {
        // TODO 获取上次下线时间，根据下线时间获取离线消息
        let path = '/tigase/getLastChatList';

        let _data: any = { startTime, endTime, pageSize }
        _data = this._decorateData(_data, path);

        return this._netService.commonPost(path, _data);
    }


    /** 获取成员列表 */
    getRoomMember = (roomId: string) => {
        let path = '/room/member/list';
        let _data: any = { roomId }
        _data = this._decorateData(_data, path);
        return this._netService.commonPost(path, _data);
    }


    /**获取我的新朋友 */
    getNeWFriendListWeb = async (userId: string | number, pageIndex: number = 0, pageSize: number = 10000): Promise<any> => {
        let path = '/friends/newFriendListWeb';
        let _data: any = { userId, pageIndex, pageSize }
        _data = this._decorateData(_data, path);
        return this._netService.commonPost(path, _data);
    }

    /**获取用户在线状态 */
    getOnline = (userId: number | string) => {
        let path = '/user/getOnLine';
        let _data: any = { userId }
        _data = this._decorateData(_data, path);
        return this._netService.commonPost(path, _data);
    }
    /**获取群公告列表 */
    getNotices = (groupId: string) => {
        let path = '/room/noticesPage';
        let _data: any = {
            roomId: groupId,
            time: new Date().valueOf(),
            access_token: systemStore.access_token
        }
        _data = this._decorateData(_data, path);
        return this._netService.commonPost(path, _data);
    }
    /**删除公告 */
    delNotices = (groupId: string, noticeId: string) => {
        let path = '/room/notice/delete';
        let _data: any = {
            roomId: groupId,
            noticeId,
            time: new Date().valueOf(),
            access_token: systemStore.access_token
        }
        _data = this._decorateData(_data, path);
        return this._netService.commonPost(path, _data);
    }



    /*获取最近的消息列表记录*/
    getUIMessageList = async (): Promise<any> => {
        // TODO 从数据库或者本地拿出最近消息列表
        // var messageList=DBUtils.getUIMessageList();
        // return messageList;
        return [];
    }


    /**修饰数据 */
    _decorateData = (_data: any, url: string, method: Method = "post"): any => {

        // console.log('请求路径', url);

        // let requestConfig: AxiosRequestConfig = {};
        // requestConfig.headers = {
        //     'Access-Control-Allow-Origin': '*',
        //     "Content-Type": "application/x-www-form-urlencoded",
        //     //   "Access-Control-Allow-Credentials":true
        // };
        _data["access_token"] = systemStore.access_token;
        _data = systemStore.createOpenApiSecret(_data);
        // requestConfig.baseURL = '/';
        // requestConfig.url = url;
        // requestConfig.data = _data;
        // requestConfig.method = method;
        // requestConfig.withCredentials = true;

        return _data;
    }



    /**获取头像 */
    getAvatarUrl = (userId: number | string, update: boolean, membersInfo?: Array<any>): string => {

        if (Utils.isNil(userId)) {
            userId = parseInt(systemStore.userId);
        }
        let imgUrl = systemStore.avatarBase + (parseInt(userId + '') % 10000) + "/" + userId + ".jpg";
        if (10000 == userId) {
            // return "img/im_10000.png";
            // imgUrl = require('./../../src/assets/avator/e-0.png');
        }
        if (true == update) {
            imgUrl += "?x=" + Math.random() * 1000000;
        }
        return imgUrl;

    }
    /**获取群组头像 */
    getAvatarUrlGroup = (userId: number | string): string => {
        const hashCode = (str: string | number) => {
            let hash = 0;
            str = str.toString()
            if (str.length == 0) return hash;
            for (let i = 0; i < str.length; i++) {
                let char = str.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash;
            }
            let h = hash.toString()
            while (h.includes('-')) {
                h = h.replace('-', '')
            }
            return h;
        }
        const groupID = hashCode(userId)
        // console.log('---hashCode----', groupID)
        let imgUrl = systemStore.avatarBase + (parseInt(groupID + '') % 10000) + "/" + (parseInt(groupID + '') % 20000) + "/" + userId + ".jpg";
        imgUrl += "?x=" + Math.random() * 1000000;
        return imgUrl;
    }

    /**获取头像 */
    getAvatarUrlAsync = async (userId: string, update: boolean, membersInfo?: Array<any>): Promise<string> => {
        if (!userId) {
            return ''
        } else if (membersInfo && membersInfo.length !== 0) {
            if (Utils.isGroup(userId)) {
                // console.log('----this.getAvatarUrlGroup(userId)', this.getAvatarUrlGroup(userId))
                return this.getAvatarUrlGroup(userId)
                // return GroupItem.getAvatar(userId + '', membersInfo)
            } else {
                return ''
            }

        } else {
            return this.getAvatarUrl(userId, false);
        }
    }

    /**删除好友 */
    // delFriendById = async (userid:string|number):Promise<any>{

    //     let path = '/friend/remove';
    //     let _data: any = {
    //         userId: userid,
    //     }
    //     _data = this._decorateData(_data, path);
    //     return this._netService.commonPost(path, _data, axiosConfig);

    // }

    // 修改群昵称
    changeGrNickname = (nickname: string, groupId: string) => {
        let path = '/room/member/update';
        let _data: any = {
            roomId: groupId,
            userId: systemStore.userId,
            nickname,
            access_token: systemStore.access_token
        }
        _data = this._decorateData(_data, path);
        return this._netService.commonPost(path, _data);
    }
    // 更新群成员
    updateMembers = (groupId: string, text: string[]) => {
        let path = '/room/member/update';
        let _data: any = {
            roomId: groupId,
            access_token: systemStore.access_token,
            text: JSON.stringify(text),
        }
        _data = this._decorateData(_data, path);
        return this._netService.commonPost(path, _data);
    }
    //修改备注名
    changeFriMarkName = (remarkName: string, userId: string, describe: string): Promise<any> => {
        let path = '/friends/remark';
        let _data: any = {
            toUserId: userId,
            remarkName,
            access_token: systemStore.access_token,
            describe
        }
        _data = this._decorateData(_data, path);
        return this._netService.commonPost(path, _data);
    }
    changeFriendTags = (tags: string, userId: string) => {
        let path = '/friendGroup/updateFriend'
        let _data: any = {
            toUserId: userId,
            groupIdStr: tags,
        }
        _data = this._decorateData(_data, path)
        return this._netService.commonPost(path, _data)
    }

    addFrendTags = (groupName: string, userId: string) => {
        let path = 'friendGroup/add'
        let _data: any = {
            toUserId: userId,
            groupName,
        }
        _data = this._decorateData(_data, path)
        return this._netService.commonPost(path, _data)
    }

    getFriendTagsById = () => {
        let path = 'friendGroup/list'
        let _data: any = {}
        _data = this._decorateData(_data, path);
        return this._netService.commonPost(path, _data);
    }

    //获取好友信息
    getFriendInfoById = (friendId: string) => {
        let path = '/friends/get';
        let _data: any = {
            toUserId: friendId
        }
        // let _data: any = {
        //     userId: friendId,
        //     toUserId: systemStore.userId
        // }
        _data = this._decorateData(_data, path);
        return this._netService.commonPost(path, _data);
    }
    // 修改 群 名称
    changeGrName = (roomId: string, roomName: string) => {
        let path = '/room/update';
        let _data: any = {
            roomId,
            roomName,
            time: new Date().valueOf() / 1000,
            access_token: systemStore.access_token,
        }
        _data = this._decorateData(_data, path);
        return this._netService.commonPost(path, _data);
    }

    // 更新公告
    updateGroupNotice = (roomId: string, notice: string) => {
        let path = '/room/update';
        let _data: any = {
            roomId,
            notice
        }
        _data = this._decorateData(_data, path);
        return this._netService.commonPost(path, _data);
    }
    // 更新 群 管理员
    // type 3=> remove manage   2=> add manage
    upgradeGrManage = (roomId: string, touserId: string, type: number) => {
        let path = '/room/set/admin';
        let _data: any = {
            roomId,
            touserId,
            time: new Date().valueOf() / 1000,
            access_token: systemStore.access_token,
            type
        }
        _data = this._decorateData(_data, path);
        return this._netService.commonPost(path, _data);
    }
    //更新群状态 包括 禁言  进群验证 允许添加好友
    // 禁言 talkTime 0 =》 取消禁言 >0 ===> 禁言时间 秒
    // 进群验证 isNeedVerify 0 => 取消 1=> 需要验证
    // 允许添加好友  allowSendCard 0 => 禁止 1 ==> 允许
    updateGroupState = (roomId: string, typeChange: string, value: string) => {
        let path = '/room/update';
        let _data: any = {
            roomId,
            time: new Date().valueOf() / 1000,
            access_token: systemStore.access_token
        }
        _data[typeChange] = value
        _data = this._decorateData(_data, path);
        // deviceManager.sendUpdateSelfInfoMsg();
        return this._netService.commonPost(path, _data);
    }
    //邀请好友进群
    inviteFriendWithGroup = (roomId: string, frList: string) => {
        let path = '/room/member/update';
        let _data: any = {
            roomId,
            text: frList,
            time: new Date().valueOf() / 1000,
            access_token: systemStore.access_token
        }
        _data = this._decorateData(_data, path);
        return this._netService.commonPost(path, _data);
    }
    //移除群友
    removeGrMem = (roomId: string, userId: string) => {
        let path = '/room/member/delete';
        let _data: any = {
            roomId,
            userId,
            time: new Date().valueOf() / 1000,
            access_token: systemStore.access_token
        }
        _data = this._decorateData(_data, path);
        return this._netService.commonPost(path, _data);
    }
    //群友禁言设置
    prohibiteGrMem = (roomId: string, userId: string, talkTime: number) => {
        let path = '/room/member/update';
        let _data: any = {
            roomId,
            userId,
            talkTime,
            time: new Date().valueOf() / 1000,
            access_token: systemStore.access_token
        }
        _data = this._decorateData(_data, path);
        return this._netService.commonPost(path, _data);
    }
    //更改群主
    changeGrOwner = (roomId: string, userId: string) => {
        let path = '/room/transfer';
        let _data: any = {
            roomId,
            toUserId: userId,
            time: new Date().valueOf() / 1000,
            access_token: systemStore.access_token
        }
        _data = this._decorateData(_data, path);
        return this._netService.commonPost(path, _data);
    }

    //删除消息
    deleteMsg = (type: number, del: number, msgId: string, roomJid: string) => {
        try {
            let path = '/tigase/deleteMsg';
            let _data: any = {
                type: type,
                delete: del,
                messageId: msgId,
                roomJid: roomJid,
                time: new Date().valueOf() / 1000,
                access_token: systemStore.access_token
            }
            _data = this._decorateData(_data, path);
            return this._netService.commonPost(path, _data);
        } catch (e) {
            // console.error('deleteMsg', e)
            return null
        }
    }
    //获取 用户 信息
    getUserInfo = (userId: string) => {
        let path = '/user/get';
        let _data: any = {
            userId,
            time: new Date().valueOf() / 1000,
            access_token: systemStore.access_token
        }
        _data = this._decorateData(_data, path);
        var configRet: any = this._netService.commonPost(path, _data)
        return configRet;
    }
    //创建公告
    createNotice = (roomId: string, notice: string) => {
        let path = '/room/update';
        let _data: any = {
            roomId,
            notice,
            time: new Date().valueOf() / 1000,
            access_token: systemStore.access_token
        }
        _data = this._decorateData(_data, path);
        return this._netService.commonPost(path, _data);
    }
    //解散当前群
    delGroup = async (roomId: string) => {
        let path = '/room/delete';
        let _data: any = {
            roomId,
            time: new Date().valueOf() / 1000,
            access_token: systemStore.access_token
        }
        _data = this._decorateData(_data, path);
        // console.log(path, _data);
        return this._netService.commonPost(path, _data);
    }
    //提交群说明
    submitGropExplain = (roomId: string, desc: string) => {
        let path = '/room/update';
        let _data: any = {
            roomId,
            desc,
            time: new Date().valueOf() / 1000,
            access_token: systemStore.access_token
        }
        _data = this._decorateData(_data, path);
        return this._netService.commonPost(path, _data);
    }

    //创建群组
    creatGroup = (groupId: string, name: string, desc: string, text: string[]) => {
        let path = '/room/add';
        // let _uuid = uuid();
        let _data: any = {
            // jid: _uuid.replace(/-/gm, '').toLowerCase(),
            jid: groupId,
            name,
            desc,
            text: JSON.stringify(text),
            time: new Date().valueOf() / 1000,
            access_token: systemStore.access_token
        }
        //  console.log(_data);
        _data = this._decorateData(_data, path);
        return this._netService.commonPost(path, _data);
    }
    //修改我的手机号
    changeTelephone = (telephone: string) => {
        let path = '/user/update';
        let _data: any = {
            telephone,
            time: new Date().valueOf() / 1000,
            access_token: systemStore.access_token
        }
        _data = this._decorateData(_data, path);
        return this._netService.commonPost(path, _data);
    }
    //修改我的出生日期
    changeBirth = (birth: string) => {
        let path = '/user/update';
        let _data: any = {
            birthday: Number(birth).toFixed(0),
            time: new Date().valueOf() / 1000,
            access_token: systemStore.access_token
        }
        _data = this._decorateData(_data, path);
        return this._netService.commonPost(path, _data);
    }
    //修改我的昵称
    changeNickname = (nickname: string) => {
        let path = '/user/update';
        let _data: any = {
            nickname: nickname,
            time: new Date().valueOf() / 1000,
            access_token: systemStore.access_token
        }
        _data = this._decorateData(_data, path);
        return this._netService.commonPost(path, _data);
    }
    //修改我的通讯号
    changeReport = (report: string) => {
        let path = '/user/update';
        let _data: any = {
            report,
            time: new Date().valueOf() / 1000,
            access_token: systemStore.access_token
        }
        _data = this._decorateData(_data, path);
        return this._netService.commonPost(path, _data);
    }

    /** 更新用户设置 */
    userSettingUpdate = (setting: UserSetting) => {
        let path = '/user/settings/update';
        let axiosConfig: AxiosRequestConfig = this._decorateData(setting, path);
        return this._netService.commonPost(path, setting, axiosConfig);
    }


    //修改我的性别
    changeSex = (sex: number) => {
        let path = '/user/update';
        let _data: any = {
            sex,
            time: new Date().valueOf() / 1000,
            access_token: systemStore.access_token
        }
        _data = this._decorateData(_data, path);
        return this._netService.commonPost(path, _data);
    }
    //修改群说明
    changeGroupInfo = (desc: string, roomId: string) => {
        let path = '/room/update';
        let _data: any = {
            desc,
            roomId,
            time: new Date().valueOf() / 1000,
            access_token: systemStore.access_token
        }
        _data = this._decorateData(_data, path);
        return this._netService.commonPost(path, _data);
    }
    //清除聊天记录
    emptyMyMsg = (id: string, type?: string) => {
        let isGroup = Utils.isGroup(id);
        let path = '/tigase/emptyMyMsg';
        let _data = {
            type: 0,
            time: new Date().valueOf() / 1000,
            access_token: systemStore.access_token
        }
        if (!isGroup) {
            _data.type = 0
            _data['toUserId'] = id;
        } else {
            _data.type = 3;
            _data['roomId'] = id;
        }
        if (type) {
            _data.type = 3;
        }
        _data = this._decorateData(_data, path);
        return this._netService.commonPost(path, _data);
    }
    //上传头像到服务器
    uploadAvata = (userId: string, imgurl: File | string, uploadComplete: any, uploadFailed: any) => {
        const form = new FormData();
        form.append('userId', userId);
        form.append('file1', imgurl);
        const xhr = new XMLHttpRequest();
        xhr.open('post', systemStore.uploadAvatarUrl, true);
        xhr.send(form);
        xhr.onload = uploadComplete || this.uploadComplete;
        xhr.onerror = uploadFailed || this.uploadFailed;

        return xhr.onload

    }
    uploadAvataGroup = (userId: string, imgurl: File | string, uploadComplete: any, uploadFailed: any) => {
        const form = new FormData();
        form.append('jid', userId);
        form.append('file1', imgurl);
        const xhr = new XMLHttpRequest();
        xhr.open('post', systemStore.uploadAvatarUrlGroup, true);
        xhr.send(form);
        xhr.onload = uploadComplete || this.uploadComplete;
        xhr.onerror = uploadFailed || this.uploadFailed;

        return xhr.onload

    }
    uploadComplete = (evt: any) => {
        if (!evt.target.responseText) {
            // console.warn('server upload response', evt.target.responseText);
            return false;
        }
        const data = JSON.parse(evt.target.responseText);
        //  console.log('服务器反馈的值=======================',data);
        if (data.resultCode == 1) {
            //    message.success('上传成功')
            return true;

        } else {
            // message.error('上传失败');
            return false;

        }
    };
    uploadFailed = () => {
        console.error('upload error');
        return false;
    };
    //添加表情/收藏聊天内容
    addImog = async (url: any) => {
        let path = '/user/emoji/add';
        let _data: any = {
            // type: 6,
            // toUserId,
            // time: new Date().valueOf() / 1000,
            emoji: "[" + url + "]",
            access_token: systemStore.access_token
        }
        _data = this._decorateData(_data, path);
        return this._netService.commonPost(path, _data);
    }
    //获取收藏的表情
    getImog = () => {
        let path = '/user/emoji/list';
        let _data: any = {
            // toUserId,
            // time: new Date().valueOf() / 1000,
            // pageIndex: 0,
            // pageSize:,
            userId: systemStore.userId,
            access_token: systemStore.access_token
        }
        _data = this._decorateData(_data, path);
        return this._netService.commonPost(path, _data);
    }
    //删除收藏的表情
    delImog = async (emojiId: string) => {
        let path = '/user/emoji/delete';
        let _data: any = {
            // toUserId,
            // time: new Date().valueOf() / 1000,
            // pageIndex: 0,
            // pageSize:,
            emojiId: emojiId,
            customEmoId: systemStore.userId,
            access_token: systemStore.access_token
        }
        _data = this._decorateData(_data, path);
        return this._netService.commonPost(path, _data);
    }
    //群组打卡积分
    setIntegration = async (type: number, roomId: string, uIds?: string, fraction?: string) => {
        let path = '/room/signInGroup';
        let _data: any = {
            uIds,
            fraction,
            type,
            roomId,
        }
        _data = this._decorateData(_data, path);
        return this._netService.commonPost(path, _data);
    }
    //群组上报已读接口
    reportReadMsg = async (roomId: string, msgIds: string) => {
        let path = '/room/reportReadMsg';
        let _data: any = {
            roomId,
            msgIds
        }
        _data = this._decorateData(_data, path);
        return this._netService.commonPost(path, _data);
    }
    //群组拉取未读人数接口
    getUnreadInfo = async (roomId: string, msgId: string) => {
        let path = '/room/getUnreadMembers';
        let _data: any = {
            roomId,
            msgId
        }
        _data = this._decorateData(_data, path);
        return this._netService.commonPost(path, _data);
    }

    /** 搜索快捷语 - 支持分页 */
    searchChatShortcut = async (content: string = '', pageIndex: number = 0, pageSize: number = 10) => {
        let path = '/chatShortcut/search';
        let _data: any = { content, pageIndex, pageSize };
        _data = this._decorateData(_data, path);
        return this._netService.commonPost(path, _data);
    }

    /** 获取聊天置顶记录 */
    getChatPinList = async () => {
        let path = '/user/chatPinList';
        let _data: any = {};
        _data = this._decorateData(_data, path);
        return this._netService.commonPost(path, _data);
    }

    /** 添加聊天置顶 */
    addChatPin = async (isRoom: number, toUserId?: string, roomId?: string) => {
        let path = '/user/addChatPin';
        let _data: any = { isRoom };
        if (toUserId) {
            _data.toUserId = toUserId;
        }
        if (roomId) {
            _data.roomId = roomId;
        }
        _data = this._decorateData(_data, path);
        return this._netService.commonPost(path, _data);
    }

    /** 删除聊天置顶 */
    delChatPin = async (id: string) => {
        let path = '/user/delChatPin';
        let _data: any = { id };
        _data = this._decorateData(_data, path);
        return this._netService.commonPost(path, _data);
    }
}

export default new IMSDK();