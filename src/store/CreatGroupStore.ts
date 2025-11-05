import { observable, action } from 'mobx';
import { FriendItem } from '../interface/IFriend';
import imsdk from '../net/IMSDK';
import groupStore from '../store/GroupStore';
import chatStore from '../store/ChatStore';
import { GroupItem } from '../interface/IGroup';
import message from 'antd/es/message';
// import { SystemStore } from './SystemStore';
import webIm from './../net/WebIM';
import xmppSDK from './../net/XmppSDK';
import uuid = require('uuid');
import systemStore from './SystemStore';
import mainStore,{ detailType } from './MainStore';
// import webIm from './../'

// import { Member } from '../interface/IGroup';
export class CreateGroupStore {

    _selectGroupMembers: FriendItem[] = [];
    selectGroupMembers = observable(this._selectGroupMembers);

    @observable filterTxt: string = ''

    @action init = () => {
        this.selectGroupMembers.replace([]);
    }

    @action addGrFriend = (friend: FriendItem) => {
        this.selectGroupMembers.push(friend);
    }

    @action removeFriend = (friend: FriendItem) => {
        const targetArray = this.selectGroupMembers.slice().filter(item => item.toUserId != friend.toUserId);
        this.selectGroupMembers.replace(targetArray);
    }

    @action changeFilterText = (filterText: string) => {
        this.filterTxt = filterText
    }
    @action submitgroupCreate = async (name: string, desc: string) => {
        if (name.match(/^\s*$/)) {
            message.error("群名不能为空！");
            // ret=  false;
        }
        let groupId = uuid().replace(/-/gm, '').toLowerCase();
        xmppSDK._XEP_0045_143(groupId, name, desc, systemStore.userId, async (status: number, reason: string) => {
            if (status != 0) {
                message.error('创建失败');
                // ret=  false;
            }
            // console.log('创建房间1111', status)
            if (this.selectGroupMembers && this.selectGroupMembers.length > 0) {
                const idArray = this.selectGroupMembers.map(item => String(item.toUserId))
                //创建房间

                const resServer = await imsdk.creatGroup(groupId, name, desc, idArray);


                if (resServer && resServer.resultCode == 1 && resServer.data) {

                    console.log(resServer.data, '--------------------');

                    xmppSDK.joinGroupChat(resServer.data.jid, webIm.userId, 0);
                    //添加群组
                    let updatamembers = await imsdk.updateMembers(resServer.data.id, idArray);
                    if (updatamembers && updatamembers.resultCode == 1) {

                        groupStore.addGroup(resServer.data);

                    }
                    this.groupCreatsuccess(resServer.data);
                    mainStore.changeShowDetailType(detailType.none);
                    message.success('创建成功');
                } else {
                    message.error(resServer.resultMsg?resServer.resultMsg:'创建失败');
                }
            }
        })

    }
    @action async groupCreatsuccess(gitm: GroupItem) {
        return new Promise((r, j) => {
            let ct = setTimeout(() => {
                clearTimeout(ct);
                chatStore.addGrop(gitm);
            }, 0)
        })

    }



}
export const createGroupStore = new CreateGroupStore();



// 创建群 返回的数据

