import React from 'react';
import Select from 'antd/es/select';

interface ShowSelectProps {
 
    content: string[],
    type:string,
    onChange: (name: string) => void,
  
  }
  interface ShowSelectStates {
    isLoading: boolean,
    name: string,
    isOpen: boolean
    title: string
  }
export class ShowSelect extends React.Component<ShowSelectProps,ShowSelectStates>{
    constructor(props: ShowSelectProps) {
        super(props);
    }
    switchOpen = (e: any) => {
        if (e) {
          e.nativeEvent.stopImmediatePropagation();
        }
        this.setState(state => ({
          isOpen: !state.isOpen
        }))
      }
      handleChange = (name: string) => {
        this.setState({
          name
        })
        this.props.onChange(name);
    
      }

      render() {
        const optionsData = this.props.content;
        return (
       <div className="list-item" style={{ width: '100%' }} onClick={this.switchOpen}>
       

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