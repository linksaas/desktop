//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import React, { useState } from "react";
import type { ResourcePerm, ResourceUserPerm } from "@/api/k8s_proxy";
import { set_resource_perm } from "@/api/k8s_proxy";
import { Checkbox, Form, Modal, message } from "antd";
import { useStores } from "@/hooks";
import { gen_one_time_token, type MemberInfo } from "@/api/project_member";
import { request } from "@/utils/request";

export interface ResourcePermModalProps {
    perm: ResourcePerm;
    onCancel: () => void;
    onOk: () => void;
}

const ResourcePermModal = (props: ResourcePermModalProps) => {
    const userStore = useStores('userStore');
    const projectStore = useStores('projectStore');
    const memberStore = useStores('memberStore');
    const cloudStore = useStores('cloudStore');

    const [userPermList, setUserPermList] = useState(props.perm.user_perm_list);
    const [hasChange, setHasChange] = useState(false);

    const calcPermStr = (member: MemberInfo) => {
        if (member.can_admin) {
            return ["update_scale", "update_image", "logs", "exec"];
        }
        const index = userPermList.findIndex(item => item.user_id == member.member_user_id);
        if (index == -1) {
            return [];
        }
        const permStrList: string[] = [];
        if (userPermList[index].update_scale) {
            permStrList.push("update_scale");
        }
        if (userPermList[index].update_image) {
            permStrList.push("update_image");
        }
        if (userPermList[index].logs) {
            permStrList.push("logs");
        }
        if (userPermList[index].exec) {
            permStrList.push("exec");
        }
        return permStrList;
    };

    const updatePerm = async () => {
        const servAddr = projectStore.curProject?.setting.k8s_proxy_addr ?? "";
        const tokenRes = await request(gen_one_time_token({
            session_id: userStore.sessionId,
            project_id: projectStore.curProjectId,
        }));
        await request(set_resource_perm(servAddr, {
            token: tokenRes.token,
            namespace: cloudStore.curNameSpace,
            perm: {
                resource_type: props.perm.resource_type,
                name: props.perm.name,
                user_perm_list: userPermList,
            },
        }));
        message.info("修改权限成功");
        props.onOk();
    };

    return (
        <Modal open title={projectStore.isAdmin ? "修改权限" : "查看权限"}
            bodyStyle={{ maxHeight: "calc(100vh - 400px)", overflowY: "scroll" }}
            footer={projectStore.isAdmin ? undefined : null}
            okText="修改" okButtonProps={{ disabled: !hasChange }}
            onCancel={e => {
                e.stopPropagation();
                e.preventDefault();
                props.onCancel();
            }}
            onOk={e => {
                e.stopPropagation();
                e.preventDefault();
                updatePerm();
            }}>
            <Form labelCol={{ span: 6 }}>
                {memberStore.memberList.map(item => (
                    <Form.Item key={item.member.member_user_id} label={item.member.display_name}>
                        <Checkbox.Group options={[
                            {
                                label: "修改Pod数量",
                                value: "update_scale",
                            },
                            {
                                label: "更新镜像",
                                value: "update_image",
                            },
                            {
                                label: "查看日志",
                                value: "logs",
                            },
                            {
                                label: "打开终端",
                                value: "exec",
                            }
                        ]} value={calcPermStr(item.member)} disabled={item.member.can_admin || !projectStore.isAdmin}
                            onChange={values => {
                                const newPerm: ResourceUserPerm = {
                                    user_id: item.member.member_user_id,
                                    update_scale: values.includes("update_scale"),
                                    update_image: values.includes("update_image"),
                                    logs: values.includes("logs"),
                                    exec: values.includes("exec"),
                                };
                                const tmpList = userPermList.slice();
                                const index = tmpList.findIndex(item2 => item2.user_id == item.member.member_user_id);
                                if (index != -1) {
                                    tmpList[index] = newPerm;
                                } else {
                                    tmpList.push(newPerm);
                                }
                                setUserPermList(tmpList);
                                setHasChange(true);
                            }} />
                    </Form.Item>
                ))}
            </Form>
        </Modal>
    );
};

export default ResourcePermModal;