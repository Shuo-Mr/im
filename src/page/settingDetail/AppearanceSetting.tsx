import * as React from 'react';
import { SystemStore } from '../../store/SystemStore';
import { observer, inject } from 'mobx-react';
import './AppearanceSetting.less';
import { WithSettingDetailHead } from '../../component/WithSettingDetailHead/WithSettingDetailHead';

export interface IAppearanceSettingProps {
  systemStore: SystemStore
}

export interface IAppearanceSettingState {
  selectedTheme: 'default' | 'warm' | 'dark';
}

interface withStore extends IAppearanceSettingProps {
  systemStore: SystemStore
}

@inject('systemStore')
@observer
class AppearanceSetting extends React.Component<IAppearanceSettingProps, IAppearanceSettingState> {
  constructor(props: IAppearanceSettingProps) {
    super(props);

    // 从 localStorage 读取保存的主题设置
    const savedTheme = localStorage.getItem('_appearanceTheme') as 'default' | 'warm' | 'dark' | null;
    this.state = {
      selectedTheme: savedTheme || 'warm'
    };
  }
  
  get injected() {
    return this.props as withStore
  }
  
  themeOptions = [
    { name: '系统默认', key: 'default', color: '#3296FA' },
    { name: '暖色护眼', key: 'warm', color: '#D4A574' },
    { name: '深色模式', key: 'dark', color: '#1A1A1A' },
  ];
  
  changeTheme = (key: 'default' | 'warm' | 'dark') => {
    this.setState({ selectedTheme: key });
    localStorage.setItem('_appearanceTheme', key);
    
    // 在 html 元素上添加对应的主题类名
    const htmlElement = document.documentElement;
    // 移除所有主题类
    htmlElement.classList.remove('theme-warm', 'theme-dark');
    // 如果是默认主题，不添加类名；否则添加对应的主题类
    if (key !== 'default') {
      htmlElement.classList.add(`theme-${key}`);
    }
  }
  
  public render() {
    return (
      <div className="appearance-setting">
        <div className="theme-color-section">
          <div className="section-title">主题颜色</div>
          <div className="theme-options">
            {this.themeOptions.map((item, index) => {
              const isSelected = item.key === this.state.selectedTheme;
              return (
                <div 
                  key={index} 
                  className={`theme-option ${isSelected ? 'selected' : ''} theme-${item.key}`}
                  onClick={() => this.changeTheme(item.key as 'default' | 'warm' | 'dark')}
                >
                  <div 
                    className="theme-color-circle" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="theme-name">{item.name}</span>
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="example-section">
          <div className="section-title">示例</div>
          <div className="chat-preview">
            <div className={`message-bubble right ${this.state.selectedTheme}`}>
              小助手已经召唤美女小姐姐帮您来咯,下次记得找我玩儿哦!
            </div>
            <div className={`message-bubble left ${this.state.selectedTheme}`}>
              好呀!我会的。
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default WithSettingDetailHead('外观设置', AppearanceSetting);

