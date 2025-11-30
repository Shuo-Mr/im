import * as React from 'react';
import Popover from 'antd/es/popover';
import Button from 'antd/es/button';
import message from 'antd/es/message';
import { MentionsInput, Mention, SuggestionDataItem } from 'react-mentions';
import './sendBoard.less';
import { imojiData } from '../../config/imojiDataList';
import webIM from '../../net/WebIM';
import chatStore from '../../store/ChatStore';
import systemStore from '../../store/SystemStore';
import { MessageItem } from '../../interface/IChat';
import { MessageType } from '../../net/Const';
import Utils from '../../utils/utils';
import { SelectFriend } from '../selectFriend/SelectFriend';
import { FriendItem } from '../../interface/IFriend';
import { MapModal } from '../MapModal/MapModal';
import { IconImgEdit } from '../iconImage/IconImageEdit';
import { GroupMemItem, GroupMemRole } from '../../interface/IGroup';
import Modal from 'antd/es/modal';
import Input from 'antd/es/input';
import friendStore from '../../store/FriendStore';
import { chatContentCber, callBackServicetype } from '../../service/chatContentService';
import ipcRender from '../../ipcRender';
import Carousel from 'antd/es/carousel';
import Icon from 'antd/es/icon';
import Divider from 'antd/es/divider';
import { ImojiBoard } from './ImojiBoard';
import { observerServices } from '../../service/obsService';
import imsdk from '../../net/IMSDK';
import md5 = require('md5');
import { isTest, isMac, isOpenDoubleDel, isOpenIntegration } from '../../config/SystemConfig';
import lrz from 'lrz'
import { Dropdown, Menu } from 'antd';


// import kscreenshot from 'kscreenshot';
// const { Option } = Mentions;
// const ipcRenderer = require('electron').ipcRenderer;
const electron = window['electron'];

const ipcRenderer = electron ? electron.ipcRenderer : null;
ipcRenderer && ipcRenderer.on('uploadLogs', (event: any, _data: any) => {
	// console.log('接受到数据了吗', _data)
	var content = [_data];
	var blob = new Blob(content, { type: 'text/plain;charset=utf-8' });
	var file = new File([blob], '1.txt', { type: 'text/plain' });
	observerServices.uploadFile(file, systemStore.uploadUrl);
})
// ipcRenderer && ipcRenderer.on('uploadScreeshot', (event: any, _data: any) => {
// 	console.log('接受到数据了吗', _data)

// })
export interface ISendBoardProps {
	sendContent: (content: String, chatId: string) => void;
	updateChatData: (content: string, time: string) => void;
	friendList: FriendItem[];
	isGroup: boolean;
	isForbit: boolean;
	forbitContent: string;
	groupMemList: Map<String, GroupMemItem>;
	// content: string;
	// changeContent: (content: string) => void;
	addmentionUser: (memId: string, name: string) => void;
	groupId: string;
	chatId: string;
	isMesSel: boolean;
	transmitMes: (isSingle: boolean) => void;
	cancelTransmit: () => void;
	chatRole: number
}

export interface ISendBoardState {
	imojiShow: boolean;
	sendTypeListShow: boolean;
	showFriendList: boolean;
	mapShow: boolean;
	imgData: string;
	imgLoading: boolean;
	eidtImageText: string;
	content: string;
	index: number;
	// imojiUpdateNum: number;
	list: { url: string, name: string }[],
	isLoading: boolean,
	ksShow: boolean,
	showMenu: boolean
	showDoubleWithdraw: boolean,
	showDropModal: boolean,
	showDropTitle: string,
	currFile: any,
	currFileType: string,
	currSrc: string,
	currFiles: any,
	showDropTitle2: string,
	showDropModal2: boolean
}

export default class SendBoard extends React.Component<ISendBoardProps, ISendBoardState> {
	slider: any = undefined;
	dataImgId: string;
	imgMsg: MessageItem;
	// ks: any = new kscreenshot(
	// 	{
	// 		key: 65,

	// 	})
	constructor(props: ISendBoardProps) {

		super(props);

		this.state = {
			imojiShow: false,
			sendTypeListShow: false,
			showFriendList: false,
			mapShow: false,
			imgData: '',
			imgLoading: false,
			eidtImageText: '',
			content: '',
			index: 0,
			// imojiUpdateNum: 0,
			list: [],
			isLoading: true,
			ksShow: false,
			showMenu: false,
			showDoubleWithdraw: false,

			showDropModal: false,
			showDropTitle: '',
			currFile: {},
			currFileType: '',
			currSrc: '',

			currFiles: [],
			showDropTitle2: '批量发送',
			showDropModal2: false
		};
	}

	next = () => {
		// this.slider.slick.slickNext();
		this.getData();
		this.slider && this.slider.innerSlider.slickGoTo(1);
		if (this.state.index == 0) {
			this.setState((state) => ({
				index: 1,
				// imojiUpdateNum: this.state.imojiUpdateNum + 1
			}));
		}
	};
	prev = () => {
		// console.log('点击一次');
		// this.slider.slick.slickPrev();
		this.slider && this.slider.innerSlider.slickGoTo(0);
		this.setState({
			index: 0
		});
	};
	componentDidMount() {
		this.inputDomFocus();
		chatContentCber.setChangeCallBack(callBackServicetype.chatContent, this.addMentionContent);
		const textarea = this.mentionDom.current;
		if (!textarea) return
		// 点击监听（用于检测选择变化）
		textarea.addEventListener('selectionchange', this.handleSelectionChange)
		textarea.addEventListener('mouseup', this.handleSelectionChange);
		textarea.addEventListener('keyup', this.handleSelectionChange);
	}
	componentWillUnmount() {
		chatContentCber.setChangeCallBack(callBackServicetype.chatContent, null);
	}
	addMentionContent = (content: string) => {
		this.inputDomFocus();
		this.setState((state) => ({
			content: state.content + content
		}));
	};
	handleVisibleChange = (imojiShow: boolean) => {
		this.slider && this.slider.innerSlider.slickGoTo(0);
		this.setState({ imojiShow });
	};
	handleKsVisibleChange = (ksShow: boolean) => {
		this.setState({ ksShow });
	};
	addImoji = (imojiT: string) => {
		let content = this.state.content + '[' + imojiT + ']';
		this.setState({
			content,

		});
	};
	showImojiPanel = async () => {
		this.setState({
			imojiShow: true,
		});
	};

