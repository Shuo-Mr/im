import * as React from 'react';
import { inject, observer } from 'mobx-react';
import message from 'antd/es/message';
// import Avatar from 'antd/es/avatar';
import Input from 'antd/es/input';
import Icon from 'antd/es/icon';
import Checkbox from 'antd/es/checkbox';
// import { List as VList } from 'react-virtualized/dist/es/List';
// import { AutoSizer } from 'react-virtualized/dist/es/AutoSizer';

import { FriendItem } from '../../interface/IFriend';
import { CreateGroupStore, createGroupStore } from '../../store/CreatGroupStore';
import { FriendStore } from '../../store/FriendStore';
//import IMSDK from '../../net/IMSDK';
import './GreateGroupList.less';
// import IMSDK from '../../net/IMSDK';
import { tr } from '../../i18n/tr';
import { AvatorWithPhoto } from '../../component/avatorWithPhoto/AvatorWithPhoto';
import { ChatGrOrFrType } from '../../interface/IChat';
import Button from 'antd/es/button';
import { ChatStore } from '../../store/ChatStore';
//import { GroupMemberList } from '../../interface/IGroup';

export interface ICreateGroupListProps {
	goConfirm: () => void;
}

export interface ICreateGroupListState {}
interface INewFriendWithStore extends ICreateGroupListProps {
	createGroupStore: CreateGroupStore;
	friendStore: FriendStore;
	chatStore: ChatStore;
}
@inject('createGroupStore', 'friendStore', 'chatStore')
@observer
export class CreateGroupList extends React.Component<ICreateGroupListProps, ICreateGroupListState> {
	constructor(props: ICreateGroupListProps) {
		super(props);

		this.state = {};
		createGroupStore.init();
	}

	get injected() {
		return this.props as INewFriendWithStore;
	}
	goNext = () => {
		let selectData = this.injected.createGroupStore.selectGroupMembers;
		if (selectData && selectData.length < 2) {
			message.warn('请先选择两个好友');
			return;
		}
		this.props.goConfirm();
	};
	// 选中好友列表
	addFriend = (friend: FriendItem) => {
		if (!friend) {
			message.warn('请选择一个好友');
			return;
		}
		this.injected.createGroupStore.addGrFriend(friend);
	};
	// 取消选中好友列表
	removeFriend = (friend: FriendItem) => {
		this.injected.createGroupStore.removeFriend(friend);
	};

	changeSelect = (isSelected: boolean, friend: FriendItem) => {
		// console.log('changeSelect', e.target.checked)
		if (isSelected) {
			this.addFriend(friend);
		} else {
			this.removeFriend(friend);
		}
		let timer = setTimeout(() => {
			clearTimeout(timer);
			// this.list && this.list.forceUpdateGrid()
		}, 100);
	};
	renderItem = ({ index, key, style }: any) => {
		const item = this.friendList[index]
		const isSelected = createGroupStore.selectGroupMembers.filter((olditem) => olditem.toUserId == item.toUserId).length > 0;

		return (
			<div className="list-item" style={style} key={key} onClick={() => this.changeSelect(!isSelected, item)}>
				<span className="head-warap">
					{/* <Avatar icon="team" src={IMSDK.getAvatarUrl(Number(item.toUserId), false)} className = "avator"/> */}
					<AvatorWithPhoto
						type={ChatGrOrFrType.friend}
						id={item.toUserId.toString()}
						classN="headavator"
						size={40}
					/>
					<span
						className="name"
						style={{
							position: 'relative',
							left: '13px',
							top: '-3px',
							// color: '#2c2f36',
							color: '#222222',
							lineHeight: '20px',
							fontSize: '14px'
						}}
					>
						{item.remarkName?item.remarkName:item.toNickname}
					</span>
				</span>
				<span className="checkbox">
					<Checkbox checked={isSelected}> </Checkbox>
				</span>
			</div>
		);
	};
	friendList: FriendItem[];
	// list: VList | null;
	public render() {
		const { friendStore } = this.injected;
		// console.log('groupStore', friendStore.friendList);
		// console.log('currentSelect', createGroupStore.selectGroupMembers);
		this.friendList = friendStore.friendList.filter((item: FriendItem) => {
			if (createGroupStore.filterTxt == '') {
				return true;
			} else {
				if (
					item.toNickname.indexOf(createGroupStore.filterTxt) != -1 ||
					createGroupStore.filterTxt.indexOf(item.toNickname) != -1||
					(item.remarkName&&item.remarkName.indexOf(createGroupStore.filterTxt) != -1)
				) {
					return true;
				} else {
					return false;
				}
			}
		});
		return (
			<div className="creat-group-wrap">
				<div className="head">
					<Icon type="left" className="back-but" onClick={this.injected.chatStore.detailBack} />
					<div className="title">{tr(35)}</div>
					<Button className="head-next" type="link" onClick={this.goNext}>
						{tr(36)}
					</Button>
				</div>
				<div className="search">
					<Input
						placeholder={tr(37)}
						maxLength={30}
						prefix={<Icon type="search" style={{ color: 'rgba(0,0,0,.25)' }} />}
						allowClear
						value={this.injected.createGroupStore.filterTxt}
						onChange={(e) => this.injected.createGroupStore.changeFilterText(e.target.value)}
					/>
				</div>
				<div className="list-wrap" style={{ overflowY: 'auto', display: 'block' }}>
						{this.friendList.map((item: any, key: number) => {
							return this.renderItem({ index: key, key, style: {} })
						})}
					
					{/* <AutoSizer>
						{({ height, width }) => {
							return (
								<VList
									ref={(ref) => (this.list = ref)}
									width={width}
									height={height}
									overscanRowCount={20}
									rowCount={this.friendList ? this.friendList.length : 0}
									rowHeight={60}
									rowRenderer={({ ...props }) => (
									<Observer key = {props.key}>
										  {() => this.renderItem({ ...props })}
										</Observer>
								)}
								/>
							);
						}}
					</AutoSizer> */}
				</div>
			</div>
		);
	}
}
