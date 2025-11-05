import * as React from 'react';
import Drawer from 'antd/es/drawer';
import { DrawerType } from '../../interface/IChat';
import ChatDrawerDetail from './ChatDrawerDetail';
import { NoticeDrawerDetail } from './NoticeDrawerDetail';
import GroupDraweDetail from './GroupDraweDetail';
import { tr } from '../../i18n/tr';
import { ChatStore } from '../../store/ChatStore';
import { inject, observer } from 'mobx-react';
// import message from 'antd/es/message';
export interface IDrawerWithFriendProps {
    isshow: boolean,
    onclose: () => void,
    drawerType: DrawerType
    groupId: string,
    canViewInfo: boolean
}

export interface IDrawerWithFriendState {
}

interface IDrawerDetailPropsWithStore extends IDrawerWithFriendProps {
    chatStore: ChatStore,
}
@inject('chatStore')
@observer
export default class DrawerDetail extends React.Component<IDrawerWithFriendProps, IDrawerWithFriendState> {
    constructor(props: IDrawerWithFriendProps) {
        super(props);

        this.state = {
            // isTop:this.injected.chatStore.getTop(this.injected.chatStore.currentChat.id)?Boolean(this.injected.chatStore.getTop(this.injected.chatStore.currentChat.id)):false,
            // isNotice:this.injected.chatStore.getNotice(this.injected.chatStore.currentChat.id)?Boolean(this.injected.chatStore.getNotice(this.injected.chatStore.currentChat.id)):false
        }
    }
    get injected() {
        return this.props as IDrawerDetailPropsWithStore
    }
    getTitle = () => {
        switch (this.props.drawerType) {
            case DrawerType.friend: {
                return tr(82)
            }
            case DrawerType.notice: {
                return tr(83)
            }
            case DrawerType.group: {
                return tr(84)
            }
        }
    }
    
    setNotice = (isNotice: boolean) => {
        this.injected.chatStore.setNotice(this.injected.chatStore.currentChat.id, isNotice);

    }
    setMsgGroupBanned = async () => {

    }
    setMsgTop = (isTop: boolean) => {
        this.injected.chatStore.setTop(this.injected.chatStore.currentChat.id, isTop);
    }
    setSnapChat=(isSnapChat:number)=>{
        this.injected.chatStore.setSnapChat(this.injected.chatStore.currentChat.id, isSnapChat);
    }
    getContent = () => {
        let isNotice = false;
        let isTop = false;
        let issnapChat=false
        const chat = this.injected.chatStore;
        const chatItem = chat.chats.find(item => item.id == chat.currentChat.id);
        if (chatItem) {
            isNotice = Boolean(chatItem.isNotice);
            isTop = Boolean(chatItem.isTop);
            issnapChat= Boolean(chatItem.snapChat && chatItem.snapChat > 0)
        }
    
        switch (this.props.drawerType) {
            case DrawerType.friend: {

                return <ChatDrawerDetail
                    msgBanned={false}
                    setMsgGroupBanned={this.setMsgGroupBanned}
                    isTop={isTop}
                    issnapChat={issnapChat}
                    getNotice={isNotice}
                    setSnapChat={this.setSnapChat}
                    setMsgTop={this.setMsgTop}
                    setNotice={this.setNotice}
                />
            }
            case DrawerType.notice: {
                return <NoticeDrawerDetail groupId={this.props.groupId} isshow={this.props.isshow} />
            }
            case DrawerType.group: {
                return <GroupDraweDetail
                    onClose={this.props.onclose}
                    isMainShow={true} title={this.getTitle()}
                    canViewInfo={this.props.canViewInfo}
                    getNotice={isNotice}
                    isTop={isTop}
                    setMsgTop={this.setMsgTop}
                    setNotice={this.setNotice}
                />
                //return <GroupDraweDetail  isshow={this.props.isshow}/>
            }
            default: {
                console.warn('未知聊天类型');
                return null
            }
        }
    }
    public render() {
        const title = this.getTitle();
        let isNotice = false;
        let isTop = false;
        const chat = this.injected.chatStore;
        const chatItem = chat.chats.find(item => item.id == chat.currentChat.id);
        if (chatItem) {
            isNotice = Boolean(chatItem.isNotice);
            isTop = Boolean(chatItem.isTop);
        }
        // console.log('找到数据',chatItem)
        // 这里暂时这么处理，为了解决多个drawer 不能折叠到一块的问题 单独处理
        if (this.props.drawerType == DrawerType.group) {
            return <GroupDraweDetail
                onClose={this.props.onclose}
                isMainShow={this.props.isshow}
                title={title}
                canViewInfo={this.props.canViewInfo}
                getNotice={isNotice}
                isTop={isTop}
                setMsgTop={this.setMsgTop}
                setNotice={this.setNotice}
            />
        }
        return (
            <Drawer
                className="drawer-wraper"
                style={{}}
                title={title}
                placement="right"
                onClose={this.props.onclose}
                visible={this.props.isshow}
                width={320}
                destroyOnClose={true}
            >
                <div className="drawer-wraper">

                    {
                        this.props.isshow
                            ? this.getContent()
                            : null
                    }
                </div>
            </Drawer>
        );
    }
}
