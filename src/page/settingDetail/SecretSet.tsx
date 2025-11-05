import * as React from 'react';
import  Switch  from 'antd/es/switch';
import './secretSetting.less'
 import { IconImgEdit } from '../../component/iconImage/IconImageEdit';
import { inject, observer } from 'mobx-react';
import { LoginStore } from '../../store/LoginStore';
// import systemStore from '../../store/SystemStore';
import webIM from '../../net/WebIM';
import deviceManager from '../../net/DeviceManager';
import { tr } from '../../i18n/tr';
import { SelectSubmit } from '../../component/selectSubmitModal/SelectSubmit';
 import { CheackBoxSubmitModal } from '../../component/cheackBoxSubmitModal/CheackBoxSubmitModal';
import { WithSettingDetailHead } from '../../component/WithSettingDetailHead/WithSettingDetailHead';
export interface ISecretSetProps {
}
interface ISecretSetPropsWithStore {
	loginStore: LoginStore
}

export interface ISecretSetState {
  showCheackBoxModal:boolean
  showCheackBoxContent:string
}

@inject('loginStore')
@observer
class SecretSet extends React.Component<ISecretSetProps, ISecretSetState> {
  constructor(props: ISecretSetProps) {
    super(props);

    this.state = {
      showCheackBoxModal:false,
      showCheackBoxContent:this.getCheackBoxContent()?this.getCheackBoxContent():'二维码,名片,群组,手机搜索,昵称搜索'
    }
  }
  get injected (){
	  return this.props as ISecretSetPropsWithStore
  }
  switchNumHandle = async (checked:boolean,type:string) =>{
    

      let settings :any= Object.assign({},this.injected.loginStore.userSetting);
      settings[type] = Number(checked);
      
      await webIM.userSettingUpdate(settings);
      deviceManager.sendUpdateSelfInfoMsg();

  }
  selectSubmitHandle=async(content:string,type:string)=>
  {
    if(type=="chatSyncTimeLen")
    {switch(content)
      {
          case "永久":
            content="-1"
              break;
          case "不同步":
            content="-2"
          break;
          case "1小时":
            content="0.04"
          break;
          case "1天":
            content="1.0"
          break;
          case "1周":
            content="7"
              break;
          case "1月":
            content="30"
          break;
          case "1季":
            content="90"
          break;
          case "1年":
            content="365"
          break;
          default:
            content="-2"
          break;
      }
    }else if(type=="showLastLoginTime")
      {
        switch(content)
        {
            case "所有人不允许":
              content="-1"
                break;
            case "所有人允许":
              content="1"
            break;
            case "所有好友允许":
              content="2"
            break;
            case "手机联系人允许":
              content="3"
            break;
            default:
              content="1"
            break;
        }
      }else if(type=="showTelephone")
      {
        switch(content)
        {
            case "所有人不允许":
              content="-1"
                break;
            case "所有人允许":
              content="1"
            break;
            case "所有好友允许":
              content="2"
            break;
            case "手机联系人允许":
              content="3"
            break;
            default:
              content="1"
            break;
        }
      }
    
    let settings :any= Object.assign({},this.injected.loginStore.userSetting);

    
    settings[type]=Number(content);
  
    await webIM.userSettingUpdate(settings);
    deviceManager.sendUpdateSelfInfoMsg();
  }

  getCheackBoxContent()
  {
    let friendFromlist:string="";
    const content= this.injected.loginStore.userSetting.friendFromList.split(',')
    content.map((item)=>{
      if(item=='1')
      {
        if(friendFromlist=="")
        friendFromlist=friendFromlist+"二维码";
        else
        friendFromlist=friendFromlist+",二维码";
      }else if(item=='2')
      {
        if(friendFromlist=="")
        friendFromlist=friendFromlist+"名片";
        else
        friendFromlist=friendFromlist+",名片";
      }
     else if(item=='3')
      {
        if(friendFromlist=="")
        friendFromlist=friendFromlist+"群组";
        else
        friendFromlist=friendFromlist+",群组";
      }else if(item=='4')
      {
        if(friendFromlist=="")
        friendFromlist=friendFromlist+"手机搜索";
        else
        friendFromlist=friendFromlist+",手机搜索";
      }else if(item=='5')
      {
        if(friendFromlist=="")
        friendFromlist=friendFromlist+"昵称搜索";
        else
        friendFromlist=friendFromlist+",昵称搜索";
      }else if (item=='6')
      {
        if(friendFromlist=="")
        friendFromlist=friendFromlist+"其他";
        else
        friendFromlist=friendFromlist+",其他";
      }
      else
      friendFromlist="全部不要允许";
    })
    return friendFromlist;
  }

  cheackBoxSubmit=()=>{
    
   
    this.setState(state => ({
      showCheackBoxModal: !state.showCheackBoxModal,
      showCheackBoxContent:this.getCheackBoxContent()
  }))
 
  }
  
