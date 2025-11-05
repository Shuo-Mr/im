import * as React from 'react';
// import Avatar from 'antd/es/avatar';
import Modal from 'antd/es/modal';
import Icon from 'antd/es/icon';
import message from 'antd/es/message';
import systemStore, { SystemStore } from '../../store/SystemStore';
import { LoginStore } from '../../store/LoginStore';
// import IMSDK from '../../net/IMSDK';
import { inject, observer } from 'mobx-react';
import { SwitchSqual } from '../../component/switchSqual/SwitchSqual';
import './myInfo.less'
import webIM from '../../net/WebIM';
import { IconImgEdit } from '../../component/iconImage/IconImageEdit';
import { InputSubmitModal } from '../../component/inputSubmitModal/InputSubmitModal';
import { QrcodeView } from '../../component/qrcodeImage/QrcodeView';
import moment from 'moment';
import { tr } from '../../i18n/tr';
import deviceManager from '../../net/DeviceManager';
import { AvatorWithPhoto } from '../../component/avatorWithPhoto/AvatorWithPhoto';
// import imsdk from '../../net/IMSDK';
import { WithSettingDetailHead } from '../../component/WithSettingDetailHead/WithSettingDetailHead';
// import ipcRender from '../../ipcRender';
const { confirm } = Modal;
export interface IMyInfoProps {

}

export interface IMyInfoState {
    isFemale: boolean,
    showInputModal: boolean,
    showQrcode: boolean,
    imgurl: string,
    showMenu: boolean
}
interface WithStore extends IMyInfoProps {
    systemStore: SystemStore
    loginstore: LoginStore
}

@inject('systemStore')
@inject('loginStore')
@observer
class MyInfo extends React.Component<IMyInfoProps, IMyInfoState> {
    constructor(props: IMyInfoProps) {
        super(props);

        this.state = {
            isFemale: this.injected.systemStore.sex == '0',
            showInputModal: false,
            showQrcode: false,
            imgurl: '',
            showMenu: false
        }
    }

    get injected() {
        return this.props as WithStore
    }
    loginOut = () => {

        webIM.logout(true);
    }
    showConfirm = () => {
        const _loginout = this.loginOut;
        confirm({
            title: '确定退出该程序?',
            content: '',
            centered: true,
            cancelText: '取消',
            okText: '确认',
            onOk() {
                _loginout()
            },
            onCancel() {

            },
        });
    }
    changeMale = async (isFemale: boolean) => {

        // 男= 》1 女 =》 0 此处是女的话，应该修改为男 1
        const targetSexNum = this.injected.systemStore.user.sex == 0 ? 1 : 0;
        await systemStore.changeSex(targetSexNum)
        deviceManager.sendUpdateSelfInfoMsg();

        this.setState({
            isFemale: !isFemale
        })
    }
    noOpen = () => {
        message.warn('该功能暂未开放')
        // this.setState({
        //     showInputModal: true
        // })
    }
    changeBirth = () => {
        this.modalData = {
            title: '修改出生日期',
            subTile: '出生日期',
            type: 'time',
            value: this.injected.systemStore.user.birthday + '',
            submit: async (birth: string) => {
                await systemStore.changeBirth(birth);
                deviceManager.sendUpdateSelfInfoMsg();
                return true;
            }
        }
        this.setState(state => ({
            showInputModal: !state.showInputModal
        }))
    }
    changeNickname = () => {
        this.modalData = {
            title: '修改昵称',
            subTile: '',
            type: 'text',
            value: this.injected.systemStore.user.nickname + '',
            submit: async (nickname: string) => {
                await systemStore.changeNickname(nickname);
                deviceManager.sendUpdateSelfInfoMsg();
                return true;
            }
        }
        this.setState(state => ({
            showInputModal: !state.showInputModal
        }))
    }
    changetelephone = () => {
        this.modalData = {
            title: '修改手机号',
            subTile: '手机号',
            type: 'text',
            value: this.injected.systemStore.telephone,
            submit: async (telephone: string) => {
                await systemStore.changeTelephone(telephone);
                deviceManager.sendUpdateSelfInfoMsg();
                return true;
            }
        }

    }
    changeReport = () => {
        this.modalData = {
            title: '修改通讯号',
            subTile: '通讯号',
            type: 'text',
            value: this.injected.systemStore.telephone,
            submit: async (report: string) => {
                await systemStore.changeReport(report);
                deviceManager.sendUpdateSelfInfoMsg();
                return true;
            }
        }
        // this.setState({
        //     showInputModal: true
        // })
    }
    switchInputModal = () => {
        this.setState(state => ({
            showInputModal: !state.showInputModal
        }))
    }
    modalData = {
        title: '',
        value: '',
        subTile: '',
        type: 'text',
        submit: (value: string): Promise<boolean> => {
            return new Promise(res => res(true))
        }
    }
    switchMyQrcode = () => {
        this.setState(state => ({
            showQrcode: !state.showQrcode
        }))

    }
    imgInput: HTMLInputElement | null;
    changeImg = async (e: React.ChangeEvent<HTMLInputElement>) => {

        if (e.target.files && e.target.files.length > 0) {
            const fileImg = e.target.files[0];
            this.setState({
                imgurl: fileImg.path,
            })
            // const res = await imsdk.uploadAvata(this.injected.systemStore.userId, fileImg);
            // console.log('返沪',res);
            // if (res) {
            //     message.success("上传成功");
            // } else {
            //     message.warn("上传失败");
            // }
        }
    };

