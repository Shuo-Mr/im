import * as React from 'react';
import Collapse from 'antd/es/collapse/Collapse';
import { RouteComponentProps } from 'react-router';
import { inject, observer, Observer } from 'mobx-react';
import { FriendStore } from '../../store/FriendStore';
import { ChatStore } from '../../store/ChatStore';
import { GroupStore } from '../../store/GroupStore';
import { NavLink } from 'react-router-dom';
import { FriendItem } from '../../interface/IFriend';
import { GroupItem } from '../../interface/IGroup';
import './group.less';
import { AvatorWithPhoto } from '../../component/avatorWithPhoto/AvatorWithPhoto';
import { ChatGrOrFrType } from '../../interface/IChat';
import { MainStore } from '../../store/MainStore';
import { tr } from '../../i18n/tr';
import { RequestStore } from '../../store/RequestStore';
import { List as VList } from 'react-virtualized/dist/es/List';
import { AutoSizer } from 'react-virtualized/dist/es/AutoSizer';
import { CellMeasurer, CellMeasurerCache } from 'react-virtualized/dist/es/CellMeasurer';
import deviceManager from '../../net/DeviceManager';
import Badge from 'antd/es/badge';
import { FriendGroupStore } from '../../store/FriendGroupStore';
import { FriendGroupItem } from '../../interface/IFriendGroup';
import Dropdown from 'antd/es/dropdown';
import Menu from 'antd/es/menu';
import Modal from 'antd/es/modal';
import { InputModalView } from '../../component/InputModal/InputModalView';
import { AddUserToTagSelect } from './AddUserToTagSelect';
import message from 'antd/es/message';
const Panel = Collapse.Panel;

export interface IGroupProps extends RouteComponentProps {
	noRead: number;
}
interface WithStoreGroup extends IGroupProps {
	friendStore: FriendStore;
	chatStore: ChatStore;
	groupStore: GroupStore;
	mainStore: MainStore;
	requestStore: RequestStore;
	friendGroupStore: FriendGroupStore;
}
export interface IGroupState {
	openKeys: string[];
	fHeights: any[];
	// friends: FriendItem[],
	// groups: GroupItem[],
	gHeights: any[];
	showAddTagModal: boolean;
	showEditTagModal: boolean;
	showAddUserModal: boolean;
	showDeleteConfirm: boolean;
	currentGroup: FriendGroupItem | null;
	editTagName: string;
	selectedFriends: FriendItem[];
	expandedTags: Set<string>; // 展开的标签ID集合
	selectedList: FriendItem[]; // 已选中的用户列表（用于 AddUserToTagSelect）
	excludeUserIds: string[]; // 需要排除的用户ID列表（已在标签中的用户）
}
@inject('friendStore', 'chatStore', 'groupStore', 'mainStore', 'requestStore', 'friendGroupStore')
@observer
export default class GroupView extends React.Component<IGroupProps, IGroupState> {
	constructor(props: IGroupProps) {
		super(props);

		this.state = {
			openKeys: ['friend'],
			fHeights: [],
			gHeights: [],
			showAddTagModal: false,
			showEditTagModal: false,
			showAddUserModal: false,
			showDeleteConfirm: false,
			currentGroup: null,
			editTagName: '',
			selectedFriends: [],
			expandedTags: new Set<string>(), // 默认所有标签都是收起的
			selectedList: [], // 已选中的用户列表
			excludeUserIds: [] // 需要排除的用户ID列表
			// friends: [],
			// groups: [],
		};
	}

	componentDidMount() {
		// 加载标签分组列表
		this.injected.friendGroupStore.setFriendGroupList();
	}
	rootSubmenuKeys = ['request', 'group', 'friend'];
	get injected() {
		return this.props as WithStoreGroup;
	}

