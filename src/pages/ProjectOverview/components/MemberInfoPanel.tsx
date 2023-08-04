import { Collapse, Descriptions, Modal, Select, Space, Tabs, message } from "antd";
import React, { useEffect, useState } from "react";
import { observer } from 'mobx-react';
import Button from "@/components/Button";
import { MinusCircleOutlined, UserAddOutlined } from "@ant-design/icons";
import { useStores } from "@/hooks";
import GoalList from "./GoalList";
import AwardList from "./AwardList";
import type { RoleInfo } from '@/api/project_member';
import { list_role, set_member_role, remove_member } from '@/api/project_member';
import { request } from "@/utils/request";
import { change_owner } from "@/api/project";
import UserPhoto from "@/components/Portrait/UserPhoto";
import s from "./MemberInfoPanel.module.less";
import type { AwardState } from '@/api/project_award';
import { list_state } from '@/api/project_award';
import { ISSUE_STATE_CHECK, ISSUE_STATE_PROCESS } from "@/api/project_issue";
import { useHistory } from "react-router-dom";
import EventCom from "@/components/EventCom";
import moment from "moment";
import { SHORT_NOTE_BUG, SHORT_NOTE_TASK } from "@/api/short_note";
import { LinkBugInfo, LinkTaskInfo } from "@/stores/linkAux";

const MemberAwardState: React.FC<{ state?: AwardState }> = ({ state }) => {
    if (state == undefined) {
        return (<></>);
    } else {
        return (
            <div style={{ paddingRight: "20px" }}>
                <Space direction="vertical">
                    <span>上月贡献:&nbsp;{state.last_month_point}</span>
                    <span>本月贡献:&nbsp;{state.cur_month_point}</span>
                    <span>上周贡献:&nbsp;{state.last_weak_point}</span>
                    <span>本周贡献:&nbsp;{state.cur_week_point}</span>
                </Space>
            </div>
        );
    }
};

