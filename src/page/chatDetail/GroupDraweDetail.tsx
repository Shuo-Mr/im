import * as React from 'react';
import { ChatStore } from '../../store/ChatStore';
import { inject, observer } from 'mobx-react';
import Icon from 'antd/es/icon';
import Spin from 'antd/es/spin';
import message from 'antd/es/message';
import Input from 'antd/es/input';
import Button from 'antd/es/button';
import Drawer from 'antd/es/drawer'
import { InputModalView } from '../../component/InputModal/InputModalView';
import { ConfirmCommon } from '../../component/confirmModal/ConfirmModal';
import { GroupStore } from '../../store/GroupStore';
import { GroupMemRole, GroupMemItem } from '../../interface/IGroup';
import { AvatorWithPhoto } from '../../component/avatorWithPhoto/AvatorWithPhoto';
import { ChatGrOrFrType } from '../../interface/IChat';
import { IconImgEdit } from '../../component/iconImage/IconImageEdit';
import { GroupManage } from './GroupManage';
import { FriendItem } from '../../interface/IFriend';
import { FriendStore } from '../../store/FriendStore';
import { SystemStore } from '../../store/SystemStore';
import { MemberSelect } from './memberSelect';
import { ManageList } from './GroupManageList';
import { ChangeEvent } from 'react';
import { GroupMemViewItem } from './GroupMemItem';
import { GroupInfoDrawer } from './GroupInfoDraw';
import { tr } from '../../i18n/tr';
// import { DrawerGroupQrcode } from './DrawerGroupQrcode';

import webIM from '../../net/WebIM';
import { DrawerGroupQrcode } from './DrawerGroupQrcode';
import { MainStore } from '../../store/MainStore';
import Switch from 'antd/es/switch';
import { ShowMembers } from './ShowMembers';
import groupStore from '../../store/GroupStore';
import { ChatListDraw } from './ChatListDraw';



export interface IGroupDraweDetailProps {
    onClose: () => void,
    isMainShow: boolean,
    title: string,
    canViewInfo: boolean,
    isTop: boolean,
    getNotice: boolean,

    setMsgTop: (isTrue: boolean) => void,
    setNotice: (isTrue: boolean) => void,

    //    showQrcode: boolean
}

