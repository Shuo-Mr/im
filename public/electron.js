const { app, BrowserWindow, Menu } = require('electron')
const path = require('path')
const url = require('url');

require("./main/ipcMain");
// const log = require('../src/dbtemp/Log');


// console.log(log ,'------')

const IS_DEV = process.env.NODE_ENV === 'development';


// 保持一个对于 window 对象的全局引用，如果你不这样做，
// 当 JavaScript 对象被垃圾回收， window 会被自动地关闭
let win

function createWindow() {
  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu) // 设置菜单部分

  console.log(path.join(__dirname, './renderer.js'),'------')

  // 创建浏览器窗口。
  win = new BrowserWindow({
    height: 700,
    //禁用跨域检查
    webPreferences: {
      webSecurity: false
    },
    width: 1000,
    autoHideMenuBar: true,
    fullscreenable: false,
    webPreferences: {
        javascript: true,
        plugins: true,
        nodeIntegration: false, // 不集成 Nodejs
        webSecurity: false,
        preload: path.join(__dirname, './renderer.js') // 但预加载的 js 文件内仍可以使用 Nodejs 的 API
    }
  })

  // 加载应用
  const staticIndexPath = path.join(__dirname, './index.html');

  console.log('staticIndexPath--',staticIndexPath);
  const main = IS_DEV ? `http://localhost:3000/` : url.format({
    pathname: staticIndexPath,
    protocol: 'file',
    slashes: true
  });
  win.loadURL(`http://localhost:3000`);
  //win.webContents.openDevTools();

  // 打开开发者工具。
   //  win.webContents.openDevTools();

  // 当 window 被关闭，这个事件会被触发。
  win.on('closed', () => {
    // 取消引用 window 对象，如果你的应用支持多窗口的话，
    // 通常会把多个 window 对象存放在一个数组里面，
    // 与此同时，你应该删除相应的元素。
    win = null
  })
}

// Electron 会在初始化后并准备
// 创建浏览器窗口时，调用这个函数。
// 部分 API 在 ready 事件触发后才能使用。
app.on('ready', createWindow)

// 当全部窗口关闭时退出。
app.on('window-all-closed', () => {
  // 在 macOS 上，除非用户用 Cmd + Q 确定地退出，
  // 否则绝大部分应用及其菜单栏会保持激活。
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // 在macOS上，当单击dock图标并且没有其他窗口打开时，
  // 通常在应用程序中重新创建一个窗口。
  if (win === null) {
    createWindow()
  }
})

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
      label: '粘贴',
      accelerator: 'CmdOrCtrl+V',
      role: 'paste'
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

/**
* 增加更新相关的菜单选项
*/
function addUpdateMenuItems(items, position) {

}

function findReopenMenuItem() {
  const menu = Menu.getApplicationMenu()
  if (!menu) return

  let reopenMenuItem
  menu.items.forEach(function (item) {
    if (item.submenu) {
      item.submenu.items.forEach(function (item) {
        if (item.key === 'reopenMenuItem') {
          reopenMenuItem = item
        }
      })
    }
  })
  return reopenMenuItem
}

// 针对Mac端的一些配置
if (process.platform === 'darwin') {
  const name = app.getName()
  template.unshift({
    label: name,
    submenu: [{
      label: 'Quit ( 退出 )',
      accelerator: 'Command+Q',
      click: function () {
        app.quit()
      }
    }]
  })

  // Window menu.
  // template[3].submenu.push({
  //     type: 'separator'
  // }, {
  //     label: 'Bring All to Front',
  //     role: 'front'
  // })

  addUpdateMenuItems(template[0].submenu, 1)
}

// 针对Windows端的一些配置
if (process.platform === 'win32') {
  const helpMenu = template[template.length - 1].submenu
  addUpdateMenuItems(helpMenu, 0)
}