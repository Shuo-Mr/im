import React from 'react';
import { withRouter, RouteComponentProps } from "react-router";
// import moment from 'moment';
import Modal from 'antd/es/modal';
import message from 'antd/es/message';
import Spin from 'antd/es/spin';
// import Avatar from 'antd/es/avatar';
import Button from 'antd/es/button';
import imsdk from '../../net/IMSDK';
import mainStore from '../../store/MainStore';
import systemStore from '../../store/SystemStore';
import friendStore from '../../store/FriendStore';
import './UserInfoModal.less';
import { tr } from '../../i18n/tr';
import chatstore from '../../store/ChatStore';
import GroupStore from '../../store/GroupStore';
import { AvatorWithPhoto } from '../../component/avatorWithPhoto/AvatorWithPhoto';
import { GroupMemRole } from '../../interface/IGroup';
import Utils from '../../utils/utils';
import eventBus from '../../utils/eventBus';

interface IUserInfomodalProps extends RouteComponentProps {
    userId: string

}

interface IUserInfomodalState {
    isLoading: boolean,
    name: string,
    remakename: string,
    sex: number,
    creatTime: string,
    position: string,
    account: string,
    // visible?boolean
}


class UserInfomodal extends React.Component<IUserInfomodalProps, IUserInfomodalState>{
    constructor(props: IUserInfomodalProps) {
        super(props);
        this.state = {
            isLoading: true,
            name: '',
            remakename: '',
            sex: 0,
            creatTime: '',
            position: '',
            account:'',
        }
    }

    componentDidMount() {
        this.getUserInfo()
    }
    getUserInfo = async () => {
        const data = await imsdk.getUserInfo(this.props.userId);
        if (data && data.resultCode == 1 && data.data) {
            eventBus.emit('updateUserinfo', data.data)
            const _data = data.data;
            // console.log(_data.friends.remarkName,'个人信息')
            this.setState({
                account: _data.account,
                name: _data.nickname ? _data.nickname + '' : tr(164),
                remakename: _data.friends && _data.friends.remarkName ? _data.friends.remarkName + '' : '',
                sex: _data.sex ? _data.sex : 0,
                creatTime: _data.birthday ? _data.birthday : '',
                position: _data.phoneToLocation ? _data.phoneToLocation : tr(165)
            })
        } else {
            message.warn(tr(166))
        }
        this.setState(state => ({
            isLoading: false
        }))
    }
    goMessage = () => {

        const fridItem = friendStore.getFriendById(this.props.userId);
        if (fridItem) {
            chatstore.changeCurrentChat(fridItem);
            this.props.history.push(`/main/chart/${fridItem.toUserId}`)
            mainStore.cancelShowInfoModal();
        }
        else {
            this.setState({
                isLoading: false
            })
        }

        //   this.setState(state => ({
        //     isLoading: false
        // }))
    }
    isMyFriend = (id: string) => {
        const frIndex = friendStore.friendList.findIndex(item => item.toUserId == Number(id));
        return frIndex > -1
    }
    addFriend = () => {
        //  message.info(tr(168))
        mainStore.applyAddfriendByid(this.props.userId, this.state.name);

        mainStore.cancelShowInfoModal();
    }
    render() {
        const isMain = systemStore.userId == this.props.userId;
        // const { name, sex, creatTime, position } = this.state;
        const { name, sex, remakename,account } = this.state;
        console.log( this.state ); // 查用户的信息接口  
        
        let isFriend = false;
        const allowChat = Boolean(chatstore.groupControlState.get('allowFriends'));
        const currentRole = chatstore.currentChatData.role ? (chatstore.currentChatData.role == GroupMemRole.owner || chatstore.currentChatData.role == GroupMemRole.manage) : false;
        if (!isMain) {
            isFriend = this.isMyFriend(this.props.userId);
        }
        // console.log('isMain', isMain, "allowChat", allowChat, "currentRole", currentRole, 'isFriend', isFriend, chatstore.currentChatData)
        let footBut = [
            <Button key="close" onClick={mainStore.cancelShowInfoModal}>
                {tr(169)}
            </Button>
        ];
        if (!isMain) {
            //判断私聊还是群聊
            if (Utils.isGroup(chatstore.currentChatData.gid)) {
                const members = GroupStore.groupMemberList.get(chatstore.currentChatData.id)
                if (allowChat || currentRole) {
                    if (isFriend) {

                        footBut.push((
                            <Button key="sendMes" type="primary" onClick={this.goMessage}>
                                {tr(170)}
                            </Button>
                        ))
                    } else {
                        footBut.push((
                            <Button key="adFriend" type="primary" onClick={this.addFriend}>
                                {tr(171)}
                            </Button>
                        ))
                    }
                }
                // 如果点击的是群管理，则可以添加
                else if (members) {
                    const target:any = members.get(this.props.userId)
                    if (target && (target.role == 1 || target.role == 2)) { // 如果是群主或管理员
                        if (!isFriend) { // 不是好友
                            footBut.push((
                                <Button key="adFriend" type="primary" onClick={this.addFriend}>
                                    {tr(171)}
                                </Button>
                            ))
                        } else {
                            footBut.push((
                                <Button key="sendMes" type="primary" onClick={this.goMessage}>
                                    {tr(170)}
                                </Button>
                            ))
                        }
                    }
                }
            } else {
                if (isFriend) {

                    footBut.push((
                        <Button key="sendMes" type="primary" onClick={this.goMessage}>
                            {tr(170)}
                        </Button>
                    ))
                } else {
                    footBut.push((
                        <Button key="adFriend" type="primary" onClick={this.addFriend}>
                            {tr(171)}
                        </Button>
                    ))

                }
            }



        }
        return (
            <Modal
                centered
                title={isMain ? tr(172) : tr(173)}
                visible={true}
                width={340}
                okText={tr(174)}
                cancelText={tr(175)}
                onOk={this.goMessage}
                onCancel={mainStore.cancelShowInfoModal}
                footer={footBut}
            >
                <div className="addfriend-box"  >
                    {
                        this.state.isLoading
                            ? <Spin />
                            : (
                                <>
                                    <div className="list-wrap">
                                        <div className="head">
                                            {/* <Avatar className="avator" size={56} icon="user" src={imsdk.getAvatarUrl(Number(this.props.userId), false)} /> */}
                                            <AvatorWithPhoto id={this.props.userId} type={0} size={56} forceUpdate={true} />
                                        </div>
                                        <div className="list-item">
                                            <span className="title">{tr(176)}</span>
                                            <span>{name}</span>
                                        </div>
                                        {
                                            remakename ? <div className="list-item">
                                                <span className="title">备注:</span>
                                                <span>{remakename}</span>
                                            </div> : null
                                        }
                                        <div className="list-item">
                                            <span className="title">{tr(177)}</span>
                                            <span>{sex == 1 ? '男' : '女'}</span>
                                        </div>
                                        <div className="list-item">
                                            <span className="title">用户名:</span>
                                            <span>{account}</span>
                                        </div>
                                         


                                        {/* <div className="list-item">
                                            <span className = "title">{tr(178)}</span>
                                            <span>{Number(creatTime)?moment(Number(creatTime)* 1000).format('YYYY-MM-DD HH:mm'):tr(179)}</span>
                                        </div>
                                        <div className="list-item">
                                            <span className = "title">{tr(180)}</span>
                                            <span>{position}</span>
                                        </div> */}
                                    </div>
                                </>
                            )
                    }
                </div>
            </Modal>
        )
    }
}
export default withRouter(UserInfomodal)