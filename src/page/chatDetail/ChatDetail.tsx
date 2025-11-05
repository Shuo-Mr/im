import * as React from 'react';
import { observer, inject } from 'mobx-react';
import { ChatStore } from '../../store/ChatStore';
import SendBoard from '../../component/sendBoard/SendBoard';
import { MessageItem, DrawerType, ChatGrOrFrType } from '../../interface/IChat';
import webIM from '../../net/WebIM';
import { MessageType, mentionsAllKey } from '../../net/Const';
import message from 'antd/es/message';
import DrawerDetail from './DrawerDetail';
import './chatDetail.less';
import { FriendStore } from '../../store/FriendStore';
import { IconImgEdit } from '../../component/iconImage/IconImageEdit';
import { AvatorWithPhoto } from '../../component/avatorWithPhoto/AvatorWithPhoto';
import { GroupStore } from '../../store/GroupStore';
import { GroupMemRole } from '../../interface/IGroup';
import { autorun, IReactionDisposer } from 'mobx';
import { MessageList } from '../../component/messageList/MessageList';
import systemStore from '../../store/SystemStore';
import TransmitSelectModal from '../../component/transmitSelectModal/TransmitSelectModal';
import { SelectItemType } from '../../interface/ITransmit';
import { MesListModal } from '../../component/mesListModal.tsx/MesListModal';
import Utils from '../../utils/utils';
import Icon from 'antd/es/icon';
import { isOpenIntegration } from '../../config/SystemConfig';
import ipcRender from '../../ipcRender';
import { chatContentCber, callBackServicetype } from '../../service/chatContentService';
import { Spin } from 'antd';
import eventBus from '../../utils/eventBus';

const sendBoardDom: any = React.createRef()

export interface IChatDetailProps { }
interface IChatDetailPropsWithStore extends IChatDetailProps {
	chatStore: ChatStore;
	friendStore: FriendStore;
	groupStore: GroupStore;
}
interface MentionPeople {
	name: string;
	memId: string;
}
export interface IChatDetailState {
	chatSetting: boolean;
	mentionPeople: MentionPeople[];
	chatId: string;
	showSelectChatModal: boolean;
	showMenu: boolean;
	listForceScroll: number;
	getMesLoading: boolean;
}

@inject('chatStore', 'friendStore', 'groupStore')
@observer
export default class ChatDetail extends React.Component<IChatDetailProps, IChatDetailState> {
	constructor(props: IChatDetailProps) {
		super(props);

		this.state = {
			chatSetting: false,
			mentionPeople: [],
			chatId: (this.props as IChatDetailPropsWithStore).chatStore.currentChatData.id,
			showSelectChatModal: false,
			// imgurl: systemStore.backImageurl? systemStore.backImageurl:'',
			showMenu: false,
			listForceScroll: 0,
			getMesLoading: false,
		};
	}

	// shouldComponentUpdate() {
	//   return false;
	// }

	get injected() {
		return this.props as IChatDetailPropsWithStore;
	}
	send = (content: string, chatId: string) => {
		if (!content) {
			message.warn('不能发送空内容');
			return;
		}
		let chart = this.injected.chatStore;
		const chatItem = chart.chats.find((item) => item.id == chatId);
		// console.log('发送的消息', chatItem);


		let sendMentions = this.state.mentionPeople.filter(item => content.indexOf(`@${item.name}`) > -1)

		if (chatItem) {
			const _msgData = {
				type: chart.isReply ? 94 : MessageType.TEXT,
				content,
				toUserId: chatId,
				toUserName: chatItem ? chatItem.name : chart.currentChat.id == chatId ? chart.currentChat.name : ''
			};
			let mentionIds = sendMentions.map(item => item.memId).join(',')
			if (sendMentions.length > 0 && isOpenIntegration) {
				//群管理或群主管理群积分
				chart.setIntegration(content, sendMentions, mentionIds);
			}

			const msg = webIM.createMessage(_msgData.type, _msgData.content, _msgData.toUserId, _msgData.toUserName);
			if (mentionIds) {
				msg.objectId = mentionIds;
			}
			if (chatItem) {
				msg.isReadDel = chatItem.snapChat;
			}
			if (chart.isReply) {
				msg.objectId = JSON.stringify(chart.replyMessage);
				// console.log(msg.objectId,'转换后的消息体')
			}
			webIM.sendMessage(msg, ''); 
			// console.log(msg,'发出的消息是什么?????????????',msg.to,msg.toJid,msg.toUserId,msg.toUserName)
			// msg.fromUserName = chart.currentChatData.nickname ? chart.currentChatData.nickname : msg.fromUserName;
			this.injected.chatStore.addMessage(chatId, msg, true);
			// console.log(this.injected.chatStore.messageData.get(chatId),'消息体里的数据')
			this.updateChatData(msg.content, msg.timeSend);
			if (Array.isArray(sendMentions) && sendMentions.length > 0) {
				this.setState({
					mentionPeople: []
				})
			}
			//todo 测试用
			// this.sendAllMsg();
			this.scrollToBottom();
		}

	};

