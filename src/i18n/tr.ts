// import * as electron from "electron";
// const electron = global['electron'];

export var language: string = '';
import zh_CN from './zh_CN';
import en_US from './en_US';
import systemStore  from '../store/SystemStore';


/**
 * 切换到指定语言
 * @param appLan 语言代码
 * @see https://electronjs.org/docs/api/locales
 */
export function switchToLanguage(appLan: string): void {
    let lanModule = null;
    // console.log('language', appLan);
    if (appLan.startsWith("zh")) {
        lanModule = zh_CN;///require('i18n/zh_CN');
        appLan = 'zh-CN';
    } else {
        //en-US
        lanModule = en_US;//require('i18n/en_US');
        language = 'en-US';
    }
    global['$locale_strings'] = lanModule;
}

/**
 * 全局多语言翻译函数
 * @param code 要查询的字符串代码
 * @param args 替换字符串中{0}标志的参数列表
 * @returns 返回拼接后的字符串
 */
export function tr(code: number, args?: any): string {
    if (!global['$locale_strings']) {
        let appLan = systemStore.language;
        let lanModule = null;
        console.log('language', appLan);
        if (appLan.startsWith("zh")) {
            lanModule = zh_CN;//require('i18n/zh_CN');
            language = 'zh-CN';
        } else {
            //en-US
            lanModule = en_US ;//require('i18n/en_US');
            language = 'en-US';
        }
        global['$locale_strings'] = lanModule;
    }

    let text = global['$locale_strings'][code];

    text = format(text, args);
    return text;
}

function format(text: any, args: any): string {
    if (!args) {
        return text;
    } else if (typeof (args) !== 'object') {
        args = [args];
    }
    let length = args.length;
    for (let i = 0; i < length && i < 5; i++) {//不超过5个参数
        let rep = args[i].toString();
        text = text.replace(new RegExp("\\{" + i + "\\}", "ig"), rep || "");
    }
    return text;
}

// function getCurrentLan(): string {
//     if (electron) {
//         let app;
//         if (electron.remote) {
//             app = electron.remote.app;
//         } else {
//             app = electron.app;
//         }
//         if (app) {
//             return app.getLocale();
//         }
//     }
//     if (process.env.LANG) {
//         return process.env.LANG;
//     }
//     if (process.env.LANGUAGE) {
//         return process.env.LANGUAGE;
//     }
//     return  "en-US";
// }