export interface IGroupDraweDetailState {
    isEdit: boolean,
    showNumber: number,
    showGroupMems: boolean,
    showGroupManage: boolean,
    manageListShow: boolean,
    showSelect: boolean,
    isChangeLoading: boolean,
    selectedList: FriendItem[],
    memeberList: any[],
    manageList: GroupMemItem[],
    memeberSearchShow: boolean,
    filterT: string,
    showChangeGrName: boolean,
    showGroupInfo: boolean,
    showGroupInviteApply: boolean,
    showQrcode: boolean,
    canViewInfo: boolean,
    showChatHistory: boolean

}
interface IGroupDraweDetaiWithStore extends IGroupDraweDetailProps {
    chatStore: ChatStore,
    groupStore: GroupStore,
    friendStore: FriendStore,
    systemStore: SystemStore,
    mainStore: MainStore,

}
@inject('chatStore', 'groupStore', 'friendStore', 'systemStore', 'mainStore')
@observer
export default class GroupDraweDetail extends React.Component<IGroupDraweDetailProps, IGroupDraweDetailState> {
    constructor(props: IGroupDraweDetailProps) {
        super(props);

        this.state = {
            isEdit: false,
            showNumber: this.defaultShowNum,
            showGroupMems: false,
            showGroupManage: false,
            manageListShow: false,
            showSelect: false,
            isChangeLoading: false,
            selectedList: [],
            memeberList: [],
            manageList: [],
            memeberSearchShow: false,
            filterT: '',
            showChangeGrName: false,
            showGroupInfo: false,
            showQrcode: false,
            showGroupInviteApply: false,
            canViewInfo: props.canViewInfo,
            showChatHistory: false
        }
    }
    addSelectList = (selectItem: FriendItem) => {

        let list = this.state.selectedList.filter(item => item[this.modalData.config.id] == selectItem[this.modalData.config.id]);
        if (this.modalData.needSelectNum == 1) {
            if (this.state.selectedList[0] && selectItem[this.modalData.config.id] == this.state.selectedList[0][this.modalData.config.id])
                this.setState({
                    selectedList: []
                })
            else
                this.setState({
                    selectedList: [selectItem]
                })
        } else if (list && list.length > 0) {
            this.setState({
                selectedList: this.state.selectedList.filter(item => item[this.modalData.config.id] != selectItem[this.modalData.config.id])
            })
        } else {
            if (this.modalData.needSelectNum <= this.state.selectedList.length) {
                message.warn('最多选择' + this.modalData.needSelectNum + '个');
                return;
            }
            this.setState({
                selectedList: [...this.state.selectedList, selectItem]
            })
        }
    }
    removeFriendList = (selectItem: FriendItem) => {
        this.setState({
            selectedList: this.state.selectedList.filter(item => item[this.modalData.config.id] != selectItem[this.modalData.config.id])
        })
    }
    modalData: any = {
        needSelectNum: 1,
        selectModalTitle: '',
        notSelectList: [],
        handleOk: () => { },
        selectItem: this.addSelectList,
        removeItem: this.removeFriendList,
        config: {
            name: '',
            id: ''
        }
    }
    get injected() {
        return this.props as IGroupDraweDetaiWithStore
    }
    exitGroupConfirm = () => {
        ConfirmCommon(tr(100), () => this.injected.chatStore.exitGroup());
    }
    editNickName = (isEdit: boolean) => {
        this.setState({
            isEdit
        })
    }
    changeNickName = (nickName: string) => {
        this.setState({
            isEdit: false
        })
        this.injected.chatStore.groupChangeNick(nickName)
    }
    getRoleClass = (role: GroupMemRole) => {
        if (GroupMemRole.owner == role) {
            return 'owner'
        }
        if (GroupMemRole.manage == role) {
            return 'manage'
        }
        return ''
    }
    showUserInfo = (userId: string) => {
        userId && this.injected.mainStore.showInfoModal(userId)
    }
    groupMemesSort =(a:GroupMemItem, b:GroupMemItem) => {
        if (a.role == GroupMemRole.owner) {
            return -1
        }
        if (b.role == GroupMemRole.owner) {
            return 1
        }
        if (a.role == GroupMemRole.manage) {
            return -1
        }
        if (b.role == GroupMemRole.manage) {
            return 1
        }
        return a.nickname < b.nickname ? -1 : 1
    }
    removeMemFun = async (userId:string) => {
        const res = await groupStore.removeMem(userId)
        if (res) {
            this.setState({

			})
            message.success('操作成功');
        } else {
            message.warn('操作失败');
        }
    }

