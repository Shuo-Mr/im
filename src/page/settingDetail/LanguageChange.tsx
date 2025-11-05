import * as React from 'react';
import { SystemStore, languaConfig } from '../../store/SystemStore';
import { observer, inject } from 'mobx-react';
import Icon from 'antd/es/icon';
import './LanguageChange.less'
import { WithSettingDetailHead } from '../../component/WithSettingDetailHead/WithSettingDetailHead';

export interface ILanguageChangeProps {
  systemStore: SystemStore
}

export interface ILanguageChangeState {
}
interface withStore extends ILanguageChangeProps {
  systemStore: SystemStore
}
@inject('systemStore')
@observer
class LanguageChange extends React.Component<ILanguageChangeProps, ILanguageChangeState> {
  constructor(props: ILanguageChangeProps) {
    super(props);

    this.state = {
    }
  }
  get injected() {
    return this.props as withStore
  }
  lanOption = [
    { name: languaConfig['zh-CN'], key: 'zh-CN' },
    { name: languaConfig['zh-hant'], key: 'zh-hant' },
    { name: languaConfig['en-US'], key: 'en-US' },
  ];
  changeLanguage = (key : string) => {
   // message.warn('暂未开放')
    this.injected.systemStore.changeLangua(key)
  }
  public render() {
    const { systemStore } = this.injected;
    return (
      <div className = "lan-list">
        {
          this.lanOption.map((item, index) => {
            return (
              <div key={index} className = "lan-item with-click" onClick = {() => this.changeLanguage(item.key)}>
                <span>
                  {item.name}
                </span>
                <span>
                  {
                    item.key == systemStore.language
                      ? <Icon type="check" style={{ color: '#3296FA',fontSize:'16px' }} />
                      : null
                  }
                </span>
              </div>
            )
          })
        }
      </div>
    );
  }
}
export default WithSettingDetailHead('语言切换',LanguageChange)