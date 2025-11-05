// import Log from 'electron-log';

import { ipcMain, app, session } from 'electron';
import * as nodeStorage from 'node-localstorage';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import Utils from '../utils/utils';
import Log from 'electron-log';
// 接收标识为synchronous-message的消息，然后返回'pong'
ipcMain.on('synchronous-message', (event: any, arg: any) => {
    event.returnValue = 'pong'
})

ipcMain.on('net-config', (event: any, arg: any) => {
    const IS_DEV = process.env.NODE_ENV === 'development';
    const netUrl = IS_DEV ? path.join(app.getAppPath(), './public/netConfig.json') : path.join(app.getAppPath(), './build/netConfig.json');
    event.returnValue = fs.readFileSync(netUrl);
})

ipcMain.on('set-logout-time', (event: any, arg: any) => {
    let Days = 30;
    let exp = new Date();
    let date = exp.getTime() + Days * 24 * 60 * 60 * 1000;
    arg.expirationDate = date;

    (session.defaultSession as any).cookies.set(arg, (error: any) => {
        if (error) {
            return Promise.reject(false)
        } else {

            return Promise.resolve(true);
        }
    })
})


ipcMain.on('report-os', (event: any, arg: any) => {

    let osc = {
        '获取计算机名称： ': os.hostname(),
        '获取操作系统类型：': os.type(),
        '获取操作系统平台： ': os.platform(),
        '获取CPU架构： ': os.arch(),
        '获取操作系统版本号： ': os.release(),
        '获取系统当前运行的时间： ': os.uptime(),
        '系统总内存量： ': (os.totalmem() / 1024 / 1024 / 1024).toFixed(1) + 'G'
    }
    
    event.returnValue = osc;
})


ipcMain.on('get-logout-time', async (event: any, arg: any) => {
    let ret = await getLogoutTime(arg);

    // Log.error('取出来的时间',ret)

    event.returnValue = ret;
})

var getLogoutTime = (args: any) => {
    return new Promise(function (resolve, reject) {
        (session.defaultSession as any).cookies.get(args, (error: any, cookies: any) => {
            // Log.error(JSON.stringify(cookies),'---取得值')
            if (cookies.length > 0) {
                resolve(cookies[0]['value']);
            } else {
                resolve(cookies);
            }
        })
    })
}


var storages = {};

ipcMain.on('init-storage', (event: any, arg: any) => {
    const userPath = app.getPath('userData');
    const localStoragePath = path.join(userPath, path.sep, 'sd/') + arg.userId;
    // Log.error(localStoragePath, '----localstorage-------path', arg);
    fs.existsSync(localStoragePath) === false && mkdirs(localStoragePath);
    storages[arg.userId] = new nodeStorage.LocalStorage(localStoragePath);
});


//获取缓存数据大小
ipcMain.on('cache-size', (event: any, arg: any) => {
    const userPath = app.getPath('userData');
    const localStoragePath = path.join(userPath, path.sep, 'sd/') + arg.userId;

    // Log.error(Utils.getPathSize(localStoragePath),'-----文件大小----')
    event.returnValue = Utils.getPathSize(localStoragePath);
})

ipcMain.on('error-encrypted', (event: any, arg: any) => {
    Log.error('error-encrypted', JSON.stringify(arg));
})

ipcMain.on('message-log', (event: any, arg: any) => {
    Log.info('message-log-->', JSON.stringify(arg));
})

// arg:{userId,type}
ipcMain.on('set-localstorage', (event: any, arg: any) => {

    if (arg.userId && storages[arg.userId]) {
        storages[arg.userId].setItem(arg.userId + '_' + arg.type, JSON.stringify(arg.value));

        // console.log('set-localstorage----hahahahhahahahahah', arg, 33333333333333333333333333333)
    }
    event.returnValue = true;
})

ipcMain.on('get-localstorage', (event: any, arg: any) => {

    if (storages[arg.userId]) {
        event.returnValue = storages[arg.userId].getItem(arg.userId + '_' + arg.type);
    }
});





ipcMain.on('get-os', (event: any, arg: any) => {

    let osStr: string = os.platform();
    if (osStr == 'darwin') {
        osStr = 'mac';
    } else if (osStr == 'win32') {
        osStr = 'pc';
    } else {
        osStr = "web";
    }
    event.returnValue = osStr;
})


/**循环创建文件夹 */
var mkdirs = (dirpath: string) => {
    if (!fs.existsSync(path.dirname(dirpath))) {
        mkdirs(path.dirname(dirpath));
    }
    fs.mkdirSync(dirpath);
}

// var child_process = require('child_process');
// var child = child_process.fork(path.join(app.getAppPath(), './public/dataProcess.js'));
// child.on('message', (m:any)=>{
// console.log('message from child: ' + JSON.stringify(m));
// });
// child.send({from: 'parent'});
