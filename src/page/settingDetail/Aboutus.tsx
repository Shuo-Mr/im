import * as React from 'react';
import ipcRender from '../../ipcRender';
import { WithSettingDetailHead } from '../../component/WithSettingDetailHead/WithSettingDetailHead';
import systemStore from '../../store/SystemStore';
import config from './../../../package.json'

export interface IAboutUsProps {
}

export interface IAboutUsState {
}

class AboutUs extends React.Component<IAboutUsProps, IAboutUsState> {
    constructor(props: IAboutUsProps) {
        super(props);
    }

    public render() {
        const versionG = ipcRender?ipcRender.getAppRevision():'';
        const rev = versionG?versionG:config.version;
        let styles = {
            lineHeight: "180px",
            WebkitUserDrag: "none",
            width: '128px'
        }
        return (
            <div style={{ textAlign: 'center', marginTop: "122px" }}>
                <img src={systemStore.projectLogo} style={{ ...styles }}></img>
                <br></br>
                <div style={{ fontSize: "18px", marginTop: "10px", WebkitUserSelect: 'none', fontWeight: 500 }} onClick={() => {
                    ipcRender && ipcRender.ipcRenderer && ipcRender.ipcRenderer.send('openCheckRemote', 'checkUpdate');
                }}>
                    {'系统版本:' + rev}
                </div>
            </div>
        );
    }

}
export default WithSettingDetailHead('关于我们', AboutUs)