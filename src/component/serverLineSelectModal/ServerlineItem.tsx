import React from 'react';
import { Checkbox, Spin } from 'antd';

export interface IServerLineItemProps {
	name: string;
	nickName?: string;
	url: string;
	port?: string;
	currentServer: string;
	changeServer: (url: string) => void;
	updateNum: number;
}
export interface IServerLineItemState {
	testing: boolean;
	testCost: number;
}

export class ServerLineItem extends React.Component<IServerLineItemProps, IServerLineItemState> {
	constructor(props: IServerLineItemProps) {
		super(props);
		this.state = {
			testing: false,
			testCost: 0
		};
	}
	getSnapshotBeforeUpdate(prevProps: IServerLineItemProps) {
		if (prevProps.updateNum != this.props.updateNum) {
			this.startServerTest();
		}
		return null;
	}
	getServerCost = async (): Promise<number> => {
		const currentTime = new Date().valueOf();
		const timeOut = 9000;
		return new Promise((res) => {
			let timer = setTimeout(() => {
				clearTimeout(timer);
				res(timeOut);
			}, timeOut);
			fetch((this.props.url.indexOf('http') > -1 ? this.props.url : 'http://' + this.props.url) + ':9090/').then(() => {
				res(new Date().valueOf() - currentTime);
			});
		});
	};
	startServerTest = async () => {
		this.setState({
			testing: true
		});
		const costTime = await this.getServerCost();
		this.setState({
			testing: false,
			testCost: costTime
		});
	};
	getTestCost = (cost: number) => {
		if (cost <= 0) {
			return null;
		}
		if (cost < 300) {
			return <span style={{ color: 'green' }}>{cost}ms</span>;
		} else if (cost < 9000) {
			return <span style={{ color: 'coral' }}>{cost}ms</span>;
		} else {
			return <span style={{ color: 'crimson' }}>>9000ms</span>;
		}
	};
	public render() {
		const { name, changeServer, currentServer, url } = this.props;
		const { testCost, testing } = this.state;

		console.log(currentServer.indexOf(url) > -1, '-----space-between-----');

		return (
			<div
				style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 8px', marginBottom: '8px' }}
				onClick={() => changeServer(url)}
			>
				<span>
					{name}
					（{url}）
					{testing ? <Spin /> : this.getTestCost(testCost)}
				</span>
				<Checkbox checked={currentServer.indexOf(url) > -1} />
			</div>
		);
	}
}
