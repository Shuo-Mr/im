import * as React from 'react';
import './QuickReplySidebar.less';
import Pagination from 'antd/es/Pagination';
import Icon from 'antd/es/icon';
import { observer, inject } from 'mobx-react';
import { ChatStore } from '../../store/ChatStore';
import webIM from '../../net/WebIM';
import { MessageType } from '../../net/Const';
import message from 'antd/es/message';
import Spin from 'antd/es/spin';
import imsdk from '../../net/IMSDK';

export interface IQuickReplyItem {
	id: string;
	content: string;
	category?: string;
}

export interface IQuickReplySidebarProps {
}

interface IQuickReplySidebarPropsWithStore extends IQuickReplySidebarProps {
	chatStore: ChatStore;
}

export interface IQuickReplySidebarState {
	quickReplyList: IQuickReplyItem[];
	currentPage: number;
	pageSize: number;
	total: number;
	loading: boolean;
	searchKeyword: string;
}

@inject('chatStore')
@observer
export default class QuickReplySidebar extends React.Component<IQuickReplySidebarProps, IQuickReplySidebarState> {
	get injected() {
		return this.props as IQuickReplySidebarPropsWithStore;
	}
	constructor(props: IQuickReplySidebarProps) {
		super(props);
		this.state = {
			quickReplyList: [],
			currentPage: 1,
			pageSize: 10,
			total: 0,
			loading: false,
			searchKeyword: ''
		};
	}

	handlePageChange = (page: number, pageSize?: number) => {
		const newPageSize = pageSize || this.state.pageSize;
		this.setState({
			currentPage: page,
			pageSize: newPageSize
		}, () => {
			// 分页改变时重新加载数据
			this.loadQuickReplyList(this.state.searchKeyword, page - 1, newPageSize);
		});
	}

	sendQuickReply = (item: IQuickReplyItem) => {
		const { chatStore } = this.injected;
		const content = item.content;
		const chatId = chatStore.currentChatData.id;
		
		// 检查是否有当前聊天
		if (!chatId) {
			message.warn('请先选择一个聊天');
			return;
		}
		
		if (!content) {
			message.warn('不能发送空内容');
			return;
		}
		
		// 查找聊天项
		const chatItem = chatStore.chats.find((item) => item.id == chatId);
		
		if (!chatItem) {
			message.warn('聊天不存在');
			return;
		}
		
		// 创建消息对象
		const _msgData = {
			type: chatStore.isReply ? 94 : MessageType.TEXT,
			content,
			toUserId: chatId,
			toUserName: chatItem.name || chatStore.currentChatData.name || ''
		};
		
		const msg = webIM.createMessage(_msgData.type, _msgData.content, _msgData.toUserId, _msgData.toUserName);
		
		// 设置阅后即焚
		if (chatItem) {
			msg.isReadDel = chatItem.snapChat;
		}
		
		// 回复消息
		if (chatStore.isReply) {
			msg.objectId = JSON.stringify(chatStore.replyMessage);
		}
		
		// 发送消息
		webIM.sendMessage(msg, '');
		
		// 添加到聊天记录
		chatStore.addMessage(chatId, msg, true);
		
		// 更新聊天数据
		chatStore.updateMes(msg.content, msg.timeSend + '');
	}

	handleItemClick = (item: IQuickReplyItem) => {
		this.sendQuickReply(item);
	}

	handleKeyDown = (e: KeyboardEvent) => {
		// 防止在输入框中触发
		const target = e.target as HTMLElement;
		if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
			return;
		}

		// F1-F10 的 keyCode: F1=112, F2=113, ..., F10=121
		// 或者使用 key 属性: 'F1', 'F2', ..., 'F10'
		let fKeyNumber: number | null = null;
		
		if (e.key && e.key.startsWith('F')) {
			const keyMatch = e.key.match(/^F(\d+)$/);
			if (keyMatch) {
				fKeyNumber = parseInt(keyMatch[1]);
			}
		} else if (e.keyCode >= 112 && e.keyCode <= 121) {
			// F1-F10 对应的 keyCode
			fKeyNumber = e.keyCode - 111; // F1=1, F2=2, ..., F10=10
		}

		if (fKeyNumber && fKeyNumber >= 1 && fKeyNumber <= 10) {
			// 获取当前页面显示的快捷回复数据（使用当前状态中的列表）
			const itemIndex = fKeyNumber - 1;
			const quickReplyItem = this.state.quickReplyList[itemIndex];
			
			if (quickReplyItem) {
				e.preventDefault(); // 阻止浏览器默认行为
				this.sendQuickReply(quickReplyItem);
			}
		}
	}

	loadQuickReplyList = async (keyword: string = '', pageIndex: number = 0, pageSize: number = 10) => {
		this.setState({ loading: true });
		try {
			const result = await imsdk.searchChatShortcut(keyword, pageIndex, pageSize);
			if (result && result.resultCode === 1 && result.data) {
				const apiData = result.data;
				// 转换API数据为组件需要的格式
				const quickReplyList: IQuickReplyItem[] = (apiData.pageData || []).map((item: any, index: number) => ({
					id: item.id || `reply-${index}`,
					content: item.content || '',
					category: index < 10 ? `F${index + 1}` : undefined
				}));
				
				this.setState({
					quickReplyList,
					total: apiData.total || 0,
					currentPage: pageIndex + 1, // 转换为1开始的页码
					pageSize: apiData.pageSize || pageSize,
					searchKeyword: keyword
				});
			} else {
				message.error('获取快捷回复列表失败');
				this.setState({
					quickReplyList: [],
					total: 0
				});
			}
		} catch (error) {
			console.error('加载快捷回复列表失败:', error);
			message.error('加载快捷回复列表失败');
			this.setState({
				quickReplyList: [],
				total: 0
			});
		} finally {
			this.setState({ loading: false });
		}
	}

	componentDidMount() {
		// 添加键盘事件监听
		window.addEventListener('keydown', this.handleKeyDown);
		// 加载快捷回复列表
		this.loadQuickReplyList();
	}

	componentWillUnmount() {
		// 移除键盘事件监听
		window.removeEventListener('keydown', this.handleKeyDown);
	}

	render() {
		const { currentPage, pageSize, total, quickReplyList } = this.state;

		return (
			<div className="quick-reply-sidebar show">
				<div className="quick-reply-header">
					<span className="quick-reply-title">快捷回复</span>
				</div>
				<div className="quick-reply-content">
					{this.state.loading ? (
						<div className="quick-reply-loading">
							<Spin size="small" />
							<span style={{ marginLeft: '8px' }}>加载中...</span>
						</div>
					) : quickReplyList.length > 0 ? (
						<>
							<div className="quick-reply-list">
								{quickReplyList.map((item) => (
									<div 
										key={item.id} 
										className="quick-reply-item"
										onClick={() => this.handleItemClick(item)}
									>
										<div className="quick-reply-item-content">
											<Icon type="message" className="quick-reply-icon" />
											<span className="quick-reply-text">{item.content}</span>
										</div>
										{item.category && (
											<span className="quick-reply-category">{item.category}</span>
										)}
									</div>
								))}
							</div>
							<div className="quick-reply-pagination">
								<Pagination
									current={currentPage}
									pageSize={pageSize}
									total={total}
									onChange={this.handlePageChange}
									size="small"
									showSizeChanger={false}
									showQuickJumper={false}
									showTotal={(total, range) => `${range[0]}-${range[1]} 共 ${total} 条`}
								/>
							</div>
						</>
					) : (
						<div className="quick-reply-placeholder">
							暂无快捷回复
						</div>
					)}
				</div>
			</div>
		);
	}
}

