import { observable, action, computed } from 'mobx'
import { GroupList, GroupItem, GroupMemberList, GroupAllMember, GroupMemItem, GroupMemRole } from '../interface/IGroup';
import imsdk from '../net/IMSDK';
// import message from 'antd/es/message';
import chatStore from './ChatStore';
import { FriendItem } from '../interface/IFriend';
import systemStore from './SystemStore';
import webIM from '../net/WebIM';
import { createGroupStore } from '../store/CreatGroupStore';


export class GroupStore {

    _groupList: GroupList = [];
    groupList = observable(this._groupList);
    // 所有群成员列表数据
    _groupMemberList: GroupMemberList = new Map();
    @observable groupMemberList = observable(this._groupMemberList);

    @observable selectGroupId: string = '';


    @action setGroupList = (groups: GroupList) => {
        this.groupList.replace(groups)
    }

    @action setGroupsMember = (groupsMemsData: GroupMemberList) => {
        this.groupMemberList.replace(groupsMemsData);
    }

    @action updataSingleGroupList = async () => {
        const chatData = chatStore.currentChatData;
        const groupId = chatData.gid;
        const chatd = chatData.id;
        const groupRes = await imsdk.getRoomMember(groupId);
        // console.log('获取的成员列表',groupRes.data)
        let newGroupMembers = new Map();
        if (groupRes.resultCode == 1 && groupRes.data) {
            groupRes.data.forEach((member: any) => {
                newGroupMembers.set(String(member.userId), {
                    nickname: member.nickname ? member.nickname + '' : '',
                    role: member.role ? member.role + '' : '',
                    userId: member.userId ? member.userId + '' : '',
                    talkTime: member.talkTime > 0 ? Number(member.talkTime) : 0
                });
            });
            this.groupMemberList.set(String(chatd), newGroupMembers)
        } else {
            if (!this.groupMemberList.has(chatd)) {
                this.groupMemberList.set(chatd, new Map())
            }
            // message.error(`${chatData.name}群组成员更新失败`);
        }
        console.log('----最新群组数据', JSON.stringify(this.groupMemberList))
        localStorage.setItem('_groupList', JSON.stringify(this.groupMemberList))
    }
    @action getisForbiddenById = async (roomid: string) => {

        const groupRes = await imsdk.getRoomMember(roomid);
        if (groupRes.resultCode == 1 && groupRes.data) {
            // groupRes.data.forEach((member: any) => {
            //    if(member.userId&&member.userId==systemStore.userId){
            //    return  member.talkTime > 0 ? true : false
            //    }else{
            //        return false;
            //    }
            // });
            // return false;
            return groupRes.data
        } else {
            return [];
        }
    }


    @action changeGroupMemeber = (groupId: string, groupMembers: GroupAllMember) => {
        this.groupMemberList.set(groupId, groupMembers);
    }

    @action removeGroupMemeber = (groupId: string, groupMemberId: string) => {
        let targetGroupMembers = this.groupMemberList.get(groupId);
        if (targetGroupMembers) {

            targetGroupMembers.delete(groupMemberId);
        }

    }

    @action addGroupMemeber = (groupId: string, groupMemberId: string, groupMember: GroupMemItem) => {
        let targetGroupMembers = this.groupMemberList.get(groupId);
        targetGroupMembers && targetGroupMembers.set(groupMemberId, groupMember);
    }

    @action changeSelectGroup = (_selectGroupId: string) => {
        this.selectGroupId = _selectGroupId
    }

