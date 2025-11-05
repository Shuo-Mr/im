import React, { useEffect, useRef, useState } from 'react';
import Modal from 'antd/es/modal';
import Input from 'antd/es/input';
import './InputModal.less'
import { Dropdown, Menu, message } from 'antd';
export interface IInputModalViewProps {
    title: string,
    label: string,
    value: string
    closeModal: () => void,
    isOk: (value: string) => void,
    isLoading?: boolean
}
const electron = window['electron'];


export function InputModalView(props: IInputModalViewProps) {
    const [value, setValue] = useState(props.value);
    const [showMenu, setMenu] = useState(false)
    const inputRef = useRef<Input>(null)


    // 文本选择监听
    const handleSelectionChange = () => {
        const textarea = inputRef.current;

        if (textarea) {
            const input = textarea.input;
            const hasTextSelected = input.selectionStart !== input.selectionEnd;
            setMenu(hasTextSelected)
        }
    };
    useEffect(() => {
        const textarea = inputRef.current;
        if (!textarea) return
        const input = textarea.input;

        input.addEventListener('mouseup', handleSelectionChange);
        input.addEventListener('keyup', handleSelectionChange);
        input.addEventListener('select', handleSelectionChange);

        return () => {
            input.removeEventListener('mouseup', handleSelectionChange);
            input.removeEventListener('keyup', handleSelectionChange);
            input.removeEventListener('select', handleSelectionChange);
        }
    }, [value])

    const selectAllText = () => {
        const textarea = inputRef.current;
        if (!textarea) return;
        const input = textarea.input;

        input.select();
    };


    const pasteText = () => {

        const textarea = inputRef.current;
        if (!textarea) return;
        const { clipboard } = electron
        const input = textarea.input;

        const text = clipboard.readText()
        if (!text) return
        const start = input.selectionStart === null ? value.length - 1 : input.selectionStart;
        const end = input.selectionEnd || value.length - 1;
        const newValue = value.substring(0, start) +
            text +
            input.value.substring(end);
        setValue(newValue)
        message.success('粘贴成功')
    }

    const copyText = () => {

        const textarea = inputRef.current;
        if (!textarea) return;
        const input = textarea.input;
        const start = input.selectionStart === null ? value.length - 1 : input.selectionStart;
        const end = input.selectionEnd || value.length - 1;
        const selectedText = input.value.substring(
            start,
            end
        );
        const { clipboard } = electron
        clipboard.writeText(selectedText)
        message.success('复制成功')
    }





    const menuDom = (
        <Menu>
            <Menu.Item key="1" onClick={copyText} disabled={!showMenu}>复制</Menu.Item>
            <Menu.Item key="2" onClick={pasteText}>粘贴</Menu.Item>
            <Menu.Item key="3" onClick={selectAllText}>全选</Menu.Item>
        </Menu>
    );

    return (
        <Modal
            mask={false}
            centered
            title={props.title}
            visible={true}
            width={340}
            okText={'确定'}
            cancelText={'取消'}
            onOk={() => props.isOk(value)}
            onCancel={props.closeModal}
            confirmLoading={props.isLoading}
        >
            <div className="input-wrap">
                <span className="title">
                    {props.label}
                </span>
                <Dropdown
                    overlay={menuDom}
                    trigger={['contextMenu']}
                >
                    <Input type='text' value={value}
                        maxLength={30}
                        ref={inputRef}
                        placeholder={`请输入${props.label}`}
                        onChange={(e) => {
                            setValue(e.target.value)
                        }} />
                </Dropdown>

            </div>
        </Modal>
    );
}