	// sendAllMsg = () =>{

	// 	this.injected.groupStore.groupList.forEach((member, index) =>{
	// 		let msg = webIM.createMessage(1,member.name + ` ${index}`,member.id);
	// 		console.log('gaga---',index);

	// 		webIM.sendMessage(msg,'');
	// 	})
	// 	this.injected.friendStore.friendList.forEach((friend, index) =>{
	// 		let msg = webIM.createMessage(1,friend.toNickname + ` ${index}`,friend.userId+'');
	// 		console.log('hahahahhahahahahah---',index);
	// 		webIM.sendMessage(msg,'');
	// 	})

	// }


	//发送失败的消息，修改休息消息状态，再发一遍消息即可
	reSendMes = (msg: MessageItem) => {
		this.injected.chatStore.selMesWithLocal(msg);
		let chart = this.injected.chatStore;
		const newMsg = { ...msg, timeSend: webIM.getServerTime() + '' }
		this.injected.chatStore.setMessageLoading(newMsg.messageId);
		this.injected.chatStore.addMessage(chart.currentChatData.id, newMsg, true);
		webIM.sendMessage(newMsg, '', true);
	};
	showChatSetting = (isGroup: boolean) => {
		if (isGroup) {
			this.drawerType = DrawerType.group;
		} else {
			this.drawerType = DrawerType.friend;
		}
		this.setState({
			chatSetting: true
		});
	};
	onClose = () => {
		this.setState({
			chatSetting: false
		});
	};
	//更新聊天列表 最新消息及最新时间
	updateChatData = (content: string, time: string) => {

		this.injected.chatStore.updateMes(content, time);
	};
	showChatNotice = () => {
		this.drawerType = DrawerType.notice;
		this.setState({
			chatSetting: true
		});
	};
	autoFun: IReactionDisposer;
	componentDidMount() {
		this.scrollToBottom();
		this.autoFun = autorun(() => {
			if (this.injected.chatStore.currentChatData.type == ChatGrOrFrType.group) {
				this.injected.groupStore.updataSingleGroupList();
			}
		});
		// 拖拽监听
		if (this.messagesBodyDom) {
			this.messagesBodyDom.addEventListener('dragenter', (e: any) => e.preventDefault())
			this.messagesBodyDom.addEventListener('dragover', (e: any) => e.preventDefault())
			this.messagesBodyDom.addEventListener('drop', (e: any) => {
				e.preventDefault()
				// 禁言了不能发送
				const { chatStore, groupStore } = this.injected;
				const isGroup = chatStore.currentChatData.type == ChatGrOrFrType.group;
				let chatRole = chatStore.currentChatData.role;
				const dataChat = chatStore.currentChatData
				const groupMemList = groupStore.groupMemberList.get(dataChat.id)
				let timeTalk
				if (groupMemList) {
					groupMemList.forEach(item => {
						if (item.userId == systemStore.userId) {
							timeTalk = item.talkTime;
							if (!dataChat.role) {
								chatRole = item.role
							}
						}
					});
				}
				const isForbitGr = isGroup &&
					chatRole &&
					chatRole != GroupMemRole.owner &&
					chatRole != GroupMemRole.manage
				const grouptimeTalk = chatStore.groupControlState.get('msgTalkTime')
	    		const forbitBoolean = isForbitGr&&(grouptimeTalk && Number(grouptimeTalk) > 0) ?true:(isForbitGr&&(timeTalk && Number(timeTalk) > 0) ? true : false);
				if (forbitBoolean) return
				if (e.dataTransfer.files.length == 1) { // 单发
					const file = e.dataTransfer.files[0]
					console.log('---拿到文件', file)
					const type:string = Utils.getFileType(file.name)
					sendBoardDom.current.sendDrop(file, type)
				}
				if (e.dataTransfer.files.length > 1) { // 多发
					if (e.dataTransfer.files.length > 9) {
						message.warn("一次最多选择9个文件");
						return
					}
					sendBoardDom.current.sendDrops(e.dataTransfer.files)
				}
			})
		}

		// 监听侧边栏组更新事件
		eventBus.addListener('timeUpdate', () => {
			// console.log('执行格式化')
			this.timerUpdate && clearTimeout(this.timerUpdate);
			const dataChat = this.injected.chatStore.currentChatData;
			const isGroup = dataChat.type == ChatGrOrFrType.group;
			if (!isGroup) {
				this.timerUpdate = setInterval(() => {
					const dataChat2 = this.injected.chatStore.currentChatData;
					if (isGroup) {
						this.timerUpdate && clearTimeout(this.timerUpdate);
						return
					}
					// console.log('定时器执行格式化', JSON.stringify(this.injected.chatStore.currentChatData))
					if (dataChat2.onlinestate === 1) {
						this.injected.chatStore.changeUserTime('loginTimeFormat', Utils.getDifferenceTime(dataChat2.loginTime, 1))
					} else {
						this.injected.chatStore.changeUserTime('offlineTimeFormat', Utils.getDifferenceTime(dataChat2.offlineTime, 1))
					}
				}, 1000 * 60);
			}
		})
		// 监听用户信息变化
		eventBus.addListener('updateUserinfo', (data:any) => {
			const chats:any = this.injected.chatStore.chats
			const _data = JSON.parse(JSON.stringify(data))
			console.log('----新数据', _data)
			const target = chats.find((item:any) => item.id == _data.userId)
			if (target) {
				target.account = _data.account
				target._name = _data.name
				target.name = _data.nickname
				target.nickname = _data.nickname
			}
		})
	}
	timerUpdate: NodeJS.Timeout;
	componentWillUnmount() {
		this.autoFun && this.autoFun();
		this.timerUpdate && clearTimeout(this.timerUpdate);
		this.scrollTimer && clearTimeout(this.scrollTimer);
		eventBus.remove('timeUpdate')
		eventBus.remove('updateUserinfo')
	}
	getNextProps = (props: IChatDetailProps) => {
		return props as IChatDetailPropsWithStore;
	};
	static getDerivedStateFromProps(nextProps: IChatDetailProps, prevState: IChatDetailState) {
		if ((nextProps as IChatDetailPropsWithStore).chatStore.currentChatData.id != prevState.chatId) {
			return {
				chatId: (nextProps as IChatDetailPropsWithStore).chatStore.currentChatData.id,
				chatSetting: false
			};
		} else {
			return {
				chatId: (nextProps as IChatDetailPropsWithStore).chatStore.currentChatData.id
			};
		}
	}
	scrollTimer: NodeJS.Timeout;
	scrollToBottom = (isSmooth?: boolean) => {
		// this.messagesEnd && this.messagesEnd.scrollIntoView(isSmooth?{ behavior: "smooth" }:undefined);
		// setTimeout(()=>{
		// 	this.messagesEnd && this.messagesEnd.scrollIntoView();
		// },500);
		this.scrollTimer && clearTimeout(this.scrollTimer);
		this.scrollTimer = setTimeout(() => {
			if (this.messagesListDom) {
				this.messagesListDom.scrollTop = this.messagesListDom.scrollHeight - this.messagesListDom.clientHeight + 10;
				this.preScrollTop = 0;
			}
		}, 200)
		// },50)
	};
	addUserMentionUser = (memId: string, name: string) => {
		chatContentCber.changeCallBack(callBackServicetype.chatContent, '@' + name + ' ')
		this.addMentionUser(memId, name, true);
	};

