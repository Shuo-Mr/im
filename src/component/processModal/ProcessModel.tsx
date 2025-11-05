import * as React from 'react';
import { ProgressMy } from '../../component/progressMy/ProgressMy';
import Modal from 'antd/es/modal';

interface IProcessModelProps {
    hideModel: ()=> void, //关闭弹窗的function
    percent: number, // 进度百分比
    updateInfo: string // 更新内容
}

export const ProcessModel: React.FunctionComponent<IProcessModelProps> = (props) => {
	return (
		<Modal
			title="软件升级"
			width="360px"
			visible
			onCancel={props.hideModel}
			footer={<ProgressMy percent={props.percent} />}
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
					{props.updateInfo}
				</div>
			</div>
		</Modal>
	);
};