    getMembers = (list: GroupMemItem[], groupId: string) => {
        let domGroup: JSX.Element[] = [];
        if (list) {
            let filterText = this.state.filterT;
            list.forEach((item, index) => {
                const classNameEdit = this.getRoleClass(item.role);
                if (this.state.showNumber < 1 || list.length < this.state.showNumber || domGroup.length < this.state.showNumber) {
                    if (filterText.trim() && item.nickname.indexOf(filterText) < 0) {
                        return
                    }
                    let nameMember = item.nickname;
                    if (item.userId == this.injected.systemStore.userId
                        && this.injected.chatStore.currentChatData.nickname
                    ) {
                        nameMember = this.injected.chatStore.currentChatData.nickname
                    }
                    const myFriend = this.injected.friendStore.friendMap.get(Number(item.userId))
                    if (myFriend && myFriend.remarkName) {
                        nameMember = myFriend.remarkName;
                    }
                    const role = this.injected.chatStore.currentChatData.role;
                    domGroup.push(
                        <GroupMemViewItem
                            showUserInfo={this.showUserInfo}
                            key={item.userId + index}
                            userId={item.userId}
                            nameMember={nameMember}
                            classMy={`member-box ${classNameEdit}`}
                            roleMy={role ? role : GroupMemRole.member}
                            memRole={item.role}
                            talkTime={item.talkTime}
                            canViewInfo={this.props.canViewInfo}
                            removeitem={()=>this.removeMemFun(item.userId)}
                        />
                    )
                }
            })
            if (domGroup.length < 1) {
                return <span className="no-data-wraper">{tr(101)}</span>
            }
            return domGroup
        } else {
            return <Spin spinning />
        }
    }
    defaultShowNum = 10;
    switchShowGrMem = () => {
        this.setState(state => (
            {
                showNumber: state.showNumber > 0 ? 0 : this.defaultShowNum
            }
        ))
    }
    onCloseInner = () => {
        this.setState({
            showGroupManage: false,
            manageListShow: false,
            showGroupInfo: false,
            showQrcode: false,
            showGroupMems: false,
            showChatHistory: false
        })
        this.props.onClose();
    }
    drawerWidth = 320;
    SwitchDetail = () => {
        this.setState({
            showGroupManage: false
        })
    }
    goMoreDetail = () => {
        this.setState({
            manageListShow: !this.state.manageListShow
        })
    }
    changeOwner = () => {
        const groupMembersMap = this.injected.groupStore.groupMemberList.get(this.injected.chatStore.currentChat.id);
        let groupMembersArray: GroupMemItem[] = [];
        if (groupMembersMap) {
            groupMembersArray = Array.from(groupMembersMap.values());
        }
        this.modalData = {
            needSelectNum: 1,
            selectModalTitle: tr(102),
            notSelectList: [this.injected.systemStore.userId],
            handleOk: this.changeOwnerSubMit,
            selectItem: this.addSelectList,
            removeItem: this.removeFriendList,
            config: {
                id: 'userId',
                name: 'nickname'
            }
        }
        this.setState({
            showSelect: true,
            isChangeLoading: false,
            selectedList: [],
            memeberList: groupMembersArray
        })
    }
    changeOwnerSubMit = async () => {
        if (!this.state.selectedList || this.state.selectedList.length < 1) {
            message.warn(tr(103));
            return;
        }
        this.setState({
            isChangeLoading: true
        })
        const res = await this.injected.groupStore.changeOwner(this.state.selectedList[0].userId + '')
        if (res) {
            message.success(tr(104));
            this.setState({
                showSelect: false,
                isChangeLoading: false,
                showGroupManage: false
            })
        } else {
            message.warn(tr(105));
            this.setState({
                isChangeLoading: false
            })
        }
    }
    sumitDataCommon = async (params: any, submitFunc: Function, showMessage?: boolean, textInfo?: string) => {
        const result = await submitFunc(params);
        if (result && result.code == 1) {
            this.setState({
                showSelect: false
            })
            message.success(tr(106));
            return result.data
        } else {
            showMessage && message.error(textInfo ? textInfo : tr(107));
            return
        }
    }
    // 更新群状态 统一请求
    setWithServerCommon = async (type: string, msg?: string) => {
        const res = await this.injected.chatStore.changeGroupStatusWithServer(type);
        if (res) {
            message.success(tr(108))
        } else {
            message.warn(tr(109))
        }
    }
    setMsgGroupBanned = async () => {
        this.setWithServerCommon('msgTalkTime');
    }
    setAgreeFriends = () => {

        this.setWithServerCommon('allowFriends');
    }
    setInvitNeedAgree = () => {
        this.setWithServerCommon('groupInvitNeedTest');
    }
    modalCancel = () => {
        this.setState(state => (
            {
                showSelect: false
            }
        ))
    }
    showManagePage = () => {
        this.setState(state => ({
            showGroupManage: true,
            manageListShow: false
        }))
    }
    showGroupMems = () => {
        this.setState(state => ({
            showGroupMems: true,
            manageListShow: false
        }))
    }
    SwitchGroupMems = () => {
        this.setState(state => ({
            showGroupMems: false,
        }))
    }
    // todo 管理员列表
    getManageList = () => {
        const groupMem = this.injected.groupStore.groupMemberList.get(this.injected.chatStore.currentChat.id);
        if (groupMem) {
            return Array.from(groupMem.values()).filter(item => item.role == GroupMemRole.manage)
        } else {
            return []
        }
    }
    getGroupMemList = () => {
        const groupMembersMap = this.injected.groupStore.groupMemberList.get(this.injected.chatStore.currentChat.id);
        let groupMembersArray: GroupMemItem[] = [];
        if (groupMembersMap) {
            groupMembersArray = Array.from(groupMembersMap.values());
        }
        return groupMembersArray
    }
    manageListSubmit: any;
    addMenageModal = () => {
        let manageList = this.getManageList();
        const groupMembersMap = this.getGroupMemList();
        this.manageListSubmit = null;
        this.modalData = {
            needSelectNum: 99999,
            selectModalTitle: tr(110),
            notSelectList: [...manageList.map(item => item.userId), this.injected.systemStore.userId + ''],
            handleOk: this.manageSubmit,
            selectItem: this.addSelectList,
            removeItem: this.removeFriendList,
            config: {
                id: 'userId',
                name: 'nickname',
            }
        }
        this.setState({
            showSelect: true,
            isChangeLoading: false,
            memeberList: groupMembersMap,
            selectedList: []
        })
    }
    switchShowApplyInvite = () => {
        this.setState({
            showGroupInviteApply: !this.state.showGroupInviteApply
        })
    }
    friendArray: string[] = [];
    inviteFriend = () => {
        let isNeedApply = false;
        if (this.injected.chatStore.currentChatData.role != GroupMemRole.owner
            && this.injected.chatStore.currentChatData.groupInvitNeedTest
        ) {
            isNeedApply = true
        }
        const chatData = this.injected.chatStore.currentChat;
        const groupMemData = this.injected.groupStore.groupMemberList.get(chatData.id);
        console.log('?????????????', this.injected.chatStore.maxUserSize)
        const maxUserSize:number = this.injected.chatStore.maxUserSize
        const groupUserSize:number = this.injected.chatStore.groupUserSize
        // if (!this.friendArray || this.friendArray.length < 1) {
        if (this.friendArray) {
            if (groupMemData) {
                this.friendArray = Array.from(groupMemData.keys()).map(item => item);
                console.log('IdArray', this.friendArray, groupMemData.keys(), this.injected.friendStore.friendList);
            }
        }
        this.modalData = {
            needSelectNum: maxUserSize - groupUserSize,
            selectModalTitle: tr(111),
            notSelectList: this.friendArray,
            handleOk: isNeedApply ? this.switchShowApplyInvite : this.inviteFriendSubmit,
            selectItem: this.addSelectList,
            removeItem: this.removeFriendList,
            config: {
                id: 'toUserId',
                name: 'toNickname',
            }
        }
        this.setState({
            showSelect: true,
            isChangeLoading: false,
            selectedList: [],
            memeberList: this.injected.friendStore.friendList
        })
    }
    applyInviteFriend = () => {

    }
    switchMyQrcode = () => {
        this.setState(state => ({
            showQrcode: !state.showQrcode
        }))
    }


