
import moment from 'moment';
import * as fs from 'fs';
import uuid from 'uuid';
// import { NoRenderTips,MesaageTips } from './../net/Const';
import { NoRenderTips } from './../net/Const';

export default class Utils {
    static isNil = (s: any) => {
        try {
            return undefined == s || "undefined" == s || null == s || '' == s || NaN == s || s.toString().trim() == "" || s.toString().trim() == "null";
        } catch (e) {
            console.error('isNil 错误', e);
            return true
        }
    }

    // 获取文件类型
    static getFileType = (fileName: string) => {
        let suffix = ''
        if (fileName) {
            const fileArr = fileName.split('.')
            suffix = fileArr[fileArr.length - 1]
        }
        if (!suffix) return '' // 无法解析
        suffix = suffix.toLocaleLowerCase()
        const imgList = ['png', 'jpg', 'jpeg', 'bmp', 'gif', 'webp', 'tif', 'svg', 'apng']
        if (imgList.includes(suffix)) return 'image' // 图片
        const videoList = ['mp4', 'avi', 'mkv', 'flv', 'mov'] // 可播放的视频格式
        if (videoList.includes(suffix)) return 'video'
        return 'file'
    }

    /**
     * 时间统一函数
     *type  1 上午10:00  否则 10:00
     * @memberof Utils
     */
    static getTimeText = (argument: any, type: any, isSecond: number = 0): string => {
        // const IS_DEV = process.env.NODE_ENV === 'development';
        // if (IS_DEV) {
        //     return parseInt(argument) + '';
        // }

        if (0 == argument)
            return "";
        argument = new Number(argument);
        let timeDesc: any = "";
        let timeSend: Date;
        // isSecond = 1;
        if (1 == isSecond) {
            timeSend = new Date(parseInt(argument + '') * 1000);

        } else {
            timeSend = new Date(argument);
        }
        let nowTime = new Date();
        let delaySeconds: any = ((nowTime.getTime()) - timeSend.getTime()) / 1000;
        if (delaySeconds < 65) {
            if (type) {
                timeDesc = "刚刚";
            } else {
                timeDesc = moment(timeSend).format("HH:mm");
            }
        } else if (delaySeconds < 60 * 30) {
            if (type) {
                timeDesc = parseInt((delaySeconds / 60) + '') + " 分钟前";
            } else {
                timeDesc = moment(timeSend).format("HH:mm");
            }
        } else if (delaySeconds < 60 * 60 * 24) {
            if (nowTime.getDay() - timeSend.getDay() == 0) {
                //今天
                if (type) {
                    timeDesc = (timeSend.getHours() < 13 ? "上午 " : "下午 ") + moment(timeSend).format("HH:mm");
                } else {
                    timeDesc = moment(timeSend).format("HH:mm");
                }
            } else {
                //昨天
                timeDesc = "昨天 " + moment(timeSend).format("HH:mm");
            }
        } else {
            if (type) {
                timeDesc = moment(timeSend).format("MM-DD HH:mm");
            } else {
                timeDesc = moment(timeSend).format("MM-DD HH:mm");
            }
        }

        return timeDesc;
    }


    /**
     * 时间统一函数
     *type  1 上午10:00  否则 10:00
     * @memberof Utils
     */
    static getDifferenceTime = (argument: any, isSecond: number = 0): string => {
        // const IS_DEV = process.env.NODE_ENV === 'development';
        // if (IS_DEV) {
        //     return parseInt(argument) + '';
        // }

        if (0 == argument)
            return "";
        argument = new Number(argument);
        let timeDesc: any = "";
        let timeSend: Date;
        // isSecond = 1;
        if (1 == isSecond) {
            timeSend = new Date(parseInt(argument + '') * 1000);

        } else {
            timeSend = new Date(argument);
        }
        let nowTime = new Date();
        let delaySeconds: any = ((nowTime.getTime()) - timeSend.getTime()) / 1000;

        if (delaySeconds < 65) {
            timeDesc = "刚刚";
        } else if (delaySeconds < 60 * 60) {
            timeDesc = parseInt((delaySeconds / 60) + '') + " 分钟";
        } else if (delaySeconds < 60 * 60 * 24) {
            timeDesc = parseInt((delaySeconds / (60 * 60)) + '') + " 小时";
        } else {
            timeDesc = Math.floor(delaySeconds / (60 * 60 * 24)) + " 天";
        }

        return timeDesc;
    }



