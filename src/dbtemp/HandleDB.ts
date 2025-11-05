import { MessageItem } from '../interface/IChat';
import _ from 'underscore';

const Datastore = require('nedb');

const util = require('util');


let db: any = {};

let userId: any = '';

// let oldDBName: string = 'message';
let newDBName: string = 'message_copy';
let dbName: string = newDBName;

// let pupdate :any;
Datastore.prototype.countp = util.promisify(Datastore.prototype.count);
Datastore.prototype.findp = util.promisify(Datastore.prototype.find);
Datastore.prototype.insertp = util.promisify(Datastore.prototype.insert);
Datastore.prototype.updatep = util.promisify(Datastore.prototype.update);
Datastore.prototype.ensureIndexp = util.promisify(Datastore.prototype.ensureIndex);


export async function initDB(_userId: any): Promise<any> {
    userId = _userId;
    console.time('初始化数据库');
    // db[oldDBName] = new Datastore({ filename: userId + '_message.db', autoload: true });

    // let db_userId_count_old = await db[oldDBName].countp({});
    // localStorage.setItem('db_userId_count_old' + userId, db_userId_count_old + '');

    db[newDBName] = new Datastore({ filename: userId + '_ws.db', autoload: true });
    await db[newDBName].ensureIndex({ fieldName: 'toUserId' });
    await db[newDBName].ensureIndex({ fieldName: 'fromUserId' });
    await db[newDBName].ensureIndex({ fieldName: 'messageId', unique: true, sparse: true });


    //如果老数据的长度为 0 不用弹出更新提示框

    // let db_userId_count_new = await db[newDBName].countp({});
    // try {
    //     if (db_userId_count_old == 0 || db_userId_count_new != 0) {
    //         dbName = newDBName;
    //     } else {
    //         console.time('拷贝时间');
    //         await copy(oldDBName, newDBName);
    //         console.timeEnd('拷贝时间');
    //     }
    //     console.timeEnd('初始化数据库');
    //     return true;
    // } catch (err) {
    dbName = newDBName;
    //     return true;
    // }
    // if (db_userId_count_old == 0 || db_userId_count_new != 0) {
    //     dbName = newDBName;
    // } else {
    //     console.time('拷贝时间');
    //     await copy(oldDBName, newDBName);
    //     console.timeEnd('拷贝时间');
    // }
    // console.timeEnd('初始化数据库');
    // return true;
}


export async function copy(oldDBName: string, newDbName: string): Promise<any> {

    return new Promise((resolve, reject) => {
        db[oldDBName].find({}).skip(0).exec(async (error: Error, docs: any) => {
            console.log('--去重条数------', docs.length);
            console.time('去重时间');
            let d = _.uniq(docs, true, (item: any) => { return item.messageId })
            console.timeEnd('去重时间');

            console.time('插入时间');
            let pdata = await db[newDbName].insertp(d);
            console.timeEnd('插入时间');
            resolve(pdata);
        })
    })

}

export function resetDB(): Promise<boolean> {
    return new Promise((resolve, reject) => {
        db[dbName].remove({}, { multi: true }, function (err: Error, numRemoved: number) {
            if (err) {
                resolve(false);
                console.log(err);

            } else {
                resolve(true);
            }

        });
    })
}


export function find(data: {
    fromUserId: string | number,
    _sortField: string,
    _desc: number,
    _currentPage: number,
    _pageNum: number,
    isGroup: boolean,
    myUserId: number | string,
    startTime?: number | string,
}): Promise<any> {

    // 排序和分页
    return new Promise((r, j) => {
        // const filter = data.isGroup ? [{toUserId:data.fromUserId+'',fromUserId:data.myUserId+''}]:[{ fromUserId: Number(data.fromUserId) }, { fromUserId: data.fromUserId+'' }] ;
        const filter = data.isGroup ? [{ toUserId: data.fromUserId + '' }] : [{ toUserId: data.fromUserId + '', fromUserId: data.myUserId + '' }, { toUserId: data.myUserId + '', fromUserId: data.fromUserId + '' }];
        let timeFilter = {};
        if (data.startTime) {
            timeFilter = {
                "timeSend": { $lt: data.startTime }
            }
        }
        db[dbName].find({ $or: filter, ...timeFilter }).sort({ [data._sortField]: data._desc }).skip(data._currentPage * data._pageNum).limit(data._pageNum).exec((error: Error, docs: any) => {
            if (error) {
                r([]);
            } else {
                // console.time('findData')
                const mesDataBase = _.uniq(docs, true, (item: any) => { return item.messageId })
                r(mesDataBase);
                // console.timeEnd('findData');
            }
        })
    })
}
/** 插入一条/多条数据 */
export function insertMessage(im: MessageItem): Promise<any> {
    if (im.type == 26 || im.type == 200) {
        return Promise.resolve(true);
    }
    return new Promise((resolve, reject) => {

        db[dbName].update({ messageId: im.messageId }, { $set: { ...im } }, { upsert: true }, function (err: Error, newDocs: any) {
            if (err) {
                // resolve(true)
            } else {
                reject(true);
            }
        })
    })
}


export function updateGroupMemberNickname(fromUserId: string, from: string, fromUserName: string): Promise<any> {
    return new Promise((resolve, reject) => {
        db[dbName].update({ fromUserId, from }, { $set: { fromUserName } }, { multi: true }, (error: any, numReplaced: any) => {
            // console.log('一共更新了多少条',numReplaced);
        })
    });
}


export function updateReadStatus(messageId: any): Promise<any> {

    return new Promise((resolve, reject) => {
        db[dbName].update({ messageId }, { $set: { isRead: 1 } }, { multi: true }, (error: any, numReplaced: any) => {
            // console.log('一共更新了多少条',numReplaced);
        })
    });
}
export function updateMessageVerification(msgId: string, verification: number): Promise<any> {
    return new Promise((resolve, reject) => {
        db[dbName].update({ messageId: msgId }, { $set: { verification } }, { multi: true }, (error: any, numReplaced: any) => {
            console.log('一共更新了多少条', numReplaced, msgId)
            if (error) {
                reject(-1);
            } else {
                resolve('1');
            }
        })

    })
}

export function delAllMessage() {
    // db.message.remove()
}

export function delMessageBy(msgId: string): Promise<any> {
    return new Promise((resolve, reject) => {
        db[dbName].remove({
            messageId: msgId

        }, { multi: true }, (err: Error, numRemoved: number) => {
            if (err) {
                reject(-1);
            } else {
                resolve('1');
            }
        })
    });
}
export function delMessageByChatId(chatId: string): Promise<any> {
    const filter = [{ toUserId: chatId + '' }, { fromUserId: chatId + '' }];
    return new Promise((resolve, reject) => {
        db[dbName].remove(filter, { multi: true }, (err: Error, numRemoved: number) => {
            if (err) {
                reject(-1);
            } else {
                resolve('1');
            }
        })
    });
}