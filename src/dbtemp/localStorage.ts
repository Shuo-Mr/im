class tigLocalStorage {

    userId: string = "";

    getKey = (key: string) => {
        return this.userId + "_" + key;
    }

    setItem = (key: string, value: string) => {

        try {
            localStorage.setItem(this.getKey(key), value);
        } catch (oException) {
            if (oException.name == 'QuotaExceededError') {
                console.log('超出本地存储限额！');
                //如果历史信息不重要了，可清空后再设置
                localStorage.clear();
                localStorage.setItem(this.getKey(key), value);
            }
        }
    }

    getItem = (key: string): string | null => {
        let value = localStorage.getItem(this.getKey(key));
            if(!(undefined==value||null==value||""==value||"null"==value))
             console.log("dbStorageLog ==> getItem key > "+key);
        return value;

    }

    removeItem = (key: string): void => {
        console.log("dbStorageLog ==> removeItem key > " + key);
        localStorage.removeItem(this.getKey(key));
    }

    clear = () => {
        console.log("dbStorageLog ==> clearAll =====>");
        localStorage.clear();
        return true;
    };
}

export default new tigLocalStorage();