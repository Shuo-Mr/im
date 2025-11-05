import * as React from "react";
import Progress from "antd/es/progress";
import Spin from "antd/es/spin";
import Tag from "antd/es/tag";
import Popover from "antd/es/popover";
import message from "antd/es/message";
import Modal from "antd/es/modal";
import Icon from "antd/es/icon";

import { MessageItem, MessageStatusType, ChatGrOrFrType } from "../../interface/IChat";
import itemEmoji from "../../config/imojiDataList";
import webIM from "../../net/WebIM";
import "./messageItem.less";
import IMSDK from "../../net/IMSDK";
import { MessageType, MesaageTips } from "../../net/Const";
import "./messageItem.less";
import Utils from "../../utils/utils";
import { Map, Marker } from "react-amap";
import systemStore from "../../store/SystemStore";
import groupStore from "../../store/GroupStore";
import { gifData } from "../../config/gif";
import { Player } from "video-react";
import "video-react/dist/video-react.css";
import BenzAMRRecorder from "benz-amr-recorder";
import ipcRender from "../../ipcRender";
import RcViewer from "@hanyk/rc-viewer";
import chatStore from "../../store/ChatStore";
import mainStore from "../../store/MainStore";
import { GroupMemRole } from "../../interface/IGroup";
import friendStore from "../../store/FriendStore";
import { SubmitAddGroupApply } from "../submitAddGroupApply/SubmitAddGroupApply";
import { AvatorWithPhoto } from "../avatorWithPhoto/AvatorWithPhoto";
import { ConfirmCommon } from "../confirmModal/ConfirmModal";
import Checkbox from "antd/es/checkbox";
import { TransmitMes } from "./MessageTransCombine";
import Divider from "antd/es/divider";
import Button from "antd/lib/button";
import { isOpenRead } from '../../config/SystemConfig';
import UnReadList from './component/UnRead'
// import eventBus from "../../utils/eventBus";



const { confirm } = Modal;

export interface ISendBoardProps {
  addmentionUser: (memId: string, name: string) => void;
}

export interface IMessageItemViewProps {
  messageStatus: MessageStatusType | undefined;
  messages: MessageItem;
  isGroup: boolean;
  isForbidden: boolean; //禁言
  reSendMes: (msg: MessageItem) => void;
  canViewInfo: boolean;
  keyIndex: string;
  role: number;
  addmentionUser: (memId: string, name: string) => void;
  isMesSel: boolean;
  isCheck: boolean;
  switchMesCheck: (mesItem: MessageItem) => void;
  transmitMes: (isSingle: boolean, mesItem?: MessageItem | undefined) => void;
  showTransmitModal: () => void;
  showTransMesListModal?: (mesList: MessageItem[]) => void;
  onClickReplay?: (v: string) => void
  notStatus?: boolean;
  unreadCount: number;
}

export interface IMessageItemViewState {
  isPlay: boolean;
  showMenu: boolean;
  showHeaderMenu: boolean;
  showSubmitAddGroupApply: boolean;
  imageTextvisible: boolean;
  imageTexturl: string;

}
const getMessageStatus = (status: number | undefined) => {
  if (status == MessageStatusType.loading) {
    // return <Spin size="small" />;
    return null;
  }

  if (status == MessageStatusType.sent) {
    return (
      <img
        src={require("./../../assets/image/send-successful.png")}
        style={{ height: "14px", width: "14px", marginLeft: 6 }}
      />
    );
  }
  if (status == MessageStatusType.error) {
    return null;
  }
  return (
    <img
      src={require("./../../assets/image/already-read.png")}
      style={{ height: "14px", width: "14px", marginLeft: 6 }}
    />
  );
};
export const getMessageText = (
  content: string,
  sendtimer: string,
  mentionContent?: string,
  isgroup?: boolean,
  notStatus?: boolean,
  messageStatus?: MessageStatusType,
  isMyMes?: boolean,
  replyName?: string,
  replyContent?: string,
  onClickReplay?: () => void,
) => {

  if (!content) {
    return content;
  }

  let messagestr = /\[[^\[\]]+\]/g,
    emoj = messagestr.test(content),
    chatContent: any = content;
  if (emoj) {
    let contentArr = content.split(/(\[[^[\]]+\])/);

    let comArr = contentArr
      .filter((item) => {
        return item.trim() != "";
      })
      .map((item, index) => {
        if (/\[([^\[\]]+)\]/.test(item)) {
          let keyImoji = item.replace("[", "").replace("]", "");
          if (itemEmoji[keyImoji]) {
            return (
              <div className="message-sendtext-style" key={item + "_" + index}>
                {/* {replyName && replyContent && (replyName + ":" + replyContent)} */}
                <img
                  src={itemEmoji[keyImoji].img}
                  className="imoj"
                  key={item + "_" + index}
                />
              </div>
            );
          } else {
            return (
              <div className="message-sendtext-style" key={item + "_" + index}>
                {/* {replyName && replyContent && (replyName + ":" + replyContent)} */}
                {item}
              </div>
            );
          }
        } else {
          return (
            <div className="message-sendtext-style" key={item + "_" + index}>
              {/* <div className='message-replay'>
					{replyName && replyContent && (replyName + ":" + replyContent)}
				</div> */}
              {item}
            </div>
          );
        }
      });
    chatContent = comArr;
  }
  return (
    <div className="messsage-emoj-style" key={new Date().valueOf()}>
      <div className="message-sendtextemoj-style">
        {mentionContent ? (
          <span className="mention-text">[{mentionContent}]</span>
        ) : null}
        {replyName && replyContent ? (
          <div className="message-replay"
            onClick={() => {
              onClickReplay && onClickReplay()
            }}>{replyName + ":" + replyContent}</div>
        ) : null}
        {chatContent}
        <span className="message-sendtext-sendtimer">{sendtimer}</span>
        <span className="status">
          {isMyMes
            ? isgroup || notStatus
              ? null
              : getMessageStatus(messageStatus)
            : null}
          {/* {isgroup || notStatus ? null : getMessageStatus(messageStatus)} */}
        </span>
      </div>
    </div>
  );
};