  noOpen = () => {
    this.setState({
      showCheackBoxModal: true
  })
    // message.warn('该功能暂未开放')
  }
  closecheackBox = () => {
    this.setState(state => ({
      showCheackBoxModal: !state.showCheackBoxModal
    }))
}
showConfirm = () => {
 
  this.setState({
    showCheackBoxModal: true
})
     // onCancel();
}
  public render() {
    const dataone=["永久","不同步","1小时","1天","1周","1月","1季","1年"]
    const datatwo=["所有人不允许","所有人允许","所有好友允许","手机联系人允许"]
    
    return (
      <div className="secret-setting">
       
       <SelectSubmit title={tr(68)} content={dataone } type="chatSyncTimeLen" onChange= {(content:string) =>{this.selectSubmitHandle(content,"chatSyncTimeLen")}}></SelectSubmit>
       
       <SelectSubmit title={tr(70)} content={datatwo } type="showLastLoginTime" onChange= {(content:string) =>{this.selectSubmitHandle(content,"showLastLoginTime")}}></SelectSubmit>
        
       <SelectSubmit title={tr(72)} content={datatwo } type="showTelephone" onChange= {(content:string) =>{this.selectSubmitHandle(content,"showTelephone")}}></SelectSubmit>
       
       {
         this.state.showCheackBoxModal
         ? <CheackBoxSubmitModal title= {tr(74)} sumitFun={this.cheackBoxSubmit} cancel={this.closecheackBox} ></CheackBoxSubmitModal>
         :null
       }
       
       {/* <SelectSubmit title={tr(74)} content={datafour } onChange= {(content:string) =>{this.selectSubmitHandle(content,"chatSyncTimeLen")}}></SelectSubmit> */}
         
        {/* <div className="list-item with-click" onClick = {this.noOpen}>
      
          <span className="title">
            {tr(68)}
            
          </span>
          <span>
          {tr(69)} <IconImgEdit img={require('../../assets/image/right-icon.png')} size={12} marginSize={4} />
          </span>
        </div> */}
        {/* <div className="list-item with-click" onClick = {this.noOpen}>
          <span>
            <div className="title">
            {tr(70)}
            </div>
            <div className="sub-title">
            {tr(71)}
            </div>
          </span>
          <span>
            <IconImgEdit img={require('../../assets/image/right-icon.png')} size={12} marginSize={4} />
          </span>
        </div> */}
        {/* <div className="list-item with-click" onClick = {this.noOpen}>
          <span>
            <div className="title">
            {tr(72)}
            </div>
            <div className="sub-title">
            {tr(73)}
            </div>
          </span>
          <span>
            <IconImgEdit img={require('../../assets/image/right-icon.png')} size={12} marginSize={4} />
          </span>
        </div> */}
        <div className="list-item with-click" onClick = {this.showConfirm}>
          <span>
            <div className="title">
            {tr(74)}
            </div>
            <div className="sub-title">
            { this.state.showCheackBoxContent}
            </div>
          </span>
          <span>
            <IconImgEdit img={require('../../assets/image/right-icon.png')} size={12} marginSize={4} />
          </span>
        </div>
        <div className="list-switch-item">
          <span>
          {tr(76)}
          </span>
          <Switch size="small" onChange = {(checked:boolean) =>{this.switchNumHandle(checked,"friendsVerify")}} checked={Boolean(this.injected.loginStore.userSetting.friendsVerify)}/>
        </div>
        <div className="list-switch-item">
          <span>
          {tr(77)}
          </span>
          <Switch size="small" onChange = {(checked:boolean) =>{this.switchNumHandle(checked,"phoneSearch")}} checked={Boolean(this.injected.loginStore.userSetting.phoneSearch)}/>
        </div>
        <div className="list-switch-item">
          <span>
          {tr(78)}
          </span>
          <Switch defaultChecked size="small" onChange = {(checked:boolean) =>{this.switchNumHandle(checked,"nameSearch")}} checked={Boolean(this.injected.loginStore.userSetting.nameSearch)}/>
        </div>
        <div className="list-switch-item">
          <span>
          {tr(79)}
          </span>
          <Switch size="small" onChange = {(checked:boolean) =>{this.switchNumHandle(checked,"isEncrypt")}} checked={Boolean(this.injected.loginStore.userSetting.isEncrypt)}/>
        </div>
        <div className="list-switch-item">
          <span>
          {tr(80)}
          </span>
          <Switch size="small" onChange = {(checked:boolean) =>{this.switchNumHandle(checked,"isTyping")}} checked={Boolean(this.injected.loginStore.userSetting.isTyping)}/>
        </div>
        <div className="list-switch-item">
          <span>
          {tr(81)}
          </span>
          <Switch defaultChecked size="small" onChange = {(checked:boolean) =>{this.switchNumHandle(checked,"multipleDevices")}} checked={Boolean(this.injected.loginStore.userSetting.multipleDevices)}/>
        </div>
      </div>
    );
  }
}
export default WithSettingDetailHead('群发消息',SecretSet)