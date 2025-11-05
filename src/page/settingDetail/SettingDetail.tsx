import * as React from 'react';
import { inject } from 'mobx-react';
import { SystemStore } from './../../store/SystemStore'
import { Switch, Route } from 'react-router';

import ClearCache from './ClearCache';
import ClearHistory from './ClearHistory';
import MesGroupSend from './MesGroupSend';
import SecretSet from './SecretSet';
import LanguageChange from './LanguageChange';
import PasChange from './PasChange';
import TipChange from './TipChange';
import MyInfo from './MyInfo';
import AboutUs from './Aboutus';
import { NoneData } from '../../component/noneDataView/NoneDataView';




export interface ISettingDetailProps {
}

export interface ISettingDetailState {
}
interface WithStore extends ISettingDetailState {
  systemStore: SystemStore
}
@inject('systemStore')
export default class SettingDetail extends React.Component<ISettingDetailProps, ISettingDetailState> {
  constructor(props: ISettingDetailProps) {
    super(props);

    this.state = {
    }
  }
  get injected() {
    return this.props as WithStore
  }
  public render() {

    return (
      <Switch>
        <Route exact path='/main/my/clearCache' component={ClearCache} />
        <Route exact path="/main/my/clearHistory" component={ClearHistory} />
        <Route exact path="/main/my/mesGroupSend" component={MesGroupSend} />
        <Route exact path="/main/my/secretSet" component={SecretSet} />
        <Route exact path="/main/my/languageChange" component={LanguageChange} />
        <Route exact path="/main/my/pasChange" component={PasChange} />
        <Route exact path="/main/my/tipChange" component={TipChange} />
        <Route exact path="/main/my/info" component={MyInfo} />
        <Route exact path="/main/my/aboutus" component={AboutUs} />
        <Route component={NoneData} />
      </Switch>
    );
  }
}
