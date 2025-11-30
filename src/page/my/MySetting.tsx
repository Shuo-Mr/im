import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import systemStore, { SystemStore } from '../../store/SystemStore';
import { inject, observer } from 'mobx-react';
// import  Avatar  from 'antd/es/avatar';
// import IMSDK from '../../net/IMSDK';
import { SettingItem } from '../../component/settingItem/SettingItem';
import './mySetting.less';
import { NavLink } from 'react-router-dom';
import { IconImgEdit } from '../../component/iconImage/IconImageEdit';
import { tr } from '../../i18n/tr';
import { LoginStore } from '../../store/LoginStore';
import { AvatorWithPhoto } from '../../component/avatorWithPhoto/AvatorWithPhoto';
import mainStore, { detailType } from '../../store/MainStore';
import eventBus from '../../utils/eventBus'
export interface IMySettingProps extends RouteComponentProps {}


let myNickname = ''
const settingAvatar:any = React.createRef()

export interface IMySettingState {}
interface WithStore extends IMySettingProps {
	systemStore: SystemStore;
	loginstore: LoginStore;
}
@inject('systemStore')
@observer
export default class MySetting extends React.Component<IMySettingProps, IMySettingState> {
	constructor(props: IMySettingProps) {
		super(props);

		this.state = {};
	}
	get injected() {
		return this.props as WithStore;
	}
	componentDidMount() {
		myNickname = this.injected.systemStore.nickname
		// 监听更新事件
        eventBus.addListener('avatarUpdated', () => {
            console.log('---强制刷新', settingAvatar)
            settingAvatar.current.getAvatorData(false, '', true)
        })
		eventBus.addListener('changeNickname', (nickname: string) => {
            console.log('---强制刷新nickname', nickname)
			myNickname = nickname
			this.forceUpdate()
        })
	}
	componentWillUnmount() {
		eventBus.remove('avatarUpdated')
		eventBus.remove('changeNickname')
	}
	public render() {
		// console.log('扫码登录没复制吗', systemStore.telephone ,systemStore.user.account)
		return (
			<div className="setting-left">
				<NavLink
					className="my-info-item"
					to={this.props.match.url + '/info'}
					onClick={() => mainStore.changeShowDetailType(detailType.setting)}
				>
					{/* <Avatar className="avator" size={48} icon="user" src={IMSDK.getAvatarUrl(Number(this.injected.systemStore.userId), false)} /> */}
					<span style = {{display:'flex',width:'200px',overflow:'hidden'}}>
						<AvatorWithPhoto ref={settingAvatar} forceUpdate={false} id={this.injected.systemStore.userId} type={0} size={48} />
						<span style = {{marginLeft:'8px'}}>
							<div className="name">{myNickname}</div>
							<div className="telephone">
								{systemStore.telephone ? systemStore.telephone : systemStore.user.account}
							</div>
						</span>
					</span>
					<span className="right-info-icon">
						<IconImgEdit img={require('../../assets/image/right-icon.png')} size={12} marginSize={4} />
					</span>
				</NavLink>
				<SettingItem
					urlKey={this.props.match.url + '/appearance'}
					onClick={() => mainStore.changeShowDetailType(detailType.setting)}
					name="外观设置"
					exactName=""
					img={require('./../../assets/image/theme.png')}
				/>
				{/* <SettingItem urlKey={this.props.match.url + '/clearCache'} name={tr(5)} exactName="1.16M" img={require('./../../assets/image/clear-cache.png')} /> */}
				<SettingItem
					urlKey={this.props.match.url + '/clearHistory'}
					onClick={() => mainStore.changeShowDetailType(detailType.setting)}
					name={tr(9)}
					exactName=""
					img={require('./../../assets/image/clear-history.png')}
				/>
				{/* <SettingItem
					urlKey={this.props.match.url + '/mesGroupSend'}
					onClick={() => mainStore.changeShowDetailType(detailType.setting)}
					name={tr(6)}
					exactName=""
					img={require('./../../assets/image/send-group.png')}
				/> */}
				{/* <SettingItem
					urlKey={this.props.match.url + '/secretSet'}
					onClick={() => mainStore.changeShowDetailType(detailType.setting)}
					name={tr(7)}
					exactName=""
					img={require('./../../assets/image/secret-setting.png')}
				/> */}
				{/* <SettingItem
					urlKey={this.props.match.url + '/languageChange'}
					onClick={() => mainStore.changeShowDetailType(detailType.setting)}
					name={tr(4)}
					exactName={languaConfig[this.injected.systemStore.language]}
					img={require('./../../assets/image/language-swtch.png')}
				/> */}
				<SettingItem
					urlKey={this.props.match.url + '/pasChange'}
					onClick={() => mainStore.changeShowDetailType(detailType.setting)}
					name={tr(8)}
					exactName=""
					img={require('./../../assets/image/change-password.png')}
				/>
				<SettingItem
					urlKey={this.props.match.url + '/tipChange'}
					onClick={() => mainStore.changeShowDetailType(detailType.setting)}
					name={'提示音设置'}
					exactName=""
					img={require('./../../assets/image/no-anounce2.png')}
				/>
				<SettingItem
					urlKey={this.props.match.url + '/aboutus'}
					onClick={() => mainStore.changeShowDetailType(detailType.setting)}
					name={tr(181)}
					exactName=""
					img={require('./../../assets/image/anout-us.png')}
				/>
			</div>
		);
	}
}
