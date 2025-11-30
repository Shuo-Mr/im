const path = require('path');

import Log from 'electron-log';
import { startScreenshot } from './screeshot';
import fs from 'fs';

import * as url from 'url'
import './ipcMain';
import { app, BrowserWindow, Menu, ipcMain, Tray, Notification, crashReporter } from 'electron';
import { mainBugly } from './mainBugly';
import { isAutoUpdate, apiUrl } from '../config/SystemConfig';
// import systemStore from '../store/SystemStore';
// import { observerServices } from '../service/obsService';
// import utils from '../utils/utils'
const semver = require('semver');

const YAML = require('yamljs');;

import http from 'http'
import https from 'https'
// const { execFile } = require('child_process');




const { autoUpdater } = require('electron-updater');


let sendUpdateMessage = (message: any, data?: any) => {
  win && win.webContents && win.webContents.send('message', { message, data });
};
crashReporter.start({
  productName: 'Tigase',
  companyName: 'Tigase',
  submitURL: 'https://your-domain.com/url-to-submit',
  uploadToServer: false
})
var getRemoteLog = async (_baseUrl: string, _platform: string) => {
  let vurl = _baseUrl + `/updatelog.txt`;
  let ret = await getRemote(vurl);
  if (ret != '') {
    return ret
  } else {
    return '更新日志未更新';
  }
}
var getRemotVersion = async (_baseUrl: string, _platform: string) => {
  let appUrl: string = _platform == 'darwin' ? '-mac' : '';
  let vurl = _baseUrl + `/latest${appUrl}.yml`;
  let ret = await getRemote(vurl);
  if (ret != '') {
    const parsedData = YAML.parse(ret);
    return parsedData.version
  } else {
    return '';
  }

  // return new Promise((resolve, reject) => {
  //   let appUrl: string = _platform == 'darwin' ? '-mac' : '';
  //   http.get(_baseUrl + `/latest${appUrl}.yml`, (res) => {
  //     const { statusCode } = res;

  //     let error;
  //     if (statusCode !== 200) {
  //       error = new Error('请求失败\n' +
  //         `状态码: ${statusCode}`);
  //     }
  //     if (error) {
  //       res.resume();
  //       console.log(error)
  //       resolve('0.0.1');
  //       // reject(error);
  //     }

  //     // res.setEncoding('utf8');
  //     let rawData = '';
  //     res.on('data', (chunk) => { rawData += chunk; });
  //     res.on('end', () => {
  //       try {
  //         const parsedData = YAML.parse(rawData);
  //         resolve(parsedData.version)
  //       } catch (e) {
  //         console.log(e)
  //         resolve('0.0.1');
  //         // reject(e);
  //       }
  //     });
  //   }).on('error', (e) => {
  //     console.log(e)
  //     // reject(e);
  //     resolve('0.0.1');
  //   });
  // })

}

var getRemote = (_baseUrl: string) => {
  return new Promise((resolve, reject) => {
    const req = [ http, https ]
    let index = _baseUrl.includes('https:') ? 1 : 0
    req[index].get(_baseUrl, (res) => {
      const { statusCode } = res;

      let error;
      if (statusCode !== 200) {
        error = new Error('请求失败\n' +
          `状态码: ${statusCode}`);
      }
      if (error) {
        res.resume();
        // console.log(error)
        resolve('');
        // reject(error);
      }

      // res.setEncoding('utf8');
      let rawData = '';
      res.on('data', (chunk) => { rawData += chunk; });
      res.on('end', () => {
        try {
          // const parsedData = YAML.parse(rawData);
          resolve(rawData)
        } catch (e) {
          resolve('');
          // reject(e);
        }
      });
    }).on('error', (e) => {
      // reject(e);
      resolve('');
    });
  })

}


/**
 * 注册键盘快捷键
 * 其中：label: '切换开发者工具',这个可以在发布时注释掉
 */
