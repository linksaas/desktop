//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import React, { useEffect, useState } from "react";
import { observer, useLocalObservable } from 'mobx-react';
import s from './IssueList.module.less';
import CardWrap from '@/components/CardWrap';
import { getIssueText, getIssue_type, getIsTask } from '@/utils/utils';
import Button from '@/components/Button';
import { useHistory, useLocation } from "react-router-dom";
import { useStores } from "@/hooks";
import Tabs from './components/Tabs';
import addIcon from '@/assets/image/addIcon.png';
import { ISSUE_TAB_LIST_TYPE, type LinkIssueListState } from '@/stores/linkAux';
import IssueEditList from "./components/IssueEditList";
import { ASSGIN_USER_ALL, ASSGIN_USER_CHECK, ASSGIN_USER_EXEC, SORT_KEY_UPDATE_TIME, SORT_TYPE_DSC, list as list_issue, ISSUE_STATE_PROCESS_OR_CHECK, ISSUE_STATE_PROCESS, ISSUE_STATE_CHECK, ISSUE_TYPE_TASK, ISSUE_TYPE_BUG } from "@/api/project_issue";
import type { IssueInfo, ListRequest, ListParam } from "@/api/project_issue";
import { request } from '@/utils/request';
import StageModel from "./components/StageModel";
import Pagination from "@/components/Pagination";
import BatchCreate from "./components/BatchCreate";
import { Popover, Space } from "antd";
import { PROJECT_SETTING_TAB } from "@/utils/constant";
import { MoreOutlined } from "@ant-design/icons";
import Filtration from "./components/Filtration";
import { LocalIssueStore } from "@/stores/local";
import { listen } from '@tauri-apps/api/event';
import type * as NoticeType from '@/api/notice_type';

const tabList = [
    {
        name: "全部",
        value: ISSUE_TAB_LIST_TYPE.ISSUE_TAB_LIST_ALL
    },
    {
        name: "指派给我",
        value: ISSUE_TAB_LIST_TYPE.ISSUE_TAB_LIST_ASSGIN_ME,
    },
    {
        name: "由我创建",
        value: ISSUE_TAB_LIST_TYPE.ISSUE_TAB_LIST_MY_CREATE,
    },
    {
        name: "我的关注",
        value: ISSUE_TAB_LIST_TYPE.ISSUE_TAB_LIST_MY_WATCH,
    },
]

const PAGE_SIZE = 10;

