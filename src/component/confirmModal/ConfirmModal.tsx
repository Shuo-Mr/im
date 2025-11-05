import Modal from 'antd/es/modal';

const { confirm } = Modal;
export function ConfirmCommon (title: string, callBack: Function){
    confirm({
        title: title,
        content: '',
        centered: true,
        okText:'确认',
        cancelText: '取消',
        onOk() {
            callBack()
        },
        onCancel() {

        },
    });
}