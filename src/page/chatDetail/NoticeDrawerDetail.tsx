import * as React from 'react';

import message from 'antd/es/message';
import Button  from 'antd/es/button';
import Icon from 'antd/es/icon';
import { NoticeItem, ChatGrOrFrType } from '../../interface/IChat';
import imsdk from '../../net/IMSDK';
import { CrtGrNotice } from './CreateNotice';
import TptongzhiImg from '../../assets/image/no-anounce.png';
import chatStore from '../../store/ChatStore';
import { GroupMemRole } from '../..//interface/IGroup';
import { AvatorWithPhoto } from '../../component/avatorWithPhoto/AvatorWithPhoto';
import moment = require('moment');
import { ConfirmCommon } from '../../component/confirmModal/ConfirmModal';
import { tr } from '../../i18n/tr';

export interface INoticeDrawerDetailProps {
    groupId: string,
    isshow: boolean
}

export interface INoticeDrawerDetailState {
    listNotice: NoticeItem[],
    // isLoading: boolean,
    isCreateNotice: boolean
}

export class NoticeDrawerDetail extends React.Component<INoticeDrawerDetailProps, INoticeDrawerDetailState> {
    constructor(props: INoticeDrawerDetailProps) {
        super(props);

        this.state = {
            listNotice: [],
            // isLoading: false,
            isCreateNotice: false
        }
    }
    componentDidMount() {
        this.getGroupNotice();
    }
    // componentWillReceiveProps(nextProps: INoticeDrawerDetailProps) {
    //     nextProps.isshow && this.getGroupNotice();
    // }
    getGroupNotice = async () => {
        // this.setState({
        //     isLoading: true
        // });
        const result = await imsdk.getNotices(this.props.groupId);
        if (result.resultCode == 1) {
            if (result.data && Array.isArray(result.data.pageData)) {
                let noticeList: NoticeItem[] = [];
                result.data.pageData.forEach((notice: NoticeItem) => {
                    noticeList.push({
                        ...notice
                    })
                })
                this.setState({
                    listNotice: noticeList,
                    isCreateNotice:false
                })
            } else {
                this.setState({
                    listNotice: [],
                    isCreateNotice:false
                })
            }
        } else {
            message.error(tr(92))
        }
    }
    switchCreatNotice = () => {
        this.setState(state => ({
            isCreateNotice: !state.isCreateNotice
        }))
    }
    goBackUpdate = () => {
        this.getGroupNotice();
        // this.switchCreatNotice();
    }
    delNotice = (notice: NoticeItem) => {
        ConfirmCommon(tr(93), () => this.toDelNotice(notice))
    }
    toDelNotice = async (notice: NoticeItem) => {
        const res = await imsdk.delNotices(this.props.groupId, notice.id);
        if (res && res.resultCode == 1) {
            this.getGroupNotice();
            message.success(tr(94));
        } else {
            message.warn(tr(95));
        }
    }
    public render() {
        const haveAuthNotice = chatStore.currentChatData.role && (chatStore.currentChatData.role == GroupMemRole.owner || chatStore.currentChatData.role == GroupMemRole.manage)
        if (this.state.isCreateNotice) {
            return <CrtGrNotice switchCreatNotice={this.switchCreatNotice} goBackUpdate={this.goBackUpdate} />
        }
      if (!this.state.listNotice || this.state.listNotice.length < 1) {
            return (
                <div className="no-notice-wraper">
                    <img src={TptongzhiImg} />
                    <p className="title">{tr(96)}</p>
                    <span className="sub-title">{tr(97)}</span>
                    {
                        haveAuthNotice
                            ? <Button onClick={this.switchCreatNotice}>{tr(98)}</Button>
                            : null
                    }
                </div>
            );
        }else{
            return (
                <div className="notice-detail-list">
                    <div className="notice-detail-one">
                        {
                            this.state.listNotice.map((notice, index) => {
                                return (
                                    <div key={index} style={{ marginBottom: '16px' }}>
                                        <div className="head">
                                            <div className = "left">
                                                <AvatorWithPhoto type={ChatGrOrFrType.friend} id={notice.userId} size={36} classN="head-margin" />
                                                <span className="right">
                                                    <span className="name">
                                                        {notice.nickname}
                                                    </span>
                                                    <span className="time">
                                                        {notice.time ? moment(Number(notice.time) * 1000).format('YYYY-MM-DD HH:mm') : ' '}
                                                    </span>
                                                </span>
                                            </div>
                                            {
                                                haveAuthNotice
                                                    ? <Icon type="delete" style={{ fontSize: '14px', marginLeft: '8px', color: '#7b7b7b' }}
                                                        className="click-common"
                                                        onClick={() => this.delNotice(notice)}
                                                    />
                                                    : null
                                            }
                                        </div>
                                        <div>
                                            {notice.text}
                                        </div>
                                    </div>
                                )
                            })
                        }
                    </div>
                    <div className="chuangjian">
                        {
                            haveAuthNotice
                                ? <Button  type="primary" onClick={this.switchCreatNotice} className="crt-but">{tr(99)}</Button>
                                : null
                        }
                    </div>
                </div>
            );
        }

    }
}
