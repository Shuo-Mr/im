import React, { useState, useCallback } from 'react';
import groupStore from "../../../store/GroupStore";
import { AvatorWithPhoto } from "../../avatorWithPhoto/AvatorWithPhoto";
import { ChatGrOrFrType } from '../../../interface/IChat';
import chatStore from "../../../store/ChatStore";
import Spin from 'antd/es/spin';
import Popover from 'antd/es/popover';

export default function UnRendList({ messageId, unreadCount }: any) {

    const [unReadData, setUnReadData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [unReadNum, setUnReadNum] = useState(groupStore.getGroupMemberNum() - 1);

    const fetchData = useCallback(async () => {
        setLoading(true);
        let data = await chatStore.getReadInfo(messageId);
        setUnReadData(data.members)
        setUnReadNum(data.unreadCount)
        setLoading(false);
    }, [unreadCount]);

    const content = (
        <div className="read-list">
            <div className='list-tip'>
                <span style={{ fontSize: 20, fontWeight: 700 }}>{`${unReadNum}`}</span>
                <span>人未读</span>
            </div>
            <div className='list'>

                {unReadData.map((item: any, index) => (
                    <div className='list-item' key={index}>
                        <AvatorWithPhoto id={item.userId} type={ChatGrOrFrType.friend} size={30} classN='list-item-avator' />
                        <span className="friend-name">{item.nickname}</span>
                    </div>

                ))}
            </div>
            {/* <div className='list'>
      {`${this.state.unReadNum}人已读`}
      <div className='list-item'>
        <AvatorWithPhoto id={'000000'} type={ChatGrOrFrType.friend} size={30} />
        <span className="friend-name">{'张三'}</span>
      </div>
    </div> */}
        </div>
    )
    const onClickReadInfo = () => {
        fetchData();
    }
    let tip = unReadNum == 0 || unreadCount == 0 ? '全部已读' : `${unreadCount || unReadNum}人未读`;
    return (
    (tip==='全部已读') ? <div style={{fontSize: "10px",cursor: "pointer",color: "var(--secondary-text-color)"}}>{tip}</div> :
            <Popover trigger='click' placement="left" content={loading ? <Spin size="small" /> : content} title="消息未读成员列表">
                <div className='message-body-read' onClick={onClickReadInfo}> {tip}</div>
            </Popover>
    )
}