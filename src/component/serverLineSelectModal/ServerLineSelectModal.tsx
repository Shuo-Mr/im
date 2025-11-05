import * as React from 'react';
import Modal from 'antd/es/modal';
import message from 'antd/es/message';
import './serverLineSelect.less';
import Icon from 'antd/es/icon';
import Button from 'antd/es/button';
import { ServerLineItem } from './ServerlineItem';
import systemStore from '../../store/SystemStore';
import { IServerUrlItem } from '../../interface/IChat';
import { observer, inject } from 'mobx-react';
import webIM from '../../net/WebIM';
// import utils from "../../utils/utils";
export interface IserverLineSelectModalProps {
	cancelModal: () => void;
	serverList: (IServerUrlItem | null)[];
	needChangeConect?: boolean
}

export interface IserverLineSelectModalState {
	isLoading: boolean;
	testNumber: number;
	currentUrl: string;
}

@inject('systemStore')
@observer
export class ServerLineSelectModal extends React.Component<IserverLineSelectModalProps, IserverLineSelectModalState> {
	constructor(props: IserverLineSelectModalProps) {
		super(props);

		this.state = {
			isLoading: false,
			testNumber: 0,
			currentUrl: systemStore.boshUrl.split(`:${systemStore.boshUrlPort}/`)[0]
		};
	}
	testServer = () => {
		message.info('开始测试节点延迟');
		this.setState((state) => ({
			testNumber: state.testNumber + 1
		}));
	};
	changeServer = (url: string) => {
		this.setState({
			currentUrl: url
		});
	};
	confirmServer = () => {
		this.setState({
			isLoading: true
		});
		// SystemStore.apiUrl = utils.apiJudge(this.state.currentUrl) ? ('http://api.' + this.state.currentUrl) : ('http://' + this.state.currentUrl);
		// let boshWebUrl = utils.apiJudge(this.state.currentUrl) ? ("http://im."+  this.state.currentUrl): ('http://' + this.state.currentUrl);
    let boshWebUrl = this.state.currentUrl;
		systemStore.changeUrl(boshWebUrl);
		// systemStore.changXmmppUrl(url);
		//todo 修改当前连接，若正在连接需要重连 未连接只修改配置
		message.success('修改成功');
		webIM.logout(true);
		this.props.cancelModal();
	};
	public render() {
		const { cancelModal, serverList } = this.props;
		const { currentUrl, testNumber, isLoading } = this.state;

		return (
			<Modal
				visible={true}
				width="320px"

				onOk={this.confirmServer}
				closeIcon={<Icon type="clock-circle" style={{ color: '#40a9ff' }} />}
				onCancel={this.testServer}
				title="节点选择"
				confirmLoading={isLoading}
				footer={
					<div>
						<Button onClick={cancelModal}>取消</Button>
						<Button onClick={this.confirmServer} type="primary" loading={isLoading}>
							确认
						</Button>
					</div>
				}
			>
				<div className="sevver-line">
					{/* <h3 className="title-current">
						<label>当前地址:</label>
						<span>
						</span>
					</h3> */}
					{serverList.map((item, index) => {
						return (
							<ServerLineItem
								key={index}
								url={item ? item.url : ''}
								name={item ? item.name : ''}
								updateNum={testNumber}
								currentServer={currentUrl}
								changeServer={this.changeServer}
							/>
						);
					})}
				</div>
			</Modal>
		);
	}
}
