
// import { MessageItem } from '../interface/IChat';
// const datastore = require('nedb-promise');
// import _ from 'underscore';



// let oldDBName: string = 'message';
// let newDBName: string = 'message_copy';
// let dbName: string = oldDBName;

// let db: any = {};

// let userId: string = '';

// export async function initDB(_userId: any): Promise<any> {
//     userId = _userId;

//     console.time('init-db')

//     db[oldDBName] = datastore({ filename: userId + '_message.db', autoload: true });

//     db[oldDBName].ensureIndex({ fieldName: 'toUserId' }, function (err: any) {
//     });
//     db[oldDBName].ensureIndex({ fieldName: 'fromUserId' }, function (err: any) {
//     });
//     db[oldDBName].ensureIndex({ fieldName: 'messageId' }, (err: any) => {
//     })
//     // db[oldDBName].loadDatabase( async (err: any) => {    // 回调函数(可选)

//     let oldNum = await db[oldDBName].ccount().exec();

//     localStorage.setItem('db_userId_count_old_' + userId, oldNum + '');

//     console.log('老数据的个数---》', oldNum);

//     db[newDBName] = datastore({ filename: userId + '_test.db', autoload: true });

//     db[newDBName]['ensureIndex']({ fieldName: 'toUserId' }, function (err: any) {
//     });
//     db[newDBName]['ensureIndex']({ fieldName: 'fromUserId' }, function (err: any) {
//     });
//     db[newDBName]['ensureIndex']({ fieldName: 'messageId', unique: true, sparse: true }, (err: any) => {
//     })

//     let count: any = 0;

//     if (localStorage.getItem('db_userId_count_old_' + userId)) {
//         count = parseInt(localStorage.getItem('db_userId_count_old_' + userId) as any);
//     }


//     let skip: number = 0;
//     if (localStorage.getItem('db_userId_skip_' + userId)) {
//         skip = parseInt(localStorage.getItem('db_userId_skip_' + userId) as any);
//     }

//     if (count == skip + 1 || (skip == count && count == 0)) {
//         dbName = newDBName;
//     } else {
//         await copy(oldDBName, newDBName);
//     }


//     console.timeEnd('init-db')
// }

// async function copy(oldDBName: string, newDBName: string): Promise<any> {
//     let skip = localStorage.getItem('db_userId_skip_' + userId) || 0;

//     let count = parseInt(localStorage.getItem('db_userId_count_old' + userId) as any) || 0;

//     let oldData = await db[oldDBName].cfind({}).skip(skip).exec();

//     let copyP = oldData.map(async (item: any, index: number) => {
//         try {
//             return await db[newDBName].insert(item);
//         } catch (err) {
//             return false;
//         }

//     });
//     let allNO = await Promise.all(copyP);
//     localStorage.setItem('db_userId_skip_' + userId, allNO.length + '');
//     if (count == allNO.length) {
//         dbName = newDBName;
//     }
// }





// export async function find(data: {
//     fromUserId: string | number,
//     _sortField: string,
//     _desc: number,
//     _currentPage: number,
//     _pageNum: number,
//     isGroup: boolean,
//     myUserId: number | string,
//     startTime?: number | string,
// }): Promise<any> {

//     // 排序和分页
//     console.log('获取条件', data);

//     // const filter = data.isGroup ? [{toUserId:data.fromUserId+'',fromUserId:data.myUserId+''}]:[{ fromUserId: Number(data.fromUserId) }, { fromUserId: data.fromUserId+'' }] ;
//     // let filter: any = data.isGroup ? [{ toUserId: data.fromUserId + '', }] : [{ toUserId: data.fromUserId + '', fromUserId: data.myUserId + '' }, { toUserId: data.myUserId + '', fromUserId: data.fromUserId + '' }];
//     // if (data.startTime) {
//     //     filter = data.isGroup ? [{ toUserId: data.fromUserId + '', timeSend: { $lt: data.startTime } }] : [{ toUserId: data.fromUserId + '', fromUserId: data.myUserId + '', timeSend: { $lt: data.startTime } }, { toUserId: data.myUserId + '', fromUserId: data.fromUserId + '', timeSend: { $lt: data.startTime } }];
//     // }
//     console.log('查询条件-->', data, dbName);
//     // let fdata = await db[dbName].cfind({$or: filter }).sort({ [data._sortField]: data._desc }).skip(data._currentPage * data._pageNum).limit(data._pageNum).exec();
//     let fdata = await db[dbName].find({});
//     debugger;
//     console.time('findData')
//     const mesDataBase = _.uniq(fdata, true, (item: any) => { return item.messageId });

//     console.log('------mesDataBase-----', mesDataBase);

//     console.timeEnd('findData');
//     return mesDataBase;

// }
// /** 插入一条/多条数据 */
// export async function insertMessage(im: MessageItem[] | MessageItem): Promise<any> {
//     return new Promise((resolve, reject) => {
//         db[dbName].insert(im, function (err: Error, newDocs: any) {
//             debugger;
//             if (err) {
//                 console.log(err, '---插入失败');
//                 resolve(true)
//             } else {
//                 console.log('存储成功', im);
//                 resolve(false)
//             }
//         });
//     })
// }


// export async function updateGroupMemberNickname(fromUserId: string, from: string, fromUserName: string): Promise<any> {
//     let update = await db[dbName].update({ fromUserId, from }, { $set: { fromUserName } }, { multi: true });
//     console.log('----update----', update);
//     return update;
// }

// export async function updateReadStatus(messageId: any): Promise<any> {
//     return await db[dbName].update({ messageId }, { $set: { isRead: 1 } }, { multi: true });
// }
// export async function updateMessageVerification(msgId: string, verification: number): Promise<any> {
//     return await db[dbName].update({ messageId: msgId }, { $set: { verification } }, { multi: true });

// }

// export function delAllMessage() {
//     // db.message.remove()
// }

// export function delMessageBy(msgId: string): Promise<any> {
//     return new Promise((resolve, reject) => {
//         db[dbName].remove({
//             messageId: msgId

//         }, { multi: true }, (err: Error, numRemoved: number) => {
//             if (err) {
//                 reject(-1);
//             } else {
//                 resolve('1');
//             }
//         })
//     });
// }