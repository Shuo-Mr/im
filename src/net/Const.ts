export class ErrorCode {
    /** 缺少访问令牌 */
    static LACK_TOKENS: number = 1030101;

    /** 访问令牌过期 */
    static EXPIRE_TOKENS: number = 1030101;

    /** 有错误信息的错误 */
    static COMMON_ERROR: number = 1010101

}

/** 对话类型 */
export const ChatType = {
    /**群聊 */
    GROUPCHAT: "groupchat",
    /**单聊 */
    CHAT: 'chat'
}

/** xmpp 链接状态 0 未开始连接 1 连接中 2 连接成功 -1 初始状态 3 安全连接断开 4 没有连接上*/
export enum XmppConnectStatus {
    INIT = -1,
    NO_CONNECT,
    CONNECTIONING,
    CONNECT_SUCCESS,
    OVER_CONNECT,
    OVER_DANGER,
}

export class MessageType {
    /**
     * 消息类型：系统广播消息
     */
    static _800: number = 800;// 系统广播
    static _801: number = 801;// 活动报名
    static _802: number = 802;// 奖励促销
    /**
     * 消息类型：群聊提示消息
     */
    static _900: number = 900;// 已进群
    static _901: number = 901;// 已退群

    /**
     * 消息类型：商务圈消息
     */
    static NEW_COMMENT: number = 600;// 新评论
    static _601: number = 601;// 新礼物
    static _602: number = 602;// 新赞
    static _603: number = 603;// 新公共消息


    /**
     * 消息类型：音视频通话 会议消息
     */
    //单聊 语音
    static VOICE_ASK: number = 100;//询问能否接听语音通话
    static VOICE_ANSWER: number = 101;//确定可以接听语音通话
    static VOICE_CONNECT: number = 102;//接听语音通话  无用
    static VOICE_CANCEL: number = 103;//拒绝取消语音拨号
    static VOICE_STOP: number = 104;//接通后结束语音通话
    //单聊视频
    static VIDEO_ASK: number = 110;//询问能否接听通话
    static VIDEO_ANSWER: number = 111;//确定可以接听通话
    static VIDEO_CONNECT: number = 112;//接听通话  无用
    static VIDEO_CANCEL: number = 113;//拒绝取消拨号
    static VIDEO_STOP: number = 114;//接通后结束通话
    //视频会议
    static Conference_VIDEO_INVITE: number = 115;//邀请进行视频会议
    static Conference_VIDEO_JOIN: number = 116;//加入视频会议
    static Conference_VIDEO_EXIT: number = 117;//退出视频会议
    static Conference_VIDEO_OUT: number = 118;//踢出视频会议
    //语音会议
    static Conference_VOICE_INVITE: number = 120;//邀请进行视频会议
    static Conference_VOICE_JOIN: number = 121;//加入视频会议
    static Conference_VOICE_EXIT: number = 122;//退出视频会议
    static Conference_VOICE_OUT: number = 123;//踢出视频会议

    /**
     * 消息类型：新朋友消息
     */
    static SAYHELLO: number = 500;// 打招呼
    static PASS: number = 501;// 同意加好友
    static FEEDBACK: number = 502;// 回话
    static NEWSEE: number = 503;// 新关注
    static DELSEE: number = 504;// 删除关注
    static DELALL: number = 505;// 彻底删除
    static RECOMMEND: number = 506;// 新推荐好友
    static BLACK: number = 507;// 黑名单
    static FRIEND: number = 508;// 直接成为好友
    static REFUSED: number = 509;//取消黑名单

    static READ: number = 26; // 是否已读的回执类型
    // static COMMENT: number = 27; // 之前  通知评论消息 改为  私人红包消息
    static PRIVATE_RED_BAGS: number = 27; //私人红包消息
    static RED: number = 28; // 红包消息

    // //////////////////////////////以上均为广播消息的类型///////////////////////////////////

