class UserAvatorData {
    photoData = {

    }
    setAvator = (id: string, image: string) => {
        this.photoData[id] = image
    }
    getAvatorData(id: string) {
        // if(id == '10000'){
        //     return require('./../assets/image/im_notice_square.png')
        // }
        // if(id == '1100'){
        //     return require('./../assets/image/im_notice_square.png')
        // }
        return this.photoData[id]  || ''
    }
}
export const avatorData = new UserAvatorData();