    //百度坐标转高德（传入经度、纬度）
    static bd_decrypt(bd_lng: number, bd_lat: number) {
        var X_PI = Math.PI * 3000.0 / 180.0;
        var x = bd_lng - 0.0065;
        var y = bd_lat - 0.006;
        var z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * X_PI);
        var theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * X_PI);
        var gg_lng = z * Math.cos(theta);
        var gg_lat = z * Math.sin(theta);
        return { lng: gg_lng, lat: gg_lat }
    }
    //高德坐标转百度（传入经度、纬度）
    static bd_encrypt(gg_lng: number, gg_lat: number) {
        var X_PI = Math.PI * 3000.0 / 180.0;
        var x = gg_lng, y = gg_lat;
        var z = Math.sqrt(x * x + y * y) + 0.00002 * Math.sin(y * X_PI);
        var theta = Math.atan2(y, x) + 0.000003 * Math.cos(x * X_PI);
        var bd_lng = z * Math.cos(theta) + 0.0065;
        var bd_lat = z * Math.sin(theta) + 0.006;
        return {
            lat: bd_lat,
            lng: bd_lng
        };
    }


    static toDateTimeFormat = (timestamp: number, reg: string): string => {
        let timeSend = new Date(parseInt(timestamp + '') * 1000);

        return moment(timeSend).format(reg);
        // return (new Date(timestamp * 1000))['format']("yyyy-MM-dd HH:mm");
    }

    static formatSizeToUnit = (fileSize: number): string => {
        let size = fileSize / 1024;
        return size > 1024 ? (size / 1024).toFixed(2) + ' MB' : size.toFixed(1) + ' KB';
    }



    /*是否为群组 Jid*/
    static isGroup = (userId: string): boolean => {

        // console.log('userId----', userId)
        let reg = /[/]/;
        if (reg.test(userId)) {
            userId = userId.split('/')[0];
        }
        reg = /[@]/;

        if (reg.test(userId)) {
            userId = userId.split('@')[0];
        }
        reg = /^[0-9]*$/;
        if (!reg.test(userId))
            return true;
        else
            return false;
    }
    // todo 后期要显示出来的 群控制消息 暂且不渲染
    static isSkipWithGroupTips(type: number) {

        // if (MesaageTips.includes(type)){
        //     return true;
        // }

        if (NoRenderTips.includes(type)) {
            return true;
        }
        return false
    }
    // static ivKey=[1,2,3,4,5,6,7,8];
    static getStrFromBytes = (): string => {

        let ivKey = [1, 2, 3, 4, 5, 6, 7, 8];
        let r = "";
        for (let i = 0; i < ivKey.length; i++) {
            r += String.fromCharCode(ivKey[i]);
        }
        //console.log(r);
        return r;
    }

    /** 获取文件夹大小 */
    static getPathSize(path: string): string {
        let files = Utils.geFileList(path);
        if (files.length == 0) {
            return Utils.formatSizeToUnit(0);
        } else {

            let size: number = 0;
            files.map(((item: any) => {
                size += item.size;
            }))
            return Utils.formatSizeToUnit(size);
        }
    }

    /**获取路径下的文件 */
    static geFileList(path: string): Array<any> {
        let filesList: Array<any> = [];
        Utils.readFile(path, filesList);
        return filesList;
    }

    //遍历读取文件
    static readFile(path: string, filesList: Array<any>) {
        let files = fs.readdirSync(path);//需要用到同步读取
        files.forEach(walk);
        function walk(file: any) {
            let states = fs.statSync(path + '/' + file);
            if (states.isDirectory()) {
                Utils.readFile(path + '/' + file, filesList);
            }
            else {
                //创建一个对象保存信息
                let obj: any = new Object();
                obj.size = states.size;//文件大小，以字节为单位
                obj.name = file;//文件名
                obj.path = path + '/' + file; //文件绝对路径
                filesList.push(obj);
            }
        }
    }


    static getResource(jid: string): string {
        if (!jid)
            return '';
        jid += "";
        let arr = jid.split("/");
        if (arr.length < 2) { return ''; }
        arr.splice(0, 1);
        return arr.join('/');
    }

    static getUserId(jid: string): string {
        if (!jid)
            return '';
        jid += "";
        let arr = jid.split("/");
        if (arr.length < 2) { return ''; }
        return arr[0];
    }

    /**
     * 过滤特殊字符
     * @param str 过滤的问题
     */
    static htmlRestore(str: string): string {
        if (typeof str != 'string') {
            return str;
        }
        let s = "";
        if (str.length === 0) {
            return "";
        }

        // console.time('htmlRestore')
        // s = str.replace(/&amp;/g, "&");
        // s = s.replace(/&lt;/g, "<");
        // s = s.replace(/&gt;/g, ">");
        // s = s.replace(/&nbsp;/g, " ");
        // s = s.replace(/&#39;/g, "\'");
        // s = s.replace(/&quot;/g, "\"");
        // s = s.replace(/&apos;/g, "\'");
        // s = s.replace(/&cent;/g, "\￠");
        // s = s.replace(/&pound;/g, "\£");
        // s = s.replace(/&yen;/g, "\¥");
        // s = s.replace(/&euro;/g, "\€");
        // s = s.replace(/&sect;/g, "\§");
        // s = s.replace(/&copy;/g, "\©");
        // s = s.replace(/&reg;/g, "\®");
        // s = s.replace(/&trade;/g, "\™");
        // s = s.replace(/&times;/g, "\×");
        // s = s.replace(/&divide;/g, "\÷");
        // console.timeEnd('htmlRestore')

        s = Utils.test(/&lt;/g, "&", str);//str.replace(/&amp;/g, "&");
        s = Utils.test(/&lt;/g, "<", s);//test s.replace(/&lt;/g, "<");
        s = Utils.test(/&gt;/g, ">", s);//s.replace(/&gt;/g, ">");
        s = Utils.test(/&nbsp;/g, " ", s);//s.replace(/&nbsp;/g, " ");
        s = Utils.test(/&39;/g, "\'", s);//s.replace(/&#39;/g, "\'");
        s = Utils.test(/&quot;/g, "\"", s);//s.replace(/&quot;/g, "\"");
        s = Utils.test(/&apos;/g, "\'", s);//s.replace(/&apos;/g, "\'");
        s = Utils.test(/&cent;/g, "\￠", s);//s.replace(/&cent;/g, "\￠");
        s = Utils.test(/&pound;/g, "\£", s);//s.replace(/&pound;/g, "\£");
        s = Utils.test(/&yen;/g, "\¥", s);//s.replace(/&yen;/g, "\¥");
        s = Utils.test(/&euro;/g, "\€", s);//s.replace(/&euro;/g, "\€");
        s = Utils.test(/&sect;/g, "\§", s);//s.replace(/&sect;/g, "\§");
        s = Utils.test(/&copy;/g, "\©", s);//s.replace(/&copy;/g, "\©");
        s = Utils.test(/&reg;/g, "\®", s);//s.replace(/&reg;/g, "\®");
        s = Utils.test(/&trade;/g, "\™", s);//s.replace(/&trade;/g, "\™");
        s = Utils.test(/&times;/g, "\×", s);//s.replace(/&times;/g, "\×");
        s = Utils.test(/&divide;/g, "\÷", s);//s.replace(/&divide;/g, "\÷");

        // console.timeEnd('htmlRestore');
        return s;
    }

    static test = (_regStr: RegExp, _rp: string, _text: string) => {
        if (_regStr.test(_text)) {
            // console.log('-------命中--------', _regStr);
            return _text = _text.replace(_regStr, _rp);
        }
        return _text;
    }
    static getDeadLineTime = (type: number): { name: string, value: number } => {
        switch (type) {
            case 1:
                return {
                    name: "5秒",
                    value: 5,
                };
            case 2:
                return {
                    name: "10秒",
                    value: 10,
                };
            case 3:
                return {
                    name: "30秒",
                    value: 30,
                }
            case 4:
                return {
                    name: "1分钟",
                    value: 60,
                };
            case 5:
                return {
                    name: "5分钟",
                    value: 60 * 5,
                };
            case 6:
                return {
                    name: "30分钟",
                    value: 60 * 30,
                };
            case 7:
                return {
                    name: "1小时",
                    value: 60 * 60 * 60,
                };
            case 8:
                return {
                    name: "6小时",
                    value: 60 * 60 * 6,
                };
            case 9:
                return {
                    name: "12小时",
                    value: 60 * 60 * 12,
                };
            case 10:
                return {
                    name: "1天",
                    value: 60 * 60 * 24,
                };
            case 11:
                return {
                    name: "1星期",
                    value: 60 * 60 * 24 * 7,
                };
            default:
                return {
                    name: "5秒",
                    value: 5,
                };
        }
    }


    static randomUUID = () => {
        return uuid().replace(/-/g, '');//this.cont + this.userId + this.getTimeSecond() + Math.round(Math.random() * 1000);
    }

    //获取url 参数
    static getAllUrlParams(url: string) {
        // 用JS拿到URL，如果函数接收了URL，那就用函数的参数。如果没传参，就使用当前页面的URL
        var queryString = url ? url.split('?')[1] : window.location.search.slice(1);
        // 用来存储我们所有的参数
        let obj: { [index: string]: any } = {};
        // 如果没有传参，返回一个空对象
        if (!queryString) {
            return obj;
        }
        // stuff after # is not part of query string, so get rid of it
        queryString = queryString.split('#')[0];
        // 将参数分成数组
        var arr = queryString.split('&');
        for (var i = 0; i < arr.length; i++) {
            // 分离成key:value的形式
            var a = arr[i].split('=');
            // 将undefined标记为true
            var paramName = a[0];
            var paramValue = typeof (a[1]) === 'undefined' ? true : a[1];
            // 如果调用对象时要求大小写区分，可删除这两行代码
            paramName = paramName.toLowerCase();
            if (typeof paramValue === 'string') paramValue = paramValue;
            // 如果paramName以方括号结束, e.g. colors[] or colors[2]
            if (paramName.match(/\[(\d+)?\]$/)) {
                // 如果paramName不存在，则创建key
                const key: string = paramName.replace(/\[(\d+)?\]/, '');
                if (!obj[key]) {
                    obj[key] = []
                };
                // 如果是索引数组 e.g. colors[2]
                if (paramName.match(/\[\d+\]$/)) {
                    const tarArray = /\[(\d+)\]/.exec(paramName);
                    // 获取索引值并在对应的位置添加值
                    if (tarArray) {
                        let index = tarArray[1];
                        obj[key][index] = paramValue;
                    }
                } else {
                    // 如果是其它的类型，也放到数组中
                    obj[key].push(paramValue);
                }
            } else {
                // 处理字符串类型
                if (!obj[paramName]) {
                    // 如果如果paramName不存在，则创建对象的属性
                    obj[paramName] = paramValue;
                } else if (obj[paramName] && typeof obj[paramName] === 'string') {
                    // 如果属性存在，并且是个字符串，那么就转换为数组
                    obj[paramName] = [obj[paramName]];
                    obj[paramName].push(paramValue);
                } else {
                    // 如果是其它的类型，还是往数组里丢
                    obj[paramName].push(paramValue);
                }
            }
        }
        return obj;
    }
    static jsonWithParse =
        (jsonStr: string | undefined) => {
            try {
                let _jsonStr = jsonStr;
                if (!_jsonStr) {
                    return null
                }
                if (_jsonStr as any instanceof Object) {
                    return _jsonStr
                }
                return JSON.parse(_jsonStr + '');
            } catch (e) {
                console.error('解析错误', jsonStr)
                return null
            }
        }
    //判断是域名还是ip直连
    static apiJudge = (str: any) => {
        for (var i in str) {
            var asc = str.charCodeAt(i);
            if ((asc >= 65 && asc <= 90 || asc >= 97 && asc <= 122)) {
                return true;
            }
        }
        return false;
    }
    static base64ToBlob = ({ b64data = '', contentType = '', sliceSize = 512 } = {}) => {
        return new Promise((resolve, reject) => {
            // 使用 atob() 方法将数据解码
            let byteCharacters = atob(b64data.substring(b64data.indexOf(',') + 1));
            let byteArrays = [];
            for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
                let slice = byteCharacters.slice(offset, offset + sliceSize);
                let byteNumbers = [];
                for (let i = 0; i < slice.length; i++) {
                    byteNumbers.push(slice.charCodeAt(i));
                }
                // 8 位无符号整数值的类型化数组。内容将初始化为 0。
                // 如果无法分配请求数目的字节，则将引发异常。
                byteArrays.push(new Uint8Array(byteNumbers));
            }
            let result = new Blob(byteArrays, {
                type: contentType
            })
            result = Object.assign(result, {
                // 这里一定要处理一下 URL.createObjectURL
                preview: URL.createObjectURL(result),
                name: `XXX.png`
            });
            resolve(result)
        })
    }
    static isBase64(str: string) {
        if (str.indexOf('data:') != -1 && str.indexOf('base64') != -1) {
            return true;
        } else {
            return false;
        }
    }
    static createXml(str: string) {

        if (document.all) {
            var xmlDom = new ActiveXObject("Microsoft.XMLDOM")
            xmlDom.loadXML(str)
            return xmlDom
        }
        else
            return new DOMParser().parseFromString(str, "text/xml")
    }
    //正则判断@人查询/更改积分操作(@A@B积分  @A@B@C+1)等形式完全匹配)
    static judgeIntegration(content: string, ps: any[]) {
        let psString = ps.map(e => '@' + e.name + ' ?').join('|');
        let reg = new RegExp(`((${psString})+) ?(积分|\\+|\\-)`, 'ig');
        let matcher = content.match(reg)
        let regNumber = /^\+?[1-9][0-9]*$/ //非零整数

        if (matcher && matcher.length == 1) {
            if (matcher[0].substring(content.length - 2) === '积分') {
                return {
                    res: true,
                    content: '积分'
                }
            } else if (/\+/.test(matcher[0])) {
                let value = content.split('+')[1]
                if (regNumber.test(value.trimRight())) {
                    return {
                        res: true,
                        content: '设置',
                        value: '+' + value.trimRight(),
                    }
                }
                return {
                    res: false,
                    content: ''
                }

            } else if (/\-/.test(matcher[0])) {
                let value = content.split('-')[1]
                if (regNumber.test(value.trimRight())) {
                    return {
                        res: true,
                        content: '设置',
                        value: '-' + value.trimRight(),
                    }
                }
                return {
                    res: false,
                    content: ''
                }
            } else {
                return {
                    res: false,
                    content: ''
                }
            }
        } else {
            return {
                res: false,
                content: ''
            }
        }
    }

}
export function isMobile() {
    let reg = /(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i;
    return reg.test(navigator.userAgent);

}