	showScreenshot = async () => {
		// ipcRender.min()
		// if (this.ks) {
		// 	this.ks.endCB = this.endCB
		// } else {
		// 	this.ks = new kscreenshot(
		// 		{
		// 			key: 65,
		// 			endCB: this.endCB
		// 		})
		// }


		// this.ks.startScreenShot();
		try {
			ipcRender && ipcRender.openScreeshot();

			// console.log('开始时间', dailyRecord, ipcRender)
		} catch (e) {
			// console.log('开始时间', ipcRender)
			// alert("当前浏览器不支持");
			// return;
		}

	};
	showDoubleWithDraw = async () => {
		this.setState({
			showDoubleWithdraw: true
		})
	};
	closeDoubleWithDraw = async () => {
		this.setState({
			showDoubleWithdraw: false
		})
	};
	//双向撤回
	DoubleWithDraw = async (chatId: string) => {
		//todo
		this.setState({
			showDoubleWithdraw: false
		})
		chatStore.doubledelMessage(chatId);
	}
	endCB = async (ks: any) => {
		if (ks) { }

		let blob: any = await Utils.base64ToBlob({ b64data: ks, contentType: 'image/png' })
		// 转后后的blob对象

		this.imgMsg = webIM.createMessage(2, ' ', chatStore.currentChatData.id, chatStore.currentChatData.name);

		this.dataImgId = this.imgMsg.messageId;
		let reader = new FileReader();

		reader.onload = (e: any) => {
			if (e) {
				var img = new Image();
				img.onload = () => {
					this.imgMsg.location_x = String(img.width);
					this.imgMsg.location_y = String(img.height);
				};
				img.src = e.target.result;
				this.imgMsg.content = e.target.result;

				chatStore.addMessage(chatStore.currentChatData.id, this.imgMsg, true);
			}
		};

		if (blob) {
			reader.readAsDataURL(blob);
			// console.log('blob', blob)
			let fileUrl = await observerServices.uploadFile(blob, systemStore.uploadUrl);

			this.uploadComplete(fileUrl, chatStore.currentChatData.id);
		}
	}