let template = [
  {
    label: '操作',
    submenu: [{
      label: '复制',
      accelerator: 'CmdOrCtrl+C',
      role: 'copy'
    }, {
      label: '剪切',
      accelerator: 'CmdOrCtrl+X',
      role: 'cut'
    }, {
      label: '粘贴',
      accelerator: 'CmdOrCtrl+V',
      role: 'paste'
    }, {
      label: '全选',
      accelerator: 'CmdOrCtrl+A',
      role: 'selectall'
    }]
  },
  {
    label: '窗口',
    role: 'window',
    submenu: [{
      label: '最小化',
      accelerator: 'CmdOrCtrl+M',
      role: 'minimize'
    }, {
      label: '关闭',
      accelerator: 'CmdOrCtrl+W',
      role: 'close'
    }, {
      type: 'separator'
    }]
  }
]
const IS_DEV = process.env.NODE_ENV === 'development';

// const packages = IS_DEV ? fs.readFileSync(path.join(app.getAppPath(), './package.json')) : fs.readFileSync(path.join(app.getAppPath(), './build/package.json'));



const trayUrl = IS_DEV ? path.join(app.getAppPath(), './public/stay.png') : path.join(app.getAppPath(), './build/stay.png');
const iconPath = IS_DEV ? path.join(app.getAppPath(), './public/logo.png') : path.join(app.getAppPath(), './build/logo.png');
const iconPathEmpty = IS_DEV ? path.join(app.getAppPath(), './public/logo_empty.png') : path.join(app.getAppPath(), './build/logo_empty.png');
const uploadUrl = IS_DEV ? path.join(app.getAppPath(), './public/upload.txt') : path.join(app.getAppPath(), './build/upload.txt');

var writeUpllogs = (content: string) => {
  fs.writeFileSync(uploadUrl, content, { encoding: 'utf8', mode: 438 /*=0666*/, flag: 'a' })
}

// 保持一个对于 window 对象的全局引用，如果你不这样做，
// 当 JavaScript 对象被垃圾回收， window 会被自动地关闭
var win: BrowserWindow;

function createWindow() {

  const menu = Menu.buildFromTemplate(template as any)
  Menu.setApplicationMenu(menu) // 设置菜单部分

  const preloadJs = IS_DEV ? path.join(app.getAppPath(), './public/proload.js') : path.join(app.getAppPath(), './build/proload.js');


  // 创建浏览器窗口。
  win = new BrowserWindow({
    height: 700,
    //禁用跨域检查
    width: 1000,
    minHeight: 600,
    minWidth: 380,
    autoHideMenuBar: true,
    fullscreenable: false,
    frame: false,
    webPreferences: {
      javascript: true,
      plugins: true,
      nodeIntegration: true, // 不集成 Nodejs
      webSecurity: false,
      preload: preloadJs// 但预加载的 js 文件内仍可以使用 Nodejs 的 API
    },
    show: false,
    transparent: true,
    titleBarStyle: 'customButtonsOnHover',
  })

  // 调试模式
  win.webContents.openDevTools({mode:'right'})



  // 加载应用
  const staticIndexPath = path.join(app.getAppPath(), './build/index.html');


  const main = IS_DEV ? `http://localhost:3000` : url.format({
    pathname: staticIndexPath,
    protocol: 'file',
    slashes: true
  });

  win.showInactive();
  win.loadURL(main);
  // F12 调试窗口
  // win.webContents.openDevTools();
  if (IS_DEV) {
    
  }

  win.on('focus', (e: Event) => {
    win && (win as BrowserWindow).webContents.send('windowFocus');
  })

  win.on('minimize', (e: Event) => {
    win && (win as BrowserWindow).webContents.send('windowMinimize');
  })




  win.on('close', (e: Event) => {
    e.preventDefault();
    win && (win as BrowserWindow).webContents.send('want-close-custom');
  });
  // win.webContents.onbeforeunload = () =>{
  //   Log.error('-----onbeforeunload-------2');
  // }
  // win.on('be')
  // 打开开发者工具。
    

  // 当 window 被关闭，这个事件会被触发。
  win.on('closed', () => {
    // 取消引用 window 对象，如果你的应用支持多窗口的话，
    // 通常会把多个 window 对象存放在一个数组里面，
    // 与此同时，你应该删除相应的元素。

    win && win.destroy();
    (win as any) = null;
  })

  createTray();
  mainBugly();
}

