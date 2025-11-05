export interface UserAdd {
    id: string,
    name: string,
    headUrl?: string
}
export type UserAddList = UserAdd[];
export interface ApplyFriendModal extends UserAdd {
    isShow: boolean
}