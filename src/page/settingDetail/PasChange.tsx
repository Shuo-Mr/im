import * as React from 'react';
import Form from 'antd/es/form';
import Input from 'antd/es/input';
import Select from 'antd/es/select';
import Button  from 'antd/es/button';
import Modal  from 'antd/es/modal';
import message  from 'antd/es/message';
import { FormComponentProps } from 'antd/lib/form';
import systemStore from '../../store/SystemStore';
import loginStore from '../../store/LoginStore';
import { tr } from '../../i18n/tr';
import { WithSettingDetailHead } from '../../component/WithSettingDetailHead/WithSettingDetailHead';
import deviceManager from '../../net/DeviceManager';
const { Option } = Select;
export interface IPasChangeProps {
}

export interface IPasChangeState {
}

class PasChange extends React.Component<IPasChangeProps, IPasChangeState> {
  constructor(props: IPasChangeProps) {
    super(props);
  }

  public render() {
    return (
      <div style={{ display: 'flex', paddingTop:'20%', justifyContent: 'center', height: '100%' }}>
        <div style={{ maxWidth: '400px',width: '80%' }}>
          <FormPasView telephone={systemStore.telephone} />
        </div>
      </div>
    );
  }
}

interface changePasFormProps extends FormComponentProps {
  telephone: string
}
class changePasForm extends React.Component<changePasFormProps, any> {
  constructor(props: changePasFormProps) {
    super(props)
    this.state = {
      confirmDirty: false,
      autoCompleteResult: [],
      isLoading: false
    };
  }
  handleSubmit = async (e: any) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll(async (err, values) => {
      if (!err) {
        this.setState({
          isLoading: true
        })
        const { confirm, ...otherPas } = values
        const params = {
          access_token: '',
          ...otherPas,
        }
        const res = await loginStore.changePas(params);
        deviceManager.sendUpdateSelfInfoMsg();
        if (res.status) {
          let secondsToGo = 5;
          const modal = Modal.success({
            title: '修改密码成功',
            okText:'确认',
            content: `密码已重置， ${secondsToGo}s 之后将重新登录，或点击确认前往重新登录.`,
            onOk: () =>{
              systemStore.access_token = ''
            }
            
          });
          
          const timer = setInterval(() => {
            secondsToGo -= 1;
            modal.update({
              content: `密码已重置， ${secondsToGo}s 之后将重新登录，或点击确认前往重新登录.`,
            });
          }, 1000);
          let timerC = setTimeout(() => {
            clearTimeout(timerC);
            clearInterval(timer);
            systemStore.access_token = ''
            modal.destroy();
          }, secondsToGo * 1000);
        } else {
          this.setState({
            isLoading: false
          })
          message.warn(res.info)
        }
      }
    });
  };
  handleConfirmBlur = (e: any) => {
    const { value } = e.target;
    this.setState({ confirmDirty: this.state.confirmDirty || !!value });
  };
  compareToFirstPassword = (rule: any, value: any, callback: any) => {
    const { form } = this.props;
    if (value && value !== form.getFieldValue('newPassword')) {
      callback(tr(56));
    } else {
      callback();
    }
  };
  validateToNextPassword = (rule: any, value: any, callback: any) => {
    const { form } = this.props;
    if (value && this.state.confirmDirty) {
      form.validateFields(['confirm'], { force: true });
    }
    callback();
  };
  render() {
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 8 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 },
      },
    };
    const { getFieldDecorator } = this.props.form;
    const isTelePhoneLogin = systemStore.regeditPhoneOrName == 0;
    let prefixSelector;
    if(isTelePhoneLogin)
    {
      prefixSelector= getFieldDecorator('areaCode', {
        initialValue: '86',
      })(
        <Select disabled={true} style={{ width: 70 }}>
          <Option value="86">+86</Option>
          <Option value="87">+87</Option>
        </Select>,
      );
    }else
    {
      prefixSelector='';
    }
    
    const tailFormItemLayout = {
      wrapperCol: {
        xs: {
          span: 24,
          offset: 0,
        },
        sm: {
          span: 16,
          offset: 8,
        },
      },
    };
    return (
      <Form {...formItemLayout} onSubmit={this.handleSubmit}>
        <Form.Item label={tr(52)}>
          {getFieldDecorator('telephone', {
            rules: [{ required: true, message: '请输入手机号!' }],
          })(<Input addonBefore={prefixSelector} disabled={true} style={{ width: '100%' }} />)}
        </Form.Item>
        <Form.Item label={tr(53)} hasFeedback>
          {getFieldDecorator('oldPassword', {
            rules: [
              {
                required: true,
                message: '请输入原始密码!',
              },
              {
                validator: this.validateToNextPassword,
              },
            ],
          })(<Input.Password />)}
        </Form.Item>
        <Form.Item label={tr(54)} hasFeedback>
          {getFieldDecorator('newPassword', {
            rules: [
              {
                required: true,
                message: '请输入密码!',
              },
              {
                validator: this.validateToNextPassword,
              },
            ],
          })(<Input.Password />)}
        </Form.Item>
        <Form.Item label={tr(55)} hasFeedback>
          {getFieldDecorator('confirm', {
            rules: [
              {
                required: true,
                message: '请输入确认密码!',
              },
              {
                validator: this.compareToFirstPassword,
              },
            ],
          })(<Input.Password onBlur={this.handleConfirmBlur} />)}
        </Form.Item>
        <Form.Item {...tailFormItemLayout}>
          <Button type="primary" htmlType="submit" loading={this.state.isLoading}>
            {tr(54)}
          </Button>
        </Form.Item>
      </Form>
    )
  }
}
const FormPasView = Form.create<changePasFormProps>(
  {
    mapPropsToFields(props) {
      // console.log(loginData.loginDataUser)
      return {
        telephone: Form.createFormField({ value: props.telephone }),
      };
    },
  }
)(changePasForm)

export default WithSettingDetailHead('修改密码',PasChange)