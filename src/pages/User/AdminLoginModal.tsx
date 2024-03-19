import { FolderOpenOutlined } from "@ant-design/icons";
import { Form, Input, Button, Modal } from "antd";
import React, { useState } from "react";
import { open as open_dialog } from '@tauri-apps/api/dialog';
import { pre_auth, auth, sign } from '@/api/admin_auth';
import { request } from "@/utils/request";
import { useHistory } from "react-router-dom";
import { ADMIN_PATH } from "@/utils/constant";
import { useStores } from "@/hooks";
import { runInAction } from "mobx";

export interface AdminLoginModalProps {
    onClose: () => void;
}

export const AdminLoginModal = (props: AdminLoginModalProps) => {
    const [form] = Form.useForm();

    const history = useHistory();

    const [userName, setUserName] = useState("");
    const [privKey, setPrivKey] = useState("");
    const userStore = useStores('userStore');

    const selectPrivKey = async () => {
        const selectd = await open_dialog({
            title: "选择OpenSsh密钥"
        });
        if (!(Array.isArray(selectd) || selectd == null)) {
            setPrivKey(selectd);
            form.setFieldValue("privKey", selectd);
        }
    };

    const loginAdmin = async () => {
        const preRes = await request(pre_auth({
            user_name: userName,
        }));
        const signRes = await sign(privKey, preRes.to_sign_str);
        await request(auth({
            admin_session_id: preRes.admin_session_id,
            sign: signRes,
        }));
        runInAction(() => {
            userStore.adminSessionId = preRes.admin_session_id;
        });
        userStore.showUserLogin = null;
        history.push(ADMIN_PATH);
    };

    return (
        <Modal open title="登录管理后台"
            okText="登录" okButtonProps={{ disabled: userName == "" || privKey == "" }}
            onCancel={e => {
                e.stopPropagation();
                e.preventDefault();
                props.onClose();
            }}
            onOk={e => {
                e.stopPropagation();
                e.preventDefault();
                loginAdmin();
            }}>
            <Form form={form} labelCol={{ span: 5 }} >
                <Form.Item label="管理员账号" name="userName" rules={[{ required: true }]}>
                    <Input value={userName} onChange={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        setUserName(e.target.value);
                    }} />
                </Form.Item>
                <Form.Item label="OpenSsh密钥" name="privKey" rules={[{ required: true }]}>
                    <Input addonAfter={
                        <Button type="text" style={{ height: 20 }} icon={<FolderOpenOutlined />} onClick={e => {
                            e.stopPropagation();
                            e.preventDefault();
                            selectPrivKey();
                        }} />
                    } value={privKey} onChange={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        setPrivKey(e.target.value);
                    }} />
                </Form.Item>
            </Form>
        </Modal>
    );
}; 