	addMentionUser = (memId: string, name: string, isAddContent?: boolean) => {
		const groupId = this.injected.chatStore.currentChatData[mentionsAllKey];
		if (memId == groupId) {
			this.setState({
				mentionPeople: [{ memId, name }]
			});
			isAddContent && chatContentCber.changeCallBack(callBackServicetype.chatContent, '@' + name + ' ')
			return;
		} else {
			const mentionAll = this.state.mentionPeople.findIndex((item) => item.memId == groupId);
			if (mentionAll > -1) {
				this.setState({
					mentionPeople: [{ memId, name }]
				});
				isAddContent && chatContentCber.changeCallBack(callBackServicetype.chatContent, '@' + name + ' ')
			} else {
				this.setState((state) => ({
					mentionPeople: [...state.mentionPeople, { memId, name }]
				}));
			}
		}
	};
	getMessageStatus = (mesId: string) => {
		return this.injected.chatStore.messageStatus.get(mesId)
	}

	transmitMes: (chats: SelectItemType[]) => void
	getTransmitSubmit = (isSingle: boolean, mes?: MessageItem) => {
		const _hideFunc = this.hideTransmit;
		return (chats: SelectItemType[]) => {
			_hideFunc();
			if (!mes) {
				this.injected.chatStore.switchShowMesSel();
			}
			this.injected.chatStore.transmitMes(isSingle, mes, chats);
		}
	}
	transmitMesEdit = (isSingle: boolean, _message?: MessageItem) => {
		if (Array.from(this.injected.chatStore.selectedMes.values()).length < 1 && !_message) {
			message.warn('请选择一项消息');
			return;
		}
		this.setState({
			showSelectChatModal: true
		})
		this.transmitMes = this.getTransmitSubmit(isSingle, _message ? _message : undefined);

	}
	hideTransmit = () => {
		this.setState({
			showSelectChatModal: false
		})
	}
	imgInput: HTMLInputElement | null;
	changeImg = async (e: React.ChangeEvent<HTMLInputElement>) => {

		if (e.target.files && e.target.files.length > 0) {
			const fileImg = e.target.files[0];
			let imgPath = fileImg.path;
			imgPath = imgPath.replace("\\\\", "\/\/");
			imgPath = imgPath.replace("\\", "\/");
			imgPath = imgPath.replace("\\", "\/");

			this.setState({
				// imgurl: imgPath,
				showMenu: false,

			})
			systemStore.backImageurl = imgPath;
			// let loginDataTemp: any = {};
			// loginDataTemp.backImageurl=imgPath;
			ipcRender.setCookies('backImageurl', imgPath);
		}
	};
	showContentDom = () => {

		this.setState({
			showMenu: false
		})
	}
	isBottom = false;
	setScrollBottom = (isBootm: boolean) => {
		this.isBottom = isBootm;
		this.injected.chatStore.setListIsBottom(isBootm);
	}
	preScrollTop = 0;
	listScrolll = (event: React.UIEvent<HTMLDivElement>) => {
		if (this.messagesListDom) {
			const scrollTop = this.messagesListDom.scrollTop;
			const scrollHeight = this.messagesListDom.scrollHeight;
			const clientHeight = this.messagesListDom.clientHeight;
			if (scrollTop <= 2 && !this.state.getMesLoading && scrollTop < this.preScrollTop) {
				let currentMessageList = this.injected.chatStore.messageData.get(this.injected.chatStore.currentChatData.id + '');
				currentMessageList = currentMessageList ? currentMessageList : [];
				if (currentMessageList.length > 0) {
					// this.getMoreMessages(Number(currentMessageList[0].timeSend));
				}
				this.setScrollBottom(false);
			}
			if (this.messagesListDom.scrollTop + 40 > scrollHeight - clientHeight) {
				this.setScrollBottom(true);
			} else {
				this.setScrollBottom(false);
			}
			this.preScrollTop = scrollTop;
		}
	}
	newTime: number = 0;
	currentId: string = '';
	messageOldFirstId: string = '';
	// 修改chatId 此时没有渲染完消息列表 需要加载完消息列表再置底
	changeChatNeedBottom = false;
	componentDidUpdate(preProps: IChatDetailPropsWithStore) {
		this.updateCallBack();
	}
	updateCallBack = () => {
		// console.log('消息列表渲染更新完');
		const mesList = this.injected.chatStore.messageData.get(this.injected.chatStore.currentChatData.id + '');
		let needScrollBottom = false;
		if (this.currentId != this.injected.chatStore.currentChatData.id) {
			// console.log('修改会话列表');
			// needScrollBottom = true;

			this.changeChatNeedBottom = true;
			// this.hasNextPage = true;
		} else if (
			mesList
			&& mesList.length > 0
			&& mesList[mesList.length - 1]
		) {
			if (Number(mesList[mesList.length - 1].timeSend) != this.newTime
				&& this.isBottom
			) {
				needScrollBottom = true;
			}
			this.newTime = Number(mesList[mesList.length - 1].timeSend);
		}
		if (mesList && mesList.length > 0 && mesList[0]) {
			if (mesList[0].messageId != this.messageOldFirstId) {
				if (this.changeChatNeedBottom) {
					needScrollBottom = true;
					this.changeChatNeedBottom = false
				}
			}
			this.messageOldFirstId = mesList[0].messageId;
		} else {
			this.messageOldFirstId = '';
		}
		this.currentId = this.injected.chatStore.currentChatData.id;
		needScrollBottom && this.scrollToBottom();
	}
	hasNextPage = true;