    inviteFriendSubmit = async (reasons?: string) => {
        this.setState({
            isChangeLoading: true
        });
        if (reasons && typeof reasons == 'string') {
            let InviteUserArray: any = {
                userIds: [],
                userNames: [],
                isInvite: 0,
                reason: reasons,
                roomJid: this.injected.chatStore.currentChatData.id,
            },
                selectedList = this.state.selectedList;
            let UserIdArray: number[] = [];
            let userNamesArray: string[] = [];
            if (selectedList && Array.isArray(selectedList)) {
                selectedList.forEach(item => {
                    UserIdArray.push(item.toUserId);
                    userNamesArray.push(item.toNickname);
                })
            }
            InviteUserArray.userIds = UserIdArray.toString();
            InviteUserArray.userNames = userNamesArray.toString();
            const currentChat = this.injected.chatStore.currentChatData;
            let memList = this.injected.groupStore.groupMemberList.get(currentChat.id);
            if (memList) {
                let ownerData: any;
                memList.forEach(item => {
                    if (item.role == GroupMemRole.owner) {
                        ownerData = item
                    }
                })
                if (ownerData) {
                    let msg = webIM.createMessage(916, "", ownerData.userId, ownerData.nickname);
                    msg.objectId = JSON.stringify(InviteUserArray);
                    msg.roomJid = currentChat.id;

                    webIM.sendMessage(msg, ownerData.userId);
                    //本地消息
                    webIM.handlerMessageByType(msg);
                    // let localMsg=webIM.createMessage(10,"群聊消息已发送，请等待群主验证");
                    // webIM.handlerGroupGontrolMessage(msg);
                    this.setState({
                        isChangeLoading: false,
                        showSelect: false,
                        showGroupInviteApply: false
                    });
                } else {
                    message.warn(tr(112))
                }
            } else {
                message.warn(tr(113))
            }
            this.setState({
                isChangeLoading: false
            });
            return;
        }
        const res = await this.injected.groupStore.inviteFriendWithGroup(this.state.selectedList);

        if (res) {
            message.success(tr(114));
            this.setState({
                isChangeLoading: false,
                showSelect: false,
                showGroupInviteApply: false
            });
        } else {
            // message.warn(tr(115));


            this.setState({
                showGroupInviteApply: true,
                //showInputModal:true,
                isChangeLoading: false
            });
        }


    }

