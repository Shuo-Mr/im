import { observable, action } from 'mobx'

export class RouterStore {

    @observable history: any = null

    @action setHistory(history: any) {
        this.history = history
    }
}

export default new RouterStore();