import React, { useEffect, useState } from "react";
import { checkout_branch, list_repo_branch, LocalRepoBranchInfo, type LocalRepoInfo } from "@/api/local_repo";
import { Form, message, Modal, Select } from "antd";


export interface ChangeBranchModalProps {
    headBranch: string;
    repo: LocalRepoInfo;
    onCancel: () => void;
    onOk: () => void;
}

const ChangeBranchModal = (props: ChangeBranchModalProps) => {
    const [curBranch, setCurBranch] = useState(props.headBranch);
    const [branchList, setBranchList] = useState<LocalRepoBranchInfo[]>([]);

    const loadBranchList = async () => {
        const res = await list_repo_branch(props.repo.path);
        setBranchList(res);
    };

    const checkOutBranch = async () => {
        await checkout_branch(props.repo.path, curBranch);
        props.onOk();
        message.info("切换成功");
    };

    useEffect(() => {
        loadBranchList();
    }, []);

    return (
        <Modal open title={`仓库 ${props.repo.name} 切换分支`}
            okText="切换" okButtonProps={{ disabled: curBranch == props.headBranch }}
            onCancel={e => {
                e.stopPropagation();
                e.preventDefault();
                props.onOk();
            }}
            onOk={e => {
                e.stopPropagation();
                e.preventDefault();
                checkOutBranch();
            }}>
            <Form>
                <Form.Item label="分支">
                    <Select value={curBranch} onChange={value => setCurBranch(value)}>
                        {branchList.map(item => (
                            <Select.Option key={item.name} value={item.name}>{item.name}</Select.Option>
                        ))}
                    </Select>
                </Form.Item>
            </Form>
        </Modal>
    )
};

export default ChangeBranchModal;