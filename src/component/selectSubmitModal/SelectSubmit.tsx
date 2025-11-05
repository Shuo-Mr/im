import React from 'react';
import Select from 'antd/es/select';
import './selectsubmit.less'
import loginStore from '../../store/LoginStore';



// const { Option } = Select;
interface SelectSubmitProps {
  title: string,
  content: string[],
  type:string,
  onChange: (name: string) => void,

}
interface SelectSubmitStates {
  isLoading: boolean,
  name: string,
  isOpen: boolean
  title: string
}
export class SelectSubmit extends React.Component<SelectSubmitProps, SelectSubmitStates>{
  constructor(props: SelectSubmitProps) {
    super(props);
    this.state = {
      isLoading: false,
      name: this.getName() ? String(this.getName()) : this.props.content[1],
      isOpen: false,
      title: "名字"
    }
  }

  getName = () => {
    if(this.props.type=="chatSyncTimeLen")
    {
      switch (loginStore.userSetting.chatSyncTimeLen) {
        case 0:
          return "永久";
        case -1:
          return "永久";
        case -2:
          return "不同步";
        case 0.04:
          return "一小时";
        case 1.0:
          return "一天";
        case 7:
          return "一周";
        case 30:
          return "一月";
        case 90:
          return "一季";
        case 365:
          return "一年";
        default:
          return "不同步";
      }
    }
    else if(this.props.type=="showLastLoginTime")
    {
      switch (loginStore.userSetting.showLastLoginTime) {
        case -1:
          return "所有人不允许";
        case 1:
          return "所有人允许";
        case 2:
          return "所有好友允许";
        case 3:
          return "手机联系人允许";

        default:
          return "所有人允许";
      }
    }else if(this.props.type=="showTelephone")
    {
      switch (loginStore.userSetting.showTelephone) {
        case -1:
          return "所有人不允许";
        case 1:
          return "所有人允许";
        case 2:
          return "所有好友允许";
        case 3:
          return "手机联系人允许";

        default:
          return "所有人允许";
      }
    }
      else{
        return "";
      }
   

  }
  handleChange = (name: string) => {
    this.setState({
      name
    })
    this.props.onChange(name);

  }
  switchOpen = (e: any) => {
    if (e) {
      e.nativeEvent.stopImmediatePropagation();
    }
    this.setState(state => ({
      isOpen: !state.isOpen
    }))
  }
  hide = () => {
    this.setState(state => ({
      isOpen: false
    }))
  }
  componentDidMount() {
    document.addEventListener('click', this.hide)
  }
  render() {
    const optionsData = this.props.content;

    return (

      <div className="list-item" style={{ width: '100%' }} onClick={this.switchOpen}>
        <div className="title"> {this.props.title} </div>

        <span className="select-lits-item">
          <span style={{ position: 'absolute' }}>
            {this.state.name} >
          </span>

          <Select style={{ width: '120' }} open={this.state.isOpen} value={this.state.name} onChange={this.handleChange}>

            {optionsData.length && optionsData.map((item: any, index: any) => (
              <Select.Option key={index} value={item}>{item}</Select.Option>)
            )}
          </Select>
        </span>


      </div>
    )
  }
} 