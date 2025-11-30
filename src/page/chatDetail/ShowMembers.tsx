import * as React from 'react';
import Drawer from 'antd/es/drawer';
import Icon from 'antd/es/icon';
import './ShowMembers.less';
// import { Grid as VGrid } from 'react-virtualized/dist/es/Grid';
// import { AutoSizer } from 'react-virtualized/dist/es/AutoSizer';
// import { AvatorWithPhoto } from '../../component/avatorWithPhoto/AvatorWithPhoto';
import { GroupMemItem, GroupMemRole } from '../../interface/IGroup';
import chatStore from '../../store/ChatStore';
import systemStore from '../../store/SystemStore';
import friendStore from '../../store/FriendStore';
import { GroupMemViewItem } from './GroupMemItem';
import { Input } from 'antd';
import { tr } from '../../i18n/tr';
// import { Observer } from 'mobx-react';
import groupStore from '../../store/GroupStore';
import message from 'antd/es/message';

export interface IShowMembersProps {
	onCloseInner: () => void;
	SwitchDetail: () => void;
	memsList: GroupMemItem[];
	drawerWidth: number;
	filterT: string;
	canViewInfo: boolean;
	showUserInfo: (id: string) => void;
	role: number;
}

export interface IShowMembersState {
	isLoading: boolean;
	isCreateNotice: boolean;
	filterT: string;
	memeberList: any[],
}
export class ShowMembers extends React.Component<IShowMembersProps, IShowMembersState> {
	private filteredListCache: GroupMemItem[] | null = null;
	private filterTextCache: string = '';
	
	constructor(props: IShowMembersProps) {
		super(props);

		this.state = {
			isLoading: false,
			isCreateNotice: false,
			filterT: '',
			memeberList: this.props.memsList,
		};
	}
	
	componentDidUpdate(prevProps: IShowMembersProps, prevState: IShowMembersState) {
		// 当成员列表或过滤文本变化时，重新计算过滤后的列表
		if (prevProps.memsList !== this.props.memsList || prevState.filterT !== this.state.filterT) {
			this.filteredListCache = null;
			this.filterTextCache = '';
		}
	}
	
	shouldComponentUpdate(nextProps: IShowMembersProps, nextState: IShowMembersState) {
		// 只在成员列表、过滤文本或角色变化时才更新
		// 简化检查：直接比较数组引用和长度
		const memsListChanged = this.props.memsList !== nextProps.memsList ||
			this.props.memsList.length !== nextProps.memsList.length;
		
		return memsListChanged ||
			nextState.filterT !== this.state.filterT ||
			nextProps.role !== this.props.role ||
			nextProps.canViewInfo !== this.props.canViewInfo;
	}
	
	// 获取过滤后的成员列表（带缓存）
	getFilteredList = (): GroupMemItem[] => {
		// 如果 props.memsList 为空或未定义，直接返回空数组
		if (!this.props.memsList || this.props.memsList.length === 0) {
			return [];
		}
		
		if (this.filteredListCache && this.filterTextCache === this.state.filterT) {
			return this.filteredListCache;
		}
		
		const filterText = this.state.filterT.trim();
		if (!filterText) {
			this.filteredListCache = this.props.memsList;
			this.filterTextCache = filterText;
			return this.filteredListCache;
		}
		
		const filtered = this.props.memsList.filter((item: GroupMemItem) => {
			let nameMember = item.nickname;
			if (item.userId == systemStore.userId && chatStore.currentChatData.nickname) {
				nameMember = chatStore.currentChatData.nickname;
			}
			const myFriend = friendStore.friendMap.get(Number(item.userId));
			if (myFriend && myFriend.remarkName) {
				nameMember = myFriend.remarkName;
			}
			
			return item.nickname.indexOf(filterText) > -1 ||
				(nameMember && nameMember.indexOf(filterText) > -1);
		});
		
		this.filteredListCache = filtered;
		this.filterTextCache = filterText;
		return filtered;
	}
	switchCreatNotice = () => {
		this.setState((state) => ({
			isCreateNotice: !state.isCreateNotice
		}));
	};
	goBackUpdate = () => {
		// this.getGroupNotice();
		this.switchCreatNotice();
	};
	getRoleClass = (role: GroupMemRole) => {
		if (GroupMemRole.owner == role) {
			return 'owner';
		}
		if (GroupMemRole.manage == role) {
			return 'manage';
		}
		return '';
	};
	searchDom: Input | null;
	changeFilterText = (e?: React.ChangeEvent<HTMLInputElement>) => {
		const filterText = e ? e.target.value : this.state.filterT;
		// 清除缓存，让 getFilteredList 重新计算
		this.filteredListCache = null;
		this.filterTextCache = '';
		this.setState({ filterT: filterText });
	};
	removeMemFun = async (userId: string) => {
		const res = await groupStore.removeMem(userId)

		if (res) {
			this.changeFilterText()
			message.success('操作成功');
		} else {
			message.warn('操作失败');
		}
	}


