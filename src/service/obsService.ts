import uuid from 'uuid';
import ipcRender from '../ipcRender';
import systemStore from './../store/SystemStore';
import md5 from 'md5';



//用于测试收集obs上传日志
// interface obsUpLoadDailyRecord{
//     user_ip:string,//用户ip
//     upl_url:string,//上传文件路径

// }
interface ObsConfig {
    access_key_id: string,
    secret_access_key: string,
    server: string,
    timeout: number,
    downloadAvatarUrl: string,
    downloadUrl: string,
}
class ObserverServices {
    Bucket = "";
    obsConfigData: ObsConfig | null = null;
    obs: any = null;
    setObsConfig = (config: ObsConfig, Bucket: string) => {
        this.obsConfigData = config;
        this.Bucket = Bucket;
        this.createObs()
    }
    createObs = () => {
        if (this.obsConfigData && window["ObsClient"]) {
            this.obs = new window["ObsClient"](this.obsConfigData);
            return this.obs
        }
        return null
    }
    uploadFile = async (tarFile: File, url: string) => {
        // console.log('上传文件upload',url)
        if( ipcRender){
            if (!this.obs) {
                this.createObs();
                if (!this.obs) {
                    console.error('创建obs失败')
                    return await this.uploadWithServer(tarFile, url)
                }
            }
            if (this.obs) {
                const fileUrl =  await this.uploadWithObs(tarFile);
                if(fileUrl){
                    return fileUrl
                }
            }
        } 
        return await this.uploadWithServer(tarFile, url);
    }
    uploadWithObs = async (tarFile: File): Promise<string> => {
        return new Promise(r => {
            if (!this.Bucket || !tarFile) {
                console.error('obs缺少Bucket')
                return ''
            }
            let fileKeys = uuid() + '' + new Date().valueOf()  + (tarFile.type ? ('.'+tarFile.type.split('/')[1]):'.png');
            // console.log('文件',tarFile);
            return new Promise(() => {
                this.obs.putObject({
                    Bucket: this.Bucket,
                    Key: fileKeys,
                    SourceFile: tarFile,
                    ACL: this.obs.enums.AclPublicRead
                })
                    .then((result: any) => {
                        if (result.CommonMsg.Status < 300) {
                            if (this.obsConfigData) {
                                console.log('obsCreate object:' + fileKeys + ' successfully!\n');

                                let pathUrl = 'https://' + this.Bucket + '.' + this.obsConfigData.server + "/" + fileKeys;
                                if (this.obsConfigData.downloadAvatarUrl && this.obsConfigData.downloadUrl) {
                                    pathUrl = this.obsConfigData.downloadUrl + (this.obsConfigData.downloadUrl.charAt(this.obsConfigData.downloadUrl.length - 1) == '/' ? '' : '/') + fileKeys;
                                }

                                console.log('上传obs --替换成cdn', pathUrl);

                                r(pathUrl)
                            }
                        }
                        r('')
                    });
            })
        })
    }
    uploadWithServer = (tarFile: File, url: string): Promise<string> => {
        return new Promise(r => {
            try {
                const form = new FormData();
                form.append('file', tarFile);
                form.append('access_token', systemStore.access_token);
                let time = systemStore.getCurrentSeconds() + ''
    
                let api_time = systemStore.apiKey + time + (systemStore.userId || '') + (systemStore.access_token || '');
                let md5Key = md5(api_time);
                form.append('time', time);
                form.append('secret', md5Key);
    
                const xhr = new XMLHttpRequest();
                xhr.open('post', url, true);
                // todo  
                xhr.onload = (evt: any) => {
                    if (!evt.target.responseText) {
                        console.warn('server upload response', evt.target.responseText);
                        r('');
                    }
                    const data = JSON.parse(evt.target.responseText);
                    if (data) {

                        console.log('上传返回的obs 路径：', data.url);

                        r(data.url)
                    }
                    r('')
                };
                xhr.onerror = () => {
                    r('')
                };;
                xhr.send(form);
            } catch (e) {
                console.error(e);
                r('')
            }
        })
    }
}

export const observerServices = new ObserverServices();