//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import React, { useEffect, useState } from "react";
import { observer } from 'mobx-react';
import { Table } from "antd";
import {
    type UnReadInfo, list_un_read,
    COMMENT_TARGET_ENTRY, COMMENT_TARGET_REQUIRE_MENT, COMMENT_TARGET_TASK, COMMENT_TARGET_BUG,
    COMMENT_TARGET_TEST_CASE
} from "@/api/project_comment";
import { useStores } from "@/hooks";
import { request } from "@/utils/request";
import type { ColumnsType } from 'antd/lib/table';
import CommentModal from "@/components/CommentEntry/CommentModal";
import { LinkBugInfo, LinkEntryInfo, LinkRequirementInfo, LinkTaskInfo, LinkTestCaseInfo } from "@/stores/linkAux";
import { useHistory } from "react-router-dom";

const PAGE_SIZE = 10;

const UnreadCommentList = () => {
    const history = useHistory();

    const userStore = useStores('userStore');
    const projectStore = useStores('projectStore');
    const linkAuxStore = useStores("linkAuxStore");

    const [unReadInfoList, setUnReadInfoList] = useState<UnReadInfo[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [curPage, setCurPage] = useState(0);

    const [showUnReadInfo, setShowUnReadInfo] = useState<UnReadInfo | null>(null);

    const loadUnReadInfoList = async () => {
        const res = await request(list_un_read({
            session_id: userStore.sessionId,
            project_id: projectStore.curProjectId,
            offset: PAGE_SIZE * curPage,
            limit: PAGE_SIZE,
        }));
        setTotalCount(res.total_count);
        setUnReadInfoList(res.un_read_info_list);
    };

    const columns: ColumnsType<UnReadInfo> = [
        {
            title: "类型",
            width: 80,
            render: (_, row: UnReadInfo) => (
                <span>
                    {row.target_type == COMMENT_TARGET_ENTRY && "内容"}
                    {row.target_type == COMMENT_TARGET_REQUIRE_MENT && "需求"}
                    {row.target_type == COMMENT_TARGET_TASK && "任务"}
                    {row.target_type == COMMENT_TARGET_BUG && "缺陷"}
                    {row.target_type == COMMENT_TARGET_TEST_CASE && "测试用例"}
                </span>
            ),
        },
        {
            title: "标题",
            render: (_, row: UnReadInfo) => (
                <a style={{ textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }} title={row.title}
                    onClick={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        if (row.target_type == COMMENT_TARGET_ENTRY) {
                            linkAuxStore.goToLink(new LinkEntryInfo("", projectStore.curProjectId, row.target_id), history).then(() => setShowUnReadInfo(row));
                        } else if (row.target_type == COMMENT_TARGET_REQUIRE_MENT) {
                            linkAuxStore.goToLink(new LinkRequirementInfo("", projectStore.curProjectId, row.target_id, "comment"), history);
                        } else if (row.target_type == COMMENT_TARGET_TASK) {
                            linkAuxStore.goToLink(new LinkTaskInfo("", projectStore.curProjectId, row.target_id), history).then(() => setShowUnReadInfo(row));
                        } else if (row.target_type == COMMENT_TARGET_BUG) {
                            linkAuxStore.goToLink(new LinkBugInfo("", projectStore.curProjectId, row.target_id), history).then(() => setShowUnReadInfo(row));
                        } else if (row.target_type == COMMENT_TARGET_TEST_CASE) {
                            linkAuxStore.goToLink(new LinkTestCaseInfo("", projectStore.curProjectId, row.target_id, "", "comment"), history);
                        }
                    }}>{row.title}</a>
            ),
        },
    ];

    useEffect(() => {
        if (curPage != 0) {
            setCurPage(0);
        } else {
            loadUnReadInfoList();
        }
    }, [projectStore.curProjectId, projectStore.curProject?.project_status.unread_comment_count]);

    useEffect(() => {
        loadUnReadInfoList();
    }, [curPage]);

    return (
        <div>
            <Table rowKey="target_id" dataSource={unReadInfoList} columns={columns}
                pagination={{ total: totalCount, current: curPage + 1, pageSize: PAGE_SIZE, onChange: page => setCurPage(page - 1), hideOnSinglePage: true }} />
            {showUnReadInfo != null && (
                <CommentModal
                    projectId={projectStore.curProjectId}
                    targetType={showUnReadInfo.target_type}
                    targetId={showUnReadInfo.target_id}
                    myUserId={userStore.userInfo.userId}
                    myAdmin={projectStore.isAdmin}
                    onCancel={() => setShowUnReadInfo(null)}
                />
            )}
        </div>
    );
};

export default observer(UnreadCommentList);