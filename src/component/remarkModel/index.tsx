import React from 'react';
import Modal from 'antd/es/modal';
import Form from 'antd/es/form';
import { FormComponentProps } from 'antd/es/form'; // 引入FormComponentProps
import './index.less';
import { CustomInput } from '../customInput';

// 定义组件自身Props，不包含form
export interface RemarkModalViewOwnProps {
    title: string;
    value: any;
    closeModal: () => void;
    isOk: (value: any) => void;
    isLoading?: boolean;
}

// 组合组件自身Props和Antd Form的Props
type ConfigurableProps = RemarkModalViewOwnProps & FormComponentProps;

class RemarkModalView extends React.Component<ConfigurableProps> {
    componentDidMount() {
        this.props.form.setFieldsValue(this.props.value)
        // 初始化时校验字段
    }

    handleOk = () => {
        this.props.form.validateFields((err: any, values: any) => {
            if (!err) {
                console.log('Received values of form: ', values);
                this.props.isOk(values);
            }
        });
    };

    render() {
        const { getFieldDecorator, } = this.props.form;
        const { title, closeModal, isLoading } = this.props;

        // 检查字段错误

        return (
            <Modal
                mask={false}
                centered
                title={title}
                visible={true}
                width={340}
                okText={'确定'}
                cancelText={'取消'}
                onOk={this.handleOk} // 使用封装好的handleOk
                onCancel={closeModal}
                confirmLoading={isLoading}
            >
                <Form
                    labelCol={{ span: 4 }}
                    wrapperCol={{ span: 20 }}
                    layout="horizontal" // 可以选择 'horizontal'|'vertical'|'inline'
                >
                    <Form.Item
                        label="备注"
                        style={{ width: '100%' }}
                    >
                        {getFieldDecorator('remark', {
                        })(<CustomInput placeholder="请输入备注" />)}
                    </Form.Item>
                    <Form.Item
                        label="描述"
                        style={{ width: '100%' }}
                    >
                        {getFieldDecorator('desc', {
                        })(<CustomInput type="textarea" placeholder="请输入描述" />)}
                    </Form.Item>
                </Form>
            </Modal>
        );
    }
}

// 使用Form.create创建高阶组件并导出
const RemarkModalForm = Form.create<ConfigurableProps>()(RemarkModalView);
export default RemarkModalForm;