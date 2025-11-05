import Select from 'antd/es/select';
import './login.scss'
import * as React from "react";
const Option = Select.Option;
export type countryItem = {
    string: string[],
    id: string,
    key: string
}
interface Props {
    countryList: countryItem[],
    changeCountry: (item: string) => void
}
export default class CountrySelect extends React.Component<Props, null>{
    render(){
        const {countryList} = this.props;
        return (

            <div>
                <Select
                    showSearch
                    style={{width:300,fontSize:14}}
                    placeholder="中国"
                    optionFilterProp="children"
                    onChange={this.props.changeCountry}
                >
                    {
                        countryList.map((item, index) => {
                            return <Option value={item.id + '/' + item.string} key={index}>{item.string} +{item.id}</Option>
                        })
                    }

                </Select>
            </div>
        )
    }
}