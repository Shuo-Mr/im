import React, { Component } from 'react';
import Drawer from 'antd/es/drawer';
import Icon from 'antd/es/icon';
// import Button  from 'antd/es/button';
// import message  from 'antd/es/message';
import moment from 'moment';
import   './groupInfoDrawer.less';
import imsdk from '../../net/IMSDK';
import  chatStore  from '../../store/ChatStore';
import { AvatorWithPhoto } from '../../component/avatorWithPhoto/AvatorWithPhoto';
import Utils from "../../utils/utils";
import Input from 'antd/es/input';
import Pagination from 'antd/es/Pagination';


interface Iprops {
    closeAll: () => void,
    isGroup: boolean
}
interface Istate {
    infoContent: string,
    allList: Array<any>,
    showList: Array<any>,
    filterType: Array<number>,
    searchStr: string,
    current: number,
    pageSize: number,
    total: number
}

let timeout:any = 0

export class ChatListDraw extends Component<Iprops, Istate> {
    constructor(props: Iprops) {
        super(props);
        this.state = {
            infoContent: '',
            allList: [],
            showList: [],
            filterType: [1, 2, 6, 9],
            searchStr: '',
            current: 1,
            pageSize: 30,
            total: 0
        }
    }
    componentDidMount () {
        setTimeout(() => {
            this.getAllList()
        }, 500)
    }
    changeTab = (arr:Array<number>) => {
        this.setState({
            filterType: arr,
            current: 1,
            searchStr: ''
        })
        setTimeout(() => {
            this.getAllList()
        }, 0)
    }
    getTabClassName = (arr:Array<number>) => {
        if (this.state.filterType.toString() == arr.toString()) return 'chathis-tab chathis-tab-active'
        return 'chathis-tab'
    }
    pageChange = (page: number) => {
        this.setState({
            current: page
        })
        setTimeout(() => {
            this.getAllList()
        }, 0)
    }
    getAllList = async () => {
        let historyRet = await imsdk.getHistoryList(
            this.state.current - 1,
            this.state.pageSize,
            this.state.searchStr,
            this.state.filterType,
            this.props.isGroup,
            chatStore.currentChatData.id);
        if (historyRet.resultCode == 1) {
            // 滚动到顶部
            if (this.chatBox) {
                this.chatBox.scrollTop = 0
            }
            const allList = historyRet.data.data.map((item:any) => {
                try {
                    item._body = JSON.parse(item.body)
                } catch {
                    item._body = {}
                }
                return item
            })
            this.setState({
                allList: allList,
                total: historyRet.data.count
            })
        }
    }
    goSearch = (e:any) => {
        this.setState({
            searchStr: e.target.value,
            current: 1
        })
        if (timeout) clearTimeout(timeout)
        timeout = setTimeout(() => {
            setTimeout(() => {
                this.getAllList()
            }, 0)
        }, 1000)
    }
    chatBox: HTMLDivElement | null = null;
    download = (url:string, name: string) => {
        let a = document.createElement("a");
        a.download = name
        a.href = url;
        var event = new MouseEvent("click"); // 模拟鼠标click点击事件
        a.target = "_blank"; // 设置a节点的download属性值
        a.dispatchEvent(event);
    }
    render() {
        const { closeAll } = this.props;
        let header = (
            <div onClick={closeAll} style={{ cursor: 'pointer' }}>
                <Icon type="left" style={{ fontSize: '12px', marginRight: '4px', verticalAlign: 'middle', lineHeight: '22px' }} />
                <span>
                    聊天记录
                </span>
            </div>
        )
        return (
            <>
                <Drawer
                    title={header}
                    onClose={closeAll}
                    visible={true}
                    width={600}
                >
                    <div className="chathis-body">
                        <div className="chathis-search">
                            <Input  value = {this.state.searchStr} onChange = {this.goSearch} className="chathis-search-input" type="text" placeholder='请输入搜索内容' />
                        </div>
                        <div className="chathis-tabs">
                            <div onClick={() => this.changeTab([1, 2, 6, 9])} className={this.getTabClassName([1,2,6,9])}>全部</div>
                            <div onClick={() => this.changeTab([9])} className={this.getTabClassName([9])}>文件</div>
                            <div onClick={() => this.changeTab([2, 6])} className={this.getTabClassName([2,6])}>图片与视频</div>
                        </div>
                        <div className="chathis-box" ref={ref => this.chatBox = ref}>
                            {
                                this.state.allList.map((item:any) => {
                                    return <div className="chathis-box-item">
                                        <div className="chathis-box-item_left">
                                            <div className="chathis-box-item_left_avatar">
                                                <AvatorWithPhoto id={item.sender} type={0} size={48} />
                                            </div>
                                            {/* <div className="chathis-box-item_left_name">{item._body.fromUserName}</div> */}
                                        </div>
                                        <div className="chathis-box-item_right">
                                            <div className="chathis-box-item_right_time">
                                                <span>{item._body.fromUserName}</span>
                                                <span>{moment(item.timeSend * 1000).format("YYYY-MM-DD HH:mm:ss")}</span>
                                            </div>
                                            <div className="chathis-box-item_right_content">
                                                {
                                                    item.contentType == 1 ? // 文本
                                                        <span>{item.content}</span>
                                                    :
                                                    (
                                                        item.contentType == 2 ? // 图片
                                                            <img style={{maxWidth: "300px"}} src={item.content} alt="img" />
                                                        :
                                                        (
                                                            item.contentType == 6 ? // 视频
                                                                <div className="chathis-box-item_a" onClick={() => this.download(item.content, item._body.fileName)}>
                                                                    [视频] {item._body.fileName}
                                                                </div>
                                                            :
                                                            (
                                                                item.contentType == 9 ? // 文件
                                                                <div className="chathis-box-item_a" onClick={() => this.download(item.content, item._body.fileName)}>
                                                                    [文件] {item._body.fileName} {Utils.formatSizeToUnit(parseFloat(item._body.fileSize))}
                                                                </div>
                                                                : null
                                                            )
                                                        )
                                                    )
                                                }
                                            </div>
                                        </div>
                                    </div>
                                }) 
                            }
                            
                        </div>
                        <Pagination style={{margin: '10px auto 0 auto'}} current={this.state.current} pageSize={this.state.pageSize} total={this.state.total} onChange={this.pageChange} size="small" />
                    </div>
                </Drawer>
            </>
        )
    }
}