	onOpenChange = (openKeys: string[]) => {
		const latestOpenKey = openKeys.find((key) => this.state.openKeys.indexOf(key) === -1);
		if (latestOpenKey && this.rootSubmenuKeys.indexOf(latestOpenKey) === -1) {
			this.setState({ openKeys });
		} else {
			this.setState({
				openKeys: latestOpenKey ? [latestOpenKey] : []
			});
		}
	};

	onClick = (id: string) => {
		this.injected.chatStore.changeSelectChat(id);
	};

	goFriendChat = (friend: FriendItem) => {
		this.injected.chatStore.changeCurrentChat(friend);
	};

	goGroupChat = (group: GroupItem) => {
		this.injected.chatStore.changeCurrentChat(group);
	};

	showRequest = () => {
		this.injected.chatStore.goNewFriend();
		deviceManager.sendUpdateSelfInfoMsg();
		this.injected.requestStore.readRequest();
	};

	measureFriendCache = new CellMeasurerCache({
		fixedWidth: true,
		minHeight: 100
	});

	measureGroupCache = new CellMeasurerCache({
		fixedWidth: true,
		minHeight: 100
	});

	getFHeight = (data: { index: number }) => {
		const row = this.state.fHeights.find((item) => item.index == data.index);
		return row ? row.height : 100;
	};

	getGHeight = (data: { index: number }) => {
		const row = this.state.gHeights.find((item) => item.index == data.index);
		return row ? row.height : 100;
	};

	// 添加标签
	handleAddTag = () => {
		this.setState({ showAddTagModal: true });
	};

	handleAddTagOk = async (tagName: string) => {
		if (!tagName || tagName.trim() === '') {
			message.warning('请输入标签名称');
			return;
		}
		const success = await this.injected.friendGroupStore.addFriendGroup(tagName.trim());
		if (success) {
			this.setState({ showAddTagModal: false });
		}
	};

	handleAddTagCancel = () => {
		this.setState({ showAddTagModal: false });
	};

	// 编辑标签名
	handleEditTag = (group: FriendGroupItem) => {
		this.setState({ 
			showEditTagModal: true, 
			currentGroup: group,
			editTagName: group.groupName 
		});
	};

	handleEditTagOk = async (tagName: string) => {
		if (!tagName || tagName.trim() === '') {
			message.warning('请输入标签名称');
			return;
		}
		if (this.state.currentGroup) {
			const success = await this.injected.friendGroupStore.updateFriendGroup(
				this.state.currentGroup.groupId,
				tagName.trim()
			);
			if (success) {
				this.setState({ showEditTagModal: false, currentGroup: null, editTagName: '' });
			}
		}
	};

	handleEditTagCancel = () => {
		this.setState({ showEditTagModal: false, currentGroup: null, editTagName: '' });
	};

	// 删除标签
	handleDeleteTag = (group: FriendGroupItem) => {
		this.setState({ 
			showDeleteConfirm: true, 
			currentGroup: group 
		});
	};

	handleDeleteConfirmOk = async () => {
		if (this.state.currentGroup) {
			const success = await this.injected.friendGroupStore.deleteFriendGroup(
				this.state.currentGroup.groupId
			);
			if (success) {
				this.setState({ showDeleteConfirm: false, currentGroup: null });
			}
		}
	};

	handleDeleteConfirmCancel = () => {
		this.setState({ showDeleteConfirm: false, currentGroup: null });
	};

	// 添加用户到标签
	handleAddUser = (group: FriendGroupItem) => {
		// 获取当前标签中已有的用户ID列表
		const existingUserIds = this.injected.friendGroupStore.getFriendsByGroupId(
			group.groupId
		).map(f => f.toUserId.toString());
		
		this.setState({ 
			showAddUserModal: true, 
			currentGroup: group,
			selectedList: [], // 重置选中列表
			excludeUserIds: existingUserIds // 设置需要排除的用户ID
		});
	};

