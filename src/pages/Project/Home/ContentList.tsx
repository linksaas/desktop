//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import React, { useEffect, useState } from "react";
import s from "./ContentList.module.less";
import { observer } from 'mobx-react';
import { Breadcrumb, Button, Card, Divider, Dropdown, Form, Input, List, Select, Space, Switch, Tabs } from "antd";
import { useHistory } from "react-router-dom";
import { useStores } from "@/hooks";
import type { ListParam, EntryInfo, EntryOrFolderInfo, FolderPathItem, FolderInfo } from "@/api/project_entry";
import {
    list as list_entry, list_sys as list_sys_entry, list_sub_entry, list_sub_folder, get_folder_path,
    ENTRY_TYPE_SPRIT, ENTRY_TYPE_DOC, ENTRY_TYPE_NULL, ENTRY_TYPE_PAGES, ENTRY_TYPE_BOARD, ENTRY_TYPE_FILE,
    ENTRY_TYPE_API_COLL,
    ENTRY_TYPE_DATA_ANNO,
    ENTRY_TYPE_MY_WORK,
    get_folder
} from "@/api/project_entry";
import { request } from "@/utils/request";
import { CreditCardFilled, FilterTwoTone, FolderAddOutlined, HomeFilled } from "@ant-design/icons";
import EntryCard from "./EntryCard";
import CreateFolderModal from "./components/CreateFolderModal";
import FolderCard from "./FolderCard";
import { listen } from '@tauri-apps/api/event';
import type * as NoticeType from '@/api/notice_type';

const PAGE_SIZE = 24;

