import * as React from 'react';
import { RequestStore, RequestItem } from '../../store/RequestStore';
import { inject, observer, Observer } from 'mobx-react';
// import Avatar from 'antd/es/avatar';
import Button from 'antd/es/button';

import { NewFriendStatus } from '../../interface/IGroup';
import "./NewFriend.less"
import Utils from '../../utils/utils';
import webIM from '../../net/WebIM';
import { MessageType } from '../../net/Const';
import { InputSubmitModalNoPopup } from '../../component/inputSubmitModal/InputSubmitModalNoPopup';
import { tr } from '../../i18n/tr';
import { AvatorWithPhoto } from '../../component/avatorWithPhoto/AvatorWithPhoto';
import Divider from 'antd/es/divider';

import { List as VList } from 'react-virtualized/dist/es/List';
import { AutoSizer } from 'react-virtualized/dist/es/AutoSizer';
import Icon from 'antd/es/icon';
import { ChatStore } from '../../store/ChatStore';


export interface INewFriendDetailProps {
}

export interface INewFriendDetailState {
    showReply: boolean
}
interface INewFriendWithStore {
    requestStore: RequestStore,
    chatStore: ChatStore
}

@inject('requestStore', 'chatStore')
@observer
export class NewFriendDetail extends React.Component<INewFriendDetailProps, INewFriendDetailState> {
    constructor(props: INewFriendDetailProps) {
        super(props);

        this.state = {
            showReply: false
        }
    }
    get injected() {
        return this.props as INewFriendWithStore
    }

    replyNewFriendApply = async (request: RequestItem) => {
        this.replySumit = async (value: string): Promise<boolean> => {
            return await this.replyNewFriendApplyServer(request, value);

        }
        this.switchShowModal();
        // this.injected.requestStore.setRequestItenStatus(request.toUserId, NewFriendStatus.reply, request.toNickname)
    }
    replyNewFriendApplyServer = async (request: RequestItem, content: string): Promise<boolean> => {
        // request.content=content;
        const msg = webIM.createMessage(MessageType.FEEDBACK, content, request.toUserId,request.toNickname?request.toNickname:'');
        // console.log(msg,'回复的消息',request)
        webIM.sendMessage(msg, '');
        this.injected.requestStore.refeshContent(request.toUserId, content)
        return Promise.resolve(true);
    }

