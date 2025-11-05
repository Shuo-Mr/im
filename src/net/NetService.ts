import Net from './_Net';
import { AxiosRequestConfig } from 'axios';
import systemStore from '../store/SystemStore';
import webIM from './WebIM';
import message from 'antd/es/message'

export default class NetService {

    private static _intance: NetService;

    private _net: Net;

    private constructor(_prk: string, _puk: string, _apikey: string, _appk: string) {
        // console.log('NetService--constructor', _prk, _puk, _apikey, _appk)
        this._net = Net.getInstance(_prk, _puk, _apikey, _appk);
    }

    public static getInstance(_prk: string, _puk: string, _apikey: string, _appk: string): NetService {
        // this._intance = this._intance || new NetService(_prk, _puk, _apikey, _appk);
        this._intance = new NetService(_prk, _puk, _apikey, _appk);
        return this._intance
    }
    // public static setNull(){
    //     console.log('地址改变了吗',SystemStore.apiUrl)
    //     this.constructor();
    // }

    public login(url: any, data: any, config: AxiosRequestConfig): Promise<any> {
        return this.commonPost(url, data, config);
    }

    /**
     * 初始化Config数据
     */
    public initConfig(config: AxiosRequestConfig, url: string, data: any): Promise<any> {
        return this.commonGet(url, data);
    }
    /**
        * 第二通道拉取消息
        */
    public TwoRestpost(config: AxiosRequestConfig, url: string, data: any): Promise<any> {
        return this.commonPost(url, data, config);
    }

    public commonPost(url: any, data: any, config?: AxiosRequestConfig): Promise<any> {
        console.log('commonPost----', url, 'config---', config)
        try {

            if (url == '/user/register') {
                data.inviteCode = window.sessionKey
            }
            let res = this._net.postRequest(url, data, config);
            res.then(result => {
                if (url.indexOf("user/get") > -1) {
                    window.account = result.data.account
                    localStorage.setItem("account", result.data.account)
                }

                if (result.resultMsg && result.resultMsg == "访问令牌过期或无效") {
                    if (systemStore.access_token != '') {
                        message.warn('访问令牌过期或无效,请重新登录')
                    }
                    systemStore.access_token = '';
                    webIM.logout(true);
                }
            });


            console.log('返回', url, res);
            return res
        } catch (e) {
            return new Promise(r => r(null))
        }
    }

    public commonGet(url: any, config?: AxiosRequestConfig | undefined): Promise<any> {
        console.log('commonGet----', url)
        return this._net.getRequest(url, config);
    }

    public request(config: AxiosRequestConfig): Promise<any> {
        console.log('request---', config)
        return this._net.request(config);
    }
}