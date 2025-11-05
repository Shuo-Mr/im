import { DataMap } from "../dbtemp/DataUtils";
import imsdk from './IMSDK';

export class GroupManager {
    roomData: any = null;
    roomCard: any = null;//群名片
    filters: any = {};


    //加入我的群组
    joinMyRoom = async (init: number):Promise<any> => {
        let rooms = DataMap.myRooms;
        if (0 == rooms.length) {
            let myRoomResponse = await imsdk.getMyRoom({ pageIndex: 0, pageSize: 10000 });

            return myRoomResponse;
            console.log(myRoomResponse);

            //     ,function(result){
            // 		if(myFn.isNil(result))
            // 			return;
            // 			var obj=null;
            // 			for (var i = 0; i < result.length; i++) {
            // 				obj=result[i];
            // 				DataMap.rooms[obj.id]=obj;
            // 				DataMap.myRooms[obj.jid]=obj;
            // 				//console.log("加入我的群组  "+obj.name);
            // 				setTimeout(function(jid){
            // 					WEBIM.joinGroupChat(jid, myData.userId);
            // 				},2000,obj.jid);

            // 			}
            // 			if(1==init)
            // 				DataUtils.setLogoutTime(0);

            // 	});	
            // }else {
            // 	for (var i = 0; i < rooms.length; i++) {
            // 				obj=rooms[i];
            // 		console.log("加入我的群组  "+obj.name);
            // 		setTimeout(function(jid){
            // 			GroupManager.joinGroupChat(jid, myData.userId);
            // 		},2000,obj.jid);
            // 	}
            // 	if(1==init)
            // 		DataUtils.setLogoutTime(0);
            // }


        }

    }
}
export default new GroupManager();