    // ////////////////////////////以下为在聊天界面显示的类型/////////////////////////////////
    static TEXT: number = 1;// 文字
    static IMAGE: number = 2;// 图片
    static VOICE: number = 3;// 语音
    static LOCATION: number = 4;// 位置
    static GIF: number = 5;// gif
    static VIDEO: number = 6;// 视频
    static SIP_AUDIO: number = 7;// 音频
    static CARD: number = 8;// 名片
    static FILE: number = 9;//文件
    static TIP: number = 10;// 自己添加的消息类型,代表系统的提示
    static TRANSFERACCOUNTS: number = 29;// 转账

    static DEVICEONLINE: number = 200; //用户的其它设备上线
    static INPUT: number = 201; // 正在输入消息
    static REVOKE: number = 202;// 撤回一条消息

    static TYPE_CASH_ADVANCE_ORDER: number = 76;  //提现预下单

    static TYPE_WITHDRAWAL_SUCCESS: number = 77;  //提现成功

    static TYPE_RED_BAGES_RECEIVED: number = 78;  //红包充值到账

    static TYPE_GROUP_MESSAGE_READ: number = 79;  //群组已读消息
    static IMAGE_TEXT: number = 80; // 单条
    static IMAGE_TEXT_MANY: number = 81; //多条

    static SHARED_LINKS: number = 82;//手机端分享的连接

    static RED_BAGES: number = 83;//谁领取红包
    static Poke_A_STAMP: number = 84;//戳一戳消息

    static TEXT_TRANSMIT_MANY: number = 85; //多条消息合并转发
    static RED_BAGES_BACK: number = 86; //红包退回通知
    static TRANSFERRECEIVED: number = 88;//转账已被领取
    static TEXT_REPLY: number = 94;//回复消息
    //PINGLUN:42, // 正在输入消息
    static TYPE_SYNC_CLEAN_CHAT_HISTORY: number = 96;// 双向清除聊天记录

    static TYPE_REMOVE: number = 203; //同步删除本地消息

    static FRIENDS_COMMENTS: number = 302;//朋友圈评论

    static UGROUPSHARED_FILE: number = 401;//上传群共享文件
    static DGROUPSHARED_FILE: number = 402;//删除群共享文件
    // 群聊推送
    static CHANGE_NICK_NAME: number = 901;// 修改昵称
    static CHANGE_ROOM_NAME: number = 902;// 修改房间名
    static DELETE_ROOM: number = 903;// 删除房间
    static DELETE_MEMBER: number = 904;// 删除成员
    static NEW_NOTICE: number = 905;// 新公告
    static GAG: number = 906;// 禁言
    static NEW_MEMBER: number = 907// 增加新成员

    static TYPE_CHANGE_SHOW_READ: number = 915; // 设置群已读消息
    // static TYPE_GROUP_VERIFY: number = 916; // 群组验证消息
    static TYPE_GROUP_LOOK: number = 917; // 群组是否公开
    static TYPE_GROUP_SHOW_MEMBER: number = 918; // 群组是否显示群成员列表
    // static TYPE_GROUP_SEND_CARD: number = 919; // 群组是否允许发送名片
    // static TYPE_GROUP_ALL_SHAT_UP: number = 920; // 全体禁言/取消全体禁言
    static TYPE_GROUP_ALLOW_NORMAL_INVITE: number = 921; // 允许普通成员邀请人入群
    static TYPE_GROUP_ALLOW_NORMAL_UPLOAD: number = 922; // 允许普通成员上传群共享
    static TYPE_GROUP_ALLOW_NORMAL_CONFERENCE: number = 923; // 允许普通成员发起会议
    static TYPE_GROUP_ALLOW_NORMAL_SEND_COURSE: number = 924;// 允许普通成员发送讲课
    // static TYPE_GROUP_TRANSFER: number = 925; // 转让群组
    static BACKGROUND_LOCK: number = 931;//后台锁定，不允许任何操作

    static TYPE_GROUP_EXPLAIN: number = 934;//群说明



    //同步修改个人消息到其他端
    static MODIFY_SELF_INFO: number = 2000;



