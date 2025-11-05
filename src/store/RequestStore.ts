import { observable, action } from 'mobx'
import { NewFriendStatus } from '../interface/IGroup';
import imsdk from '../net/IMSDK';
import webIM from '../net/WebIM';
import { MessageType } from '../net/Const';
import friendStore from './FriendStore';
import { MessageItem } from '../interface/IChat';
import message from 'antd/es/message';
// import chartstore from '../store/ChatStore';
import systemStore from './SystemStore';

// import { any, number } from 'prop-types';

/**
 * 请求处理列表
 */
export class RequestStore {

    _requestList: RequestItem[] = [];

    requestList = observable(this._requestList);
    @observable haveUnreadReq = 0;
    @action readRequest = () => {
        this.haveUnreadReq = 0;
    }
    @action addReadRequest = () => {
        this.haveUnreadReq += 1;
    }
    //添加新的好友请求
    @action addRequestList = (message: MessageItem) => {
        let requestList = this.requestList.slice();
        const target = requestList.find(item => item.toUserId == message.toUserId);
        if (target) {
            if (message.fromUserId == systemStore.userId) {
                // console.log(message,'到底谁加谁啊111111111111111')
                target.direction = 0;
            } else {
                target.direction = message.direction ? 0 : 1;
            }
            return
        }
        else {
            // console.log(message,'到底谁加谁啊22222222222222222')
            let requestItem: RequestItem =
            {
                content: message.content ? String(message.content) : "",
                createTime: new Date().valueOf(),
                direction: message.direction ? 0 : 1,
                from: message.from ? String(message.from) : "",
                modifyTime: new Date().valueOf(),
                toNickname: message.fromUserId == systemStore.userId ? (message.toUserName ? String(message.toUserName) : "") : (message.fromUserName ? String(message.fromUserName) : ""),
                toUserId: message.fromUserId == systemStore.userId ? (message.toUserId ? String(message.toUserId) : "") : (message.fromUserId ? String(message.fromUserId) : ""),
                type: message.type ? String(message.type) : "",
                userId: message.fromUserId == systemStore.userId ? (message.fromUserId ? String(message.fromUserId) : "") : (message.toUserId ? String(message.toUserId) : ""),
                status: NewFriendStatus.default,
            }

            if (message.fromUserId == systemStore.userId) {
                requestItem.direction = 0;
            }
            requestList.unshift(requestItem);
            this.requestList.replace(requestList);
        }

    }
    noRepeat = (arr: any) => {
        // 第一层for用来控制循环的次数
        for (var i = 0; i < arr.length; i++) {
            //第二层for 用于控制与第一层比较的元素
            for (var j = i + 1; j < arr.length; j++) {
                //如果相等
                if (arr[i].toUserId == arr[j].toUserId) {
                    //删除后面的 即第 j个位置上的元素  删除个数 1 个
                    arr.splice(j, 1);
                    // j--很关键的一步  如果删除 程序就会出错
                    //j--的原因是 每次使用splice删除元素时 返回的是一个新的数组
                    // 这意味这数组下次遍历是 比较市跳过了一个元素
                    /*
                        例如： 第一次删除后 返回的是 1 1 3 2 1 2 4
                     *  但是第二次遍历是 j的值为2  arr[2] = 3
                     *  相当于跳过一个元素 因此要 j--
                     * */
                    j--;

                }

            }
        }
        return arr;
    }
    @action setRequestList = (_request: RequestItem[]) => {
        _request = this.noRepeat(_request.filter(item=>item!==null));
        this.requestList.replace(_request);
    }

    //  @action frqUnRead=()=>{
    //      if(1)
    //      {
    //       return true;
    //      }else
    //      return false;

    //  }
    //更新好友请求数据列表项的类型
    @action updateToRemote = (msg: MessageItem) => {
        let relist = this.requestList.slice();
        relist = relist.map((item: RequestItem, index: number) => {
            if (relist[index].type != 501 && (msg.fromUserId == String(item.toUserId).replace(/[^0-9]/ig, "") || msg.toUserId == String(item.toUserId).replace(/[^0-9]/ig, ""))) {
                return {
                    ...item,
                    type: msg.type,
                }
            }

            return item;
        })

        this.requestList.replace(relist);
        // console.log('请求列表更新后 结果',relist);

    }
    //删除好友请求
    @action delFriendRequest = (id: string) => {
        let relist = this.requestList;
        const itemT = relist.find(item => item.toUserId == id);
        if (itemT) {
            this.requestList.remove(itemT)
        }
    }
    //更新好友请求数据 的 回复消息
    @action refeshContent = (toUserId: string, content: string) => {
        let relist = this.requestList.slice();
        relist.forEach((item, index) => {
            if (toUserId == item.from) {
                relist[index].content = content
            }
        })
        this.requestList.replace(relist);
    }
    //同意好友请求 并发送添加好友 xmpp 消息
    @action setRequestItenStatus = async (id: string, status: NewFriendStatus, name: string) => {
        // const requestListSlice = this.requestList.slice();
        //  const selectIndex = requestListSlice.findIndex(item => item.toUserId == id);
        if (status == NewFriendStatus.agree) {
            const result = await imsdk.agreeNewFriend('friends/add', id, {});
            if (result.resultCode == 1) {
                console.log(result, 'msg的状态');
                const type = MessageType.PASS;
                let msg = webIM.createMessage(type, "", id, name);
                // console.log(msg,'同意好友的消息')
                webIM.sendMessage(msg, id);
                friendStore.addFriend(id);
                this.readRequest();
                // const targetFri = friendStore.friendList.find(item => item.toUserId == Number(msg.fromUserId));
                // if (targetFri) {
                //     chartstore.addToChats(ChatItem.getChatItem(targetFri));
                //     msg.type=MessageType.REVOKE,
                //     msg.content='嘿，你好'
                //     chartstore.addMessage(id, msg, true);
                //     console.log(chartstore, '添加到消息库了吗');
                // }
                // msg.type=MessageType.PASS;
                // msg.type = MessageType.REVOKE,
                // msg.content = '嘿，你好'
                // chartstore.addMessage(id, msg, true);


                this.updateToRemote(msg);
                // if (selectIndex > -1) {
                //     requestListSlice[selectIndex].status = status;
                //     requestListSlice[selectIndex].type = MessageType.PASS;
                //     this.requestList.replace(requestListSlice);
                // } else {
                //     message.warn('你能查到该好友')
                // }
            } else {

                message.warn(`${result.resultMsg ? result.resultMsg : "通过好友申请请求失败，请重试！"}`)
                if (result.resultMsg == '对方已经是你的好友!') {
                    if (!friendStore.getFriendById(id)) {
                        friendStore.addFriend(id);
                    }
                    let msg = webIM.createMessage(MessageType.PASS, "", id, name);
                    this.updateToRemote(msg);
                }
            }
        } else {
            message.warn('操作错误---> 应为同意添加好友')
        }
    }
}

export class RequestItem {
    content: string;
    createTime: number;
    direction: number;
    from: number | string;
    modifyTime: number | string;
    toNickname: string;
    toUserId: string;
    type: string | number;
    userId: string;
    status: NewFriendStatus;


    static getItem = (_request: any): RequestItem | null => {
        let ritem = new RequestItem();

        for (let key in _request) {
            ritem[key] = _request[key];
        }
        ritem.status = NewFriendStatus.default;
        return ritem;
    }
}

export const requestStore = new RequestStore();
