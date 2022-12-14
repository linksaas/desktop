import React, { useState } from "react";
import { observer } from 'mobx-react';
import CardWrap from '@/components/CardWrap';
import DetailsNav from '@/components/DetailsNav';
import { getIssueText, getIsTask } from "@/utils/utils";
import { useHistory, useLocation } from "react-router-dom";
import s from './IssueCreate.module.less';
import { Input, Select, Space, Tooltip, message } from "antd";
import { change_file_fs, change_file_owner, useCommonEditor } from "@/components/Editor";
import type { LinkIssueState } from "@/stores/linkAux";
import { useStores } from "@/hooks";
import { FILE_OWNER_TYPE_ISSUE, FILE_OWNER_TYPE_PROJECT } from "@/api/fs";
import Button from "@/components/Button";
import { assign_check_user, assign_exec_user, BUG_LEVEL_MINOR, BUG_PRIORITY_LOW, create as create_issue, ISSUE_TYPE_BUG, ISSUE_TYPE_TASK, set_check_award, set_exec_award, TASK_PRIORITY_LOW } from '@/api/project_issue';
import type { EditSelectItem } from "@/components/EditCell/EditSelect";
import { awardSelectItems, bugLvSelectItems, bugPrioritySelectItems, taskPrioritySelectItems } from "./components/constant";
import { getMemberSelectItems } from "./components/utils";
import { QuestionCircleOutlined } from "@ant-design/icons";
import { request } from "@/utils/request";


interface RenderSelectProps {
    itemList: EditSelectItem[];
    value: string | number;
    allowClear: boolean;
    onChange: (value: string | number | undefined) => boolean;
}

const RenderSelect: React.FC<RenderSelectProps> = (props) => {
    const [selValue, setSelValue] = useState(props.value);

    return (<Select
        allowClear={props.allowClear}
        value={selValue}
        showArrow={false}
        style={{ width: "100px" }}
        onChange={(value) => {
            if (props.onChange(value)) {
                setSelValue(value);
            }
        }}>
        {props.itemList.map(item => (
            <Select.Option key={item.value} value={item.value}>
                <span style={{ color: item.color, display: "inline-block", width: "80px", textAlign: "center" }}>{item.label}</span>
            </Select.Option>
        ))}
    </Select>);
};

