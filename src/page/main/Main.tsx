import * as React from 'react';
import { Route, RouteComponentProps, Redirect, Switch } from 'react-router';
import './Main.less';
import { NavLink } from 'react-router-dom';
import { observer, inject } from 'mobx-react';
import RightContent from '../rightContent/RightContent';
import ChartMessage from '../chart/ChartMessage';
import MySetting from '../my/MySetting';
import GroupView from '../group/Group';
import { MainStore, detailType } from '../../../src/store/MainStore';
import systemStore, { SystemStore } from '../../store/SystemStore';
import { RouterStore } from '../../../src/store/RouterStore';
import { autorun, IReactionDisposer } from 'mobx';
import eventBus from '../../utils/eventBus'

import Input from 'antd/es/input';
import Alert from 'antd/es/alert';
import Tooltip from 'antd/es/tooltip';
import Badge from 'antd/es/badge';
import Buttons from 'antd/es/button';

// import Avatar from 'antd/es/avatar';
import Modal from 'antd/es/modal';
import Icon from 'antd/es/icon';

import { Button } from 'antd/lib/radio';
import { UserAdd } from '../../interface/IaddFriend';
import { FriendStore } from '../../store/FriendStore';
import { CreateGroupStore } from '../../store/CreatGroupStore';
import UserInfomodal from '../../component/UserInfoModal/UserInfoModal';
import { tr } from '../../i18n/tr';
import { RequestStore } from '../../store/RequestStore';
import webIM from '../../net/WebIM';
import { AvatorWithPhoto } from '../../component/avatorWithPhoto/AvatorWithPhoto';
import Popover from 'antd/es/popover';
import { Title } from '../title/Title';
import { ChatStore } from '../../store/ChatStore';
// import ipcRender from '../../ipcRender';
import xmppSdk from '../../net/XmppSDK';
import Spin from 'antd/es/spin';
import { ServerLineSelectModal } from '../../component/serverLineSelectModal/ServerLineSelectModal';
import Search from '../search/Search';
import { isH5 } from '../../config/web.config';
// import { Update } from '../update/Update';
import { notShowContent } from '../../net/Const';
import QuickReplySidebar from '../quickReply/QuickReplySidebar';

const mainAvatar:any = React.createRef()

export interface IMainProps extends RouteComponentProps { }



interface WithStore extends IMainProps {
	mainStore: MainStore;
	routerStore: RouterStore;
	systemStore: SystemStore;
	friendStore: FriendStore;
	createGroupStore: CreateGroupStore;
	requestStore: RequestStore;
	chatStore: ChatStore;
}
interface IMainState {
	keyword: string;
	xmppStatus: number;
	menuShow: boolean;
	showServerLineModal: boolean;
	isW3:boolean;
	showQuickReplySidebar: boolean;
}
@inject('mainStore', 'systemStore', 'routerStore', 'friendStore', 'createGroupStore', 'requestStore', 'chatStore')
@observer
export default class Main extends React.Component<IMainProps, IMainState> {
	constructor(props: IMainProps) {
		super(props);
		(this.props as WithStore).routerStore.setHistory(this.props.history);
		this.state = {
			keyword: '',
			xmppStatus: 0,
			menuShow: false,
			showServerLineModal: false,
			isW3:false,
			showQuickReplySidebar: false,
		};
	}
	get injected() {
		return this.props as WithStore;
	}
	noReadMsgNumber =(chatId: string) =>{
        const noReadMsg = this.injected.chatStore.unReadMsgs.get(chatId + '');
        if(Array.isArray(noReadMsg) && noReadMsg.length > 0){
            return noReadMsg.length
        }else{
            return 0
        }
    }
	goSetting = () => {
		this.setState({
			isW3:false
		})
		this.injected.mainStore.filterTxt = '';
		this.injected.mainStore.clickClear = false;
		this.injected.mainStore.changeShowDetailType(detailType.setting);
		this.injected.mainStore.changeTabIndex(2);
	};

	go3w = () => {
		this.setState({
			isW3:true
		})
		this.injected.mainStore.filterTxt = '';
		this.injected.mainStore.clickClear = false;
		this.injected.mainStore.changeShowDetailType(detailType.w3);
		this.injected.mainStore.changeTabIndex(6);
	}
	goChart = (index: number) => {
		this.setState({
			isW3:false
		})
		this.injected.mainStore.filterTxt = '';
		this.injected.mainStore.clickClear = false;
		this.injected.mainStore.changeShowDetailType(detailType.message);
		this.injected.mainStore.changeTabIndex(index);
	};
	dispose: IReactionDisposer;
	componentDidMount() {
		this.dispose = autorun(() => {
			if (!this.injected.systemStore.access_token) {
				this.props.history.push('/login');
			}

			this.setState({ xmppStatus: this.injected.systemStore.xmppStatus });
		});
		// 监听更新事件
        eventBus.addListener('avatarUpdated', () => {
			console.log('---强制刷新', mainAvatar)
            mainAvatar.current.getAvatorData(false, '', true)
        })
	}