    manageSubmit = async () => {
        this.setState({
            isChangeLoading: true
        })
        const allChange = [];
        for (let i = 0; i < this.state.selectedList.length; i++) {
            allChange.push(new Promise(async (resolve) => {
                const res = await this.injected.groupStore.changeManage(this.state.selectedList[i].userId + '', true);
                resolve(res)
            }));
        }
        const [...result] = await Promise.all(allChange);
        const res = result.findIndex(item => !Boolean(item));
        if (res < 0) {
            this.setState({
                isChangeLoading: false,
                showSelect: false
            })
            message.success(tr(116));
        } else {
            this.setState({
                isChangeLoading: false,
            })
            message.warn(tr(117));
        }
        // console.log('list', this.state.selectedList)
    }
    removeItem = async (removeItem: any) => {
        let manageList = this.state.manageList,
            newManageList = manageList.filter(item => item.userId != removeItem.userId);
        this.setState({
            manageList: newManageList
        })
        this.manageListSubmit = newManageList;
        let isOk = await this.injected.groupStore.changeManage(removeItem.userId, false)
        if (!isOk) {
            message.warn(tr(118));
            this.setState({
                manageList: manageList
            })
        } else {
            message.success(tr(119));
        }
    }
    openHistory = () => {
		this.setState({
			showChatHistory: true
		})
	}
    SwitchMoreDetail = () => {
        this.setState(state => ({
            manageListShow: !this.state.manageListShow
        }))
        console.log('current state', this.state)
    }
    changeFilterText = (e: ChangeEvent<HTMLInputElement>) => {
        this.setState({
            filterT: e.target.value
        })
    }
    switchMemSearch = () => {
        if (!this.state.memeberSearchShow) {
            this.searchDom && this.searchDom.focus();
        }
        this.setState(state => ({
            filterT: state.memeberSearchShow ? state.filterT : '',
            memeberSearchShow: !state.memeberSearchShow
        }))
    }
    searchDom: Input | null;
    switchChangeGrName = () => {
        this.setState(state => ({
            showChangeGrName: !state.showChangeGrName,
            isChangeLoading: false
        }))
    }
    changeGrName = async (name: string) => {
        if (!name.trim()) {
            message.warn(tr(120));
            return;
        }
        this.setState({
            isChangeLoading: true
        })
        const isOk = await this.injected.chatStore.changeGrName(name);
        if (isOk) {
            message.success(tr(121));
            this.switchChangeGrName();
        } else {
            this.setState({
                isChangeLoading: false
            })
            message.warn(tr(122));
        }
    }
    switchInfo = () => {
        this.setState({
            showGroupInfo: !this.state.showGroupInfo
        })
    }

