import React from 'react';
import Modal from 'antd/es/modal';
import Form from 'antd/es/form';
import { FormComponentProps } from 'antd/es/form'; // 引入FormComponentProps
import CustomSelect from '../customSelect';

// 定义组件自身Props，不包含form
export interface TagsModalViewOwnProps {
    title: string;
    value: any;
    options: any[]
    onAdd: (name: string[]) => void
    closeModal: () => void;
    isOk: (value: any) => void;
    isLoading?: boolean;
}

// 组合组件自身Props和Antd Form的Props
type ConfigurableProps = TagsModalViewOwnProps & FormComponentProps;

class TagsModalView extends React.Component<ConfigurableProps> {
    componentDidMount() {
        this.props.form.setFieldsValue(this.props.value)
        // 初始化时校验字段
    }

    handleOk = () => {
        this.props.form.validateFields((err: any, values: any) => {
            if (!err) {
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
                        label="标签"
                        style={{ width: '100%' }}
                    >
                        {getFieldDecorator('tags', {
                        })(
                            <CustomSelect onAdd={this.props.onAdd} options={this.props.options} />
                        )}
                    </Form.Item>
                </Form>
            </Modal>
        );
    }
}

// 使用Form.create创建高阶组件并导出
const TagsModalForm = Form.create<ConfigurableProps>()(TagsModalView);
export default TagsModalForm;