    getBase64=(img:any, callback:any)=> {
        const reader = new FileReader();
        reader.addEventListener('load', () => {callback(reader.result)});
        reader.readAsDataURL(img);
      }

    changeBackImg = async (e: React.ChangeEvent<HTMLInputElement>) => {

        if (e.target.files && e.target.files.length > 0) {
            const fileImg = e.target.files[0];
            // let imgPath = fileImg.path;
            // console.log(fileImg.path, '路径存在吗？？？？？？？？？？？？？？', fileImg, e.target)
            // imgPath = imgPath.replace(/\\/g, "/");
            this.getBase64(fileImg, (imageUrl:any) =>
            {
                systemStore.backImageurl = imageUrl
                localStorage.setItem('backImageurl',imageUrl+'')
            }
             )
            this.setState({
                // imgurl: imgPath,
                showMenu: false,

            })
            // systemStore.backImageurl = imgPath;
            // let loginDataTemp: any = {};
            // loginDataTemp.backImageurl=imgPath;
            // ipcRender.setCookies('backImageurl', systemStore.backImageurl);
        }
    };

    public render() {
        //  console.log('生日',this.injected.systemStore.user.birthday);

        return (

            <div className="my-info">
                <div className="header">
                    {/* <Avatar className="avator" size={60} icon="user" src={IMSDK.getAvatarUrl(Number(this.injected.systemStore.userId), false)} /> */}
                    <label style={{ cursor: 'pointer' }}>
                        <AvatorWithPhoto isUpload={true} id={this.injected.systemStore.userId} type={0} size={60} forceUpdate={false} />
                        {/* <span className="avatar-text">修改</span> */}
                        {/* <input
                            type="file"
                            ref={ref => this.imgInput = ref}
                            accept="image/png,image/jpeg,image/gif"
                            style={{ display: 'none' }}
                            onChange={this.changeImg}
                        >
                        </input> */}
                    </label>

                    <span className="name">
                        {this.injected.systemStore.user.nickname}
                    </span>
                </div>
                <div className="sub-title">
                    {tr(44)}
                </div>
                <div className="list-item ">
                    <span className="title">{tr(45)}</span>
                    <span>
                        <SwitchSqual value={Boolean(systemStore.user.sex == 0)} changeValue={this.changeMale} />
                    </span>
                </div>
                <div className="list-item with-click" onClick={this.changeNickname}>
                    <span className="title">
                        {tr(186)}
                    </span>
                    <span>
                        {systemStore.user.nickname} <IconImgEdit img={require('../../assets/image/right-icon.png')} size={12} marginSize={4} />
                    </span>
                </div>
                <div className="list-item with-click" onClick={this.changeBirth}>
                    <span className="title">
                        {tr(46)}
                    </span>
                    <span>
                        {this.injected.systemStore.user.birthday ? moment(Number(this.injected.systemStore.user.birthday) * 1000).format('YYYY-MM-DD') :
                            <IconImgEdit img={require('../../assets/image/right-icon.png')} size={12} marginSize={4} />}

                    </span>
                </div>
                <div className="list-item with-click" onClick={this.switchMyQrcode}>
                    <span className="title">{tr(47)}</span>
                    <span>
                        <Icon type="qrcode" /> <IconImgEdit img={require('../../assets/image/right-icon.png')} size={12} marginSize={4} />
                    </span>
                </div>
                {
                    this.state.showQrcode
                        ? <Modal
                            visible={true}
                            width={240}
                            footer={null}
                            onCancel={this.switchMyQrcode}
                            title={tr(47)}

                        >
                            <div className="qrcode-wraper">
                                <QrcodeView userId={this.injected.systemStore.userId} isGroup={false} />
                            </div>
                            <div className="qrcode-text">
                                {tr(51)}
                            </div>
                        </Modal>
                        : null
                }
                <div className="list-item with-click" onClick={() => message.warn('请前往手机App修改!')}>
                    <span className="title">{tr(48)}</span>
                    <span>
                        {systemStore.telephone ? systemStore.telephone : systemStore.userId}
                    </span>
                </div>
                <div className="list-item with-click" onClick={() => message.warn('请前往手机App修改!')}>
                    <span className="title">{tr(49)}</span>
                    <span>
                        {systemStore.userAccount} <IconImgEdit img={require('../../assets/image/right-icon.png')} size={12} marginSize={4} />
                    </span>
                </div>
                <label className="list-item with-click" >
                    {/* <div className="list-item with-click" > */}

                    <span className="title">更换背景</span>
                    <input
                        type="file"
                        ref={ref => this.imgInput = ref}
                        accept="image/png,image/jpeg,image/gif"
                        style={{ display: 'none' }}
                        onChange={this.changeBackImg}
                        // onChange={this.imgPreview}
                    >
                    </input>
                    <span>
                        {systemStore.userAccount} <IconImgEdit img={require('../../assets/image/right-icon.png')} size={12} marginSize={4} />
                    </span>
                    {/* </div> */}
                </label>
                {/* <div className="list-item with-click" >
                    <span className="title">
                        邀请码
                    </span>
                    <span>
                        w2ttr46
                    </span>
                </div> */}
                {/* <div className="list-item" onClick={() => message.warn('暂未开放!')}>
                    <a onClick={this.noOpen}>添加账号</a>
                </div> */}
                <div className="list-item">
                    <a onClick={this.showConfirm} className="exit-but">{tr(50)}</a>
                </div>
                {
                    this.state.showInputModal
                        ? <InputSubmitModal
                            type={this.modalData.type}
                            title={this.modalData.title}
                            labelTitle={this.modalData.subTile}
                            sumitFun={this.modalData.submit}
                            cancel={this.switchInputModal}
                            value={this.modalData.value}
                        />
                        : null
                }
                {/* <div id="qrcode"></div>
                    <script type="text/javascript">
                    new QRCode(document.getElementById("qrcode"), "http://www.runoob.com");  // 设置要生成二维码的链接
                    </script>*/}
            </div>

        );
    }
}
export default WithSettingDetailHead('我的信息', MyInfo)