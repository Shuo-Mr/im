import imsdk from './IMSDK'

let serverTime:number;
let whenGetServerTime:number;
let updateInterval = 5 * 60e3;
let forceUpdateKey = 'force-update-server-time';
export function getServerTime() {


    let now = Date.now();

    if (now - whenGetServerTime > updateInterval) {
        updateServerTime(forceUpdateKey);
    }

    return {
        server: serverTime + (now - whenGetServerTime),
        serverTime,
        when: whenGetServerTime,
        diff: serverTime - whenGetServerTime,
        now,
    };
}
export async function updateServerTime(force?:string) {
    if (force !== forceUpdateKey && serverTime) {
        return Promise.resolve(getServerTime());
    }

    return imsdk.getCurrentTime().then(({ data }: any) => {
        serverTime = data;
        whenGetServerTime = Date.now();
        return getServerTime();
    });
}
export function inIt(data:number){
    serverTime = data;
    whenGetServerTime = Date.now();
    return getServerTime();
}