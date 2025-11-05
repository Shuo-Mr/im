import { FriendItem } from './IFriend';
import { GroupItem } from './IGroup';
import { ChatType } from '../net/Const';
import { observable } from 'mobx';

export class MessageItem {
    // messageId:string;
    // fromUserId:string;
    // fromUserName: string;
    // content:string;
    // timeSend: string;
    // type: number;
    // toUserId: string;
    // toUserName: string;

    chatType: string = 'chat';
    to: string;
    from: string = '';
    id: string;
    toJid: string;
    messageId: string;
    fromUserId: string;
    fromUserName: string;
    content: string;
    timeSend: string;
    type: number;
    isEncrypt?: number;
    isReadDel?: number;
    toUserId: string;
    toUserName: string;
    fileSize?: string;
    jid: string;
    objectId?: string;
    location_x?: string
    location_y?: string
    timeLen?: number;
    roomJid?: string;
    fileName?: string;
    contentType?: number;
    isRead?: number;
    verification?: number;//群验证结果：0:待确认  1：已确认  2：已拒绝
    readDeadTime?: number
    myReadDeadTime?: number
    direction?: boolean = false
    text?:string
   @observable unreadCount:number=0
    static getMessageItem(_messageItem: MessageItem | any): MessageItem {

        let messageItem: MessageItem = new MessageItem();
        for (let key in _messageItem) {
            messageItem[key] = _messageItem[key];
        }
        return messageItem;
    }
    static getMessageBylastmes(_messageItem: any): MessageItem {
        return {
            chatType: _messageItem.isRoom ? ChatType.GROUPCHAT : ChatType.CHAT,
            to: (_messageItem.isRoom || !_messageItem.to) ?_messageItem.jid:_messageItem.to,
            from: _messageItem.from,
            id: _messageItem._id,
            toJid: _messageItem.toJid ? _messageItem.toJid : '',
            messageId: _messageItem.messageId,
            fromUserId: _messageItem.from,
            fromUserName: _messageItem.fromUserName,
            content: _messageItem.content,
            timeSend: _messageItem.timeSend,
            type: _messageItem.type,
            toUserId: _messageItem.to,
            toUserName: _messageItem.toUserName,
            jid: _messageItem.isRoom ? _messageItem.jid : '',
            unreadCount:_messageItem._messageItem,
        }
    }

}
export type MessageList = MessageItem[];
export enum MessageStatusType {
    red,
    loading,
    sent,
    error
}
export const MessageStatus = {
    [MessageStatusType.red]: 'red',
    [MessageStatusType.loading]: 'loading',
    [MessageStatusType.sent]: 'send',
}
export type MessageStatus = Map<string, MessageStatusType>
export type MessageData = Map<string, MessageList>
export class ChatItem {
    lastContent: string;
    id: string;
    lastTime: string;
    messageId: string;
    name: string;
    account: string;
    timeSend: number;
    type: number;
    gid: string = "";
    isForbidden:boolean;//是否禁言
    contentType?: number; // 消息类型
    loginIp?: number; // 用户登录IP
    loginTimeFormat?: any; // 最后上线格式化时间
    offlineTimeFormat?: any; // 最后离线格式化时间
    loginTime?: number; // 最后上化时间
    offlineTime?: number; // 最后离线时间
    offlineDate?: string;
    loginDate?: string;
    groupUserSize?: number; // 房间人数
    onlinestate?: number;   //在线状态，默认离线0  在线 1


    /** 个人的话就显示最近登录时间、群的话就显示群成员数量和在线人数*/
    desc?: string = '';
    nickname?: string = '';
    remarkName?: string = '';
    // 描述
    describe?: string = ''
    tags?: string[] = []
    role?: number;
    msgTalkTime?: number
    allowFriends?: boolean;
    groupInvitNeedTest?: boolean;
    isTop?: boolean;
    pinId?: string; // 置顶记录ID，用于取消置顶
    fileName?: string;
    isNotice?: boolean;
    mentionText?: string;
    locationInfo?: string
    snapChat?: number;
    isBacklock?:boolean;//群后台是否锁定
    static getChatItem(_bindHost: FriendItem | GroupItem | MessageItem): ChatItem {
        let chatItem: ChatItem = new ChatItem();

        if (_bindHost['toUserId']) {
            chatItem.id = _bindHost['toUserId'];
            chatItem.type = ChatGrOrFrType.friend;
        } else if (_bindHost['jid']) {
            chatItem.id = _bindHost['jid'];
            chatItem.gid = _bindHost['id'];
            chatItem.type = ChatGrOrFrType.group;
        }

        chatItem.name = (_bindHost as any).toNickname || (_bindHost as any).name;
        chatItem.account =  (_bindHost as any).account;
        chatItem.remarkName = (_bindHost as any).remarkName || '';
        return chatItem;
    }
}
export type ChatList = ChatItem[];

// export class EmojiItem {
//     url: string;
//     name: string

//     static getEmojiItem(_emoji: any): EmojiItem {
//         let emoji = new EmojiItem();
//         for (let key in _emoji) {
//             emoji[key] = _emoji[key];
//         }
//         return emoji;
//     }
// }
// export type EmojiList = EmojiItem[];

export interface ChatNoReaderMessageData {
    [chatId: string]: MessageItem[]
}
export interface ChatOnlineTime {
    [friendId: string]: string
}
export enum DrawerType {
    friend,
    group,
    notice,
}
export interface GroupMemeberItem {
    name: string,
    headUrl: string,
    groupUserId: string,
    role: string,
}
export interface GroupMember {
    [groupId: string]: GroupMemeberItem[]
}

export enum ChatGrOrFrType {
    friend,
    group
}
export interface NoticeItem {
    id: string,
    nickname: string,
    roomId: string,
    text: string,
    time: string,
    userId: string,
}
// export interface NoticeItem {
//     id: string,
//     nickname: string,
//     roomId: string,
//     text: string,
//     time: string,
//     userId: string,
// }
export type GroupControlState = Map<string, boolean | number>;

export interface IServerUrlItem {
    name: string,
    url: string
}
