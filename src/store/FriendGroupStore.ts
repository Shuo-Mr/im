import { observable, action, computed } from 'mobx';
import { FriendGroupItem, FriendGroupList } from '../interface/IFriendGroup';
import imsdk from '../net/IMSDK';
import message from 'antd/es/message';
import { FriendItem } from '../interface/IFriend';
import friendStore from './FriendStore';
import systemStore from './SystemStore';

export class FriendGroupStore {
    _friendGroupList: FriendGroupList = [];
    friendGroupList = observable(this._friendGroupList);

    @computed get groupList() {
        return this.friendGroupList.slice();
    }

    // 获取某个分组下的好友列表
    getFriendsByGroupId = (groupId: string): FriendItem[] => {
        const group = this.friendGroupList.find(g => g.groupId === groupId);
        if (!group || !group.userIdList) {
            return [];
        }
        // 确保 userIdList 是数组类型
        const userIdArray = Array.isArray(group.userIdList) 
            ? group.userIdList 
            : (typeof group.userIdList === 'string' ? group.userIdList.split(',').filter(id => id.trim()) : []);
        if (userIdArray.length === 0) {
            return [];
        }
        return userIdArray
            .map(userId => friendStore.getFriendById(userId))
            .filter(friend => friend !== undefined) as FriendItem[];
    }

    @action setFriendGroupList = async () => {
        try {
            const res = await imsdk.getFriendTagsById();
            if (res && res.resultCode == 1 && res.data) {
                let groupList: FriendGroupList = [];
                if (Array.isArray(res.data)) {
                    groupList = res.data.map((item: any) => FriendGroupItem.getFriendGroup(item));
                } else if (res.data.list && Array.isArray(res.data.list)) {
                    groupList = res.data.list.map((item: any) => FriendGroupItem.getFriendGroup(item));
                }
                this.friendGroupList.replace(groupList);
                return true;
            } else {
                message.error('获取标签分组列表失败');
                return false;
            }
        } catch (error) {
            console.error('获取标签分组列表失败:', error);
            message.error('获取标签分组列表失败');
            return false;
        }
    }

    @action addFriendGroup = async (groupName: string) => {
        try {
            const res = await imsdk.addFrendTags(groupName, systemStore.userId);
            if (res && res.resultCode == 1) {
                await this.setFriendGroupList();
                message.success('添加标签分组成功');
                return true;
            } else {
                message.error((res && res.resultMsg) || '添加标签分组失败');
                return false;
            }
        } catch (error) {
            console.error('添加标签分组失败:', error);
            message.error('添加标签分组失败');
            return false;
        }
    }

    @action updateFriendGroup = async (groupId: string, groupName: string) => {
        try {
            const res = await imsdk.updateFriendGroup(groupId, groupName);
            if (res && res.resultCode == 1) {
                await this.setFriendGroupList();
                message.success('修改标签分组成功');
                return true;
            } else {
                message.error((res && res.resultMsg) || '修改标签分组失败');
                return false;
            }
        } catch (error) {
            console.error('修改标签分组失败:', error);
            message.error('修改标签分组失败');
            return false;
        }
    }

    @action deleteFriendGroup = async (groupId: string) => {
        try {
            const res = await imsdk.deleteFriendGroup(groupId);
            if (res && res.resultCode == 1) {
                await this.setFriendGroupList();
                message.success('删除标签分组成功');
                return true;
            } else {
                message.error((res && res.resultMsg) || '删除标签分组失败');
                return false;
            }
        } catch (error) {
            console.error('删除标签分组失败:', error);
            message.error('删除标签分组失败');
            return false;
        }
    }

    @action updateGroupUserList = async (groupId: string, userIdList: string[]) => {
        try {
            const userIdListStr = userIdList.join(',');
            const res = await imsdk.updateGroupUserList(groupId, userIdListStr);
            if (res && res.resultCode == 1) {
                await this.setFriendGroupList();
                message.success('更新分组用户列表成功');
                return true;
            } else {
                message.error((res && res.resultMsg) || '更新分组用户列表失败');
                return false;
            }
        } catch (error) {
            console.error('更新分组用户列表失败:', error);
            message.error('更新分组用户列表失败');
            return false;
        }
    }

    @action updateFriendGroups = async (toUserId: string, groupIdStr: string) => {
        try {
            const res = await imsdk.changeFriendTags(groupIdStr, toUserId);
            if (res && res.resultCode == 1) {
                await this.setFriendGroupList();
                message.success('更新好友标签成功');
                return true;
            } else {
                message.error((res && res.resultMsg) || '更新好友标签失败');
                return false;
            }
        } catch (error) {
            console.error('更新好友标签失败:', error);
            message.error('更新好友标签失败');
            return false;
        }
    }

    init = () => {
        this.friendGroupList.clear();
    }
}

export default new FriendGroupStore();