    editDom = (request: RequestItem) => {
        //  console.log(request,request.direction,'好友请求---------------------------')
        //我发送的
        if (request.direction == 0) {
            if (request.type == 500) {
                return (
                    <span className="status-text">
                        {tr(27)}
                    </span>
                )
            } else if (request.type == 502) {

                if (request.status == NewFriendStatus.agree) {
                    return (
                        <span className="status-text">
                            <span className="status-agree">  {tr(25)}</span>
                        </span>
                    )
                }
                else {
                    return (
                        <span className="status-text">
                            <Button size="small" type="primary" className='primary-button' onClick={() => this.injected.requestStore.setRequestItenStatus(request.toUserId, NewFriendStatus.agree, request.toNickname)}>{tr(29)}</Button>
                            <Button size="small" type="danger" onClick={() => this.replyNewFriendApply(request)}>{tr(30)}</Button>
                        </span>
                    )
                }


            } else if (request.type == 503) {
                return (
                    <span className="status-text">
                        {tr(27)}
                    </span>
                )
            }
            else if (request.type == 504) {
                return (
                    <span className="status-text">
                        {tr(31)}
                    </span>
                )

            } else if (request.type == 505) {
                return (
                    <span className="status-text">
                        {tr(26)}
                    </span>
                )

            } else if (request.type == 507) {
                return (
                    <span className="status-text">
                        {tr(28)}
                    </span>
                )

            }
            else if (request.type == 509) {
                return (
                    <span className="status-text">
                        {tr(32)}
                    </span>
                )

            }
            else {
                return (
                    <span className="status-text">
                        {tr(25)}
                    </span>
                )
            }

        }
        //接受到的
        else {
            if (request.type == 500 || request.type == 508 || request.type == 502) {
                // if(request.type == 502)
                // { this.injected.requestStore.refeshContent(request.toUserId, request.content) }
                return (
                    <span className="but-wraper">
                        <Button size="small" type="primary" onClick={() => this.injected.requestStore.setRequestItenStatus(request.toUserId, NewFriendStatus.agree, request.toNickname)}>{tr(29)}</Button>
                        <Button size="small" type="danger" onClick={() => this.replyNewFriendApply(request)}>{tr(30)}</Button>
                    </span>
                )

            } else if (request.type == 503) {
                return (
                    <span className="status-text">
                        {tr(27)}
                    </span>
                )

            }
            else if (request.type == 504) {
                return (
                    <span className="status-text">
                        {tr(31)}
                    </span>
                )

            } else if (request.type == 505) {
                return (
                    <span className="status-text">
                        {tr(26)}
                    </span>
                )

            }
            else if (request.type == 507) {
                return (
                    <span className="status-text">
                        {tr(28)}
                    </span>
                )

            }
            else if (request.type == 509) {
                return (
                    <span className="status-text">
                        {tr(32)}
                    </span>
                )

            }
            else {
                return (
                    <span className="status-text">
                        {tr(25)}
                    </span>
                )
            }

        }
        //  return (<span></span>)

        // if (request.status == NewFriendStatus.default) {
        //     return (
        //         <span className = "but-wraper">
        //             <Button size="small" type="primary" onClick={() => this.injected.requestStore.setRequestItenStatus(request.toUserId, NewFriendStatus.agree,request.toNickname)}>接受</Button>
        //             <Button size="small" type="danger" onClick={() => this.injected.requestStore.setRequestItenStatus(request.toUserId, NewFriendStatus.refuse,request.toNickname)}>忽略</Button>
        //         </span>
        //     )
        // } else {
        //     return (
        //         <span className = "status-text">
        //             {request.status == NewFriendStatus.agree
        //  //  ? <span className = "status-agree">已同意</span>
        //                 : <span className = "status-refuse">已拒绝</span>
        //             }
        //         </span>
        //     )
        // }
    }
    switchShowModal = () => {
        this.setState(state => ({
            showReply: !state.showReply
        }))
    }
    replySumit = (value: string) => {
        return Promise.resolve(true);
    }
    public render() {

        const { requestStore } = this.injected;
       let requestList=  requestStore.requestList.filter((item) => item.type!=505)
        const listLength =requestList ? requestList.length : 0;
        const renderItem = ({ index, key, style }: any) => {
            const item = requestList[index];
            // if(item&&item.content){item.content= webIM.decryptMessage(item.content);}
            return (
                <div key={key} style={style} className="list-item">
                    <span className="info-item">
                        {/* <Avatar icon="team" src={IMSDK.getAvatarUrl(Number(item.toUserId), false)} /> */}
                        <AvatorWithPhoto type={0} id={item.toUserId.toString()} size={40} classN="myhead" />
                        <span className="name-wraper">
                            <span className="name">
                                {Utils.htmlRestore(item.toNickname)}
                            </span>
                            <span className="sub-name">
                                {item.content}
                            </span>
                        </span>
                    </span>
                    <>
                        {this.editDom(item)}
                    </>
                </div>
            );

        };
        return (
            <div className="new-friend">

                <div className="head">
                    <Icon type="left" className="back-but" onClick={this.injected.chatStore.detailBack} />
                    <span className='head-title'> {tr(24)}</span>
                </div>
                <Divider className='divider' />
                <div className="body-list">
                    <AutoSizer>
                        {({ height, width }) => {
                            return (

                                <VList
                                    //   ref={(ref) => (this.list = ref)}
                                    width={width}
                                    height={height}
                                    overscanRowCount={20}
                                    rowCount={listLength}
                                    rowHeight={64}
                                    rowRenderer={({ ...props }) => (
                                        <Observer key={props.key}>
                                            {() => renderItem({ ...props })}
                                        </Observer>)}
                                />
                            );

                        }}
                    </AutoSizer>
                </div>
                {
                    this.state.showReply
                        ? <InputSubmitModalNoPopup title={tr(34)} labelTitle={tr(30)} value="" sumitFun={this.replySumit} cancel={this.switchShowModal} />
                        : null
                }

            </div>
        );
    }
}