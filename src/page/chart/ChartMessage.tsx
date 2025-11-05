import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import { inject, observer, Observer } from 'mobx-react';
import { ChatStore } from '../../store/ChatStore';
import { ChatItem, ChatGrOrFrType } from '../../interface/IChat';
import { MainStore } from '../../store/MainStore';
import { AutoSizer } from 'react-virtualized/dist/es/AutoSizer';
import { List, ListRowProps } from 'react-virtualized/dist/es/List';
import { ChartItem } from '../../component/chatItem/ChatItem';
import { notShowContent } from '../../net/Const';
// import {listForceUpdate} from './../../service/listForceUpdate'
export interface IChartMessageProps extends RouteComponentProps {
}

export interface IChartMessageState {
}
interface IChartMessagePropsWithStore extends IChartMessageProps {
    chatStore: ChatStore,
    mainStore: MainStore
}
@inject('chatStore', 'mainStore')
@observer
export default class ChartMessage extends React.Component<IChartMessageProps, IChartMessageState> {
    constructor(props: IChartMessageProps) {
        super(props);

        this.state = {
        }
    }
    get injected() {
        return this.props as IChartMessagePropsWithStore
    }
    delChart = (chat: ChatItem) => {
        this.injected.chatStore.delChart(chat)
    }
    noReadMsgNumber =(chatId: string) =>{
        const noReadMsg = this.injected.chatStore.unReadMsgs.get(chatId + '');
        if(Array.isArray(noReadMsg) && noReadMsg.length > 0){
            return noReadMsg.length
        }else{
            return 0
        }
    }
    updateFoceList = () => {
        this.listDom && this.listDom.forceUpdateGrid()
    }

    listChatItemClick = (chatId: string) => {
        this.injected.chatStore.changeSelectChat && this.injected.chatStore.changeSelectChat(chatId);
    }
    listDom: List | null 
    _rowRenderer = ({ key, index, style }:ListRowProps) => {
        const listChats = this.injected.chatStore.chats.filter(item => item.lastContent != notShowContent);
		const item = listChats[index];
        // console.log('----未读变化')
		return (
			item?<div key={key} style={style}>
                <span 
                    onClick={()=> this.listChatItemClick(item.id)}
                    className = {this.injected.chatStore.currentChatData.id == item.id?'selected':''}
                >
					<ChartItem
						toTop={this.injected.chatStore.setTop}
                        toNotice={this.injected.chatStore.setNotice}
                        delChart={this.delChart}
						{...item}
                        contentType={item.contentType}
                        role={typeof item.role === 'number' ? item.role : -1}
                        noRead={item.isNotice?0:this.noReadMsgNumber(item.id)}
						isGroup={item.type == ChatGrOrFrType.group}
					/>
				</span>
			</div>:null
		);
    };
    // chatList: ChatItem[];
    public render() {
        const { chatStore } = this.injected;
        const listChats = chatStore.chats.filter(item => item.lastContent != notShowContent);
        return (
            <>
                <AutoSizer>
				{({ width, height }) => (
					<List
                        ref={ref => this.listDom = ref}
						rowHeight={60}
						width={width}
						height={height}
						overscanRowCount={10}
						rowCount={listChats.length}
						rowRenderer = {({ ...props }) => (
                            <Observer key = {props.key}>
                              {() => this._rowRenderer({ ...props })}
                            </Observer>
                          )}
					/>
				)}
			</AutoSizer>
            </>
        );
    }
}