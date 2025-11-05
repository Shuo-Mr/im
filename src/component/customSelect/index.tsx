import React from "react";
import { Select } from "antd";
const { Option } = Select;
type Props = {
    options: any[]
    value?: any[]
    onChange?: (v: any) => void
    onAdd?: (v: string[]) => void
}
// 用于标签
export default function CustomSelect({ onChange, value, onAdd, options }: Props) {


    const children = options.map((i) => {
        return <Option key={i.groupName || i.groupId}>{i.groupName || ''}</Option>
    })

    function handleChange(newValues: any) {

        const addedTags = newValues.filter((item: string) => !(value || []).includes(item));
        // 如果找到了新增的 Tag，执行你的业务逻辑
        if (addedTags.length > 0) {
            onAdd && onAdd(addedTags)
        }
        onChange && onChange(newValues)
    }

    return <Select mode="tags" value={value} style={{ width: '100%' }} onChange={handleChange} tokenSeparators={[',']}>
        {children}
    </Select>
}