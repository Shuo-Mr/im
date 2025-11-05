import IMSDK from '../net/IMSDK';
import { defalutAvatorData } from '../config/imojiDataList';

export class GroupItem {
    allowConference: number = 1;
    allowHostUpdate: number = 0;
    allowInviteFriend: number = 1;
    allowSendCard: number = 1;
    allowSpeakCourse: number = 1;
    allowUploadFile: number = 1;
    areaId: number = 0;
    call: string = "300221";
    category: number = 0;
    chatRecordTimeOut: number = -1;
    cityId: number = 0;
    countryId: number = 0;
    createTime: number = 1560324079;
    desc: string = "";
    id: string = "5d00a7efd95e6310ef2fbe82";
    isAttritionNotice: number = 1;
    isLook: number = 1;
    isNeedVerify: number = 0;
    jid: string = "9ad99c4a211e4682a1624a605ed2e4ec";
    latitude: number = 0;
    longitude: number = 0;
    maxUserSize: number = 100;
    role?: number;
    // isBacklock?:boolean=false;
    // 群主and管理员列表
    member: Member;
    modifyTime: number = 1560324079;
    name: string = "kt";
    nickname: string = "888";
    notice: Notice[] = [{
        "id": "5d00a965d95e6310ef2fbf7c",
        "nickname": "888",
        "roomId": "5d00a7efd95e6310ef2fbe82",
        "text": "将时时刻刻",
        "time": 1560324453,
        "userId": 1007107
    }];
    provinceId: number = 0;
    s: number = 1;
    showMember: number = 1;
    showRead: number = 1;
    subject: string = "";
    talkTime: number = 0;
    userId: number = 1007107;
    userSize: number = 6;
    videoMeetingNo: string = "350221";

    /**所有成员列表 */
    membersInfo: Array<any> = [];
    members: Array<any> = [];

    static getGroupItem(_group: any): GroupItem {
        let group = new GroupItem();
        for (let key in _group) {
            group[key] = _group[key];
        }
        return group;
    }

    static async getAvatar(groupId: string, membersInfo: Array<any>): Promise<string> {
        if (!membersInfo) {
            return ''
        }
        return drawing(0, membersInfo) || '';
    }
}


export const testForbit = (group: GroupItem, members: any, myid: string) => {
    const isGroup = Boolean(group.jid);
    const timeTalk = group.talkTime;

    if (!isGroup) return false;
    // if(group.member  && (group.member.role == GroupMemRole.owner || group.member.role == GroupMemRole.manage)){
    //     return false
    // }
    const groupMemList = members.get(group.jid);
    let persontimeTalk;
    let role: number = GroupMemRole.member;
    if (groupMemList) {
        groupMemList.forEach((item: any) => {
            if (item.userId == myid) {
                persontimeTalk = item.talkTime;
                role = item.role;
            }
        });
    }
    if (role == GroupMemRole.owner || role == GroupMemRole.manage) return false;
    let result = (timeTalk && Number(timeTalk) > 0) || (persontimeTalk && +persontimeTalk > 0)
    return Boolean(result)
}
//群成员角色
export enum GroupMemRole {
    owner = 1, // 群主
    manage = 2, // 管理员
    member, // 成员
}

type GroupId = string;
type GroupMemberId = string;
export type GroupAllMember = Map<GroupMemberId, GroupMemItem>
export interface GroupMemItem {
    nickname: string,
    role: GroupMemRole,
    remarkName: string,
    userId: string,
    talkTime: number
}
export type GroupMemberList = Map<GroupId, GroupAllMember>
export interface GroupIsGettingData {
    [id: string]: boolean
}
export class Member {
    active: number = 1560324081;
    createTime: number = 1560324081;
    modifyTime: number = 0;
    nickname: string = "un";
    offlineNoPushMsg: number = 0;
    role: number = 3;
    sub: number = 1;
    talkTime: number = 0;
    userId: number = 1007149;
}

export class Notice {
    id: string = "5d00a965d95e6310ef2fbf7c";
    nickname: string = "888";
    roomId: string = "5d00a7efd95e6310ef2fbe82";
    text: string = "将时时刻刻";
    time: number = 1560324453;
    userId: number = 1007107;
}


export type GroupList = GroupItem[];

export enum NewFriendStatus {
    default,
    agree,
    refuse,
    reply
}


