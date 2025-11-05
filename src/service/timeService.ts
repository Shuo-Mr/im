export class timeService {
    static timeFormat(time: number){
        return new Date(time).getMinutes() + ''+ new Date(time).getSeconds()
    }
}