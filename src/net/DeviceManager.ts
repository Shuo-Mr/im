import webIM from './WebIM';
import { MessageType } from './Const';
import systemStore from '../store/SystemStore';
import friendStore from '../store/FriendStore'
import xmppSDK from './XmppSDK';
// import moment = require('moment');

//多设备 管理

export class DeviceManager {
	jid: string = "";//没有resource 的jid  10000@im.server.com

	userId: string = '';//

	//所有设备列表
	allDeviceArr: Array<string> = ["ios", "android", "pc", "mac", "web", "youjob"];
	//在线的设备列表
	onlineDeviceArr: any = {}

	constructor() {
		// for(let i:number = 0 ;i< this.allDeviceArr.length;i ++){
		// 	this.onlineDeviceArr.push(new Device(this.allDeviceArr[i]));
		// }
	}


	//初始化
	initJid = () => {
		this.jid = webIM.userIdStr;
	}

	init = (_userId: any) => {
		this.userId = _userId
		//DeviceManager.initMyDevices();
		this.login();

	}
	//登录
	login = () => {

		console.log('发送登录同步');

		let msg = webIM.createMessage(200, "1", this.userId);
		webIM.sendMessage(msg, '');
	}

	//更新设备状态
	updateDeviceStatus = (key: any, status: number) => {

		if (key == systemStore.resource) {
			return;
		}
		let device:Device = this.onlineDeviceArr[key];
		console.log('在线设备', key, status);
		if (!device) {
			if (0 == status) {

				return;
			}
			device = new Device(key);
			this.onlineDeviceArr[key] = device;
			if (status == 1) {
				this.sendOnLineMessage(key);
				device.updateDeviceStatus(status);
			}
		} else {
			if (0 == status) {
				device.stopTimer();
				delete this.onlineDeviceArr[key];
				return;
			} else {
				device.updateDeviceStatus(status);
			}
		}
		console.log("在线设备列表", this.onlineDeviceArr);
	}


	clearMutiDevice = () => {
		for (let key in this.onlineDeviceArr) {
			let device = this.onlineDeviceArr[key];

			if (device) {
				device.stopTimer();
				this.onlineDeviceArr[key] = null;
				delete this.onlineDeviceArr[key];
			}
		}
	}



	//发送上线消息
	sendOnLineMessage = (key: string) => {

		console.log('发送上线消息');

		let msg = webIM.createMessage(200, "1", systemStore.userId);
		if (key) {
			this.sendMsg(msg, key);
		} else {
			this.sendMsgToMyDevices(msg);
		}
	}
	//发送离线消息
	sendOffLineMessage = () => {
		let msg = webIM.createMessage(200, "0", systemStore.userId);
		this.sendMsgToMyDevices(msg);
	}

	/**更新过自己的信息，然后发送2000的消息到在线的各个端，然后各端 拉去设置信息 */
	sendUpdateSelfInfoMsg = () => {
		let msg = webIM.createMessage(MessageType.MODIFY_SELF_INFO, "", systemStore.userId);
		this.sendMsgToMyDevices(msg);
	}
	/**
	 * 更新好友信息 用于同步好友信息用
	 */
	endUpdateFriendInfoMsg = (remarkName: string, remark: string) => {
		let msg = webIM.createMessage(MessageType.MODIFY_FRIEND_INFO, JSON.stringify({ remarkName: remark }), systemStore.userId, systemStore.nickname);
		msg.objectId = remarkName;
		this.sendMsgToMyDevices(msg);
	}
	/**
 * 更新删除好友信息 用于同步好友信息用
 */
	sendUpdateDelectFriendMsg = () => {
		let msg = webIM.createMessage(MessageType.MODIFY_FRIEND_DELECT, "", systemStore.userId);
		this.sendMsgToMyDevices(msg);
	}
	//发送消息到 我的在线设备
	sendMsgToMyDevices = (msg: any) => {

		//todo 测试去掉其他设备消息同步
		let device: Device;

		// if (msg.type == 200) {
		console.log('转发在线包200！！！！！！！！！', msg.type, msg.content);

		// }

		for (let key in this.onlineDeviceArr) {
			device = this.onlineDeviceArr[key];

			console.log('在线设备', device, 'key---', key);

			if (device) {
				this.sendMsg(msg, device.key);
			}
		}
	}

	//发送xmpp 消息
	sendMsg = (msg: any, key: string) => {
		var msgObj = JSON.stringify(msg);
		msg = JSON.parse(msgObj);
		msg.to = systemStore.userId + "/" + key;
		// webIM.sendMessage(msg, '');
		console.log('发送给谁消息,多端--->', key, msg);


		xmppSDK.addMesToAlignment(msg);
	}
	//收到好友消息
	receiverMessage = (message: any) => {
		let from = message.from;
		if (systemStore.isNil(from))
			return;
		let fromUserId = webIM.getUserIdFromJid(from);
		if (fromUserId == webIM.userId)
			return;
		//发送者的 resource
		/*var resource=WEBIM.getResource(from);
		shikuLog(" device receiverMessage > "+resource);
		if(myFn.isNil(resource)||resource==myData.resource)
			return;*/
		this.sendMsgToMyDevices(message);
	}

