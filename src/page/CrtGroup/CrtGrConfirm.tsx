import * as React from 'react';
import { inject, observer } from 'mobx-react';
import { CreateGroupStore } from '../../store/CreatGroupStore';
// import message from 'antd/es/message';
//  import Avatar from 'antd/es/avatar';
import Input from 'antd/es/input';
import Icon from 'antd/es/icon';
import Button from 'antd/es/button';
import { List as VList } from 'react-virtualized/dist/es/List';
import { AutoSizer } from 'react-virtualized/dist/es/AutoSizer';

//  import IMSDK from '../../net/IMSDK';
// import mainStore, { detailType } from '../../store/MainStore';
import './CrtGrConfrm.less';
import { tr } from '../../i18n/tr';
import { AvatorWithPhoto } from '../../component/avatorWithPhoto/AvatorWithPhoto';
import { message } from 'antd';
import systemStore  from '../../store/SystemStore';

export interface ICrtGrConfirmState {
	name: string;
	subName: string;
	isLoading: boolean;
	isClickable:boolean
}
export interface ICrtGrConfirmProps {
	goBack: () => void;
}
interface INewFriendWithStore extends ICrtGrConfirmProps {
	createGroupStore: CreateGroupStore;
}

@inject('createGroupStore')
@observer
export class CrtGrConfirm extends React.Component<ICrtGrConfirmProps, ICrtGrConfirmState> {
	constructor(props: ICrtGrConfirmProps) {
		super(props);

		this.state = {
			name: '',
			subName: '',
			isLoading: false,
			isClickable: true
		};
	}
	get injected() {
		return this.props as INewFriendWithStore;
	}
	submitCreateGroup = async () => {
		if(this.state.isLoading){
			return;
		}
		if(!this.state.name || !(this.state.name && this.state.name.trim())){
			message.warn('群名不能为空!');
			return;
		}
		if(!this.state.isLoading){

			if (!this.state.isLoading) {
				if (systemStore.isCommonCreateGroup === 2) {
					message.error('禁止建群');
				} else {
					if(+systemStore.isCreateRoom === 0){
						message.error('禁止建群');
					}else{
						await this.injected.createGroupStore.submitgroupCreate(this.state.name, this.state.subName);
						this.setState({
							isLoading: true,
							isClickable: false
						});
					}
				}
			}
		}
		// if (res) {
		// 	message.success('创建成功');
		// 	mainStore.changeShowDetailType(detailType.none);
		// } else {
		// 	// message.warn('创建失败');
		// }
		this.setState({
			isLoading: false
		});
	};
	renderItem = ({ index, key, style }: any) => {
		const { createGroupStore } = this.injected;
		const item = createGroupStore.selectGroupMembers[index];

		return (
			<div key={key} className="list-items" style = {style}>
				{/* <Avatar icon="team" src={IMSDK.getAvatarUrl(Number(item.toUserId), false)}  className = "avator"/> */}
				<AvatorWithPhoto type={0} id={item.toUserId.toString()} classN="headavator" size={40} />
				<span
					style={{
						position: 'relative',
						left: '13px',
						top: '-3px',
						// color: '#2c2f36',
						color:" #222222",
						lineHeight: '20px',
						fontSize: '14px'
					}}
				>
					{item.remarkName?item.remarkName:item.toNickname}
				</span>
			</div>
		);
	};
	public render() {
		const { createGroupStore } = this.injected;
		return (
			<div className="creat-group-wrap">
				<div className="head">
					<Button onClick={this.props.goBack} className="back">
						<Icon type="left" /> {tr(39)}
					</Button>
					<div className="title">{tr(41)}</div>
					<Button
						className="next"
						type="link"
						onClick={this.submitCreateGroup}
						disabled={!this.state.isClickable}
						loading={this.state.isLoading}
					>
						{this.state.isClickable ?tr(40):'创建中'}
					</Button>
				</div>
				<div className="creatname">
					<img className="creatname-icon" src={require('./../../assets/image/camera.png')} />
					{/* <Input placeholder={tr(42)} value={this.state.name} onChange={e => this.setState({ name: e.target.value })}
                        prefix={<Icon type="camera" theme="outlined" style={{ color: 'rgba(0,0,0,.25)' }} />}
                    /> */}
					<Input
						type="text"
						maxLength={30}
						placeholder={tr(42)}
						value={this.state.name}
						onChange={(e) => this.setState({ name: e.target.value })}
					/>
				</div>
				<div className="list-wrap">
					<AutoSizer>
						{({ height, width }) => {
							return (
								<VList
									// ref={(ref) => (this.list = ref)}
									width={width}
									height={height}
									overscanRowCount={20}
									rowCount={createGroupStore.selectGroupMembers.length}
									rowHeight={60}
									rowRenderer={this.renderItem}
								/>
							);
						}}
					</AutoSizer>
				</div>
			</div>
		);
	}
}