	// 选择用户（用于 MemberSelect）
	selectUserItem = (item: FriendItem) => {
		const selectedList = this.state.selectedList.slice();
		// 检查是否已选中
		const index = selectedList.findIndex(f => f.toUserId === item.toUserId);
		if (index === -1) {
			selectedList.push(item);
		}
		this.setState({ selectedList });
	};

	// 移除已选中的用户（用于 MemberSelect）
	removeUserItem = (item: FriendItem) => {
		const selectedList = this.state.selectedList.filter(f => f.toUserId !== item.toUserId);
		this.setState({ selectedList });
	};

	handleAddUserConfirm = async () => {
		if (this.state.currentGroup && this.state.selectedList.length > 0) {
			// 获取当前标签下的用户ID列表
			const currentUserIds = this.injected.friendGroupStore.getFriendsByGroupId(
				this.state.currentGroup.groupId
			).map(f => f.toUserId.toString());
			
			// 合并新选择的用户ID
			const newUserIds = this.state.selectedList.map(f => f.toUserId.toString());
			const allUserIds = Array.from(new Set(currentUserIds.concat(newUserIds)));
			
			const success = await this.injected.friendGroupStore.updateGroupUserList(
				this.state.currentGroup.groupId,
				allUserIds
			);
			if (success) {
				this.setState({ 
					showAddUserModal: false, 
					currentGroup: null, 
					selectedList: [] 
				});
			}
		}
	};

	handleAddUserCancel = () => {
		this.setState({ 
			showAddUserModal: false, 
			currentGroup: null, 
			selectedList: [],
			excludeUserIds: []
		});
	};

	// 从标签中移除用户
	handleRemoveUserFromTag = async (group: FriendGroupItem, friend: FriendItem) => {
		// 获取当前标签下的用户ID列表
		const currentUserIds = this.injected.friendGroupStore.getFriendsByGroupId(
			group.groupId
		).map(f => f.toUserId.toString());
		
		// 移除指定的用户ID
		const updatedUserIds = currentUserIds.filter(userId => userId !== friend.toUserId.toString());
		
		const success = await this.injected.friendGroupStore.updateGroupUserList(
			group.groupId,
			updatedUserIds
		);
		if (success) {
			message.success('已从标签中移除用户');
		}
	};

	// 切换标签的展开/收起状态
	toggleTagExpand = (groupId: string) => {
		const expandedTags = new Set(this.state.expandedTags);
		if (expandedTags.has(groupId)) {
			expandedTags.delete(groupId);
		} else {
			expandedTags.add(groupId);
		}
		this.setState({ expandedTags });
	};


