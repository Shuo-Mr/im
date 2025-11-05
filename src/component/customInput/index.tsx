import { Dropdown, Input, Menu, message } from "antd";
import TextArea from "antd/es/input/TextArea";
import React, { useEffect, useRef, useState } from "react";

const electron = window['electron'];

type Props = {
    value?: string
    onChange?: (v: string) => void
    type?: 'textarea' | 'input'
    placeholder?: string
}

export function CustomInput(props: Props) {
    const [value, setValue] = useState(props.value || '');
    const [showMenu, setMenu] = useState(false)
    const inputRef = useRef<Input>(null)
    const textareaRef = useRef<TextArea>(null)

    // 获取当前活动的输入元素
    const getActiveElement = () => {
        return props.type === 'textarea' ? textareaRef.current : inputRef.current;
    };

    // 获取输入元素的值
    const getInputValue = () => {
        const element = getActiveElement();
        if (!element) return '';
        
        if (props.type === 'textarea') {
            return (element as TextArea).resizableTextArea.textArea.value;
        } else {
            return (element as Input).input.value;
        }
    };

    // 获取输入元素的DOM节点
    const getInputDOM = () => {
        const element = getActiveElement();
        if (!element) return null;
        
        if (props.type === 'textarea') {
            return (element as TextArea).resizableTextArea.textArea;
        } else {
            return (element as Input).input;
        }
    };

    // 文本选择监听
    const handleSelectionChange = () => {
        const input = getInputDOM();
        if (!input) return;

        const hasTextSelected = input.selectionStart !== input.selectionEnd;
        setMenu(hasTextSelected)
    };

    useEffect(() => {
        const input = getInputDOM();
        if (!input) return;

        input.addEventListener('mouseup', handleSelectionChange);
        input.addEventListener('keyup', handleSelectionChange);
        input.addEventListener('select', handleSelectionChange);

        return () => {
            input.removeEventListener('mouseup', handleSelectionChange);
            input.removeEventListener('keyup', handleSelectionChange);
            input.removeEventListener('select', handleSelectionChange);
        }
    }, [value, props.type]) // 添加 props.type 作为依赖

    const copyText = () => {
        const input = getInputDOM();
        if (!input) return;

        const start = input.selectionStart === null ? value.length - 1 : input.selectionStart;
        const end = input.selectionEnd || value.length - 1;
        const selectedText = input.value.substring(start, end);
        
        const { clipboard } = electron
        clipboard.writeText(selectedText)
        message.success('复制成功')
        setMenu(false)
    }

    const selectAllText = () => {
        const input = getInputDOM();
        if (!input) return;

        input.select();
        setMenu(true)
    };

    const pasteText = () => {
        const input = getInputDOM();
        if (!input) return;

        const { clipboard } = electron
        const text = clipboard.readText()
        if (!text) return

        const start = input.selectionStart === null ? value.length - 1 : input.selectionStart;
        const end = input.selectionEnd || value.length - 1;
        
        const currentValue = getInputValue();
        const newValue = currentValue.substring(0, start) +
            text +
            currentValue.substring(end);
        
        setValue(newValue)
        props.onChange && props.onChange(newValue)
        message.success('粘贴成功')
    }

    const menuDom = (
        <Menu>
            <Menu.Item key="1" onClick={copyText} disabled={!showMenu}>复制</Menu.Item>
            <Menu.Item key="2" onClick={pasteText}>粘贴</Menu.Item>
            <Menu.Item key="3" onClick={selectAllText}>全选</Menu.Item>
        </Menu>
    );

    return (
        <Dropdown
            overlay={menuDom}
            trigger={['contextMenu']}
        >
            {props.type === 'textarea' ? 
                <Input.TextArea
                    maxLength={200}
                    ref={textareaRef}
                    value={value}
                    placeholder={props.placeholder}
                    onChange={(e) => {
                        setValue(e.target.value)
                        props.onChange && props.onChange(e.target.value)
                    }}
                /> : 
                <Input 
                    type='text' 
                    value={value}
                    maxLength={30}
                    ref={inputRef}
                    placeholder={props.placeholder}
                    onChange={(e) => {
                        setValue(e.target.value)
                        props.onChange && props.onChange(e.target.value)
                    }} 
                />
            }
        </Dropdown>
    )
}