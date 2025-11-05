
const electron = global['electron'];

import * as jsCookie from 'js-cookie';
import systemStore, { SystemStore } from './store/SystemStore';
import webIM from './net/WebIM';
import xmppSDK from './net/XmppSDK';
import { clearTimeout } from 'timers';
import { isOpenWeb} from './config/SystemConfig';
import  chatStore  from './store/ChatStore';
import mousetrap from 'mousetrap';
// import { ConfirmCommon } from './component/confirmModal/ConfirmModal';

window.addEventListener('load', e => {
    mousetrap.bind('ctrl+shift+alt+/+*', function () {
        electron.ipcRenderer.send('devtools');
    });
});
class ImwebStorage {

    constructor() {

    }
    userId: string | number;

    storage: any;

    isElectron: boolean = true;

    // 区分了本地和数据库
    init(_userId: number | string, _isElectron: boolean, ipcRender: IpcRender) {
        this.userId = _userId;
        this.isElectron = _isElectron;
        if (_isElectron && ipcRender && ipcRender.ipcRenderer) {
            ipcRender.ipcRenderer.send('init-storage', { userId: this.userId })
        } else {
            this.storage = localStorage;
        }
    }

    setItem = async (data: { type: string, userId: number | string, value: Object }, ipcRender: IpcRender): Promise<boolean> => {
        if (this.isElectron && ipcRender && ipcRender.ipcRenderer) {
            let setRet = ipcRender.ipcRenderer.sendSync('set-localstorage', data);
            return Promise.resolve(setRet)

        } else {
            this.storage = localStorage;
            localStorage.setItem(data.userId + '_' + data.type, JSON.stringify(data.value));

            return Promise.resolve(true);
        }
    }

    getItem = (data: { type: string, userId: number | string }, ipcRender: IpcRender): any => {
        if (this.isElectron && ipcRender && ipcRender.ipcRenderer) {
            let tempDate = ipcRender.ipcRenderer.sendSync('get-localstorage', data);
            return tempDate;
        } else {
            this.storage = localStorage;
            return localStorage.getItem(data.userId + '_' + data.type);
        }
    }
}



/**
 * 如果是electron 环境，区分
 */
export class IpcRender {

    isElectron: boolean = false;
    ipcRenderer: any;

    storage: ImwebStorage;

    constructor() {
        this.isElectron = !!electron;
        if (this.isElectron) {
            this.ipcRenderer = electron.ipcRenderer;
            this.ipcRenderer.on("want-close-custom", this.wantCloseCustom);
            this.ipcRenderer.on("windowFocus", this.windowFocus);
            this.ipcRenderer.on("windowMinimize", this.setWindowMin);
        }

        this.storage = new ImwebStorage();
    }
    setWindowMin=()=>{

        systemStore.ismin= true;
    }
    windowFocus=()=>{
        systemStore.ismin=false
        // call 消息回执
        chatStore.sendMessagesReadReceipt(chatStore.currentChat)
    }

    min = () => {

        // console.log('ldldlldldldldl');
        if (this.isElectron) {
            this.ipcRenderer.send('window-min')
        }
    }

    close = () => {
        // console.log('ldldlldldldldl');
        if (this.isElectron) {
            this.ipcRenderer.send('window-close')
        }
    }

    max = () => {
        systemStore.ismin=false;

        if (this.isElectron) {
            this.ipcRenderer.send('window-max')
        }
    }

    getAppPath = () => {
        if (this.isElectron) {
            return electron.remote.app.getAppPath();
        } else {
            //todo 设置一个网络地址
            return ''
        }
    }
    getAppRevision = () => {
        if (this.isElectron) {
            return ` v${electron.remote.app.getVersion()}`
        } else {
            return ''
        }
    }

    notifyTask: any;

    popuMsgs: any[] = [];

    showMessageNotification = (data: { title: string, body: string }) => {

        this.popuMsgs[0] = data;
        //如果是electron 环境的话 直接通知到主进程 可能处理点击事件
        if(!this.notifyTask){
            this.notifyTask = setInterval(() => {
                if (this.popuMsgs.length > 0) {
                    let tempData = this.popuMsgs.shift();

                    if (this.isElectron) {
                        this.ipcRenderer.send('showMessageNotification', tempData);
                        ;
                    } else {
                        if (window['Notification']) {
                            new Notification(tempData.title, { body: tempData.body });
                        }
                    }
                } else {
                    clearInterval(this.notifyTask);
                    this.notifyTask = null;
                }

            }, 3000);
        }
    }
    /**  */
    beforeUnland = () => {
        // console.log('用户想关闭界面');
        xmppSDK.selfExit = true;
        xmppSDK.disconnect();
        this.ipcRenderer.send('force-close');
    }

    /**主进程发过来的消息 ---用户自己想关闭界面 */
    wantCloseCustom = (event: any, args: any) => {

        webIM.beforeUnland(event);
        this.beforeUnland();
        // ConfirmCommon('退出该程序?', () => {
        //     webIM.beforeUnland(event);
        //     this.beforeUnland();
        // });
    }

    setCookies = (name: string, value: string) => {
        // TODO 目前做网页处理
        if (this.isElectron) {
            this._setCookies(name, value);
        } else {
            jsCookie.set(name, value, { domain: SystemStore.apiUrl });
        }
    }

    getCookie = async (name: string): Promise<string> => {
        if (this.isElectron) {
            return await this._getCookies(name) as string;
        } else {
            return Promise.resolve(jsCookie.get(name) || '');
        }
    }