const IssueCreate = () => {
    const location = useLocation();
    const history = useHistory();
    const state: LinkIssueState | undefined = location.state as LinkIssueState | undefined;

    const userStore = useStores('userStore');
    const projectStore = useStores('projectStore');
    const memberStore = useStores("memberStore");
    const linkAuxStore = useStores("linkAuxStore");

    const { editor, editorRef } = useCommonEditor({
        content: state?.content ?? "",
        fsId: projectStore.curProject?.issue_fs_id ?? '',
        ownerType: FILE_OWNER_TYPE_PROJECT,
        ownerId: projectStore.curProjectId,
        historyInToolbar: false,
        clipboardInToolbar: false,
        widgetInToolbar: false,
        showReminder: false,
        channelMember: false,
    });

    const [title, setTitle] = useState("");
    const [bugLv, setBugLv] = useState(BUG_LEVEL_MINOR);
    const [bugPriority, setBugPriority] = useState(BUG_PRIORITY_LOW);
    const [softVersion, setSoftVersion] = useState("");
    const [taskPriority, setTaskPriority] = useState(TASK_PRIORITY_LOW);
    const [execUserId, setExecUserId] = useState("");
    const [checkUserId, setCheckUserId] = useState("");
    const [execAward, setExecAward] = useState(1);
    const [checkAward, setCheckAward] = useState(1);

    const memberSelectItems = getMemberSelectItems(memberStore.memberList.map(item => item.member));

    const createIssue = async () => {
        if (title == "") {
            message.error("??????????????????");
            return;
        }
        const content = editorRef.current?.getContent() ?? {
            type: 'doc',
        };
        //??????????????????
        await change_file_fs(
            content,
            projectStore.curProject?.issue_fs_id ?? '',
            userStore.sessionId,
            FILE_OWNER_TYPE_PROJECT,
            projectStore.curProjectId,
        );
        const createRes = await request(create_issue({
            session_id: userStore.sessionId,
            project_id: projectStore.curProjectId,
            issue_type: getIsTask(location.pathname) ? ISSUE_TYPE_TASK : ISSUE_TYPE_BUG,
            basic_info: {
                title: title,
                content: JSON.stringify(content),
            },
            extra_info: {
                ExtraTaskInfo: getIsTask(location.pathname) ? {
                    priority: taskPriority,
                } : undefined,
                ExtraBugInfo: getIsTask(location.pathname) ? undefined : {
                    software_version: softVersion,
                    level: bugLv,
                    priority: bugPriority,
                },
            }
        }));
        if (!createRes) {
            return;
        }
        //????????????Owner
        await change_file_owner(content, userStore.sessionId, FILE_OWNER_TYPE_ISSUE, createRes.issue_id);
        if (execUserId != "") {
            await request(assign_exec_user(userStore.sessionId, projectStore.curProjectId, createRes.issue_id, execUserId));
        }
        if (checkUserId != "") {
            await request(assign_check_user(userStore.sessionId, projectStore.curProjectId, createRes.issue_id, checkUserId));
        }
        if (projectStore.isAdmin) {
            await request(set_exec_award({
                session_id: userStore.sessionId,
                project_id: projectStore.curProjectId,
                issue_id: createRes.issue_id,
                point: execAward,
            }));
            await request(set_check_award({
                session_id: userStore.sessionId,
                project_id: projectStore.curProjectId,
                issue_id: createRes.issue_id,
                point: checkAward,
            }));
        }
        message.info(`??????${getIssueText(location.pathname)}??????`);
        if (getIsTask(location.pathname)) {
            linkAuxStore.goToTaskList({
                stateList: [],
                execUserIdList: [],
                checkUserIdList: [],
            }, history);
        } else {
            linkAuxStore.goToBugList({
                stateList: [],
                execUserIdList: [],
                checkUserIdList: [],
            }, history);
        }

    }

    return (
        <CardWrap>
            <DetailsNav title={`??????${getIssueText(location.pathname)}`} >
                <Space>
                    <Button type="default" onClick={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        history.goBack();
                    }}>??????</Button>
                    <Button
                        title={title == "" ? "????????????" : ""}
                        disabled={title == ""}
                        onClick={e => {
                            e.stopPropagation();
                            e.preventDefault();
                            createIssue();
                        }}>??????</Button>
                </Space>
            </DetailsNav>
            <div className={s.content_wrap}>
                <div className={s.content_left}>
                    <Input
                        allowClear
                        bordered={false}
                        placeholder={`?????????${getIssueText(location.pathname)}??????`}
                        style={{ marginBottom: '12px', borderBottom: "1px solid #e4e4e8" }}
                        onChange={e => {
                            e.stopPropagation();
                            e.preventDefault();
                            setTitle(e.target.value);
                        }}
                    />
                    {editor}
                </div>
                <div className={s.content_rigth}>
                    <h2>????????????</h2>
                    <div className={s.info}>
                        {!getIsTask(location.pathname) && (
                            <>
                                <div className={s.info_item}>
                                    <span>??????</span>
                                    <div>
                                        <RenderSelect itemList={bugLvSelectItems} value={BUG_LEVEL_MINOR}
                                            allowClear={false}
                                            onChange={
                                                (value) => {
                                                    setBugLv(value as number);
                                                    return true;
                                                }} />
                                    </div>
                                </div>
                                <div className={s.info_item}>
                                    <span>?????????</span>
                                    <div>
                                        <RenderSelect itemList={bugPrioritySelectItems} value={BUG_PRIORITY_LOW}
                                            allowClear={false}
                                            onChange={
                                                (value) => {
                                                    setBugPriority(value as number);
                                                    return true;
                                                }} />
                                    </div>
                                </div>
                                <div className={s.info_item}>
                                    <span>????????????</span>
                                    <div>
                                        <Input style={{ width: "100px" }} onChange={e => {
                                            e.stopPropagation();
                                            e.preventDefault();
                                            setSoftVersion(e.target.value);
                                        }} />
                                    </div>
                                </div>
                            </>
                        )}
                        {getIsTask(location.pathname) && (
                            <div className={s.info_item}>
                                <span>?????????</span>
                                <div>
                                    <RenderSelect itemList={taskPrioritySelectItems} value={TASK_PRIORITY_LOW}
                                        allowClear={false}
                                        onChange={(value) => {
                                            setTaskPriority(value as number);
                                            return true;
                                        }} />
                                </div>
                            </div>
                        )}
                        <div className={s.info_item}>
                            <span>?????????</span>
                            <div>
                                <RenderSelect itemList={memberSelectItems} value=""
                                    allowClear
                                    onChange={(value) => {
                                        let v = value;
                                        if (v === undefined) {
                                            v = "";
                                        }
                                        if (checkUserId != "" && checkUserId == v) {
                                            message.error("???????????????????????????????????????");
                                            return false;
                                        }
                                        setExecUserId(v as string);
                                        return true;
                                    }} />
                            </div>
                        </div>
                        <div className={s.info_item}>
                            <span>?????????</span>
                            <div>
                                <RenderSelect itemList={memberSelectItems} value=""
                                    allowClear
                                    onChange={(value) => {
                                        let v = value;
                                        if (v === undefined) {
                                            v = "";
                                        }
                                        if (execUserId != "" && execUserId == v) {
                                            message.error("???????????????????????????????????????");
                                            return false;
                                        }
                                        setCheckUserId(v as string);
                                        return true;
                                    }} />
                            </div>
                        </div>
                        {projectStore.isAdmin && (
                            <>
                                <div className={s.info_item}>
                                    <span>????????????
                                        <Tooltip title={`???${getIssueText(location.pathname)}???????????????????????????????????????????????????`} trigger="click">
                                            <a><QuestionCircleOutlined /></a>
                                        </Tooltip>
                                    </span>
                                    <div>
                                        <RenderSelect itemList={awardSelectItems} value={1}
                                            allowClear={false}
                                            onChange={(value) => {
                                                setExecAward(value as number);
                                                return true;
                                            }} />
                                    </div>
                                </div>
                                <div className={s.info_item}>
                                    <span>????????????
                                        <Tooltip title={`???${getIssueText(location.pathname)}???????????????????????????????????????????????????`} trigger="click">
                                            <a><QuestionCircleOutlined /></a>
                                        </Tooltip>
                                    </span>
                                    <div>
                                        <RenderSelect itemList={awardSelectItems} value={1}
                                            allowClear={false}
                                            onChange={(value) => {
                                                setCheckAward(value as number);
                                                return true;
                                            }} />
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </CardWrap>
    );
};

export default observer(IssueCreate);