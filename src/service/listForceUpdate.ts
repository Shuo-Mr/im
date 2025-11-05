//一个简单的观察者模式 包含回调的增加去除
class ListForceUpdate {
    private updateCallFunChatList: {[key:string]: Function} = {};
    chatListKey = "chatList"
    updateChatList = () => {
        if(this.updateCallFunChatList[this.chatListKey]){
            this.updateCallFunChatList[this.chatListKey]
        }else{
            console.warn('回话列表更新失败');
        }
    }
    setChatListUpdateFun = (key: string ,callBack:Function) => {
        this.updateCallFunChatList[key] = callBack
    }
    removeChatListUpdateFun = (key: string) => {
        delete this.updateCallFunChatList[key]
    }

}
export const listForceUpdate = new ListForceUpdate()