	// };
	// renderItem = ({ columnIndex, rowIndex, key, style }: any) => {
	// 	let domGroup: JSX.Element[] = [];
	// 	const tIndex = rowIndex * 5 + columnIndex;
	// 	if (tIndex >= this.props.memsList.length) {
	// 		return
	// 	}
	// 	let item = this.props.memsList[tIndex];
	// 	if (item) {
	// 		let filterText = this.state.filterT;

	// 		const classNameEdit = this.getRoleClass(item.role);


	// 		let nameMember = item.nickname;
	// 		if (item.userId == systemStore.userId && chatStore.currentChatData.nickname) {
	// 			nameMember = chatStore.currentChatData.nickname;
	// 		}
	// 		const myFriend = friendStore.friendMap.get(Number(item.userId));
	// 		if (myFriend && myFriend.remarkName) {
	// 			nameMember = myFriend.remarkName;
	// 		}
	// 		if (filterText.trim() && nameMember.indexOf(filterText) < 0) {
	// 			return
	// 		}
	// 		domGroup.push(
	// 			<span
	// 				key={key}
	// 				style={style}
	// 			// onClick={() => this.props.showUserInfo(item.userId.toString())}
	// 			>
	// 				<GroupMemViewItem
	// 					showUserInfo={() => this.props.showUserInfo(item.userId.toString())}
	// 					key={item.userId + key}
	// 					userId={item.userId}
	// 					nameMember={nameMember}
	// 					classMy={`member-box ${classNameEdit}`}
	// 					roleMy={this.props.role ? this.props.role : GroupMemRole.member}
	// 					memRole={item.role}
	// 					talkTime={item.talkTime}
	// 					canViewInfo={this.props.canViewInfo}
	// 				/>
	// 			</span>

	// 		)
	// 		if (domGroup.length < 1) {
	// 			return <span className="no-data-wraper">{tr(101)}</span>
	// 		}
	// 	}

	// 	return domGroup

	// }

