//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import React, { useEffect, useState } from "react";
import { observer } from 'mobx-react';
import { Card, Popover, Space, Table, Tooltip, List, Form, Dropdown, Button, Modal } from "antd";
import { useStores } from "@/hooks";
import { EditOutlined, ExclamationCircleOutlined, CheckOutlined, PlusOutlined } from "@ant-design/icons";
import type { ISSUE_TYPE, IssueInfo, PROCESS_STAGE, SubIssueInfo } from "@/api/project_issue";
import { ISSUE_TYPE_BUG, ISSUE_TYPE_TASK, ISSUE_STATE_PLAN, ISSUE_STATE_PROCESS, ISSUE_STATE_CHECK, ISSUE_STATE_CLOSE, PROCESS_STAGE_TODO, PROCESS_STAGE_DOING, PROCESS_STAGE_DONE, update_tag_id_list, link_sprit } from "@/api/project_issue";
import { type LinkInfo, LINK_TARGET_TYPE, LinkBugInfo, LinkTaskInfo } from "@/stores/linkAux";
import { cancel_link_sprit, list_sub_issue } from '@/api/project_issue';
import { request } from "@/utils/request";
import { issueState, ISSUE_STATE_COLOR_ENUM } from "@/utils/constant";
import { useHistory } from "react-router-dom";
import { EditDate } from "@/components/EditCell/EditDate";
import {
    cancelEndTime, cancelEstimateMinutes, cancelRemainMinutes, cancelStartTime, getMemberSelectItems,
    updateCheckUser, updateEndTime, updateEstimateMinutes, updateExecUser, updateExtraInfo, updateProcessStage,
    updateRemainMinutes, updateStartTime,
    updateTitle
} from "@/pages/Issue/components/utils";
import { EditSelect } from "@/components/EditCell/EditSelect";
import { bugLvSelectItems, bugPrioritySelectItems, hourSelectItems, taskPrioritySelectItems } from "@/pages/Issue/components/constant";
import StageModel from "@/pages/Issue/components/StageModel";
import type { ColumnType } from 'antd/lib/table';
import { EditText } from "@/components/EditCell/EditText";
import type { LocalIssueStore } from "@/stores/local";
import { EditTag } from "@/components/EditCell/EditTag";
import { ExtraIssueInfo } from "@/pages/Issue/components/ExtraIssueInfo";
import s from "./IssuePanel.module.less";
import AddIssueModal from "./AddIssueModal";
import AddTaskOrBug from "@/components/Editor/components/AddTaskOrBug";

interface SubIssuePopoverProps {
    issueId: string;
}

const SubIssuePopover = (props: SubIssuePopoverProps) => {
    const userStore = useStores('userStore');
    const projectStore = useStores('projectStore');

    const [subIssueList, setSubIssueList] = useState<SubIssueInfo[]>([]);

    const loadSubIssueList = async () => {
        const res = await request(list_sub_issue({
            session_id: userStore.sessionId,
            project_id: projectStore.curProjectId,
            issue_id: props.issueId,
        }));
        setSubIssueList(res.sub_issue_list);
    };



    useEffect(() => {
        loadSubIssueList();
    }, []);

    return (
        <List rowKey="sub_issue_id" dataSource={subIssueList} renderItem={item => (
            <List.Item>
                <Space>
                    <div style={{ width: "20px" }}>
                        {item.done && <CheckOutlined style={{ color: "green" }} />}
                    </div>
                    {item.basic_info.title}
                </Space>
            </List.Item>
        )} style={{ padding: "10px 10px", maxWidth: "500px", maxHeight: "400px", overflowY: "scroll", borderRadius: "10px" }} />
    )
}

type ColumnsTypes = ColumnType<IssueInfo> & {
    issueType?: ISSUE_TYPE;
};