let playState = false
let playerObj: any = null
export class MessageItemView extends React.Component<
  IMessageItemViewProps,
  IMessageItemViewState
> {
  constructor(props: IMessageItemViewProps) {
    super(props);

    this.state = {
      isPlay: false,
      showMenu: false,
      showHeaderMenu: false,
      showSubmitAddGroupApply: false,
      imageTextvisible: false,
      imageTexturl: ""
    };
  }

  onAdd = () => {
    const { messages } = this.props;
    console.log('---触发@', messages)
    this.props.addmentionUser(messages.fromUserId, messages.fromUserName);
  };

  isMeMes = (mes: MessageItem) => {
    return systemStore.userId == (mes.fromUserId || mes.from);
  };
  showFileType = ["jpg", "png", "gif"];

  getMessageFile = () => {
    let { content, fileSize, fileName } = this.props.messages;
    let name = "";
    let filesSize = "";
    if (fileName) {
      const targetURL = fileName ? fileName : content + "";
      const targetFileUrlArray = targetURL.split("/");
      name = targetFileUrlArray[targetFileUrlArray.length - 1];
      if (fileSize) {
        filesSize = Utils.formatSizeToUnit(parseFloat(fileSize));
      } else {
        filesSize = "0";
      }

      let fileType = name.split(".");
      let type = "";
      if (fileType && fileType.length > 1) {
        type = fileType[fileType.length - 1];
      }

      if (type && this.showFileType.indexOf(type) > -1) {
        return (
          <div>
            <RcViewer
              options={{
                toolbar: {
                  prev: false,
                  play: false,
                  next: false,
                },
                title: false,
              }}
            >
              <img src={content} className="img-linmit" onClick={() => { console.log("content", content) }}></img>
            </RcViewer>
            {/* <Zmage className="img-linmit" src={content} backdrop="rgba(0,0,0,.4)" alt="image" /> */}
          </div>
        );
      }
    }
    return (
      // <a href={content} download={name} className="mes-file-wraper">
      <a className="mes-file-wraper">
        <span className="left">
          <span>{name ? name : content}</span>
          {fileSize ? <span>{filesSize}</span> : <span> </span>}
        </span>
        <span className="right">
          <Icon type="file" />
        </span>
      </a>
    );
  };
  getMessageCard = () => {
    const { content, objectId } = this.props.messages;
    // const isMsMes=this.isMeMes(this.props.message);
    return (
      <div
        className="card-mes"
        onClick={() => this.showuserInfo(true, objectId ? objectId : "0")}
      >
        <div className="top">
          {/* <Avatar icon="user" size={40} src={IMSDK.getAvatarUrl(Number(objectId), false)} /> */}
          <AvatorWithPhoto type={0} id={objectId ? objectId : "0"} size={40} />
          <span className="name">{content}</span>
        </div>
        <span className="card-title">个人名片</span>
      </div>
    );
  };
  getMessagePositon = (timeFormate: string, isMyMes: boolean) => {
    const { location_x, location_y, objectId } = this.props.messages;

    let position = Utils.bd_decrypt(location_y as any, location_x as any);
    console.log('po', position, objectId, this.props.messages)
    return (
      <div style={{ height: "146px", width: "254px", position: "relative" }}>
        <Map
          loading={
            <div
              style={{
                display: "flex",
                height: "100%",
                width: "100%",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Spin />
            </div>
          }
          center={position}
          amapkey={systemStore.amapKey}
          zoom={16}
          protocol={"https://"}
          mapStyle="mapStyle"
        >
          <Marker position={position} />
        </Map>
        {/* <div  ></div> */}
        <div className="message-sendtext-sendtimer">
          <span
            style={{
              fontSize: "12px",
              paddingRight: "8px",
              whiteSpace: "normal",
            }}
          >
            {" "}
            {objectId}
          </span>
          {timeFormate}
          {isMyMes
            ? this.props.isGroup || this.props.notStatus
              ? null
              : getMessageStatus(this.props.messageStatus)
            : null}
        </div>
      </div>
    );
  };
  onClickImage_Text = (url: string) => {
    this.setState({
      imageTextvisible: true,
      imageTexturl: url,
    });
  };
  amrRecorder: any;
  playAudio = () => {
    this.audioValue && this.audioValue.play();
  };
  audioValue: HTMLAudioElement | null = null;
  componentDidMount() {
    this.audioValue && this.audioValue.load();
  }
  playSet = (isPlay: boolean) => {
    if (!isPlay) {
      this.amrRecorder = null;
    }
    this.setState({
      isPlay,
    });
  };
  replyContent = (obj: any): string => {
    switch (obj && obj.type) {
      case MessageType.TEXT: {
        let _content = obj.content;
        if (obj.isEncrypt) {
          _content = webIM.decryptMessage(obj);
        }
        return _content;
      }
      case MessageType.IMAGE:
        return "[图片]";
      case MessageType.GIF:
        return "[动图]";
      case MessageType.FILE:
        return "[文件]";
      case MessageType.CARD:
        return "[名片]";
      case MessageType.LOCATION:
        return "[位置]";
      case MessageType.VIDEO:
        return "[视频]";
      case MessageType.VOICE:
        return "[音效]";
      case MessageType.RED:
        return "[红包]";
      case MessageType.TEXT_TRANSMIT_MANY:
        return "[转发消息]";
      case MessageType.Poke_A_STAMP:
        return "[戳一戳]";
      case MessageType.TEXT_REPLY: {
        return this.props.messages.content;
      }
      default:
        return "";
    }
  };

  changePlay = (playRef: any) => {
    // 订阅视频播放状态
    playRef.subscribeToStateChange((state: any) => {
      if (playState && state && state.paused) {
        playerObj = null
        playState = false
        // player.paused()
      }
    })
    if (playRef && !playState) {

      playerObj = playRef
      playState = true

      playRef.play()
    } else if (
      playerObj && playerObj.props && playerObj.props.src &&
      playRef && playRef.props && playRef.props.src &&
      playRef.props.src === playerObj.props.src
    ) {
      playerObj.pause()
      // playerObj = null
      // playState = false
    }
  }
  onRetry = () => {
    this.props.onClickReplay && this.props.onClickReplay((this.props.messages.objectId as any).messageId)
  }
  getMessContentDom = () => {
    let playRef: any = null
    let {
      content,
      type,
      timeLen,
      timeSend,
      objectId,
      text,
      contentType,
    } = this.props.messages;
    if (this.props.messages.isEncrypt) {

      content = this.props.messages.content = webIM.decryptMessage(
        this.props.messages
      );
    }
    const isMyMes = this.isMeMes(this.props.messages);
    const timeFormate = timeSend
      ? Utils.getTimeText(Number(timeSend), 0, 1)
      : "";
    const { isGroup, notStatus, messageStatus } = this.props;
    //  let   timeSends:Date = new Date(parseInt(timeSend + '') * 1000);

    if (Object.prototype.toString.call(content) == "[object Object]") {
      content = "消息解析出错";
      IMSDK.setLogRepot(
        ipcRender.getCurrectDeviceSource(),
        JSON.stringify(this.props.messages)
      );
    }

    switch (type) {
      case MessageType.TEXT: {
        return getMessageText(
          content,
          "   " + timeFormate,
          "",
          isGroup,
          notStatus,
          messageStatus,
          isMyMes
        );
      }
      case MessageType.IMAGE: {
        try {
          decodeURIComponent(content);
        } catch (e) {
          console.error("图片解析失败", content);
          content = "";
        }
        return (
          <div>
            {/* <Zmage className="img-linmit" src={content} backdrop="rgba(0,0,0,.4)" alt="image" /> */}
            <RcViewer
              options={{
                toolbar: {
                  prev: false,
                  play: false,
                  next: false,
                },
                title: false,
              }}
            >
              <img
                src={content}

                onClick={() => {
                  // 执行复制操作  代码从 sendbox 拷贝
                  const { nativeImage } = window['electron'];
                  const { clipboard } = global['electron'];

                  var Img = new Image(),
                    dataURL = '';
                  Img.src = content;
                  Img.onload = function () { //要先确保图片完整获取到，这是个异步事件
                    var canvas = document.createElement("canvas")
                    canvas.width = Img.width;
                    canvas.height = Img.height;
                    // @ts-ignore
                    canvas.getContext("2d").drawImage(Img, 0, 0, Img.width, Img.height); //将图片绘制到canvas中
                    dataURL = canvas.toDataURL('image/jpeg'); //转换图片为dataURL
                    clipboard.writeImage(nativeImage.createFromDataURL(dataURL))
                  };


                  // clipboard.writeText("WZZZX")


                }}
                alt="图片解析出错"
                className="img-linmit"
              ></img>
            </RcViewer>
            <div className="message-sendtext-sendtimer">
              {timeFormate}
              {isMyMes
                ? isGroup || notStatus
                  ? null
                  : getMessageStatus(messageStatus)
                : null}
            </div>
          </div>
        );
      }
      case MessageType.GIF: {
        let targetGif;
        if (!gifData[content] || !gifData[content].image) {
          if (content) {
            targetGif = content;
          } else {
            return (
              <div>
                <span>gif消息解析失败</span>
                <span className="message-sendtext-sendtimer">
                  {"   " + timeFormate}
                  {isMyMes
                    ? isGroup || notStatus
                      ? null
                      : getMessageStatus(messageStatus)
                    : null}
                </span>
              </div>
            );
          }
        } else {
          targetGif = gifData[content].image;
        }
        return (
          <div>
            <img src={targetGif} alt="content" className="img-linmit" />
            <div className="message-sendtext-sendtimer">
              {timeFormate}
              {isMyMes
                ? isGroup || notStatus
                  ? null
                  : getMessageStatus(messageStatus)
                : null}
            </div>
          </div>
        );
      }
      case MessageType.FILE: {
        return (
          <div>
            {this.getMessageFile()}
            <div className="message-sendtext-sendtimer">
              {timeFormate}
              {isMyMes
                ? isGroup || notStatus
                  ? null
                  : getMessageStatus(messageStatus)
                : null}
            </div>
          </div>
        );
      }
      case MessageType.CARD: {
        return (
          <div>
            {this.getMessageCard()}
            <div className="message-sendtext-sendtimer">
              {timeFormate}
              {isMyMes
                ? isGroup || notStatus
                  ? null
                  : getMessageStatus(messageStatus)
                : null}
            </div>
          </div>
        );
      }
      case MessageType.LOCATION: {
        return (
          <div>
            {this.getMessagePositon(timeFormate, isMyMes)}
            {/* <div className="message-sendtext-sendtimer">
							{isMyMes ? (this.props.isGroup || this.props.notStatus ? null : this.getMessageStatus(this.props.messageStatus)) : null}
						</div> */}
          </div>
        );
      }
      case MessageType.VIDEO: {
        return (
          <div className="video-item display-none-wrapp" onClick={() => this.changePlay(playRef)}>
            {/* <Player width={50} height={80}>
							<source src={content} />
						</Player> */}
            <Player
              // playsInline
              ref={(player: any) => { playRef = player }}
              src={content}
              fluid={false}
              width={208}
              height={272}
            />
            <div className="message-sendtext-sendtimer">
              {timeFormate}
              {isMyMes
                ? isGroup || notStatus
                  ? null
                  : getMessageStatus(messageStatus)
                : null}
            </div>
          </div>
        );
      }
      case MessageType.VOICE: {
        let image = this.state.isPlay
          ? require("./../../assets/image/voice.gif")
          : require("./../../assets/image/voice.png");
        return (
          <div>
            <span onClick={this.playAudio} style={{ cursor: "pointer" }}>
              {/* <p>
              <img src="" alt="" />
              <span>  {timeLen}''</span>
            </p>
            <audio autoPlay ref={ref => this.audioValue = ref} preload="auto" src={content} /> */}
              <button
                className={isMyMes ? "sound-player send" : "sound-player"}
                onClick={() => {
                  const playSet = this.playSet;

                  if (this.amrRecorder) {
                    chatStore.amrRecorder && chatStore.amrRecorder.stop();
                    this.amrRecorder = null;
                    return;
                  }
                  chatStore.amrRecorder && chatStore.amrRecorder.stop();
                  chatStore.amrRecorder = new BenzAMRRecorder();
                  let amrRecorder = chatStore.amrRecorder;
                  this.amrRecorder = amrRecorder;

                  chatStore.amrRecorder.initWithUrl(content).then(function () {
                    playSet(true);
                    amrRecorder.play();
                  });
                  chatStore.amrRecorder.onEnded(function () {
                    playSet(false);
                  });
                }}
              >
                {/* {' '} */}
                {timeLen ? timeLen.toFixed(1) : ""}
                <img src={image} alt="" />
                <span className="message-sendtext-sendtimer">
                  {timeFormate}
                  {isMyMes
                    ? isGroup || notStatus
                      ? null
                      : getMessageStatus(messageStatus)
                    : null}
                </span>
              </button>
            </span>
          </div>
        );
      }
      case MessageType.TYPE_CASH_ADVANCE_ORDER: {
        return (
          <div>
            提现预下单消息，请在手机上查看!
            <span className="message-sendtext-sendtimer">
              {"   " + timeFormate}
              {isMyMes
                ? isGroup || notStatus
                  ? null
                  : getMessageStatus(messageStatus)
                : null}
            </span>
          </div>
        );
      }
      case MessageType.TYPE_WITHDRAWAL_SUCCESS: {
        return (
          <div>
            提现到账消息，请在手机上查看!
            <span className="message-sendtext-sendtimer">
              {"   " + timeFormate}
              {isMyMes
                ? isGroup || notStatus
                  ? null
                  : getMessageStatus(messageStatus)
                : null}
            </span>
          </div>
        );
      }
      case MessageType.PRIVATE_RED_BAGS:
      case MessageType.RED: {
        return (
          <div>
            红包消息，请在手机上查看!
            <span className="message-sendtext-sendtimer">
              {"   " + timeFormate}
              {isMyMes
                ? isGroup || notStatus
                  ? null
                  : getMessageStatus(messageStatus)
                : null}
            </span>
          </div>
        );
      }
      case MessageType.TYPE_RED_BAGES_RECEIVED: {
        return (
          <div>
            红包到账消息，请在手机上查看!
            <span className="message-sendtext-sendtimer">
              {"   " + timeFormate}
              {isMyMes
                ? isGroup || notStatus
                  ? null
                  : getMessageStatus(messageStatus)
                : null}
            </span>
          </div>
        );
      }
      case MessageType.TRANSFERACCOUNTS: {
        return (
          <div>
            转账消息，请在手机上查看!
            <span className="message-sendtext-sendtimer">
              {"   " + timeFormate}
              {isMyMes
                ? isGroup || notStatus
                  ? null
                  : getMessageStatus(messageStatus)
                : null}
            </span>
          </div>
        );
      }
      case MessageType.Conference_VIDEO_INVITE: {
        return (
          <div>
            视频会议，请在手机上查看!
            <span className="message-sendtext-sendtimer">
              {"   " + timeFormate}
              {isMyMes
                ? isGroup || notStatus
                  ? null
                  : getMessageStatus(messageStatus)
                : null}
            </span>
          </div>
        );
      }
      case MessageType.GET_SMALL_RED_BAGES:
      case MessageType.SMALL_RED_BAGES:
      case MessageType.SMALL_RED_BAGES_BACK: {
        return (
          <div>
            微红包消息，请在手机上查看!
            <span className="message-sendtext-sendtimer">
              {"   " + timeFormate}
              {isMyMes
                ? isGroup || notStatus
                  ? null
                  : getMessageStatus(messageStatus)
                : null}
            </span>
          </div>
        );
      }
      case MessageType.TYPE_CLOUD_TRANSFER:
      case MessageType.TYPE_CLOUD_TRANSFER_RECEIVE:
      case MessageType.TYPE_CLOUD_TRANSFER_RETURN: {
        return (
          <div>
            微转账消息，请在手机上查看!
            <span className="message-sendtext-sendtimer">
              {"   " + timeFormate}
              {isMyMes
                ? isGroup || notStatus
                  ? null
                  : getMessageStatus(messageStatus)
                : null}
            </span>
          </div>
        );
      }
      case MessageType.SHARED_LINKS: {
        return (
          <div>
            链接消息，请在手机上查看!
            <span className="message-sendtext-sendtimer">
              {"   " + timeFormate}
              {isMyMes
                ? isGroup || notStatus
                  ? null
                  : getMessageStatus(messageStatus)
                : null}
            </span>
          </div>
        );
      }
      case MessageType.TEXT_TRANSMIT_MANY: {
        return (
          <div>
            <TransmitMes mes={this.props.messages} />
            <span className="message-sendtext-sendtimer">
              {"   " + timeFormate}
              {isMyMes
                ? isGroup || notStatus
                  ? null
                  : getMessageStatus(messageStatus)
                : null}
            </span>
          </div>
        );
      }
      case MessageType.Poke_A_STAMP: {
        return (
          <div>
            {"窗口抖动消息"}
            <span className="message-sendtext-sendtimer">
              {"   " + timeFormate}
              {isMyMes
                ? isGroup || notStatus
                  ? null
                  : getMessageStatus(messageStatus)
                : null}
            </span>
          </div>
        );
      }
      case MessageType.TEXT_REPLY: {
        if (objectId) {
          const obj = Utils.jsonWithParse(objectId);
          if (!obj) {
            return null;
          }
          const replyName = obj && obj.fromUserName;
          const replyContent = this.replyContent(obj);
          return getMessageText(
            content,
            "   " + timeFormate,
            "",
            isGroup,
            notStatus,
            messageStatus,
            isMyMes,
            replyName,
            replyContent,
            this.onRetry
          );
        }
      }
      case MessageType.IMAGE_TEXT: {
        const obj = Utils.jsonWithParse(content);
        if (obj) {
          let title = obj.title;
          let sub = obj.sub;
          let img = obj.img;
          let url = obj.url;
          return (
            <div
              onClick={(e) => this.onClickImage_Text(url)}
              className="messsage-imag-txt"
            >
              <div className="imag-txt-title">{title}</div>
              <img src={img} className="imag-txt-content"></img>
              <div className="imag-txt-sub">{sub}</div>
              <Divider className="messsage-imag-divider"></Divider>
              <div>阅读全文</div>
            </div>
          );
        }
      }
      case MessageType.IMAGE_TEXT_MANY: {
        const obj = Utils.jsonWithParse(content);
        if (obj) {
          let title = obj.title;
          // let sub = obj.sub;
          let img = obj.img;
          let url = obj.url;
          return (
            <div
              onClick={(e) => this.onClickImage_Text(url)}
              className="messsage-imag-txt"
            >
              <div className="imag-txt-title">{title}</div>
              <img src={img} className="imag-txt-content"></img>
              {/* <div className="imag-txt-sub">{sub}</div> */}
              <Divider className="messsage-imag-divider"></Divider>
              <div>阅读全文</div>
            </div>
          );
        }
      }
      default: {
        // console.log('为解析的数据类型',type,content,messageId)
        if (contentType == MessageType.DELETE_ROOM) {
          return getMessageText(
            (text ? text : "") + content,
            "   " + timeFormate,
            "",
            isGroup,
            notStatus,
            messageStatus,
            isMyMes
          );
        }
        return (
          <div>
            {content}
            <span className="message-sendtext-sendtimer">
              {"   " + timeFormate}
              {isMyMes
                ? isGroup || notStatus
                  ? null
                  : getMessageStatus(messageStatus)
                : null}
            </span>
          </div>
        );
      }
    }
  };
  reSendMes = () => {
    const resendMes = this.props.reSendMes,
      message = this.props.messages;
    confirm({
      title: "确认重发消息消息?",
      content: "",
      centered: true,
      okText: "确认",
      cancelText: "取消",
      onOk() {
        resendMes(message);
      },
      onCancel() { },
    });
  };

  getIsInnerTime = (mesTime: string) => {
    if (!mesTime) {
      return false;
    }
    const serverTime = webIM.getServerTime();
    return serverTime - Number(mesTime) < 3 * 60;
  };
  deleMes = () => {
    chatStore.delMes(this.props.messages, 1, false);
    this.hideMenu();
  };
  saveToLocal = () => {
    let a = document.createElement("a");
    a.download = String(this.props.messages.fileName);
    a.href = this.props.messages.content;
    // a.click();
    var event = new MouseEvent("click"); // 模拟鼠标click点击事件
    a.target = "_blank"; // 设置a节点的download属性值
    a.dispatchEvent(event);

    this.hideMenu();
  };
  saveImog = () => {
    this.hideMenu();
    chatStore.addImog(
      this.props.messages.content,
      this.props.messages.fileName ? this.props.messages.fileName : ""
    );
  };

  copyText = () => {
    this.hideMenu();
    const { clipboard } = global['electron'];
    clipboard.writeText(this.props.messages.content)
    message.success('复制成功')
  }

  copyImog = () => {
    this.hideMenu();
    // console.log('----this.props.messages', this.props.messages)
    // 转化网络图片为base64图片
    const canvas = document.createElement('CANVAS')
    const ctx = canvas['getContext']('2d')
    const img = new Image()
    img.crossOrigin = 'Anonymous'
    // 执行复制操作  代码从 sendbox 拷贝
    const { nativeImage } = window['electron'];
    const { clipboard } = global['electron'];
    img.onload = function () {
      canvas['height'] = img.height
      canvas['width'] = img.width
      ctx.drawImage(img, 0, 0)
      const dataURL = canvas['toDataURL']('image/png')
      // const image64 = nativeImage.createFromDataURL(dataURL)
      // clipboard.writeImage(image64)
      clipboard.writeImage(nativeImage.createFromDataURL(dataURL))
    }
    img.src = this.props.messages.content
  };

  replayMessage = () => {
    this.hideMenu();
    chatStore.isReply = true;
    chatStore.replyMessage = this.props.messages;
    // console.log(chatStore.replyMessage,'回复的消息体++++++++++++++++++++++++++++')
  };

  withDrawMes = () => {
    chatStore.withDrawMes(this.props.messages);
    this.hideMenu();
  };
  hideMenu = () => {
    this.setState({
      showMenu: false,
    });
  };
  hideHeaderMenu = () => {
    this.setState({
      showHeaderMenu: false,
    });
  };
  showuserInfo = (isMyMes: boolean, fromUserId: string) => {
    if (isMyMes || this.props.canViewInfo) {
      mainStore.showInfoModal(fromUserId);
      // 发送广播  更新所有头像
      setTimeout(() => {
        const imgRandomNu = '' + Math.round(Math.random() * 100000)
        systemStore.changeAvatarUpdateId(imgRandomNu)
        // 发送广播  更新所有头像
        // eventBus.emit('avatarUpdatedListener', fromUserId, imgRandomNu)
      }, 600);
    } else {
      message.warn("该群不允许查看群友信息!");
    }
  };

  mentionGroupMem = () => {
    this.props.addmentionUser(
      this.props.messages.fromUserId,
      this.props.messages.fromUserName
    );
  };
  modalData = {
    title: "邀请详情",
    subTile: "",
    submit: (): Promise<boolean> => {
      let touserids = Utils.jsonWithParse(this.props.messages.objectId);
      if (!touserids) {
        return new Promise((res) => res(false));
      }
      const result = IMSDK.inviteFriendWithGroup(
        chatStore.currentChatData.gid,
        JSON.stringify(touserids.userIds.split(","))
      );

      if (result) {
        //这里需要向群组数组添加
        chatStore.setGroupVerification(this.props.messages, 1);
        groupStore.updataSingleGroupList();
        this.setState((state) => ({
          showSubmitAddGroupApply: !state.showSubmitAddGroupApply,
        }));

        return new Promise((res) => res(true));
      } else {
        return new Promise((res) => res(false));
      }
    },
  };
  switchSubmitAddGroupApply = () => {
    this.setState((state) => ({
      showSubmitAddGroupApply: !state.showSubmitAddGroupApply,
    }));
  };
  refusalSubmitAddGroupApply = () => {
    chatStore.setGroupVerification(this.props.messages, 2);
    this.setState((state) => ({
      showSubmitAddGroupApply: !state.showSubmitAddGroupApply,
    }));
  };
  isShowGoOk = (content: number, objectId: string) => {
    if (content == MessageType.GROUP_INVITE) {
      if (systemStore.isJSON(objectId)) {
        if (
          this.props.role == GroupMemRole.manage ||
          this.props.role == GroupMemRole.owner
        ) {
          return true;
        } else {
          return false;
        }
      } else return false;
    } else return false;
  };
  mtesItemSelec = () => {

    if (this.props.isMesSel) {
      this.props.switchMesCheck(this.props.messages);
    }
  };
  transmitMes = () => {
    this.hideMenu();

    this.props.transmitMes(true, this.props.messages);
  };
  showTransmitModal = () => {
    this.hideMenu();
    this.props.showTransmitModal();
  };
  public render() {
    const { messageStatus, messages, isGroup } = this.props;
    let {
      fromUserName,
      type,
      contentType,
      fromUserId,
      content,
      from,
      objectId,
      verification,
      toUserId,
    } = messages;
    let contents = Utils.htmlRestore(content);
    if (Object.prototype.toString.call(contents) == "[object Object]") {
      contents = "消息解析出错";
      IMSDK.setLogRepot(
        ipcRender.getCurrectDeviceSource(),
        JSON.stringify(messages)
      );
    }
    const withFriend = friendStore.friendMap.get(Number(fromUserId));
    const dataGroup = groupStore.groupMemberList.get(toUserId + "");
    const _nickname = dataGroup && dataGroup.get(fromUserId + "");
    // dataGroup&&dataGroup.get()
    const withMarkname =
      withFriend && withFriend.remarkName
        ? withFriend.remarkName
        : _nickname && _nickname.nickname
          ? _nickname.nickname
          : fromUserName;
    if (type == MessageType.SNAP_CHAT) {
      return (
        <div className="message-item-tip" onClick={this.mtesItemSelec}>
          {contents}
        </div>
      );
    }
    if (
      (contentType && MesaageTips.indexOf(contentType) > -1 && isGroup) ||
      contentType == MessageType.REVOKE
    ) {
      return (
        <div className="message-item-tip" onClick={this.mtesItemSelec}>
          <span>
            {contents}
            {objectId && this.isShowGoOk(contentType, objectId) ? (
              verification == 0 ? (
                <button
                  onClick={this.switchSubmitAddGroupApply}
                  style={{
                    border: "none",
                    color: "#3468F5",
                    backgroundColor: "#0000",
                  }}
                >
                  去确认
                </button>
              ) : verification == 1 ? (
                <span>已确认</span>
              ) : (
                <span>已拒绝</span>
              )
            ) : null}
          </span>
          {this.state.showSubmitAddGroupApply ? (
            <SubmitAddGroupApply
              title={this.modalData.title}
              toUserid={objectId ? objectId : ""}
              classN={fromUserName}
              roomid={chatStore.currentChatData.gid}
              sumitFun={this.modalData.submit}
              cancel={this.refusalSubmitAddGroupApply}
              id={from}
            />
          ) : null}
        </div>
      );
    }
    // 群管理的消息  并且 是群 不处理 直接返回
    if (contentType == MessageType.DELETE_ROOM && !isGroup) {
    } else if (contentType && !isGroup) {
      return null;
    }
    const isMyMes = this.isMeMes(messages);
    const header = (
      <span
        onClick={() => this.showuserInfo(isMyMes, fromUserId)}
        className="head-wraper"
      >
        {/* <Avatar icon="user" className="head" src={IMSDK.getAvatarUrl(Number(fromUserId||from), false)} /> */}
        <AvatorWithPhoto id={fromUserId || from} type={0} />
      </span>
    );

    const dataChat = chatStore.currentChatData;
    let curGroupMemList = groupStore.groupMemberList.get(dataChat.id);
    let grMembers = null;
    let isForbit = false;
    if (curGroupMemList) {
      grMembers = curGroupMemList.get(fromUserId);
      if (grMembers && grMembers.talkTime > 0) {
        isForbit = true;
        // chatStore.currentChat.isForbidden = true;
      } else {
        isForbit = false;
        // chatStore.currentChat.isForbidden = false;
      }
    }
    let removeMemFun = async () => {
      const res = await groupStore.removeMem(fromUserId);
      if (res) {
        message.success("操作成功");
      } else {
        message.warn("操作失败");
      }
    };
    const setForbitMem = async () => {
      const res = await groupStore.prohibitedMember(fromUserId);
      if (res) {
        message.success("操作成功");
      } else {
        message.warn("操作失败");
      }
    };
    const headerMenu =
      (dataChat.role == GroupMemRole.owner ||
        dataChat.role == GroupMemRole.manage) &&
        this.props.messages.fromUserId != systemStore.userId ? (
        <div className="send-list">
          <label
            className="item"
            onClick={() => {
              this.onAdd();
            }}
          >
            <span>@Ta</span>
          </label>
          {isForbit ? (
            <label
              className="item"
              onClick={() => {
                this.hideHeaderMenu();
                ConfirmCommon("确定取消禁止该成员发言?", setForbitMem);
              }}
            >
              <span>取消禁言</span>
            </label>
          ) : (
            <label
              className="item"
              onClick={() => {
                this.hideHeaderMenu();
                ConfirmCommon("确定禁止该成员发言?", setForbitMem);
              }}
            >
              <span>禁言</span>
            </label>
          )}
          <label
            className="item"
            onClick={() => {
              this.hideHeaderMenu();
              ConfirmCommon("确定移除该成员?", removeMemFun);
            }}
          >
            <span>移除群员</span>
          </label>
        </div>
      ) : null;
    const headeContentDom = (
      <Popover
        placement="bottomLeft"
        content={headerMenu}
        trigger="contextMenu"
        visible={this.state.showHeaderMenu}
        onVisibleChange={(isShow: boolean) =>
          this.setState({ showHeaderMenu: isShow })
        }
      >
        {header}
      </Popover>
    );
    const mesCssAray = [
      MessageType.TEXT,
      MessageType.TEXT_REPLY,
      MessageType.PRIVATE_RED_BAGS,
      MessageType.RED,
      MessageType.TRANSFERACCOUNTS,
      MessageType.Poke_A_STAMP,
      //提现消息
      MessageType.TYPE_CASH_ADVANCE_ORDER,
      MessageType.TYPE_WITHDRAWAL_SUCCESS,
      //红包到账
      MessageType.TYPE_RED_BAGES_RECEIVED,
      //微红包
      MessageType.SMALL_RED_BAGES,
      MessageType.GET_SMALL_RED_BAGES,
      MessageType.SMALL_RED_BAGES_BACK,
      //微转账
      MessageType.TYPE_CLOUD_TRANSFER,
      MessageType.TYPE_CLOUD_TRANSFER_RECEIVE,
      MessageType.TYPE_CLOUD_TRANSFER_RETURN,

      MessageType.SHARED_LINKS,
    ];
    let contentClass =
      mesCssAray.indexOf(type) > -1
        ? isGroup && !isMyMes
          ? "text-wraper top"
          : "text-wraper"
        : "text-wraper transparent";
    if (contentType && contentType == MessageType.DELETE_ROOM) {
      contentClass = "text-wraper";
    }

    const isDeviceonline = type == MessageType.DEVICEONLINE;
    // console.log('getIsInnerTime', this.getIsInnerTime(timeSend))
    const isWithdrawMes =
      (isMyMes &&
        !this.props.isForbidden &&
        (messageStatus == MessageStatusType.sent || !messageStatus)) ||
      (this.props.isGroup &&
        (this.props.role == GroupMemRole.manage ||
          this.props.role == GroupMemRole.owner));
    const mesTypeArray = [
      MessageType.IMAGE,
      MessageType.SIP_AUDIO,
      MessageType.GIF,
      MessageType.VIDEO,
      MessageType.FILE,
    ];
    const mesTypeIsImogArray = [MessageType.IMAGE, MessageType.GIF];
    const mesTypeIsTextArray = [MessageType.TEXT, MessageType.TEXT_REPLY];
    const notransmitMesTypeArray = [
      MessageType.RED,
      MessageType.TRANSFERACCOUNTS,
      MessageType.Conference_VIDEO_INVITE,
    ];
    const contentIsSave = mesTypeArray.indexOf(type) > -1;
    const contentIsImog = mesTypeIsImogArray.indexOf(type) > -1;
    const notransmitMes = notransmitMesTypeArray.indexOf(type) > -1;
    const contentIsText = mesTypeIsTextArray.indexOf(type) > -1;

    const menuDom = (
      <div className="send-list">
        {contentIsText &&
          <label className="item" onClick={this.copyText}>
            <span>复制</span>
          </label>
        }
        {isWithdrawMes ? (
          <label className="item" onClick={this.withDrawMes}>
            <span>撤回</span>
          </label>
        ) : null}
        {contentIsSave ? (
          <label className="item" onClick={this.saveToLocal}>
            <span>另存为</span>
          </label>
        ) : null}
        {contentIsImog ? (
          <label className="item" onClick={this.copyImog}>
            <span>复制</span>
          </label>
        ) : null}
        {contentIsImog ? (
          <label className="item" onClick={this.saveImog}>
            <span>添加表情</span>
          </label>
        ) : null}
        {(!isMyMes && !isGroup) ? (
          <label className="item" onClick={this.replayMessage}>
            <span>回复</span>
          </label>
        ) : null}
        {!notransmitMes ? (
          <label className="item" onClick={this.transmitMes}>
            <span>转发</span>
          </label>
        ) : null}
        <label className="item" onClick={this.showTransmitModal}>
          <span>多选</span>
        </label>

        <label className="item" onClick={this.deleMes}>
          <span>删除</span>
        </label>
      </div>
    );

    if (messageStatus == MessageStatusType.error) { // 确认消息是否已被后台收到
      const isGroup = chatStore.currentChatData.type == ChatGrOrFrType.group;
      if (isGroup) {
        IMSDK.checkGropuMessageArrived(messages.messageId, chatStore.currentChatData.id)
      } else {
        IMSDK.checkMessageArrived(messages.messageId)
      }
    }


    const contentDom = (
      <Popover
        placement="bottomRight"
        content={menuDom}
        trigger="contextMenu"
        visible={this.state.showMenu}
        onVisibleChange={(isShow: boolean) =>
          this.setState({ showMenu: isShow })
        }
      >
        <Tag
          color="#f50"
          style={
            messageStatus == MessageStatusType.error ? {} : { display: "none" }
          }
          onClick={this.reSendMes}
        >
          !
        </Tag>
        <span className={contentClass}> {this.getMessContentDom()}</span>
      </Popover>
    );

    let mesItemDom = null;
    let timeDome = this.props.children;

    if (!isDeviceonline) {
      if (isMyMes) {
        mesItemDom = (
          <div className="message-item send" key={this.props.keyIndex}>
            <div className="message-body">
              <div className="message-body-top">
                <br />
              </div>
              <div className="message-body-bottom">
                <span className="content-wraper">{contentDom}</span>
                {timeDome}
              </div>
              {this.props.isGroup && this.props.role == GroupMemRole.owner && isOpenRead && systemStore.isOpenGroupOwnerRead == 1 &&
                <UnReadList messageId={this.props.messages.messageId} unreadCount={this.props.unreadCount} />
              }
            </div>

            <span
              style={{
                position: "absolute",
                top: "-6px",
                width: "32px",
                right: 0,
              }}
            >
              {headeContentDom}
            </span>
          </div>
        );
      } else {
        mesItemDom = (
          <div className="message-item" key={this.props.keyIndex}>
            <span
              style={{
                position: "absolute",
                top: "-6px",
                left: "0",
                width: "32px",
              }}
            >
              {headeContentDom}
            </span>

            <div className="message-body">
              <div className="message-body-top">
                {this.props.isGroup ? (
                  <span className="name" onClick={this.mentionGroupMem}>
                    {withMarkname}
                    <span className="mention-wraper">
                      <span className="mention-but">@</span>
                    </span>
                  </span>
                ) : (
                  <br />
                )}
              </div>
              <div className="message-body-bottom">
                {contentDom}
                {timeDome}
              </div>
            </div>
          </div>
        );
      }
    }
    return (
      <div
        style={{ display: "flex" }}
        className={this.props.isMesSel ? "edit-item" : ""}
        onClick={this.mtesItemSelec}
      >
        {this.props.isMesSel && !notransmitMes ? (
          <div className="check-wrap">
            <Checkbox
              checked={
                type == MessageType.TEXT_TRANSMIT_MANY
                  ? false
                  : this.props.isCheck
              }
              disabled={type == MessageType.TEXT_TRANSMIT_MANY}
            />
          </div>
        ) : null}
        {mesItemDom}
        <Modal
          title=""
          visible={this.state.imageTextvisible}
          closable={false}
          centered={true}
          footer={
            <Button
              onClick={(e) =>
                this.setState({
                  imageTextvisible: false,
                })
              }
            >
              取消
            </Button>
          }
        >
          <iframe
            src={this.state.imageTexturl}
            style={{ height: "305px", width: "473px" }}
          ></iframe>
        </Modal>
      </div>
    );
  }
}
class WithResolveTimeMessage extends React.PureComponent<
  IMessageItemViewProps
> {
  render() {

    const props = this.props;
    let message = props.messages;
    if (message.isReadDel && message.isReadDel > 0) {
      let allTime =
        message.isReadDel >= 0
          ? Utils.getDeadLineTime(message.isReadDel).value
          : 0;
      if (!message.myReadDeadTime || !message.readDeadTime) {
        message.myReadDeadTime = webIM.getServerTime();
        message.readDeadTime = webIM.getServerTime() + allTime;
        chatStore.changeMesReadData(
          message.myReadDeadTime,
          message.readDeadTime,
          this.props.messages
        );
      }
      let readDeadTime = message.readDeadTime || 0;
      let myReadDeadTime = message.myReadDeadTime || 0;

      if (readDeadTime - webIM.getServerTime() <= 0) {
        chatStore.delMes(this.props.messages, 1, true);
        return null;
      }
      if (readDeadTime && myReadDeadTime && readDeadTime - myReadDeadTime) {
        return (
          <MessageItemView {...props}>
            <MessageTime
              endTime={readDeadTime}
              allTime={allTime}
              message={this.props.messages}
            ></MessageTime>
          </MessageItemView>
        );
      } else {
        return null;
      }
    } else {
      return <MessageItemView {...props} />;
    }
  }
}

const MessageTime: React.FunctionComponent<{
  endTime: number;
  allTime: number;
  message: MessageItem;
}> = (props) => {
  const { endTime, allTime } = props;
  const [time, setTime] = React.useState(getCurrentTime());

  const cache = React.useMemo<any>(() => ({ timer: 0 }), []);

  React.useEffect(() => {
    cache.timer = setInterval(updateTimer, 1000);
    return cleanTimer;
  }, []);
  function getCurrentTime() {
    return endTime - webIM.getServerTime();
  }

  function updateTimer() {
    let currentTime = getCurrentTime();
    let expired = currentTime < 1;
    if (expired) {
      cleanTimer();
      chatStore.delMes(props.message, 1, true);
    } else {
      setTime(currentTime);
    }
  }

  function cleanTimer() {
    clearInterval(cache.timer);
  }
  return (
    <div className="tile-dead-dom">
      <Progress
        percent={(Math.floor(time) * 100) / Math.floor(allTime)}
        strokeWidth={2}
        showInfo={false}
        strokeColor="#d6d6d6"
      />
    </div>
  );
};

export default React.memo(WithResolveTimeMessage);
