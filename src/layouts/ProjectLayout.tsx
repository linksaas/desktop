//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import React from 'react';
import { renderRoutes } from 'react-router-config';
import type { IRouteConfig } from '@/routes';
import style from './style.module.less';
import { observer } from 'mobx-react';
import { useStores } from '@/hooks';
import CodeCommentThreadModal from '@/pages/Project/Code/CodeCommentThreadModal';
import ProjectSettingModal from '@/pages/Project/Setting/ProjectSettingModal';
import CreateIdeaModal from '@/pages/Idea/components/CreateIdeaModal';
import GitPostHookModal from '@/pages/Project/ProjectTool/GitPostHookModal';
import UpdateEntryModal from '@/pages/Project/Home/components/UpdateEntryModal';
import ChatAndCommentPanel from '@/pages/Project/ChatAndComment';
import CreateEntryModal from '@/pages/Project/Home/components/CreateEntryModal';
import TestcaseDetailModal from '@/pages/Project/Testcase/TestcaseDetailModal';
import CreateTestCaseModal from "@/pages/Project/Testcase/CreateModal";
import RequirementDetailModal from '@/pages/Project/Requirement/RequirementDetailModal';
import CreateRequirementModal from "@/pages/Project/Requirement/CreateModal";
import IssueDetailModal from '@/pages/Issue/IssueDetailModal';
import CreateIssueModal from '@/pages/Issue/CreateModal';
import IdeaTipModal from '@/pages/Idea/IdeaTipModal';
import CreateBulletinModal from '@/pages/Project/ChatAndComment/components/CreateBulletinModal';
import ViewBulletinModal from '@/pages/Project/ChatAndComment/components/ViewBulletinModal';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import MemberList from '@/pages/Project/ChatAndComment/MemberList';
import MemberDetail from '@/pages/Project/ChatAndComment/MemberDetail';


const ProjectLayout: React.FC<{ route: IRouteConfig }> = ({ route }) => {
    const projectStore = useStores("projectStore");
    const ideaStore = useStores("ideaStore");
    const entryStore = useStores("entryStore");
    const memberStore = useStores('memberStore');

    return (
        <ErrorBoundary>
            <div className={style.projectLayout}>
                {projectStore.showChatAndComment && (
                    <div style={{ width: "400px", borderLeft: "1px solid #e4e4e8" }}>
                        <div style={{ width: "390px", backgroundColor: "white", margin: "5px 5px", height: "calc(100vh - 96px)", borderRadius: "10px" }}>
                            {projectStore.showChatAndCommentTab != "member" && <ChatAndCommentPanel />}
                            {projectStore.showChatAndCommentTab == "member" && memberStore.showDetailMemberId == "" && <MemberList />}
                            {projectStore.showChatAndCommentTab == "member" && memberStore.showDetailMemberId != "" && <MemberDetail />}
                        </div>
                    </div>
                )}

                <div style={{ flex: 1, marginRight: "60px" }}>
                    {renderRoutes(route.routes)}
                </div>

                {projectStore.codeCommentThreadId != "" && (
                    <CodeCommentThreadModal threadId={projectStore.codeCommentThreadId} commentId={projectStore.codeCommentId} />
                )}
                {projectStore.curProjectId != "" && projectStore.showProjectSetting != null && (
                    <ProjectSettingModal />
                )}
                {projectStore.curProjectId != "" && ideaStore.showCreateIdea == true && (
                    <CreateIdeaModal />
                )}
                {projectStore.curProjectId != "" && projectStore.showPostHookModal == true && (
                    <GitPostHookModal />
                )}
                {projectStore.curProjectId != "" && entryStore.editEntryId != "" && (
                    <UpdateEntryModal />
                )}
                {entryStore.createEntryType != null && (
                    <CreateEntryModal />
                )}
                {projectStore.curProjectId != "" && projectStore.projectModal.testCaseId != "" && (
                    <TestcaseDetailModal />
                )}
                {projectStore.curProjectId != "" && projectStore.projectModal.createTestCase == true && (
                    <CreateTestCaseModal
                        onCancel={() => projectStore.projectModal.setCreateTestCase(false, "", false)}
                        onOk={() => {
                            projectStore.projectModal.setCreateTestCase(false, "", false);
                        }} />
                )}
                {projectStore.curProjectId != "" && projectStore.projectModal.requirementId != "" && (
                    <RequirementDetailModal />
                )}
                {projectStore.curProjectId != "" && projectStore.projectModal.createRequirement == true && (
                    <CreateRequirementModal />
                )}
                {projectStore.curProjectId != "" && projectStore.projectModal.issueId != "" && (
                    <IssueDetailModal />
                )}
                {projectStore.curProjectId != "" && projectStore.projectModal.createIssue == true && (
                    <CreateIssueModal />
                )}
                {projectStore.curProjectId != "" && projectStore.projectModal.ideaKeyword != "" && (
                    <IdeaTipModal />
                )}
                {projectStore.curProjectId != "" && projectStore.projectModal.createBulletin == true && (
                    <CreateBulletinModal />
                )}
                {projectStore.curProjectId != "" && projectStore.projectModal.bulletinId != "" && (
                    <ViewBulletinModal />
                )}
            </div>
        </ErrorBoundary>
    );
};

export default observer(ProjectLayout);
