import React, { useState } from "react";
import { observer } from 'mobx-react';
import { Card, Popover, Space, Table, Tooltip } from "antd";
import { useStores } from "@/hooks";
import Button from "@/components/Button";
import { EditOutlined, ExclamationCircleOutlined, InfoCircleOutlined, LinkOutlined, PlusOutlined } from "@ant-design/icons";
import type { ISSUE_TYPE, IssueInfo } from "@/api/project_issue";
import { ISSUE_TYPE_BUG, ISSUE_TYPE_TASK, ISSUE_STATE_PLAN, ISSUE_STATE_PROCESS, ISSUE_STATE_CHECK, ISSUE_STATE_CLOSE } from "@/api/project_issue";
import AddTaskOrBug from "@/components/Editor/components/AddTaskOrBug";
import type LinkAuxStore from "@/stores/linkAux";
import type { LinkInfo } from "@/stores/linkAux";
import { LinkBugInfo, LinkTaskInfo, LINK_TARGET_TYPE } from "@/stores/linkAux";
import type { ColumnsType } from 'antd/lib/table';
import s from './Panel.module.less';
import { link_sprit, list_by_id, cancel_link_sprit } from '@/api/project_issue';
import { request } from "@/utils/request";
import { issueState, ISSUE_STATE_COLOR_ENUM } from "@/utils/constant";
import type { History } from 'history';
import msgIcon from '@/assets/allIcon/msg-icon.png';
import { useHistory } from "react-router-dom";
import { EditDate } from "@/components/EditCell/EditDate";
import { cancelEndTime, cancelEstimateMinutes, cancelRemainMinutes, cancelStartTime, getMemberSelectItems, updateCheckUser, updateEndTime, updateEstimateMinutes, updateExecUser, updateRemainMinutes, updateStartTime } from "@/pages/Issue/components/utils";
import { EditSelect } from "@/components/EditCell/EditSelect";
import { hourSelectItems } from "@/pages/Issue/components/constant";
import { ReactComponent as Deliconsvg } from '@/assets/svg/delicon.svg';
import StageModel from "@/pages/Issue/components/StageModel";


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

const renderTitle = (
    row: IssueInfo,
    projectId: string,
    linkAuxStore: LinkAuxStore | undefined,
    history: History | undefined,
) => {
    return (
        <div>
            <Button
                type="link"
                disabled={linkAuxStore == undefined}
                onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    if (linkAuxStore !== undefined && history != undefined) {
                        if (row.issue_type == ISSUE_TYPE_TASK) {
                            linkAuxStore.goToLink(new LinkTaskInfo('', projectId, row.issue_id), history);
                        } else if (row.issue_type == ISSUE_TYPE_BUG) {
                            linkAuxStore.goToLink(new LinkBugInfo('', projectId, row.issue_id), history);
                        }
                    }
                }}
            >
                <span title={row.basic_info?.title}><LinkOutlined />{row.basic_info?.title}</span>
            </Button>
            {row.msg_count > 0 && (
                <span
                    style={{
                        padding: '0px 5px',
                        display: 'inline-block',
                        height: ' 20px',
                        background: '#F4F4F7',
                        borderRadius: '9px',
                        marginLeft: '4px',
                        color: '#A7A9B6',
                    }}
                >
                    <img src={msgIcon} alt="" style={{ verticalAlign: 'sub' }} />
                    {row.msg_count > 999 ? `999+` : row.msg_count}
                </span>
            )}
        </div>
    );
};

interface SpritDetailProps {
    spritId: string;
    startTime: number;
    endTime: number;
}


