import * as React from 'react';
import { WithSettingDetailHead } from '../../component/WithSettingDetailHead/WithSettingDetailHead';

export interface IMesGroupSendProps {
  
}

export interface IMesGroupSendState {
}

class MesGroupSend extends React.Component<IMesGroupSendProps, IMesGroupSendState> {
  constructor(props: IMesGroupSendProps) {
    super(props);

    this.state = {
    }
  }

  public render() {
    return (
      <div style = {{lineHeight:'400px',textAlign:'center'}}>
        暂未开放
      </div>
    );
  }
}
export default WithSettingDetailHead('群发消息',MesGroupSend)