	changeImg = async (e: any, currentChatId: string) => {
		if (e.target.files && e.target.files.length > 9) {
			message.warn("一次最多选择9张");
		}
		else if (e.target.files && e.target.files.length > 0 && e.target.files.length <= 9) {
			const fileImgs = e.target.files;
			// const fileImg = e.target.files[0];

			for (let i = 0; i < fileImgs.length; i++) {
				let _imgMsg = webIM.createMessage(2, ' ', currentChatId, chatStore.currentChatData.name);
				this.dataImgId = _imgMsg.messageId;
				let reader = new FileReader();
				reader.readAsDataURL(fileImgs[i]);
				reader.onload = (evt: any) => {
					if (evt) {
						var image = new Image();
						image.onload = (e: any) => {
							_imgMsg.location_x = String(image.width);
							_imgMsg.location_y = String(image.height);
							// console.log('上传的数据',e.target.result,e)
						};
						lrz(fileImgs[i].path).then(rst => {
							console.log(evt.target.result, '============图片原始数据')
							console.log(rst.base64, '===========压缩后的数据');
							image.src = rst.base64;
							_imgMsg.content = rst.base64;
							chatStore.addMessage(currentChatId, _imgMsg, true);
						})
						// image.src = evt.target.result;
						// _imgMsg.content = evt.target.result;

						// chatStore.addMessage(currentChatId, _imgMsg, true);
					}
				};

				let imgUrl;
				//做一个上传日志
				if (isTest) {
					let startTime = new Date();
					imgUrl = await observerServices.uploadFile(fileImgs[i], systemStore.uploadUrl);
					let endTime = new Date();
					// console.log('开始时间',startTime,'结束时间',endTime,'耗时',endTime.getTime()-startTime.getTime(),Utils.formatSizeToUnit(fileImg.size))
					let dailyRecord =
						`用户IP:${systemStore.userIp}
			    用户ID:${systemStore.userId}
				文件路径:${imgUrl}
				文件大小:${Utils.formatSizeToUnit(fileImgs[i].size)}
				开始时间:${startTime}
				结束时间:${endTime}
				耗时:${endTime.getTime() - startTime.getTime()}ms
				`;
					try {
						ipcRender && ipcRender.loadWriteUpdate(dailyRecord);

						// console.log('开始时间', dailyRecord, ipcRender)
					} catch (e) {
						// console.log('开始时间', ipcRender)
						// alert("当前浏览器不支持");
						// return;
					}


				} else {
					imgUrl = await observerServices.uploadFile(fileImgs[i], systemStore.uploadUrl);
				}

				this.imgMsg = _imgMsg;
				// console.log('图片上传obs', imgUrl);
				this.uploadComplete(imgUrl, currentChatId, _imgMsg);
			}
		}
	};
	dataFileId: string;
	FileMsg: MessageItem;
	showFileType = ['jpg', 'png', 'gif'];
	changeFile = async (e: any, currentChatId: string, type: String) => {
		const msgType = type == 'video' ? MessageType.VIDEO : MessageType.FILE
		let FileMsg: MessageItem
		if (e.target.files && e.target.files.length > 0) {
			const fileImg = e.target.files[0];
			FileMsg = webIM.createMessage(
				msgType,
				' ',
				chatStore.currentChatData.id,
				chatStore.currentChatData.name
			);
			FileMsg.content = fileImg.path;
			FileMsg.fileName = fileImg.name;
			// this.FileMsg.fileSize = Utils.formatSizeToUnit(fileImg.size);
			FileMsg.fileSize = String(fileImg.size);

			if (this.showFileType.indexOf(fileImg.type ? fileImg.type.split('/')[1] : '') > -1) {
				let reader = new FileReader();
				reader.readAsDataURL(fileImg);
				reader.onload = (evt: any) => {
					if (evt) {
						// console.log('result', evt.target.result);

						FileMsg.content = evt.target.result;
						FileMsg.fileName = fileImg.name;
						chatStore.addMessage(currentChatId, FileMsg, true);
					}
				};
			} else {
				chatStore.addMessage(currentChatId, FileMsg, true);
			}
			const fileUrl = await observerServices.uploadFile(fileImg, systemStore.uploadUrl);
			this.fileUploadComplete(fileUrl, currentChatId, FileMsg);
			// console.log('文件上传obs', fileUrl);
		}
	};
	fileUploadComplete = (url: string, id: string, file: MessageItem) => {
		if (!url) {
			return;
		}
		let FileMsg = file;
		FileMsg.content = url;
		chatStore.updtateContent(FileMsg);
		webIM.sendMessage(FileMsg, id);
		this.props.updateChatData('你发送了一个文件', FileMsg.timeSend);
		// console.log('上传成功', url);
	};
	uploadComplete = (url: string, chatId: string, msg?: MessageItem, isBoardImage?: boolean) => {
		try {
			let imgMsg: MessageItem = JSON.parse(JSON.stringify(msg ? msg : this.imgMsg));
			if (!this.state.imgData && isBoardImage) {
				return;
			}
			if (!url || !imgMsg) {
				console.log('上传失败');
				return;
			}
			imgMsg.content = url;
			isBoardImage && chatStore.addMessage(chatId, imgMsg, true);
			// console.log('发送消息图片',imgMsg,url,);
			imgMsg.fileName = 'a-/' + (imgMsg.fileName ? imgMsg.fileName : (imgMsg.content ? imgMsg.content : (new Date() + 'image.jpg')))
			chatStore.updtateContent(imgMsg);
			webIM.sendMessage({ ...imgMsg, content: url }, chatId);
			this.props.updateChatData('你发送了图片', imgMsg.timeSend);
		} catch (e) {
			console.warn('修改图片失败', e);
			message.warn('上传失败');
		}
		// console.log('上传成功', url);
	};
	uploadFailed = () => {
		console.error('upload error');
	};
	handleSendType = (sendTypeListShow: boolean) => {
		this.setState({ sendTypeListShow });
	};
	sleep = (milliseconds: number) => {
		return new Promise((resolve) => setTimeout(resolve, milliseconds));
	};
	confirmSelected = async (list: FriendItem[]) => {
		this.setState({
			showFriendList: false
		});
		list.forEach((item) => {
			let msg: any = webIM.createMessage(MessageType.CARD, item.toNickname);
			msg.objectId = item.toUserId;
			webIM.sendMessage(msg, '');
			chatStore.addMessage(chatStore.currentChatData.id, msg, true);
			this.props.updateChatData('发送一个名片', msg.timeSend);
			this.sleep(100);
		});
	};
	cancelSelect = () => {
		this.setState({
			showFriendList: false
		});
	};
	showFriendList = () => {
		this.setState({
			showFriendList: true
		});
	};
	showMapSelect = () => {
		this.setState({
			mapShow: true
		});
	};
	hideMap = () => {
		this.setState({
			mapShow: false
		});
	};


	sendPositionMes = (lat: number, lng: number, _p: number[], positionStr: string, thumbnalUrl: string) => {
		let msg: any = webIM.createMessage(MessageType.LOCATION, '');
		msg.location_x = lat;
		msg.location_y = lng;
		msg.objectId = positionStr;
		msg.content = thumbnalUrl;
		// console.log('发送一个地理位置',msg);
		webIM.sendMessage(msg, '');
		chatStore.addMessage(chatStore.currentChatData.id, msg, true);
		this.props.updateChatData('发送一个地理位置', msg.timeSend);
		this.setState({
			mapShow: false
		});
	};
	testSend = () => {
		for (let i = 0; i < 140; i++) {
			// this.props.sendContent(i + '--' + new Date(),this.props.chatId);
			let timer = setInterval(
				(argsq) => {
					timer && clearTimeout(timer);
					// console.log(chatId,'-----chatId--------');

					this.props.sendContent(i + '', argsq[0]);
				},
				1000 * i,
				[this.props.chatId]
			);
		}
	};
	sendContent = () => {
		if (!this.state.content || !this.state.content.trim()) {
			message.warn('请输入发送的内容');
			return;
		}
		this.props.sendContent(this.state.content, this.props.chatId);
		//普通成员群内签到及查询积分
		if (isOpenIntegration) {
			this.props.isGroup && chatStore.getIntegration(this.state.content)
		}
		if (chatStore.isReply) {
			chatStore.isReply = false;
		}
		this.setState(
			(state) => ({
				content: ''
			}),
			() => {
				this.inputDomFocus();
			}
		);
	};

