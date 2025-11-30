import React from 'react';
import Modal from 'antd/es/modal';
import Button from 'antd/es/button';
import Tag from 'antd/es/tag';
import Divider from 'antd/es/divider';
import Checkbox from 'antd/es/checkbox';
import { List as VList } from 'react-virtualized/dist/es/List';
import { AutoSizer } from 'react-virtualized/dist/es/AutoSizer';

import { FriendItem } from '../../interface/IFriend';
import { AvatorWithPhoto } from '../../component/avatorWithPhoto/AvatorWithPhoto';
import { ChatGrOrFrType } from '../../interface/IChat';
import Input from 'antd/es/input';
import Icon from 'antd/es/icon';
import friendStore from '../../store/FriendStore';

export interface IAddUserToTagSelectProps {
	title: string;
	handleOk: () => void;
	handleCancel: () => void;
	selectedList: any[];
	memeberList: any[];
	excludeUserIds: string[]; // 需要排除的用户ID列表（已在标签中的用户）
	needSelectNum: number;
	selectItem: (item: FriendItem) => void;
	removeItem: (item: FriendItem) => void;
	isLoading: boolean;
	nameKey?: string;
	subNamekey?: string;
	config: {
		name: string;
		id: string;
	};
}

export interface IAddUserToTagSelectState {
	notSelectList: any[];
	filterT: string;
}

export class AddUserToTagSelect extends React.Component<IAddUserToTagSelectProps, any> {
	private filteredListCache: any[] | null = null;
	private filterTextCache: string = '';
	
	constructor(props: IAddUserToTagSelectProps) {
		super(props);
		this.state = {
			filterT: '',
			msMemeberList: this.getFilteredMemberList(props.memeberList, props.excludeUserIds)
		};
	}
	
	componentDidUpdate(prevProps: IAddUserToTagSelectProps, prevState: any) {
		// 当成员列表、排除列表或过滤文本变化时，重新计算过滤后的列表
		if (prevProps.memeberList !== this.props.memeberList || 
			prevProps.excludeUserIds !== this.props.excludeUserIds ||
			prevState.filterT !== this.state.filterT) {
			this.filteredListCache = null;
			this.filterTextCache = '';
			const filteredList = this.getFilteredMemberList(this.props.memeberList, this.props.excludeUserIds);
			this.setState({ msMemeberList: filteredList });
		}
		
		// 当选中列表变化时，更新虚拟列表
		if (prevProps.selectedList.length !== this.props.selectedList.length) {
			if (this.list) {
				setTimeout(() => {
					this.list && this.list.forceUpdateGrid();
				}, 100);
			}
		}
	}
	
	// 过滤掉已在标签中的用户
	getFilteredMemberList = (memberList: any[], excludeUserIds: string[]): any[] => {
		if (!memberList || memberList.length === 0) {
			return [];
		}
		// 过滤掉已在标签中的用户
		return memberList.filter((item: any) => {
			const userId = String(item[this.props.config.id]);
			return excludeUserIds.indexOf(userId) === -1;
		});
	}
	
	// 获取过滤后的成员列表（带缓存）
	getFilteredList = (): any[] => {
		const memberList = this.state.msMemeberList;
		
		// 如果列表为空或未定义，直接返回空数组
		if (!memberList || memberList.length === 0) {
			return [];
		}
		
		// 使用缓存
		if (this.filteredListCache && this.filterTextCache === this.state.filterT) {
			return this.filteredListCache;
		}
		
		const filterText = this.state.filterT.trim();
		if (!filterText) {
			this.filteredListCache = memberList;
			this.filterTextCache = filterText;
			return memberList;
		}
		
		// 优化过滤逻辑：只检查包含关系，不检查反向包含
		const filtered = memberList.filter((item: any) => {
			const remarkName = item.remarkName || '';
			const toNickname = item.toNickname || '';
			const nickname = item.nickname || '';
			
			return remarkName.indexOf(filterText) !== -1 ||
				toNickname.indexOf(filterText) !== -1 ||
				nickname.indexOf(filterText) !== -1;
		});
		
		this.filteredListCache = filtered;
		this.filterTextCache = filterText;
		return filtered;
	}
	
	changeFilterText = (filterText: string) => {
		// 清除缓存，让 getFilteredList 重新计算
		this.filteredListCache = null;
		this.filterTextCache = '';
		this.setState({ filterT: filterText });
	};
	