    drawerGroupQrcode = () => {
        this.setState({
            showQrcode: !this.state.showQrcode,
        })
    }

    grouptwotimensional = () => {
        this.setState({
            showGroupInfo: !this.state.showGroupInfo
        })
    }
    groupproof = () => {
        this.setState({
            showGroupInfo: !this.state.showGroupInfo
        })
    }
    changeInfo = (info: string) => {
        this.injected.chatStore.changeInfo(info);
    }
    componentDidUpdate(preProps: IGroupDraweDetailProps) {
        if (preProps.isMainShow != this.props.isMainShow) {
            this.setState({
                showNumber: this.defaultShowNum
            })
        }
    }
    _setMsgTop = (checked: boolean) => {
        const { setMsgTop } = this.props;
        setMsgTop(checked)
    }
    _setNotice = (checked: boolean) => {
        const { setNotice } = this.props;
        setNotice(checked)
    }
    public render() {
        const { chatStore,groupStore } = this.injected;
        const dataChat = chatStore.currentChatData;
        const groupId = dataChat.id;
        const memNum = groupStore.getGroupMemberNum();
        const role = dataChat.role;
        const {
            isTop,
            getNotice,

        } = this.props;
        const {
            selectedList,
            memeberList,
            isChangeLoading,
        } = this.state;
        const memsList = this.injected.groupStore.groupMemberList.get(groupId);
        const _memsList = memsList?Array.from(memsList.values()).sort(this.groupMemesSort):[]
        return (
            <>
                <Drawer
                    className="drawer-wraper"
                    style={{}}
                    title={this.props.title}
                    placement="right"
                    onClose={this.props.onClose}
                    visible={this.props.isMainShow}
                    width={320}
                >
                    <div className="drawer-wraper">
                        <div className="drawer-group-wraper" >
                            <div className="box-parter">
                                <div className="chat-info-wraper">
                                    <AvatorWithPhoto isUpload={role == GroupMemRole.owner} type={ChatGrOrFrType.group} id={dataChat.id} classN="avator" />
                                    <span>
                                        <span className="name-wraper click" onClick={role == GroupMemRole.owner ? this.switchChangeGrName : () => { }}>
                                            <span className="chat-name">
                                                {dataChat.name}
                                            </span>
                                            <Icon type="edit" style={role == GroupMemRole.owner ? {} : { display: 'none' }} />
                                        </span>
                                        <span className="chat-name-sub">
                                            {
                                                chatStore.currentChatData.desc
                                            }
                                        </span>
                                    </span>
                                </div>
                            </div>
                            {
                                this.state.showChangeGrName
                                    ? <InputModalView
                                        title={tr(123)}
                                        isOk={this.changeGrName}
                                        closeModal={this.switchChangeGrName}
                                        label={tr(124)}
                                        value={dataChat.name ? dataChat.name : ''}
                                        isLoading={isChangeLoading}
                                    />
                                    : null
                            }
                            <div className="box-parter">
                                <div className="mem-header">
                                    <span className="title-common">
                                        {tr(125)}  {(dataChat.groupUserSize && dataChat.groupUserSize > 0) ? `${dataChat.groupUserSize} 人` : ''}
                                    </span>
                                    <span>
                                        <span className="mini-but" onClick={this.inviteFriend}>
                                            <Icon type="plus" />
                                        </span>
                                        {/* <span className="mini-but" onClick={this.switchMemSearch}>
                                            <Icon type="search" />
                                        </span> */}
                                    </span>
                                </div>
                                {
                                    this.state.memeberSearchShow
                                        ? (
                                            <div className="search-wraper">
                                                <Input ref={ref => this.searchDom = ref} placeholder={tr(138)} size="small" type="text" value={this.state.filterT} onChange={this.changeFilterText} />
                                                <Button className="button-drawer-noborder" size="small" onClick={this.switchMemSearch}>{tr(139)}</Button>
                                            </div>
                                        )
                                        : null
                                }
                                <div className="member-wraper">
                                    {
                                        this.getMembers(_memsList, groupId)
                                    }
                                    {/* <div onClick={this.switchShowGrMem} className="show-control"> */}
                                    <div onClick={this.showGroupMems} className="show-control">
                                        {this.state.showNumber > 0 && memNum > this.defaultShowNum
                                            ? tr(126)
                                            : (
                                                memNum > this.defaultShowNum ? tr(127) : ''
                                            )
                                        }
                                    </div>
                                </div>
                            </div>
                            <div className="box-parter">
                                <div className="list-item-common click" onClick={this.switchInfo}>
                                    <span className="left">{tr(128)}</span>
                                    <span className="right">
                                        <span className="text-overflow-common  max-normal-width">
                                            {dataChat.desc}
                                        </span>
                                        <IconImgEdit img={require('../../assets/image/right-icon.png')} size={12} marginSize={4} />
                                    </span>
                                </div>
                            </div>
                            {
                                Boolean(this.injected.chatStore.groupControlState.get('allowFriends'))||role == GroupMemRole.owner||role == GroupMemRole.manage? <div className="box-parter">
                                <div className="list-item-common" onClick={this.switchMyQrcode}>
                                    <span className="left" >{tr(129)}</span>
                                    <span className="right">
                                        <Icon type="qrcode" /> <IconImgEdit img={require('../../assets/image/right-icon.png')} size={12} marginSize={4} />
                                    </span>
                                </div>
                            </div>:null
                            }
                            {/* 群内昵称 */}
                            {/* <div className="box-parter">
                                <div className="list-item-common click" onClick={() => this.editNickName(true)}>
                                    <span className="left">{tr(130)}</span>
                                    <span className="right">
                                        <span className="text-overflow-common  max-normal-width">
                                            {dataChat.nickname}
                                        </span>
                                        <Icon type="edit" />
                                    </span>
                                </div>
                            </div> */}
                            {
                                this.state.isEdit
                                    ? <InputModalView
                                        title={tr(131)}
                                        isOk={this.changeNickName}
                                        closeModal={() => this.editNickName(false)}
                                        label={tr(132)}
                                        value={dataChat.nickname ? dataChat.nickname : ''}
                                    />
                                    : null
                            }
                            {
                                role == GroupMemRole.owner || role == GroupMemRole.manage
                                    ? (
                                        <div className="box-parter">
                                            <div className="list-item-common click" onClick={() => this.showManagePage()}>
                                                <span className="left">{tr(133)}</span>
                                                <span className="right">
                                                    <IconImgEdit img={require('../../assets/image/right-icon.png')} size={12} marginSize={4} />
                                                </span>
                                            </div>
                                        </div>
                                    )
                                    : null
                            }
                            {
                                <div className="box-parter">
                                    <div style={{ fontSize: "12px", color: "rgba(150,155,165,1)", lineHeight: "17px", margin: "14px 0px 4px 0px" }}>对话设置</div>
                                    <div className="list-item-common click"  >
                                        <div className="left" style={{ lineHeight: "20px", margin: "10px 0px" }}>
                                            置顶聊天
                                        </div>
                                        <div className="right">
                                            <Switch checked={isTop} onChange={this._setMsgTop} />
                                        </div>
                                    </div>
                                    <div className="list-item-common click"  >
                                        <div className="left" style={{ lineHeight: "20px", margin: "10px 0px" }}>
                                            消息免打扰
                                        </div>
                                        <div className="right">
                                            <Switch checked={getNotice} onChange={this._setNotice} />
                                        </div>
                                    </div>
                                </div>
                            }
                            {this.injected.systemStore.website}
                            <div className="box-parter">
                                <div className="list-item-common click" onClick={this.openHistory}>
                                    <div className="left">查看聊天记录</div>
                                    <div className="right">
                                        <IconImgEdit img={require('../../assets/image/right-icon.png')} size={12} marginSize={4} />
                                    </div>
                                </div>
                            </div>
                            {
                                role == GroupMemRole.owner
                                    ? (
                                        <div className="list-item-common click" onClick={() => ConfirmCommon(tr(140), () => this.injected.chatStore.delGroup(dataChat.gid)

                                        )}>
                                            <a className="del-but">{tr(134)}</a>
                                        </div>
                                    )
                                    : (
                                        <div className="list-item-common click" onClick={this.exitGroupConfirm}>
                                            <a className="del-but">{tr(135)}</a>
                                        </div>
                                    )
                            }
                            
                            {
                                this.state.showSelect
                                    ? (
                                        <MemberSelect
                                            title={this.modalData.selectModalTitle}
                                            handleOk={this.modalData.handleOk}
                                            handleCancel={this.modalCancel}
                                            selectedList={selectedList}
                                            memeberList={memeberList}
                                            notSelectList={this.modalData.notSelectList}
                                            needSelectNum={this.modalData.needSelectNum}
                                            selectItem={this.modalData.selectItem}
                                            removeItem={this.modalData.removeItem}
                                            isLoading={isChangeLoading}
                                            config={this.modalData.config}
                                        />
                                    )
                                    : null
                            }

                        </div>
                    </div>
                </Drawer>
                {
                    this.state.showGroupManage
                        ? <GroupManage
                            onCloseInner={this.onCloseInner}
                            drawerWidth={this.drawerWidth}
                            SwitchDetail={this.SwitchDetail}
                            goDetail={this.goMoreDetail}
                            changeOwner={this.changeOwner}
                            msgBanned={Number(this.injected.chatStore.groupControlState.get('msgTalkTime')) > 0}
                            allowFriends={Boolean(this.injected.chatStore.groupControlState.get('allowFriends'))}
                            groupInvitNeedTest={Boolean(this.injected.chatStore.groupControlState.get('groupInvitNeedTest'))}
                            setMsgGroupBanned={this.setMsgGroupBanned}
                            setAgreeFriends={this.setAgreeFriends}
                            setInvitNeedAgree={this.setInvitNeedAgree}
                            role={role}
                        />
                        : null
                }
                {
                    this.state.manageListShow
                        ? <ManageList
                            manageList={this.getManageList()}
                            addMenageModal={this.addMenageModal}
                            removeItem={this.removeItem}
                            onCloseInner={this.onCloseInner}
                            drawerWidth={this.drawerWidth}
                            SwitchDetail={this.SwitchMoreDetail}
                        />
                        : null
                }
                {
                    this.state.showGroupInfo
                        ? <GroupInfoDrawer
                            changeStore={this.changeInfo}
                            roomId={dataChat.gid}
                            hasAuth={role == GroupMemRole.owner}
                            groupInfo={dataChat.desc ? dataChat.desc : ''}
                            drawerWidth={this.drawerWidth}
                            closeAll={this.onCloseInner}
                            switchInfol={this.switchInfo}
                        /> : null
                }
                {
                    this.state.showQrcode
                        ? <DrawerGroupQrcode
                            drawerWidth={this.drawerWidth}
                            closeAll={this.onCloseInner}
                            switchInfol={this.drawerGroupQrcode}
                            roomId={dataChat.gid}
                            name={dataChat.name}
                            id={dataChat.id}
                        /> : null
                }
                {
                    this.state.showGroupInviteApply
                        ? <InputModalView title={tr(136)} label={tr(137)} value='' closeModal={this.switchShowApplyInvite} isOk={this.inviteFriendSubmit} isLoading={this.state.isChangeLoading} />
                        : null
                }
                {
                    this.state.showGroupMems
                        ? <ShowMembers
                            onCloseInner={this.onCloseInner}
                            drawerWidth={this.drawerWidth}
                            SwitchDetail={this.SwitchGroupMems}
                            memsList={_memsList}
                            filterT={this.state.filterT}
                            canViewInfo={this.props.canViewInfo}
                            showUserInfo={this.showUserInfo}
                            role={chatStore.currentChatData.role ? chatStore.currentChatData.role : 0}
                        /> : null

                }
                {
                    this.state.showChatHistory
                        ? <ChatListDraw
							isGroup={true}
                            closeAll={this.onCloseInner}
                        /> : null
                }

            </>
        )
    }
}
