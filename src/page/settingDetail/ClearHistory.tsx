import * as React from 'react';
import './secretSetting.less';
import Button from 'antd/es/button';
import chatstore from '../../store/ChatStore';
import message from 'antd/es/message';
import { ChatItem } from '../../interface/IChat';
import imsdk from '../../net/IMSDK';
import frisendStore from '../../store/FriendStore';
import { WithSettingDetailHead } from '../../component/WithSettingDetailHead/WithSettingDetailHead';
import { MessageType } from '../../net/Const';
import webIM from '../../net/WebIM';
import groupStore from '../../store/GroupStore';
import { resetDB } from '../../dbtemp/HandleDB';
import { mesDataCache } from '../../dbCache/dbCacheData';
import { isOpenDB } from '../../config/SystemConfig';

export interface IClearHistoryProps {
}

export interface IClearHistoryState {
}

class ClearHistory extends React.Component<IClearHistoryProps, IClearHistoryState> {
  constructor(props: IClearHistoryProps) {
    super(props);
    this.state = {
    }
  }

  goMsg = () => {

    isOpenDB && resetDB();
    mesDataCache.clearDataCache();
    message.success("清除成功");
  }

  //--------------待讨论数据库怎么清---------------
  clearRecord = async () => {
    if (chatstore.chats.length > 0) {

      // let response = imsdk.emptyMyMsg(systemStore.userId,'1');// 0 清空单人 1 清空所有
      // if (response) {
      let map = chatstore.chats.map((item: ChatItem) => {
        chatstore.clearMentionText(item.id);
        return imsdk.emptyMyMsg(item.id);
      })
      chatstore.resetChats();

      await Promise.all(map);

      message.success("清除成功");
      // }
      // else {
      //   message.warn("清除失败");
      // }

    }

  }

  testSend = (chatId: string) => {
    for (let i = 0; i < 10; i++) {
      let timer = setInterval(() => {
        timer && clearTimeout(timer);
        console.log(chatId, '-----chatId--------');

        this.send(i + "", chatId);
      }, 50);

    }
  }
  //用于开发人员测试
  myTest = async () => {

    //所有好友发消息
    let friends = frisendStore.friendList;
    for (let i = 0; i < friends.length; i++) {
      this.testSend(friends[i].toUserId+'')
    }

    //所有群组发消息
    for (let i = 0; i < groupStore.groupList.length; i++) {
      // console.log('发送的消息', groupStore.groupList);
      this.testSend(groupStore.groupList[i].jid)
    }

  }
  send = (content: string, chatId: string) => {
    if (!content) {
      message.warn('不能发送空内容');
      return;
    }

    const chatItem = chatstore.chats.find((item) => item.id == chatId);

    // console.log('发送的消息', chatItem);
    if (chatItem) {
      // let  contents=content+chatItem ? chatItem.name : chatstore.currentChat.id == chatId ? chatstore.currentChat.name : ''
      const _msgData = {
        type: chatstore.isReply ? 94 : MessageType.TEXT,
        content: content,
        toUserId: chatId,
        toUserName: chatItem ? chatItem.name : chatstore.currentChat.id == chatId ? chatstore.currentChat.name : ''
      };
      let mentionIds = '';
      // if (this.state.mentionPeople.length > 0) {
      //   this.state.mentionPeople.forEach((item) => (mentionIds += (mentionIds ? ',' : '') + item.memId));
      // }

      const msg = webIM.createMessage(_msgData.type, _msgData.content, _msgData.toUserId, _msgData.toUserName);
      if (mentionIds) {
        msg.objectId = mentionIds;
      }
      if (chatItem) {
        msg.isReadDel = chatItem.snapChat;
      }
      if (chatstore.isReply) {
        msg.objectId = JSON.stringify(chatstore.replyMessage);
        // console.log(msg.objectId,'转换后的消息体')
      }

      msg.fromUserName = chatstore.currentChatData.nickname ? chatstore.currentChatData.nickname : msg.fromUserName;
      chatstore.addMessage(chatId, msg, true);
      // console.log(this.injected.chatStore.messageData.get(chatId),'消息体里的数据')
      chatstore.updateMes(msg.content, msg.timeSend);
      webIM.sendMessage(msg, '');

      //todo 测试用
      // this.sendAllMsg();
      // this.scrollToBottom();
    }

  }

  public render() {
    const IS_DEV = process.env.NODE_ENV === 'development';
    return (
      <div style={{ lineHeight: '90px', textAlign: 'center' }}>
        <h3 className="on-eliminate">清除缓存</h3>
        <Button className="an" type="primary" onClick={this.goMsg}>清除</Button>
        <Button>取消</Button>
        {
          IS_DEV ? <Button onClick={this.myTest}>测试</Button> : null
        }

      </div>
    );
  }
}
export default WithSettingDetailHead('清除记录', ClearHistory)
