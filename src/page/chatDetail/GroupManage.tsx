import * as React from 'react';
import Drawer from 'antd/es/drawer';
import Icon from 'antd/es/icon';
import Switch from 'antd/es/switch'
import { GroupMemRole } from '../../interface/IGroup';
import { IconImgEdit } from '../../component/iconImage/IconImageEdit';
import { tr } from '../../i18n/tr';
import './GroupManage.less';


interface IGroupManageProps {
    onCloseInner: () => void,
    SwitchDetail: () => void,
    goDetail?: () => void,
    drawerWidth: number,
    changeOwner: () => void,
    msgBanned: boolean,
    allowFriends: boolean,
    groupInvitNeedTest: boolean,
    setMsgGroupBanned: (isTrue: boolean) => void,
    setAgreeFriends: (isTrue: boolean) => void,
    setInvitNeedAgree: (isTrue: boolean) => void,
    role?: number
}


export class GroupManage extends React.Component<IGroupManageProps, any>{
    constructor(props: IGroupManageProps) {
        super(props);
        this.state = {}
    }
    render() {
        const {
            onCloseInner,
            drawerWidth,
            SwitchDetail,
            goDetail,
            changeOwner,
            msgBanned,
            allowFriends,
            role,
            groupInvitNeedTest,
            setMsgGroupBanned,
            setAgreeFriends,
            setInvitNeedAgree,
        } = this.props;
        let header = (
            <div onClick={SwitchDetail} className="group-header">
                {/* <Icon type="left" className="group-icon" style={{ fontSize: '12px', marginRight: '4px', verticalAlign: 'middle', lineHeight: '22px' }} /> */}
                <Icon type="left" className="group-icon" />
                <span>
                    {tr(155)}
                </span>
            </div>
        )
        let isOwner = role == GroupMemRole.owner;
        return (

            <Drawer
                className="drawer-wraper"
                title={header}
                onClose={onCloseInner}
                visible={true}
                width={drawerWidth}
            >
                <div className="drawer-group-wraper" >
                    <div className="box-parter" style={isOwner ?{}:{ display: 'none' }}>
                        
                            <div className="list-item-common click" onClick={goDetail} style={isOwner ? {} : { display: 'none' }}>
                                <span className="title-common">
                                    {tr(156)}
                                </span>
                                <IconImgEdit img={require('../../assets/image/right-icon.png')} size={12} marginSize={4} />
                            </div>
                        
                        <div className="list-item-common click" onClick={changeOwner} style={isOwner ? {} : { display: 'none' }}>
                            <span className="title-common">
                                {tr(157)}
                            </span>
                            <IconImgEdit img={require('../../assets/image/right-icon.png')} size={12} marginSize={4} />
                        </div>
                    </div>
                    <div className="box-parter">
                        <div className="list-item-common">
                            <span className="title-common">
                                {tr(158)}
                            </span>
                            <Switch checked={msgBanned} onChange={() => setMsgGroupBanned(!msgBanned)} />
                        </div>
                        <div className="list-item-common">
                            <span className="title-common">
                                {tr(159)}
                            </span>
                            <Switch checked={groupInvitNeedTest} onChange={() => setInvitNeedAgree(!groupInvitNeedTest)} />
                        </div>
                        <div className="list-item-common">
                            <span className="title-common">
                                {tr(160)}
                            </span>
                            <Switch checked={allowFriends} onChange={() => setAgreeFriends(allowFriends)} />
                        </div>
                    </div>
                </div>
            </Drawer>
        )
    }
}
