//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import React, { useState } from "react";
import { LocalRepoInfo } from "@/api/local_repo";
import { Form, Input, message, Modal } from "antd";
import { add_branch } from "@/api/git_wrap";

export interface CreateBranchModalProps {
    repo: LocalRepoInfo;
    commitId: string;
    onCancel: () => void;
    onOk: () => void;
}

const CreateBranchModal = (props: CreateBranchModalProps) => {

    const [newBranchName, setNewBranchName] = useState("");

    const createBranch = async () => {
        try {
            await add_branch(props.repo.path, newBranchName, props.commitId);
            props.onOk();
        } catch (e) {
            message.error(`${e}`);
        }
    };

    return (
        <Modal open title="创建分支"
            okText="创建" okButtonProps={{ disabled: newBranchName == "" }}
            onCancel={e => {
                e.stopPropagation();
                e.preventDefault();
                props.onCancel();
            }}
            onOk={e => {
                e.stopPropagation();
                e.preventDefault();
                createBranch();
            }}>
            <Form>
                <Form.Item label="新分支名称">
                    <Input value={newBranchName} onChange={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        setNewBranchName(e.target.value.trim());
                    }} />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default CreateBranchModal;