const IssuePanel: React.FC<SpritDetailProps> = (props) => {
    const userStore = useStores('userStore');
    const projectStore = useStores('projectStore');
    const spritStore = useStores('spritStore');
    const linkAuxStore = useStores('linkAuxStore');
    const memberStore = useStores('memberStore');

    const history = useHistory();

    const [addIssueType, setAddIssueType] = useState<ISSUE_TYPE | null>(null);
    const [stageIssue, setStageIssue] = useState<IssueInfo | null>(null);

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
            const bugIndex = spritStore.bugList.findIndex(bug => bug.issue_id == issueId);
            if (bugIndex != -1) {
                return false;
            }
            const taskIndex = spritStore.taskList.findIndex(task => task.issue_id == issueId);
            if (taskIndex != -1) {
                return false;
            }
            return true;
        })
        for (const issueId of issueIdList) {
            await request(link_sprit(userStore.sessionId, projectStore.curProjectId, issueId, props.spritId));
        }
        const listRes = await request(list_by_id({
            session_id: userStore.sessionId,
            project_id: projectStore.curProjectId,
            issue_id_list: issueIdList,
        }));
        spritStore.addIssueList(listRes.info_list);
        setAddIssueType(null);
    }

    const cancellinkSprit = async (issueId: string) => {
        await request(cancel_link_sprit(userStore.sessionId, projectStore.curProjectId, issueId));
        spritStore.removeIssue(issueId);
    }

    const showStage = (issueId: string) => {
        const bug = spritStore.bugList.find(item => item.issue_id == issueId);
        if (bug !== undefined) {
            setStageIssue(bug);
            return;
        }
        const task = spritStore.taskList.find(item => item.issue_id == issueId);
        if (task !== undefined) {
            setStageIssue(task);
            return;
        }
    };

    const memberSelectItems = getMemberSelectItems(memberStore.memberList.map(item => item.member));


    const columns: ColumnsType<IssueInfo> = [
        {
            title: `ID`,
            width: 80,
            fixed: true,
            render: (_, row: IssueInfo) => {
                let notComplete = row.exec_user_id == "" || row.has_end_time == false || row.has_start_time == false || row.has_estimate_minutes == false || row.has_remain_minutes == false;
                if(row.has_start_time && row.has_end_time && row.start_time > row.end_time) {
                    notComplete = true;
                } 
                if(row.has_estimate_minutes && row.has_remain_minutes && row.remain_minutes > row.estimate_minutes) {
                    notComplete = true;
                }
                return (
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        {projectStore.isAdmin && <Deliconsvg
                            style={{ marginRight: '10px', cursor: 'pointer', color: '#0E83FF' }}
                            onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                cancellinkSprit(row.issue_id);
                            }}
                        />}
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
            width: 200,
            fixed: true,
            render: (v: string, row: IssueInfo) =>
                renderTitle(row, projectStore.curProjectId, linkAuxStore, history),
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
                        tips = "请等待同事更新状态"
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
            title: '处理人',
            dataIndex: 'exec_display_name',
            width: 100,
            align: 'center',
            render: (_, row: IssueInfo) => <EditSelect
                allowClear={false}
                editable={row.user_issue_perm.can_assign_exec_user}
                curValue={row.exec_user_id}
                itemList={memberSelectItems}
                onChange={async (value) => {
                    const res = await updateExecUser(userStore.sessionId, row.project_id, row.issue_id, value as string);
                    if (res) {
                        spritStore.updateIssue(row.issue_id);
                    }
                    return res;
                }} showEditIcon={true} />,
        },
        {
            title: '验收人',
            dataIndex: 'check_display_name',
            width: 100,
            align: 'center',
            render: (_, row: IssueInfo) => <EditSelect
                allowClear={false}
                editable={row.user_issue_perm.can_assign_check_user}
                curValue={row.check_user_id}
                itemList={memberSelectItems}
                onChange={async (value) => {
                    const res = await updateCheckUser(userStore.sessionId, row.project_id, row.issue_id, value as string);
                    if (res) {
                        spritStore.updateIssue(row.issue_id);
                    }
                    return res;
                }} showEditIcon={true} />,
        },
        {
            title: '预估开始成时间',
            dataIndex: 'start_time',
            width: 120,
            align: 'center',
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
                        if (ret) {
                            await spritStore.updateIssue(record.issue_id);
                        }
                        return ret;
                    }
                    const ret = await updateStartTime(userStore.sessionId, record.project_id, record.issue_id, value);
                    if (ret) {
                        await spritStore.updateIssue(record.issue_id);
                    }
                    return ret;
                }} showEditIcon={true} />,
        },
        {
            title: '预估完成时间',
            dataIndex: 'end_time',
            width: 120,
            align: 'center',
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
                        if (ret) {
                            await spritStore.updateIssue(record.issue_id);
                        }
                        return ret;
                    }
                    const ret = await updateEndTime(userStore.sessionId, record.project_id, record.issue_id, value);
                    if (ret) {
                        await spritStore.updateIssue(record.issue_id);
                    }
                    return ret;
                }} showEditIcon={true} />,
        },
        {
            title: '预估工时',
            dataIndex: 'estimate_minutes',
            width: 100,
            align: 'center',
            render: (_, record: IssueInfo) => <EditSelect
                allowClear={false}
                editable={record.exec_user_id == userStore.userInfo.userId && record.state == ISSUE_STATE_PROCESS}
                curValue={record.has_estimate_minutes ? record.estimate_minutes : -1}
                itemList={hourSelectItems}
                onChange={async (value) => {
                    if (value === undefined) {
                        const ret = await cancelEstimateMinutes(userStore.sessionId, record.project_id, record.issue_id);
                        if (ret) {
                            await spritStore.updateIssue(record.issue_id);
                        }
                        return ret;
                    }
                    const ret = await updateEstimateMinutes(userStore.sessionId, record.project_id, record.issue_id, value as number);
                    if (ret) {
                        await spritStore.updateIssue(record.issue_id);
                    }
                    return ret;
                }} showEditIcon={true} />
        },
        {
            title: '剩余工时',
            dataIndex: 'remain_minutes',
            width: 100,
            align: 'center',
            render: (_, record: IssueInfo) => <EditSelect
                allowClear={true}
                editable={record.exec_user_id == userStore.userInfo.userId && record.state == ISSUE_STATE_PROCESS}
                curValue={record.has_remain_minutes ? record.remain_minutes : -1}
                itemList={hourSelectItems}
                onChange={async (value) => {
                    if (value === undefined) {
                        const ret = await cancelRemainMinutes(userStore.sessionId, record.project_id, record.issue_id);
                        if (ret) {
                            await spritStore.updateIssue(record.issue_id);
                        }
                        return ret;
                    }
                    const ret = await updateRemainMinutes(userStore.sessionId, record.project_id, record.issue_id, value as number);
                    if (ret) {
                        await spritStore.updateIssue(record.issue_id);
                    }
                    return ret;
                }} showEditIcon={true} />
        },
    ];

    return (
        <div className={s.panel_wrap}>
            {spritStore.allTimeReady == false && <Space className={s.tip}><InfoCircleOutlined />所有任务/缺陷设置好执行人,开始时间，结束时间，预估工时和剩余工时后才能访问 甘特图 和 统计信息。</Space>}
            <Card title="任务列表" bordered={false} extra={
                <Button type="primary" onClick={e => {
                    e.stopPropagation();
                    e.preventDefault();
                    setAddIssueType(ISSUE_TYPE_TASK);
                }} 
                title={projectStore.isAdmin?"":"只有管理员可以添加任务"}
                disabled={!projectStore.isAdmin}>
                    <PlusOutlined />添加任务
                </Button>}>
                <Table
                    rowKey="issue_id"
                    dataSource={spritStore.taskList}
                    columns={columns}
                    pagination={false}
                    scroll={{ x: 1100 }}
                />
            </Card>
            <Card title="缺陷列表" bordered={false} extra={
                <Button type="primary" onClick={e => {
                    e.stopPropagation();
                    e.preventDefault();
                    setAddIssueType(ISSUE_TYPE_BUG);
                }}
                title={projectStore.isAdmin?"":"只有管理员可以添加缺陷"}
                disabled={!projectStore.isAdmin}>
                    <PlusOutlined />添加缺陷
                </Button>}>
                <Table 
                rowKey="issue_id" 
                dataSource={spritStore.bugList} 
                columns={columns} 
                pagination={false} 
                scroll={{ x: 1100 }}/>
            </Card>
            {addIssueType != null && (
                <AddTaskOrBug
                    open
                    title={addIssueType == ISSUE_TYPE_TASK ? "选择任务" : "选择缺陷"}
                    onOK={links => linkSprit(links as LinkInfo[])}
                    onCancel={() => setAddIssueType(null)}
                    issueIdList={addIssueType == ISSUE_TYPE_TASK ?
                        spritStore.taskList.map(item => item.issue_id) : spritStore.bugList.map(item => item.issue_id)}
                    type={addIssueType == ISSUE_TYPE_TASK ? "task" : "bug"}
                />
            )}
            {stageIssue !== null && <StageModel
                issue={stageIssue}
                onCancel={() => setStageIssue(null)}
                onOk={() => {
                    spritStore.updateIssue(stageIssue.issue_id).then(() => {
                        setStageIssue(null);
                    });
                }}
            />}
        </div>
    );
}

export default observer(IssuePanel);