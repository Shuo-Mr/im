import * as React from 'react';
import { WithSettingDetailHead } from '../../component/WithSettingDetailHead/WithSettingDetailHead';

export interface IClearCacheProps {
}

export interface IClearCacheState {
}

class ClearCache extends React.Component<IClearCacheProps, IClearCacheState> {
  constructor(props: IClearCacheProps) {
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
export default WithSettingDetailHead('清除记录',ClearCache)