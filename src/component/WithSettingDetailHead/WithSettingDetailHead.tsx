import chatStore from '../../store/ChatStore';
import React from 'react';
import Icon from 'antd/es/icon';
import './WithSettingDetail.less'

export const WithSettingDetailHead = (title: string, Component: any): any => {
	return () => (
        <div className = "wraper">
			<div className = "head-mobile">
				<Icon type="left" className="back-but" onClick={chatStore.detailBack} />
				<span>{title}</span>
			</div>
			<Component/>
		</div>
    );
};

