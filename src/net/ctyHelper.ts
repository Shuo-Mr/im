
export namespace CryptoData {

    const cryptoData = require('crypto');

    export class CtyHelper {

        //私钥
        prk: string;
        //公钥
        puk: string;
        // apikey
        apik: string;

        //appkey 可以跟后台约定
        appID: string;

        is1024: boolean = false;

        constructor(_prk: string, _puk: string, _apikey: string, _appk: string, _1024: boolean = false) {
            this.prk = _prk;
            this.puk = _puk;
            this.apik = _apikey;
            this.appID = _appk;
            this.is1024 = _1024;
        }
        public getCryptoMd5(params: any): any {
            params.appId = this.appID;
            params.apiKey = this.apik;
            params = this.sortObjByKey(params);
            let jsStr = JSON.stringify(params);
            let md5Str = this.inputPassToDbPass(jsStr, this.apik);
            params['signKey'] = md5Str;
            let saltMd5Str = JSON.stringify(params);
            let rasStr = this.publicEncrypt(saltMd5Str)
            return { signParam: rasStr };
        }
        public publicEncrypt(data: any) {
            //得到公钥
            //加密信息用buf封装
            let buf = !this.is1024 ? new Buffer(data, "utf-8") : new Buffer(data.replace(/[\r\n]/g, ""));
            //buf转byte数组
            let inputLen = buf.byteLength;
            //密文
            let bufs = [];
            //开始长度
            let offSet = 0;
            //结束长度
            let endOffSet = !this.is1024 ? 245 : 117;

            let MAX_ENCRYPT_BLOCK = !this.is1024 ? 245 : 117;
            //分段加密
            while (inputLen - offSet > 0) {
                if (inputLen - offSet > MAX_ENCRYPT_BLOCK) {
                    let bufTmp = buf.slice(offSet, endOffSet);
                    bufs.push(cryptoData.publicEncrypt({ key: '-----BEGIN PUBLIC KEY-----\n' + this.puk + '-----END PUBLIC KEY-----\n', padding: cryptoData.constants.RSA_PKCS1_PADDING }, bufTmp));
                } else {
                    let bufTmp = buf.slice(offSet, inputLen);
                    bufs.push(cryptoData.publicEncrypt({ key: '-----BEGIN PUBLIC KEY-----\n' + this.puk + '-----END PUBLIC KEY-----\n', padding: cryptoData.constants.RSA_PKCS1_PADDING }, bufTmp));
                }
                offSet += MAX_ENCRYPT_BLOCK;
                endOffSet += MAX_ENCRYPT_BLOCK;
            }

            let result = Buffer.concat(bufs);
            //密文BASE64编码
            let base64Str = result.toString("base64");
            return base64Str;
        }

        public inputPassToFormPass(inputPass: string, salt: string): string {
            let str = "" + salt.charAt(0) + salt.charAt(2) + inputPass + salt.charAt(5) + salt.charAt(4);
            return cryptoData.createHash('md5').update(str).digest("hex");
        }


        public formPassToDBPass(formPass: string, salt: string) {
            let str = "" + salt.charAt(0) + salt.charAt(2) + formPass + salt.charAt(5) + salt.charAt(4);
            return cryptoData.createHash('md5').update(str).digest("hex");
        }

        public inputPassToDbPass(inputPass: string, saltDB: string) {
            let formPass = this.inputPassToFormPass(inputPass, saltDB);
            let dbPass = this.formPassToDBPass(formPass, saltDB);
            return dbPass;
        }

        public sortObjByKey(obj: any) {
            const keys = Object.keys(obj).sort();
            let newObj: any = {}
            for (let i = 0; i < keys.length; i++) {
                let index = keys[i];
                newObj[index] = obj[index];
            }
            return newObj;
        }

        public parsePer(str: string): Object {

            let buf = new Buffer(str, "base64");
            let MAX_DECRYPT_BLOCK = 256;
            //buf转byte数组
            //var inputLen = bytes(buf, "base64");
            let inputLen = buf.byteLength;
            //密文
            let bufs = [];
            //开始长度
            let offSet = 0;
            //结束长度
            let endOffSet = !this.is1024 ? MAX_DECRYPT_BLOCK : 128;
            //分段加密
            while (inputLen - offSet > 0) {
                let bufTmp;
                if (inputLen - offSet > MAX_DECRYPT_BLOCK) {
                    bufTmp = buf.slice(offSet, endOffSet);
                    bufs.push(cryptoData.privateDecrypt({ key: '-----BEGIN PRIVATE KEY-----\n' + this.prk + '-----END PRIVATE KEY-----\n', padding: cryptoData.constants.RSA_PKCS1_PADDING }, bufTmp));
                } else {
                    bufTmp = buf.slice(offSet, inputLen);
                    bufs.push(cryptoData.privateDecrypt({ key: '-----BEGIN PRIVATE KEY-----\n' + this.prk + '-----END PRIVATE KEY-----\n', padding: cryptoData.constants.RSA_PKCS1_PADDING }, bufTmp));
                }
                offSet += MAX_DECRYPT_BLOCK;
                endOffSet += MAX_DECRYPT_BLOCK;
            }
            let result = Buffer.concat(bufs).toString();
            return JSON.parse(result);
        }


        public parsePukPer(str: string, isJson: boolean = false): Object {

            let buf = new Buffer(str, "base64");
            let MAX_DECRYPT_BLOCK = !this.is1024 ? 256 : 128;
            //buf转byte数组
            //var inputLen = bytes(buf, "base64");
            let inputLen = buf.byteLength;
            //密文
            let bufs = [];
            //开始长度
            let offSet = 0;
            //结束长度
            let endOffSet = !this.is1024 ? MAX_DECRYPT_BLOCK : 128;
            //分段加密
            while (inputLen - offSet > 0) {
                let bufTmp;
                if (inputLen - offSet > MAX_DECRYPT_BLOCK) {
                    bufTmp = buf.slice(offSet, endOffSet);
                    bufs.push(cryptoData.publicDecrypt({ key: '-----BEGIN PUBLIC KEY-----\n' + this.puk + '-----END PUBLIC KEY-----\n', padding: cryptoData.constants.RSA_PKCS1_PADDING }, bufTmp));
                } else {
                    bufTmp = buf.slice(offSet, inputLen);
                    bufs.push(cryptoData.publicDecrypt({ key: '-----BEGIN PUBLIC KEY-----\n' + this.puk + '-----END PUBLIC KEY-----\n', padding: cryptoData.constants.RSA_PKCS1_PADDING }, bufTmp));
                }
                offSet += MAX_DECRYPT_BLOCK;
                endOffSet += MAX_DECRYPT_BLOCK;
            }
            let result = Buffer.concat(bufs).toString();
            return !str ? JSON.parse(result) : result;
        }
    }

}
