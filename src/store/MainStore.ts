import { observable, action,toJS} from 'mobx'
import iMSDK from '../net/IMSDK';
import systemStore from './SystemStore';
import  message  from 'antd/es/message';
import { UserAddList, ApplyFriendModal, UserAdd } from '../interface/IaddFriend';
import { MessageType } from '../net/Const';
import webIM from '../net/WebIM';
//import { request } from 'https';
 import {requestStore} from './RequestStore';


export enum detailType {
    none = 1,
    message,
    setting,
    newFriend,
    CrtGroup,
    w3
}
export class MainStore {
    //基本信息 用户id
    @observable infoUserId: string = '';
    @action cancelShowInfoModal = () => {
        this.infoUserId = ''
    }
    @action showInfoModal = (id: string) => {
        this.infoUserId = id
    }
    clickClear:boolean=false;
    /**tab index */
    @observable tabIndex: number = 0;
    //右侧展示类型
    @observable detailType: detailType = detailType.none;
    //添加好友框
    @observable addFriModalData = {
        isShow: false,
        searchStr: '',
    }
    @observable filterTxt: string = ''
    //搜索好友列表
    @observable searchUserList: UserAddList = []
    // 申请好友 弹框
    @observable addFriendApplyData: ApplyFriendModal = {
        isShow: false,
        name: '',
        id: '',
        headUrl: ''
    }
    @action changeFilterText = (filterText: string) => {
        this.filterTxt = filterText
    }
    @action changeTabIndex(_index: number): void {
        this.tabIndex = _index;
    }
    @action changeShowDetailType(type: detailType): void {
        this.detailType = type
    }

    @action initChatDetail = () => {
        this.detailType = detailType.none
    }
    //显示创建群组框
    @action showAddGroupModal = () => {
        
        this.detailType = detailType.CrtGroup
    }
    //关闭创建群组框
    @action closeAddGroupModal = () => {
        this.addFriModalData.searchStr = ''
        this.addFriModalData.isShow = false;
    }
    //显示添加好友框
    @action showAddFriModal = (searchStr?: string) => {
        if (searchStr) {
            this.addFriModalData.searchStr = searchStr
        }
        this.addFriModalData.isShow = true;
    }
    //关闭添加好友框
    @action closeAddFriModal = () => {
        this.addFriModalData.searchStr = ''
        this.addFriModalData.isShow = false;
    }

     
    
    //显示添加好友信息
    @action showAddFriendApply = (user: UserAdd) => {
        this.addFriendApplyData.id = user.id;
        this.addFriendApplyData.name = user.name;
        this.addFriendApplyData.headUrl = user.headUrl;
        this.addFriendApplyData.isShow = true;
    }
    //关闭添加好友信息
    @action closeAddFriendApply = () => {
        this.addFriendApplyData.isShow = false;
    }
    @action searchUserFun = async (keyword: string) => {
        const result = await iMSDK.searchUser(systemStore.access_token, systemStore.userId, keyword);
        // console.log('searchUserFun', result);
        this.searchUserList = [];
        if (result.resultCode == 1 && result.data && Array.isArray(result.data.pageData)) {
            result.data.pageData.forEach((user: any) => {
                this.searchUserList.push({
                    id: user.userId,
                    name: user.nickname
                })
            });
        } else {
            message.warn('查找好友失败')
        }
    }
    @action applyAddfriendByid = async (id: string,name:string) => {
        const result = await iMSDK.applyAddFriend(id, systemStore.access_token);
        let type = MessageType.FRIEND;
        // console.log(result.resultCod,result.data,'加好友-----------------')
        if (result.resultCode == 1 && result.data) {
            if (result.data.type == 1 || result.data.type == 3) {
                type = MessageType.SAYHELLO;
                this.addFriendApplyData.isShow = false;
                message.success(result.resultMsg ? '已发送' : '申请添加好友成功');

            } else if (result.data.type == 2 || result.data.type == 4) { //已经是好友了
                type = MessageType.PASS;
                this.addFriendApplyData.isShow = false;
                message.success('你们已经是好友了，开始聊天吧')
            } else if (result.data.type == 5) { //失败，黑名单
                type = MessageType.BLACK;
                this.addFriendApplyData.isShow = false;
                message.warn('你已经在黑名单，无法申请好友')
            }

            const msg = webIM.createMessage(type, "", id, name);
            webIM.sendMessage(msg, '');
            // msg.fromUserId=msg.toUserId;
            // msg.fromUserName=msg.toUserName;
            // console.log('添加对方为好友转化过的',msg, msg.fromUserId, msg.toUserName)
            requestStore.addRequestList(toJS(msg));
            requestStore.addReadRequest();

        } else {
            message.warn('申请添加好友失败')
        }
    }
    @action applyAddfriend = async (applyTx: string) => {
        const result = await iMSDK.applyAddFriend(this.addFriendApplyData.id, systemStore.access_token);
        let type = MessageType.FRIEND;
        if (result.resultCode == 1 && result.data) {
            if (result.data.type == 1 || result.data.type == 3) {
                type = MessageType.NEWSEE;
                this.addFriendApplyData.isShow = false;
                message.success(result.resultMsg ? '已发送' : '申请添加好友成功');

            } else if (result.data.type == 2 || result.data.type == 4) { //已经是好友了
                type = MessageType.PASS;
                this.addFriendApplyData.isShow = false;
                message.success('你们已经是好友了，开始聊天吧')
            } else if (result.data.type == 5) { //失败，黑名单
                type = MessageType.BLACK;
                this.addFriendApplyData.isShow = false;
                message.warn('你已经在黑名单，无法申请好友')
            }
            const msg = webIM.createMessage(type, "", this.addFriendApplyData.id, this.addFriendApplyData.name);
            webIM.sendMessage(msg, '');
        } else {
            message.warn('申请添加好友失败')
        }
    }
    //------------删除好友-----------------------------------
    @action delFriend = async (applyTx: string) => {
        const result = await iMSDK.delFriend('friends/delete',this.addFriendApplyData.id, {});
       
                message.success(result.resultMsg ? '已发送' : '好友已成功删除');
            const msg = webIM.createMessage(MessageType.DELALL, "", this.addFriendApplyData.id,this.addFriendApplyData.name);
            webIM.sendMessage(msg, '');
        } 
    
    }
  

export default new MainStore();