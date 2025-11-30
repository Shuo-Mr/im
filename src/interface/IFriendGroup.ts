export class FriendGroupItem {
    groupId: string = '';
    groupName: string = '';
    userId?: string = '';
    userIdList?: string[] | string = [];
    createTime?: number = 0;
    modifyTime?: number = 0;

    static getFriendGroup(_group: any): FriendGroupItem {
        let group = new FriendGroupItem();
        for (let key in _group) {
            group[key] = _group[key];
        }
        // 如果userIdList是字符串,转换为数组
        if (group.userIdList && typeof group.userIdList === 'string') {
            group.userIdList = (group.userIdList as string).split(',').filter(id => id.trim());
        }
        return group;
    }
}

export type FriendGroupList = FriendGroupItem[];