	// shouldComponentUpdate(){
	//     return false;
	// }
	handleSendType = () => {
		this.setState({
			menuShow: !this.state.menuShow
		});
	};
	showInfo() {
		this.setState({
			menuShow: true
		});
	}
	componentWillUnmount() {
		this.dispose && this.dispose();
		eventBus.remove('avatarUpdated')
	}
	addFriend = (user: UserAdd) => {
		this.injected.mainStore.showAddFriendApply(user);
		// this.injected.mainStore.applyAddfriend(''); 
	};
	handleMobileChange = (event: any) => {
		this.setState({ keyword: event.target.value });
	};
	applyAddFriend = () => {
		this.injected.mainStore.applyAddfriend('');
	};

	getXmppStatus = () => {
		/** xmpp 链接状态 0 未开始连接 1 连接中 2 连接成功 -1 初始状态 3 连接断开 */
		const antIcon = <Icon type="sync" style={{ fontSize: 14 }} spin />;
		if (this.state.xmppStatus == -1) {
			return (
				<span
				// onClick={() => {
				// 	xmppSdk.selfExit = true;
				// 	webIM.loginIM();
				// }}
				>
					<Alert message="正在连接，拉取数据" type="info" />
				</span>
			);
		}
		if (this.state.xmppStatus == 1) {
			return (
				<span style={{ zIndex: 1 }}>
					<Spin style={{ top: 2, left: 2 }} indicator={antIcon}>
						<Alert message="正在连接服务器" type="warning" />
					</Spin>
				</span>
			);
		} else if (this.state.xmppStatus == 2) {
			return null;
		} else {
			return (
				<span
					onClick={() => {
						xmppSdk.selfExit = true;
						webIM.loginIM();
					}}
				>
					<Alert message="网络状态不良,请检查网络" type="error" />
				</span>
			);
		}
	};
	goCreateGroup = () => {
		this.injected.mainStore.changeShowDetailType(detailType.CrtGroup);
		this.injected.createGroupStore.init();
	};

	handleChange(value: any) {
		console.log(`selected ${value}`);
	}

	loginOut = () => {
		// systemStore.access_token = '';
		webIM.logout(true);
	};
	showServerLineModal = () => {
		this.setState({
			showServerLineModal: true,
			menuShow: false
		})
	}
	cancelModal = () => {
		this.setState({
			showServerLineModal: false
		})
	}
	ShowClear = () => {
		this.injected.mainStore.clickClear = true;
		this.props.history.push('/main/search');
	}

