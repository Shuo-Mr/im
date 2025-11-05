import * as React from 'react';
import Avatar from 'antd/es/avatar';
import { NavLink } from 'react-router-dom';
import './settingItem.less';
import { IconImgEdit } from '../iconImage/IconImageEdit';
export interface ISettingItemProps {
	name: string;
	urlKey: string;
	img: string;
	exactName?: string;
	onClick?: () => void;
}

export function SettingItem(props: ISettingItemProps) {
	return (
		<NavLink to={props.urlKey} className="setting-item" activeClassName="selected" onClick={props.onClick}>
			<div className = "item-wrap">
				<Avatar size={24} icon="user" src={props.img} className="avatar" />
				<span className="item-right">
					<span className="name notranslate">{props.name}</span>
					<span style={props.exactName ? {} : { display: 'none' }} className="exact-text notranslate">
						{props.exactName}
					</span>
					<span>
						<IconImgEdit img={require('../../assets/image/right-icon.png')} size={12} marginSize={4} />
					</span>
				</span>
			</div>
		</NavLink>
	);
}
