//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import React, { useEffect, useState } from "react";
import type { AppInfo, AppComment } from "@/api/appstore";
import { agree_app, cancel_agree_app, get_app, list_comment, add_comment, remove_comment, install_app } from "@/api/appstore";
import { Button, Card, Descriptions, Dropdown, Input, List, Modal, Space, message } from "antd";
import { observer } from 'mobx-react';
import { useStores } from "@/hooks";
import { request } from "@/utils/request";
import { CommentOutlined, DownloadOutlined, HeartTwoTone, LeftOutlined } from "@ant-design/icons";
import AppPermPanel from "@/pages/Admin/AppAdmin/components/AppPermPanel";
import { ReadOnlyEditor } from "@/components/Editor";
import { list_app as list_user_app, save_app_list } from "@/api/user_app";
import { open as open_shell } from '@tauri-apps/api/shell';
import UserPhoto from "@/components/Portrait/UserPhoto";
import moment from "moment";

const PAGE_SIZE = 10;



const AppStoreDetail = () => {
    const appStore = useStores('appStore');
    const userStore = useStores('userStore');
    const pubResStore = useStores('pubResStore');

    const [myAppIdList, setMyAppIdList] = useState<string[]>([]);

    const [appInfo, setAppInfo] = useState<AppInfo | null>(null);
    const [commentContent, setCommentContent] = useState("");

    const [commentList, setCommentList] = useState<AppComment[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [curPage, setCurPage] = useState(0);

    const [removeCommentInfo, setRemoveCommentInfo] = useState<AppComment | null>(null);

    const loadMyAppIdList = async () => {
        const res = await list_user_app();
        setMyAppIdList(res);
    };

    const loadAppInfo = async () => {
        const res = await request(get_app({
            app_id: pubResStore.showAppId,
            session_id: userStore.sessionId,
        }));
        setAppInfo(res.app_info);
    };


    const loadCommentList = async () => {
        const res = await request(list_comment({
            app_id: pubResStore.showAppId,
            offset: PAGE_SIZE * curPage,
            limit: PAGE_SIZE,
        }));

        setTotalCount(res.total_count);
        setCommentList(res.comment_list);
    };

    const addComment = async () => {
        if (commentContent.trim() == "") {
            return;
        }
        await request(add_comment({
            session_id: userStore.sessionId,
            app_id: pubResStore.showAppId,
            comment: commentContent,
        }));
        message.info("增加评论成功");
        setCommentContent("");
        if (curPage == 0) {
            await loadCommentList();
        } else {
            setCurPage(0);
        }
        pubResStore.incAppDataVersion();
    };

    const removeComment = async () => {
        if (removeCommentInfo == null) {
            return;
        }
        await request(remove_comment({
            session_id: userStore.sessionId,
            app_id: pubResStore.showAppId,
            comment_id: removeCommentInfo.comment_id,
        }));
        message.info("删除评论成功");
        setRemoveCommentInfo(null);
        if (curPage == 0) {
            await loadCommentList();
        } else {
            setCurPage(0);
        }
        pubResStore.incAppDataVersion();
    };

    const installUserApp = async () => {
        if (appInfo == null) {
            return;
        }
        const tmpList = myAppIdList.slice();
        if(tmpList.includes(appInfo.app_id) == false){
            tmpList.push(appInfo.app_id);
            setMyAppIdList(tmpList);
            await save_app_list(tmpList);
            await install_app({ app_id: appInfo.app_id });
            setAppInfo({ ...appInfo, install_count: appInfo.install_count + 1 });
            pubResStore.incAppDataVersion();
        }
        
    };

    const removeUserApp = async () => {
        if (appInfo == null) {
            return;
        }
        const tmpList = myAppIdList.filter(item=>item != appInfo.app_id);
        await save_app_list(tmpList);
        setMyAppIdList(tmpList);
    };

    const agreeApp = async (appId: string, newAgree: boolean) => {
        if (appInfo == null) {
            return;
        }
        if (newAgree) {
            await request(agree_app({
                session_id: userStore.sessionId,
                app_id: appId,
            }));
        } else {
            await request(cancel_agree_app({
                session_id: userStore.sessionId,
                app_id: appId,
            }));
        }
        let newAgreeCount = appInfo.agree_count;
        if (newAgree) {
            newAgreeCount = appInfo.agree_count + 1;
        } else {
            if (appInfo.agree_count > 0) {
                newAgreeCount = appInfo.agree_count - 1;
            }
        }

        setAppInfo({ ...appInfo, agree_count: newAgreeCount, my_agree: newAgree });
        pubResStore.incAppDataVersion();
    };

    useEffect(() => {
        loadAppInfo();
        loadMyAppIdList();
        if (curPage != 0) {
            setCurPage(0);
        } else {
            loadCommentList();
        }
    }, [pubResStore.showAppId]);


    return (
        <Card title={
            <Space>
                <Button type="link" style={{ minWidth: 0, padding: "0px 0px" }}
                    onClick={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        pubResStore.showAppId = "";
                    }}><LeftOutlined style={{ fontSize: "16px" }} /></Button>
                <h2>{appInfo?.base_info.app_name ?? ""}</h2>
            </Space>
        } bordered={false}
            bodyStyle={{ height: "calc(100vh - 180px)", overflowY: "scroll" }}
            extra={
                <>
                    {appInfo != null && (
                        <Space style={{ fontSize: "18px", paddingRight: "20px" }} size="middle">
                            <div><DownloadOutlined />&nbsp;{appInfo.install_count}</div>
                            <div><CommentOutlined />&nbsp;{totalCount}</div>
                            <div onClick={e => {
                                e.stopPropagation();
                                e.preventDefault();
                                if (userStore.sessionId != "") {
                                    agreeApp(appInfo.app_id, !appInfo.my_agree);
                                }
                            }} style={{ margin: "0px 20px" }}>
                                <a style={{ cursor: userStore.sessionId == "" ? "default" : "pointer" }}>
                                    <HeartTwoTone twoToneColor={appInfo.my_agree ? ["red", "red"] : ["#e4e4e8", "#e4e4e8"]} />
                                </a>
                                &nbsp;{appInfo.agree_count}
                            </div>
                            {myAppIdList.includes(appInfo.app_id) == true && (
                                <Dropdown.Button type="primary" menu={{
                                    items: [
                                        {
                                            key: "remove",
                                            label: <div style={{ padding: "10px 10px", color: "red" }}>卸载应用</div>,
                                            onClick: () => removeUserApp(),
                                        }
                                    ]
                                }} onClick={e => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    appStore.openMinAppId = pubResStore.showAppId;
                                }}>运行应用</Dropdown.Button>
                            )}
                            {myAppIdList.includes(appInfo.app_id) == false && (
                                <Button type="primary" onClick={e => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    installUserApp();
                                }}>安装应用</Button>
                            )}
                        </Space>
                    )}

                </>
            }>
            <h2 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "10px" }}>应用信息</h2>
            {appInfo != null && (
                <Descriptions bordered>
                    <Descriptions.Item label="一级分类">{appInfo.major_cate.cate_name}</Descriptions.Item>
                    <Descriptions.Item label="二级分类">{appInfo.minor_cate.cate_name}</Descriptions.Item>
                    <Descriptions.Item label="三级分类">{appInfo.sub_minor_cate.cate_name}</Descriptions.Item>
                    <Descriptions.Item span={3} label="应用描述">
                        <ReadOnlyEditor content={appInfo.base_info.app_desc} />
                    </Descriptions.Item>
                    <Descriptions.Item span={3} label="应用权限">
                        <AppPermPanel disable={true} showTitle={false} onChange={() => { }} perm={appInfo.app_perm} />
                    </Descriptions.Item>
                    {appInfo.base_info.src_url !== "" && (
                        <Descriptions.Item label="源代码">
                            <a onClick={e => {
                                e.stopPropagation();
                                e.preventDefault();
                                open_shell(appInfo?.base_info.src_url ?? "");
                            }}>{appInfo.base_info.src_url}</a>
                        </Descriptions.Item>
                    )}
                </Descriptions>
            )}
            <h2 style={{ fontSize: "18px", fontWeight: 600, marginTop: "10px" }}>评论列表</h2>
            <div>
                <Input.TextArea
                    autoSize={{ minRows: 5, maxRows: 5 }}
                    value={commentContent}
                    disabled={userStore.sessionId == ""}
                    onChange={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        setCommentContent(e.target.value);
                    }} />
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <Button type="primary" style={{ margin: "10px 10px" }} disabled={commentContent.trim() == ""}
                    onClick={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        addComment();
                    }}>发送</Button>
            </div>
            <List rowKey="comment_id" dataSource={commentList} renderItem={item => (
                <List.Item>
                    <Card style={{ width: "100%" }} bordered={false} title={
                        <Space>
                            <UserPhoto logoUri={item.create_logo_uri} style={{ width: "20px", borderRadius: "10px" }} />
                            <span>{item.create_display_name}</span>
                            <span>{moment(item.create_time).format("YYYY-MM-DD HH:mm:ss")}</span>
                        </Space>
                    } extra={
                        <>
                            {item.create_user_id == userStore.userInfo.userId && (
                                <Button type="link" danger onClick={e => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    setRemoveCommentInfo(item);
                                }}>删除</Button>
                            )}
                        </>
                    }>
                        <pre style={{ whiteSpace: "pre-wrap", wordWrap: "break-word" }}>{item.comment}</pre>
                    </Card>
                </List.Item>
            )} pagination={{ current: curPage + 1, pageSize: PAGE_SIZE, total: totalCount, onChange: page => setCurPage(page - 1), hideOnSinglePage: true }} />
            
            {removeCommentInfo != null && (
                <Modal open title="删除评论"
                    okText="删除" okButtonProps={{ danger: true }}
                    onCancel={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        setRemoveCommentInfo(null);
                    }}
                    onOk={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        removeComment();
                    }}>
                    是否删除评论？
                </Modal>
            )}
        </Card>
    );
};

export default observer(AppStoreDetail);