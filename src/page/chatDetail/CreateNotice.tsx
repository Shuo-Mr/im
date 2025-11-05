import * as React from 'react';
import Button  from 'antd/es/button';
import message from 'antd/es/message'

import chatStore, { ChatStore } from '../../store/ChatStore';
import imsdk from '../../net/IMSDK';
import { tr } from '../../i18n/tr';

export interface ICrtGrNoticeProps {
    switchCreatNotice: () => void,
    goBackUpdate: () => void
}

export interface ICrtGrNoticeState {
    noticeContent: string,
    loading: boolean
}
interface ICrtGrNoticePropsWithStore extends ICrtGrNoticeProps {
    chatStore: ChatStore,
}

export class CrtGrNotice extends React.Component<ICrtGrNoticeProps, ICrtGrNoticeState> {
    constructor(props: ICrtGrNoticeProps) {
        super(props);

        this.state = {
            noticeContent: '',
            loading: false
        }
    }
    get injected() {
        return this.props as ICrtGrNoticePropsWithStore
    }
    componentDidMount() {
        this.textDom && this.textDom.focus()
    }
    createNotice = async (gid:string) => {
        if (!this.state.noticeContent) {
            message.warn(tr(149));
            return;
        }
        // else
        // {
        //     imsdk.submitGropExplain(chatStore.currentChatData.gid, this.state.noticeContent);
        // }
        this.setState({
            loading: true
        })
        const res = await imsdk.createNotice(gid, this.state.noticeContent);
        if (res && res.resultCode == 1) {
            this.props.goBackUpdate();
        } else {
            message.warn(tr(150));
        }
        this.setState({
            loading: false
        })
    }
    changeNotice = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        e.preventDefault();
        const targetValue = e.target && e.target.value ? e.target.value : ''
        this.setState(state => ({
            noticeContent: targetValue
        }))
    }
    textDom: any
    public render() {
        return (
            <div className="no-text">
                <div className="text">
                    <textarea ref={ref => this.textDom = ref} value={this.state.noticeContent} onChange={this.changeNotice} />
                </div>
                <div className="but">
                    <Button type="primary" loading={this.state.loading} onClick={()=>this.createNotice(chatStore.currentChatData.gid)}>{tr(151)}</Button>
                    <Button id="btnclear" onClick={() => this.props.switchCreatNotice()}>{tr(152)}</Button>
                </div>
            </div>
        );
    }
}