	public render() {
		let groups = this.injected.groupStore.groupList;
		let friends = this.injected.friendStore.friendList;
		// let groups = this.injected.groupStore.groupList
		// 	.filter((item) => {
		// 		const fileText = this.injected.mainStore.filterTxt;
		// 		if (!fileText) {
		// 			return true;
		// 		}
		// 		if (item.name.indexOf(fileText) > -1) {
		// 			return true;
		// 		}
		// 		return false;
		// 	})
		// 	.slice();

		// let friends = this.injected.friendStore.friendList
		// 	.filter((item) => {
		// 		const fileText = this.injected.mainStore.filterTxt;
		// 		if (!fileText) {
		// 			return true;
		// 		}
		// 		if (
		// 			(item.remarkName && item.remarkName.indexOf(fileText) > -1) ||
		// 			(item.toNickname && item.toNickname.indexOf(fileText) > -1)
		// 		) {
		// 			return true;
		// 		}
		// 		return false;
		// 	})
		// 	.slice();

		const renderItemGroup = ({ index, key, parent, style }: any) => {
			return (
				<CellMeasurer
					cache={this.measureGroupCache}
					key={key}
					parent={parent}
					columnIndex={index}
					bordered={false}
				>
					{/* <Menu.Item key={groups[data.index].id}> */}

					<NavLink
						style={style}
						to={`${this.props.match.url}/${groups[index].id}`}
						onClick={() => this.goGroupChat(groups[index])}
						activeClassName="selected"
						className="list-new-item"
					>
						<AvatorWithPhoto 
						size={40}
						type={ChatGrOrFrType.group} 
						id={groups[index].jid} classN="userphoto"
						 />
						<span className="item-right friend-name">{groups[index].name}</span>
					</NavLink>
					{/* </Menu.Item> */}
				</CellMeasurer>
			);
		};

		const renderItemFriend = ({ index, key, parent, style }: any) => {
			return (
				<CellMeasurer
					cache={this.measureFriendCache}
					columnIndex={index}
					key={`${this.props.match.url}/${friends[index].toUserId}`}
					parent={parent}
					bordered={false}
				>
					{/* <Menu.Item key={friends[data.index].toUserId}> */}
					<NavLink
						style={style}
						to={`${this.props.match.url}/${friends[index].toUserId}`}
						onClick={() => this.goFriendChat(friends[index])}
						activeClassName="selected"
						className="list-new-item"
					>
						<AvatorWithPhoto
							size={40}
							type={ChatGrOrFrType.group}
							id={friends[index].toUserId + ''}
							classN="head userphoto"
						/>
						<span className="item-right friend-name">
							{friends[index].remarkName || friends[index].toNickname}
						</span>
					</NavLink>
					{/* </Menu.Item> */}
				</CellMeasurer>
			);
		};

		// 渲染标签分组中的好友
		const renderFriendInGroup = (group: FriendGroupItem) => {
			const groupFriends = this.injected.friendGroupStore.getFriendsByGroupId(group.groupId);
			if (groupFriends.length === 0) {
				return null;
			}
			return groupFriends.map((friend) => {
				const friendMenu = (
					<Menu>
						<Menu.Item key="remove" onClick={() => this.handleRemoveUserFromTag(group, friend)}>
							移出标签
						</Menu.Item>
					</Menu>
				);
				return (
					<Dropdown
						key={`${group.groupId}-${friend.toUserId}`}
						overlay={friendMenu}
						trigger={['contextMenu']}
					>
						<NavLink
							to={`${this.props.match.url}/${friend.toUserId}`}
							onClick={() => this.goFriendChat(friend)}
							activeClassName="selected"
							className="list-new-item"
						>
							<AvatorWithPhoto
								size={40}
								type={ChatGrOrFrType.group}
								id={friend.toUserId + ''}
								classN="head userphoto"
							/>
							<span className="item-right friend-name">
								{friend.remarkName || friend.toNickname}
							</span>
						</NavLink>
					</Dropdown>
				);
			});
		};

		const friendGroups = this.injected.friendGroupStore.groupList;

		return (
			<div className="chart-list">
				<div onClick={this.showRequest} className="list-item">
					<span className="name ">
						<Badge dot={this.injected.requestStore.haveUnreadReq > 0} style={{zIndex:1}}>{tr(21)}</Badge>
					</span>
				</div>
				<Collapse defaultActiveKey={['2']} accordion bordered={false} >
					{/* 标签列表 */}
					<Panel 
						header={
							<Dropdown
								overlay={
									<Menu>
										<Menu.Item key="add" onClick={this.handleAddTag}>增加标签</Menu.Item>
									</Menu>
								}
								trigger={['contextMenu']}
							>
								<div style={{ display: 'block', width: '100%', height: '100%' }}>
									标签
								</div>
							</Dropdown>
						} 
						key="3" 
						id="contact-friendgroup-list" 
						forceRender={false}
					>
						{friendGroups.length > 0 ? (
							friendGroups.map((group) => {
								const groupMenu = (
									<Menu>
										<Menu.Item key="edit" onClick={() => this.handleEditTag(group)}>修改标签名</Menu.Item>
										<Menu.Item key="addUser" onClick={() => this.handleAddUser(group)}>添加用户</Menu.Item>
										<Menu.Item key="delete" onClick={() => this.handleDeleteTag(group)}>删除标签</Menu.Item>
									</Menu>
								);
								const isExpanded = this.state.expandedTags.has(group.groupId);
								const friendCount = this.injected.friendGroupStore.getFriendsByGroupId(group.groupId).length;
								return (
									<div key={group.groupId} style={{ marginBottom: '8px' }}>
										<Dropdown
											overlay={groupMenu}
											trigger={['contextMenu']}
										>
											<div 
												style={{ 
													padding: '8px 16px', 
													fontWeight: 'bold', 
													color: 'var(--secondary-text-color)',
													cursor: 'pointer',
													display: 'flex',
													alignItems: 'center',
													userSelect: 'none'
												}}
												onClick={() => this.toggleTagExpand(group.groupId)}
											>
												<span style={{ 
													marginRight: '8px',
													display: 'inline-block',
													transition: 'transform 0.2s',
													transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)'
												}}>▶</span>
												<span>{group.groupName} ({friendCount})</span>
											</div>
										</Dropdown>
										{isExpanded && renderFriendInGroup(group)}
									</div>
								);
							})
						) : (
							<div style={{ padding: '16px', textAlign: 'center', color: 'var(--secondary-text-color)' }}>
								暂无标签，右键点击"标签"标题可添加标签
							</div>
						)}
					</Panel>
					<Panel header={tr(22)} key="1" id="contact-newfriend-list" forceRender={false}>
						<AutoSizer>
							{({ width, height }) => (
								<VList
									rowHeight={60}
									width={width}
									height={height}
									overscanRowCount={10}
									rowCount={groups.length}
									rowRenderer={renderItemGroup}
								/>
							)}
						</AutoSizer>
					</Panel>
					<Panel header={tr(23)} key="2" id="contact-myfriend-list" forceRender={false}>
						<AutoSizer>
							{({ width, height }) => (
								<VList
									rowHeight={60}
									width={width}
									height={height}
									overscanRowCount={10}
									rowCount={friends.length}
									rowRenderer={({ ...props }) => (
										<Observer key = {props.key}>
										  {() => renderItemFriend({ ...props })}
										</Observer>
									  )}
								/>
							)}
						</AutoSizer>
					</Panel>
				</Collapse>
				{/* 添加标签Modal */}
				{this.state.showAddTagModal && (
					<InputModalView
						title="添加标签"
						label="标签名称"
						value=""
						closeModal={this.handleAddTagCancel}
						isOk={this.handleAddTagOk}
						isLoading={false}
					/>
				)}
				{/* 编辑标签名Modal */}
				{this.state.showEditTagModal && (
					<InputModalView
						title="修改标签名"
						label="标签名称"
						value={this.state.editTagName}
						closeModal={this.handleEditTagCancel}
						isOk={this.handleEditTagOk}
						isLoading={false}
					/>
				)}
				{/* 删除标签确认Modal */}
				{this.state.showDeleteConfirm && (
					<Modal
						title="删除标签"
						visible={true}
						onOk={this.handleDeleteConfirmOk}
						onCancel={this.handleDeleteConfirmCancel}
						okText="确定"
						cancelText="取消"
					>
						<p>确定要删除标签"{this.state.currentGroup && this.state.currentGroup.groupName}"吗？</p>
					</Modal>
				)}
				{/* 添加用户到标签Modal */}
				{this.state.showAddUserModal && (
					<AddUserToTagSelect
						title="添加用户到标签"
						handleOk={this.handleAddUserConfirm}
						handleCancel={this.handleAddUserCancel}
						selectedList={this.state.selectedList}
						memeberList={this.injected.friendStore.friendList}
						excludeUserIds={this.state.excludeUserIds}
						needSelectNum={99999}
						selectItem={this.selectUserItem}
						removeItem={this.removeUserItem}
						isLoading={false}
						config={{
							name: 'toNickname',
							id: 'toUserId'
						}}
					/>
				)}
			</div>
		);
	}
}
