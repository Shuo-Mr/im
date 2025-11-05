import * as React from 'react';
import { SystemStore } from '../../store/SystemStore';
import { observer, inject } from 'mobx-react';
import Switch from 'antd/es/switch';
import { WithSettingDetailHead } from '../../component/WithSettingDetailHead/WithSettingDetailHead';
export interface TipChangeProps {
  systemStore: SystemStore
}

export interface TipChangeState {
}
interface withStore extends TipChangeProps {
  systemStore: SystemStore
}
@inject('systemStore')
@observer
class TipChange extends React.Component<TipChangeProps, TipChangeState> {
  constructor(props: TipChangeProps) {
    super(props);

    this.state = {
    }
  }
  get injected() {
    return this.props as withStore
  }
  componentDidMount () {}
  setTip = (val:boolean) => {
    setTimeout(() => {
      localStorage.setItem('_tipSwitch', val ? '' : '1')
    })
  }
  public render() {
    let tipSwitch:number = (localStorage.getItem('_tipSwitch') ? 0 : 1)
    return (
      <div style={{padding:'40px 20px'}}>
        <div>
          消息提示音开关：
          <Switch defaultChecked={!!(tipSwitch)} key={tipSwitch} onChange={this.setTip}></Switch>
        </div>
      </div>
    );
  }
}
export default WithSettingDetailHead('提示音设置', TipChange)