let fromUpdate: string = ''
let timeout: any;

ipcMain.on('devtools', (e: Event) => {
  // win.webContents.openDevTools();
})

//检测是否写入上传日志
ipcMain.on('writeLogs', (event: any, _data: any) => {
  //写入数据
  writeUpllogs(_data)
  //判断文件大小
  fs.stat("./upload.txt", function (err, stats) {
    // console.log(stats.size, '文件大小')
    // writeUpllogs("该文件大小1048576：" + stats.size)
    if (stats.size > 524288) {
      const data = fs.readFileSync('./upload.txt', 'utf-8') //utf-8 字符编码

      event.sender.send('uploadLogs', data);
      //
      // observerServices.uploadFile(file, systemStore.uploadUrl);
      // console.log(file,observerServices)
    }
  })
})
//检测是否开启截屏功能
ipcMain.on('openScreeshot', startScreenshot);

//开始检测是否可以更新
ipcMain.on('openCheckRemote', (_args: any, _data: any) => {

  if (!isAutoUpdate) {
    return;
  }

  fromUpdate = _data;
  console.log('openCheckRemote----', fromUpdate);

  Promise.all([getRemoteLog(feedUrl, process.platform),
  getRemotVersion(feedUrl, process.platform)]).then(results => {
    if (results[1] != '') {
      try {
        let cv = app.getVersion();
        let compare = semver.compare(results[1], cv)
        if (compare == 1) {
          sendUpdateMessage('isCanUpdate', { updateLog: results[0], updateTitle: `### 当前版本:${cv},最新版本:${results[1]}` });
        } else if (compare == 0) {
          if (_data && _data == 'checkUpdate') {
            sendUpdateMessage('checkUpdate');
          }
        }
      } catch (e) {
        console.log(e)
      }
    }
  });

})

ipcMain.on('force-close', (event: any, arg: any) => {

  if (arg) {
    Log.error(JSON.stringify(arg));
  }

  timeout = setTimeout(() => {
    win.destroy();
    (win as any) = null;
    app.quit();
    clearTimeout(timeout);
    timeout = 0;
  }, 100)

})
// Electron 会在初始化后并准备
// 创建浏览器窗口时，调用这个函数。
// 部分 API 在 ready 事件触发后才能使用。
app.on('ready', createWindow)

// 当全部窗口关闭时退出。
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})


app.on('activate', () => {
  if (win === null) {
    createWindow()
  }
})


/**
* 增加更新相关的菜单选项
*/
function addUpdateMenuItems(items: any, position: any) {

}



// 针对Mac端的一些配置
if (process.platform === 'darwin') {
  const name = app.getName()
  template.unshift({
    label: name,
    submenu: [{ role: 'about' }, {
      label: 'Quit ( 退出 )',
      accelerator: 'Command+Q',
      click: () => {
        app.quit();
      }
    } as any]
  })
}

// 针对Windows端的一些配置
if (process.platform === 'win32') {
  const helpMenu = template[template.length - 1].submenu
  addUpdateMenuItems(helpMenu, 0)
}


var tray: Tray;

function createTray() {

  tray = new Tray(trayUrl);

  const contextMenu = Menu.buildFromTemplate([
    getShowWindowMenuItem(),
    getQuitMenuItem()
  ]);

  tray.setToolTip(`沟通 v${app.getVersion()}`);
  tray.setContextMenu(contextMenu);
  tray.on('double-click', () => {
    if (win) {
      showWindow();
    }
  });
  // let partial :Partial<any> = {tray} ;

  // const mb = ElectronEenubar.menubar({ tray, tooltip: '商旅通Pro', showDockIcon: true });
  // mb.on('ready', () => {
  //   Log.error('Menubar app is ready.', url);
  // });
}

function getShowWindowMenuItem(): Electron.MenuItemConstructorOptions {
  return {
    label: "显示窗口",
    type: "normal",
    click: () => {
      showWindow();
    }
  };
}

