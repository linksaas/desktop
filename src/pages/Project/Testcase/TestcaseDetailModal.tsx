//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import React, { useEffect, useState } from "react";
import { observer } from 'mobx-react';
import { Modal, Tabs } from "antd";
import { useStores } from "@/hooks";
import DetailPanel from "./components/DetailPanel";
import ResultPanel from "./components/ResultPanel";
import CommentTab from "@/components/CommentEntry/CommentTab";
import { COMMENT_TARGET_TEST_CASE } from "@/api/project_comment";
import CommentInModal from "@/components/CommentEntry/CommentInModal";

const TestcaseDetailModal = () => {
    const userStore = useStores('userStore');
    const projectStore = useStores('projectStore');

    const [commentDataVersion, setCommentDataVersion] = useState(0);

    useEffect(() => {
        if (projectStore.projectModal.testCaseTab == "comment") {
            setTimeout(() => {
                setCommentDataVersion(oldValue => oldValue + 1);
            }, 500);
        }
    }, [projectStore.projectModal.testCaseTab]);

    return (
        <Modal open title="测试用例" footer={null}
            width="800px"
            bodyStyle={{ height: "calc(100vh - 300px)", padding: "0px 10px", overflowY: "hidden" }}
            onCancel={e => {
                e.stopPropagation();
                e.preventDefault();
                projectStore.projectModal.testCaseId = "";
                projectStore.projectModal.testCaseTab = "detail";
                projectStore.projectModal.testCaseLinkSpritId = "";
            }}>
            <Tabs activeKey={projectStore.projectModal.testCaseTab}
                onChange={key => projectStore.projectModal.testCaseTab = (key as "detail" | "result" | "comment")}
                type="card" tabPosition="left" size="large"
                items={[
                    {
                        key: "detail",
                        label: "测试用例详情",
                        children: (
                            <div style={{ height: "calc(100vh - 320px)", overflowY: "scroll" }}>
                                {projectStore.projectModal.testCaseTab == "detail" && (
                                    <DetailPanel onRemove={() => {
                                        projectStore.projectModal.testCaseId = "";
                                        projectStore.projectModal.testCaseTab = "detail";
                                        projectStore.projectModal.testCaseLinkSpritId = "";
                                    }} />
                                )}
                            </div>
                        ),
                    },
                    {
                        key: "result",
                        label: "测试结果",
                        children: (
                            <div style={{ height: "calc(100vh - 320px)", overflowY: "scroll" }}>
                                {projectStore.projectModal.testCaseTab == "result" && (
                                    <ResultPanel />
                                )}
                            </div>
                        ),
                    },
                    {
                        key: "comment",
                        label: <CommentTab targetType={COMMENT_TARGET_TEST_CASE} targetId={projectStore.projectModal.testCaseId} dataVersion={commentDataVersion} />,
                        children: (
                            <div style={{ height: "calc(100vh - 320px)", overflowY: "scroll", paddingRight: "10px" }}>
                                <CommentInModal projectId={projectStore.curProjectId} targetType={COMMENT_TARGET_TEST_CASE} targetId={projectStore.projectModal.testCaseId}
                                    myUserId={userStore.sessionId} myAdmin={projectStore.isAdmin} />
                            </div>
                        ),
                    },
                ]} />
        </Modal>
    );
};

export default observer(TestcaseDetailModal);