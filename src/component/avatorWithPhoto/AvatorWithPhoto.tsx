import * as React from 'react';
// import 'antd/es/avatar/style/';
import { avatorData } from '../../config/chatUserPhotoData';
// import groupStore from '../../store/GroupStore';
import IMSDK from '../../net/IMSDK';
import { ChatGrOrFrType } from '../../interface/IChat';
import { defalutAvatorData } from '../../config/imojiDataList';
import systemStore from '../../store/SystemStore';
// import eventBus from '../../utils/eventBus'
import { observer, inject } from 'mobx-react';


export interface IAvatorWithPhotoProps {
    id: string,
    type: ChatGrOrFrType,
    size?: number,
    classN?: string,
    forceUpdate?: boolean,
    isUpload?: boolean,
}

export interface IAvatorWithPhotoState {
    img: string,
    isload: boolean,
    id: string,
}

inject('systemStore')
@observer
export class AvatorWithPhoto extends React.Component<IAvatorWithPhotoProps, IAvatorWithPhotoState> {
    constructor(props: IAvatorWithPhotoProps) {
        super(props);
        this.state = {
            isload: false,
            img: '',
            id: this.props.id
        }
    }
    // public imgRef = React.createRef()
    
	imgRef: HTMLDivElement | null;
    public io = new IntersectionObserver((e) => this.iocCallBack(e))
    iocCallBack = (entries: any) => {
        // console.log('初次图片加载了', entries)
        entries.forEach((item: any) => {
            // console.log('初始化后的值', item.target.getAttribute('_src'))
            if (item.isIntersecting && item.target && this.state.img === '') {
                // console.log('重复加载', this.state.img)
                const tagDom = item.target
                this.getAvatorData(false)
                item.target.setAttribute('_src', 1)
                this.io.unobserve(tagDom)
            }
            
        })
    }
    componentDidMount() {
        // this.getAvatorData(false, '', this.props.forceUpdate)
        // console.log('卸载了')
        if (this.imgRef && this.state.img === '') {
            this.io.observe(this.imgRef)
        }
    }
    componentDidUpdate(prevProps: IAvatorWithPhotoProps, preState: IAvatorWithPhotoState) {
        if (prevProps.id != this.props.id) {
            this.getAvatorData(false);
        }
    }
    componentWillUnmount() {
        this.setImageHeader = () => { }
            if (this.imgRef) {
                this.io.unobserve(this.imgRef)
            }
    }
    setImageHeader = (imgUrl: string) => {
        this.setState({
            img: imgUrl
        })
    }
    isGroup = this.props.type == ChatGrOrFrType.group;
    getAvatorData = (isload: boolean, id?: string, forceUpdate?: boolean, forceUpdateStr?: string) => {

        this.setState({
            isload: false,
            img: '',
        })
        const imgRandomNu = '?r=' + Math.round(Math.random() * 100000)
        const _id = id ? id : this.props.id;
        const imgdata = avatorData.getAvatorData(_id);
        if (imgdata && !forceUpdate) {
            this.setImageHeader(imgdata)
            return
        }
        if (this.props.type == ChatGrOrFrType.group) {
            const img = IMSDK.getAvatarUrlGroup(_id)
            this.setImageHeader(img)
            avatorData.setAvator(_id, img)
        } else {
            if (_id != '10000' && _id != "10001" && _id != '10005' && !isload) {
                let img = IMSDK.getAvatarUrl(Number(_id), false);
                this.setImageHeader(img + imgRandomNu + (forceUpdateStr || ''))
                avatorData.setAvator(_id, img + imgRandomNu + (forceUpdateStr || ''))
            }
        }
    }
    getImageNum = (id: string) => {
        const idStr = parseInt((id + '').replace(/[^\d]/g, ''));
        if (idStr === NaN) {
            return 0
        } else {
            return idStr % 16
        }
    }

