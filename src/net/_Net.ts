
////// / <reference path = "./ctyHelper.ts" />
import Axios, { AxiosRequestConfig, AxiosInstance } from 'axios';
import { ErrorCode } from './Const';
// import { isCrypto, apiUrl } from '../config/SystemConfig';
import { isCrypto } from '../config/SystemConfig';
import { CryptoData } from './ctyHelper';
import { SystemStore } from '../store/SystemStore'
// import utils from '../utils/utils'
import md5 = require('md5');
import RetryManager from './NetManger';
// const codeMessage: any = {
//     200: '服务器成功返回请求的数据。',
//     201: '新建或修改数据成功。',
//     202: '一个请求已经进入后台排队（异步任务）。',
//     204: '删除数据成功。',
//     400: '发出的请求有错误，服务器没有进行新建或修改数据的操作。',
//     401: '用户没有权限（令牌、用户名、密码错误）。',
//     403: '用户得到授权，但是访问是被禁止的。',
//     404: '发出的请求针对的是不存在的记录，服务器没有进行操作。',
//     406: '请求的格式不可得。',
//     410: '请求的资源被永久删除，且不会再得到的。',
//     422: '当创建一个对象时，发生一个验证错误。',
//     500: '服务器发生错误，请检查服务器。',
//     502: '网关错误。',
//     503: '服务不可用，服务器暂时过载或维护。',
//     504: '网关超时。',
// };
export default class _Net {

    private static instance: _Net;

    private axios: AxiosInstance;

    private ctyHelper: CryptoData.CtyHelper;
    private retryManager: RetryManager;

    private constructor(_ctyHelper: CryptoData.CtyHelper) {
        const IS_DEV = process.env.NODE_ENV === 'development';

        this.ctyHelper = _ctyHelper;


        let config = {
            baseURL: IS_DEV ? '' : SystemStore.apiUrl,
            // baseURL: IS_DEV ? '' : (utils.apiJudge(apiUrl)? 'http://api.'+apiUrl:'http://'+apiUrl),
            headers: {
            },
            // withCredentials: true
        };


        if (isCrypto) {
            config.headers['version-Secret'] = "1.0";
            config.headers['version-pc'] = md5('0.13.3');
        }
        this.retryManager = new RetryManager();
        this.axios = Axios.create(config);
        this.axios.defaults.timeout = 30000;           //超时时间


        this.setupInterceptors();

    }


    /**
     * 设置拦截器
     */
    private setupInterceptors(): void {
        this.setupRequestInterceptor();
        this.setupResponseInterceptor();
    }


    /**
     * 请求拦截器
     */
    private setupRequestInterceptor(): void {
        this.axios.interceptors.request.use(
            (config: any) => {
                config.retry = SystemStore.boshUrls.length;
                config.retryDelay = 4000
                // 如果配置了重试，生成请求ID并初始化重试状态
                // 为需要重试的请求生成唯一ID
                const requestId = this.retryManager.generateRequestId(config);
                // issue：__requestId 传输不了
                if (!config.__requestId) {
                    config.__requestId = requestId;
                }
                // config.url 
                // 只在首次请求时初始化（通过检查是否已有状态来判断）
                if (!this.retryManager.getRetryState(requestId)) {
                    this.retryManager.initializeRequest(requestId);
                    console.log(`初始化请求: ${config.url}`);
                }
                return config;
            },
            (error: any) => {
                return Promise.reject(error);
            }
        );
    }

