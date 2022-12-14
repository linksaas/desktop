import React, { useState } from "react";
import s from './IssueDetailLeft.module.less';
import { is_empty_doc, ReadOnlyEditor, useCommonEditor } from "@/components/Editor";
import { Card, Space, Empty, message } from "antd";
import Button from "@/components/Button";
import { useLocation } from "react-router-dom";
import { getIssueText, getIsTask } from "@/utils/utils";
import { ExtraIssueInfo } from "./ExtraIssueInfo";
import type { IssueInfo } from "@/api/project_issue";
import { CommentList } from "./CommentList";
import { observer } from 'mobx-react';
import { useStores } from "@/hooks";
import { FILE_OWNER_TYPE_ISSUE } from "@/api/fs";
import { updateContent as updateIssueContent } from './utils';


export interface IssueDetailLeftProps {
    issue: IssueInfo;
}

const IssueDetailLeft: React.FC<IssueDetailLeftProps> = (props) => {
    const { pathname } = useLocation();
    const userStore = useStores('userStore');
    const projectStore = useStores('projectStore');

    const [inEdit, setInEdit] = useState(false);
    const [issueContent, setIssueContent] = useState(props.issue.basic_info.content);
    const [isEmpty, setIsEmpty] = useState(is_empty_doc(JSON.parse(props.issue.basic_info.content)));


    const editor = useCommonEditor({
        content: props.issue.basic_info.content,
        fsId: projectStore.curProject?.issue_fs_id ?? "",
        ownerType: FILE_OWNER_TYPE_ISSUE,
        ownerId: props.issue.issue_id,
        historyInToolbar: false,
        clipboardInToolbar: false,
        widgetInToolbar: true,
        showReminder: false,
        channelMember: false,
    });

    const updateContent = async () => {
        const data = editor.editorRef.current?.getContent() ?? {
            type: 'doc',
        };
        const content = JSON.stringify(data);
        const res = await updateIssueContent(userStore.sessionId, projectStore.curProjectId, props.issue.issue_id, content);
        if (res) {
            setIssueContent(content);
            setInEdit(false);
            setIsEmpty(is_empty_doc(data));
            message.info("??????????????????");
        } else {
            message.error("??????????????????");
        }
    };

    const renderContentBtn = () => {
        if (inEdit) {
            return (<Space>
                <Button type="default" onClick={e => {
                    e.stopPropagation();
                    e.preventDefault();
                    editor.editorRef.current?.setContent(issueContent);
                    setInEdit(false);
                }}>??????</Button>
                <Button onClick={e => {
                    e.stopPropagation();
                    e.preventDefault();
                    updateContent();
                }}>????????????</Button>
            </Space>);
        } else {
            return (<Button onClick={e => {
                e.stopPropagation();
                e.preventDefault();
                setInEdit(true);
            }}>??????</Button>);
        }
    };

    return (
        <div className={s.leftCom}>
            <Card title={<h2>{getIssueText(pathname)}??????</h2>} bordered={false} extra={renderContentBtn()}>
                {inEdit && (<>
                    {editor.editor}
                </>)}
                {!inEdit && (
                    <>
                        {isEmpty && (<Empty description="????????????" image={Empty.PRESENTED_IMAGE_SIMPLE} />)}
                        {!isEmpty && (<ReadOnlyEditor content={issueContent} />)}
                    </>
                )}
            </Card>
            {getIsTask(pathname) && (props.issue?.issue_id ?? "") != "" && (
                <>
                    <hr />
                    <ExtraIssueInfo issueId={props.issue?.issue_id ?? ""}
                        canOptSubIssue={props.issue?.user_issue_perm.can_opt_sub_issue ?? false}
                        canOptDependence={props.issue?.user_issue_perm.can_opt_dependence ?? false} />
                </>
            )}
            <hr />
            <CommentList issueId={props.issue?.issue_id ?? ""} />
        </div>
    );
}

export default observer(IssueDetailLeft);