	inputDom: HTMLDivElement | null;
	// 处理回车发送
	textAreaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		e = e || window.event;
		let keyCode = e.keyCode || e.which || e.charCode;
		// var ctrlKey = e.ctrlKey || e.metaKey;
		const shiftKey = e.shiftKey;
		const ctrlKey = e.ctrlKey;
		// 判断 ctrl+enter 换行
		if (ctrlKey && keyCode == 13) {
			// 阻止提交自动换行
			e.preventDefault();
			this.setState((state) => ({
				content: state.content + '\n'
			}));
		} else if (shiftKey && keyCode == 13) {
			e.preventDefault();
			this.setState((state) => ({
				content: state.content + '\n'
			}));
		} else if (keyCode == 13 && !shiftKey) {
			// 获取发送按钮id，调用 发送按钮事件
			e.preventDefault();
			this.sendContent();
		}
	};

	// 处理发送图片
	imageModalKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
		e = e || window.event;
		let keyCode = e.keyCode || e.which || e.charCode;
		if (keyCode == 13) {
			e.preventDefault();
			this.imageSend(this.props.chatId);
		}
	};

	onAdd = (id: string, name: string) => {

		this.props.addmentionUser(id, name);
	};
	// 输入框 dom 用于获取输入框 focus
	mentionDom: React.RefObject<HTMLTextAreaElement> = React.createRef();
	componentDidUpdate(preProps: ISendBoardProps) {
		if (this.props.chatId != preProps.chatId) {
			// console.log('当前对象是否禁言',this.props);

			this.inputDomFocus();
			this.setState((state) => ({
				content: ''
			}));
		}
		if (this.props.isForbit != preProps.isForbit) {
			this.inputDomFocus();
		}
	}
	inputDomFocus = () => {
		if (this.mentionDom && this.mentionDom.current) {
			if (!this.props.isForbit) ipcRender.isElectron && this.mentionDom.current.focus();
			else this.mentionDom.current.blur();
		}
	};
	convertBase64UrlToBlob = (dataurl: string, filename: string) => {
		let arr = dataurl.split(',');
		if (Array.isArray(arr) && arr[0] && arr[0].match(/:(.*?);/)) {
			let MatchData = arr[0].match(/:(.*?);/);
			let mime = MatchData && MatchData[1],
				bstr = atob(arr[1]),
				n = bstr.length,
				u8arr = new Uint8Array(n);
			while (n--) {
				u8arr[n] = bstr.charCodeAt(n);
			}
			return new File([u8arr], filename, { type: mime ? mime : 'image/png' });
		}
		return null;
	};

	sendDrop = (file: any, type: string) => {
		// console.log('----文件类型', type)
		if (type == 'image') {
			const fr = new FileReader()
			fr.readAsDataURL(file)
			fr.onload = (e: any) => {
				//获取src
				this.setState({
					currSrc: e.target.result
				})
			}
		}
		this.setState({
			currFile: file,
			currFileType: type,
			showDropTitle: '发送：' + file.name,
			showDropModal: true
		})
	}
	sendDrops = (files: [any]) => {
		const currFiles = []
		for (let i = 0; i < files.length; i++) {
			currFiles.push(files[i])
		}
		// console.log('-----文件列表', currFiles)
		setTimeout(() => {
			// console.log('-----文件列表2', this.state.currFiles)
		}, 1000)
		this.setState({
			currFiles: currFiles,
			showDropTitle2: '批量发送',
			showDropModal2: true
		})
	}
	sureDropSend = async () => {
		const e = {
			target: {
				files: [this.state.currFile]
			}
		}
		switch (this.state.currFileType) {
			case 'image': // 图片
				// console.log('---发送图片')
				this.changeImg(e, chatStore.currentChatData.id)
				break
			case 'video': // 视频

				// console.log('---发送视频')
				this.changeFile(e, chatStore.currentChatData.id, 'video')
				break
			default: // 文件
				// console.log('---发送文件')
				this.changeFile(e, chatStore.currentChatData.id, 'file')
				break
		}
		this.closeDropSend()
	}
	sureDropsSend = async () => {
		this.state.currFiles.forEach((item: any, i: number) => {
			setTimeout(() => {
				const e = {
					target: {
						files: [item]
					}
				}
				const type: string = Utils.getFileType(item.name)
				switch (type) {
					case 'image': // 图片
						// console.log('---发送图片')
						this.changeImg(e, chatStore.currentChatData.id)
						break
					case 'video': // 视频

						// console.log('---发送视频')
						this.changeFile(e, chatStore.currentChatData.id, 'video')
						break
					default: // 文件
						// console.log('---发送文件')
						this.changeFile(e, chatStore.currentChatData.id, 'file')
						break
				}
			}, i * 1000)
		})

		this.closeDropSend()
	}
	closeDropSend = () => {
		this.setState({
			currFile: {},
			currFileType: '',
			showDropTitle: '',
			showDropModal: false,
			currSrc: '',
			currFiles: [],
			showDropTitle2: '',
			showDropModal2: false
		})
	}
	// picModal: any;

	sendBoadPast = async (e: React.ClipboardEvent<HTMLDivElement>, currentChatId: string) => {
		//处理当群禁言后换可以粘贴复制发送图片
		const allowChat = Boolean(chatStore.groupControlState.get('msgTalkTime'));
		const currentRole = chatStore.currentChatData.role ? (chatStore.currentChatData.role == GroupMemRole.owner || chatStore.currentChatData.role == GroupMemRole.manage) : false;

		if (this.props.isGroup && allowChat && !currentRole) {
			return;
		}
		// const items = e.clipboardData.items;
		// console.log('粘贴板的数据显示了吗-----------------', e.clipboardData);
		if (e.clipboardData.types.indexOf('Files') !== -1) {
			e.preventDefault();
			//判断是否是粘贴
			if (global['electron']) {
				const { clipboard } = global['electron'];
				const img = clipboard.readImage();
				if (!img.isEmpty()) {
					const imgDataBase = img.toDataURL();
					this.setState({
						imgData: imgDataBase,
						eidtImageText: '',
						imgLoading: false
					});
					// this.autoFocus()
				}
			} else {
				let blob = e.clipboardData.items[0].getAsFile();

				this.imgMsg = webIM.createMessage(2, ' ', currentChatId, chatStore.currentChatData.name);

				this.dataImgId = this.imgMsg.messageId;
				let reader = new FileReader();

				reader.onload = (e: any) => {
					if (e) {
						const img = new Image();
						img.onload = () => {
							this.imgMsg.location_x = String(img.width);
							this.imgMsg.location_y = String(img.height);
						};
						img.src = e.target.result;
						this.imgMsg.content = e.target.result;

						chatStore.addMessage(currentChatId, this.imgMsg, true);
					}
				};

				if (blob) {
					reader.readAsDataURL(blob);

					const fileUrl = await observerServices.uploadFile(blob, systemStore.uploadUrl);
					this.uploadComplete(fileUrl, currentChatId);

				}
			}
		}
	};
	fileUploadGetUrl = async (url: string, file: File): Promise<string> => {
		return new Promise((resolve, reject) => {
			const form = new FormData();
			form.append('file', file);
			form.append('access_token', systemStore.access_token);
			let time = systemStore.getCurrentSeconds() + ''

			let api_time = systemStore.apiKey + time + (systemStore.userId || '') + (systemStore.access_token || '');
			let md5Key = md5(api_time);
			form.append('time', time);
			form.append('secret', md5Key);

			const xhr = new XMLHttpRequest();
			xhr.open('post', url, true);
			xhr.onload = (evt: any) => {
				if (!evt || !evt.target) {
					if (!Boolean(evt.target.responseText)) {
						resolve('');
						return;
					}
					resolve('');
				}
				const data = JSON.parse(evt.target.responseText);
				resolve(data.url);
			};
			xhr.onerror = () => resolve('');
			xhr.send(form);
		});
	};
	getChatName = (id: string) => {
		const _chat = chatStore.chats.find(item => item.id == id);
		if (_chat) {
			return _chat.name
		} else {
			return ''
		}
	}

	imageSend = async (chatId: string) => {
		let chatName = chatStore.currentChatData.id == chatId ? chatStore.currentChatData.name : this.getChatName(chatId);
		// this.imgaModalHide();
		this.setState({
			imgLoading: true
		});
		const fileName = new Date().valueOf() + '_im_screen.png';
		const fileImage = this.convertBase64UrlToBlob(this.state.imgData, fileName);

		if (!fileImage) {
			message.warn('文件解析失败');
			this.setState({
				imgLoading: false
			});
			return;
		}
		let copyImageMessage = webIM.createMessage(
			MessageType.IMAGE,
			' ',
			chatId,
			chatName
		);
		this.imgMsg = copyImageMessage;
		copyImageMessage.fileSize = fileImage.size + '';
		copyImageMessage.fileName = fileName;
		let reader = new FileReader();
		reader.readAsDataURL(fileImage);
		reader.onload = (evt: any) => {
			if (evt) {
				var image = new Image();
				image.onload = (e: any) => {
					copyImageMessage.location_x = String(image.width);
					copyImageMessage.location_y = String(image.height);
					// console.log('上传的数据',e.target.result,e)
				};
				// image.src = evt.target.result;
				// copyImageMessage.content = evt.target.result;

				// chatStore.addMessage(chatId, copyImageMessage, true);
			}
		};
		this.imgMsg = copyImageMessage;
		const url = await observerServices.uploadFile(fileImage, systemStore.uploadUrl);
		this.uploadComplete(url, chatId, copyImageMessage, true);
		if (this.state.eidtImageText) {
			this.props.sendContent(this.state.eidtImageText, chatId);
		}
		this.setState({
			imgData: '',
			eidtImageText: '',
			imgLoading: false
		});

	};
	imgaModalHide = () => {

		this.setState(
			{
				imgData: ''
			},
			() => {
				this.inputDomFocus();
			}
		);
	};
	defaultStyles = {
		control: {
			backgroundColor: 'var(--secondary-color)',

			fontSize: 14,
			fontWeight: 'normal'
		},

		highlighter: {
			overflow: 'hidden'
		},

		input: {
			margin: 0,
			overflow: 'auto',
			maxHeight: 400
		},

		'&singleLine': {
			control: {
				display: 'inline-block',

				width: 130
			},

			highlighter: {
				padding: 1,
				border: '2px inset transparent'
			},

			input: {
				padding: 1,

				border: '2px inset'
			}
		},

		'&multiLine': {
			control: {},

			highlighter: {},

			input: {
				padding: 4,
				outline: 0,
				border: 0
			}
		},

		suggestions: {
			list: {
				backgroundColor: '#f5f5f5',
				boxShaow: '1px 1px 4px #cac7c7',
				fontSize: 14,
				maxHeight: 160,
				overflow: 'auto',
				position: 'absolute',
				bottom: 14,
				zIndex: 99999
			},

			item: {
				padding: '4px 12px',
				'&focused': {
					backgroundColor: 'var(--secondary-color)'
				}
			}
		}
	};
	imageEmog = async (name: string, url: string) => {
		this.setState({
			imgLoading: true,
			imojiShow: false
		});

		if (url) {
			let copyImageMessage = webIM.createMessage(
				MessageType.IMAGE,
				' ',
				chatStore.currentChatData.id,
				chatStore.currentChatData.name
			);
			copyImageMessage.content = url;
			copyImageMessage.fileName = name;
			// console.log('文字格式', fileImage);

			// copyImageMessage.fileSize = fileImage.size + '';
			// console.log(copyImageMessage, '你发送了动图');
			webIM.sendMessage(copyImageMessage, chatStore.currentChatData.id);
			chatStore.addMessage(chatStore.currentChatData.id, copyImageMessage, true);
			this.props.updateChatData('你发送了动图', copyImageMessage.timeSend);

			if (this.state.eidtImageText) {
				this.props.sendContent(this.state.eidtImageText, this.props.chatId);
			}
			this.setState({
				imgData: '',
				eidtImageText: '',
				imgLoading: false
			});
		} else {
			message.warn('上传失败,请重试!');
			this.setState({
				imgLoading: false
			});
		}
	};

	imgInput: HTMLInputElement | null;
	fileInput: HTMLInputElement | null;
	fileInput2: HTMLInputElement | null;
	showImageSelect = () => {
		if (this.imgInput) {
			this.imgInput.value = '';
		}
		this.setState({ sendTypeListShow: false });
	};
	showFileSelect = () => {
		if (this.fileInput) {
			this.fileInput.value = '';
		}
		if (this.fileInput2) {
			this.fileInput2.value = '';
		}
		this.setState({ sendTypeListShow: false });
	};
	sendList = () => {
		const allowChat = Boolean(chatStore.groupControlState.get('allowFriends'));
		// console.log('显示当前的聊天对象',chatStore.currentChatData)
		const currentRole = chatStore.currentChatData.role ? (chatStore.currentChatData.role == GroupMemRole.owner || chatStore.currentChatData.role == GroupMemRole.manage) : false;
		return (
			<div className="send-list">
				<label className="item" onClick={this.showImageSelect}>
					{/* <IconImgEdit img={require('../../assets/image/image-blue-icon.png')} size={20} classN="send-item" /> */}
					<img src={require('./../../assets/image/image-blue-icon.png')} alt="file" />
					<span>图片</span>
					<input
						type="file"
						multiple
						ref={(ref) => (this.imgInput = ref)}
						accept="image/*"
						style={{ display: 'none' }}
						onChange={(e) => this.changeImg(e, chatStore.currentChatData.id)}
					/>
				</label>
				<label className="item" onClick={this.showFileSelect}>
					<img src={require('./../../assets/image/video-send.png')} alt="file" />
					<span>视频</span>
					<input
						ref={(ref) => (this.fileInput2 = ref)}
						type="file"
						accept="video/*"
						style={{ display: 'none' }}
						onChange={(e) => this.changeFile(e, chatStore.currentChatData.id, 'video')}
					/>
				</label>
				<label className="item" onClick={this.showFileSelect}>
					<img src={require('./../../assets/image/file-send.png')} alt="file" />
					<span>文件</span>
					<input
						ref={(ref) => (this.fileInput = ref)}
						type="file"
						style={{ display: 'none' }}
						onChange={(e) => this.changeFile(e, chatStore.currentChatData.id, 'file')}
					/>
				</label>
				{
					!this.props.isGroup || allowChat || currentRole ? <div
						className="item"
						onClick={() => {
							this.setState({ sendTypeListShow: false });
							this.showFriendList();
						}}
					>
						<img src={require('./../../assets/image/card-person.png')} alt="card" />
						<span>名片</span>
					</div> : null
				}
				{/* <div
					className="item"
					onClick={() => {
						this.setState({ sendTypeListShow: false });
						this.showMapSelect();
					}}
				>
					<img src={require('./../../assets/image/position-send.png')} alt="position" />
					<span>位置</span>
				</div> */}
			</div>
		)
	}
	showWindows = () => {
		try {
			ipcRender && ipcRender.openScreeshot();

			// console.log('开始时间', dailyRecord, ipcRender)
		} catch (e) {
			// console.log('开始时间', ipcRender)
			// alert("当前浏览器不支持");
			// return;
		}
		this.setState({
			ksShow: false,
		})
	}
	closeWindows = () => {
		ipcRender.min()
		try {
			ipcRender && ipcRender.openScreeshot();

			// console.log('开始时间', dailyRecord, ipcRender)
		} catch (e) {
			// console.log('开始时间', ipcRender)
			// alert("当前浏览器不支持");
			// return;
		}
		this.setState({
			ksShow: false,
		})
	}
	sendKsList = () => {
		return (
			<div className="send-list">
				<label className="item" onClick={this.showWindows}>
					<span>屏幕截图</span>
				</label>
				<label className="item" onClick={this.closeWindows}>
					<span>隐藏窗口</span>
				</label>
			</div>
		)
	}
	renderSuggestion = (
		suggestion: SuggestionDataItem,
		search: string,
		highlightedDisplay: React.ReactNode,
		index: number,
		focused: boolean
	) => {
		const friend = friendStore.friendMap.get(Number(this.usersList[index].id));
		const name = friend ? friend.remarkName : '';
		return (
			<div
				className={`user ${focused ? 'focused' : ''}`}
				style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
			>
				{name ? name : highlightedDisplay}
			</div>
		);
	};
	changeContent = (e: { target: { value: string } }) => {
		this.setState((state) => ({
			content: e.target.value
		}));
	};
	getName = (name: string) => {
		return `@${name} `;
	};
	singleTransmit = () => {
		this.props.transmitMes(true);
	};
	togetherTransmit = () => {
		this.props.transmitMes(false);
	};
	getPlaceholder = () => {
		if (chatStore.isReply) {
			this.inputDomFocus();
			return '回复消息…';
		} else {
			return '输入消息…';
		}
	};
	getData = async () => {
		this.setState({
			isLoading: true
		});
		const res = await imsdk.getImog();
		if (res && res.resultCode == 1) {
			let defaults = []
			if (res.data) {
				defaults = res.data;
			}
			// console.log('获取的表情数据的长度', defaults.length, "服务端的数据", res)
			if (defaults.length > 0) {
				const emojsList = [{ url: '', name: '' }];
				for (var i = 0; i < defaults.length; i++) {
					if (defaults[i] == null || defaults[i].url == null) {
						continue;
					}
					//    if()
					if (defaults[i].url.length > 1) {
						emojsList[i] = {
							url: defaults[i].url ? defaults[i].url : '',
							name: defaults[i].url ? defaults[i].emojiId : '',
						};
					}

				}
				this.setState({
					list: emojsList
				})
			} else {
				this.setState({
					list: []
				})
			}

		}
		this.setState({
			isLoading: false
		});
	}

	hideMenu = () => {
		this.setState({
			showMenu: false,
		});
	};
	// 全选文本

	selectAllText = () => {
		const textarea = this.mentionDom.current;
		if (!textarea) return;

		textarea.select();
	};


	pasteText = () => {

		const textarea = this.mentionDom.current;
		if (!textarea) return;
		const { clipboard } = electron

		const text = clipboard.readText()
		if (!text) return
		const start = textarea.selectionStart;
		const end = textarea.selectionEnd;
		const newValue = textarea.value.substring(0, start) +
			text +
			textarea.value.substring(end);
		this.setState({
			content: newValue
		})

		message.success('粘贴成功')
	}

	copyText = () => {

		const textarea = this.mentionDom.current;
		if (!textarea) return;

		const selectedText = textarea.value.substring(
			textarea.selectionStart,
			textarea.selectionEnd
		);

		const { clipboard } = electron
		clipboard.writeText(selectedText)
		message.success('复制成功')
	}

	// 文本选择监听
	handleSelectionChange = () => {
		const textarea = this.mentionDom.current;
		if (textarea) {
			const hasTextSelected = textarea.selectionStart !== textarea.selectionEnd;
			this.setState({
				showMenu: hasTextSelected
			})
		}
	};



	usersList: { id: string; display: string }[];
	mentionStyle = { backgroundColor: 'transparent' };
	public render() {
		const imogiList = (
			<div className="imoglist" key={1}>
				<Carousel dots={false} ref={(el) => (this.slider = el)}>
					<div className="imojiPanel">
						{imojiData.map((imoji, index) => {
							return (
								<img
									key={index}
									src={imoji.img}
									alt="imoji"
									onClick={() => {
										this.addImoji(imoji.english);
									}}
								/>
							);
						})}
					</div>
					<div className="addimogPanl" key={2}>
						<ImojiBoard sendImg={this.imageEmog} isLoading={this.state.isLoading} list={this.state.list} getData={this.getData} />
					</div>
				</Carousel>
				<Divider className="divider" />
				<Icon
					type="smile"
					theme="filled"
					style={{ color: '#FFC61E', fontSize: '18px', margin: '5px 10px' }}
					onClick={this.prev}
				/>
				<Icon
					type="heart"
					theme="filled"
					style={{ color: '#E94F4F', fontSize: '18px', margin: '5px 10px' }}
					onClick={this.next}
				/>
			</div>
		);
		// const allMenuId = 'all_mem'
		this.usersList = [];
		Array.from(this.props.groupMemList.values()).forEach((item) => {
			if (item.userId != systemStore.userId) {
				this.usersList.push({
					id: item.userId,
					display: item.nickname
				})
			}
		});
		if (this.props.isGroup && (this.props.chatRole == GroupMemRole.owner || this.props.chatRole == GroupMemRole.manage)) {
			this.usersList.unshift({ id: this.props.groupId, display: '全体成员' } as any);
		}
		if (this.props.isMesSel) {
			return (
				<div className="send-board transmit-wrap">
					<Button onClick={this.singleTransmit} className="transmit-button">
						逐条转发
					</Button>
					<Button type="primary" onClick={this.togetherTransmit} className="transmit-button">
						合并转发
					</Button>
					<Button type="default" onClick={this.props.cancelTransmit} className="transmit-button">
						取消
					</Button>
				</div>
			);
		}



		const isElectron = global['electron'];
		const menuDom = (
			<Menu>
				<Menu.Item key="1" onClick={this.copyText} disabled={!this.state.showMenu}>复制</Menu.Item>
				<Menu.Item key="2" onClick={this.pasteText}>粘贴</Menu.Item>
				<Menu.Item key="3" onClick={this.selectAllText}>全选</Menu.Item>
			</Menu>
		);
		// console.log('好友列表',this.props);
		return (
			<div className="send-board" onPaste={(e) => this.sendBoadPast(e, chatStore.currentChatData.id)}>
				<div className={this.props.isForbit ? 'forbit' : ''}>{this.props.forbitContent}</div>
				<Popover
					placement="topLeft"
					content={this.sendList()}
					trigger="click"
					visible={this.state.sendTypeListShow}
					onVisibleChange={this.handleSendType}
				>
					<span className={isElectron ? "menus-menus-but" : "menus-menus-but-web"}>
						<IconImgEdit img={require('../../assets/image/mes-more-icon.png')} size={20} />
					</span>
				</Popover>
				{this.state.showFriendList ? (
					<SelectFriend
						title="请选择名片"
						isShow={this.state.showFriendList}
						selectConfirm={this.confirmSelected}
						cancel={this.cancelSelect}
						friendList={[...this.props.friendList, { toUserId: systemStore.userId, toNickname: systemStore.nickname } as any]}
					/>
				) : null}
				{this.state.mapShow ? <MapModal cancel={this.hideMap} sendPosition={this.sendPositionMes} /> : null}

				<Popover
					content={imogiList}
					title=""
					placement="topLeft"
					trigger="click"
					visible={this.state.imojiShow}
					onVisibleChange={this.handleVisibleChange}
				>
					<span className={isElectron ? "emoji-item" : "emoji-item-web"} onClick={this.showImojiPanel}>
						<IconImgEdit img={require('../../assets/image/emoji-icon.png')} size={20} />
					</span>
				</Popover>
				{isElectron && !isMac ? <Popover
					content={this.sendKsList()}
					title=""
					placement="top"
					trigger="contextMenu"
					visible={this.state.ksShow}
					onVisibleChange={this.handleKsVisibleChange}
				>
					<span className="screenshot" onClick={this.showScreenshot}>
						<IconImgEdit img={require('../../assets/image/screenshot-icon.png')} size={16} />
					</span>
				</Popover> : null}
				<Dropdown
					overlay={menuDom}
					trigger={['contextMenu']}
				>
					<div style={{ marginRight: "20px" }}>
						<MentionsInput
							value={this.state.content}
							onChange={this.changeContent}
							onKeyDown={this.textAreaKeyDown}
							style={this.defaultStyles}
							inputRef={this.mentionDom}
							placeholder={this.getPlaceholder()}
						>
							<Mention
								trigger="@"
								markup="@__display__ "
								displayTransform={this.getName}
								data={this.usersList}
								renderSuggestion={this.renderSuggestion}
								onAdd={this.onAdd}
								style={this.mentionStyle}
							/>
						</MentionsInput>
					</div>
				</Dropdown>

				{/*全局配置true && 是否为群组 && 是否为群主*/}
				{isOpenDoubleDel && this.props.isGroup && chatStore.currentChatData.role === GroupMemRole.owner ?
					<div className="double-withdraw" onClick={this.showDoubleWithDraw}>
						<IconImgEdit img={require('../../assets/image/double-withdraw.png')} size={16} />
					</div>
					: null}
				<div className="send-but-wrape">
					<Button onClick={this.sendContent} type="primary" size="small" style={{ fontSize: '12px' }}>
						发送(S)
					</Button>
					{/* <Button onClick = {this.testSend}>
						test send
					</Button> */}
				</div>
				{this.state.imgData ? (
					<Modal
						title="图片发送"
						visible={true}
						onOk={() => this.imageSend(this.props.chatId)}
						onCancel={this.imgaModalHide}
						okText={'确定'}
						cancelText={'取消'}
						confirmLoading={this.state.imgLoading}
					>
						<div className="send-image-modal" onKeyDown={this.imageModalKeyDown}>
							<div className="img-wraper">
								<img src={this.state.imgData} alt="" />
							</div>
							<div className="input-wraper ">
								<span className="name">添加图片说明</span>
								<Input
									value={this.state.eidtImageText}
									autoFocus={true}
									onChange={(e) =>
										this.setState({
											eidtImageText: e.target.value
										})}
								/>
							</div>
						</div>
					</Modal>
				) : null}
				{this.state.showDropModal ? (
					<Modal
						title={this.state.showDropTitle}
						visible={true}
						onOk={this.sureDropSend}
						onCancel={this.closeDropSend}
						okText={'确定'}
						cancelText={'取消'}
					>
						<div className="send-image-modal">
							<div className="img-wraper2">
								{
									this.state.currFileType == 'image' ?
										<img src={this.state.currSrc || require('./../../assets/image/image-blue-icon.png')} alt="file" />
										:
										(
											this.state.currFileType == 'video' ?
												<img src={require('./../../assets/image/video-send.png')} alt="file" />
												:
												<img src={require('./../../assets/image/file-send.png')} alt="file" />
										)
								}
								<div style={{ marginTop: '10px' }}>{this.state.currFile['name']}</div>
							</div>
						</div>
					</Modal>
				) : null}
				{this.state.showDropModal2 ? (
					<Modal
						title={this.state.showDropTitle2}
						visible={true}
						onOk={this.sureDropsSend}
						onCancel={this.closeDropSend}
						okText={'确定'}
						cancelText={'取消'}
					>
						<div className="send-image-modal">
							<div className="img-wraper2" style={{ width: '100%' }}>
								{
									this.state.currFiles.map((item: any, index: number) => {
										const type = Utils.getFileType(item.name)
										return <div style={{ marginTop: '10px' }} className="img-wraper3">
											{
												type == 'image' ?
													<img className="im-wraper3-icon" src={require('./../../assets/image/image-blue-icon.png')} alt="file" />
													:
													(
														type == 'video' ?
															<img className="im-wraper3-icon" src={require('./../../assets/image/video-send.png')} alt="file" />
															:
															<img className="im-wraper3-icon" src={require('./../../assets/image/file-send.png')} alt="file" />
													)
											}
											<div style={{ marginLeft: '5px' }}>{item['name']}</div>
										</div>
									})
								}



							</div>
						</div>
					</Modal>
				) : null}
				{this.state.showDoubleWithdraw ? (
					<Modal
						title="双向撤回"
						visible={true}
						onOk={() => this.DoubleWithDraw(this.props.chatId)}
						onCancel={this.closeDoubleWithDraw}
						okText={'确定'}
						cancelText={'取消'}
						confirmLoading={this.state.imgLoading}
						width={340}
						centered={true} //垂直居中
					>
						<div>撤回全部群聊天记录，执行后永久删除所有群成员设备上群聊天记录，并不可恢复。</div>
					</Modal>
				) : null}
				{/* <Button onClick={this.testSend}>
					test send
          </Button> */}
			</div>
		);
	}
}