    /**
  * 响应拦截器
  */
    private setupResponseInterceptor(): void {
        this.axios.interceptors.response.use(
            (response: any) => {
                const config = response.config;

                // 请求成功，清理重试状态
                if (config.__requestId) {
                    this.retryManager.clearRequest(config.__requestId);
                    console.log(`✅ 请求成功-清除重试: ${config.method} ${config.url}`);
                }

                return response;
            },
            async (error: any) => {
                const config = error.config;
                const requestId = config.__requestId;

                // 检查是否应该重试
                if (!requestId || !this.retryManager.shouldRetry(error)) {
                    console.log(`❌ 不满足重试条件: ${config.method} ${config.url}`);
                    return Promise.reject(error);
                }

                const retryState = this.retryManager.getRetryState(requestId);
                if (!retryState) {
                    return Promise.reject(error);
                }


                // 检查重试次数
                if (retryState.count + 1 >= config.retry!) {
                    console.log('达到最大重试次数，停止重试');
                    this.retryManager.clearRequest(requestId);
                    return Promise.reject(error);
                }
                // 增加重试次数
                // 标记为重试并增加计数
                this.retryManager.markAsRetry(requestId);

                const delay = config.retryDelay || 1000;
                console.log(`等待 ${delay}ms 后进行第 ${retryState.count + 1} 次重试`);

                // 延迟后重试
                await new Promise(resolve => setTimeout(resolve, delay));

                console.log(`开始第 ${retryState.count + 1} 次重试`, 'config', config, SystemStore.boshUrls);
                const baseURL = SystemStore.boshUrls[retryState.count] || SystemStore.boshUrls[0]
                this.axios.defaults.baseURL = baseURL
                const u = new URL(config.url)
                return this.request({ ...config, baseURL: baseURL, url: u.pathname });

            }
        );
    }


    public static getInstance(_prk: string, _puk: string, _apikey: string, _appk: string): _Net {
        let _ctyHelper = new CryptoData.CtyHelper(_prk, _puk, _apikey, _appk);
        // this.instance = this.instance || new _Net(_ctyHelper);
        this.instance = new _Net(_ctyHelper);
        return this.instance
    }

    private static getParams(data: any): URLSearchParams {
        let params = new URLSearchParams();
        for (let [key, value] of Object["entries"](data)) {
            params.append(key, value as any)
        }
        return params;
    }


    public request(config: AxiosRequestConfig): Promise<any> {
        return new Promise((resolve, rejects) => {
            this.axios.request(config).then(response => {
                resolve(response)
            }).catch(error => {
                rejects(error);
            })
        })
    }

    public postRequest(url: string, data?: any, config?: AxiosRequestConfig | undefined): Promise<any> {
        let ctd = isCrypto ? this.ctyHelper.getCryptoMd5(data || { time: new Date().getTime() }) : data;

        // console.log('post发送的数据 ---', ctd, '---参数----', config, this.axios.defaults);

        return new Promise((resolve, rejects) => {
            try {
                this.axios.post(url, _Net.getParams(ctd), config ? Object.assign(config, {
                    headers: {
                        "originate": "1",
                        // 'Access-Control-Allow-Origin': '*',
                        "Content-Type": "application/x-www-form-urlencoded",
                        // "Access-Control-Allow-Credentials":true
                        'version-Secret': isCrypto ? "1.0" : '0.0'
                    }
                }) : config).then(response => {
                    resolve(response.data);
                }).catch(error => {
                    rejects(error);
                })
            } catch (e) {
                console.error('postRequest', e)
                resolve(null)
            }
        })
    }

    public getRequest(url: string, config?: AxiosRequestConfig | undefined): Promise<any> {

        console.log('getRequest---', url, config)
        return new Promise((resolve, rejects) => {
            this.axios.get(url, config).then(response => {
                if (response.status == 200) {
                    this.handleResponse(response);
                }
                resolve(response.data)
            }).catch(error => {
                rejects(error);
            })
        })
    }

    private handleResponse(response: any): void {
        if (response.status == 200) {
            let result = response.data;
            if (ErrorCode.LACK_TOKENS == result.resultCode) {

            } else if (ErrorCode.EXPIRE_TOKENS == result.resultCode) {

            } else if (ErrorCode.COMMON_ERROR == result.resultCode) {

            }
        }
    }
}