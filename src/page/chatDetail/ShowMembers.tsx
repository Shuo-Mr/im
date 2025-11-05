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
	constructor(props: IShowMembersProps) {
		super(props);

		this.state = {
			isLoading: false,
			isCreateNotice: false,
			filterT: '',
			memeberList: this.props.memsList,
		};
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
		let filterText = e ? e.target.value : this.state.filterT;
		if (filterText.trim() == '') {
			this.setState({ memeberList: this.props.memsList, filterT: '' });
		} else {
			let msMemeberList = this.props.memsList.filter((item: any) => {
				// let itemname = item.remarkName?item.remarkName:item.toNickname;

				let nameMember = item.nickname;
				if (item.userId == systemStore.userId && chatStore.currentChatData.nickname) {
					nameMember = chatStore.currentChatData.nickname;
				}
				const myFriend = friendStore.friendMap.get(Number(item.userId));
				if (myFriend && myFriend.remarkName) {
					nameMember = myFriend.remarkName;
				}

				if (item.nickname.indexOf(filterText) > -1 ||
					(nameMember && nameMember.indexOf(filterText) > -1)) {
					return true;
				} else {
					return false;
				}

			});

			this.setState({
				filterT: e ? e.target.value : this.state.filterT,
				memeberList: msMemeberList
			});
		}
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

	renderItem = ({ columnIndex, rowIndex, key, style }: any) => {
		const tIndex = rowIndex * 5 + columnIndex;
		if (tIndex >= this.props.memsList.length) {
			return null;
		}
		const item = this.state.memeberList[tIndex];
		if (item) {
			let nameMember = item.nickname ? item.nickname : '';
			// let filterText = this.state.filterT;

			if (item.userId == systemStore.userId && chatStore.currentChatData.nickname) {
				nameMember = chatStore.currentChatData.nickname;
			}
			const myFriend = friendStore.friendMap.get(Number(item.userId));
			if (myFriend && myFriend.remarkName) {
				nameMember = myFriend.remarkName;
			}
			const classNameEdit = this.getRoleClass(item.role);
			// if (!filterText) {
			return (
				<span
					key={key}
					style={style}
				// onClick={() => this.props.showUserInfo(item.userId.toString())}
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
		const pArr: any = []
		for (let i = 0; i < (this.props.memsList.length / 5); i++) {
			const sArr: any = []
			for (let j = 0; j < 5; j++) {
				sArr.push(j)
			}
			pArr.push(sArr)
		}
		return (
			<div style={{ overflowY: 'auto', overflowX: 'hidden' }}>
				{/* {JSON.stringify(pArr)} */}
				{
					pArr.map((item: any, key: number) => {
						return (
							<div style={{ display: 'flex', justifyContent: 'space-between' }}>
								{
									item.map((subItem: number, subIndex: number) => {
										return this.renderItem({ columnIndex: subIndex, rowIndex: key, key: `${key}-${subIndex}`, style: {} })
									})
								}
							</div>
						)
					})
				}
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
