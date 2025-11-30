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

export interface IMemberSelectProps {
	title: string;
	handleOk: () => void;
	handleCancel: () => void;
	selectedList: any[];
	memeberList: any[];
	notSelectList: any[];
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

export interface IMemberSelectState {
	notSelectList: any[];
	filterT: string;
}

export class MemberSelect extends React.Component<IMemberSelectProps, any> {
	private filteredListCache: any[] | null = null;
	private filterTextCache: string = '';
	
	constructor(props: IMemberSelectProps) {
		super(props);
		this.state = {
			filterT: '',
			msMemeberList: props.memeberList
		};
	}
	
	componentDidUpdate(prevProps: IMemberSelectProps, prevState: any) {
		// 当成员列表或过滤文本变化时，重新计算过滤后的列表
		if (prevProps.memeberList !== this.props.memeberList || prevState.filterT !== this.state.filterT) {
			this.filteredListCache = null;
			this.filterTextCache = '';
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
	
	// 获取过滤后的成员列表（带缓存）
	getFilteredList = (): any[] => {
		// 如果 props.memeberList 为空或未定义，直接返回空数组
		if (!this.props.memeberList || this.props.memeberList.length === 0) {
			return [];
		}
		
		// 使用缓存
		if (this.filteredListCache && this.filterTextCache === this.state.filterT) {
			return this.filteredListCache;
		}
		
		const filterText = this.state.filterT.trim();
		if (!filterText) {
			this.filteredListCache = this.props.memeberList;
			this.filterTextCache = filterText;
			return this.props.memeberList;
		}
		
		// 优化过滤逻辑：只检查包含关系，不检查反向包含
		const filtered = this.props.memeberList.filter((item: any) => {
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
		const notSelect = this.props.notSelectList.indexOf(String(item[this.props.config.id])) > -1;
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

	// renderUserItem = ({ index, key, style }: any) => {
	//     let selectedId = this.props.selectedList.map(item => item[this.props.config.id]);
	//     let item = this.props.memeberList[index];
	//     let notSelect = this.props.notSelectList.indexOf(String(item[this.props.config.id])) > -1;
	//     let filterText = this.state.filterT;

	//     if (filterText.trim() && item.nickname.indexOf(filterText) < 0) {
	//         return
	//     }

	//     return (
	//         <div
	//             key={key}
	//             style={style}
	//             onClick={() => {
	//                 if (notSelect) {
	//                     return;
	//                 }
	//                 this.props.selectItem(item);
	//                 let listDom = this.list;
	//                 setTimeout(() => listDom && listDom.forceUpdateGrid(), 100)
	//             }}
	//             className="item"
	//         >
	//             <Checkbox className="check-box" disabled={notSelect} checked={notSelect || selectedId.indexOf(item[this.props.config.id]) > -1} />
	//             <span>
	//                 <AvatorWithPhoto type={ChatGrOrFrType.friend} id={item[this.props.config.id]} size={24} classN="head" />
	//                 {item[this.props.config.name]}
	//             </span>
	//         </div>
	//     )
	// }
	
	shouldComponentUpdate(nextProps: IMemberSelectProps, nextState: any) {
		// 只在成员列表、选中列表、过滤文本变化时才更新
		return this.props.memeberList !== nextProps.memeberList ||
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
			// memeberList,
			needSelectNum,
			removeItem,
			isLoading,
			config
		} = this.props;
		// console.log('memeberList', memeberList, memeberList, this.props.notSelectList);
		// console.log(this.props.selectedList, "selectedId------------------------------");
		// console.log(this.props.memeberList, "item------------------------------");
		// console.log(this.props.notSelectList, "notSelect------------------------------");

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
