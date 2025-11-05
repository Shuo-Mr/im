import React, { Component } from 'react';
import Drawer from 'antd/es/drawer';
import Icon from 'antd/es/icon';
import Button  from 'antd/es/button';
import message  from 'antd/es/message';
import   './groupInfoDrawer.less';
import imsdk from '../../net/IMSDK';
import { tr } from '../../i18n/tr';

interface Iprops {
    drawerWidth: number,
    closeAll: () => void,
    switchInfol: () => void,
    groupInfo: string,
    hasAuth: boolean,
    roomId: string,
    changeStore: (info: string) => void

}
interface Istate {
    showEditInfo: boolean,
    isLoading: boolean,
    infoContent: string,
    eidtText: string
}


export class GroupInfoDrawer extends Component<Iprops, Istate> {
    constructor(props: Iprops) {
        super(props);
        this.state = {
            showEditInfo: false,
            isLoading: false,
            infoContent: '',
            eidtText: this.props.groupInfo
        }
    }
    switchEditShow = () => {
        this.setState({
            showEditInfo: !this.state.showEditInfo
        })
    }
    changeInfo = async () => {
        this.setState({
            isLoading: true
        });
        // console.log('发布群说明this.state.eidtText',this.state.eidtText)
        const res = await imsdk.changeGroupInfo(this.state.eidtText,this.props.roomId);
        if(res && res.resultCode == 1){
            this.props.changeStore(this.state.eidtText);
            message.success(tr(141));
            this.props.switchInfol();
        }else{
            this.setState({
                isLoading: false
            })
            message.warn(tr(142));
        }
    }
    render() {
        let header = (
            <div onClick={this.props.switchInfol} style={{ cursor: 'pointer' }}>
                <Icon type="left" style={{ fontSize: '12px', marginRight: '4px', verticalAlign: 'middle', lineHeight: '22px' }} />
                <span>
                    {tr(143)}
                </span>
            </div>
        )
        let headerEdit = (
            <div onClick={this.switchEditShow} style={{ cursor: 'pointer' }}>
                <Icon type="left" style={{ fontSize: '12px', marginRight: '4px', verticalAlign: 'middle', lineHeight: '22px' }} />
                <span>
                    {tr(144)}
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
                    <div className="description-wrape">
                        <div className="description-one">
                            <div className="text">
                                <div className="text-sm">
                                    {this.props.groupInfo ? this.props.groupInfo : tr(145)}
                                </div>
                            </div>
                            {
                                this.props.hasAuth
                                    ? (
                                        <div className="description-but">
                                            <Button type="primary" className="description-button" onClick={this.switchEditShow}>{tr(146)}</Button>
                                        </div>
                                    )
                                    : null
                            }
                        </div>
                    </div>
                </Drawer>
                {
                    this.state.showEditInfo
                        ? <Drawer
                            title={headerEdit}
                            onClose={closeAll}
                            visible={true}
                            width={drawerWidth}
                        >
                            <div className="description-wrape">
                                <div className="text-m">
                                    <textarea className="text-bj" value={this.state.eidtText} onChange = {event => this.setState({eidtText: event.target.value})} />
                                </div>
                                <div className="buton">
                                    <Button type="primary" onClick = {this.changeInfo}> {tr(147)}</Button>
                                    <Button onClick = {this.switchEditShow}>{tr(148)}</Button>
                                </div>
                            </div>
                        </Drawer>
                        : null
                }
            </>
        )
    }
}

