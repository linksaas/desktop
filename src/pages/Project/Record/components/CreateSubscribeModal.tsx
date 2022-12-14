import { Form, Modal, Checkbox, Select, Input, message } from "antd";
import React, { useState } from "react";
import { observer } from 'mobx-react';
import { bookShelfEvOptionList, calcBookShelfEvCfg, calcDocEvCfg, calcEarthlyEvCfg, calcExtEvCfg, calcGiteeEvCfg, calcGitlabEvCfg, calcIssueEvCfg, calcProjectEvCfg, calcRobotEvCfg, calcSpritEvCfg, calcTestCaseEvCfg, docEvOptionList, earthlyEvOptionList, extEvOptionList, giteeEvOptionList, gitlabEvOptionList, issueEvOptionList, projectEvOptionList, robotEvOptionList, spritEvOptionList, testCaseEvOptionList } from "./constants";
import { CHAT_BOT_QYWX, CHAT_BOT_DING, CHAT_BOT_FS, create as create_subscribe } from '@/api/events_subscribe';
import type { CHAT_BOT_TYPE } from '@/api/events_subscribe';
import { request } from "@/utils/request";
import { useStores } from "@/hooks";

interface CreateSubscribeModalProps {
    onCancel: () => void;
    onOk: () => void;
}

interface FormValue {
    chatBotName: string | undefined;
    chatBotAddr: string | undefined;
    chatBotSignCode: string | undefined;
    bookShelfEvCfg: string[] | undefined;
    docEvCfg: string[] | undefined;
    earthlyEvCfg: string[] | undefined;
    extEvCfg: string[] | undefined;
    giteeEvCfg: string[] | undefined;
    gitlabEvCfg: string[] | undefined;
    issueEvCfg: string[] | undefined;
    projectEvCfg: string[] | undefined;
    robotEvCfg: string[] | undefined;
    spritEvCfg: string[] | undefined;
    testCaseEvCfg: string[] | undefined;
}


