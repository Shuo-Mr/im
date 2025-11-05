import * as React from 'react';
import Drawer from 'antd/es/drawer';
import Icon from 'antd/es/icon';
import Button  from 'antd/es/button';
import { GroupMemItem } from '../../interface/IGroup';
import { IconImgEdit } from '../../component/iconImage/IconImageEdit';
import { AvatorWithPhoto } from '../../component/avatorWithPhoto/AvatorWithPhoto';
import { ChatGrOrFrType } from '../../interface/IChat';
import { tr } from '../../i18n/tr';

interface IManageListProps {
    manageList: any[],
    addMenageModal: () => void,
    removeItem: (groupItem: any) => void,
    SwitchDetail: () => void,
    onCloseInner: () => void,
    drawerWidth: number
}
interface IManageListState {
}

export class ManageList extends React.Component<IManageListProps, IManageListState>{
    constructor(props: IManageListProps) {
        super(props);
    }
    removeItem = (manageItem: GroupMemItem) => {
        this.props.removeItem && this.props.removeItem(manageItem)
    }
    render() {
        const {
            manageList,
            addMenageModal,
            SwitchDetail,
            onCloseInner,
            drawerWidth
        } = this.props;
        let header = (
            <div onClick={SwitchDetail} style={{ cursor: 'pointer' }}>
                <Icon type="left" style={{ fontSize: '12px', marginRight: '4px', verticalAlign: 'middle', lineHeight: '22px' }} />
                <span>
                    {tr(161)}
                </span>
            </div>
        )
        return (
            <Drawer
                title={header}
                onClose={onCloseInner}
                visible={true}
                width={drawerWidth}
            >
                <div className="drawer-wraper" style={{ position: 'relative', top: '-20px' }}>
                    <div className="drawer-detail">
                        <div className="list-item click" onClick={addMenageModal} >
                            <span>
                                {tr(162)}
                            </span>
                            <span>
                                <span>
                                    {this.props.manageList.length}
                                </span>
                                <IconImgEdit img={require('../../assets/image/right-icon.png')} size={12} marginSize={4} />
                            </span>
                        </div>
                    </div>
                    {
                        manageList.map((item, index) => {
                            return (
                                <div className="drawer-detail" key={index + item.userId}>
                                    <div className="list-item border" style={{ display: 'flex', alignItems: 'center' }}>
                                        <span>
                                            <AvatorWithPhoto type={ChatGrOrFrType.group} size= {32} id={item.userId} classN="avator" />
                                            <span style={{ marginLeft: '4px' }} >{item.nickname}</span>
                                        </span>
                                        <Button size="small" type="danger" onClick={() => this.removeItem(item)}>
                                            {tr(163)}
                                        </Button>
                                    </div>
                                </div>
                            )
                        })
                    }
                </div>
            </Drawer>
        );
    }
};