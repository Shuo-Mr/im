import React from 'react';
// import Button from 'antd/es/button';
// import { ProcessModel } from './../../component/processModal/ProcessModel'
import Modal from 'antd/lib/modal/Modal';
import { ProgressMy } from '../../component/progressMy/ProgressMy';
import { observer, inject } from 'mobx-react';
import Button from 'antd/lib/button/button';
import ipcRender from '../../ipcRender';

const ReactMarkdown = require('react-markdown')
// import { SystemStore } from '../../store/SystemStore';


interface ITestComponentProps {
	percent: number;
}


@inject('systemStore')
@observer
export class Update extends React.Component<ITestComponentProps, any> {

	constructor(props: ITestComponentProps) {
		super(props);
		this.state = {
			progressVisible: false,
			visible: false,
			status: 1
		};
	}

	updateHandle = () => {
		ipcRender.notifyUpdate();
		this.setState({ status: 2 });
	}

	cancelHandle = () => {

	}

	input = (_latestVersion: string, _updateLog: string) => {
		return `${_latestVersion}
${_updateLog}`
	}



	render() {
		const systemStore = this.props['systemStore'];
		let footer = this.state.status == 1 ? (<div>
			<Button key="cancel" onClick={() => {
				console.log("下次更新");
				systemStore.showUpdate = false;
			}} >{"下次更新"}</Button>
			<Button type="primary" onClick={this.updateHandle} key="primary" >{"更新"}</Button>

		</div>) : <ProgressMy percent={Math.ceil(systemStore.precentP)} />;

		return (
			<div>
				{systemStore.showUpdate ? (
					<Modal
						title={"升级提示"}
						width="500px"
						keyboard={false}
						maskClosable={false}
						visible
						onCancel={() => {
							systemStore.showUpdate = false;
						}}
						footer={footer}
					>
						<div>
							<div
								style={{
									maxHeight: '240px',
									overflowX: 'hidden',
									overflowY: 'scroll',
									color: '#272727'
								}}
							>
								<ReactMarkdown source={this.input(systemStore.latestVersion, systemStore.updateLog)} />
							</div>
						</div>
					</Modal>
				) : null}
			</div>
		);
	}




};