export async function drawing(n: number, data: Array<any>): Promise<string> {

    // let base64 = []; //用来装合成的图片

    let base64Str = '';

    let c = document.createElement('canvas'); //创建一个canvas

    let ctx = c.getContext('2d'); //返回一个用于在画布上绘图的2维环境

    // let len = data.length; //获取需要组合的头像图片的张数

    let a = 0; //初始化需要组合头像的长度

    let b = 0; //初始化需要组合头像的宽度

    c.width = 90; //定义canvas画布的宽度

    c.height = 90; //定义canvas画布的高度

    if (ctx) {
        ctx.rect(0, 0, c.width, c.height); //画矩形
        ctx.fillStyle = '#fff'; //设置矩形颜色
    }

    //参数n是传入的是数字，0表示画第一张图片，1表示第二张。在这里先根据不同的需求设置a,b的大小​，我在这里是4张图是极限，设置的是，n=0时a=b=40;n=1时a=150,b=40,n=2时a=40,b=150,n=3时a=b=150

    await loadImg(ctx, a, b, 10, 10, data, 0);
    try {
        base64Str += c.toDataURL("image/jpg");
    } catch (error) {
        return base64Str;
    }

    return base64Str;
}

function getImageNum(id: string) {
    const idStr = parseInt((id + '').replace(/[^\d]/g, ''));
    if (idStr === NaN) {
        return '0'
    } else {
        return (idStr % 16).toString();
    }
}
function drawGroupImage(ctx: any, dw: number, dh: number, _data: Array<any>, index: number = 0, img: any) {
    if (_data.length == 3) {
        if (index == 0) {
            ctx.drawImage(img, 22.5, 0, dw, dh);
        } else if (index == 1) {
            ctx.drawImage(img, 0, 45, dw, dh);
        } else {
            ctx.drawImage(img, 45, 45, dw, dh);
        }
    } else if (_data.length == 4) {
        ctx.drawImage(img, (index % 2) * 45, Math.floor(index / 2) * 45, dw, dh);
    } else if (_data.length == 5) {
        if (index == 0) {
            // ctx.drawImage(img, 15, 0, dw, dh);
            ctx.drawImage(img, 12.5, 20, dw, dh);
        } else if (index == 1) {
            // ctx.drawImage(img, 45, 0, dw, dh);
            ctx.drawImage(img, 60, 55, dw, dh);
        } else if (index == 2) {
            // ctx.drawImage(img, 45, 0, dw, dh);
            ctx.drawImage(img, 47.5, 20, dw, dh);
        } else {
            ctx.drawImage(img, (index % 3) * 30, Math.floor(index / 3) * 55, dw, dh);
        }
    } else if (_data.length == 6) {
        ctx.drawImage(img, (index % 2) * 45, Math.floor(index / 2) * 45, dw, dh);
    }
    else {
        ctx.drawImage(img, (index % 3) * 30, Math.floor(index / 3) * 30, 25, 25);
    }
}
export async function loadImg(ctx: any, dx: number, dy: number, dw: number, dh: number, _data: Array<any>, index: number = 0): Promise<boolean> {
    if (_data.length == 3 || _data.length == 4 || _data.length == 6) {
        // dh = 45;
        // dw = 45;
        dh = 40;
        dw = 40;
    } else if (_data.length == 5) {
        // dh = 45;
        // dw = 30;
        dh = 25;
        dw = 25;
    } else {
        // dh = 30;
        // dw = 30;
        dh = 25;
        dw = 25;
    }
    var p = _data[index] && _data[index].userId ? new Promise((r, j) => {
        let _src = IMSDK.getAvatarUrl(Number(_data[index].userId as any), false, _data); //将图片地址赋值给image对象的src
        let img = new Image();
        img.src = _src;
        img.onload = () => {
            drawGroupImage(ctx, dw, dh, _data, index, img);

            index++;
            r(true);
        };
        img.onerror = () => {
            const defaultImage = defalutAvatorData["e-" + getImageNum(String(_data[index].userId as any))];
            img.src = defaultImage;
            img.onload = () => {
                drawGroupImage(ctx, dw, dh, _data, index, img);

                index++;
                r(true);
            }
        }
    }
    ) : new Promise((r, j) => {
        index++;
        r(true);
    });

    let c = await p;

    if (c && index < 9 && index < _data.length) {
        // index ++;
        return loadImg(ctx, dx, dy, 30, 30, _data, index);
    } else {
        return false;
    }
}