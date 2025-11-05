import React, { Component } from 'react';
import Drawer from 'antd/es/drawer';
import Icon from 'antd/es/icon';
import './groupInfoDrawer.less';
import { QrcodeView } from '../../component/qrcodeImage/QrcodeView';
import { observer } from 'mobx-react';
import { AvatorWithPhoto } from '../../component/avatorWithPhoto/AvatorWithPhoto';
import { ChatGrOrFrType } from '../../interface/IChat';
import { tr } from '../../i18n/tr';

interface Iprops {
    drawerWidth: number,
    closeAll: () => void,
    switchInfol: () => void,
    name: string,
    roomId: string,
    id: string

}
interface Istate {
    isLoading: boolean,
    infoContent: string,
}

@observer
export class DrawerGroupQrcode extends Component<Iprops, Istate> {
    constructor(props: Iprops) {
        super(props);
        this.state = {
            isLoading: false,
            infoContent: ''
        }
    }

    submit = () => {
        this.setState({
            isLoading: true
        })
    }
    render() {
        let header = (
            <div onClick={this.props.switchInfol} style={{ cursor: 'pointer' }}>
                <Icon type="left" style={{ fontSize: '12px', marginRight: '4px', verticalAlign: 'middle', lineHeight: '22px' }} />
                <span>
                    {tr(153)}
                </span>
            </div>
        )
        const { closeAll, drawerWidth } = this.props;
        return (
            <>
                <Drawer
                    title={header}
                    onClose={closeAll}
                    visible={true}
                    width={drawerWidth}
                >
                    <div className="QRcode">
                        <AvatorWithPhoto type={ChatGrOrFrType.group} id={this.props.id} classN="avator" />
                        <span style = {{marginLeft:'8px'}}>{this.props.name}</span>
                    </div>
                    <div className="description-wrape">
                        <div className="description-one">
                            <QrcodeView userId={this.props.roomId} isGroup={true} size = {240}/>
                        </div>
                        <span className="QRcode-s">{tr(154)}</span>
                    </div>
                </Drawer>
            </>
        )
    }
}

