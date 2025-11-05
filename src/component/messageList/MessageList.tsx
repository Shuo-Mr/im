import React from 'react';
import { AutoSizer, List, CellMeasurerCache, CellMeasurer, ListRowProps, InfiniteLoader } from 'react-virtualized';
import { MessageItem, MessageStatusType } from '../../interface/IChat';
import MessageItemView from '../../component/messageItem/MessageItem';
import { inject, observer, Observer } from 'mobx-react';
import { ChatStore } from '../../store/ChatStore';
import utils from './../../utils/utils'
import { GroupMemRole } from '../../interface/IGroup';
import { MessageType } from '../../net/Const';
// import { autorun } from 'mobx';

interface IMessageListProps {
	isGroup: boolean;
	isForbidden: boolean;
	canViewInfo: boolean;
	role: number;
	messageStatus: (mesId: string) => MessageStatusType | undefined;
	reSendMes: (msg: MessageItem) => void;
	addUserMentionUser: (memId: string, name: string) => void;
	transmitMes: (isSingle: boolean, mesItem?: MessageItem) => void;
	listForceScroll: number;
	currentChatid: string;
}

interface IMessageListPropsWithStore extends IMessageListProps {
	chatStore: ChatStore;
}

interface IMessageListState {
	updateNum: number;
	mesList: MessageItem[];
	id: string;
	isRowLoaded: boolean;
	getMesLoading: boolean;
}

@inject('chatStore')
@observer
export class MessageListEdit extends React.Component<IMessageListProps, IMessageListState> {
	constructor(props: IMessageListProps) {
		super(props);
		const id = this.injected.chatStore.currentChatData.id;
		const chatList = this.injected.chatStore.messageData.get(id);
		this.state = {
			updateNum: 0,
			mesList: chatList ? chatList : [],
			id,
			isRowLoaded: true,
			getMesLoading: false
		};
	}
	get injected() {
		return this.props as IMessageListPropsWithStore;
	}
	mesListDom: List | null;
	timerUpdate: NodeJS.Timeout;
	canscroll: boolean = true;
	componentDidMount() {
		this.mesListScroll();
	}
	static getDerivedStateFromProps(nextProps: IMessageListProps, prevState: IMessageListState) {
		const chatStore = (nextProps as IMessageListPropsWithStore).chatStore;
		let thisChatMes = chatStore.messageData.get(chatStore.currentChatData.id);
		thisChatMes = thisChatMes ? thisChatMes : [];
		if (
			chatStore.currentChatData.id != prevState.id ||
			thisChatMes != prevState.mesList ||
			thisChatMes.length != prevState.mesList.length
		) {
			return {
				updateNum: prevState.updateNum + 1,
				mesList: thisChatMes,
				id: chatStore.currentChatData.id
			};
		}
		return {
			mesList: thisChatMes,
			id: chatStore.currentChatData.id
		};
	}

