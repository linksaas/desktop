//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import { Button, Form, Input, Modal, Radio, message } from "antd";
import React, { useState } from "react";
import { FolderOpenOutlined } from "@ant-design/icons";
import { open as open_dialog } from '@tauri-apps/api/dialog';
import AppPermPanel from "./AppPermPanel";
import { observer } from 'mobx-react';
import { start } from '@/api/min_app';
import { useStores } from "@/hooks";
import type { AppPerm } from "@/api/appstore";

interface DebugMinAppModalProps {
    onCancel: () => void;
    onOk: () => void;
}

const DebugMinAppModal: React.FC<DebugMinAppModalProps> = (props) => {
    const userStore = useStores('userStore');

    const [useUrl, setUseUrl] = useState(true);
    const [remoteUrl, setRemoteUrl] = useState("");
    const [localPath, setLocalPath] = useState("");
    const [debugPerm, setDebugPerm] = useState<AppPerm>({
        net_perm: {
            cross_domain_http: false,
            proxy_redis: false,
            proxy_mysql: false,
            proxy_post_gres: false,
            proxy_mongo: false,
            proxy_ssh: false,
            net_util: false,
            proxy_grpc: false,
        },
        fs_perm: {
            read_file: false,
            write_file: false,
        },
        extra_perm: {
            cross_origin_isolated: false,
            open_browser: false,
        }
    });

    const choicePath = async () => {
        const selected = await open_dialog({
            title: "打开本地应用目录",
            directory: true,
        });
        if (selected == null || Array.isArray(selected)) {
            return;
        }
        setLocalPath(selected);
    };

    const startDebug = async () => {
        let path = "";
        if (useUrl == true) {
            path = "http://localhost" + remoteUrl;
        } else {
            if (localPath.trim() == "") {
                message.error("请选择本地目录");
                return;
            }
            path = localPath;
        }

        await start({
            user_id: userStore.userInfo.userId,
            user_display_name: userStore.userInfo.displayName,
            label: "minApp:debug",
            title: `调试微应用(${path})`,
            path: path,
        }, debugPerm);
        props.onOk();
    };

    return (
        <Modal open title="调试微应用"
            onCancel={e => {
                e.stopPropagation();
                e.preventDefault();
                props.onCancel();
            }}
            onOk={e => {
                e.stopPropagation();
                e.preventDefault();
                startDebug();
            }}>
            <Form>
                <Form.Item label="应用方式">
                    <Radio.Group value={useUrl} onChange={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        setUseUrl(e.target.value!);
                    }}>
                        <Radio value={true}>本地URL</Radio>
                        <Radio value={false}>本地路径</Radio>
                    </Radio.Group>
                </Form.Item>
                {useUrl == true && (
                    <Form.Item label="url地址">
                        <Input prefix="http://localhost" value={remoteUrl} onChange={e => {
                            e.stopPropagation();
                            e.preventDefault();
                            setRemoteUrl(e.target.value);
                        }} />
                    </Form.Item>
                )}
                {useUrl == false && (
                    <Form.Item label="本地路径">
                        <Input value={localPath} onChange={e => {
                            e.stopPropagation();
                            e.preventDefault();
                            setLocalPath(e.target.value);
                        }}
                            addonAfter={<Button type="link" style={{ height: 20 }} icon={<FolderOpenOutlined />} onClick={e => {
                                e.stopPropagation();
                                e.preventDefault();
                                choicePath();
                            }} />} />
                    </Form.Item>
                )}
            </Form>
            <AppPermPanel disable={false} onChange={perm => setDebugPerm(perm)} showTitle />
        </Modal>
    );
};

export default observer(DebugMinAppModal);
