export class FriendItem {
    
    blacklist: number = 0;
    chatRecordTimeOut: number = -1;
    createTime: number = 1560161915
    fromAddType: number = 4;
    isBeenBlack: number = 0;
    lastTalkTime: number = 0;
    modifyTime: number = 1560161940;
    msgNum: number = 0;
    offlineNoPushMsg: number = 0;
    status: number = 2;
    toNickname: string = "";
    account: string = "";
    toUserId: FriendId = 10003537; //好友id
    toUserType: number = 0;
    userId: number = 10007149;
    remarkName?: string = ''

    static getFriend(_friend: Object): FriendItem {
        let friend = new FriendItem();
        for (let key in _friend) {
            friend[key] = _friend[key];
        }
        return friend;
    }
}
type FriendId = number;
export type FriendMap = Map<FriendId, FriendItem>