	getMoreMessages = async (time: number) => {
		this.setState({
			getMesLoading: true
		});
		const { chatStore } = this.injected;
		const dataChat = chatStore.currentChatData;
		const isGroup = dataChat.type == ChatGrOrFrType.group;
		const listGet = this.injected.chatStore.messageData.get(this.injected.chatStore.currentChatData.id + '');
		const list = listGet ? listGet : [];
		if (list.length > 0) {
			const startTime = list[0].timeSend;
			const { hasMore, amount } = await this.injected.chatStore.getChatMessages(
				this.injected.chatStore.currentChatData.id,
				startTime,
				isGroup,
				undefined,
				undefined,
				this.injected.chatStore.currentChatData.gid
			);
			console.log('获取是否还有数据', hasMore);
			// this.hasNextPage = hasMore;
			if (this.messagesListDom) {
				// this.messagesList.scrollTo(0,amount)
				// console.log('获取数据条数', amount);
				setTimeout(() => {
					this.messagesListDom && this.messagesListDom.scrollTo(0, 75.77 * amount);
				}, 200)
			}
		}
		this.setState({
			getMesLoading: false
		});
	};
	messagesListDom: HTMLDivElement | null;
	messagesBodyDom: HTMLDivElement | null;
	drawerType: DrawerType = DrawerType.friend;
	messagesEnd: HTMLDivElement | null;
	public render() {
		const { chatStore, groupStore } = this.injected;
		const dataChat = chatStore.currentChatData;
		// console.log('dataChat----', dataChat)
		const isGroup = dataChat.type == ChatGrOrFrType.group;
		const groupMemList = groupStore.groupMemberList.get(dataChat.id);
		const grouptimeTalk = chatStore.groupControlState.get('msgTalkTime');
		// let groupInfo =this.injected.groupStore.getGroupByJid(dataChat.id);
		let list: any = (dataChat && dataChat.id && chatStore.currentChat && (dataChat.id == chatStore.currentChat.id)) ? chatStore.messageListInLimit : [];
		// let set = new Set(list.map((item: any) => { return item.messageId }));
		// console.log(set.size, set);
		let timeTalk;
		let chatRole = dataChat.role;
		if (groupMemList) {
			groupMemList.forEach(item => {
				if (item.userId == systemStore.userId) {
					timeTalk = item.talkTime;
					if (!dataChat.role) {
						chatRole = item.role
					}
				}
			});
		}
		// console.log('渲染是否禁言',isGroup,dataChat);
		const isForbitGr =
			isGroup &&
			chatRole &&
			chatRole != GroupMemRole.owner &&
			chatRole != GroupMemRole.manage


	    const forbitContent = isForbitGr&&(grouptimeTalk && Number(grouptimeTalk) > 0) ?"全员禁言中":(isForbitGr&&(timeTalk && Number(timeTalk) > 0) ? '你已被禁言' : '');
		const canViewInfo = Boolean(
			chatRole == GroupMemRole.owner || chatRole == GroupMemRole.manage || !dataChat.allowFriends
		);
		const isSnap = dataChat.snapChat && dataChat.snapChat > 0;

		if (systemStore.isDelAfterReading == 1 && isSnap) {
			chatStore.setSnapChat(dataChat.id, 0);
			// this.setSnapChat(0);
		}

		// const menuDom = (
		// 	<div className="send-list">
		// 		<label className="item" >
		// 			<span>更换背景</span>
		// 			<input
		// 				type="file"
		// 				ref={ref => this.imgInput = ref}
		// 				accept="image/png,image/jpeg,image/gif"
		// 				style={{ display: 'none' }}
		// 				onChange={this.changeImg}
		// 			>
		// 			</input>
		// 		</label>
		// 	</div>
		// );
		var sectionStyle = {
			backgroundImage: `url(${systemStore.backImageurl})`,
			backgroundSize: "cover",
			padding: '0px 8px'
		};
		// console.log('用户数据', JSON.stringify(dataChat))
		return (
			<div className="chat-detail-body chat-detail" ref={ref => this.messagesBodyDom = ref}>
				<div className={dataChat.isBacklock ? 'forbit' : ''}>{dataChat.isBacklock ? "此群已被锁定" : ''}</div>
				<div className="chart-header">
					<div className="left-wraper">
						<Icon type="left" className="back-but" onClick={chatStore.detailBack} />
						<AvatorWithPhoto type={dataChat.type} id={dataChat.id} classN="head" />
						<div className="right-name">
							<div className="chat-name chat-name-flex">
								<div>
								{isGroup ? dataChat.name : dataChat.remarkName ? dataChat.remarkName : dataChat.name}
								</div>
								<div>
									<div className='status-text-ip'>
										<span className='status-text-title'>IP：</span>
										<span>{dataChat.loginIp}</span>
									</div>
								</div>
							</div>
							{/* 是群组   则展示人数即可 */}
							{isGroup && (
								<div className="status-text-box">
									<div className='status-text-ip'>
										<span className='status-text-title'>群人数:</span>
										<span>{dataChat.groupUserSize}</span>
									</div>
								</div>
							)}
							{/* 个人聊天展示数据 */}
							{!isGroup && (
								<div className="status-text-box">
									{dataChat.onlinestate !== 0 && (
										<div className={`status-text-status ${dataChat.onlinestate !== 0 && 'status-text-online'}`}>{!dataChat.onlinestate ? '离线' : '在线'}</div>
									)}
									{dataChat.onlinestate !== 0 ? (
										<div className='status-text-status'>在线{dataChat.loginTimeFormat}</div>
									) : (
										// <div className='status-text-status'>{dataChat.offlineTimeFormat}前离开</div>
										<div className='status-text-status'>退出时间：{dataChat.offlineDate}</div>
									)}
									{dataChat.onlinestate !== 0 && (
										<div className='status-text-status'>登录时间:{dataChat.loginDate}</div>
									)}
									<div className='status-text-ip'>
										<span className='status-text-title'>位置：{dataChat.locationInfo}</span>
									</div>
								</div>
							)}
						</div>
					</div>
					<div className="chat-detail-headbut-wrap">
						{isGroup ? (
							<IconImgEdit
								onClick={() => this.showChatNotice()}
								img={require('../../assets/image/notice-icon.png')}
								size={20}
								classN="chat-detail-icon"
							/>
						) : null}
						<>
							<span onClick={() => this.showChatSetting(isGroup)} className="chat-more-but">
								<IconImgEdit
									img={
										isSnap ? (
											require('../../assets/image/time_icon.png')
										) : (
											require('../../assets/image/chat-setting-icon.png')
										)
									}
									size={20}
									marginSize={isSnap ? 0 : 16}
									classN="chat-detail-icon"
								/>
								<span>{isSnap ? Utils.getDeadLineTime(dataChat.snapChat || 1).name : null}</span>
							</span>
						</>
					</div>
				</div>

				<DrawerDetail
					isshow={this.state.chatSetting}
					canViewInfo={canViewInfo}
					onclose={this.onClose}
					drawerType={this.drawerType}
					groupId={
						dataChat.gid ? (
							dataChat.gid + ''
						) : (
							'5d0f54f4d95e634aa95f3b5b'
						)
					}
				/>
				{/* <Popover
					placement="top"
					content={menuDom}
					trigger="contextMenu"
					visible={this.state.showMenu}
					// onVisibleChange={(isShow: boolean) => this.setState({ showMenu: isShow })}
				> */}
				<div className="messages-body" ref={ref => this.messagesListDom = ref} onScroll={this.listScrolll} style={sectionStyle} onClick={this.showContentDom}>
					{
						this.state.getMesLoading && !this.injected.chatStore.loadingChatDetailData
							? <Spin />
							: null
					}
					{
						/*this.injected.chatStore.loadingChatDetailData
							? (
								<div className="loading-wrap">
									<Spin tip="消息加载中..." />
								</div>
							)
							: null*/
					}
					{/* {msgs &&
							msgs.map((message: MessageItem, index: number) => {
								return (
									<MessageItemView
										canViewInfo={canViewInfo}
										reSendMes={this.reSendMes}
										key={index + message.messageId}
										keyIndex={index + message.messageId}
										message={message}
										messageStatus={chatStore.messageStatus.get(message.messageId)}
										isGroup={isGroup}
										role={dataChat.role ? dataChat.role : GroupMemRole.member}
										addmentionUser={this.addUserMentionUser}
									/>
								);
							})
						} */}
					<MessageList
						canViewInfo={canViewInfo}
						reSendMes={this.reSendMes}
						messageStatus={this.getMessageStatus}
						isGroup={isGroup}
						isForbidden={Boolean(isForbitGr && ((grouptimeTalk && Number(grouptimeTalk) > 0) || (timeTalk && Number(timeTalk) > 0)))}
						role={dataChat.role ? dataChat.role : GroupMemRole.member}
						addUserMentionUser={this.addUserMentionUser}
						transmitMes={this.transmitMesEdit}
						listForceScroll={this.state.listForceScroll}
						list={list}
						updateCallBack={this.updateCallBack}
						currentChatid={dataChat.id}
					/>
				</div>
				{/* </Popover> */}
				<div className="chat-send-box">
					<SendBoard
						ref={sendBoardDom}
						isMesSel={this.injected.chatStore.isMesSel}
						isForbit={Boolean(isForbitGr && ((grouptimeTalk && Number(grouptimeTalk) > 0) || (timeTalk && Number(timeTalk) > 0)))}
						forbitContent={forbitContent}
						isGroup={isGroup}
						groupMemList={groupMemList ? groupMemList : new Map()}
						sendContent={this.send}
						updateChatData={this.updateChatData}
						friendList={this.injected.friendStore.friendList}
						addmentionUser={this.addMentionUser}
						groupId={dataChat[mentionsAllKey]}
						chatId={dataChat.id}
						transmitMes={this.transmitMesEdit}
						cancelTransmit={this.injected.chatStore.switchShowMesSel}
						chatRole={chatRole ? chatRole : GroupMemRole.member}
					/>
				</div>
				{
					this.state.showSelectChatModal
						? <TransmitSelectModal submitTransmit={this.transmitMes} cancelModal={this.hideTransmit} />
						: null
				}
				{
					Array.isArray(chatStore.transmitMesList) && chatStore.transmitMesList.length > 0
						? <MesListModal mesList={chatStore.transmitMesList} submitOk={chatStore.hideTransmitmes} />
						: null
				}

			</div>

		);
	}
}