	renderItem = ({ columnIndex, rowIndex, key, style, filteredList }: any) => {
		const tIndex = rowIndex * 5 + columnIndex;
		if (tIndex >= filteredList.length) {
			return null;
		}
		const item = filteredList[tIndex];
		if (item) {
			let nameMember = item.nickname ? item.nickname : '';

			if (item.userId == systemStore.userId && chatStore.currentChatData.nickname) {
				nameMember = chatStore.currentChatData.nickname;
			}
			const myFriend = friendStore.friendMap.get(Number(item.userId));
			if (myFriend && myFriend.remarkName) {
				nameMember = myFriend.remarkName;
			}
			const classNameEdit = this.getRoleClass(item.role);
			return (
				<span
					key={key}
					style={style}
				>
					<GroupMemViewItem
						showUserInfo={() => this.props.showUserInfo(item.userId.toString())}
						key={item.userId + key}
						userId={item.userId}
						nameMember={nameMember}
						classMy={`member-box ${classNameEdit}`}
						roleMy={this.props.role ? this.props.role : GroupMemRole.member}
						memRole={item.role}
						talkTime={item.talkTime}
						canViewInfo={this.props.canViewInfo}
						removeitem={() => this.removeMemFun(item.userId)}
					/>
				</span>
			);
		} else {
			return null;
		}

		// }
		// if (
		// 	item.nickname.indexOf(filterText) > -1 ||
		// 	(nameMember && nameMember.indexOf(filterText) > -1)
		// 	//  || (nameMember && nameMember.indexOf(filterText) > -1)
		// ) {
		// 	return (
		// 		// <div
		// 		//     className="member-box"
		// 		//     key={key}
		// 		//     style={style}
		// 		// onClick={() => this.props.showUserInfo(item.userId.toString())
		// 		// }
		// 		// >

		// 		<GroupMemViewItem
		// 			showUserInfo={() => this.props.showUserInfo(item.userId.toString())}
		// 			key={item.userId + key}
		// 			userId={item.userId}
		// 			nameMember={nameMember}
		// 			classMy={`member-box ${classNameEdit}`}
		// 			roleMy={this.props.role ? this.props.role : GroupMemRole.member}
		// 			memRole={item.role}
		// 			talkTime={item.talkTime}
		// 			canViewInfo={this.props.canViewInfo}
		// 		/>
		// 		// </div>
		// 	);
		// } else {
		// 	return null;
		// }
	};
	renderList = () => {
		const filteredList = this.getFilteredList();
		
		// 如果没有成员，显示"暂无成员"
		if (!filteredList || filteredList.length === 0) {
			return <span className="no-data-wraper">{tr(101)}</span>;
		}
		
		const rowCount = Math.ceil(filteredList.length / 5);
		const rows: JSX.Element[] = [];
		
		// 只调用一次 getFilteredList，然后传递给 renderItem
		for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
			const rowItems: JSX.Element[] = [];
			for (let colIndex = 0; colIndex < 5; colIndex++) {
				const tIndex = rowIndex * 5 + colIndex;
				if (tIndex < filteredList.length) {
					const item = this.renderItem({ 
						columnIndex: colIndex, 
						rowIndex: rowIndex, 
						key: `${rowIndex}-${colIndex}`, 
						style: {},
						filteredList: filteredList
					});
					if (item) {
						rowItems.push(item);
					}
				}
			}
			if (rowItems.length > 0) {
				rows.push(
					<div key={rowIndex} style={{ display: 'flex', justifyContent: 'space-between' }}>
						{rowItems}
					</div>
				);
			}
		}
		
		return (
			<div style={{ overflowY: 'auto', overflowX: 'hidden' }}>
				{rows}
			</div>
		)
	}
	public render() {
		const { onCloseInner, drawerWidth, SwitchDetail } = this.props;
		let header = (
			<div onClick={SwitchDetail} className="group-header">
				<Icon type="left" className="group-icon" />
				<span>群成员</span>
			</div>
		);
		return (
			<Drawer className="drawer-wraper" title={header} onClose={onCloseInner} visible={true} width={drawerWidth}>
				<div className="mems-wraper">
					<div className="search-wraper">
						<Input
							ref={(ref) => (this.searchDom = ref)}
							placeholder={tr(138)}
							size="small"
							type="text"
							value={this.state.filterT}
							onChange={this.changeFilterText}
						/>
					</div>
					<div className="members-wraper" style={{ overflowY: 'auto' }}>
						{this.renderList()}
						{/* {new Array(this.props.memsList.length / 5).map((item, key) => {
							new Array(5).map((subItem, subIndex) => {
								this.renderItem({ columnIndex: key, rowIndex: subIndex, key:`${key}-${subIndex}`, style: {} })
							})
						})} */}
						{/* <AutoSizer>
							{({ height, width }) => {
								return (
									<VGrid
										width={width}
										height={height}
										columnCount={5}
										columnWidth={52}
										rowHeight={60}
										cellRenderer={({ ...props }) => (
											<Observer key={props.key}>{() => this.renderItem({ ...props })}</Observer>
										)}
										// cellRenderer={this.renderItem}
										rowCount={Math.ceil(this.props.memsList.length / 5)}
									/>
								);
							}}
						</AutoSizer> */}
					</div>
				</div>
			</Drawer>
		);
	}
}
