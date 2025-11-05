import { MessageItem } from "../interface/IChat";
import webIM from '../net/WebIM';
import { MessageType } from '../net/Const';

type MesData = Map<String, MessageItem[]>;
class DbCacheData {
    mesDataMap: MesData = new Map();

    userId: string = '';

    setUserId = (userId: string) => {
        this.userId = userId;
    }
    insetDbData = (mesData: MesData) => {
        this.mesDataMap = mesData;
    }
    //过滤消息id map
    mesKeyListMap = {};
    setMeslistByChatId = (chatId: string, mesList: MessageItem[]) => {
        let _mesList: MessageItem[] = [];
        mesList.forEach(item => {
            if (!this.mesKeyListMap[item.messageId + '']) {
                _mesList.push(item);
                this.mesKeyListMap[item.messageId + ''] = true;
            }
        })
        this.mesDataMap.set(chatId + '', _mesList);
    }
    private getMesListByChatid = (chatId: string) => {
        return this.mesDataMap.get(chatId + '');
    }
    getMesListByChatIdWithPage = (chatId: string, offset: number, limit: number = 30) => {
        let targetMesList = this.getMesListByChatid(chatId + '');
        if (targetMesList && targetMesList.length > 0) {
            if (!offset) {
                return targetMesList.slice(0, limit);
            } else {
                const listMes = targetMesList.slice(offset, offset + limit);
                return listMes;
            }
        }
        return [];
    }
    deleteMes = (mes: MessageItem, chatId?: string) => {
        let _chatId = chatId;
        let mesId = mes.messageId;
        if (!_chatId) {
            _chatId = this.getChatIdByMes(mes);
        }
        let targetMesList = this.getMesListByChatid(_chatId + '');
        // console.log('删除消息开始',targetMesList,mes);
        if (targetMesList) {
            const oldNumber = targetMesList.length;
            targetMesList = targetMesList.filter(mesItem => {
                if (mes.type == 202 && mes.content && mesItem.messageId != mesId) {
                    return mesItem.messageId != mes.content
                }
                return mesItem.messageId != mesId
            });
            this.mesDataMap.set(_chatId + '', targetMesList);
            // console.log('删除消息结束',targetMesList,this.getMesListByChatid(_chatId + ''));
            if (oldNumber > targetMesList.length) {
                return true
            }
        }
        return false
    }
    delMessByChatId = (chatId: string) => {
        if (this.mesDataMap.get(chatId + '')) {
            this.mesDataMap.delete(chatId + '');
        }
    }
    updateMes = (mes: MessageItem, chatId?: string) => {
        let _chatId = chatId;
        let mesId = mes.messageId;
        if (!_chatId) {
            _chatId = this.getChatIdByMes(mes);
        }
        let targetMesList = this.getMesListByChatid(_chatId + '');
        if (targetMesList) {
            const targetIndex = targetMesList.findIndex(mes => {
                return mes.messageId != mesId
            });
            if (targetIndex > -1) {
                targetMesList[targetIndex] = mes;
                this.mesDataMap.set(chatId + '', targetMesList);
                return true;
            }
        }
        return false
    }
    getChatIdByMes = (mes: MessageItem) => {
        let _chatId = '';
        // 创建群特殊处理一下，此处消息类型为个人，而且为touserid 为接收方
        if (mes.type == MessageType.NEW_MEMBER && mes.objectId) {
            _chatId = mes.objectId + ''
        } else if (mes.chatType == webIM.GROUPCHAT) {
            _chatId = mes.toUserId || mes.roomJid + '';
        } else if (mes.toUserId == this.userId) {
            _chatId = mes.fromUserId;
        } else {
            _chatId = mes.toUserId;
        };
        return _chatId + ''
    }


    clearDateSize = () => {
        // let keysMapMes = Object.keys(this.mesKeyListMap);

        // if (keysMapMes.length > 100) {
        //     for (let i = 100; i < keysMapMes.length; i++) {
        //         delete this.mesKeyListMap[i];
        //     }
        // }
        Array.from(this.mesDataMap.keys()).map(chatId => {
            let mesList = this.mesDataMap.get(chatId + '');
            if (Array.isArray(mesList) && mesList.length > 100) {
                let deleteMs = mesList.slice(100, -1);
                deleteMs.map(item => {
                    delete this.mesKeyListMap[item.messageId];
                })

                mesList = mesList.slice(0, 100);
                this.mesDataMap.set(chatId + '', mesList);
            }
        });
    }
    timerClear: NodeJS.Timeout
    startDataTest = () => {
        let time = 5 * 60 * 1000;
        this.timerClear = setInterval(this.clearDateSize, time);
        return this.timerClear
    }
    addmes = (mes: MessageItem, chatId?: string, isoldMes?: boolean) => {
        // console.log('存储消息2222',JSON.stringify(mes));
        if (mes.type == 26 || mes.type == 200) {
            return;
        }
        if (!this.mesKeyListMap[mes.messageId + '']) {
            // console.log('数据库增加消息', mes.content,isoldMes);
            this.mesKeyListMap[mes.messageId + ''] = true;
            let _chatId = chatId ? chatId + '' : '';
            if (!_chatId) {
                _chatId = this.getChatIdByMes(mes);
            }
            if (!_chatId) {
                console.error('存储消息,获取会话id失败', _chatId, mes)
                return;
            }
            let targetMesList = this.getMesListByChatid(_chatId + '');
            if (targetMesList) {
                if (targetMesList.length > 300) {
                    targetMesList = targetMesList.slice(0, 300);
                }
                if (isoldMes) {
                    targetMesList.push(mes);
                    // this.insertByTime(mes, targetMesList);
                } else {
                    const tIndex = this.getMesPositionIndex(mes, targetMesList);
                    if (tIndex > -1) {
                        targetMesList.splice(tIndex, 0, mes);
                    } else {
                        targetMesList.unshift(mes);
                    }
                }
                this.mesDataMap.set(_chatId, targetMesList);
            } else {
                this.mesDataMap.set(_chatId, [mes]);
            }
            // console.log('本地内存增加消息', mes.content,this.mesDataMap.get(_chatId+''));
        }
    }


    getMesPositionIndex = (mes: MessageItem, mesList: MessageItem[]) => {
        const mesLen = Array.isArray(mesList) ? mesList.length : 0;
        let _tIndex = -1;
        if (mesLen > 0) {
            for (let index: number = 0; index < mesLen; index++) {
                if (mes.timeSend > mesList[index].timeSend) {
                    _tIndex = index;
                    break;
                }
            }
        }
        return _tIndex
    }
    resetData = () => {
        this.mesDataMap = new Map();
        this.mesKeyListMap = {};
    }
    clearDataCache = () => {
        if (this.mesDataMap) {
            this.mesDataMap.clear();
        }
    }
}


export const mesDataCache = new DbCacheData();
global['mesDataCache'] = mesDataCache;