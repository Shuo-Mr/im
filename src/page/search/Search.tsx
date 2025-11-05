import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import { inject, observer } from 'mobx-react';
import { FriendStore } from '../../store/FriendStore';
import { ChatStore } from '../../store/ChatStore';
import { GroupStore } from '../../store/GroupStore';
import { FriendItem } from '../../interface/IFriend';
import { GroupItem } from '../../interface/IGroup';
import './Search.less';
import { AvatorWithPhoto } from '../../component/avatorWithPhoto/AvatorWithPhoto';
import { ChatGrOrFrType } from '../../interface/IChat';
import { MainStore } from '../../store/MainStore';
import { SelectItemType } from '../../interface/ITransmit';


export interface ISearchProps extends RouteComponentProps {
}
interface WithStoreSearch extends ISearchProps {
	friendStore: FriendStore;
	chatStore: ChatStore;
	groupStore: GroupStore;
	mainStore: MainStore;
}
export interface ISearchState {
	selectList: Map<string, SelectItemType>;
	setSelect: Map<string, SelectItemType>;
}
@inject('friendStore', 'chatStore', 'groupStore', 'mainStore')
@observer
export default class SearchView extends React.Component<ISearchProps, ISearchState> {
	constructor(props: ISearchProps) {
		super(props);

		this.state = {
			selectList: new Map(),
			setSelect: new Map(),
		};
	}
	rootSubmenuKeys = ['request', 'Search', 'friend'];
	get injected() {
		return this.props as WithStoreSearch;
	}

	goFriendChat = (friend: FriendItem) => {
		this.injected.chatStore.changeCurrentChat(friend);
		this.injected.mainStore.changeTabIndex(0);
	};

	goSearchChat = (Search: GroupItem) => {
		this.injected.chatStore.changeCurrentChat(Search);
		this.injected.mainStore.changeTabIndex(0);
	};

	closeFriendClear=(item:any)=>{
		this.goFriendChat(item);
		this.injected.mainStore.filterTxt='';
		this.injected.mainStore.clickClear=false;
		this.props.history.push('/main/chart');
	}
	closeGroupClear=(item:any)=>{
		this.goSearchChat(item);
		this.injected.mainStore.filterTxt='';
		this.injected.mainStore.clickClear=false;
		this.props.history.push('/main/chart');
	}
	public render() {
		const filText = this.injected.mainStore.filterTxt;
		let groups = this.injected.groupStore.groupList.filter((item) => {
			const fileText = filText;
			if (!fileText) {
				return true;
			}
			if (item.name.indexOf(fileText) > -1) {
				return true;
			}
			return false;
		});

		let friends = this.injected.friendStore.friendList.filter((item) => {
			const fileText = filText;
			if (!fileText) {
				return true;
			}
			if (
				(item.remarkName && item.remarkName.indexOf(fileText) > -1) ||
				(item.toNickname && item.toNickname.indexOf(fileText) > -1)
			) {
				return true;
			}
			return false;
		});

		return (
			filText.length > 0 ?
				<div className="chart-list">

					<div className="list-wrap">
						{friends.length > 0 ? <div className="title-transmit">好友列表</div> : null}
							{...friends.map((item) => {
								const friendId = item.toUserId + '';
								return (
									<div
										key={friendId + item.toNickname}
										className="list-new-item"
										onClick={() => this.closeFriendClear(item)}
									>
										<AvatorWithPhoto id={friendId} type={ChatGrOrFrType.friend} size={40} />
										<span className="friend-name">{item.remarkName || item.toNickname}</span>

									</div>
								);
							})}
						{groups.length > 0 ? <div className="title-transmit">群组列表</div> : null}
						{groups.map((item) => {
							const groupId = item.jid + '';
							return (
								<div
									key={groupId + item.name}
									className="list-new-item"
									onClick={() => this.closeGroupClear(item)}
								>
									<AvatorWithPhoto id={groupId} type={ChatGrOrFrType.group} size={40} />
									<span className="friend-name">{item.name}</span>
								</div>
							);
						})}
					</div>
				</div> :
				<div className="chart-list">
					<div className="list-wrap">
						{friends.length > 0 ? <div className="title-transmit">好友列表</div> : null}
						{groups.length > 0 ? <div className="title-transmit">群组列表</div> : null}
					</div>
				</div>
		);
	}
}
