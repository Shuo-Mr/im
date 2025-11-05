import * as React from 'react';
import { inject, observer } from 'mobx-react';
import { detailType, MainStore } from '../../../src/store/MainStore';
import { NoneData } from '../../../src/component/noneDataView/NoneDataView';
import ChatDetail from '../chatDetail/ChatDetail';
import SettingDetail from '../settingDetail/SettingDetail';
import { NewFriendDetail } from '../newFriendDetail/NewFriendDetail';
import { ChatStore } from '../../store/ChatStore';
import { CreatGroup } from '../CrtGroup/CreatGroup';
import { W3 } from '../w3/w3';

export interface IRightContentProps {
}
interface WithStore extends IRightContentProps {
    mainStore: MainStore,
    chatStore: ChatStore,
}
export interface IRightContentState {
}
@inject('mainStore', 'chatStore')
@observer
export default class RightContent extends React.Component<IRightContentProps, IRightContentState> {
    get injected() {
        return this.props as WithStore;
    }

    // shouldComponentUpdate(){
    //     return false;
    // }

    render() {
        const { mainStore, chatStore } = this.injected;

           let type = mainStore.detailType;
        if (!chatStore.currentChatData.name && type == detailType.message) {
            // console.log('没有name了',chatStore.currentChatData);

            return <NoneData />
        }

        switch (type) {
            case detailType.message: {
                return <ChatDetail />;
            }
            case detailType.setting: {
                return <SettingDetail />;
            }
            case detailType.newFriend: {
                return <NewFriendDetail />;
            }
            case detailType.CrtGroup: {
                return <CreatGroup />;
            }
            case detailType.w3:{
                return <W3 />;
            }
            default: {
                return <NoneData />
            }
        }
    }
}