const ProjectHome = () => {
    const history = useHistory();

    const userStore = useStores("userStore");
    const projectStore = useStores("projectStore");
    const entryStore = useStores("entryStore");
    const linkAuxStore = useStores("linkAuxStore");
    const ideaStore = useStores("ideaStore");

    const [dataVersion, setDataVersion] = useState(0); //防止两次加载


    const [pathItemList, setPathItemList] = useState([] as FolderPathItem[]);
    const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);


    const loadFolderList = async () => {
        const tmpList = entryStore.entryOrFolderList.filter(item => item.is_folder == false);
        const res = await request(list_sub_folder({
            session_id: userStore.sessionId,
            project_id: projectStore.curProjectId,
            parent_folder_id: entryStore.curFolderId,
        }));
        const folderList: EntryOrFolderInfo[] = res.folder_list.map(item => ({
            id: item.folder_id,
            is_folder: true,
            value: item,
        }));
        if (entryStore.curFolderId != "") {
            const curFolderRes = await request(get_folder({
                session_id: userStore.sessionId,
                project_id: projectStore.curProjectId,
                folder_id: entryStore.curFolderId,
            }));
            console.log(curFolderRes);
            folderList.unshift({
                id: curFolderRes.folder.parent_folder_id,
                is_folder: true,
                value: {
                    folder_id: curFolderRes.folder.parent_folder_id,
                    folder_title: "上级目录",
                    parent_folder_id: "",
                    sub_entry_count: -1,
                    sub_folder_count: -1,
                    create_user_id: "",
                    create_display_name: "",
                    create_logo_uri: "",
                    create_time: 0,
                    update_user_id: "",
                    update_display_name: "",
                    update_logo_uri: "",
                    update_time: 0,
                    can_update: false,
                    can_remove: false,
                },
            });
        }
        entryStore.entryOrFolderList = [...folderList, ...tmpList];
    };

    const loadEntryList = async () => {
        if (projectStore.curProjectId == "") {
            entryStore.entryOrFolderList = [];
            return;
        }
        const tmpList = [] as EntryOrFolderInfo[];

        if (projectStore.projectHome.contentActiveKey == "folder") {
            //获取当前路径
            if (entryStore.curFolderId == "") {
                setPathItemList([]);
            } else {
                const res = await request(get_folder_path({
                    session_id: userStore.sessionId,
                    project_id: projectStore.curProjectId,
                    folder_id: entryStore.curFolderId,
                }));
                setPathItemList(res.path_list);
            }
            const entryRes = await request(list_sub_entry({
                session_id: userStore.sessionId,
                project_id: projectStore.curProjectId,
                parent_folder_id: entryStore.curFolderId,
            }));
            for (const item of entryRes.entry_list) {
                tmpList.push({
                    id: item.entry_id,
                    is_folder: false,
                    value: item,
                })
            }
            entryStore.entryOrFolderList = tmpList;
            await loadFolderList();
            projectStore.projectHome.contentTotalCount = 0;
        } else {
            let listParam: ListParam | null = null;
            if (projectStore.projectHome.contentActiveKey == "list") {
                listParam = {
                    filter_by_watch: projectStore.projectHome.contentFilterByWatch,
                    filter_by_tag_id: projectStore.projectHome.contentTagIdList.length > 0,
                    tag_id_list: projectStore.projectHome.contentTagIdList,
                    filter_by_keyword: projectStore.projectHome.contentKeyword.length > 0,
                    keyword: projectStore.projectHome.contentKeyword,
                    filter_by_entry_type: projectStore.projectHome.contentEntryType != ENTRY_TYPE_NULL,
                    entry_type_list: projectStore.projectHome.contentEntryType == ENTRY_TYPE_NULL ? [] : [projectStore.projectHome.contentEntryType],
                };
            }
            if (listParam == null) {
                return;
            }
            if (projectStore.curProjectId == "") {
                projectStore.projectHome.contentTotalCount = 0;
                entryStore.entryOrFolderList = [];
                return;
            }

            const res = await request(list_entry({
                session_id: userStore.sessionId,
                project_id: projectStore.curProjectId,
                list_param: listParam,
                offset: PAGE_SIZE * projectStore.projectHome.contentCurPage,
                limit: PAGE_SIZE,
            }));
            projectStore.projectHome.contentTotalCount = res.total_count;
            for (const item of res.entry_list) {
                tmpList.push({
                    id: item.entry_id,
                    is_folder: false,
                    value: item,
                })
            }
            entryStore.entryOrFolderList = tmpList;
        }
    };

    const loadSysEntryList = async () => {
        if (projectStore.curProjectId == "") {
            entryStore.sysEntryList = [];
            return;
        }
        const res = await request(list_sys_entry({
            session_id: userStore.sessionId,
            project_id: projectStore.curProjectId,
        }));
        entryStore.sysEntryList = [
            {
                entry_id: "",
                entry_type: ENTRY_TYPE_MY_WORK,
                entry_title: "",
                my_watch: false,
                watch_user_list: [],
                tag_list: [],
                entry_perm: {
                    update_for_all: false,
                    extra_update_user_id_list: [],
                },
                mark_sys: true,
                parent_folder_id: "",
                create_user_id: "",
                create_display_name: "",
                create_logo_uri: "",
                create_time: 0,
                update_user_id: "",
                update_display_name: "",
                update_logo_uri: "",
                update_time: 0,
                can_update: false,
                can_remove: false,
                extra_info: {},
            },
            ...res.entry_list,
        ];
    };

    const calcFolderInfoWidth = () => {
        let subWidth = 400;
        if (projectStore.showChatAndComment) {
            subWidth += 400;
        }
        return `calc(100vw - ${subWidth}px)`;
    };

    const entryOrFolderList = (
        <List rowKey="id" dataSource={entryStore.entryOrFolderList} grid={{ gutter: 16 }}
            renderItem={item => (
                <List.Item key={item.id}>
                    {item.is_folder == false && (
                        <EntryCard entryInfo={item.value as EntryInfo}
                            onMove={() => loadEntryList()}
                            onMarkSys={() => {
                                loadSysEntryList();
                                loadEntryList();
                            }} canMove={projectStore.projectHome.contentActiveKey == "folder" && projectStore.isAdmin} />
                    )}
                    {item.is_folder == true && (
                        <FolderCard folderInfo={item.value as FolderInfo} onRemove={() => loadFolderList()} canMove={projectStore.projectHome.contentActiveKey == "folder" && projectStore.isAdmin}
                            onMove={() => loadFolderList()} />
                    )}
                </List.Item>
            )} pagination={projectStore.projectHome.contentActiveKey == "folder" ? false : { total: projectStore.projectHome.contentTotalCount, current: projectStore.projectHome.contentCurPage + 1, pageSize: PAGE_SIZE, onChange: page => projectStore.projectHome.contentCurPage = page - 1, hideOnSinglePage: true }} />
    );

    const resetParamAndIncVersion = () => {
        if (projectStore.projectHome.contentCurPage != 0) {
            projectStore.projectHome.contentCurPage = 0;
        }
        if (projectStore.projectHome.contentKeyword != "") {
            projectStore.projectHome.contentKeyword = "";
        }
        if (projectStore.projectHome.contentTagIdList.length != 0) {
            projectStore.projectHome.contentTagIdList = [];
        }
        setDataVersion(oldValue => oldValue + 1);
    };

    useEffect(() => {
        resetParamAndIncVersion();
    }, [projectStore.curProjectId, entryStore.curFolderId, projectStore.projectHome.contentActiveKey]);

    useEffect(() => {
        loadEntryList();
    }, [projectStore.projectHome.contentCurPage, dataVersion, projectStore.projectHome.contentKeyword, projectStore.projectHome.contentTagIdList, projectStore.projectHome.contentEntryType, projectStore.projectHome.contentFilterByWatch]);

    useEffect(() => {
        loadSysEntryList();
    }, [projectStore.curProjectId]);

    useEffect(() => {
        const unListenFn = listen<NoticeType.AllNotice>("notice", ev => {
            const notice = ev.payload;
            if (notice.EntryNotice?.NewEntryNotice !== undefined && notice.EntryNotice.NewEntryNotice.project_id == projectStore.curProjectId && notice.EntryNotice.NewEntryNotice.create_user_id == userStore.userInfo.userId) {
                resetParamAndIncVersion();
            } else if (notice.EntryNotice?.NewFolderNotice !== undefined && notice.EntryNotice.NewFolderNotice.project_id !== projectStore.curProjectId && notice.EntryNotice.NewFolderNotice.create_user_id == userStore.userInfo.userId) {
                resetParamAndIncVersion();
            }
        });
        return () => {
            unListenFn.then((unListen) => unListen());
        };
    }, []);


    return (
        <div className={s.home_wrap}>
            <h1 className={s.header}><CreditCardFilled />&nbsp;&nbsp;系统面板</h1>
            <List rowKey="entry_id"
                grid={{ gutter: 16 }}
                dataSource={entryStore.sysEntryList}
                renderItem={item => (
                    <List.Item>
                        <EntryCard entryInfo={item} onMove={() => loadEntryList()}
                            onMarkSys={() => {
                                loadSysEntryList();
                                loadEntryList();
                            }} canMove={false} />
                    </List.Item>
                )} />
            <Divider style={{ margin: "4px 0px" }} />
            <Card title={<h1 className={s.header}><CreditCardFilled />&nbsp;&nbsp;内容面板</h1>}
                headStyle={{ paddingLeft: "0px" }} bodyStyle={{ padding: "4px 0px" }}
                bordered={false} extra={
                    <Space size="small">
                        {projectStore.projectHome.contentActiveKey == "folder" && (
                            <Button type="default" style={{ marginRight: "14px" }} icon={<FolderAddOutlined />} onClick={e => {
                                e.stopPropagation();
                                e.preventDefault();
                                setShowCreateFolderModal(true);
                            }}>创建目录</Button>
                        )}
                        <Dropdown.Button type="primary" onClick={e => {
                            e.stopPropagation();
                            e.preventDefault();
                            if (projectStore.isAdmin) {
                                entryStore.createEntryType = ENTRY_TYPE_SPRIT;
                            } else {
                                entryStore.createEntryType = ENTRY_TYPE_DOC;
                            }
                        }} menu={{
                            items: [
                                {
                                    key: "requirement",
                                    label: "创建需求",
                                    onClick: () => {
                                        projectStore.projectModal.createRequirement = true;
                                    },
                                },
                                {
                                    key: "task",
                                    label: "创建任务",
                                    onClick: () => {
                                        linkAuxStore.goToCreateTask("", projectStore.curProjectId, history);
                                    },
                                },
                                {
                                    key: "bug",
                                    label: "创建缺陷",
                                    onClick: () => {
                                        linkAuxStore.goToCreateBug("", projectStore.curProjectId, history);
                                    },
                                },
                                {
                                    key: "idea",
                                    label: "创建知识点",
                                    onClick: () => {
                                        ideaStore.setShowCreateIdea("", "");
                                    },
                                }
                            ],
                        }}>创建内容</Dropdown.Button>
                    </Space>
                }>
                <Tabs activeKey={projectStore.projectHome.contentActiveKey} onChange={value => {
                    entryStore.curFolderId = "";
                    if (["folder", "list"].includes(value)) {
                        projectStore.projectHome.contentActiveKey = (value as "list" | "folder");
                    }
                }}
                    animated tabBarStyle={{ height: "40px" }}
                    items={[
                        {
                            key: "folder",
                            label: <span style={{ fontSize: "16px" }}>目录</span>,
                            children: (
                                <>
                                    {projectStore.projectHome.contentActiveKey == "folder" && (<>{entryOrFolderList}</>)}
                                </>
                            ),
                        },
                        {
                            key: "list",
                            label: <span style={{ fontSize: "16px" }}>列表</span>,
                            children: (
                                <>
                                    {projectStore.projectHome.contentActiveKey == "list" && (<>{entryOrFolderList}</>)}
                                </>
                            ),
                        },
                    ]} type="card" tabBarExtraContent={
                        <>
                            {projectStore.projectHome.contentActiveKey != "folder" && (
                                <Form layout="inline">
                                    <FilterTwoTone style={{ fontSize: "24px", marginRight: "10px" }} />
                                    <Form.Item>
                                        <Input style={{ width: "140px" }} value={projectStore.projectHome.contentKeyword} onChange={e => {
                                            e.stopPropagation();
                                            e.preventDefault();
                                            projectStore.projectHome.contentKeyword = e.target.value.trim();
                                        }} allowClear placeholder="请输入标题关键词" />
                                    </Form.Item>
                                    {(projectStore.curProject?.tag_list ?? []).filter(item => item.use_in_entry).length > 0 && (
                                        <Form.Item>
                                            <Select mode="multiple" style={{ minWidth: "100px" }}
                                                allowClear value={projectStore.projectHome.contentTagIdList} onChange={value => projectStore.projectHome.contentTagIdList = value}
                                                placeholder="请选择标签">
                                                {(projectStore.curProject?.tag_list ?? []).filter(item => item.use_in_entry).map(item => (
                                                    <Select.Option key={item.tag_id} value={item.tag_id}>
                                                        <div style={{ backgroundColor: item.bg_color, padding: "0px 4px" }}>{item.tag_name}</div></Select.Option>
                                                ))}
                                            </Select>
                                        </Form.Item>
                                    )}
                                    <Form.Item className={s.seg_wrap} label="内容类型">
                                        <Select value={projectStore.projectHome.contentEntryType} onChange={value => projectStore.projectHome.contentEntryType = value} style={{ width: "100px" }}>
                                            <Select.Option value={ENTRY_TYPE_NULL}>全部</Select.Option>
                                            <Select.Option value={ENTRY_TYPE_SPRIT}>工作计划</Select.Option>
                                            <Select.Option value={ENTRY_TYPE_DOC}>文档</Select.Option>
                                            <Select.Option value={ENTRY_TYPE_PAGES}>静态网页</Select.Option>
                                            <Select.Option value={ENTRY_TYPE_BOARD}>信息面板</Select.Option>
                                            <Select.Option value={ENTRY_TYPE_FILE}>文件</Select.Option>
                                            <Select.Option value={ENTRY_TYPE_API_COLL}>接口集合</Select.Option>
                                            <Select.Option value={ENTRY_TYPE_DATA_ANNO}>数据标注</Select.Option>
                                        </Select>
                                    </Form.Item>
                                    <Form.Item label="我的关注">
                                        <Switch checked={projectStore.projectHome.contentFilterByWatch} onChange={value => projectStore.projectHome.contentFilterByWatch = value} />
                                    </Form.Item>
                                </Form>
                            )}
                            {projectStore.projectHome.contentActiveKey == "folder" && (
                                <div style={{ width: calcFolderInfoWidth(), overflow: "hidden", height: "30px" }}>
                                    <Breadcrumb>
                                        <Breadcrumb.Item>
                                            <Button type="link" disabled={entryStore.curFolderId == ""}
                                                style={{ minWidth: 0, padding: "0px 0px", fontSize: "14px" }}
                                                onClick={e => {
                                                    e.stopPropagation();
                                                    e.preventDefault();
                                                    entryStore.curFolderId = "";
                                                }}>
                                                <Space size="small">
                                                    <HomeFilled />
                                                    根目录
                                                </Space>
                                            </Button>
                                        </Breadcrumb.Item>
                                        {pathItemList.map(item => (
                                            <Breadcrumb.Item key={item.folder_id}>
                                                <Button type="link" disabled={item.folder_id == entryStore.curFolderId}
                                                    style={{ minWidth: 0, padding: "0px 0px", fontSize: "14px" }}
                                                    onClick={e => {
                                                        e.stopPropagation();
                                                        e.preventDefault();
                                                        entryStore.curFolderId = item.folder_id;
                                                    }}>{item.folder_title}</Button>
                                            </Breadcrumb.Item>
                                        ))}
                                    </Breadcrumb>
                                </div>
                            )}
                        </>
                    } />
            </Card>
            {showCreateFolderModal == true && (
                <CreateFolderModal onCancel={() => setShowCreateFolderModal(false)} onOk={() => {
                    loadFolderList();
                    setShowCreateFolderModal(false);
                }} />
            )}
        </div >
    );
};

export default observer(ProjectHome);