    imgStyle = {
        height: this.props.size ? `${this.props.size}px` : '32px',
        width: this.props.size ? `${this.props.size}px` : '32px',
        // borderRadius:this.props.size?`${this.props.size/2}px`: '26px',
        // border:" 1px solid black",
        borderRadius: 3,
        WebkitUserDrag: "none"
    }
    imgLoad = () => {
        this.setState({
            isload: true
        })
    }
    uploadAvatar = async (e: any) => {
        const id = this.isGroup ? this.props.id : systemStore.userId
        if (this.isGroup) {
            IMSDK.uploadAvataGroup(id, e.target.files[0],
                (evt: any) => {
                    // try {
                    const res = JSON.parse(evt.currentTarget.response)
                    const tUrl = res.data.tUrl
                    this.setImageHeader(tUrl)
                    avatorData.setAvator(systemStore.userId, tUrl)
                    // 重置input的值
                    this.refs.avatarupload['value'] = ''
                    // 发送广播
                    const imgRandomNu = '' + Math.round(Math.random() * 100000)
                    systemStore.changeAvatarUpdateId(imgRandomNu)
                    // eventBus.emit('avatarUpdatedGroup', {
                    //     id: id,
                    //     tUrl: tUrl
                    // })
                    // setTimeout(() => {
                    //     this.getAvatorData(false, '', true)
                    // }, 200)
                    // } catch {
                    //     console.log('--解析头像地址失败')
                    // }
                },
                (err: any) => {
                    console.log('---上传失败', err)
                }
            )
        } else {
            IMSDK.uploadAvata(id, e.target.files[0],
                (evt: any) => {
                    // try {
                    const res = JSON.parse(evt.currentTarget.response)
                    const tUrl = res.data.tUrl
                    this.setImageHeader(tUrl)
                    avatorData.setAvator(systemStore.userId, tUrl)
                    // 发送广播
                    // eventBus.emit('avatarUpdated', tUrl)
                    // 重置input的值
                    this.refs.avatarupload['value'] = ''
                    // 发送广播
                    const imgRandomNu = '' + Math.round(Math.random() * 100000)
                    systemStore.changeAvatarUpdateId(imgRandomNu)
                    // setTimeout(() => {
                    //     this.getAvatorData(false, '', true)
                    // }, 200)
                    // } catch {
                    //     console.log('--解析头像地址失败')
                    // }
                },
                (err: any) => {
                    console.log('---上传失败', err)
                }
            )
        }

    }
    public render() {
        let { img } = this.state;
        const { classN } = this.props;
        let isService = this.props.id == '10000' || this.props.id == "10001";
        let defaultImage;
        if (isService) {
            defaultImage = require('../../assets/image/im_notice_square.png');
            // if(img && img.indexOf('/static/media') > -1 ){
            //     img = require('../../assets/image/im_notice_square.png');
            // }
        } else if (this.props.id == '10005') {
            defaultImage = require('../../assets/image/robot.png');
        } else {
            defaultImage = defalutAvatorData["e-" + this.getImageNum(this.props.id)];
        }
        // console.log('头像数据', this.props.id, img, defaultImage, this.state.isload)
        return (
            <>
                <div ref={ (ref) => (this.imgRef = ref) } style={{ position: 'relative'}}>
                    {
                        this.state.isload && img
                            ? null
                            : <img
                                style={{ ...this.imgStyle }}
                                src={defaultImage}
                                className={classN}
                            />
                    }
                    <img
                        style={(this.state.isload && img) ? { ...this.imgStyle } : { display: 'none', ...this.imgStyle }}
                        src={img + `?z=${systemStore.avatarUpdateId}`}
                        className={classN}
                        onLoad={this.imgLoad}
                    />
                    {
                        this.props.isUpload ? <input ref='avatarupload' onChange={this.uploadAvatar} style={{ opacity: '0', position: 'absolute', width: '100%', height: '100%', top: '0', left: '0' }} type="file" accept="image/*" /> : null
                    }
                </div>
            </>
        )
    }
}
