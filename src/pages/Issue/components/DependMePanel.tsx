//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import React, { useState, useEffect } from "react";
import { observer } from 'mobx-react';
import { Table } from 'antd';
import { request } from '@/utils/request';
import type { IssueInfo } from '@/api/project_issue';
import { ISSUE_TYPE_BUG, ISSUE_TYPE_TASK, list_depend_me } from '@/api/project_issue';
import type { ColumnsType } from 'antd/lib/table';
import { useStores } from "@/hooks";
import { get_issue_type_str } from '@/api/event_type';
import { renderState, renderTitle } from "./dependComon";
import { LinkBugInfo, LinkTaskInfo } from "@/stores/linkAux";
import { useHistory } from "react-router-dom";
import { listen } from '@tauri-apps/api/event';
import type * as NoticeType from '@/api/notice_type';


interface DependMePanelProps {
    issueId: string;
    inModal: boolean;
}

export const DependMePanel: React.FC<DependMePanelProps> = observer((props) => {
    const history = useHistory();

    const userStore = useStores('userStore');
    const projectStore = useStores('projectStore');
    const linkAuxStore = useStores('linkAuxStore');

    const [issueList, setIssueList] = useState<IssueInfo[]>([]);


    const loadIssue = async () => {
        const res = await request(list_depend_me({
            session_id: userStore.sessionId,
            project_id: projectStore.curProjectId,
            issue_id: props.issueId,
        }));
        if (res) {
            setIssueList(res.issue_list);
        }
    };

    const issueColums: ColumnsType<IssueInfo> = [
        {
            title: 'ID',
            dataIndex: 'issue_index',
            ellipsis: true,
            width: 60,
        },
        {
            title: '类别',
            dataIndex: 'issue_type',
            width: 60,
            render: (v: number) => {
                return get_issue_type_str(v);
            },
        },
        {
            title: '名称',
            ellipsis: true,
            dataIndex: ['basic_info', 'title'],
            width: 150,
            render: (_, row: IssueInfo) => renderTitle(row, props.inModal, () => {
                if (row.issue_type == ISSUE_TYPE_TASK) {
                    linkAuxStore.goToLink(new LinkTaskInfo("", row.project_id, row.issue_id), history);
                } else if (row.issue_type == ISSUE_TYPE_BUG) {
                    linkAuxStore.goToLink(new LinkBugInfo("", row.project_id, row.issue_id), history);
                }
            }),
        },
        {
            title: '阶段',
            dataIndex: 'state',
            width: 100,
            align: 'center',
            render: (val: number) => renderState(val),
        }
    ];

    useEffect(() => {
        loadIssue();
    }, [props.issueId])

    useEffect(() => {
        const unListenFn = listen<NoticeType.AllNotice>("notice", ev => {
            const notice = ev.payload;
            if (notice.IssueNotice?.UpdateIssueDepNotice != undefined && notice.IssueNotice.UpdateIssueDepNotice.dep_issue_id == props.issueId) {
                loadIssue();
            }
        });
        return () => {
            unListenFn.then((unListen) => unListen());
        };
    }, [props.issueId]);

    return (
        <Table rowKey={'issue_id'} dataSource={issueList} columns={issueColums} pagination={false} />
    );
});