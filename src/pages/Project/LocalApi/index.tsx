import React, { useEffect, useState } from "react";
import CardWrap from '@/components/CardWrap';
import { observer } from 'mobx-react';
import s from './index.module.less';
import { useStores } from "@/hooks";
import { get_port } from "@/api/local_api";
import { request } from '@/utils/request';
import { get_local_api_token, remove_local_api_token, renew_local_api_token } from '@/api/project';
import Button from "@/components/Button";
import { WarningTwoTone } from "@ant-design/icons";
import { Input, Modal, Space, message } from "antd";
import { writeText } from '@tauri-apps/api/clipboard';
import { WebviewWindow } from '@tauri-apps/api/window';
import { PROTO } from "@/pages/LocalApi/proto";
import { RelProjectList } from "./RelProjectList";
import LocalApiPermInfo from "./LocalApiPermInfo";


const LocalApi = () => {
    const userStore = useStores('userStore');
    const projectStore = useStores('projectStore');

    const [port, setPort] = useState(0);
    const [token, setToken] = useState("");
    const [showToken, setShowToken] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [showRemoveModal, setShowRemoveModal] = useState(false);

    const loadPort = async () => {
        const res = await get_port();
        setPort(res);
    };

    const loadToken = async () => {
        const res = await request(get_local_api_token(userStore.sessionId, projectStore.curProjectId));
        if (res) {
            setToken(res.token);
        }
    };

    const renewToken = async () => {
        const res = await request(renew_local_api_token(userStore.sessionId, projectStore.curProjectId));
        if (res) {
            setToken(res.token);
            setShowUpdateModal(false);
        }
    }

    const removeToken = async () => {
        const res = await request(remove_local_api_token(userStore.sessionId, projectStore.curProjectId));
        if (res) {
            setShowRemoveModal(false);
            setToken("");
        }
    };

    const copyText = async (txt: string) => {
        await writeText(txt);
        message.info("????????????");
    }

    const openApiConsole = async () => {
        const label = "localapi"
        const view = WebviewWindow.getByLabel(label);
        if (view != null) {
            await view.close();
        }
        new WebviewWindow(label, {
            url: `local_api.html?port=${port}`,
            width: 800,
            minWidth: 800,
            height: 600,
            minHeight: 600,
            center: true,
            title: "??????????????????",
            resizable: true,
        });
    };

    useEffect(() => {
        loadPort();
        loadToken();
    }, []);

    return (
        <CardWrap title="????????????" halfContent>
            <div className={s.content_wrap}>
                <div className={s.api_btn_wrap}>
                    <Button
                        title={port == 0 ? "????????????????????????" : ""}
                        onClick={e => {
                            e.stopPropagation();
                            e.preventDefault();
                            openApiConsole();
                        }} disabled={port == 0}>????????????</Button>
                </div>
                <div>
                    <div className={s.info_wrap}>
                        <div className={s.info_label}>??????ID???</div>
                        <div className={s.info_value}>
                            <Space>
                                {projectStore.curProjectId}
                                <a onClick={e => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    copyText(projectStore.curProjectId);
                                }}>??????</a>
                            </Space>
                        </div>
                    </div>
                    <div className={s.info_wrap}>
                        <div className={s.info_label}>???????????????</div>
                        <div className={s.info_value}>
                            {token == "" && (
                                <Space>
                                    ?????????
                                    <a onClick={e => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        renewToken();
                                    }}>????????????</a>
                                </Space>
                            )}
                            {token != "" && (
                                <Space>
                                    {showToken ? <Input value={token} disabled /> : <Input value="*********************" disabled />}
                                    <a onClick={e => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        setShowToken(!showToken);
                                    }}>{showToken ? "??????" : "??????"}</a>
                                    <a onClick={e => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        copyText(token);
                                    }}>??????</a>
                                </Space>
                            )}
                        </div>
                    </div>
                    {token != "" && (
                        <div className={s.info_wrap}>
                            <div className={s.info_label} />
                            <div className={s.info_value}>
                                <Space>
                                    <Button type="ghost" onClick={e => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        setShowUpdateModal(true);
                                    }}>????????????</Button>
                                    <Button type="ghost" onClick={e => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        setShowRemoveModal(true);
                                    }}>????????????</Button>
                                </Space>
                            </div>
                        </div>
                    )}

                    <div className={s.info_wrap}>
                        <div className={s.info_label}>???????????????</div>
                        <div>
                            {port == 0 && "?????????????????????"}
                            {port != 0 && (
                                <Space>
                                    <span>127.0.0.1:{port}</span>
                                    <a onClick={e => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        copyText(`127.0.0.1:${port}`);
                                    }}>??????</a>
                                </Space>
                            )}
                        </div>
                    </div>
                    {port != 0 && (
                        <div className={s.info_wrap}>
                            <div className={s.info_label}>???????????????</div>
                            <div>
                                <a onClick={e => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    copyText(PROTO.replace("__PORT__", `${port}`));
                                }}>??????</a>
                            </div>
                        </div>
                    )}
                </div>
                {projectStore.isAdmin && (
                    <>
                        <h2 className={s.head}>????????????</h2>
                        <LocalApiPermInfo/>
                    </>
                )}
                <h2 className={s.head}>????????????</h2>
                <RelProjectList />
            </div>
            {showUpdateModal && (
                <Modal
                    title="??????????????????"
                    open
                    onCancel={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        setShowUpdateModal(false);
                    }}
                    onOk={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        renewToken();
                    }}>
                    <p><WarningTwoTone twoToneColor="red" />&nbsp;???????????????????????????????????????????????????????????????</p>
                </Modal>
            )}
            {showRemoveModal && (
                <Modal
                    title="??????????????????"
                    open
                    onCancel={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        setShowRemoveModal(false);
                    }}
                    onOk={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        removeToken();
                    }}>
                    <p><WarningTwoTone twoToneColor="red" />&nbsp;??????????????????????????????????????????????????????????????????</p>
                </Modal>
            )}
        </CardWrap>
    );
};

export default observer(LocalApi);