const MemberInfoPanel = () => {
    const history = useHistory();

    const userStore = useStores('userStore');
    const memberStore = useStores('memberStore');
    const projectStore = useStores('projectStore');
    const appStore = useStores('appStore');
    const linkAuxStore = useStores('linkAuxStore');

    const [roleList, setRoleList] = useState<RoleInfo[]>([]);
    const [removeMemberUserId, setRemoveMemberUserId] = useState("");
    const [ownerMemberUserId, setOwnerMemberUserId] = useState("");
    const [awardStateList, setAwardStateList] = useState<AwardState[]>([]);
    const [activeKey, setActiveKey] = useState(userStore.userInfo.userId);

    const loadRoleList = async () => {
        const res = await request(list_role(userStore.sessionId, projectStore.curProjectId));
        if (res) {
            setRoleList(res.role_list);
        }
    };

    const updateMemberRole = async (memberUserId: string, roleId: string) => {
        await set_member_role(userStore.sessionId, projectStore.curProjectId, roleId, memberUserId);
        memberStore.updateMemberRole(memberUserId, roleId);
        message.info("修改角色成功");
    };

    const changeOwner = async () => {
        await request(change_owner(userStore.sessionId, projectStore.curProjectId, ownerMemberUserId));

        await projectStore.updateProject(projectStore.curProjectId);
        await memberStore.updateMemberInfo(projectStore.curProjectId, userStore.userInfo.userId);
        setOwnerMemberUserId("");
        message.info("转移超级管理员权限成功");
    };

    const removeMember = async () => {
        await request(remove_member(userStore.sessionId, projectStore.curProjectId, removeMemberUserId));
        await memberStore.loadMemberList(projectStore.curProjectId);
        setRemoveMemberUserId("");
        message.info("移除用户成功");
    };

    const loadAwardStateList = async () => {
        const res = await request(list_state({
            session_id: userStore.sessionId,
            project_id: projectStore.curProjectId,
        }));
        setAwardStateList(res.state_list);
    };

    useEffect(() => {
        loadRoleList();
        loadAwardStateList();
    }, [projectStore.curProjectId]);

    return (
        <>
            <Collapse bordered={true} className={s.member_list_wrap} defaultActiveKey="memberInfo">
                <Collapse.Panel key="memberInfo" header={<h1 className={s.head}>成员信息</h1>} extra={
                    <>
                        {!(projectStore.curProject?.closed) && projectStore.isAdmin && appStore.clientCfg?.can_invite && (
                            <Button onClick={() => memberStore.showInviteMember = true}>
                                <UserAddOutlined />
                                邀请成员
                            </Button>
                        )}
                    </>
                }>
                    <Tabs tabPosition="left" activeKey={activeKey} onChange={value => setActiveKey(value)}>
                        {memberStore.memberList.map(member => (
                            <Tabs.TabPane key={member.member.member_user_id} tab={
                                <Space>
                                    <UserPhoto logoUri={member.member.logo_uri} style={{ width: "24px", height: "24px", borderRadius: "24px" }} />
                                    <div style={{ width: "80px", overflowX: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis", textAlign: "left" }}>{member.member.display_name}</div>
                                </Space>
                            }>
                                {activeKey == member.member.member_user_id && (
                                    <Descriptions bordered column={2}>
                                        <Descriptions.Item label="用户角色">
                                            {member.member.is_project_owner ? (
                                                <span>超级管理员</span>
                                            ) : (
                                                <Select value={member.member.role_id}
                                                    style={{ width: 100 }}
                                                    disabled={!projectStore.isAdmin} onChange={value => {
                                                        if (value == "") {
                                                            setOwnerMemberUserId(member.member.member_user_id);
                                                        } else {
                                                            updateMemberRole(member.member.member_user_id, value);
                                                        }
                                                    }}>
                                                    {projectStore.curProject?.owner_user_id == userStore.userInfo.userId && (
                                                        <Select.Option value="">超级管理员</Select.Option>
                                                    )}
                                                    {roleList.map(item => (
                                                        <Select.Option value={item.role_id} key={item.role_id}>
                                                            {item.basic_info.role_name}
                                                        </Select.Option>
                                                    ))}
                                                </Select>
                                            )}
                                        </Descriptions.Item>
                                        <Descriptions.Item label="操作">
                                            <Button
                                                type="link"
                                                disabled={!projectStore.isAdmin}
                                                onClick={e => {
                                                    e.stopPropagation();
                                                    e.preventDefault();
                                                    setRemoveMemberUserId(member.member.member_user_id);
                                                }}
                                            >
                                                <MinusCircleOutlined />
                                                移除
                                            </Button>
                                        </Descriptions.Item>
                                        <Descriptions.Item label="未执行任务">
                                            {member.issue_member_state?.task_un_exec_count ?? 0}
                                            {(member.issue_member_state?.task_un_exec_count ?? 0) > 0 && (
                                                <a style={{ marginLeft: "10px" }} onClick={e => {
                                                    e.stopPropagation();
                                                    e.preventDefault();
                                                    linkAuxStore.goToTaskList({
                                                        stateList: [ISSUE_STATE_PROCESS, ISSUE_STATE_CHECK],
                                                        execUserIdList: [member?.member.member_user_id ?? ""],
                                                        checkUserIdList: [],
                                                    }, history);
                                                }}>查看详情</a>
                                            )}
                                        </Descriptions.Item>
                                        <Descriptions.Item label="未检查任务">
                                            {member.issue_member_state?.task_un_check_count ?? 0}
                                            {(member.issue_member_state?.task_un_check_count ?? 0) > 0 && (
                                                <a style={{ marginLeft: "10px" }} onClick={e => {
                                                    e.stopPropagation();
                                                    e.preventDefault();
                                                    linkAuxStore.goToTaskList({
                                                        stateList: [ISSUE_STATE_PROCESS, ISSUE_STATE_CHECK],
                                                        execUserIdList: [],
                                                        checkUserIdList: [member?.member.member_user_id ?? ""],
                                                    }, history);
                                                }}>查看详情</a>
                                            )}
                                        </Descriptions.Item>
                                        <Descriptions.Item label="未处理缺陷">
                                            {member.issue_member_state?.bug_un_exec_count ?? 0}
                                            {(member.issue_member_state?.bug_un_exec_count ?? 0) > 0 && (
                                                <a style={{ marginLeft: "10px" }} onClick={e => {
                                                    e.stopPropagation();
                                                    e.preventDefault();
                                                    linkAuxStore.goToBugList({
                                                        stateList: [ISSUE_STATE_PROCESS, ISSUE_STATE_CHECK],
                                                        execUserIdList: [member?.member.member_user_id ?? ""],
                                                        checkUserIdList: [],
                                                    }, history);
                                                }}>查看详情</a>
                                            )}
                                        </Descriptions.Item>
                                        <Descriptions.Item label="未复查缺陷">
                                            {member.issue_member_state?.bug_un_check_count ?? 0}
                                            {(member.issue_member_state?.bug_un_check_count ?? 0) > 0 && (
                                                <a style={{ marginLeft: "10px" }} onClick={e => {
                                                    e.stopPropagation();
                                                    e.preventDefault();
                                                    linkAuxStore.goToBugList({
                                                        stateList: [ISSUE_STATE_PROCESS, ISSUE_STATE_CHECK],
                                                        execUserIdList: [],
                                                        checkUserIdList: [member?.member.member_user_id ?? ""],
                                                    }, history);
                                                }}>查看详情</a>
                                            )}
                                        </Descriptions.Item>
                                        {member?.last_event && (
                                            <Descriptions.Item label="工作状态" span={2}>
                                                <span>{moment(member?.last_event?.event_time).format("YYYY-MM-DD HH:mm:ss")}</span>
                                                <EventCom key={member.last_event.event_id} item={member.last_event!}
                                                    skipProjectName={true} skipLink={true}
                                                    showMoreLink={true} onLinkClick={() => { }} />

                                            </Descriptions.Item>
                                        )}
                                        {member.short_note_list.length > 0 && (
                                            <Descriptions.Item label="桌面便签" span={2}>
                                                {member.short_note_list.map(item => (
                                                    <div key={item.target_id}>
                                                        {item.short_note_type == SHORT_NOTE_TASK && (
                                                            <span>任务:&nbsp;<a onClick={e => {
                                                                e.stopPropagation();
                                                                e.preventDefault();
                                                                linkAuxStore.goToLink(new LinkTaskInfo("", item.project_id, item.target_id), history);
                                                            }}>{item.title}</a></span>
                                                        )}
                                                        {item.short_note_type == SHORT_NOTE_BUG && (
                                                            <span>缺陷:&nbsp;<a onClick={e => {
                                                                e.stopPropagation();
                                                                e.preventDefault();
                                                                linkAuxStore.goToLink(new LinkBugInfo("", item.project_id, item.target_id), history);
                                                            }}>{item.title}</a></span>
                                                        )}
                                                    </div>
                                                ))}
                                            </Descriptions.Item>
                                        )}

                                        <Descriptions.Item label="成员目标" span={2} contentStyle={{ padding: "0px 0px" }}>
                                            <GoalList memberUserId={member.member.member_user_id} />
                                        </Descriptions.Item>
                                        <Descriptions.Item label={
                                            <Space direction="vertical">
                                                <span>成员贡献</span>
                                                <MemberAwardState state={awardStateList.find(item => item.member_user_id == member.member.member_user_id)} />
                                            </Space>
                                        } span={2} contentStyle={{ padding: "0px 0px" }}>

                                            <AwardList memberUserId={member.member.member_user_id} />
                                        </Descriptions.Item>
                                    </Descriptions>
                                )}
                            </Tabs.TabPane>
                        ))}
                    </Tabs>
                </Collapse.Panel>
            </Collapse >
            {ownerMemberUserId != "" && (
                <Modal
                    title="转移超级管理员"
                    open
                    onCancel={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        setOwnerMemberUserId("");
                    }}
                    onOk={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        changeOwner();
                    }}>
                    是否把<b>&nbsp;超级管理员&nbsp;</b>转移给 {memberStore.getMember(ownerMemberUserId)?.member.display_name ?? ""}?
                </Modal>
            )}
            {removeMemberUserId != "" && (
                <Modal title="移除人员" open
                    okButtonProps={{ danger: true }}
                    okText="移除"
                    onCancel={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        setRemoveMemberUserId("");
                    }}
                    onOk={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        removeMember();
                    }}>
                    <div
                        style={{
                            textAlign: 'center',
                            fontSize: '14px',
                            lineHeight: '20px',
                            marginBottom: '20px',
                            color: ' #2C2D2E',
                        }}
                    >
                        是否确认移除成员 {memberStore.getMember(removeMemberUserId)?.member.display_name ?? ""}？
                    </div>
                </Modal>
            )}
        </>
    );
};

export default observer(MemberInfoPanel);