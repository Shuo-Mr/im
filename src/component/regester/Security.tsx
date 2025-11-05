import React, { FormEvent, useState, memo } from 'react';
import Form from 'antd/es/form';
import Input from 'antd/es/input';
import Button from 'antd/es/button';
import Select from 'antd/es/select';
import message from 'antd/es/message';
import { FormComponentProps } from 'antd/lib/form/Form';
import Icon from 'antd/es/icon';
import './Security.less'
import imsdk from '../../net/IMSDK';
import loginStore from '../../store/LoginStore';
import Spin from 'antd/es/spin';
import { tr } from '../../i18n/tr';


interface ISecurityProps {
    goback: () => void;
    QuestListData: QuestListData

}
export class Security extends React.Component<ISecurityProps & FormComponentProps>{
    regester = (e: FormEvent) => {
        // e.preventDefault();
        this.props.form.validateFields((err: any, values: any) => {
            if (!err) {
                //  console.log('表单的值', values);
                loginStore.changeAnswer(values);
                loginStore.hasChangeSecret(true);
                this.props.goback();
            }
            else {
                loginStore.hasChangeSecret(false);
                message.warn('提交失败');
            }
        });


    }
    // getAnswerOne = () => {
    //     return loginStore.answer;
    // }
    // handleChange = (value: string) => {
    //     console.log(`selected ${value}`);
    // }

    render() {
        const { getFieldDecorator } = this.props.form;

        return (
            <div className="login-a regeister-a">
                <div className="form-wraper-a">
                    <Form onSubmit={this.regester} className="login-form-a" id="login-view-a" layout="vertical">
                        <div className="head-back">
                            <Icon type="left-circle" onClick={this.props.goback} ></Icon>
                        </div>
                        <div className="regester-center">
                            <h1 className="title-a">
                                设置密保问题
                            </h1>
                            <p className="title-text">请牢记密保问题答案，如果忘记密码，可以通过密保问题进行充值密码</p>

                            <Form.Item label='问题一:'>
                                {getFieldDecorator('questionone', {
                                    rules: [{ required: false, message: tr(184) }]
                                })(
                                    <Select style={{ width: 305 }} >
                                        {this.props.QuestListData.quest_1.options.length && this.props.QuestListData.quest_1.options.map((item: string[]) => (
                                            <Select.Option key={item[0]} value={item[0]}>{item[1]}</Select.Option>)
                                            )
                                        }
                                    </Select>
                                )}
                                {getFieldDecorator('answerone', {
                                    rules: [{ required: true, message: tr(184) }],
                                })(
                                    <Input
                                        placeholder="请输入答案"
                                    />
                                )}
                            </Form.Item>

                            <Form.Item label='问题二:'>
                                {getFieldDecorator('questiontwo', {
                                    rules: [{ required: false, message: tr(184) }]
                                })(
                                    <Select style={{ width: 305 }}  >
                                        {this.props.QuestListData.quest_2.options.length && this.props.QuestListData.quest_2.options.map((item: string[]) => (
                                            <Select.Option key={item[0]} value={item[0]}>{item[1]}</Select.Option>)
                                        )}
                                    </Select>
                                )}
                                {getFieldDecorator('answertwo', {
                                    rules: [{ required: true, message: tr(184) }],
                                })(
                                    <Input
                                        placeholder="请输入答案"
                                    />
                                )}
                            </Form.Item>

                            <Form.Item label='问题三:'>
                                {getFieldDecorator('questionthree', {
                                    rules: [{ required: false, message: tr(184) }],
                                })(
                                    <Select style={{ width: 305 }}  >
                                        {this.props.QuestListData.quest_3.options.length && this.props.QuestListData.quest_3.options.map((item: string[]) => (
                                            <Select.Option key={item[0]} value={item[0]}>{item[1]}</Select.Option>)
                                        )
                                        }
                                    </Select>
                                )}

                                {getFieldDecorator('answerthree', {
                                    rules: [{ required: true, message: tr(184) }],
                                })(
                                    <Input
                                        placeholder="请输入答案"
                                    />
                                )}
                            </Form.Item>

                            <Form.Item >
                                <Button type="primary" htmlType="submit" >确定</Button>
                            </Form.Item>
                        </div>

                    </Form>
                </div>
                {/* {ipcRender.isElectron ? <Title /> : null} */}
            </div >
        )

    }
}

const SecurityFrom = Form.create<FormComponentProps & ISecurityProps>({
    mapPropsToFields(props) {
        return {
            answerone: Form.createFormField({
                value: props.QuestListData.quest_1.answer,
            }),
            questionone: Form.createFormField({
                value: props.QuestListData.quest_1.optionValue,
            }),
            answertwo: Form.createFormField({
                value: props.QuestListData.quest_2.answer,
            }),
            questiontwo: Form.createFormField({
                value: props.QuestListData.quest_2.optionValue,
            }),
            answerthree: Form.createFormField({
                value: props.QuestListData.quest_3.answer,
            }),
            questionthree: Form.createFormField({
                value: props.QuestListData.quest_3.optionValue,
            }),
        };
    },
})(Security);


interface ISecretWraper {
    goback: () => void
}
// interface OptionItem {
//     optionKey: string,
//     optionName: string,
// };
interface IQuestItem {
    options: string[][],
    optionValue: string,
    answer: string,
}
// type OptionItemId = string[];
interface QuestListData {
    quest_1: IQuestItem,
    quest_2: IQuestItem,
    quest_3: IQuestItem
}
function SecretWraper(props: ISecretWraper) {
    const [questData, setQuestData] = useState(null as QuestListData | null);

    const getQuestData = () => {
        imsdk.getquestion().then(data => {
            let defaults
            if (data) {
                defaults = data.data;
            }
            // console.log('表单原始数据', defaults);
            //  console.log('表单数据',  defaults[2].question);

            // let anserList = loginStore.answer;
            // console.log('1412341241',anserList)
            let getQestData: QuestListData = {
                quest_1: {
                    optionValue: defaults[0].id?defaults[0].id:'',
                    options: [],
                    answer: ''
                },
                quest_2: {
                    optionValue: defaults[1].id?defaults[1].id:'',
                    options: [],
                    answer: ''
                },
                quest_3: {
                    optionValue: defaults[2].id?defaults[2].id:'',
                    options: [],
                    answer: ''
                },
            }
            for (var i = 0; i < defaults.length / 3; i++) {
                getQestData.quest_1.options[i] = [defaults[i * 3].id + '', defaults[i * 3].question + ''];
                getQestData.quest_2.options[i] = [defaults[i * 3 + 1].id + '', defaults[i * 3 + 1].question + ''];
                getQestData.quest_3.options[i] = [defaults[i * 3 + 2].id + '', defaults[i * 3 + 2].question + '']
            }
            setQuestData(getQestData)
        });

    }

    if (!Boolean(questData)) {
        getQuestData()
        return <Spin spinning />
    } else {
        return <SecurityFrom goback={props.goback} QuestListData={questData as QuestListData} />
    }
}
export default memo(SecretWraper)
