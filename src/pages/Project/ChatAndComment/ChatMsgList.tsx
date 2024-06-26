//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import React, { useEffect, useRef, useState } from "react";
import { observer } from 'mobx-react';
import { Button, Card, Modal, Popover, Space, message } from "antd";
import { useStores } from "@/hooks";
import { DeleteOutlined, DoubleLeftOutlined, InfoCircleOutlined, LogoutOutlined, MoreOutlined, UserSwitchOutlined } from "@ant-design/icons";
import { get_content_text, useCommonEditor } from "@/components/Editor";
import { FILE_OWNER_TYPE_NONE } from "@/api/fs";
import { LIST_MSG_AFTER, LIST_MSG_BEFORE, send_msg, clear_unread, update_group, update_group_member, leave_group, remove_group } from "@/api/project_chat";
import { request } from "@/utils/request";
import ChatMsgItem from "./components/ChatMsgItem";
import GroupMemberList from "./components/GroupMemberList";
import SelectGroupMemberModal from "./components/SelectGroupMemberModal";

const ChatMsgList = () => {
    const userStore = useStores("userStore");
    const projectStore = useStores('projectStore');

    const msgListDiv = useRef<HTMLDivElement>(null);
    const [hasContent, setHasContent] = useState(false);
    const [hover, setHover] = useState(false);
    const [showUpdateGroupModal, setShowUpdateGroupModal] = useState(false);
    const [showLeaveGroupModal, setShowLeaveGroupModal] = useState(false);
    const [showRemoveGroupModal, setShowRemoveGroupModal] = useState(false);

    const { editor, editorRef } = useCommonEditor({
        content: "",
        fsId: "",
        enableLink: true,
        ownerType: FILE_OWNER_TYPE_NONE,
        ownerId: "",
        projectId: projectStore.curProjectId,
        historyInToolbar: false,
        clipboardInToolbar: false,
        commonInToolbar: false,
        widgetInToolbar: false,
        showReminder: false,
        pubResInToolbar: false,
        placeholder: "请输入...",
    });

    const sendMsg = async () => {
        if (editorRef.current == null) {
            return;
        }
        const content = editorRef.current.getContent();
        await request(send_msg({
            session_id: userStore.sessionId,
            project_id: projectStore.curProjectId,
            chat_group_id: projectStore.curProject?.chat_store.curGroupId ?? "",
            content: JSON.stringify(content),
        }));
        editorRef.current.setContent("");
        setHasContent(false);
    };

    const processScroll = () => {
        if (msgListDiv.current == null) {
            return;
        }
        if (!hover) {
            return;
        }
        if (msgListDiv.current.clientHeight >= msgListDiv.current.scrollHeight) {
            return;
        }
        if (projectStore.curProject?.chat_store.curRefMsgId != "") {
            return;
        }
        if (msgListDiv.current.scrollTop < 10) {
            projectStore.curProject?.chat_store.loadMoreMsg(LIST_MSG_BEFORE);
        } else if ((msgListDiv.current.scrollHeight - msgListDiv.current.clientHeight - msgListDiv.current.scrollTop) < 10) {
            projectStore.curProject?.chat_store.loadMoreMsg(LIST_MSG_AFTER);
        }
    };

    const clearUnreadCount = async () => {
        await request(clear_unread({
            session_id: userStore.sessionId,
            project_id: projectStore.curProjectId,
            chat_group_id: projectStore.curProject?.chat_store.curGroupId ?? "",
        }));
        await projectStore.curProject?.chat_store.onUpdateGroup(projectStore.curProject?.chat_store.curGroupId ?? "");
    };

    const updateChatGroup = async (newTitle: string, newUserIdList: string[]) => {
        if (newTitle != projectStore.curProject?.chat_store.curGroup?.groupInfo.title) {
            await request(update_group({
                session_id: userStore.sessionId,
                project_id: projectStore.curProjectId,
                chat_group_id: projectStore.curProject?.chat_store.curGroupId ?? "",
                title: newTitle,
            }));
            projectStore.curProject?.chat_store.onUpdateGroup(projectStore.curProject?.chat_store.curGroupId ?? "");
        }
        await request(update_group_member({
            session_id: userStore.sessionId,
            project_id: projectStore.curProjectId,
            chat_group_id: projectStore.curProject?.chat_store.curGroupId ?? "",
            member_user_id_list: newUserIdList,
        }));
        projectStore.curProject?.chat_store.onUpdateMember(projectStore.curProject?.chat_store.curGroupId ?? "");
        message.info("更新成功");
    }

    const leaveGroup = async () => {
        const groupId = projectStore.curProject?.chat_store.curGroupId ?? "";
        await request(leave_group({
            session_id: userStore.sessionId,
            project_id: projectStore.curProjectId,
            chat_group_id: groupId,
        }));
        await projectStore.curProject?.chat_store.onLeaveGroup(groupId);
        setShowLeaveGroupModal(false);
        message.info("离开沟通群成功");
    };

    const removeGroup = async () => {
        const groupId = projectStore.curProject?.chat_store.curGroupId ?? "";
        await request(remove_group({
            session_id: userStore.sessionId,
            project_id: projectStore.curProjectId,
            chat_group_id: groupId,
        }));
        await projectStore.curProject?.chat_store.onLeaveGroup(groupId);
        setShowRemoveGroupModal(false);
        message.info("删除沟通群成功");
    };

    useEffect(() => {
        if (msgListDiv.current == null) {
            return;
        }
        if (msgListDiv.current.clientHeight >= msgListDiv.current.scrollHeight) {
            return;
        }
        if ((msgListDiv.current.scrollHeight - msgListDiv.current.clientHeight - msgListDiv.current.scrollTop) < 200
            && (projectStore.curProject?.chat_store.hasLastMsg() ?? false) == true) {
            setTimeout(() => {
                const lstMsgId = projectStore.curProject?.chat_store.curGroup?.lastMsg?.chat_msg_id ?? "";
                const el = document.getElementById(lstMsgId);
                if (el != null) {
                    el.scrollIntoView({
                        behavior: "smooth",
                        block: "nearest",
                        inline: "nearest",
                    });
                }
            }, 200);
        }
    }, [projectStore.curProject?.chat_store.curGroupMsgList]);

    useEffect(() => {
        if (projectStore.curProject?.chat_store.curRefMsgId != "" && msgListDiv.current != null) {
            setTimeout(() => {
                const el = document.getElementById(projectStore.curProject?.chat_store.curRefMsgId ?? "");
                if (el != null) {
                    el.scrollIntoView({
                        behavior: "smooth",
                        block: "nearest",
                        inline: "nearest",
                    });
                }
                projectStore.curProject?.chat_store.resetCurRefMsgId();
            }, 200);
        }
    }, [projectStore.curProject?.chat_store.curRefMsgId]);

    useEffect(() => {
        if (editorRef.current == null) {
            return;
        }
        const timer = setInterval(() => {
            if (editorRef.current != null) {
                const content = editorRef.current.getContent();
                setHasContent(get_content_text(content).trim() != "");
            }
        }, 200);

        return () => {
            clearInterval(timer);
        };
    }, [editorRef]);

    useEffect(() => {
        clearUnreadCount();
    }, [projectStore.curProject?.chat_store.curGroupMsgList]);

    return (
        <Card title={
            <Space size="small">
                <Button type="link" icon={<DoubleLeftOutlined />} onClick={e => {
                    e.stopPropagation();
                    e.preventDefault();
                    if (projectStore.curProject !== undefined) {
                        projectStore.curProject.chat_store.curGroupId = "";
                    }
                }} style={{ minWidth: 0, padding: "0px 0px" }} title="返回" />
                <span style={{ fontSize: "16px", fontWeight: 600 }}>{projectStore.curProject?.chat_store.curGroup?.groupInfo.title ?? ""}</span>
            </Space>
        }
            headStyle={{ padding: "0px 0px" }} bordered={false}
            bodyStyle={{ height: "calc(100vh - 185px)", padding: "0px 0px", display: "flex", flexDirection: "column" }}
            extra={
                <Space style={{ marginRight: "10px" }}>
                    {(projectStore.curProject?.chat_store.curGroup?.groupInfo.user_perm.can_update ?? false) == true && (
                        <Button type="link" icon={<UserSwitchOutlined style={{ fontSize: "20px" }} />} style={{ minWidth: 0, padding: "0px 0px" }}
                            onClick={e => {
                                e.stopPropagation();
                                e.preventDefault();
                                setShowUpdateGroupModal(true);
                            }} />
                    )}
                    <Popover trigger="hover" placement="bottomLeft" content={<GroupMemberList chatGroupId={projectStore.curProject?.chat_store.curGroupId ?? ""} />}>
                        <span style={{ cursor: "default" }}><InfoCircleOutlined />&nbsp;{projectStore.curProject?.chat_store.curGroup?.memberList.length ?? 0}人&nbsp;&nbsp;</span>
                    </Popover>
                    {projectStore.curProject?.chat_store.curGroupId != projectStore.curProject?.default_chat_group_id && (
                        <Popover trigger="click" placement="bottom" content={
                            <Space direction="vertical">
                                <Button type="link" danger icon={<LogoutOutlined />}
                                    disabled={(projectStore.curProject?.chat_store.curGroup?.groupInfo.user_perm.can_leave ?? false) == false}
                                    onClick={e => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        setShowLeaveGroupModal(true);
                                    }}>
                                    退出沟通群
                                </Button>
                                <Button type="link" danger icon={<DeleteOutlined />}
                                    disabled={(projectStore.curProject?.chat_store.curGroup?.groupInfo.user_perm.can_remove ?? false) == false}
                                    onClick={e => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        setShowRemoveGroupModal(true);
                                    }}>
                                    删除沟通群
                                </Button>
                            </Space>
                        }>
                            <MoreOutlined />
                        </Popover>
                    )}
                </Space>
            }>
            <div style={{ flex: 1, overflowY: "auto" }} ref={msgListDiv} onScroll={() => processScroll()}
                onMouseEnter={e => {
                    e.stopPropagation();
                    setHover(true);
                }}
                onMouseLeave={e => {
                    e.stopPropagation();
                    setHover(false);
                }}>
                {(projectStore.curProject?.chat_store.curGroupMsgList ?? []).map(item => (
                    <div id={item.chat_msg_id} key={item.chat_msg_id}>
                        <ChatMsgItem msg={item} />
                    </div>
                ))}
            </div>
            <div style={{ position: "relative" }}>
                <div className="_chatContext">
                    {editor}
                </div>
                <Button style={{ position: "absolute", right: "20px", bottom: "10px" }} type="primary"
                    disabled={!hasContent}
                    onClick={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        sendMsg();
                    }}>发送</Button>
            </div>
            {showUpdateGroupModal == true && (
                <SelectGroupMemberModal onCancel={() => setShowUpdateGroupModal(false)} onOk={(newTitle, newUserIdList) => {
                    updateChatGroup(newTitle, newUserIdList).then(() => setShowUpdateGroupModal(false));
                }} />
            )}
            {showLeaveGroupModal == true && projectStore.curProject != undefined && projectStore.curProject.chat_store.curGroup != undefined && (
                <Modal open title="离开沟通群"
                    okText="离开" okButtonProps={{ danger: true }}
                    onCancel={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        setShowLeaveGroupModal(false);
                    }}
                    onOk={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        leaveGroup();
                    }}>
                    是否离开沟通群{projectStore.curProject.chat_store.curGroup.groupInfo.title}?
                </Modal>
            )}
            {showRemoveGroupModal == true && projectStore.curProject != undefined && projectStore.curProject.chat_store.curGroup != undefined && (
                <Modal open title="删除沟通群"
                    okText="删除" okButtonProps={{ danger: true }}
                    onCancel={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        setShowRemoveGroupModal(false);
                    }}
                    onOk={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        removeGroup();
                    }}>
                    是否删除沟通群{projectStore.curProject.chat_store.curGroup.groupInfo.title}?
                </Modal>
            )}
        </Card>
    );
};

export default observer(ChatMsgList);