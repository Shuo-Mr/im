import Utils from '../utils/utils';


class DataUtils {
    getLogoutTime = (): number => {
        let key = "logOutTime_";
        let value: any = localStorage.getItem(key);
        if (Utils.isNil(value)) {
            value = 0;
        } else {
            value = Number(value);
        }
        return value;
    }

    setLogoutTime = (_time: number): void => {
        let key = "logOutTime_";
        localStorage.setItem(key, _time + '');
    }


}

export class DataMap  {
    static userMap:any = {};
    static userSetting:any = {};
    static friends:any = {};
    static msgMap:any = {};
    static msgRecordList:any = {};//好友聊天记录
    static msgNum:any =  {};
    static myRooms:Array<any> = [];
    static rooms:Array<any> [];
    static allFriendsUIds:any = {}; //存放所有的好友和单向关注用户的userId    key:userId  value :userId
    static blackListUIds: any = {};  //存放已加入黑名单的userId    key:userId  value :userId
    static msgStatus: any = {}; //存方发送消息的状态   key messageId  value 1:送达 2:已读  
    static unReadMsg:any =  {}; //存放未读消息    key : 发送方的userId  value: Array[] 存放该用户的所有未读消息(保证先后顺序)
    //msgEndTime : {}, //存放消息记录的结束时间   key: 发送方的userId   value: 结束时间
    static loginData: any = null;//用户登录信息
    static deleteRooms:any =  {};//储存被踢出的群数据
    static talkTime:any =  {}; //储存我的禁言时间  key : 群的id   value: talkTime  我在该群禁言截止时间，为空则没有被禁言        
    static msgIds:Array<any> =  []; //储存消息id ，只存最近10条
    static timeSendLogMap:any =  {};//消息发送时间保存
    static readDelMap:any =  {};//好友阅后即焚 状态
    static deleteFriends:any =  {}/*删除的好友 或群组*/

}


//临时变量
export class TempGroupData {
    static user: any = null;
    static friend: any = null;
    static toJid: string = '';
    static toUserId: string = '';//临时变量
    static toNickname: string = '';
    static msgId: string = '';
    static message: string = '';
    static copyMsg: string = '';//复制的消息
    static minTimeSend: number = 0;//当前聊天好友的 历史记录 最早时间
    static file: any = null;
    //上传文件操作 标识  sendImg 发送图片 //  sendFile 发送文件  uploadFile 群文件上传 
    static uploadType: string = "sendImg";
    //弹出好友列表 标识  sendCard 发送名片  @Member @群成员
    //  forward  转发消息
    static friendListType: string = "sendCard";
    //左边菜单栏标识 当前在哪个菜单
    ////messages  聊天列表界面
    static leftTitle: string = "messages";
    //当前列表页面  列表标识  当前在哪个列表
    //messageList  聊天列表界面
    static nowList: string = "messageList";

    static roomRole: number = 3;//我在当前群组的 权限标识
    static members: any = {};//当前聊天界面的 成员集合


    static setJid = (userId: string) => {
        TempGroupData.toUserId = userId;
        TempGroupData.toJid = userId;
    }
}




export class usedGroup {
    static groupMsgReadList = {};  //用于存放群组消息已读用户列表数据 key ：msgId, value : List<user>  msgId:消息id  user:封装已读用户数据userId,nickname,timeSend 
    static groupMsgReadNum = {};   //用于存放群组消息已读数量  key :msgId   value:num 已读数量
    static msgHistory = {};  //储存用于获取聊天历史记录的数据
    static msgNumCount = 1000;  //记录用户接收到的(未读)消息数量
    static friendRelation = {}; //记录好友关系  key：userId  value： true/false  true:是好友 false:不是好友
}




export default new DataUtils();
