import * as React from 'react';
import { inject, observer } from 'mobx-react';
import { CreateGroupList } from './CreateGroupList';
import { CrtGrConfirm } from './CrtGrConfirm';

export interface ICreatGroupProps {
}

export interface ICreatGroupState {
    isConfirm: boolean

}
@inject('friendStore')
@observer
export class CreatGroup extends React.Component<ICreatGroupProps, ICreatGroupState> {
    constructor(props: ICreatGroupProps) {
        super(props);

        this.state = {
            isConfirm: false
        }
    }
    switchConfirm = () => {
        this.setState(state => ({
            isConfirm: !state.isConfirm
        }))
    }
    public render() {
        let CurrentCreateView = (
            <CreateGroupList goConfirm = {this.switchConfirm}/>
            
        );
        if(this.state.isConfirm){
            CurrentCreateView = <CrtGrConfirm goBack = {this.switchConfirm}/>
        }
        return CurrentCreateView
    }
}
