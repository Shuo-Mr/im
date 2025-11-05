import * as React from 'react';
import Modal from 'antd/es/modal';
import Checkbox from 'antd/lib/checkbox/Checkbox';
import { SelectItemType, SelectType } from '../../interface/ITransmit';
import systemStore from '../../store/SystemStore';
import chatStore from '../../store/ChatStore';
import groupStore from '../../store/GroupStore';
import friendStore from '../../store/FriendStore';
// import { List as VList } from 'react-virtualized/dist/es/List';
// import { AutoSizer } from 'react-virtualized/dist/es/AutoSizer';

import './transmitModal.less';
import SelectItem from './SelectItem';
import Search from 'antd/es/input/Search';
import { AvatorWithPhoto } from '../avatorWithPhoto/AvatorWithPhoto';
import { ChatGrOrFrType } from '../../interface/IChat';
import {  testForbit } from '../../interface/IGroup';
import { message } from 'antd';
export interface ITransmitSelectModalProps {
	submitTransmit: (chats: SelectItemType[]) => void;
	cancelModal: () => void;
}
// export interface ITransmitSelectModalStates {
// 	isLoading: boolean,
// }

export default function TransmitSelectModal(props: ITransmitSelectModalProps) {
	const [chatType, setchatType] = React.useState(true);
	const [selectList, setSelect] = React.useState(new Map() as Map<string, SelectItemType>);
	const [filText, setFileT] = React.useState('');
	// const [isLoading, setLoading] = React.useState(true);

	const _submitTransmit = () => {
		const selectData = Array.from(selectList.values());
		props.submitTransmit(selectData);
	};
	const changeValue = (e: any) => {
		const vaText = e.target.value;
		if (!vaText) {
			setchatType(true);
		} else {
			setchatType(false);
		}
		setFileT(vaText);
	};
	let groups = groupStore.groupList.filter((item) => {
		const fileText = filText;
		if (!fileText) {
			return true;
		}
		if (item.name.indexOf(fileText) > -1) {
			return true;
		}
		return false;
	});

	let friends = friendStore.friendList.filter((item) => {
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
	const removeOne = (_chat: any) => {
		const chat = _chat.data;
		let chatId = '';
		if (_chat.transmitType == SelectType.chat) {
			chatId = chat.id + '';
		} else if (_chat.transmitType == SelectType.group) {
			chatId = chat.toUserId + '';
		} else if (_chat.transmitType == SelectType.friend) {
			chatId = chat.id + '';
		}
		if (selectList.has(chatId)) {
			selectList.delete(chatId);
			setSelect(new Map(selectList));
		}
	};

	const renderItemChat = ({ index, key, parent, style }: any) => {

		let item:any = {...chatStore.chats[index]};
		const chatId = item.id + '';
		// console.log('转发的成员的状态', item.name, isForbitGr, grouptimeTalk, isGroup, (item.role &&
		// 	item.role != GroupMemRole.owner ||
		// 	item.role != GroupMemRole.manage), (grouptimeTalk && Number(grouptimeTalk) > 0), (timeTalk && Number(timeTalk) > 0))

		return (
			<div
				key={key + item.id + 'chat'}
				style={style}
				className="modal-transmit-item"
				onClick={() => {
					if (selectList.has(chatId)) {
						selectList.delete(chatId);
						setSelect(new Map(selectList));
					} else {
						const groupItem = groupStore.groupList.find(group => {
							return group.jid == item.id
						});
						console.log('选中项',groupItem);
						if(groupItem && testForbit(groupItem,groupStore.groupMemberList,systemStore.userId)){
							message.warn('该群禁言中，无法转发到此群')
						}else{
							selectList.set(chatId, {
								transmitType: SelectType.chat,
								data: item
							});
							setSelect(new Map(selectList));
						}
					}

				}}
			>
				<span className="title-item">
					<AvatorWithPhoto id={chatId} type={item.type} size={24} />
					<span className="name">{item.remarkName?item.remarkName:item.name}</span>
				</span>
				<Checkbox checked={selectList.has(chatId)}  />
			</div>
		);
	};
	return (
		<Modal visible={true} onCancel={props.cancelModal} onOk={_submitTransmit} okText="发送" cancelText="取消">
			<div className="modal-transmit-body">
			<div className="modal-transmit-left">
				<div>
					<Search
						value={filText}
						placeholder="请输入搜索名称或昵称"
						onChange={changeValue}
						style={{ width: 220 }}
					/>
				</div>
				{chatType ? (
					<div className="list-wrap">
						<div className="title-transmit">最近聊天列表</div>
						<div style={{ overflowY: 'auto' }}>
							{chatStore.chats.map((item: any, index: number) => {
								return renderItemChat({ index: index, key: index, parent: 1, style: {} })
							})}
						</div>
						{/* <AutoSizer>
							{({ width, height }) => (
								<VList
									rowHeight={40}
									width={width}
									height={height}
									overscanRowCount={10}
									rowCount={chatStore.chats.length}
									rowRenderer={renderItemChat}
								/>
							)}
						</AutoSizer> */}
					</div>
				) : (
						<div className="list-wrap" style={{ overflowY: 'scroll' }}>
							{friends.length > 0 ? <div className="title-transmit">好友列表</div> : null}
							{friends.map((item) => {
								const friendId = item.toUserId + '';
								return (
									<div
										key={friendId + item.toNickname}
										className="modal-transmit-item"
										onClick={() => {
											if (selectList.has(friendId)) {
												selectList.delete(friendId);
												setSelect(new Map(selectList));
											} else {
												selectList.set(friendId, {
													transmitType: SelectType.friend,
													data: item
												});
												setSelect(new Map(selectList));
											}
										}}
									>
										<span className="title-item">
											<AvatorWithPhoto id={friendId} type={ChatGrOrFrType.friend} size={24} />
											<span className="name">{item.remarkName || item.toNickname}</span>
										</span>
										<Checkbox checked={selectList.has(friendId)} />
									</div>
								);
							})}
							{/* <AutoSizer>
								{({ width, height }) => (
									<VList
										rowHeight={40}
										width={width}
										height={height}
										overscanRowCount={10}
										rowCount={friends.length}
										rowRenderer={renderItemFriend}
									/>
								)}
							</AutoSizer> */}
							{groups.length > 0 ? <div className="title-transmit">群组列表</div> : null}
							{groups.map((item) => {
								const groupId = item.jid + '';
								return (
									<div
										key={groupId + item.name}
										className="modal-transmit-item"
										onClick={() => {
											if (selectList.has(groupId)) {
												selectList.delete(groupId);
												setSelect(new Map(selectList));
											} else {
												if(!testForbit(item,groupStore.groupMemberList,systemStore.userId)){
													selectList.set(groupId, {
														transmitType: SelectType.group,
														data: item
													});
													setSelect(new Map(selectList));
												}else {
													message.warn('该群禁言中，无法转发到此群')
												}
											}
										}}
									>
										<span className="title-item">
											<AvatorWithPhoto id={groupId} type={ChatGrOrFrType.group} size={24} />
											<span className="name">{item.name}</span>
										</span>
										<Checkbox checked={selectList.has(groupId)} />
									</div>
								);
							})}
							{/* <AutoSizer>
								{({ width, height }) => (
									<VList
										rowHeight={40}
										width={width}
										height={height}
										overscanRowCount={10}
										rowCount={groups.length}
										rowRenderer={renderItemGroup}
									/>
								)}
							</AutoSizer> */}
						</div>
					)}
			</div>
			<div className="modal-transmit-right">
				{Array.from(selectList.values()).map((item, index) => {
					return <SelectItem key={index} {...item} onClose={removeOne} />;
				})}
			</div>
		</div>
		</Modal>
	);
}