	renderItem = ({ index, key, style }: any) => {
		const filteredList = this.getFilteredList();
		if (index >= filteredList.length) {
			return null;
		}
		
		// 缓存 selectedId 数组，避免每次渲染都重新计算
		const selectedId = this.props.selectedList.map((item) => item[this.props.config.id]);
		const item = filteredList[index];
		const notSelect = false; // 不再使用 notSelectList，因为已经过滤掉了
		const finalStyle = { ...style, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: 'flex' };

		// 获取备注名
		const myFriend = friendStore.friendMap.get(Number(item.userId));
		const displayName = myFriend && myFriend.remarkName 
			? myFriend.remarkName 
			: (item['remarkName'] ? item['remarkName'] : (item['toNickname'] ? item['toNickname'] : item[this.props.config.name]));
		
		return (
			<div
				key={key}
				style={finalStyle}
				onClick={() => {
					if (notSelect) {
						return;
					}
					this.props.selectItem(item);
					// 更新虚拟列表
					if (this.list) {
						setTimeout(() => {
							this.list && this.list.forceUpdateGrid();
						}, 100);
					}
				}}
				className="item"
			>
				<Checkbox
					className="check-box"
					disabled={notSelect}
					checked={notSelect || selectedId.indexOf(item[this.props.config.id]) > -1}
				/>
				<span style={{ display: 'flex' }}>
					<AvatorWithPhoto
						type={ChatGrOrFrType.friend}
						id={item[this.props.config.id]}
						size={24}
						classN="head"
					/>
					<span style={{ marginLeft: '4px' }}>
						{displayName}
					</span>
				</span>
			</div>
		);
	};
	
	shouldComponentUpdate(nextProps: IAddUserToTagSelectProps, nextState: any) {
		// 只在成员列表、选中列表、排除列表、过滤文本变化时才更新
		return this.props.memeberList !== nextProps.memeberList ||
			this.props.excludeUserIds !== nextProps.excludeUserIds ||
			this.props.selectedList.length !== nextProps.selectedList.length ||
			this.state.filterT !== nextState.filterT;
	}
	
	list: any;
	public render() {
		const {
			title,
			handleOk,
			handleCancel,
			selectedList,
			needSelectNum,
			removeItem,
			isLoading,
			config
		} = this.props;

		return (
			<Modal
				title={title}
				visible={true}
				onOk={handleOk}
				onCancel={handleCancel}
				okText={'确定'}
				cancelText={'取消'}
				footer={null}
			>
				<div className="select-modal">
					<div className="left-block">
						<div className="select-wraper">
							<div>
								{selectedList.map((item, index) => {
									return (
										<Tag
											style={{ height: '24px', marginBottom: '12px' }}
											key={index}
											closable
											onClose={() => removeItem(item)}
										>
											{item[config.name]}
										</Tag>
									);
								})}
							</div>
						</div>
						<div>{/* nameKey => 如果存在即 添加输入框 */}</div>
						<Divider style={{ width: '100%' }} />
						<div className="button-wraper">
							<Button
								type="primary"
								loading={isLoading}
								onClick={handleOk}
								disabled={selectedList.length < 1}
							>
								确定({selectedList.length}{needSelectNum == 99999 ? '' : '/' + needSelectNum})
							</Button>
							<Button onClick={handleCancel} style={{ marginLeft: '16px' }}>
								取消
							</Button>
						</div>
					</div>
					<Divider type="vertical" style={{ height: '100%', margin: '0' }} />
					<div className="right-block">
						<Input
							placeholder="搜索联系人"
							maxLength={30}
							prefix={<Icon type="search" style={{ color: '#8CA6F5' }} />}
							allowClear
							value={this.state.filterT}
							onChange={(e) => this.changeFilterText(e.target.value)}
						/>
						
						<div className="members-wraper" style={{ flex: 1, minHeight: 0 }}>
							<AutoSizer>
								{({ height, width }) => {
									const filteredList = this.getFilteredList();
									return (
										<VList
											ref={(ref) => (this.list = ref)}
											width={width}
											height={height}
											overscanRowCount={10}
											rowCount={filteredList.length}
											rowHeight={48}
											rowRenderer={this.renderItem}
										/>
									);
								}}
							</AutoSizer>
						</div>
					</div>
				</div>
			</Modal>
		);
	}
}