    // 群聊推送
    static MANAGE_CHANGE: number = 913// 管理员变化
    static GROUP_INVITE: number = 916// 进群验证
    static GROUP_FRIEND: number = 919// 设置群友私聊
    static GROUP_FORBIT: number = 920// 群禁言
    static GROUP_OWNER_CHANGE: number = 925// 更换群主

    //微红包
    static SMALL_RED_BAGES: number = 2011// 发红包
    static GET_SMALL_RED_BAGES: number = 2012// 领红包
    static SMALL_RED_BAGES_BACK: number = 2013//  红包退回
    //微转账
    static TYPE_CLOUD_TRANSFER: number = 2021;//微转账
    static TYPE_CLOUD_TRANSFER_RECEIVE: number = 2022;//微转账领取
    static TYPE_CLOUD_TRANSFER_RETURN: number = 2023;//微转账退回

    //同步好友信息
    /**
     * const内容为 key,value 形式 修改昵称=》nickName 修改描述 =》  describe
     */
    static MODIFY_FRIEND_INFO: number = 3000 // 修改好友信息了，需要更新一下好友信息

    static MODIFY_GROUP_DESC: number = 3001 // 修改好友信息了，需要更新一下好友信息

    static MODIFY_FRIEND_DELECT: number = 3004;  //删除好友，多端同步
    //阅后即焚
    static SNAP_CHAT: number = 9900

    //双向撤回
    static DOUBLE_WITHDRAW: number = 932 // 双向撤回
    static BLOCKED_IP: number = 516 // 禁止IP
}

/**
 * 群之类的消息
 */