const IssueList = () => {
    const location = useLocation();
    const history = useHistory();

    const userStore = useStores('userStore');
    const projectStore = useStores('projectStore');
    const linkAuxStore = useStores('linkAuxStore');

    const filterState: LinkIssueListState = location.state as LinkIssueListState ?? {
        priorityList: [],
        softwareVersionList: [],
        levelList: [],
        tagId: "",
        stateList: [],
        execUserIdList: [],
        checkUserIdList: [],
        tabType: ISSUE_TAB_LIST_TYPE.ISSUE_TAB_LIST_ALL,
        curPage: 0,
    };

    const issueStore = useLocalObservable(() => new LocalIssueStore(userStore.sessionId, projectStore.curProjectId, ""));

    const [isFilter, setIsFilter] = useState(true);

    const [totalCount, setTotalCount] = useState(0);
    const [stageIssue, setStageIssue] = useState<IssueInfo | undefined>(undefined);
    const [showBatchModal, setShowBatchModal] = useState(false);

    const [lastState, setLastState] = useState<LinkIssueListState | null>(null);



    const showStage = (issueId: string) => {
        const issue = issueStore.itemList.find(item => item.issue_id == issueId);
        if (issue !== undefined) {
            setStageIssue(issue);
        }
    };

    const loadIssueList = async () => {
        issueStore.itemList = [];

        setLastState(filterState);
        let newFilterState = filterState.stateList.slice();
        if (newFilterState !== undefined && newFilterState.length > 0 && newFilterState.includes(ISSUE_STATE_PROCESS_OR_CHECK)) {
            newFilterState = [ISSUE_STATE_PROCESS, ISSUE_STATE_CHECK];
        }
        if (newFilterState == undefined) {
            newFilterState = [];
        }
        const listParam: ListParam = {
            filter_by_issue_type: true,
            issue_type: getIssue_type(location.pathname),
            filter_by_state: newFilterState.length > 0,
            state_list: newFilterState, //阶段
            filter_by_create_user_id: filterState.tabType === ISSUE_TAB_LIST_TYPE.ISSUE_TAB_LIST_MY_CREATE,
            create_user_id_list: [userStore.userInfo.userId],
            filter_by_assgin_user_id: filterState.execUserIdList.length > 0 || filterState.checkUserIdList.length > 0,
            assgin_user_id_list: [...filterState.execUserIdList, ...filterState.checkUserIdList],
            assgin_user_type:
                filterState.tabType === ISSUE_TAB_LIST_TYPE.ISSUE_TAB_LIST_ASSGIN_ME ||
                    (filterState.execUserIdList.length > 0 && filterState.checkUserIdList.length > 0)
                    ? ASSGIN_USER_ALL
                    : filterState.execUserIdList.length > 0
                        ? ASSGIN_USER_EXEC
                        : filterState.checkUserIdList.length > 0
                            ? ASSGIN_USER_CHECK
                            : ASSGIN_USER_ALL,
            filter_by_sprit_id: false,
            sprit_id_list: [],
            filter_by_create_time: false,
            from_create_time: 0,
            to_create_time: 0,
            filter_by_update_time: false,
            from_update_time: 0,
            to_update_time: 0,
            filter_by_task_priority: getIsTask(location.pathname) && (filterState.priorityList?.length ?? 0) > 0,
            task_priority_list: getIsTask(location.pathname) ? (filterState.priorityList ?? []) : [], // 优先级
            filter_by_software_version:
                !getIsTask(location.pathname) && (filterState.softwareVersionList ?? []).length > 0,
            software_version_list: !getIsTask(location.pathname) ? (filterState.softwareVersionList ?? []) : [],
            filter_by_bug_level: !getIsTask(location.pathname) && (filterState.levelList ?? []).length > 0,
            bug_level_list: !getIsTask(location.pathname) ? (filterState.levelList ?? []) : [],
            filter_by_bug_priority: !getIsTask(location.pathname) && (filterState.priorityList?.length ?? 0) > 0,
            bug_priority_list: !getIsTask(location.pathname) ? (filterState.priorityList ?? []) : [], // 优先级,
            filter_by_title_keyword: false,
            title_keyword: "",
            filter_by_tag_id_list: (filterState.tagId ?? "") != "",
            tag_id_list: (filterState.tagId ?? "") == "" ? [] : [filterState.tagId!],
            filter_by_watch: filterState.tabType == ISSUE_TAB_LIST_TYPE.ISSUE_TAB_LIST_MY_WATCH,
        };
        const req: ListRequest = {
            session_id: userStore.sessionId,
            project_id: projectStore.curProjectId,
            sort_type: SORT_TYPE_DSC, // SORT_TYPE_DSC SORT_TYPE_ASC
            sort_key: SORT_KEY_UPDATE_TIME,
            offset: (filterState.curPage ?? 0) * PAGE_SIZE,
            limit: PAGE_SIZE,
            list_param: listParam,
        };
        const res = await request(list_issue(req));
        if (res) {
            issueStore.itemList = res.info_list;
            setTotalCount(res.total_count);
        }
    };


    const isSameArray = (a: unknown[], b: unknown[]): boolean => {
        if (a.length != b.length) {
            return false;
        }
        for (const av of a) {
            if (!b.includes(av)) {
                return false;
            }
        }
        return true;
    };

    const getTagDefList = () => {
        if (projectStore.curProject == undefined) {
            return [];
        }
        return projectStore.curProject.tag_list.filter(item => {
            if (getIsTask(location.pathname)) {
                return item.use_in_task;
            } else {
                return item.use_in_bug;
            }
        });
    };

    useEffect(() => {
        let hasChange = false;
        if (lastState == null) {
            hasChange = true;
        } else {
            if (!isSameArray(lastState.stateList, filterState.stateList)) {
                hasChange = true;
            } else if (!isSameArray(lastState.execUserIdList, filterState.execUserIdList)) {
                hasChange = true;
            } else if (!isSameArray(lastState.checkUserIdList, filterState.checkUserIdList)) {
                hasChange = true;
            } else if (!isSameArray(lastState.priorityList ?? [], filterState.priorityList ?? [])) {
                hasChange = true;
            } else if (!isSameArray(lastState.softwareVersionList ?? [], filterState.softwareVersionList ?? [])) {
                hasChange = true;
            } else if (!isSameArray(lastState.levelList ?? [], filterState.levelList ?? [])) {
                hasChange = true;
            } else if (lastState.tabType != filterState.tabType) {
                hasChange = true;
            } else if (lastState.tagId != filterState.tagId) {
                hasChange = true;
            } else if (lastState.curPage != filterState.curPage) {
                hasChange = true;
            }
        }
        if (hasChange) {
            loadIssueList();
        }
    }, [projectStore.curProjectId, filterState.stateList, filterState.execUserIdList,
    filterState.checkUserIdList, filterState.tabType, filterState.priorityList,
    filterState.softwareVersionList, filterState.levelList, filterState.tagId, filterState.curPage
    ]);

    useEffect(() => {
        const unListenFn = listen<NoticeType.AllNotice>("notice", ev => {
            if (ev.payload.IssueNotice?.NewIssueNotice != undefined && ev.payload.IssueNotice.NewIssueNotice.project_id == projectStore.curProjectId && ev.payload.IssueNotice.NewIssueNotice.create_user_id == userStore.userInfo.userId) {
                if (getIsTask(location.pathname)) {
                    linkAuxStore.goToTaskList(undefined, history);
                } else {
                    linkAuxStore.goToBugList(undefined, history);
                }
            }
        });

        return () => {
            unListenFn.then((unListen) => unListen());
        };
    }, []);

    useEffect(() => {
        return () => {
            issueStore.unlisten();
        };
    }, []);

    return (
        <CardWrap title={`${getIssueText(location.pathname)}列表`} extra={
            <Space size="middle">
                <Button
                    className={s.btn}
                    type="primary"
                    onClick={() => {
                        if (getIsTask(location.pathname)) {
                            projectStore.projectModal.setCreateIssue(true, ISSUE_TYPE_TASK, "");
                        } else {
                            projectStore.projectModal.setCreateIssue(true, ISSUE_TYPE_BUG, "");
                        }
                    }}
                    disabled={projectStore.curProject?.closed}
                >
                    <img src={addIcon} alt="" />
                    创建{getIssueText(location.pathname)}
                </Button>
                <Popover placement="bottom" trigger="click" content={
                    <div style={{ padding: "10px 10px" }}>
                        <Space direction="vertical">
                            {getIsTask(location.pathname) == true && (
                                <Button type="link" onClick={e => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    setShowBatchModal(true);
                                }}>批量创建</Button>
                            )}
                            <Button type="link" disabled={!projectStore.isAdmin} onClick={e => {
                                e.stopPropagation();
                                e.preventDefault();
                                projectStore.showProjectSetting = PROJECT_SETTING_TAB.PROJECT_SETTING_TAGLIST;
                            }}>管理标签</Button>
                        </Space>
                    </div>
                }>
                    <MoreOutlined className={s.more} />
                </Popover>
            </Space>}>
            <div className={s.task_wrap}>
                <div style={{ marginRight: '20px' }}>
                    <Tabs
                        activeVal={filterState.tabType ?? ISSUE_TAB_LIST_TYPE.ISSUE_TAB_LIST_ALL}
                        list={tabList}
                        onChang={value => {
                            if (value == ISSUE_TAB_LIST_TYPE.ISSUE_TAB_LIST_ASSGIN_ME) {
                                if (getIsTask(location.pathname)) {
                                    linkAuxStore.goToTaskList({
                                        stateList: [ISSUE_STATE_PROCESS_OR_CHECK],
                                        execUserIdList: [userStore.userInfo.userId],
                                        checkUserIdList: [userStore.userInfo.userId],
                                        tabType: ISSUE_TAB_LIST_TYPE.ISSUE_TAB_LIST_ASSGIN_ME,
                                        curPage: 0,
                                    }, history);
                                } else {
                                    linkAuxStore.goToBugList({
                                        stateList: [ISSUE_STATE_PROCESS_OR_CHECK],
                                        execUserIdList: [userStore.userInfo.userId],
                                        checkUserIdList: [userStore.userInfo.userId],
                                        tabType: ISSUE_TAB_LIST_TYPE.ISSUE_TAB_LIST_ASSGIN_ME,
                                        curPage: 0,
                                    }, history);
                                }
                            } else {
                                if (getIsTask(location.pathname)) {
                                    linkAuxStore.goToTaskList({
                                        stateList: [],
                                        execUserIdList: [],
                                        checkUserIdList: [],
                                        tabType: value,
                                        curPage: 0,
                                    }, history);
                                } else {
                                    linkAuxStore.goToBugList({
                                        stateList: [],
                                        execUserIdList: [],
                                        checkUserIdList: [],
                                        tabType: value,
                                        curPage: 0,
                                    }, history);
                                }
                            }
                        }}
                        isFilter={isFilter}
                        setIsFilter={setIsFilter}
                    />
                    {isFilter && <Filtration tagDefList={getTagDefList()} />}
                </div>
                <IssueEditList isFilter={isFilter}
                    showStage={issueId => showStage(issueId)}
                    tagDefList={getTagDefList()} issueStore={issueStore} />
                <Pagination
                    total={totalCount}
                    pageSize={PAGE_SIZE}
                    current={(filterState.curPage ?? 0) + 1}
                    onChange={(page: number) => {
                        if (getIsTask(location.pathname)) {
                            linkAuxStore.goToTaskList({ ...filterState, curPage: page - 1 }, history);
                        } else {
                            linkAuxStore.goToBugList({ ...filterState, curPage: page - 1 }, history);
                        }
                    }}
                />
            </div>

            {stageIssue !== undefined && <StageModel
                issue={stageIssue}
                onClose={() => setStageIssue(undefined)}
            />}
            {showBatchModal == true && <BatchCreate
                onCancel={() => setShowBatchModal(false)}
                onOk={() => {
                    setShowBatchModal(false);
                    if (getIsTask(location.pathname)) {
                        linkAuxStore.goToTaskList({
                            stateList: [],
                            execUserIdList: [],
                            checkUserIdList: [],
                            tabType: ISSUE_TAB_LIST_TYPE.ISSUE_TAB_LIST_ALL,
                            priorityList: [],
                            softwareVersionList: [],
                            levelList: [],
                            tagId: "",
                        }, history);
                    } else {
                        linkAuxStore.goToTaskList({
                            stateList: [],
                            execUserIdList: [],
                            checkUserIdList: [],
                            tabType: ISSUE_TAB_LIST_TYPE.ISSUE_TAB_LIST_ALL,
                            priorityList: [],
                            softwareVersionList: [],
                            levelList: [],
                            tagId: "",
                        }, history);
                    }
                }}
            />}
        </CardWrap >
    );
};

export default observer(IssueList);