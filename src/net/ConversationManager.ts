import { MessageItem } from '../interface/IChat';
import chatStore from '../store/ChatStore';

/**
 * 会话管理
 */
class ConversationManager {
    from: string;
    fromUserId: string;
    nickName: string;

	/** 这个是发送超时处理 */
    sendTimeout = (msgId: string) => {
        // var msg=DataUtils.getMessage(msgId);
        // if(myFn.isNil(msg)){
        //     UI.showReSendImg(msgId);
        //     shikuLog("sendTimeout  消息找不到了");
        //     return;
        // }
        // //检查网络状态
        // checkNetAndXmppStatus();
        // if(msg.reSendCount>0){
        //     shikuLog(" 消息自动重发 "+msgId+"  type "+msg.type+" content ==  "+msg.content+"  reSendCount "+msg.reSendCount);
        //     msg.reSendCount=msg.reSendCount-1;
        //     DataUtils.saveMessage(msg);
        //     WEBIM.sendMessage(msg,msgId);
        // }else{
        //     console.log(" showReSendImg "+msgId+"  type "+msg.type+" content ==  "+msg.content+"  reSendCount "+msg.reSendCount);
        //     // UI.showReSendImg(msgId);
		// }
		
		/**
		 * 发送消息超时
		 */
		msgId && chatStore.mesSendTimeOut(msgId);
    }


    processReceived = (messageId: string) => {
        /*处理收到的消息回执*/
        // if (!myFn.isNil(myData.user) && 1 == myData.user.settings.openService) {
        //     CustomerService.checkHelloTextReceipt(id); //客服模块，检查打招呼语的回执
        // }
        // DataMap.msgStatus[id] = 1; //将发送消息状态进行储存 1:送达
        // //将对应消息的状态显示为送达

        // if (1 == ConversationManager.isGroup) { //群聊


        // } else { //单聊 

        // }

        /*if(1==myData.multipleDevices){
            //多设备模块的  回执处理
            if(DeviceManager.receiveReceived(message))
                return true;
        }*/
        return true;
    }


    //处理收到的单条消息
	processMsg =(msg:MessageItem) =>{
		
		// //消息去重
		// if(DataUtils.getMessage(msg.messageId))
		// 	return;	
		// var type = msg.type;
		// var from = msg.from;
		// var toJid=msg.to;
		// var resource=WEBIM.getResource(from);
		// var fromUserId = WEBIM.getUserIdFromJid(from);
		// //收到的是当前设备发送的消息
		// if(myData.resource==resource&&myData.userId==fromUserId)
		// 	return;
		
		// //判断消息是否来自于黑名单用户，是则不接收
		// if(!myFn.isNil(DataMap.blackListUIds[fromUserId])){
		// 	return;
		// }
		// var contextType=msg.type;
		// //消息的发送者userID  群组的Jid
		// msg.fromId=fromUserId;
		// //消息来源的JID  其他地方要用
		// msg.fromJid=from;
		// msg.toJid=toJid;

		
		// //多设备模块的  消息处理
		// if(1==myData.multipleDevices){
		// 	//// 好友消息处理
		// 	if(WEBIM.CHAT==type&&fromUserId!=myData.userId){
		// 		DeviceManager.receiverMessage(msg);
		// 	}else if(WEBIM.CHAT==type&&fromUserId==myData.userId){
		// 		//其他 设备消息处理
		// 		if(DeviceManager.receiverDeviceMessage(msg))
		// 			return;
		// 	}
		// }
		
		// var toUserId = WEBIM.getUserIdFromJid(msg.to);
			
		// if(26!=msg.type)
		// 	DataUtils.saveMessage(msg);

		// //处理客服模块的xmpp消息    320 : 建立对话   321: 结束会话
		// if (msg.type==320 || msg.type=="320") {
		// 	CustomerService.sendSayHello(parseInt(msg.fromUserId));
		// 	return;
		// };
			
		// //过滤消息类型  接受到true 就 返回不继续执行
		// if(ConversationManager.filterMsgType(msg,fromUserId))
		// 	return;
		// //发送者设备标识

		// //var resource=myFn.getResource(from);

		// if(WEBIM.CHAT==type&&myData.userId==msg.fromUserId){
		// 	//自己发送的消息  fromUserName 改为null
		// 	//显示的时候 会根据 fromUserId 取得 用户名
		// 	msg.fromUserName=null;
		// }
		
		// msg.content = WEBIM.decryptMessage(msg);
		// DataUtils.saveMessage(msg);
		// ConversationManager.receiverShowMsg(msg);
				
			
	}
	

}

export default new ConversationManager();