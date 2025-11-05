import React, { useState } from 'react'
import { GroupMemRole } from '../../interface/IGroup';
import { ChatGrOrFrType } from '../../interface/IChat';
import { AvatorWithPhoto } from '../../component/avatorWithPhoto/AvatorWithPhoto';
import Popover  from 'antd/es/popover';
import message from 'antd/es/message';
import { ConfirmCommon } from '../../component/confirmModal/ConfirmModal';
import groupStore from '../../store/GroupStore';

interface GroupMemComItem {
    userId: string,
    nameMember: string,
    classMy: string,
    roleMy: number,
    memRole: number,
    talkTime: number
    canViewInfo: boolean,
    showUserInfo: (id: string) => void
    removeitem:()=>void
}
export const GroupMemViewItem = (props: GroupMemComItem) => {
    const [showMenu, setShow] = useState(false);
    const { roleMy, memRole, classMy, userId, nameMember, talkTime,removeitem } = props;
    let isForbit = false;
    let nameCl = classMy;
    if (talkTime > 0 && memRole != GroupMemRole.owner) {
        isForbit = true
        nameCl = nameCl + ' ' + 'forbit'
    }
    const memDom = (
        <div className={nameCl} key={userId}>
            <span onClick={
                () => props.showUserInfo(userId)
            }>
                <AvatorWithPhoto type={ChatGrOrFrType.friend} id={userId} />
            </span>
            <div className="name text-overflow-common" style={{marginLeft:5}}>
                {nameMember}
            </div>
        </div>
    );
    let MenuDom = [];
    // let removeMemFun = async () => {
    //     // const res = await groupStore.removeMem(userId)
    //     // if (res) {
            
    //     //     message.success('操作成功');
    //     // } else {
    //     //     message.warn('操作失败');
    //     // }
    // }
    const setForbitMem = async () => {

        const res = await groupStore.prohibitedMember(userId);
        if (res) {
            message.success('操作成功');
        } else {
            message.warn('操作失败');
        }
    }
    const forbitMenu = isForbit
        ? <div className="menu-item" key="cancel" onClick={() => { setShow(false); ConfirmCommon('确定允许该群成员发言?', setForbitMem) }}>取消禁言</div>
        : <div key="forbit" className="menu-item" onClick={() => { setShow(false); ConfirmCommon('确定禁止该成员发言?', setForbitMem) }}>禁言</div>,
        removeMem = <div key="remove" className="menu-item" onClick={() => { setShow(false); ConfirmCommon('确定移除该成员?', removeitem) }}>移除群员</div>;
    if (roleMy == GroupMemRole.owner && memRole != GroupMemRole.owner) {
        MenuDom = [];
        MenuDom.push(forbitMenu)
        MenuDom.push(removeMem)
    } else if (roleMy == GroupMemRole.manage) {
        if (memRole == GroupMemRole.manage || memRole == GroupMemRole.owner) {
            return memDom
        } else {
            MenuDom = [];
            MenuDom.push(forbitMenu)
            MenuDom.push(removeMem)
        }
    } else {
        return memDom
    }
    return (
        <Popover placement="topRight" content={MenuDom} trigger="contextMenu" visible={showMenu} onVisibleChange={(isShow: boolean) => setShow(isShow)} key={userId}>
            {memDom}
        </Popover>
    )
} 