	receiverDeviceMessage = (message: any) => {
		//收到当前账号其他设备消息
		//判断收到回执
		let from = message.from;
		if (systemStore.isNil(from))
			return;
		let fromUserId = webIM.getUserIdFromJid(from);
		if (fromUserId != webIM.userId)
			return;
		//发送者的 resource
		let resource = xmppSDK.getResource(from);
		console.log("receive message > " + resource);
		if (systemStore.isNil(resource) || resource == systemStore.resource)
			return;
		/*var received=message.getElementsByTagName('received')[0];
		//发送ping消息的回执
		if(!myFn.isNil(received)){
			DeviceManager.updateDeviceStatus(resource,1);
		}*/

		// let type = message.chatType;
		let msg = message;


		let status: number = 0;
		//是否为自己 在线状态 的消息
		let isReceived = false;
		if (200 == msg.type) {
			status = parseInt(msg.content);
			isReceived = true;
			this.updateDeviceStatus(resource, status);
		} else if (MessageType.MODIFY_SELF_INFO == msg.type) {
			webIM.userGet();
		} else if (MessageType.MODIFY_FRIEND_DELECT == msg.type) {
			friendStore.setFriendList(this.userId,0);

		} else if (26 == msg.type) {

			console.log('------------26--------------', msg);

			// UI.showMsg(msg,msg.fromUserId,0,0);
			// TODO 显示界面
			// let message=DataUtils.getMessage(msg.content);
			// if(systemStore.isNil(message))
			// 	return false;
			// if(systemStore.isReadDelMsg(message)){
			// 	DataUtils.removeMsgRecordList(msg.toJid,msg.content);
			// 	DataUtils.deleteMessage(msg.content);
			// 	return true;
			// }
			// message.isRead=1;
			// DataUtils.saveMessage(message,msg.content);
			// isReceived=true;
		}
		return isReceived;
	}

	receiveReceived = (message: any) => {
		/*收到其他设备发送的回执*/
		// let id = message.messageId;
		let from = message.from;
		if (systemStore.isNil(from))
			return;
		let fromUserId = webIM.getUserIdFromJid(from);
		if (fromUserId != webIM.userId)
			return;
		//发送者的 resource
		let resource = xmppSDK.getResource(from);
		if (systemStore.isNil(resource) || resource == webIM.resource)
			return;
		console.log("receiveReceived 6666666666666666> " + resource, message);
		this.updateDeviceStatus(resource, 1);
		//发送回执


	}
	//处理主动发送给其他设备的消息
	processUiSendMessage = (msg: any) => {
		// let from=conversationManager.from;
		// let resource=imsdk.getResource(from);
		// if(systemStore.isNil(resource))
		// 		return;
	}
	//处理收到要显示的消息
	processShowMessage = (msg: any, isSend: any, isOpen: any) => {


		// var from;//对方
		//isSend 是否发送出去的消息
		if (!isSend) {
			//正在输入状态 终止执行
			if (MessageType.INPUT == msg.type)
				return;
			if (MessageType.READ == msg.type)
				return;
			//接收到的消息
			if (webIM.userId != msg.toUserId) {
				//自己其他设备发送给好友的消息 转发给我的
				//msg.fromUserId=msg.toUserId;
				// UI.playSound();
				// TODO 播放声音
				return msg;
			}
			//同账号 其他设备发送给当前设备的消息
			// from = msg.fromJid;
		} else {
			//发送出去的消息
			// from=ConversationManager.from;
			// msg.fromJid = webIM.userIdStr;
			// msg.toJid = from;
			// DataUtils.saveMessage(msg);
		}

		return null;
	};


}

const deviceManager = new DeviceManager();
export default deviceManager;


class Device {
	key: string;

	isOnline: boolean = false;
	isPingOk: boolean = false;

	//定时器对象
	timer: number = -1;


	constructor(_key: string, _isOnline: boolean = false, _isPingOk: boolean = false) {
		this.key = _key;
		this.isOnline = _isOnline;
		this.isPingOk = _isPingOk;
	}


	//更新设备状态
	updateDeviceStatus = (status: number) => {
		this.isOnline = false;
		this.isPingOk = false;
		if (1 == status) {
			this.isOnline = true;
			this.isPingOk = true;
		}

		if (this.isOnline) {
			this.resetTimer();
			// $("#deviceStatus_"+this.key).html("(在线)");
			//TODO 页面显示状态
			//DeviceManager.onlineDeviceArr[this.key]=this;
		} else {
			// $("#deviceStatus_"+this.key).html("(离线)");
			//TODO 页面显示状态
			this.stopTimer();
			// DeviceManager.onlineDeviceArr[this.key] = null;
		}
	};
	//停止计时器
	stopTimer = () => {
		window.clearTimeout(this.timer);
	};
	//重制计时器
	resetTimer = () => {
		this.stopTimer();
		this.startTimer();
	}
	//开启计时器
	startTimer = () => {
		// let time = new Date().format("yyyy-MM-dd hh:mm:ss");
		// console.log(time+"==startTimer start key "+this.key);
		this.timerInit();
	};
	//定时器 执行
	timerFinished = () => {
		// var time = moment().format("yyyy-MM-dd hh:mm:ss");
		// console.log(time+"==timerFinished start key > "+this.key+" isOnline > "+this.isOnline+" isPingOk > "+this.isPingOk);
		if (this.isPingOk) {
			// this.isPingOk = false;
			// console.log("==timerFinished end key > "+this.key+" isOnline > "+this.isOnline+" isPingOk > "+this.isPingOk);
			deviceManager.sendOnLineMessage(this.key);
			this.resetTimer();
		} else {
			this.isOnline = false;

			console.log('你他大爷的');

			deviceManager.onlineDeviceArr[this.key] = null;
			// console.log("==timerFinished end key > "+this.key+" isOnline > "+this.isOnline+" isPingOk > "+this.isPingOk);
			// console.log("== key > "+this.key+" isOnline > "+this.isOnline+" 离线 定时器销毁 》");
		}



	};
	timerInit = () => {
		this.timer = window.setTimeout(this.timerFinished, 6000 * 2);
		return this.timer;
	};

}



