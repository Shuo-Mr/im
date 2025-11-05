class ChatContentChangeCallBack {
    contentChangeCb : {[type:string]: Function | null}={};
    setChangeCallBack = (type:callBackServicetype,cb:(Function | null)) => {
        this.contentChangeCb[type] = cb
    }
    changeCallBack = (type: callBackServicetype,content: string) => {
        for(let typeI in this.contentChangeCb){
            if(type == typeI){
                const callBac = this.contentChangeCb[typeI];
                if(callBac){
                    callBac(content)
                }
            }
        }
    }
}

export const chatContentCber = new ChatContentChangeCallBack();

export enum callBackServicetype {
    chatContent = 'chatContent'
}