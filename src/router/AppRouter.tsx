import * as React from 'react';
import friendStore from '../store/FriendStore';
import groupStore from '../store/GroupStore';
import routerStore from '../store/RouterStore';
import { observer, Provider } from 'mobx-react';
import systemStore from '../store/SystemStore';
import loginStore from '../store/LoginStore';
import mainStore from '../store/MainStore';
import chatStore from '../store/ChatStore';
import { createGroupStore } from '../store/CreatGroupStore';
import { requestStore } from '../store/RequestStore';
import friendGroupStore from '../store/FriendGroupStore';
import loadable from '../Loadable';
// import Login from "../page/login/Login";
// import Main from "../page/main/Main";
// import Regester from "../page/regeister/Regester";
// import ResetPassword from '../page/ForgetPassword/ResetPassword'

const Login = loadable(() => import('../page/login/Login'));
const LoadingView = loadable(() => import('../page/loadingView/LoadingView'));
const Main = loadable(() => import('../page/main/Main'));
const Regester = loadable(() => import('../page/regeister/Regester'));
const ResetPassword = loadable(() => import('../page/ForgetPassword/ResetPassword'));
// const QRLogin=loadable(() => import('../page/login/QRcodeLogin'))

// import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import { HashRouter as Router, Route, Switch, Redirect } from 'react-router-dom';

import './AppRouter.css';
import { initBug } from '../bugly';
import { Update } from '../page/update/Update';


const electron = window['electron'];

const ipcRenderer = electron ? electron.ipcRenderer : null;

ipcRenderer && ipcRenderer.on('message', (event: any, _data: { message: any, data: any }) => {

	switch (_data.message) {
		case 'isUpdateNow':
			electron.remote.dialog.showMessageBox({
				type: 'info',
				title: '确认更新',
				message: '更新最新版本',
				buttons: ['确定']
			}, function (index: number) {
				ipcRenderer.send('updateNow');
			});
			break;
		case 'isCanUpdate':
			console.log("isCanUpdate", _data);
			systemStore.latestVersion = _data.data.updateTitle;
			systemStore.updateLog = _data.data.updateLog;
			systemStore.showUpdate = true;
			break;
		case 'downloadProgress':
			console.log("downloadProgress", _data);
			systemStore.precentP = _data.data.percent
			systemStore.totalP = _data.data.total;
			systemStore.deltaP = _data.data.delta
			break;
		case 'checkUpdate':
			electron.remote.dialog.showMessageBox({
				type: 'info',
				title: '检查更新',
				message: '当前已经是最新版本',
				buttons: ['确定']
			});
			break;
		case 'error':
			systemStore.showUpdate = false;
			let en = setTimeout(() => {
				electron.remote.dialog.showMessageBox({
					type: 'error',
					title: '检查更新',
					message: '更新错误,请联系客服!',
					buttons: ['确定']
				});
				clearTimeout(en);
			}, 1000)
			break;
		default:

			console.log(_data.message, _data.data)
			break;
	}
});


//启动就开始检测，是否可以更新
ipcRenderer && ipcRenderer.send('openCheckRemote', 'init');



const stores = {
	systemStore,
	routerStore,
	loginStore,
	mainStore,
	chatStore,
	friendStore,
	groupStore,
	requestStore,
	createGroupStore,
	friendGroupStore
};
@observer
export default class AppRouter extends React.Component<any, any> {
	constructor(props: any) {
		super(props);
		initBug();
		// 初始化主题
		this.initTheme();
	}
	
	// 初始化主题
	initTheme = () => {
		const savedTheme = localStorage.getItem('_appearanceTheme') as 'default' | 'warm' | 'dark' | null;
		const htmlElement = document.documentElement;
		// 移除所有主题类
		htmlElement.classList.remove('theme-warm', 'theme-dark');
		// 如果是默认主题，不添加类名；否则添加对应的主题类
		if (savedTheme && savedTheme !== 'default') {
			htmlElement.classList.add(`theme-${savedTheme}`);
		}
	}
	
	render() {
		return (
			<Provider {...stores}>
				<Router>
					<div className="App">
						<Switch>
							<Route exact path="/login" component={Login} />
							<Route exact path="/regeister" component={Regester} />
							<Route exact path="/forget" component={ResetPassword} />
							<Route path="/main" component={Main} />
							<Route path="/loadingView" component={LoadingView} />
							<Redirect exact from="/" to="login" />
						</Switch>
						<Update percent={100} />
					</div>
				</Router>
			</Provider>
		);
	}
}