function getQuitMenuItem(): Electron.MenuItemConstructorOptions {
  return {
    label: '退出',
    type: "normal",
    click: () => {
      win && (win as BrowserWindow).webContents.send('want-close-custom');
      // mainWindow.close();
      // app.quit();
    }
  };
}

function showWindow() {
  if ((process.platform === 'darwin')) {
    app.dock.show();
  }
  const allWindows = BrowserWindow.getAllWindows();

  allWindows.forEach((w) => {
    if (w.isMinimized()) w.restore();
    w.show();
  });
}

var timerFlash: any;
function startTrayFlash() {
  if (!tray || timerFlash) {
    return
  }
  let count = 0;
  timerFlash = setInterval(function () {
    count++;
    if (count % 2 == 0) {
      tray.setImage(trayUrl)
    } else {
      tray.setImage(iconPathEmpty)
    }
  },
    500);
}


function stopTrayFlash() {
  tray && tray.setImage(path.join(app.getAppPath(), "./out/logo.png"))
  timerFlash && clearInterval(timerFlash);
  timerFlash = null
}

function showMessageNotification(arg: any) {
  if (process.platform !== 'darwin') {
    if (tray && !tray.isDestroyed()) {
      let title = "沟通";
      if (arg.title) {
        title = arg.title;
      }
      tray.displayBalloon({
        icon: iconPath,
        title: title,
        content: arg.body
      });
      tray.once('click', () => {
        if (win) {
          win.show();
        }
      });
    }
  } else {
    let noti = new Notification(arg);
    noti.once('click', () => {
      if (win) {
        win.show();
      }
    })
    noti.show();
  }
}
ipcMain.on('startTrayFlash', (event: any, arg: any) => startTrayFlash());

ipcMain.on('stopTrayFlash', (event: any, arg: any) => stopTrayFlash());

ipcMain.on('showMessageNotification', (event: any, arg: any) => showMessageNotification(arg));



ipcMain.on('notifyUpdate', () => {
  // console.log('检测本地更新------->');
  checkForUpdates();
});

//登录窗口最小化
ipcMain.on('window-min', function () {
  win && win.minimize();
})

let max: boolean = false;
//登录窗口最大化
ipcMain.on('window-max', function () {
  if (win && max) {
    max = false;
    win && win.unmaximize();
  } else {
    max = true;
    win && win.maximize();
  }
});

ipcMain.on('window-close', function () {
  win && (win as BrowserWindow).webContents.send('want-close-custom');
})

// const feedUrl = utils.apiJudge(apiUrl) ? 'http://api.' + apiUrl : 'http://' + apiUrl + `:8083/pc-update/${process.platform}`;
const feedUrl = apiUrl;


let checkForUpdates = () => {
  autoUpdater.setFeedURL(feedUrl);

  // console.log('---------------------------');

  autoUpdater.on('error', function (ev: any, err: any) {
    // console.log('error', ev, err);

    Log.error(ev, err, '-----error update auto updater');

    sendUpdateMessage('error', err)
  });
  autoUpdater.on('checking-for-update', function (message: any) {
    // console.log('checking-for-update', message);
  });
  autoUpdater.on('update-available', function (message: any) {
    // console.log('update-available', message)
    sendUpdateMessage('update-available', message)
  });
  autoUpdater.on('update-not-available', function (message: any) {
    // console.log('update-not-available', message)
    sendUpdateMessage('update-not-available', message)
  });

  // 更新下载进度事件
  autoUpdater.on('download-progress', function (progressObj: any) {
    // console.log('ownload-progress', progressObj)
    // console.log(progressObj, '------666666=--------');

    sendUpdateMessage('downloadProgress', progressObj)
  })
  autoUpdater.on('update-downloaded', function (event: any, releaseNotes: any, releaseName: any, releaseDate: any, updateUrl: any, quitAndUpdate: any) {
    ipcMain.on('updateNow', (e: any, arg: any) => {
      autoUpdater.quitAndInstall();
    })

    Log.error(event, releaseNotes, releaseName, releaseDate, updateUrl, quitAndUpdate, '-----update-downloaded');
    sendUpdateMessage('isUpdateNow');
  });

  //执行自动更新检查
  autoUpdater.checkForUpdates();
};