    @computed get currendGroup() {
        // const feiendCur = this.friendList.find(friend => friend.id == this.selectFriendId)
        // return feiendCur ? feiendCur : this.friendList[0]
        return null;
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

    getGroupByJid = (_fid: string): GroupItem | undefined => {
        var groplist = this.groupList.find(item => { return item.jid == _fid });
        // if (!groplist) {
        //     chatStore.removeLocalGroupAndChat(_fid)
        // }
        if (groplist && groplist.membersInfo.length <= 1) {
            if (createGroupStore.selectGroupMembers && createGroupStore.selectGroupMembers.length > 0) {
                createGroupStore.selectGroupMembers.map(item => {
                    let memitem = {
                        active: 1560324081,
                        createTime: 1560324081,
                        modifyTime: 0,
                        nickname: item.toNickname,
                        offlineNoPushMsg: 0,
                        role: 3,
                        sub: 1,
                        talkTime: 0,
                        userId: item.toUserId,
                    }
                    groplist && groplist.membersInfo.push(memitem);
                })
            } else {
                if (groplist && groplist.members.length > 0) {
                    groplist.membersInfo = groplist.members;
                }
                // else if(groplist && groplist.member.length > 0){
                //     groplist.membersInfo = groplist.member;
                // }


                // console.log('createGroupStore.selectGroupMembers获得群成员的长度', groplist.membersInfo)
            }

            // groplist.membersInfo=groplist.member;
            // console.log(createGroupStore.selectGroupMembers,'群成员们')
        }
        return groplist;

    }


    @action changeRemark = (id: string, nickname: string) => {

        let list = this.groupList.slice();
        const tarId = list.findIndex(item => { return item.jid == id });
        if (tarId > -1) {
            list[tarId].nickname = nickname;
            this.groupList.replace(list);
        }
    }

    @action changeGroupName = (id: string, grName: string) => {
        let list = this.groupList.slice();
        const tarId = list.findIndex(item => { return item.id == id });
        if (tarId > -1) {
            list[tarId].name = grName;
            this.groupList.replace(list);
        }
    }


    //更新群 成员 昵称
    @action updateGroupMemNick = (jid: string, userID: string, nickname: string) => {
        let tarGroup = this.groupMemberList.get(jid);
        if (tarGroup) {
            let groupMem = tarGroup.get(userID);
            if (groupMem) {
                groupMem.nickname = nickname
            }
        }
    }

    /**设置权限 */
    @action changeMemberRole = (memId: string, role: GroupMemRole, _jid: string = chatStore.currentChat ? chatStore.currentChat.id : '') => {
        const curGroupMemList = this.groupMemberList.get(_jid);
        if (curGroupMemList) {
            let groupMem = curGroupMemList.get(String(memId))
            if (groupMem) {
                groupMem.role = role;
            }
        }

        this.groupList.map(item => {
            // console.log('你大爷的啊哈哈哈',item,_jid);
            if (item.jid == _jid) {
                item.member.role = role;
            }
        })

    }

    /**请求数据，设置权限 */
    @action changeManage = async (memId: string, setManage: boolean) => {
        const res = await imsdk.upgradeGrManage(chatStore.currentChat.gid, memId, setManage ? 2 : 3);
        if (res && res.resultCode == 1) {

            this.changeMemberRole(memId, setManage ? GroupMemRole.manage : GroupMemRole.member)
            return true
        } else {
            return false
        }

    }

    /**单独禁言 */
    @action gag = (jid: string, toUserId: string, content: string) => {
        let groupMembers = this.groupMemberList.get(jid);
        if (groupMembers) {
            groupMembers.forEach(item => {
                if (item.userId == toUserId) {
                    item.talkTime = Number(content) || 0;
                }
            });
        }
        if (jid && systemStore.userId == toUserId) {
            chatStore.groupControlState.set('msgTalkTime', Number(content) || 0);
        }
    }

    /**设置/取消全体禁言 */
    @action groupAllStatup = (jid: string, content: string) => {
        let groupInfo = this.groupList.find(item => { return item.jid == jid });
        if (groupInfo) {
            groupInfo.talkTime = Number(content) || 0;
        }
    }


    //解散群组
    @action delGroup = (gid: string) => {
        let gs = this.groupList.slice().filter(item => { return item.id != gid });
        this.setGroupList(gs);
    }



    //解散群组
    @action delGroupByJid = (jid: string) => {
        let gs = this.groupList.slice().filter(item => { return item.jid != jid });
        this.setGroupList(gs);
    }

    //创建群组
    @action addGroup = (data: any) => {
        // return new Promise((r, j) => {
        //     let ag = setTimeout(() => {
        //         clearTimeout(ag);
        let newGroupitem: GroupItem = GroupItem.getGroupItem(data);
        let glist = this.groupList.slice().filter(item => { return item.id != newGroupitem.id });

        glist.push(newGroupitem);
        // this.groupList.push(newGroupitem);
        this.groupList.replace(glist);
        // }, 0)
        // })

    }


    //邀请好友进群
    @action inviteFriendWithGroup = async (list: FriendItem[]) => {
        const curGroupMemList = this.groupMemberList.get(chatStore.currentChat.id);
        const addFriendIdList: number[] = [];
        if (curGroupMemList && list && Array.isArray(list)) {
            list.forEach(item => {
                addFriendIdList.push(item.toUserId);
            })
            const res = await imsdk.inviteFriendWithGroup(chatStore.currentChat.gid, JSON.stringify(addFriendIdList));
            if (res && res.resultCode == 1) {
                list.forEach(item => {
                    let itemMem: GroupMemItem = {
                        userId: item.toUserId + '',
                        nickname: item.toNickname,
                        remarkName: item.remarkName ? item.remarkName : '',
                        role: GroupMemRole.member,
                        talkTime: 0
                    }
                    curGroupMemList.set(item.toUserId + '', itemMem)
                })
                return true
            } else {
                return false
            }
        } else {
            return false
        }
    }


    //移除群友
    @action removeMem = async (memId: string) => {
        const res = await imsdk.removeGrMem(chatStore.currentChat.gid, memId);
        let curGroupMemList = this.groupMemberList.get(chatStore.currentChat.id);
        if (curGroupMemList) {
            let oldGrItem = curGroupMemList.get(memId)

            if (res && res.resultCode == 1) {
                //  this.updataSingleGroupList();
                curGroupMemList && curGroupMemList.delete(memId)
                return true
            } else {
                curGroupMemList && oldGrItem && curGroupMemList.set(memId, oldGrItem)
                return false
            }
        } else {
            return false
        }
    }
    groupMemProhibiteTime = 24 * 60 * 60 * 1000;
    @action prohibitedMember = async (memId: string) => {
        let curGroupMemList = this.groupMemberList.get(chatStore.currentChat.id);
        let isProhibite = false;
        let grMembers = null
        if (curGroupMemList) {
            grMembers = curGroupMemList.get(memId)
            if (grMembers && grMembers.talkTime > 0) {
                isProhibite = true
            }
            if(!grMembers){
                return false
            }
        }
        const talkTime = this.groupMemProhibiteTime + Math.round(webIM.getServerTime());
        const res = await imsdk.prohibiteGrMem(chatStore.currentChat.gid, memId, isProhibite ? 0 : talkTime);
        if (grMembers && res && res.resultCode == 1) {
            grMembers.talkTime = isProhibite ? 0 : talkTime;
            return true;
        } else {
            return false
        }
    }


    @action changeOwner = async (memId: string) => {
        const res = await imsdk.changeGrOwner(chatStore.currentChat.gid, memId);
        if (res && res.resultCode == 1) {
            let curGroupMemList = this.groupMemberList.get(chatStore.currentChat.id);
            if (curGroupMemList) {
                let grMembers = curGroupMemList.get(memId)
                if (grMembers) {
                    grMembers.role = GroupMemRole.member;
                    chatStore.currentChatData.role = GroupMemRole.member;
                }
            }
            return true;
        } else {
            return false
        }
    }
    getRoleWithId = (jid: string) => {
        if (jid) {
            const _group = this.groupList.find(item => item.jid == jid);
            if (_group) {
                if (_group.role) {
                    console.log('获取到了群角色', _group.role)
                    return _group.role
                }
            }
        }
        return GroupMemRole.member
    }
    //获取群主ID
    getOwerId = (jid: string) => {
        if (jid) {
            const _group = this.groupList.find(item => item.jid == jid);
            if (_group) {
                if (_group.userId) {
                    return _group.userId
                }
            }
        }
        return ''
    }
    //获取群组人数
    getGroupMemberNum = () => {
        const dataChat = chatStore.currentChatData;
        const memList = this.groupMemberList;
        const groupCurrentData = memList.get(dataChat.id);
        if (groupCurrentData && groupCurrentData != undefined) {
            return groupCurrentData.size
        } else {
            return 0
        }
    }
}

export default new GroupStore();
// 创建群 返回的数据