export const MesaageTips: number[] = [
    MessageType.CHANGE_NICK_NAME,
    MessageType.CHANGE_ROOM_NAME,
    MessageType.DELETE_ROOM,
    MessageType.DELETE_MEMBER,
    MessageType.GAG,
    MessageType.NEW_MEMBER,
    MessageType.MANAGE_CHANGE,
    MessageType.GROUP_INVITE,
    MessageType.GROUP_FRIEND,
    MessageType.GROUP_FORBIT,
    MessageType.GROUP_OWNER_CHANGE,
    MessageType.REVOKE,
    MessageType.TYPE_GROUP_LOOK,
    MessageType.TYPE_GROUP_SHOW_MEMBER,
    MessageType.TYPE_GROUP_ALLOW_NORMAL_CONFERENCE,
    MessageType.TYPE_GROUP_ALLOW_NORMAL_SEND_COURSE,
    MessageType.TYPE_GROUP_ALLOW_NORMAL_UPLOAD,
    MessageType.TYPE_GROUP_ALLOW_NORMAL_INVITE,
    MessageType.TYPE_CHANGE_SHOW_READ,
    MessageType.NEW_NOTICE,
    MessageType.TYPE_GROUP_EXPLAIN,
    MessageType.RED_BAGES,
    MessageType.SAYHELLO,
    MessageType.BACKGROUND_LOCK,
    MessageType.UGROUPSHARED_FILE,
    MessageType.UGROUPSHARED_FILE,
    MessageType.DOUBLE_WITHDRAW,

]
//目前没做的消息类型
export const NoRenderTips: number[] = [
    MessageType.TYPE_SYNC_CLEAN_CHAT_HISTORY,
    MessageType.INPUT,
    MessageType.SAYHELLO,
    MessageType.GROUP_FRIEND,
    MessageType.RED_BAGES_BACK,
    MessageType.TRANSFERRECEIVED,
    MessageType.FRIENDS_COMMENTS,
    MessageType.VOICE_ASK,
    MessageType.VOICE_ANSWER,
    MessageType.VOICE_CONNECT,
    MessageType.VOICE_CANCEL,
    MessageType.VOICE_STOP,
    //单聊视频
    MessageType.VIDEO_ASK,
    MessageType.VIDEO_ANSWER,
    MessageType.VIDEO_CONNECT,
    MessageType.VIDEO_CANCEL,
    MessageType.VIDEO_STOP,  //视频会议
    MessageType.Conference_VIDEO_INVITE,
    MessageType.Conference_VIDEO_JOIN,
    MessageType.Conference_VIDEO_EXIT,
    MessageType.Conference_VIDEO_OUT,
    //语音会议
    MessageType.Conference_VOICE_INVITE,
    MessageType.Conference_VOICE_JOIN,
    MessageType.Conference_VOICE_EXIT,
    MessageType.Conference_VOICE_OUT,

]
export const mentionsAllKey = "id";
export const MessageTypeWithSubName = {
    [MessageType.FILE]: '收到一个文件',
    [MessageType.LOCATION]: '收到一个定位',
    [MessageType.VIDEO]: '收到一个视频',
    [MessageType.VOICE]: '收到一个语音',
    [MessageType.GIF]: '收到一个GIF图',
    [MessageType.IMAGE]: '收到一个图片',
    [MessageType.RED]: '收到红包，请在手机查看',
    [MessageType.TRANSFERACCOUNTS]: '收到一笔转账，请在手机查看',
    [MessageType.REVOKE]: '撤回一条消息',
    [MessageType.CHANGE_NICK_NAME]: '群成员更改了群昵称',
    [MessageType.CHANGE_ROOM_NAME]: '群更改名称',
    [MessageType.DELETE_ROOM]: '群组被解散',
    [MessageType.DELETE_MEMBER]: '群成员退出',
    [MessageType.NEW_NOTICE]: '有新公告',
    [MessageType.GAG]: '群成员禁言',
    [MessageType.NEW_MEMBER]: '新成员加入',
    [MessageType.MANAGE_CHANGE]: '管理员变化',
    [MessageType.GROUP_INVITE]: '更新了进群验证',
    [MessageType.GROUP_FRIEND]: '设置进群验证',
    [MessageType.GROUP_FORBIT]: '群禁言状态更新',
    [MessageType.GROUP_OWNER_CHANGE]: '群主更换',
    [MessageType.TEXT_TRANSMIT_MANY]: '转发一条消息',
    [MessageType.Poke_A_STAMP]: '收到一个窗口抖动',
    [MessageType.TYPE_GROUP_EXPLAIN]: '有新的群说明',
    [MessageType.SAYHELLO]: '新的好友',
    [MessageType.IMAGE_TEXT]: '图文',
    [MessageType.Conference_VIDEO_INVITE]: '视频会议',
    [MessageType.CARD]: '【名片】',
    [MessageType.BACKGROUND_LOCK]: '后台锁定',
    [MessageType.TYPE_CASH_ADVANCE_ORDER]:'提现预下单消息,请在手机上查看',
    [MessageType.TYPE_WITHDRAWAL_SUCCESS]:'提现成功消息,请在手机上查看',
    //红包充值到账
    [MessageType.TYPE_RED_BAGES_RECEIVED]: '红包充值到账消息,请在手机上查看',
    //微红包
    [MessageType.SMALL_RED_BAGES]: "微红包消息，请在手机上查看",
    [MessageType.GET_SMALL_RED_BAGES]: '微红包消息，请在手机上查看',
    [MessageType.SMALL_RED_BAGES_BACK]: '微红包消息，请在手机上查看',
    //微转账
    [MessageType.TYPE_CLOUD_TRANSFER]: '微转账消息，请在手机上查看',
    [MessageType.TYPE_CLOUD_TRANSFER_RECEIVE]: '微转账消息，请在手机上查看',
    [MessageType.TYPE_CLOUD_TRANSFER_RETURN]: "微转账消息，请在手机上查看",
    //私人红包
    [MessageType.PRIVATE_RED_BAGS]: "红包消息，请在手机上查看",

    //分享链接
    [MessageType.SHARED_LINKS]: '分享链接，手机端查看',
    //双向撤回
    [MessageType.DOUBLE_WITHDRAW]: '双向撤回消息',


}
//控制/配置界面显示那些功能
export const transmitMesGroupTitle = "群聊的聊天记录";
export const transmitMesTitle = "聊天记录";



/**
 * 不展示消息内容的会话项
 */
export const notShowContent = 'not_show_content_chat';


