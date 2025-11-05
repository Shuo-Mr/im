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
}
export interface IGroupState {
	openKeys: string[];
	fHeights: any[];
	// friends: FriendItem[],
	// groups: GroupItem[],
	gHeights: any[];
}
@inject('friendStore', 'chatStore', 'groupStore', 'mainStore', 'requestStore')
@observer
export default class GroupView extends React.Component<IGroupProps, IGroupState> {
	constructor(props: IGroupProps) {
		super(props);

		this.state = {
			openKeys: ['friend'],
			fHeights: [],
			gHeights: []
			// friends: [],
			// groups: [],
		};
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

		return (
			<div className="chart-list">
				<div onClick={this.showRequest} className="list-item">
					<span className="name ">
						<Badge dot={this.injected.requestStore.haveUnreadReq > 0} style={{zIndex:1}}>{tr(21)}</Badge>
					</span>
				</div>
				<Collapse defaultActiveKey={['2']} accordion bordered={false} >
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
			</div>
		);
	}
}