	componentDidUpdate(preProps: any, prevState: IMessageListState) {
		if (prevState.id != this.state.id) {
			this.setState({
				getMesLoading: false
			});
			this.hasNextPage = true;
			this.canGetMessage = false;
			this.cache && this.cache.clearAll();
			this.mesListScroll();
		} else if (prevState.updateNum != this.state.updateNum) {
			this.canscroll && this.mesListScroll();
		}
		if (this.props.listForceScroll != preProps.listForceScroll) {
			this.mesListScroll();
		}
	}
	scrollTimer: NodeJS.Timeout;
	mesListScroll = (index?: number) => {
		const thisChatMes = this.injected.chatStore.messageData.get(this.injected.chatStore.currentChatData.id);
		const mesListDom = this.mesListDom;

		if (mesListDom && thisChatMes) {
			this.scrollTimer = setTimeout(() => {
				this.scrollTimer && clearTimeout(this.scrollTimer);
				mesListDom.scrollToRow(index || thisChatMes.length);
				if (!this.canGetMessage) {
					this.canGetMessage = true;
				}
			}, 400);
		}
	};
	componentWillUnmount() {
		this.timerUpdate && clearTimeout(this.timerUpdate);
		this.scrollTimer && clearTimeout(this.scrollTimer);
	}
	cache = new CellMeasurerCache({ defaultHeight: 76, fixedWidth: true });
	cellRenderer = ({ index, key, parent, style }: ListRowProps) => {
		const list = this.injected.chatStore.messageData.get(this.injected.chatStore.currentChatData.id);
		if (list) {
			const message = list[index];
			if (!message) {
				return null
			}
			const isMesSel = this.injected.chatStore.isMesSel;
			const isCheck = this.injected.chatStore.selectedMes.has(message.messageId + '');
			return (
				<CellMeasurer
					cache={this.cache}
					columnIndex={0}
					key={message.messageId}
					parent={parent}
					rowIndex={index}
				>
					<div style={{ ...style, padding: '0 8px' }}>
						<MessageItemView
							isMesSel={isMesSel}
							isCheck={isCheck}
							switchMesCheck={this.injected.chatStore.switchMesCheck}
							canViewInfo={this.props.canViewInfo}
							reSendMes={this.props.reSendMes}
							key={message.messageId}
							keyIndex={index + ''}
							messages={message}
							onClickReplay={(d) => {
								const idx = list.findIndex((i) => i.messageId === d)
								if (idx !== -1) {
									this.mesListScroll(idx)
								}
							}}
							messageStatus={this.props.messageStatus(message.messageId)}
							isGroup={this.props.isGroup}
							isForbidden={this.props.isForbidden}
							role={this.props.role}
							addmentionUser={this.props.addUserMentionUser}
							transmitMes={this.props.transmitMes}
							showTransmitModal={this.injected.chatStore.switchShowMesSel}
							showTransMesListModal={this.injected.chatStore.showTransMesListModal}
							unreadCount={message.unreadCount}
						/>
					</div>
				</CellMeasurer>
			);
		}
		return null;
	};
	cellRendererWithObserver = ({ ...propData }: ListRowProps) => {
		return <Observer key={propData.key}>{() => this.cellRenderer({ ...propData })}</Observer>;
	};
	getIsBottom = (
		v: {
			startIndex: number;
			stopIndex: number;
		},
		list: any[]
	) => {
		const index = v.stopIndex;
		const startIndex = v.startIndex;
		// console.log('当前index',v);
		if (startIndex < 2) {
			this.loadMoreRows();
		}
		const dataNumber = Array.isArray(list) ? list.length : 0;
		if (dataNumber > 10000) {
			return index - list.length - 70;
		} else if (dataNumber > 1000) {
			return index - list.length - 30;
		} else if (dataNumber > 100) {
			return index - list.length - 10;
		} else if (dataNumber > 30) {
			return index - list.length - 3;
		} else {
			return index - list.length - 2;
		}
	};
	hasNextPage: boolean = true;
	canGetMessage: boolean = false;
	isRowLoaded = ({ index }: { index: number }) => {
		const listGet = this.injected.chatStore.messageData.get(this.injected.chatStore.currentChatData.id);
		const list = listGet ? listGet : [];
		return !this.hasNextPage || index < list.length;
	};
	getMoreMessages = async () => {
		this.setState({
			getMesLoading: true
		});
		const listGet = this.injected.chatStore.messageData.get(this.injected.chatStore.currentChatData.id);
		const list = listGet ? listGet : [];
		if (list.length > 0) {
			const startTime = list[0].timeSend;
			this.canGetMessage = false;
			const { hasMore } = await this.injected.chatStore.getChatMessages(
				this.injected.chatStore.currentChatData.id,
				startTime,
				this.props.isGroup,
				undefined,
				undefined,
				this.props.isGroup ? this.injected.chatStore.currentChatData.gid : ''
			);
			// console.log('获取是否还有数据', hasMore,amount);
			this.hasNextPage = hasMore;
			setTimeout(() => {
				this.mesListDom && this.mesListDom.forceUpdate(() => console.log('长列表更新完成'));
			}, 200);
		}
		this.canGetMessage = true;
		this.setState({
			getMesLoading: false
		});
	};
	loadMoreRows: any = () => {
		// console.log('获取当前index', this.state.getMesLoading, this.canGetMessage, this.hasNextPage);
		if (!this.state.getMesLoading && this.canGetMessage && this.hasNextPage) {
			this.getMoreMessages();
		}
	};
	render() {
		const listGet = this.injected.chatStore.messageData.get(this.injected.chatStore.currentChatData.id);
		const list = listGet ? listGet : [];
		return (
			<InfiniteLoader isRowLoaded={this.isRowLoaded} loadMoreRows={this.loadMoreRows}>
				{({ onRowsRendered, registerChild }) => (
					<AutoSizer>
						{({ height, width }) => (
							<List
								ref={(ref) => {
									this.mesListDom = ref;
								}}
								height={height}
								rowCount={list.length}
								rowHeight={this.cache.rowHeight}
								deferredMeasurementCache={this.cache}
								rowRenderer={this.cellRendererWithObserver}
								width={width}
								overscanRowCount={5}
								onRowsRendered={(v) => {
									return this.getIsBottom(v, list);
								}}
							/>
						)}
					</AutoSizer>
				)}
			</InfiniteLoader>
		);
	}
}

