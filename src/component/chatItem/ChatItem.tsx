import * as React from 'react';
import { ChatItem, ChatGrOrFrType } from '../../interface/IChat';
import './ChatItem.less';
// import 'antd/es/badge/style/index.less';
import Popover from 'antd/es/popover';
// import 'antd/es/popover/style/';
//import webIM from '../../net/WebIM';
import Utils from '../../utils/utils';
import { getMessageText } from '../messageItem/MessageItem';
import { AvatorWithPhoto } from '../avatorWithPhoto/AvatorWithPhoto';
import { MessageType } from '../../net/Const';
import { GroupMemRole } from '../../interface/IGroup';

export interface IChartItemProps extends ChatItem {
	noRead: number;
	isGroup: boolean;
	delChart: (chat: ChatItem) => void;
	toTop: (id: string, isTop: boolean) => void;
	toNotice: (id: string, isNotice: boolean) => void;
}
interface ItemState {
	img: any;
	menuShow: boolean;
}
export class ChartItem extends React.Component<IChartItemProps, ItemState> {
	constructor(props: IChartItemProps) {
		super(props);
		this.state = {
			img: '',
			menuShow: false
		};
	}
	handleSendType = (isShow: boolean) => {
		this.setState({
			menuShow: isShow
		});
	};
	delChat = () => {
		this.props.delChart(this.props);
		this.setState({
			menuShow: false
		});
	};
	chatTop = (isTop: boolean) => {
		this.props.toTop(this.props.id, isTop);
		this.setState({
			menuShow: false
		});
	};
	chatNotice = (isNotice: boolean) => {
		this.props.toNotice(this.props.id, isNotice);
		this.setState({
			menuShow: false
		});
	};
	render() {
		const timeFormate = this.props.lastTime ? Utils.getTimeText(Number(this.props.lastTime), 1, 1) : '';
		let isTop = Boolean(this.props.isTop);
		let isRemind = Boolean(this.props.isNotice);
		const sendList = (
			<div className="send-list" style={{ maxWidth: '150px' }} onClick={(e) => e.stopPropagation()}>
				<label className="item" onClick={(e) => { e.stopPropagation(); this.chatTop(!isTop); }}>
					<span>{isTop ? '取消置顶' : '置顶'}</span>
				</label>
				<label className="item" onClick={(e) => { e.stopPropagation(); this.chatNotice(!isRemind); }}>
					<span>{isRemind ? '取消免打扰' : '消息免打扰'}</span>
				</label>
				<label className="item" onClick={(e) => { e.stopPropagation(); this.delChat(); }}>
					<span>删除聊天</span>
				</label>
			</div>
		);

		let content = this.props.lastContent
		content = content === '双向撤回消息' ? '' : content
		return (
			<div className={`chat-item ${isTop?'top':''}`}>
				<div className="avator-wraper">
					<AvatorWithPhoto type={(this.props.gid!=''&&this.props.isGroup)?ChatGrOrFrType.group:ChatGrOrFrType.friend} id={this.props.id} size={40} classN="head" />
                    {
                        this.props.noRead>0
                        ?  this.props.noRead<100? <span className = "sub-num">{this.props.noRead}</span>:<span className = "sub-num">{"99+"}</span>
                        : null
                    }
				</div>
				<div className="right">
					<Popover
						placement="bottomRight"
						content={sendList}
						trigger="contextMenu"
						visible={this.state.menuShow}
						onVisibleChange={this.handleSendType}
					>
						<div className="right-top">
							<span className="title">
								{this.props.isGroup ? this.props.name :  (this.props.remarkName?this.props.remarkName : this.props.name)}
							</span>
							<span>{timeFormate}</span>
						</div>
						<div className="content-mes">
							{
							this.props.isGroup &&
							(!(this.props.role == GroupMemRole.manage || this.props.role == GroupMemRole.owner)) &&
							(
								this.props.contentType == MessageType.DELETE_MEMBER ||
								this.props.contentType == MessageType.DELETE_MEMBER ||
								this.props.contentType == MessageType.GAG ||
								this.props.contentType == MessageType.REVOKE) ? 
							'' : getMessageText(content,'', this.props.mentionText,true,true)
							}
							{
								isRemind ? <img className='content-mes-notice' src={require('./../../assets/image/notice.png')}></img>:null
							}
						</div>

					</Popover>
				</div>
			</div>
		);
	}
}