    /**带有用户标示的 */
    setLogoutTime = (_time: number): void => {

        if (systemStore.userId == '') {

        } else {
            if (this.isElectron) {
                this.ipcRenderer.send('set-logout-time', { url: SystemStore.apiUrl, name: this.getKey("logOutTime_"), value: (_time - 60) + '' })
            } else {
                //return jsCookie.set(name, _time + '', { domain: SystemStore.apiUrl });
                jsCookie.set(name, _time + '', { domain: SystemStore.apiUrl });
            }
        }
    }

    getOSC = (): any => {
        if (systemStore.userId == '') {
        } else {
            if (this.isElectron && this.ipcRenderer) {
                return this.ipcRenderer.sendSync("report-os", {});
            } else {
                return { "device": 'web' };
            }
        }
    }

    /**获取本地语言环境 */
    getLocal = async (): Promise<string> => {

        try {
            let lang = await this.getLanguage();
            if (lang && lang.length != 0) {
                return lang;
            } else {
                if (this.isElectron) {
                    let app;
                    if (electron.remote) {
                        app = electron.remote.app;
                    } else {
                        app = electron.app;
                    }
                    if (app) {
                        return app.getLocale();
                    } else {
                        return 'zh_CN';
                    }
                } else {

                    if (navigator["browserLanguage"]) {
                        return navigator["browserLanguage"];
                    } else if (navigator.language) {
                        return navigator.language;
                    } else {
                        return 'zh_CN';
                    }
                }
            }
        } catch (error) {
            return 'zh_CN'
        }
    }

    getCacheSize = () => {
        if (this.isElectron) {
            return this.ipcRenderer.sendSync("cache-size", { userId: systemStore.userId });
        } else {
            return '0kb'
        }
    }

    getKey = (key: string): string => {
        return key + "_" + systemStore.userId;
    };

    /**带有用户标示的cookies */
    getLogoutTime = async (): Promise<any> => {
        if (systemStore.userId == '') {
            return 0;
        }
        if (this.isElectron) {
            let logoutTime = this.ipcRenderer.sendSync('get-logout-time', { url: SystemStore.apiUrl, name: this.getKey("logOutTime_") })
            return logoutTime;
        } else {
            return Promise.resolve(parseInt(jsCookie.get(this.getKey("logOutTime_")) || ''));
        }
    }


    private _setCookies = (name: string, value: string | number) => {

        const Session = electron.remote.session;

        if (!systemStore) {
            return;
        }
        let Days = 30;
        let exp = new Date();
        let date = Math.round(exp.getTime() / 1000) + Days * 24 * 60 * 60;
        const cookie = {
            url: SystemStore.apiUrl,
            name: name,
            value: value,
            expirationDate: date
        };
        Session.defaultSession.cookies.set(cookie, (error: Error) => {
            if (error) {
                console.log(error);
                return Promise.reject(false)
            } else {
                return Promise.resolve(true);
            }
        })
    }
    private _getCookies = async (name: string): Promise<any> => {

        const Session = electron.remote.session;

        return new Promise(function (resolve, reject) {
            Session.defaultSession.cookies.get({ name: name, url: SystemStore.apiUrl }, (error: Error, cookies: any) => {
                if (cookies.length > 0) {
                    resolve(cookies[0]['value']);
                } else {
                    resolve(cookies);
                }
            })
        })
    }

    initStorage = (_userId: number | string, ) => {
        this.storage.init(_userId, this.isElectron, this);
    }



    setItem = async (data: { type: string, userId: number | string, value: Object }): Promise<any> => {
        return this.storage.setItem(data, this);
    }

    getItem = (data: { type: string, userId: number | string }): any => {
        return this.storage.getItem(data, this);
    }


    /**获取当前平台 */
    getCurrectDeviceSource = (): string => {

        if(!isOpenWeb){
            if (!this.isElectron) {
                return 'web' + (Date.parse(new Date().toString()) / 1000 % 100000);;
            } else {
                let os = this.ipcRenderer.sendSync('get-os');
                return os;
            }
        }else{
            return 'web' + (Date.parse(new Date().toString()) / 1000 % 100000);
        }

    }

    setLanguage = (language: string) => {
        this.setCookies('language', language);
    }

    getLanguage = () => {
        return this.getCookie('language');
    }

    setErrorEncrypted = (data: any) => {
        return;
        if (this.isElectron) {
            this.ipcRenderer.send('error-encrypted', data)
        }
    }

    notifyUpdate = () => {
        if (this.isElectron) {
            this.ipcRenderer.send('notifyUpdate');
        }
    }


    //通知写入上传日志
    loadWriteUpdate = (data:any) => {
        console.log('写入上传日志',this.isElectron)
        if (this.isElectron) {
            this.ipcRenderer.send('writeLogs',data);
        }
    }
    //通知打开截屏
    openScreeshot = () => {
        console.log('开启截图',this.isElectron)
        if (this.isElectron) {
            this.ipcRenderer.send('openScreeshot');
        }
    }

    logMessage = (data: any) => {
        // new Promise((r,j)=>{
        let c = setTimeout(() => {
            if (this.isElectron) {
                this.ipcRenderer.send('message-log', { messageId: data.messageId, timeSend: data.timeSend, type: data.type });
            }
            clearTimeout(c);
        }, 10000);
        // })

    }

    getNetConfig = (): { apiUrl: string, boshUrl: string } => {
        try {
            if (this.isElectron) {
                return JSON.parse(this.ipcRenderer.sendSync('net-config'));
            } else {
                return { apiUrl: '', boshUrl: '' };
            }
        } catch (error) {
            return { apiUrl: '', boshUrl: '' };
        }

    }
}

export default new IpcRender();