const CreateSubscribeModal: React.FC<CreateSubscribeModalProps> = (props) => {
    const userStore = useStores('userStore');
    const projectStore = useStores('projectStore');

    const [form] = Form.useForm();

    const [chatBotType, setChatBotType] = useState<CHAT_BOT_TYPE>(CHAT_BOT_QYWX);

    const [projectEvCfgCheckAll, setProjectEvCfgCheckAll] = useState(false);
    const [projectEvCfgIndeterminate, setProjectEvCfgIndeterminate] = useState(false);

    const [bookShelfEvCfgCheckAll, setBookShelfEvCfgCheckAll] = useState(false);
    const [bookShelfEvCfgIndeterminate, setBookShelfEvCfgIndeterminate] = useState(false);

    const [docEvCfgCheckAll, setDocEvCfgCheckAll] = useState(false);
    const [docEvCfgIndeterminate, setDocEvCfgIndeterminate] = useState(false);

    const [earthlyEvCfgCheckAll, setEarthlyEvCfgCheckAll] = useState(false);
    const [earthlyEvCfgIndeterminate, setEarthlyEvCfgIndeterminate] = useState(false);

    const [extEvCfgCheckAll, setExtEvCfgCheckAll] = useState(false);
    const [extEvCfgIndeterminate, setExtEvCfgIndeterminate] = useState(false);

    const [giteeEvCfgCheckAll, setGiteeEvCfgCheckAll] = useState(false);
    const [giteeEvCfgIndeterminate, setGiteeEvCfgIndeterminate] = useState(false);

    const [gitlabEvCfgCheckAll, setGitlabEvCfgCheckAll] = useState(false);
    const [gitlabEvCfgIndeterminate, setGitlabEvCfgIndeterminate] = useState(false);

    const [issueEvCfgCheckAll, setIssueEvCfgCheckAll] = useState(false);
    const [issueEvCfgIndeterminate, setIssueEvCfgIndeterminate] = useState(false);

    const [robotEvCfgCheckAll, setRobotEvCfgCheckAll] = useState(false);
    const [robotEvCfgIndeterminate, setRobotEvCfgIndeterminate] = useState(false);

    const [spritEvCfgCheckAll, setSpritEvCfgCheckAll] = useState(false);
    const [spritEvCfgIndeterminate, setSpritEvCfgIndeterminate] = useState(false);

    const [testCaseEvCfgCheckAll, setTestCaseEvCfgCheckAll] = useState(false);
    const [testCaseEvCfgIndeterminate, setTestCaseEvCfgIndeterminate] = useState(false);

    const createSubscribe = async () => {
        const formValue: FormValue = form.getFieldsValue() as FormValue;
        if (formValue.chatBotName == undefined || formValue.chatBotName == "") {
            message.error("????????????????????????");
            return;
        }
        if (formValue.chatBotAddr == undefined || formValue.chatBotAddr == "") {
            message.error("webhook??????????????????")
            return;
        }
        if (chatBotType == CHAT_BOT_DING || chatBotType == CHAT_BOT_FS) {
            if (formValue.chatBotSignCode == undefined || formValue.chatBotSignCode == "") {
                message.error("????????????????????????");
            }
        }
        await request(create_subscribe({
            session_id: userStore.sessionId,
            project_id: projectStore.curProjectId,
            chat_bot_name: formValue.chatBotName,
            chat_bot_type: chatBotType,
            chat_bot_addr: formValue.chatBotAddr,
            chat_bot_sign_code: formValue.chatBotSignCode ?? "",
            event_cfg: {
                project_ev_cfg: calcProjectEvCfg(formValue.projectEvCfg),
                book_shelf_ev_cfg: calcBookShelfEvCfg(formValue.bookShelfEvCfg),
                doc_ev_cfg: calcDocEvCfg(formValue.docEvCfg),
                earthly_ev_cfg: calcEarthlyEvCfg(formValue.earthlyEvCfg),
                ext_ev_cfg: calcExtEvCfg(formValue.extEvCfg),
                gitee_ev_cfg: calcGiteeEvCfg(formValue.giteeEvCfg),
                gitlab_ev_cfg: calcGitlabEvCfg(formValue.gitlabEvCfg),
                issue_ev_cfg: calcIssueEvCfg(formValue.issueEvCfg),
                robot_ev_cfg: calcRobotEvCfg(formValue.robotEvCfg),
                sprit_ev_cfg: calcSpritEvCfg(formValue.spritEvCfg),
                test_case_ev_cfg: calcTestCaseEvCfg(formValue.testCaseEvCfg),
            },
        }));
        props.onOk();
    };

    return (
        <Modal open title="????????????????????????" onCancel={e => {
            e.stopPropagation();
            e.preventDefault();
            props.onCancel();
        }} onOk={e => {
            e.stopPropagation();
            e.preventDefault();
            createSubscribe();
        }}>
            <div style={{ height: "calc(100vh - 300px)", overflowY: "scroll" }}>
                <Form form={form} labelCol={{ span: 7 }}>
                    <Form.Item label="????????????" rules={[{ required: true }]}>
                        <Select value={chatBotType} onChange={value => setChatBotType(value)}>
                            <Select.Option value={CHAT_BOT_QYWX}>????????????</Select.Option>
                            <Select.Option value={CHAT_BOT_DING}>??????</Select.Option>
                            <Select.Option value={CHAT_BOT_FS}>??????</Select.Option>
                        </Select>
                    </Form.Item>
                    <Form.Item label="????????????" name="chatBotName" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item label="webhook??????" name="chatBotAddr" rules={[{ required: true }]}>
                        <Input.TextArea rows={4} />
                    </Form.Item>
                    {(chatBotType == CHAT_BOT_DING || chatBotType == CHAT_BOT_FS) && (
                        <Form.Item label="????????????" name="chatBotSignCode" rules={[{ required: true }]}>
                            <Input />
                        </Form.Item>
                    )}
                    <Form.Item label={<Checkbox indeterminate={projectEvCfgIndeterminate} checked={projectEvCfgCheckAll} onChange={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        setProjectEvCfgIndeterminate(false);
                        if (projectEvCfgCheckAll) {
                            setProjectEvCfgCheckAll(false);
                            form.setFieldValue("projectEvCfg", []);
                        } else {
                            setProjectEvCfgCheckAll(true);
                            form.setFieldValue("projectEvCfg", projectEvOptionList.map(item => item.value));
                        }
                    }}>????????????</Checkbox>} name="projectEvCfg">
                        <Checkbox.Group options={projectEvOptionList} onChange={values => {
                            if (values.length == 0) {
                                setProjectEvCfgCheckAll(false);
                                setProjectEvCfgIndeterminate(false);
                            } else if (values.length == projectEvOptionList.length) {
                                setProjectEvCfgCheckAll(true);
                                setProjectEvCfgIndeterminate(false);
                            } else {
                                setProjectEvCfgCheckAll(false);
                                setProjectEvCfgIndeterminate(true);
                            }
                        }} />
                    </Form.Item>
                    <Form.Item label={<Checkbox indeterminate={bookShelfEvCfgIndeterminate} checked={bookShelfEvCfgCheckAll} onChange={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        setBookShelfEvCfgIndeterminate(false);
                        if (bookShelfEvCfgCheckAll) {
                            setBookShelfEvCfgCheckAll(false);
                            form.setFieldValue("bookShelfEvCfg", []);
                        } else {
                            setBookShelfEvCfgCheckAll(true);
                            form.setFieldValue("bookShelfEvCfg", bookShelfEvOptionList.map(item => item.value));
                        }
                    }}>???????????????</Checkbox>} name="bookShelfEvCfg">
                        <Checkbox.Group options={bookShelfEvOptionList} onChange={values => {
                            if (values.length == 0) {
                                setBookShelfEvCfgCheckAll(false);
                                setBookShelfEvCfgIndeterminate(false);
                            } else if (values.length == bookShelfEvOptionList.length) {
                                setBookShelfEvCfgCheckAll(true);
                                setBookShelfEvCfgIndeterminate(false);
                            } else {
                                setBookShelfEvCfgCheckAll(false);
                                setBookShelfEvCfgIndeterminate(true);
                            }
                        }} />
                    </Form.Item>
                    <Form.Item label={<Checkbox indeterminate={docEvCfgIndeterminate} checked={docEvCfgCheckAll} onChange={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        setDocEvCfgIndeterminate(false);
                        if (docEvCfgCheckAll) {
                            setDocEvCfgCheckAll(false);
                            form.setFieldValue("docEvCfg", []);
                        } else {
                            setDocEvCfgCheckAll(true);
                            form.setFieldValue("docEvCfg", docEvOptionList.map(item => item.value));
                        }
                    }}>????????????</Checkbox>} name="docEvCfg">
                        <Checkbox.Group options={docEvOptionList} onChange={values => {
                            if (values.length == 0) {
                                setDocEvCfgCheckAll(false);
                                setDocEvCfgIndeterminate(false);
                            } else if (values.length == docEvOptionList.length) {
                                setDocEvCfgCheckAll(true);
                                setDocEvCfgIndeterminate(false);
                            } else {
                                setDocEvCfgCheckAll(false);
                                setDocEvCfgIndeterminate(true);
                            }
                        }} />
                    </Form.Item>
                    <Form.Item label={<Checkbox indeterminate={earthlyEvCfgIndeterminate} checked={earthlyEvCfgCheckAll} onChange={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        setEarthlyEvCfgIndeterminate(false);
                        if (earthlyEvCfgCheckAll) {
                            setEarthlyEvCfgCheckAll(false);
                            form.setFieldValue("earthlyEvCfg", []);
                        } else {
                            setEarthlyEvCfgCheckAll(true);
                            form.setFieldValue("earthlyEvCfg", earthlyEvOptionList.map(item => item.value));
                        }
                    }}>???????????????</Checkbox>} name="earthlyEvCfg">
                        <Checkbox.Group options={earthlyEvOptionList} onChange={values => {
                            if (values.length == 0) {
                                setEarthlyEvCfgCheckAll(false);
                                setEarthlyEvCfgIndeterminate(false);
                            } else if (values.length == earthlyEvOptionList.length) {
                                setEarthlyEvCfgCheckAll(true);
                                setEarthlyEvCfgIndeterminate(false);
                            } else {
                                setEarthlyEvCfgCheckAll(false);
                                setEarthlyEvCfgIndeterminate(true);
                            }
                        }} />
                    </Form.Item>
                    <Form.Item label={<Checkbox indeterminate={extEvCfgIndeterminate} checked={extEvCfgCheckAll} onChange={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        setExtEvCfgIndeterminate(false);
                        if (extEvCfgCheckAll) {
                            setExtEvCfgCheckAll(false);
                            form.setFieldValue("extEvCfg", []);
                        } else {
                            setExtEvCfgCheckAll(true);
                            form.setFieldValue("extEvCfg", extEvOptionList.map(item => item.value));
                        }
                    }}>?????????????????????</Checkbox>} name="extEvCfg">
                        <Checkbox.Group options={extEvOptionList} onChange={values => {
                            if (values.length == 0) {
                                setExtEvCfgCheckAll(false);
                                setExtEvCfgIndeterminate(false);
                            } else if (values.length == extEvOptionList.length) {
                                setExtEvCfgCheckAll(true);
                                setExtEvCfgIndeterminate(false);
                            } else {
                                setExtEvCfgCheckAll(false);
                                setExtEvCfgIndeterminate(true);
                            }
                        }} />
                    </Form.Item>
                    <Form.Item label={<Checkbox indeterminate={giteeEvCfgIndeterminate} checked={giteeEvCfgCheckAll} onChange={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        setGiteeEvCfgIndeterminate(false);
                        if (giteeEvCfgCheckAll) {
                            setGiteeEvCfgCheckAll(false);
                            form.setFieldValue("giteeEvCfg", []);
                        } else {
                            setGiteeEvCfgCheckAll(true);
                            form.setFieldValue("giteeEvCfg", giteeEvOptionList.map(item => item.value));
                        }
                    }}>gitee??????</Checkbox>} name="giteeEvCfg">
                        <Checkbox.Group options={giteeEvOptionList} onChange={values => {
                            if (values.length == 0) {
                                setGiteeEvCfgCheckAll(false);
                                setGiteeEvCfgIndeterminate(false);
                            } else if (values.length == giteeEvOptionList.length) {
                                setGiteeEvCfgCheckAll(true);
                                setGiteeEvCfgIndeterminate(false);
                            } else {
                                setGiteeEvCfgCheckAll(false);
                                setGiteeEvCfgIndeterminate(true);
                            }
                        }} />
                    </Form.Item>
                    <Form.Item label={<Checkbox indeterminate={gitlabEvCfgIndeterminate} checked={gitlabEvCfgCheckAll} onChange={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        setGitlabEvCfgIndeterminate(false);
                        if (gitlabEvCfgCheckAll) {
                            setGitlabEvCfgCheckAll(false);
                            form.setFieldValue("gitlabEvCfg", []);
                        } else {
                            setGitlabEvCfgCheckAll(true);
                            form.setFieldValue("gitlabEvCfg", gitlabEvOptionList.map(item => item.value));
                        }
                    }}>gitlab??????</Checkbox>} name="gitlabEvCfg">
                        <Checkbox.Group options={gitlabEvOptionList} onChange={values => {
                            if (values.length == 0) {
                                setGitlabEvCfgCheckAll(false);
                                setGitlabEvCfgIndeterminate(false);
                            } else if (values.length == gitlabEvOptionList.length) {
                                setGitlabEvCfgCheckAll(true);
                                setGitlabEvCfgIndeterminate(false);
                            } else {
                                setGitlabEvCfgCheckAll(false);
                                setGitlabEvCfgIndeterminate(true);
                            }
                        }} />
                    </Form.Item>
                    <Form.Item label={<Checkbox indeterminate={issueEvCfgIndeterminate} checked={issueEvCfgCheckAll} onChange={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        setIssueEvCfgIndeterminate(false);
                        if (issueEvCfgCheckAll) {
                            setIssueEvCfgCheckAll(false);
                            form.setFieldValue("issueEvCfg", []);
                        } else {
                            setIssueEvCfgCheckAll(true);
                            form.setFieldValue("issueEvCfg", issueEvOptionList.map(item => item.value));
                        }
                    }}>????????????</Checkbox>} name="issueEvCfg">
                        <Checkbox.Group options={issueEvOptionList} onChange={values => {
                            if (values.length == 0) {
                                setIssueEvCfgCheckAll(false);
                                setIssueEvCfgIndeterminate(false);
                            } else if (values.length == issueEvOptionList.length) {
                                setIssueEvCfgCheckAll(true);
                                setIssueEvCfgIndeterminate(false);
                            } else {
                                setIssueEvCfgCheckAll(false);
                                setIssueEvCfgIndeterminate(true);
                            }
                        }} />
                    </Form.Item>
                    <Form.Item label={<Checkbox indeterminate={robotEvCfgIndeterminate} checked={robotEvCfgCheckAll} onChange={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        setRobotEvCfgIndeterminate(false);
                        if (robotEvCfgCheckAll) {
                            setRobotEvCfgCheckAll(false);
                            form.setFieldValue("robotEvCfg", []);
                        } else {
                            setRobotEvCfgCheckAll(true);
                            form.setFieldValue("robotEvCfg", robotEvOptionList.map(item => item.value));
                        }
                    }}>???????????????</Checkbox>} name="robotEvCfg">
                        <Checkbox.Group options={robotEvOptionList} onChange={values => {
                            if (values.length == 0) {
                                setRobotEvCfgCheckAll(false);
                                setRobotEvCfgIndeterminate(false);
                            } else if (values.length == robotEvOptionList.length) {
                                setRobotEvCfgCheckAll(true);
                                setRobotEvCfgIndeterminate(false);
                            } else {
                                setRobotEvCfgCheckAll(false);
                                setRobotEvCfgIndeterminate(true);
                            }
                        }} />
                    </Form.Item>
                    <Form.Item label={<Checkbox indeterminate={spritEvCfgIndeterminate} checked={spritEvCfgCheckAll} onChange={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        setSpritEvCfgIndeterminate(false);
                        if (spritEvCfgCheckAll) {
                            setSpritEvCfgCheckAll(false);
                            form.setFieldValue("spritEvCfg", []);
                        } else {
                            setSpritEvCfgCheckAll(true);
                            form.setFieldValue("spritEvCfg", spritEvOptionList.map(item => item.value));
                        }
                    }}>????????????</Checkbox>} name="spritEvCfg">
                        <Checkbox.Group options={spritEvOptionList} onChange={values => {
                            if (values.length == 0) {
                                setSpritEvCfgCheckAll(false);
                                setSpritEvCfgIndeterminate(false);
                            } else if (values.length == spritEvOptionList.length) {
                                setSpritEvCfgCheckAll(true);
                                setSpritEvCfgIndeterminate(false);
                            } else {
                                setSpritEvCfgCheckAll(false);
                                setSpritEvCfgIndeterminate(true);
                            }
                        }} />
                    </Form.Item>
                    <Form.Item label={<Checkbox indeterminate={testCaseEvCfgIndeterminate} checked={testCaseEvCfgCheckAll} onChange={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        setTestCaseEvCfgIndeterminate(false);
                        if (testCaseEvCfgCheckAll) {
                            setTestCaseEvCfgCheckAll(false);
                            form.setFieldValue("testCaseEvCfg", []);
                        } else {
                            setTestCaseEvCfgCheckAll(true);
                            form.setFieldValue("testCaseEvCfg", testCaseEvOptionList.map(item => item.value));
                        }
                    }}>??????????????????</Checkbox>} name="testCaseEvCfg">
                        <Checkbox.Group options={testCaseEvOptionList} onChange={values => {
                            if (values.length == 0) {
                                setTestCaseEvCfgCheckAll(false);
                                setTestCaseEvCfgIndeterminate(false);
                            } else if (values.length == testCaseEvOptionList.length) {
                                setTestCaseEvCfgCheckAll(true);
                                setTestCaseEvCfgIndeterminate(false);
                            } else {
                                setTestCaseEvCfgCheckAll(false);
                                setTestCaseEvCfgIndeterminate(true);
                            }
                        }} />
                    </Form.Item>
                </Form>
            </div>
        </Modal>
    );
}

export default observer(CreateSubscribeModal);
