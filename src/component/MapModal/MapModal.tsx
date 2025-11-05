import * as React from 'react';

// import Input from 'antd/es/input';
import Modal from 'antd/es/modal';
// import DatePicker from 'antd/es/date-picker';
import message from "antd/es/message";

import { Map, Marker } from 'react-amap';
import systemStore from '../../store/SystemStore';
import imsdk from './../../net/IMSDK';
import Utils from './../../utils/utils';

// import { Geolocation } from 'react-amap-plugin-geolocation';

export interface IMapModalProps {
    sendPosition: (lat: number, lng: number, _p: number[], positionStr: string, thumbnalUrl: string) => void,
    cancel: () => void
}

export interface IMapModalState {
    address: string,
    position: any[],
    lat: number,
    lng: number,
    positionStr: string,
    thumbnalUrl: string,

}

export class MapModal extends React.Component<IMapModalProps, IMapModalState> {
    constructor(props: IMapModalProps) {
        super(props);

        this.state = {
            address: '',
            position: [],
            lat: -1,
            lng: -1,
            positionStr: '回来吧，地球',
            thumbnalUrl: ''
        }
    }
    sendPosition = () => {
        if (this.state.lng < 0) {
            message.warn('请选择地图标记点');
            return;
        }
        this.props.sendPosition(this.state.lat, this.state.lng, this.state.position, this.state.positionStr, this.state.thumbnalUrl)
    }


    public render() {
        //    const pluginProps = {
        //         enableHighAccuracy: true,
        //         timeout: 10000,
        //         showButton: true
        //     }

        const events = {
            created: (ins: any) => {
                console.log(ins)
            },

            click: async (e: any) => {
                console.log(e, '???????????????????')
                let point = Utils.bd_encrypt(e.lnglat.lng, e.lnglat.lat)
                this.setState({
                    lat: e.lnglat.P as any,
                    lng: e.lnglat.Q as any,
                    position: [point.lng, point.lat]
                })

                let pstr: string = '回来吧，地球'
                let ret: any = await imsdk.getLocalPosition(systemStore.amapServiceKey, this.state.position);

                if (ret && ret.data && ret.data.status == '1' && ret.data.infocode == '10000' && ret.data.regeocode && ret.data.regeocode.formatted_address) {
                    // 地址已经获得
                    pstr = ret.data.regeocode.formatted_address;
                }

                let thumbnalUrl = imsdk.getThumbnailLocal(systemStore.amapServiceKey, this.state.position);

                this.setState({ positionStr: pstr, thumbnalUrl })

            }
        }

        //  const mapPlugins:any = ['Scale'];
        return (


            <Modal
                mask={false}
                centered
                title="定位"
                visible={true}
                width={340}
                okText={'发送定位'}
                cancelText={'取消'}
                onOk={this.sendPosition}
                onCancel={this.props.cancel}
            >
                <div style={{ width: '100%', height: '400px' }}>
                    <Map events={events} amapkey={systemStore.amapKey} protocol={'https://'}
                        mapStyle="mapStyle" loading >
                        {
                            this.state.lat >= 0
                                ? <Marker position={this.state} />
                                : null
                        }

                    </Map>
                </div>
            </Modal>
        );
    }
}
