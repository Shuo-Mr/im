import React from 'react';
import Modal from 'antd/es/modal';
import Button from 'antd/es/button';
import Tag from 'antd/es/tag';
import Divider from 'antd/es/divider';
import Checkbox from 'antd/es/checkbox';
// import { List as VList } from 'react-virtualized/dist/es/List';
// import { AutoSizer } from 'react-virtualized/dist/es/AutoSizer';

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
	constructor(props: IMemberSelectProps) {
		super(props);
		this.state = {
			filterT: '',
			msMemeberList: props.memeberList
		};
	}
	changeFilterText = (filterText: string) => {
		if (filterText.trim() == '') {
			this.setState({ msMemeberList: this.props.memeberList, filterT: '' });
		} else {
			let msMemeberList = this.props.memeberList.filter((item: any) => {
				// let itemname = item.remarkName?item.remarkName:item.toNickname;
				// console.log('进来了吗',item)
				if ( (item.remarkName && ( item.remarkName.indexOf(filterText) != -1 || filterText.indexOf( item.remarkName) != -1))||
				(item.toNickname && ( item.toNickname.indexOf(filterText) != -1 || filterText.indexOf( item.toNickname) != -1))
				||(item.nickname && ( item.nickname.indexOf(filterText) != -1 || filterText.indexOf( item.nickname) != -1))) { 
					return true;
				 }else {
					return false;
				}

			});
			this.setState({
				filterT: filterText,
				msMemeberList
			});
		}
	};

	renderItem = ({ index, key, style }: any) => {
		let selectedId = this.props.selectedList.map((item) => item[this.props.config.id]);
		let item = this.state.msMemeberList[index];
		let notSelect = this.props.notSelectList.indexOf(String(item[this.props.config.id])) > -1;
		style = { ...style, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: 'flex' }

		const myFriend = friendStore.friendMap.get(Number(item.userId))
		if (myFriend && myFriend.remarkName) {
			item['remarkName'] = myFriend.remarkName;
		}
		return (
			<div
				key={key}
				style={style}
				onClick={() => {
					if (notSelect) {
						return;
					}
					this.props.selectItem(item);
					// let listDom = this.list;
					// let timer = setTimeout(() => {
					// 	clearTimeout(timer);
					// 	listDom && listDom.forceUpdateGrid()
					// }, 100);
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
						{item['remarkName'] ? item['remarkName'] : (item['toNickname'] ? item['toNickname'] : item[this.props.config.name])}
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
	componentWillReceiveProps(nextProps: IMemberSelectProps) {
		if (nextProps.selectedList.length != this.props.selectedList.length) {
			let listDom = this.list;
			let timer = setTimeout(() => {
				clearTimeout(timer);
				listDom && listDom.forceUpdateGrid()
			}, 100);
		}
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
							placeholder="搜索联系人1"
							maxLength={30}
							prefix={<Icon type="search" style={{ color: '#8CA6F5' }} />}
							allowClear
							value={this.state.filterT}
							onChange={(e) => this.changeFilterText(e.target.value)}
						/>
						
						<div className="members-wraper" style={{ overflowY: 'auto', display: 'block' }}>
							{this.state.msMemeberList.map((item: any, key: number) => {
								return this.renderItem({ index: key, key, style: {} })
							})}
						</div>
						{/* <AutoSizer>
							{({ height, width }) => {
								return (
									<VList
										ref={(ref) => (this.list = ref)}
										width={width}
										height={height}
										overscanRowCount={20}
										rowCount={this.state.msMemeberList ? this.state.msMemeberList.length : 0}
										rowHeight={48}
										rowRenderer={this.renderItem}
									/>
								);
							}}
						</AutoSizer> */}
					</div>
				</div>
			</Modal>
		);
	}
}
