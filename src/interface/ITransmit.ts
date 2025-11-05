import { ChatItem } from './IChat';
import { GroupItem } from './IGroup';
import { FriendItem } from './IFriend';

export enum SelectType {
	chat,
	friend,
	group
}

type SelectParend = ChatItem | GroupItem | FriendItem;
export type SelectItemType = { 
    transmitType: SelectType ,
    data: SelectParend
}