const getColor = (v: number) => {
    switch (v) {
        case ISSUE_STATE_PLAN:
            return ISSUE_STATE_COLOR_ENUM.规划中颜色;
        case ISSUE_STATE_PROCESS:
            return ISSUE_STATE_COLOR_ENUM.处理颜色;
        case ISSUE_STATE_CHECK:
            return ISSUE_STATE_COLOR_ENUM.验收颜色;
        case ISSUE_STATE_CLOSE:
            return ISSUE_STATE_COLOR_ENUM.关闭颜色;
        default:
            return ISSUE_STATE_COLOR_ENUM.规划中颜色;
    }
};

interface IssuePanelProps {
    spritId: string;
    startTime: number;
    endTime: number;
    memberId: string;
    taskStore: LocalIssueStore;
    bugStore: LocalIssueStore;
}


const IssuePanel: React.FC<IssuePanelProps> = (props) => {
    const userStore = useStores('userStore');
    const projectStore = useStores('projectStore');
    const linkAuxStore = useStores('linkAuxStore');
    const memberStore = useStores('memberStore');
    const entryStore = useStores('entryStore');

    const history = useHistory();

    const [stageIssue, setStageIssue] = useState<IssueInfo | null>(null);

    const [refIssueType, setRefIssueType] = useState<ISSUE_TYPE | null>(null);
    const [newIssueType, setNewIssueType] = useState<ISSUE_TYPE | null>(null);

    const [expandedRowKeys, setExpandedRowKeys] = useState<string[]>([]);
    const [removeIssueInfo, setRemoveIssueInfo] = useState<IssueInfo | null>(null);

    const cancelLinkSprit = async () => {
        if (removeIssueInfo == null) {
            return;
        }
        await request(cancel_link_sprit(userStore.sessionId, projectStore.curProjectId, removeIssueInfo.issue_id));
        setRemoveIssueInfo(null);
    }

    const showStage = (issueId: string) => {
        const bug = props.bugStore.itemList.find(item => item.issue_id == issueId);
        if (bug !== undefined) {
            setStageIssue(bug);
            return;
        }
        const task = props.taskStore.itemList.find(item => item.issue_id == issueId);
        if (task !== undefined) {
            setStageIssue(task);
            return;
        }
    };

    const getTagDefList = (issueType: ISSUE_TYPE) => {
        if (projectStore.curProject == undefined) {
            return [];
        }
        return projectStore.curProject.tag_list.filter(item => {
            if (issueType == ISSUE_TYPE_TASK) {
                return item.use_in_task;
            } else {
                return item.use_in_bug;
            }
        });
    };

    const linkSprit = async (links: LinkInfo[]) => {
        let issueIdList: string[] = [];
        for (const link of links) {
            if (link.linkTargeType == LINK_TARGET_TYPE.LINK_TARGET_BUG) {
                issueIdList.push((link as LinkBugInfo).issueId);
            } else if (link.linkTargeType == LINK_TARGET_TYPE.LINK_TARGET_TASK) {
                issueIdList.push((link as LinkTaskInfo).issueId);
            }
        }
        issueIdList = issueIdList.filter(issueId => {
            const bugIndex = props.bugStore.itemList.findIndex(bug => bug.issue_id == issueId);
            if (bugIndex != -1) {
                return false;
            }
            const taskIndex = props.taskStore.itemList.findIndex(task => task.issue_id == issueId);
            if (taskIndex != -1) {
                return false;
            }
            return true;
        });
        for (const issueId of issueIdList) {
            await request(link_sprit(userStore.sessionId, projectStore.curProjectId, issueId, entryStore.curEntry?.entry_id ?? ""));
        }
        setRefIssueType(null);
    }

    const memberSelectItems = getMemberSelectItems(memberStore.memberList.map(item => item.member));

    const columns: ColumnsTypes[] = [
        {
            title: `ID`,
            width: 60,
            fixed: true,
            align: "left",
            render: (_, row: IssueInfo) => {
                let notComplete = row.exec_user_id == "" || row.has_end_time == false || row.has_start_time == false || row.has_estimate_minutes == false || row.has_remain_minutes == false;
                if (row.has_start_time && row.has_end_time && row.start_time > row.end_time) {
                    notComplete = true;
                }
                if (row.has_estimate_minutes && row.has_remain_minutes && row.remain_minutes > row.estimate_minutes) {
                    notComplete = true;
                }
                return (
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        {notComplete == false && <span>{row.issue_index}</span>}
                        {notComplete && (<Popover content={
                            <div style={{ padding: "10px 10px", color: "red" }}>
                                <ul>
                                    {row.exec_user_id == "" && <li>未设置执行人</li>}
                                    {row.has_start_time == false && <li>未设置开始时间</li>}
                                    {row.has_end_time == false && <li>未设置完成时间</li>}
                                    {row.has_estimate_minutes == false && <li>未设置预估时间</li>}
                                    {row.has_remain_minutes == false && <li>未设置剩余时间</li>}
                                    {row.has_start_time && row.has_end_time && (row.start_time > row.end_time) && <li>结束时间早于开始时间</li>}
                                    {row.has_estimate_minutes && row.has_remain_minutes && row.remain_minutes > row.estimate_minutes && <li>剩余工时大于预估工时</li>}
                                </ul>
                            </div>}>
                            <Space style={{ color: "red" }}>
                                <span>{row.issue_index}</span>
                                <ExclamationCircleOutlined />
                            </Space>
                        </Popover>)}
                    </div>
                );
            },
        },
        {
            title: `名称`,
            ellipsis: true,
            dataIndex: ['basic_info', 'title'],
            width: 340,
            align: "left",
            fixed: true,
            render: (v: string, record: IssueInfo) => {
                return (
                    <div style={{ lineHeight: "28px" }}>
                        <EditText editable={(!projectStore.isClosed) && record.user_issue_perm.can_update} content={v} showEditIcon={true} onChange={async (value) => {
                            return await updateTitle(userStore.sessionId, record.project_id, record.issue_id, value);
                        }} onClick={() => {
                            if (record.issue_type == ISSUE_TYPE_TASK) {
                                linkAuxStore.goToLink(new LinkTaskInfo("", record.project_id, record.issue_id), history);
                            } else if (record.issue_type == ISSUE_TYPE_BUG) {
                                linkAuxStore.goToLink(new LinkBugInfo("", record.project_id, record.issue_id), history);
                            }
                        }} />
                    </div>
                );
            },
        },
        {
            title: "操作",
            width: 50,
            render: (_, row: IssueInfo) => (
                <Button type="link" danger style={{ minWidth: 0, padding: "0px 0px" }}
                    disabled={!((entryStore.curEntry?.can_update ?? false) && projectStore.isAdmin)}
                    onClick={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        setRemoveIssueInfo(row);
                    }}>移除</Button>
            ),
        },
        {
            title: `阶段`,
            dataIndex: 'state',
            sorter: {
                compare: (a: { state: number }, b: { state: number }) => {
                    return a.state - b.state;
                },
            },
            width: 100,
            align: 'center',
            render: (val: number, row: IssueInfo) => {
                const v = issueState[val];
                let cursor = "auto";
                let tips = "";
                if (row.user_issue_perm.next_state_list.length > 0) {
                    cursor = "pointer";
                } else {
                    if ([ISSUE_STATE_PROCESS, ISSUE_STATE_CHECK].includes(row.state) && (
                        (userStore.userInfo.userId == row.exec_user_id) || (userStore.userInfo.userId == row.check_user_id)
                    )) {
                        if (row.sub_issue_status.done_count < row.sub_issue_status.total_count) {
                            tips = "子任务未完成";
                        } else {
                            tips = "请等待同事更新状态";
                        }
                    }
                }
                return (
                    <div
                        tabIndex={0}
                        style={{
                            background: `rgb(${getColor(val)} / 20%)`,
                            width: '60px',
                            borderRadius: '50px',
                            textAlign: 'center',
                            color: `rgb(${getColor(val)})`,
                            cursor: `${cursor}`,
                            margin: '0 auto',
                        }}
                        onClick={(e) => {
                            e.stopPropagation();
                            if (row.user_issue_perm.next_state_list.length > 0) {
                                showStage(row.issue_id);
                            }
                        }}
                    >
                        <Tooltip title={tips}>{v.label}</Tooltip>
                        {row.user_issue_perm.next_state_list.length > 0 && <a><EditOutlined /></a>}
                    </div>
                );
            },
        },
        {
            title: "处理子阶段",
            width: 100,
            align: 'left',
            dataIndex: "process_stage",
            render: (_, record: IssueInfo) => (
                <>
                    {record.state == ISSUE_STATE_PROCESS && (
                        <EditSelect editable={(!projectStore.isClosed) && (record.exec_user_id == userStore.userInfo.userId)}
                            curValue={record.process_stage}
                            itemList={[
                                {
                                    value: PROCESS_STAGE_TODO,
                                    label: "未开始",
                                    color: "black",
                                },
                                {
                                    value: PROCESS_STAGE_DOING,
                                    label: "执行中",
                                    color: "black",
                                },
                                {
                                    value: PROCESS_STAGE_DONE,
                                    label: "待检查",
                                    color: "black",
                                },
                            ]} showEditIcon={true} allowClear={false}
                            onChange={async value => {
                                return await updateProcessStage(userStore.sessionId, record.project_id, record.issue_id, value as PROCESS_STAGE);
                            }} />
                    )}
                </>
            ),
        },
        {
            title: `缺陷级别`,
            width: 100,
            align: 'left',
            render: (_, record: IssueInfo) => <EditSelect
                allowClear={false}
                editable={(!projectStore.isClosed) && record.user_issue_perm.can_update}
                curValue={record.extra_info.ExtraBugInfo?.level ?? 0}
                itemList={bugLvSelectItems}
                onChange={async (value) => {
                    return await updateExtraInfo(userStore.sessionId, record.project_id, record.issue_id, {
                        ExtraBugInfo: {
                            ...record.extra_info.ExtraBugInfo!,
                            level: value as number,
                        },
                    });
                }} showEditIcon={true} />,
            issueType: ISSUE_TYPE_BUG,
        },
        {
            title: '优先级',
            width: 120,
            align: 'left',
            sorter: {
                compare: (a, b) => {
                    if (a.issue_type == ISSUE_TYPE_TASK) {
                        return (a.extra_info.ExtraTaskInfo?.priority ?? 0) - (b.extra_info.ExtraTaskInfo?.priority ?? 0);
                    } else {
                        return (a.extra_info.ExtraBugInfo?.priority ?? 0) - (b.extra_info.ExtraBugInfo?.priority ?? 0);
                    }
                },
            },
            render: (_, record: IssueInfo) => <EditSelect
                allowClear={false}
                editable={(!projectStore.isClosed) && record.user_issue_perm.can_update}
                curValue={record.issue_type == ISSUE_TYPE_TASK ? (record.extra_info.ExtraTaskInfo?.priority ?? 0) : (record.extra_info.ExtraBugInfo?.priority ?? 0)}
                itemList={record.issue_type == ISSUE_TYPE_TASK ? taskPrioritySelectItems : bugPrioritySelectItems}
                onChange={async (value) => {
                    if (record.issue_type == ISSUE_TYPE_TASK) {
                        return await updateExtraInfo(userStore.sessionId, record.project_id, record.issue_id, {
                            ExtraTaskInfo: {
                                priority: value as number,
                            }
                        });
                    } else {
                        return await updateExtraInfo(userStore.sessionId, record.project_id, record.issue_id, {
                            ExtraBugInfo: {
                                ...record.extra_info.ExtraBugInfo!,
                                priority: value as number,
                            }
                        });
                    }
                }} showEditIcon={true} />
        },
        {
            title: '处理人',
            dataIndex: 'exec_display_name',
            width: 100,
            align: "left",
            render: (_, row: IssueInfo) => <EditSelect
                allowClear={false}
                editable={row.user_issue_perm.can_assign_exec_user}
                curValue={row.exec_user_id}
                itemList={memberSelectItems}
                onChange={async (value) => {
                    const res = await updateExecUser(userStore.sessionId, row.project_id, row.issue_id, value as string);
                    return res;
                }} showEditIcon={true} />,
        },
        {
            title: '验收人',
            dataIndex: 'check_display_name',
            width: 100,
            align: "left",
            render: (_, row: IssueInfo) => <EditSelect
                allowClear={false}
                editable={row.user_issue_perm.can_assign_check_user}
                curValue={row.check_user_id}
                itemList={memberSelectItems}
                onChange={async (value) => {
                    const res = await updateCheckUser(userStore.sessionId, row.project_id, row.issue_id, value as string);
                    return res;
                }} showEditIcon={true} />,
        },
        {
            title: "子任务数",
            width: 100,
            align: "left",
            render: (_, row: IssueInfo) => (
                <>
                    {row.sub_issue_status.total_count > 0 && (
                        <Popover trigger="hover" placement="bottom" destroyTooltipOnHide content={<SubIssuePopover issueId={row.issue_id} />}>
                            <span style={{ color: "blue" }}>
                                {row.sub_issue_status.done_count}/{row.sub_issue_status.total_count}
                            </span>
                        </Popover>
                    )}
                    {row.sub_issue_status.total_count == 0 && "-"}
                </>
            ),
            issueType: ISSUE_TYPE_TASK,
        },
        {
            title: '预估开始成时间',
            dataIndex: 'start_time',
            width: 120,
            align: "left",
            render: (_, record) => <EditDate
                editable={record.exec_user_id == userStore.userInfo.userId && record.state == ISSUE_STATE_PROCESS}
                disabledDate={(date) => {
                    const ts = date.valueOf();
                    return !(ts >= props.startTime && ts <= props.endTime);
                }}
                hasTimeStamp={record.has_start_time}
                timeStamp={record.start_time}
                onChange={async (value) => {
                    if (value === undefined) {
                        const ret = await cancelStartTime(userStore.sessionId, record.project_id, record.issue_id);
                        return ret;
                    }
                    const ret = await updateStartTime(userStore.sessionId, record.project_id, record.issue_id, value);
                    return ret;
                }} showEditIcon={true} />,
        },
        {
            title: '预估完成时间',
            dataIndex: 'end_time',
            width: 120,
            align: "left",
            render: (_, record) => <EditDate
                editable={record.exec_user_id == userStore.userInfo.userId && record.state == ISSUE_STATE_PROCESS}
                hasTimeStamp={record.has_end_time}
                timeStamp={record.end_time}
                disabledDate={(date) => {
                    const ts = date.valueOf();
                    return !(ts >= props.startTime && ts <= props.endTime);
                }}
                onChange={async (value) => {
                    if (value === undefined) {
                        const ret = await cancelEndTime(userStore.sessionId, record.project_id, record.issue_id);
                        return ret;
                    }
                    const ret = await updateEndTime(userStore.sessionId, record.project_id, record.issue_id, value);
                    return ret;
                }} showEditIcon={true} />,
        },
        {
            title: '预估工时',
            dataIndex: 'estimate_minutes',
            width: 100,
            align: "left",
            render: (_, record: IssueInfo) => <EditSelect
                allowClear={false}
                editable={record.exec_user_id == userStore.userInfo.userId && record.state == ISSUE_STATE_PROCESS}
                curValue={record.has_estimate_minutes ? record.estimate_minutes : -1}
                itemList={hourSelectItems}
                onChange={async (value) => {
                    if (value === undefined) {
                        const ret = await cancelEstimateMinutes(userStore.sessionId, record.project_id, record.issue_id);
                        return ret;
                    }
                    const ret = await updateEstimateMinutes(userStore.sessionId, record.project_id, record.issue_id, value as number);
                    return ret;
                }} showEditIcon={true} />
        },
        {
            title: '剩余工时',
            dataIndex: 'remain_minutes',
            width: 100,
            align: "left",
            render: (_, record: IssueInfo) => <EditSelect
                allowClear={true}
                editable={record.exec_user_id == userStore.userInfo.userId && record.state == ISSUE_STATE_PROCESS}
                curValue={record.has_remain_minutes ? record.remain_minutes : -1}
                itemList={hourSelectItems}
                onChange={async (value) => {
                    if (value === undefined) {
                        const ret = await cancelRemainMinutes(userStore.sessionId, record.project_id, record.issue_id);
                        return ret;
                    }
                    const ret = await updateRemainMinutes(userStore.sessionId, record.project_id, record.issue_id, value as number);
                    return ret;
                }} showEditIcon={true} />
        },
        {
            title: "标签",
            dataIndex: ["basic_info", "tag_id_list"],
            width: 200,
            render: (_, row: IssueInfo) => (
                <EditTag editable={(!projectStore.isClosed) && row.user_issue_perm.can_update} tagIdList={row.basic_info.tag_id_list} tagDefList={getTagDefList(row.issue_type)}
                    onChange={(tagIdList: string[]) => {
                        request(update_tag_id_list({
                            session_id: userStore.sessionId,
                            project_id: row.project_id,
                            issue_id: row.issue_id,
                            tag_id_list: tagIdList,
                        }));
                    }} />
            ),
        },
    ];

    useEffect(() => {
        if (expandedRowKeys.length == 0) {
            const keys = props.taskStore.itemList.filter(item => item.sub_issue_status.total_count > 0).map(item => item.issue_id);
            setExpandedRowKeys(keys);
        }

    }, [props.taskStore.itemList])

    return (
        <div style={{ height: "calc(100vh - 140px)", overflowY: "scroll" }}>
            <Card title="任务列表" bordered={false} headStyle={{ fontSize: "16px", fontWeight: 600 }} className={props.taskStore.itemList.filter(item => {
                if (props.memberId == "") {
                    return true;
                } else {
                    if (item.exec_user_id == props.memberId || item.check_user_id == props.memberId) {
                        return true;
                    }
                    return false;
                }
            }).length == 0 ? "" : s.listWrap} extra={
                <Form style={{ marginRight: "20px" }}>
                    <Form.Item>
                        <Dropdown.Button type="primary"
                            disabled={(projectStore.isClosed || !(entryStore.curEntry?.can_update ?? false) || !projectStore.isAdmin)}
                            menu={{
                                items: [
                                    {
                                        key: "refTask",
                                        label: "引用任务",
                                        disabled: (projectStore.isClosed || !(entryStore.curEntry?.can_update ?? false) || !projectStore.isAdmin),
                                        onClick: () => setRefIssueType(ISSUE_TYPE_TASK),
                                    },
                                ]
                            }} onClick={e => {
                                e.stopPropagation();
                                e.preventDefault();
                                setNewIssueType(ISSUE_TYPE_TASK);
                            }}><PlusOutlined />增加</Dropdown.Button>
                    </Form.Item>
                </Form>
            }>
                <Table
                    rowKey="issue_id"
                    dataSource={props.taskStore.itemList.filter(item => {
                        if (props.memberId == "") {
                            return true;
                        } else {
                            if (item.exec_user_id == props.memberId || item.check_user_id == props.memberId) {
                                return true;
                            }
                            return false;
                        }
                    })}
                    columns={columns.filter(item => (item.issueType == undefined || item.issueType == ISSUE_TYPE_TASK))}
                    pagination={false}
                    scroll={{ x: 1100 }}
                    expandable={{
                        expandedRowRender: (row: IssueInfo) => (
                            <ExtraIssueInfo issueId={row.issue_id}
                                canOptDependence={row.user_issue_perm.can_opt_dependence}
                                canOptSubIssue={row.user_issue_perm.can_opt_sub_issue} />
                        ),
                        rowExpandable: () => true,
                        showExpandColumn: true,
                        expandIconColumnIndex: 1,
                        columnTitle: "子面板",
                        columnWidth: 60,
                        expandedRowKeys: expandedRowKeys,
                        onExpandedRowsChange: keys => setExpandedRowKeys(keys as string[]),
                    }}
                />
            </Card>
            <Card title="缺陷列表" bordered={false} headStyle={{ fontSize: "16px", fontWeight: 600 }}
                extra={
                    <Form style={{ marginRight: "20px" }}>
                        <Form.Item>
                            <Dropdown.Button type="primary"
                                disabled={(projectStore.isClosed || !(entryStore.curEntry?.can_update ?? false)) || !projectStore.isAdmin}
                                menu={{
                                    items: [
                                        {
                                            key: "refBug",
                                            label: "引用缺陷",
                                            disabled: (projectStore.isClosed || !(entryStore.curEntry?.can_update ?? false) || !projectStore.isAdmin),
                                            onClick: () => setRefIssueType(ISSUE_TYPE_BUG),
                                        }
                                    ]
                                }} onClick={e => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    setNewIssueType(ISSUE_TYPE_BUG);
                                }}><PlusOutlined />增加</Dropdown.Button>
                        </Form.Item>
                    </Form>
                }>
                <Table
                    rowKey="issue_id"
                    dataSource={props.bugStore.itemList.filter(item => {
                        if (props.memberId == "") {
                            return true;
                        } else {
                            if (item.exec_user_id == props.memberId || item.check_user_id == props.memberId) {
                                return true;
                            }
                            return false;
                        }
                    })}
                    columns={columns.filter(item => (item.issueType == undefined || item.issueType == ISSUE_TYPE_BUG))}
                    pagination={false}
                    scroll={{ x: 1100 }} />
            </Card>
            {stageIssue !== null && <StageModel
                issue={stageIssue}
                onClose={() => setStageIssue(null)}
            />}
            {newIssueType != null && (
                <AddIssueModal issueType={newIssueType} onClose={() => setNewIssueType(null)} />
            )}
            {refIssueType != null && (
                <AddTaskOrBug
                    open
                    title={refIssueType == ISSUE_TYPE_TASK ? "选择任务" : "选择缺陷"}
                    onOK={links => linkSprit(links as LinkInfo[])}
                    onCancel={() => setRefIssueType(null)}
                    issueIdList={refIssueType == ISSUE_TYPE_TASK ?
                        props.taskStore.itemList.map(item => item.issue_id) : props.bugStore.itemList.map(item => item.issue_id)}
                    type={refIssueType == ISSUE_TYPE_TASK ? "task" : "bug"}
                />
            )}
            {removeIssueInfo != null && (
                <Modal open title={`移除${removeIssueInfo.issue_type == ISSUE_TYPE_TASK ? "任务" : "缺陷"}`}
                    okText="移除" okButtonProps={{ danger: true }}
                    onCancel={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        setRemoveIssueInfo(null);
                    }}
                    onOk={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        cancelLinkSprit();
                    }}>
                    是否从工作计划中移除&nbsp;{removeIssueInfo.issue_type == ISSUE_TYPE_TASK ? "任务" : "缺陷"}&nbsp;{removeIssueInfo.basic_info.title}&nbsp;?
                </Modal>
            )}
        </div>
    );
}

export default observer(IssuePanel);