	closeClear = () => {
		if (this.injected.mainStore.clickClear) {
			this.injected.mainStore.filterTxt = '';
			this.injected.mainStore.clickClear = false;
			this.props.history.push('/main/chart');
			this.injected.mainStore.changeTabIndex(0);
		}
	}
	showAddGroupView = () => {
		this.closeClear();
		this.injected.mainStore.showAddGroupModal();
	}
	manualRefresh = () => {
		console.log('---手动刷新ws')
		xmppSdk.disconnect()
		setTimeout(() => {
			console.log('---开始连接')
			xmppSdk.connect()
		}, 2000)
	}
	toggleQuickReplySidebar = () => {
		this.setState({
			showQuickReplySidebar: !this.state.showQuickReplySidebar
		});
	}
	public render() {

		console.log(`${this.props.match.url}/test`);
		const sendList = (
			<>

				{systemStore.isNodesList.length > 0 ? (
					<div className="send-list" style={{ maxWidth: 'none' }}>
						<a onClick={this.showServerLineModal}>节点选择</a>
					</div>
				)
					: null
				}
				<div className="send-list" style={{ maxWidth: 'none' }}>
					<a onClick={this.loginOut}>退出登录</a>
				</div>
			</>
		);


		const listChats = this.injected.chatStore.chats.filter(item => item.lastContent != notShowContent);
		let count = 0
		let tail = ''
		listChats.forEach(item => {
			count += this.noReadMsgNumber(item.id)
		})
		if (count > 99) {
			count = 99
			tail = '+'
		}

		const ChatMainType = (
			<div className={this.state.isW3?"nav-box  w3":"nav-box"}>
				<NavLink
					to={`${this.props.match.url}/chart`}
					onClick={() => this.goChart(0)}
					className="item"
					activeClassName="selected"
				>
					<Badge>
						{/* <Icon type="message" style={this.injected.mainStore.tabIndex == 0 ? selectedStyle : {}} /> */}
						{this.injected.mainStore.tabIndex == 0 ? (
							<img src={require('../../assets/image/message-selected.png')} alt="chart" />
						) : (
								<img src={require('../../assets/image/message.png')} alt="chart" />
							)}
					</Badge>
					{
						count ? <div className="item-count">{count}{tail}</div> : null
					}
					
				</NavLink>
				<NavLink
					to={`${this.props.match.url}/group`}
					onClick={() => this.goChart(1)}
					className="item"
					activeClassName="selected"
				>
					<Badge dot={this.injected.requestStore.haveUnreadReq > 0} style={{ zIndex: 1 }}>
						{/* <Icon type="team" style={this.injected.mainStore.tabIndex == 1 ? selectedStyle : {}} /> */}
						{this.injected.mainStore.tabIndex == 1 ? (
							<img src={require('../../assets/image/friends-selected.png')} alt="group" />
						) : (
								<img src={require('../../assets/image/friends.png')} alt="group" />
							)}
					</Badge>
				</NavLink>
				<NavLink
					to={`${this.props.match.url}/my`}
					onClick={this.goSetting}
					className="item"
					activeClassName="selected"
				>
					{/* <Icon type="user" style={this.injected.mainStore.tabIndex == 2 ? selectedStyle : {}} /> */}
					{this.injected.mainStore.tabIndex == 2 ? (
						<img src={require('../../assets/image/my-selected.png')} alt="my" />
					) : (
							<img src={require('../../assets/image/my.png')} alt="my" />
						)}
				</NavLink>
				{
					/*process.env.NODE_ENV == 'development'
						? <NavLink to={`${this.props.match.url}/test`} >
							<span style={{ lineHeight: '100%' }}>
								TPage
							</span>
						</NavLink>
						: null*/
				}
				{
					systemStore.tabBarConfigList && systemStore.tabBarConfigList.tabBarImg &&!isH5 ? <NavLink
						to={`${this.props.match.url}/3w`}
						onClick={this.go3w}
						className="item"
						activeClassName="selected"
					>
						{this.injected.mainStore.tabIndex == 3 ? (
							<img src={systemStore.tabBarConfigList.tabBarImg} alt="" />
						) : (
								<img src={systemStore.tabBarConfigList.tabBarImg1} alt="" />
							)}
					</NavLink> : null
				}
			</div>
		);
		// console.log(systemStore.tabBarConfigList,'当前状态',systemStore.tabBarConfigList.tabBarImg,ipcRender.isElectron)
		return (
			<div className="main-wraper">
				<div className="main-header">
					<div className="search-wraper">
						<Input
							suffix={
								this.injected.mainStore.clickClear ? <Icon type="close-circle" theme="filled" style={{ color: '#8CA6F5' }} onClick={this.closeClear} /> : null
							}
							onFocus={this.ShowClear}
							placeholder="搜索联系人、群组等"
							maxLength={30}
							prefix={<Icon type="search" style={{ color: '#8CA6F5' }} />}
							value={this.injected.mainStore.filterTxt}
							onChange={(e) => { this.injected.mainStore.changeFilterText(e.target.value); }}
						/>
					</div>
					<Tooltip title={tr(171)}> 
						<Icon type="user" style={{ color: '#D8E1FF', fontSize: '22px' }} onClick={() => this.injected.mainStore.showAddFriModal()} /> 
					</Tooltip>
					<Tooltip title={tr(43)}> 
						<Icon
							type="plus"
							style={{ color: '#D8E1FF', fontSize: '22px' ,marginLeft:'15px'}}
							onClick={this.showAddGroupView}
						/>
					</Tooltip>
					<Tooltip title={tr(185)}> 
						<Icon
							type="redo"
							style={{ color: '#D8E1FF', fontSize: '22px' ,marginLeft:'15px'}}
							onClick={this.manualRefresh}
						/>
					</Tooltip>
					<Tooltip title={this.state.showQuickReplySidebar ? "关闭快捷回复" : "打开快捷回复"}> 
						<Icon
							type={this.state.showQuickReplySidebar ? "double-left" : "double-right"}
							style={{ color: '#D8E1FF', fontSize: '22px', marginLeft: '15px', cursor: 'pointer' }}
							onClick={this.toggleQuickReplySidebar}
						/>
					</Tooltip>

				    {/* this */}
					
					<span className="main-avator">
						<Popover
							placement="bottomLeft"
							title={this.injected.systemStore.nickname}
							content={sendList}
							trigger="click"
							visible={this.state.menuShow}
							onVisibleChange={this.handleSendType}
						>
							<AvatorWithPhoto  ref={mainAvatar}  type={0} id={this.injected.systemStore.userId} size={40} classN="head" forceUpdate={true} />
							<Buttons className="click-me" type="primary">
								Click me
							</Buttons>
						</Popover>
					</span>
				</div>
				<Title />
				<div className="main-body">
					<div className="left-list">
						{this.getXmppStatus()}
						<div className="list-wraper">
							<Switch>
							<Route
								path={`${this.props.match.url}/chart`}
								component={ChartMessage}
							/>
							<Route
								path={`${this.props.match.url}/group`}
								component={GroupView}
							/>
							<Route
								path={`${this.props.match.url}/my`}
								component={MySetting}
							/>
							<Route
								path={`${this.props.match.url}/CrtGroup`}
								component={MySetting}
							/>
							<Route
								path={`${this.props.match.url}/search`}
								component={Search}
							/>
								{
									// process.env.NODE_ENV == 'development'
									// 	? <Route
									// 		path={`${this.props.match.url}/test`}
									// 		component={Update}
									// 		style={{ WebkitUserDrag: 'none' }}
									// 	/>
									// 	: null
								}
								<Redirect
									exact
									from={`${this.props.match.url}/`}
									to={`${this.props.match.url}/chart`}
								/>
							</Switch>
						</div>
						{ChatMainType}
					</div>
					<div
						className={`right-content ${!this.injected.mainStore.detailType ||
							this.injected.mainStore.detailType == detailType.none
							|| window.location.href.slice(-8) == '/main/my'
							|| (this.injected.mainStore.detailType == detailType.message &&
								!this.injected.chatStore.currentChatData.name)
							? 'hide'
							: ''}`}
						onClick={this.closeClear}
					>
						<Route path={`${this.props.match.url}/`} component={RightContent} />
					</div>
					{this.state.showQuickReplySidebar && <QuickReplySidebar />}
				</div>
				<Modal
					visible={this.injected.mainStore.addFriModalData.isShow}
					mask={false}
					centered
					title="添加好友"
					width={420}
					footer={null}
					onOk={this.applyAddFriend}
					onCancel={this.injected.mainStore.closeAddFriModal}
				>
					<div className="addfriend-box">
						<div className="search-wraper">
							<input
								type="text"
								placeholder="请输入手机号/ID号"
								onChange={this.handleMobileChange}
								value={this.state.keyword}
								maxLength={30}
							/>
							<Button onClick={() => this.injected.mainStore.searchUserFun(this.state.keyword)}>
								搜索
							</Button>
						</div>
						<div className="search-user-wraper">
							{Array.isArray(this.injected.mainStore.searchUserList) &&
								this.injected.mainStore.searchUserList.length > 0 ? (
									this.injected.mainStore.searchUserList.map((item, index) => {
										return (
											<div key={index} className="user-item">
												<span>
													<span>{item.name}</span>
													<span>{item.id}</span>
												</span>
												<span>
													{/* <Icon
														type="user-add"
														style={{ fontSize: '20px' }}
														onClick={() => this.addFriend(item)}
													/> */}
													<Icon
														type="user-add"
														style={{ fontSize: '20px' }}
														onClick={() => this.addFriend(item)}
													/>
												</span>
											</div>
										);
									})
								) : (
									<span className="no-data">暂无搜索用户</span>
								)}
						</div>
					</div>
				</Modal>
				<Modal
					mask={false}
					centered
					title="好友验证"
					visible={this.injected.mainStore.addFriendApplyData.isShow}
					width={340}
					okText={'确定'}
					cancelText={'取消'}
					onOk={this.applyAddFriend}
					onCancel={this.injected.mainStore.closeAddFriendApply}
				>
					<div className="addfriend-box">
						{/* <Avatar icon="user" src={this.injected.mainStore.addFriendApplyData.headUrl} /> */}
						<AvatorWithPhoto type={0} id={this.injected.mainStore.addFriendApplyData.id} size={24} />
						<span className="user-name">
							{this.injected.mainStore.addFriendApplyData.name}
							({this.injected.mainStore.addFriendApplyData.id})
						</span>
					</div>
				</Modal>
				{this.injected.mainStore.infoUserId&& this.injected.mainStore.infoUserId!=='10005'? (
					<UserInfomodal userId={this.injected.mainStore.infoUserId} />
				) : null}
				{this.state.showServerLineModal ? (
					<ServerLineSelectModal needChangeConect serverList={systemStore.isNodesList} cancelModal={this.cancelModal} />
				) : null}
			</div>
		);
	}
}
