//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import React, { useEffect, useState } from 'react';
import type { NodeViewComponentProps } from '@remirror/react';
import { useCommands } from '@remirror/react';
import type {
  LinkInfo,
  LinkTaskInfo,
  LinkBugInfo,
  LinkDocInfo,
  LinkExterneInfo,
  LinkRequirementInfo,
  LinkSpritInfo,
  LinkBoardInfo,
  LinkApiCollInfo,
  LinkTestCaseInfo,
  LinkIdeaPageInfo,
} from '@/stores/linkAux';
import { LINK_TARGET_TYPE } from '@/stores/linkAux';
import { useStores } from '@/hooks';
import { useHistory } from 'react-router-dom';
import { Popover } from 'antd';
import { request } from '@/utils/request';
import { get as get_issue } from '@/api/project_issue';
import { LinkOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { get_requirement } from '@/api/project_requirement';
import { get_session } from '@/api/user';
import { get as get_entry } from "@/api/project_entry";
import { get_case } from "@/api/project_testcase";
import { get_idea } from "@/api/project_idea";

const Link: React.FC<{
  link: LinkInfo;
  canRemove: boolean;
  onClick: () => void;
  getPosition: () => number;
}> = ({ link, canRemove, onClick, getPosition }) => {
  const { deleteLink, insertText } = useCommands();
  const cancelLink = () => {
    deleteLink(getPosition());
    insertText(link.linkContent);
  };

  const [title, setTitle] = useState('');

  const loadData = async () => {
    if (title != '') {
      return;
    }
    const sessionId = await get_session();
    if (link.linkTargeType == LINK_TARGET_TYPE.LINK_TARGET_REQUIRE_MENT) {
      setTitle('项目需求:' + link.linkContent);
      const reqLink = link as unknown as LinkRequirementInfo;
      const res = await request(get_requirement({
        session_id: sessionId,
        project_id: reqLink.projectId,
        requirement_id: reqLink.requirementId,
      }));
      if (res) {
        setTitle('项目需求:' + res.requirement.base_info.title);
      }
    } else if (link.linkTargeType == LINK_TARGET_TYPE.LINK_TARGET_TASK) {
      setTitle('任务:' + link.linkContent);
      const taskLink = link as unknown as LinkTaskInfo;
      const res = await request(
        get_issue(sessionId, taskLink.projectId, taskLink.issueId),
      );
      if (res) {
        setTitle('任务:' + res.info.basic_info.title);
      }
    } else if (link.linkTargeType == LINK_TARGET_TYPE.LINK_TARGET_BUG) {
      setTitle('缺陷:' + link.linkContent);
      const bugLink = link as unknown as LinkBugInfo;
      const res = await request(get_issue(sessionId, bugLink.projectId, bugLink.issueId));
      if (res) {
        setTitle('缺陷:' + res.info.basic_info.title);
      }
    } else if (link.linkTargeType == LINK_TARGET_TYPE.LINK_TARGET_TEST_CASE) {
      setTitle('测试用例:' + link.linkContent);
      const testcaseLink = link as unknown as LinkTestCaseInfo;
      const res = await request(get_case({
        session_id: sessionId,
        project_id: testcaseLink.projectId,
        case_id: testcaseLink.testCaseId,
        sprit_id: "",
      }));
      if (res) {
        setTitle('测试用例:' + res.case_detail.case_info.title);
      }
    } else if (link.linkTargeType == LINK_TARGET_TYPE.LINK_TARGET_DOC) {
      setTitle('文档:' + link.linkContent);
      const docLink = link as unknown as LinkDocInfo;
      const res = await request(
        get_entry({
          session_id: sessionId,
          project_id: docLink.projectId,
          entry_id: docLink.docId,
        }));
      if (res) {
        setTitle('文档:' + res.entry.entry_title);
      }
    } else if (link.linkTargeType == LINK_TARGET_TYPE.LINK_TARGET_SPRIT) {
      setTitle('工作计划:' + link.linkContent);
      const spritLink = link as unknown as LinkSpritInfo;
      const res = await request(
        get_entry({
          session_id: sessionId,
          project_id: spritLink.projectId,
          entry_id: spritLink.spritId,
        }),
      );
      if (res) {
        setTitle('工作计划:' + res.entry.entry_title);
      }
    } else if (link.linkTargeType == LINK_TARGET_TYPE.LINK_TARGET_BOARD) {
      setTitle('信息面板:' + link.linkContent);
      const boardLink = link as unknown as LinkBoardInfo;
      const res = await request(
        get_entry({
          session_id: sessionId,
          project_id: boardLink.projectId,
          entry_id: boardLink.boardId,
        }));
      if (res) {
        setTitle('信息面板:' + res.entry.entry_title);
      }
    } else if (link.linkTargeType == LINK_TARGET_TYPE.LINK_TARGET_API_COLL) {
      setTitle('接口集合:' + link.linkContent);
      const apiCollLink = link as unknown as LinkApiCollInfo;
      const res = await request(
        get_entry({
          session_id: sessionId,
          project_id: apiCollLink.projectId,
          entry_id: apiCollLink.apiCollId,
        }));
      if (res) {
        setTitle('接口集合:' + res.entry.entry_title);
      }
    } else if (link.linkTargeType == LINK_TARGET_TYPE.LINK_TARGET_IDEA_PAGE) {
      setTitle('知识点:' + link.linkContent);
      const ideaLink = link as unknown as LinkIdeaPageInfo;
      const res = await request(
        get_idea({
          session_id: sessionId,
          project_id: ideaLink.projectId,
          idea_id: ideaLink.ideaId,
        })
      );
      if (res) {
        setTitle('知识点:' + res.idea.basic_info.title);
      }

    } else if (link.linkTargeType == LINK_TARGET_TYPE.LINK_TARGET_EXTERNE) {
      const externLink = link as unknown as LinkExterneInfo;
      setTitle('外部链接:' + externLink.destUrl);
    }
  };

  return (
    <span
      onMouseOver={(e) => {
        e.stopPropagation();
        e.preventDefault();
        loadData();
      }}
    >
      <Popover
        content={
          <div style={{ padding: "5px 5px 5px 5px" }}>
            {title}
          </div>
        }
      >
        <span style={{ borderBottom: "1px solid blue", paddingLeft: "5px", paddingRight: "5px" }}>
          <LinkOutlined />
          <a
            onClick={(e) => {
              e.stopPropagation();
              e.stopPropagation();
              onClick();
            }}
          >
            {link.linkContent}
          </a>
          {canRemove && <CloseCircleOutlined style={{ cursor: "pointer", paddingLeft: "5px" }} onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            cancelLink();
          }} />}
        </span>
      </Popover>
    </span>
  );
};

export type EditLinkProps = NodeViewComponentProps & {
  link: LinkInfo;
};

export const EditLink: React.FC<EditLinkProps> = (props) => {
  useEffect(() => {
    props.updateAttributes({ link: props.link });
  }, []);

  return (
    <Link
      link={props.link}
      canRemove={true}
      onClick={() => { }}
      getPosition={props.getPosition as () => number}
    />
  );
};

export type ViewLinkProps = NodeViewComponentProps & {
  link: LinkInfo;
};

export const ViewLink: React.FC<ViewLinkProps> = (props) => {
  const linkAuxStore = useStores('linkAuxStore');
  const history = useHistory();

  return (
    <Link
      link={props.link}
      canRemove={false}
      onClick={() => {
        linkAuxStore.goToLink(props.link, history);
      }}
      getPosition={props.getPosition as () => number}
    />
  );
};
