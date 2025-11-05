import { observable, action, computed } from 'mobx';
import { FriendItem, FriendMap } from '../interface/IFriend';
import imsdk from '../net/IMSDK';
import message from 'antd/es/message';
import { ChatItem, MessageItem } from './../interface/IChat';
import chatStore from '../store/ChatStore';
import webIM from '../net/WebIM';
import { MessageType } from '../net/Const';
import systemStore from './SystemStore';

export class FriendStore {
    // 好友 map 数据
    _friendMap: FriendMap = new Map();
    friendMap = observable(this._friendMap);

    @computed get friendList() {
        return Array.from(this.friendMap.values()).sort((a, b) => {
            return (a.remarkName ? a.remarkName : a.toNickname).localeCompare((b.remarkName ? b.remarkName : b.toNickname))
        })
    }

    @action setFriendList = async (userId: string, pageIndex: number) => {
        let allFriendRet = await imsdk.downloadAllFriends(userId, pageIndex)
        if (allFriendRet.resultCode == 1) {
            // Object.assign(systemStore.user,user.data);
            let friendList = (allFriendRet.data.pageData || []).map((item: any) => { return FriendItem.getFriend(item); });
            friendList.forEach((item: FriendItem) => {
                this.friendMap.set(Number(item.toUserId), item);
            })
            if (allFriendRet.data.pageData.length > 0 && allFriendRet.data.pageData.length === 10000) {
                this.setFriendList(userId, pageIndex + 1);
            }
            return {len:allFriendRet.data.pageCount};
        }else{
            return {len:0}
        }
    }
    @action removeFriend = (friendId: number) => {
        const targetId = Number(friendId)
        if (this.friendMap.get(targetId)) {
            this.friendMap.delete(targetId)
            // imsdk.delFriend('friends/delete', friendId.toString(), {});
        }
    }
    //添加后台默认好友
    @action addDefaultFriend = async (friendId: string, msg: MessageItem) => {

        const FrIdNumber = Number(friendId);

        const friendFind = this.friendMap.get(FrIdNumber);
        if (!friendFind) {
            const friendRes = await imsdk.getFriendInfoById(friendId);

            if (friendRes.resultCode == 1 && friendRes.data) {
                const friend = FriendItem.getFriend(friendRes.data);
                this.friendMap.set(Number(friend.toUserId), friend);

                let newFriend = ChatItem.getChatItem(friend)
                newFriend.lastTime = msg.timeSend ? msg.timeSend : new Date().getTime() + '';
                newFriend.lastContent = msg.content ? msg.content : "";
                chatStore.addToChats(newFriend);
                chatStore.addMessage(friendId, msg);
            } else {
                console.error('获取好友信息失败11', friendId, friendRes.data)
                if (systemStore.userId != friendId) {
                    message.error('获取好友信息失败');
                }

                // todo 好友信息重新获取
            }
        }
    }
    @action addFriend = async (friendId: string) => {
        const FrIdNumber = Number(friendId);
        const friendFind = this.friendMap.get(FrIdNumber);
        if (!friendFind) {
            const friendRes = await imsdk.getFriendInfoById(friendId);

            if (friendRes.resultCode == 1 && friendRes.data) {
                const friend = FriendItem.getFriend(friendRes.data);
                this.friendMap.set(Number(friend.toUserId), friend);
                let newFriend = ChatItem.getChatItem(friend)
                newFriend.lastTime = new Date().getTime() + ''
                newFriend.lastContent = '新的好友,开始聊天吧'
                chatStore.addToChats(newFriend);
                //添加本地消息
                let msg = webIM.createMessage(MessageType.TEXT, '嘿，您好', friendId, name);
                // message.error('发送过了');
                webIM.sendMessage(msg, friendId);
                chatStore.addMessage(friendId, msg, true);
            } else {
                message.error('获取好友信息失败');
                // todo 好友信息重新获取
            }
        }

    }
    @action changeRemark = (id: string, remark: string) => {
        const FrIdNumber = Number(id);
        const targFriend = this.friendMap.get(FrIdNumber);
        // console.log('friendMap++++++++',this.friendMap);
        if (targFriend) {
            // console.log('刷新了好友～～～remarkName',targFriend);
            // if(targFriend.remarkName && targFriend.remarkName != '' && remark != targFriend.remarkName)
            targFriend.remarkName = remark;
            this.friendMap.set(FrIdNumber, { ...targFriend })
        }

    }
    getFriendById = (friendId: number | string) => {
        const FrIdNumber = Number(friendId);
        const targFriend = this.friendMap.get(FrIdNumber);
        return targFriend
    }
    getMarkName = (friendId: Number) => {
        const _friend = this.friendMap.get(Number(friendId));
        if (_friend && _friend.remarkName) {
            return _friend.remarkName
        }
        return ''
    }
    init = () => {
        this.friendMap.clear();
   }
}
export default new FriendStore();

