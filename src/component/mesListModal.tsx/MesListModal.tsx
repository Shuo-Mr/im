import * as React from 'react';
import Modal from 'antd/es/modal';
import { MessageItem as IMessageItem } from '../../interface/IChat';
import MessageItem from '../messageItem/MessageItem';
import './MesListModal.less'

export interface IMesListModalProps {
	submitOk: () => void;
	mesList: IMessageItem[];
}

export function MesListModal(props: IMesListModalProps) {
	return (
		<Modal
		visible = {true}
		title = "聊天列表"
		okText = {'确认'}
		footer = {null}
		onCancel={props.submitOk}
		>
			<div className = "meslist-modal-body">
				{props.mesList.map((item, index) => {
					return (
						<MessageItem
							key={item.messageId}
							messages={item}
							messageStatus={undefined}
							isGroup={false}
							isForbidden={false}
							reSendMes={() => {}}
							canViewInfo={false}
							keyIndex={index + ''}
							role={0}
							addmentionUser={() => {}}
							isMesSel={false}
							isCheck={false}
							switchMesCheck={() => {}}
							transmitMes={() => {}}
							showTransmitModal={() => {}}
							notStatus = {true}
							unreadCount={item.unreadCount?item.unreadCount:0}
						/>
					);
				})}
			</div>
		</Modal>
	);
}