interface IMessageListStateEdit { }
interface IMessageListPropsEdit {
	isGroup: boolean;
	isForbidden: boolean;
	canViewInfo: boolean;
	role: number;
	messageStatus: (mesId: string) => MessageStatusType | undefined;
	reSendMes: (msg: MessageItem) => void;
	addUserMentionUser: (memId: string, name: string) => void;
	// content:string;
	transmitMes: (isSingle: boolean, mesItem?: MessageItem) => void;
	listForceScroll: number;
	list: MessageItem[];
	updateCallBack: () => void;
	currentChatid: string
}
interface IMessageListPropsEditWithStore extends IMessageListPropsEdit {
	chatStore: ChatStore;
}
@inject('chatStore')
@observer
export class MessageList extends React.Component<IMessageListPropsEdit, IMessageListStateEdit> {
	get injected() {
		return this.props as IMessageListPropsEditWithStore;
	}
	newTime = 0;
	componentDidUpdate(preProps: IMessageListPropsEditWithStore) {
		// const mesList = this.injected.chatStore.messageData.get(this.injected.chatStore.currentChatData.id);
		// if(mesList && mesList.length > 0 && mesList[mesList.length - 1]){
		// 	if(Number(mesList[mesList.length - 1].timeSend) > this.newTime && this.messagesEnd && this.messagesList){
		// 		console.log('需要置地',this.messagesList.scrollTop);
		// 		this.messagesEnd.scrollIntoView();
		// 	}
		// 	this.newTime = Number(mesList[mesList.length - 1].timeSend);
		// }
		this.props.updateCallBack();
		// console.log('消息列表渲染更新完2');
	}
	messagesEnd: HTMLDivElement | null;
	messagesList: HTMLDivElement | null;

	render() {
		const listGet = this.props.list;
		if (!listGet) {
			return null;
		}
		return <div ref={ref => this.messagesList = ref}>
			{
				listGet.map((mes, index) => {
					let message = mes;

					if (!message || !(message.toUserId == this.props.currentChatid
						|| message.fromUserId == this.props.currentChatid
						|| message.toJid == this.props.currentChatid
						|| message.roomJid == this.props.currentChatid
						|| (message.roomJid && message.roomJid.indexOf(this.props.currentChatid) > -1)
					)) {
						return null;
					}
					const isMesSel = this.injected.chatStore.isMesSel;
					const isCheck = this.injected.chatStore.selectedMes.has(message.messageId + '');
					if (
						(
							message.type == MessageType.DELETE_MEMBER ||
							message.contentType == MessageType.DELETE_MEMBER ||
							message.type == MessageType.GAG ||
							message.contentType == MessageType.GAG ||
							message.type == MessageType.REVOKE ||
							message.contentType == MessageType.REVOKE
						) &&
						!(this.props.role == GroupMemRole.manage || this.props.role == GroupMemRole.owner)
					) {
						return null
					}
					if (utils.isSkipWithGroupTips(message.type) || !message.content) {
						// 	//todo 此处群控制消息  暂且不做渲染
						return null
					}
					return (
						<div id={message.messageId}>
							<MessageItemView
								isMesSel={isMesSel}
								isCheck={isCheck}
								switchMesCheck={this.injected.chatStore.switchMesCheck}
								canViewInfo={this.props.canViewInfo}
								reSendMes={this.props.reSendMes}
								key={message.messageId + index}
								keyIndex={index + ''}
								messages={message}
								messageStatus={this.props.messageStatus(message.messageId)}
								isGroup={this.props.isGroup}
								isForbidden={this.props.isForbidden}
								role={this.props.role}
								onClickReplay={(d) => {
									const element = document.getElementById(`${d}`);
									if (element) {
										element.scrollIntoView({ behavior: 'smooth' });
									}
								}}
								addmentionUser={this.props.addUserMentionUser}
								transmitMes={this.props.transmitMes}
								showTransmitModal={this.injected.chatStore.switchShowMesSel}
								showTransMesListModal={this.injected.chatStore.showTransMesListModal}
								unreadCount={message.unreadCount}
							/>
						</div>
					);
				})
			}
		</div>;
	}
}
