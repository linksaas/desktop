//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import type { RootStore } from '.';
import { makeAutoObservable } from 'mobx';
import { request } from '@/utils/request';
import type { History } from 'history';
import { ISSUE_TYPE_BUG, ISSUE_TYPE_TASK, type ISSUE_STATE } from '@/api/project_issue';
import {
  APP_PROJECT_HOME_PATH,
  APP_PROJECT_KB_BOARD_PATH,
  APP_PROJECT_KB_DOC_PATH,
  APP_PROJECT_MY_WORK_PATH,
  APP_PROJECT_PATH,
  APP_PROJECT_WORK_PLAN_PATH,
} from '@/utils/constant';
import { open } from '@tauri-apps/api/shell';
import { uniqId } from '@/utils/utils';
import { WebviewWindow, appWindow } from '@tauri-apps/api/window';
import { get as get_entry, ENTRY_TYPE_SPRIT, ENTRY_TYPE_DOC, ENTRY_TYPE_BOARD, API_COLL_GRPC, API_COLL_OPENAPI, API_COLL_CUSTOM, ENTRY_TYPE_API_COLL, ENTRY_TYPE_DATA_ANNO } from "@/api/project_entry";
import type { API_COLL_TYPE } from "@/api/project_entry";

/*
 * 用于统一管理链接跳转以及链接直接传递数据
 */

export enum LINK_TARGET_TYPE {
  LINK_TARGET_PROJECT = 0,
  // LINK_TARGET_CHANNEL = 1,
  LINK_TARGET_EVENT = 2,
  LINK_TARGET_DOC = 3,
  // LINK_TARGET_APP = 4,
  LINK_TARGET_SPRIT = 5,
  LINK_TARGET_TASK = 6,
  LINK_TARGET_BUG = 7,
  // LINK_TARGET_APPRAISE = 8,
  // LINK_TARGET_USER_KB = 9,
  // LINK_TARGET_ROBOT_METRIC = 10,
  // LINK_TARGET_EARTHLY_ACTION = 11,
  // LINK_TARGET_EARTHLY_EXEC = 12,
  // LINK_TARGET_BOOK_MARK = 13,
  // LINK_TARGET_TEST_CASE_ENTRY = 14,
  // LINK_TARGET_SCRIPT_SUITE = 15,
  // LINK_TARGET_SCRIPT_EXEC = 16,
  LINK_TARGET_REQUIRE_MENT = 17,
  LINK_TARGET_CODE_COMMENT = 18,
  // LINK_TARGET_BOOK_MARK_CATE = 19,
  LINK_TARGET_IDEA_PAGE = 20,
  // LINK_TARGET_PIPE_LINE = 21,
  LINK_TARGET_ENTRY = 22,
  LINK_TARGET_API_COLL = 23,
  LINK_TARGET_DATA_ANNO = 24,
  LINK_TARGET_BOARD = 25,
  LINK_TARGET_TEST_CASE = 26,

  LINK_TARGET_NONE = 100,
  LINK_TARGET_IMAGE = 101,
  LINK_TARGET_EXTERNE = 102,
}

export interface LinkInfo {
  linkTargeType: LINK_TARGET_TYPE;
  linkContent: string;
}

export class LinkProjectInfo {
  constructor(content: string, projectId: string) {
    this.linkTargeType = LINK_TARGET_TYPE.LINK_TARGET_PROJECT;
    this.linkContent = content;
    this.projectId = projectId;
  }

  linkTargeType: LINK_TARGET_TYPE;
  linkContent: string;
  projectId: string;
}


export class LinkEventlInfo {
  constructor(
    content: string,
    projectId: string,
    eventId: string,
    userId: string,
    eventTime: number,
  ) {
    this.linkTargeType = LINK_TARGET_TYPE.LINK_TARGET_EVENT;
    this.linkContent = content;
    this.projectId = projectId;
    this.eventId = eventId;
    this.userId = userId;
    this.eventTime = eventTime;
  }
  linkTargeType: LINK_TARGET_TYPE;
  linkContent: string;
  projectId: string;
  eventId: string;
  userId: string;
  eventTime: number;
}

export class LinkDocInfo {
  constructor(content: string, projectId: string, docId: string) {
    this.linkTargeType = LINK_TARGET_TYPE.LINK_TARGET_DOC;
    this.linkContent = content;
    this.projectId = projectId;
    this.docId = docId;
  }
  linkTargeType: LINK_TARGET_TYPE;
  linkContent: string;
  projectId: string;
  docId: string;
}

export class LinkSpritInfo {
  constructor(content: string, projectId: string, spritId: string) {
    this.linkTargeType = LINK_TARGET_TYPE.LINK_TARGET_SPRIT;
    this.linkContent = content;
    this.projectId = projectId;
    this.spritId = spritId;
  }
  linkTargeType: LINK_TARGET_TYPE;
  linkContent: string;
  projectId: string;
  spritId: string;
}

export class LinkBoardInfo {
  constructor(content: string, projectId: string, boardId: string) {
    this.linkTargeType = LINK_TARGET_TYPE.LINK_TARGET_BOARD;
    this.linkContent = content;
    this.projectId = projectId;
    this.boardId = boardId;
  }
  linkTargeType: LINK_TARGET_TYPE;
  linkContent: string;
  projectId: string;
  boardId: string;
}

export class LinkTaskInfo {
  constructor(content: string, projectId: string, issueId: string, showTab: "detail" | "subtask" | "mydep" | "depme" | "event" | "comment" = "detail") {
    this.linkTargeType = LINK_TARGET_TYPE.LINK_TARGET_TASK;
    this.linkContent = content;
    this.projectId = projectId;
    this.issueId = issueId;
    this.showTab = showTab;
  }
  linkTargeType: LINK_TARGET_TYPE;
  linkContent: string;
  projectId: string;
  issueId: string;
  showTab: "detail" | "subtask" | "mydep" | "depme" | "event" | "comment";
}

export class LinkBugInfo {
  constructor(content: string, projectId: string, issueId: string, showTab: "detail" | "subtask" | "mydep" | "depme" | "event" | "comment" = "detail") {
    this.linkTargeType = LINK_TARGET_TYPE.LINK_TARGET_BUG;
    this.linkContent = content;
    this.projectId = projectId;
    this.issueId = issueId;
    this.showTab = showTab;
  }
  linkTargeType: LINK_TARGET_TYPE;
  linkContent: string;
  projectId: string;
  issueId: string;
  showTab: "detail" | "subtask" | "mydep" | "depme" | "event" | "comment";
}

export class LinkNoneInfo {
  constructor(content: string) {
    this.linkTargeType = LINK_TARGET_TYPE.LINK_TARGET_NONE;
    this.linkContent = content;
  }
  linkTargeType: LINK_TARGET_TYPE;
  linkContent: string;
}

export class LinkRequirementInfo {
  constructor(content: string, projectId: string, requirementId: string, showTab: "detail" | "issue" | "fourq" | "kano" | "event" | "comment" = "detail") {
    this.linkTargeType = LINK_TARGET_TYPE.LINK_TARGET_REQUIRE_MENT;
    this.linkContent = content;
    this.projectId = projectId;
    this.requirementId = requirementId;
    this.showTab = showTab;
  }
  linkTargeType: LINK_TARGET_TYPE;
  linkContent: string;
  projectId: string;
  requirementId: string;
  showTab: "detail" | "issue" | "fourq" | "kano" | "event" | "comment"
}

export class LinkCodeCommentInfo {
  constructor(content: string, projectId: string, threadId: string, commentId: string) {
    this.linkTargeType = LINK_TARGET_TYPE.LINK_TARGET_CODE_COMMENT;
    this.linkContent = content;
    this.projectId = projectId;
    this.threadId = threadId;
    this.commentId = commentId;
  }
  linkTargeType: LINK_TARGET_TYPE;
  linkContent: string;
  projectId: string;
  threadId: string;
  commentId: string;
}

export class LinkIdeaPageInfo {
  constructor(content: string, projectId: string, ideaGroupId: string, keywordList: string[], ideaId: string = "", showTip: boolean = false) {
    this.linkTargeType = LINK_TARGET_TYPE.LINK_TARGET_IDEA_PAGE;
    this.linkContent = content;
    this.projectId = projectId;
    this.ideaGroupId = ideaGroupId;
    this.keywordList = keywordList;
    this.ideaId = ideaId;
    this.showTip = showTip;
  }
  linkTargeType: LINK_TARGET_TYPE;
  linkContent: string;
  projectId: string;
  ideaGroupId: string;
  keywordList: string[];
  ideaId: string;
  showTip: boolean;
}


export class LinkEntryInfo {
  constructor(content: string, projectId: string, entryId: string) {
    this.linkTargeType = LINK_TARGET_TYPE.LINK_TARGET_ENTRY;
    this.linkContent = content;
    this.projectId = projectId;
    this.entryId = entryId;
  }

  linkTargeType: LINK_TARGET_TYPE;
  linkContent: string;
  projectId: string;
  entryId: string;
}

export class LinkApiCollInfo {
  constructor(content: string, projectId: string, apiCollId: string, showComment: boolean = false) {
    this.linkTargeType = LINK_TARGET_TYPE.LINK_TARGET_API_COLL;
    this.linkContent = content;
    this.projectId = projectId;
    this.apiCollId = apiCollId;
    this.showComment = showComment;
  }

  linkTargeType: LINK_TARGET_TYPE;
  linkContent: string;
  projectId: string;
  apiCollId: string;
  showComment: boolean;
}

export class LinkDataAnnoInfo {
  constructor(content: string, projectId: string, annoProjectId: string, showComment: boolean = false) {
    this.linkTargeType = LINK_TARGET_TYPE.LINK_TARGET_DATA_ANNO;
    this.linkContent = content;
    this.projectId = projectId;
    this.annoProjectId = annoProjectId;
    this.showComment = showComment;
  }

  linkTargeType: LINK_TARGET_TYPE;
  linkContent: string;
  projectId: string;
  annoProjectId: string;
  showComment: boolean;
}

export class LinkTestCaseInfo {
  constructor(content: string, projectId: string, testCaseId: string, spritId: string = "", showTab: "detail" | "result" | "comment" = "detail") {
    this.linkTargeType = LINK_TARGET_TYPE.LINK_TARGET_TEST_CASE;
    this.linkContent = content;
    this.projectId = projectId;
    this.testCaseId = testCaseId;
    this.spritId = spritId;
    this.showTab = showTab;
  }

  linkTargeType: LINK_TARGET_TYPE;
  linkContent: string;
  projectId: string;
  testCaseId: string;
  spritId: string;
  showTab: "detail" | "result" | "comment";
}

export class LinkImageInfo {
  constructor(content: string, imgUrl: string, thumbImgUrl: string) {
    this.linkTargeType = LINK_TARGET_TYPE.LINK_TARGET_IMAGE;
    this.linkContent = content;
    this.imgUrl = imgUrl;
    this.thumbImgUrl = thumbImgUrl;
  }
  linkTargeType: LINK_TARGET_TYPE;
  linkContent: string;
  imgUrl: string;
  thumbImgUrl: string;
}

export class LinkExterneInfo {
  constructor(content: string, destUrl: string) {
    this.linkTargeType = LINK_TARGET_TYPE.LINK_TARGET_EXTERNE;
    this.linkContent = content;
    this.destUrl = destUrl;
  }
  linkTargeType: LINK_TARGET_TYPE;
  linkContent: string;
  destUrl: string;
}

export type LinkEventState = {
  eventTime: number;
  memberUserId: string;
};

export enum ISSUE_TAB_LIST_TYPE {
  ISSUE_TAB_LIST_ALL, //全部
  ISSUE_TAB_LIST_ASSGIN_ME, //指派给我
  ISSUE_TAB_LIST_MY_CREATE, //由我创建
  ISSUE_TAB_LIST_MY_WATCH,  //我的关注
}

export type LinkIssueListState = {
  stateList: ISSUE_STATE[];
  execUserIdList: string[];
  checkUserIdList: string[];
  tabType?: ISSUE_TAB_LIST_TYPE;
  priorityList?: number[];
  softwareVersionList?: string[];
  levelList?: number[];
  tagId?: string;
  curPage?: number;
};

export type LinkDocState = {
  writeDoc: boolean;
  content: string;
  docSpaceId: string;
  docId: string;
};


class LinkAuxStore {
  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
  }
  rootStore: RootStore;

  async goToLink(link: LinkInfo, history: History) {
    const pathname = history.location.pathname;
    if (link.linkTargeType == LINK_TARGET_TYPE.LINK_TARGET_EVENT) {
      const eventLink = link as LinkEventlInfo;
      history.push(this.genUrl(eventLink.projectId, pathname, "/record"), {
        eventTime: eventLink.eventTime,
        memberUserId: eventLink.userId,
      } as LinkEventState);
    } else if (link.linkTargeType == LINK_TARGET_TYPE.LINK_TARGET_TASK) {
      const taskLink = link as LinkTaskInfo;
      if (this.rootStore.projectStore.curProjectId != taskLink.projectId) {
        await this.rootStore.projectStore.setCurProjectId(taskLink.projectId);
        await this.rootStore.orgStore.setCurOrgId("");
        if (!history.location.pathname.startsWith(APP_PROJECT_PATH)) {
          history.push(APP_PROJECT_HOME_PATH);
        }
      }
      this.rootStore.projectStore.projectModal.setIssueIdAndType(taskLink.issueId, ISSUE_TYPE_TASK);
      this.rootStore.projectStore.projectModal.issueTab = taskLink.showTab;
    } else if (link.linkTargeType == LINK_TARGET_TYPE.LINK_TARGET_BUG) {
      const bugLink = link as LinkBugInfo;
      if (this.rootStore.projectStore.curProjectId != bugLink.projectId) {
        await this.rootStore.projectStore.setCurProjectId(bugLink.projectId);
        await this.rootStore.orgStore.setCurOrgId("");
        if (!history.location.pathname.startsWith(APP_PROJECT_PATH)) {
          history.push(APP_PROJECT_HOME_PATH);
        }
      }
      this.rootStore.projectStore.projectModal.setIssueIdAndType(bugLink.issueId, ISSUE_TYPE_BUG);
      this.rootStore.projectStore.projectModal.issueTab = bugLink.showTab;
    } else if (link.linkTargeType == LINK_TARGET_TYPE.LINK_TARGET_DOC) {
      const docLink = link as LinkDocInfo;
      if (this.rootStore.appStore.inEdit) {
        this.rootStore.appStore.showCheckLeave(() => {
          this.goToDoc(docLink, history);
        });
      } else {
        await this.goToDoc(docLink, history);
      }
    } else if (link.linkTargeType == LINK_TARGET_TYPE.LINK_TARGET_SPRIT) {
      const spritLink = link as LinkSpritInfo;
      if (this.rootStore.appStore.inEdit) {
        this.rootStore.appStore.showCheckLeave(() => {
          this.goToSprit(spritLink, history);
        });
      } else {
        await this.goToSprit(spritLink, history);
      }
    } else if (link.linkTargeType == LINK_TARGET_TYPE.LINK_TARGET_BOARD) {
      const boardLink = link as LinkBoardInfo;
      if (this.rootStore.appStore.inEdit) {
        this.rootStore.appStore.showCheckLeave(() => {
          this.goToBoard(boardLink, history);
        });
      } else {
        await this.goToBoard(boardLink, history);
      }
    } else if (link.linkTargeType == LINK_TARGET_TYPE.LINK_TARGET_REQUIRE_MENT) {
      const reqLink = link as LinkRequirementInfo;
      if (this.rootStore.projectStore.curProjectId != reqLink.projectId) {
        await this.rootStore.projectStore.setCurProjectId(reqLink.projectId);
        await this.rootStore.orgStore.setCurOrgId("");
        if (!history.location.pathname.startsWith(APP_PROJECT_PATH)) {
          history.push(APP_PROJECT_HOME_PATH);
        }
      }
      this.rootStore.projectStore.projectModal.requirementId = reqLink.requirementId;
      this.rootStore.projectStore.projectModal.requirementTab = reqLink.showTab;
    } else if (link.linkTargeType == LINK_TARGET_TYPE.LINK_TARGET_CODE_COMMENT) {
      const commentLink = link as LinkCodeCommentInfo;
      if (this.rootStore.projectStore.curProjectId != commentLink.projectId) {
        await this.rootStore.projectStore.setCurProjectId(commentLink.projectId);
        await this.rootStore.orgStore.setCurOrgId("");
      }
      this.rootStore.projectStore.setCodeCommentInfo(commentLink.threadId, commentLink.commentId);
      if (!history.location.pathname.startsWith(APP_PROJECT_PATH)) {
        history.push(APP_PROJECT_HOME_PATH);
      }
    } else if (link.linkTargeType == LINK_TARGET_TYPE.LINK_TARGET_IDEA_PAGE) {
      const ideaPageLink = link as LinkIdeaPageInfo;
      if (this.rootStore.projectStore.curProjectId != ideaPageLink.projectId) {
        await this.rootStore.projectStore.setCurProjectId(ideaPageLink.projectId);
        await this.rootStore.orgStore.setCurOrgId("");
      }
      if (ideaPageLink.showTip) {
        if (ideaPageLink.keywordList.length > 0) {
          this.rootStore.projectStore.projectModal.ideaKeyword = ideaPageLink.keywordList[0];
        }
      } else {
        this.rootStore.ideaStore.curIdeaGroupId = ideaPageLink.ideaGroupId;
        this.rootStore.ideaStore.curIdeaId = ideaPageLink.ideaId;
        this.rootStore.ideaStore.searchKeywords = ideaPageLink.keywordList;
        history.push(this.genUrl(ideaPageLink.projectId, pathname, "/idea"));
      }
    } else if (link.linkTargeType == LINK_TARGET_TYPE.LINK_TARGET_ENTRY) {
      const entryLink = link as LinkEntryInfo;
      if (this.rootStore.projectStore.curProjectId != entryLink.projectId) {
        await this.rootStore.projectStore.setCurProjectId(entryLink.projectId);
        await this.rootStore.orgStore.setCurOrgId("");
      }
      const res = await request(get_entry({
        session_id: this.rootStore.userStore.sessionId,
        project_id: entryLink.projectId,
        entry_id: entryLink.entryId,
      }));
      if (res.entry.entry_type == ENTRY_TYPE_SPRIT) {
        await this.goToLink(new LinkSpritInfo("", entryLink.projectId, entryLink.entryId), history);
      } else if (res.entry.entry_type == ENTRY_TYPE_DOC) {
        await this.goToLink(new LinkDocInfo("", entryLink.projectId, entryLink.entryId), history);
      } else if (res.entry.entry_type == ENTRY_TYPE_BOARD) {
        await this.goToLink(new LinkBoardInfo("", entryLink.projectId, entryLink.entryId), history);
      } else if (res.entry.entry_type == ENTRY_TYPE_API_COLL) {
        await this.goToLink(new LinkApiCollInfo("", entryLink.projectId, entryLink.entryId), history);
      } else if (res.entry.entry_type == ENTRY_TYPE_DATA_ANNO) {
        await this.goToLink(new LinkDataAnnoInfo("", entryLink.projectId, entryLink.entryId), history);
      }
    } else if (link.linkTargeType == LINK_TARGET_TYPE.LINK_TARGET_API_COLL) {
      const apiCollLink = link as LinkApiCollInfo;
      if (this.rootStore.projectStore.curProjectId != apiCollLink.projectId) {
        await this.rootStore.projectStore.setCurProjectId(apiCollLink.projectId);
        await this.rootStore.orgStore.setCurOrgId("");
      }
      const res = await request(get_entry({
        session_id: this.rootStore.userStore.sessionId,
        project_id: apiCollLink.projectId,
        entry_id: apiCollLink.apiCollId,
      }));
      await this.openApiCollPage(res.entry.entry_id, res.entry.entry_title + "(只读模式)", res.entry.extra_info.ExtraApiCollInfo?.api_coll_type ?? 0,
        res.entry.extra_info.ExtraApiCollInfo?.default_addr ?? "", false, this.rootStore.projectStore.isAdmin, apiCollLink.showComment);
    } else if (link.linkTargeType == LINK_TARGET_TYPE.LINK_TARGET_DATA_ANNO) {
      const dataAnnoLink = link as LinkDataAnnoInfo;
      if (this.rootStore.projectStore.curProjectId != dataAnnoLink.projectId) {
        await this.rootStore.projectStore.setCurProjectId(dataAnnoLink.projectId);
      }
      await this.openAnnoProjectPage(dataAnnoLink.annoProjectId, dataAnnoLink.linkContent, dataAnnoLink.showComment);
    } else if (link.linkTargeType == LINK_TARGET_TYPE.LINK_TARGET_TEST_CASE) {
      const testCaseLink = link as LinkTestCaseInfo;
      if (this.rootStore.projectStore.curProjectId != testCaseLink.projectId) {
        await this.rootStore.projectStore.setCurProjectId(testCaseLink.projectId);
        await this.rootStore.orgStore.setCurOrgId("");
      }
      this.rootStore.projectStore.projectModal.testCaseLinkSpritId = testCaseLink.spritId;
      this.rootStore.projectStore.projectModal.testCaseTab = testCaseLink.showTab;
      this.rootStore.projectStore.projectModal.testCaseId = testCaseLink.testCaseId;
    } else if (link.linkTargeType == LINK_TARGET_TYPE.LINK_TARGET_EXTERNE) {
      const externLink = link as LinkExterneInfo;
      let destUrl = externLink.destUrl;
      if (!destUrl.includes("://")) {
        destUrl = "https://" + destUrl;
      }
      await open(destUrl);
    }
  }

  private async goToDoc(docLink: LinkDocInfo, history: History) {
    if (this.rootStore.projectStore.curProjectId != docLink.projectId) {
      await this.rootStore.projectStore.setCurProjectId(docLink.projectId);
      await this.rootStore.orgStore.setCurOrgId("");
    }

    this.rootStore.docStore.fromLink = true;
    await this.rootStore.entryStore.loadEntry(docLink.docId);
    await this.rootStore.docStore.loadDoc();
    history.push(APP_PROJECT_KB_DOC_PATH);
  }

  private async goToSprit(spritLink: LinkSpritInfo, history: History) {
    if (this.rootStore.projectStore.curProjectId != spritLink.projectId) {
      await this.rootStore.projectStore.setCurProjectId(spritLink.projectId);
      await this.rootStore.orgStore.setCurOrgId("");
    }
    await this.rootStore.entryStore.loadEntry(spritLink.spritId);
    history.push(APP_PROJECT_WORK_PLAN_PATH);
  }

  private async goToBoard(boardLink: LinkBoardInfo, history: History) {
    if (this.rootStore.projectStore.curProjectId != boardLink.projectId) {
      await this.rootStore.projectStore.setCurProjectId(boardLink.projectId);
      await this.rootStore.orgStore.setCurOrgId("");
    }
    await this.rootStore.entryStore.loadEntry(boardLink.boardId);
    history.push(APP_PROJECT_KB_BOARD_PATH);
  }

  //跳转到创建任务
  async goToCreateTask(content: string, projectId: string, history: History, spritId: string | undefined = undefined) {
    if (projectId != this.rootStore.projectStore.curProjectId) {
      await this.rootStore.projectStore.setCurProjectId(projectId);
      await this.rootStore.orgStore.setCurOrgId("");
    }
    this.rootStore.projectStore.projectModal.setCreateIssue(true, ISSUE_TYPE_TASK, spritId ?? "");
  }

  //跳转到创建缺陷
  async goToCreateBug(content: string, projectId: string, history: History, spritId: string | undefined = undefined) {
    if (projectId != this.rootStore.projectStore.curProjectId) {
      await this.rootStore.projectStore.setCurProjectId(projectId);
      await this.rootStore.orgStore.setCurOrgId("");
    }
    this.rootStore.projectStore.projectModal.setCreateIssue(true, ISSUE_TYPE_BUG, spritId ?? "");
  }

  //跳转到任务列表
  goToTaskList(state: LinkIssueListState | undefined, history: History) {
    if (state != undefined && state?.tabType == undefined) {
      state.tabType = ISSUE_TAB_LIST_TYPE.ISSUE_TAB_LIST_ASSGIN_ME;
    }
    if (state != undefined && state.priorityList == undefined) {
      state.priorityList = [];
    }
    if (state != undefined && state.curPage == undefined) {
      state.curPage = 0;
    }
    history.push(this.genUrl(this.rootStore.projectStore.curProjectId, history.location.pathname, "/task"), state);
  }

  //跳转到缺陷列表
  goToBugList(state: LinkIssueListState | undefined, history: History) {
    if (state != undefined && state?.tabType == undefined) {
      state.tabType = ISSUE_TAB_LIST_TYPE.ISSUE_TAB_LIST_ASSGIN_ME;
    }
    if (state != undefined && state.priorityList == undefined) {
      state.priorityList = [];
    }
    if (state != undefined && state.softwareVersionList == undefined) {
      state.softwareVersionList = [];
    }
    if (state != undefined && state.levelList == undefined) {
      state.levelList = [];
    }
    if (state != undefined && state.curPage == undefined) {
      state.curPage = 0;
    }
    history.push(this.genUrl(this.rootStore.projectStore.curProjectId, history.location.pathname, "/bug"), state);
  }

  //跳转到项目信息
  gotoOverview(history: History) {
    history.push(this.genUrl(this.rootStore.projectStore.curProjectId, history.location.pathname, "/overview"));
  }

  //调整到回收站
  gotoRecycle(history: History) {
    history.push(this.genUrl(this.rootStore.projectStore.curProjectId, history.location.pathname, "/recycle"));
  }

  //调整到测试用例列表
  goToTestCaseList(history: History) {
    history.push(this.genUrl(this.rootStore.projectStore.curProjectId, history.location.pathname, "/testcase"));
  }

  //跳转到研发行为列表页
  goToEventList(history: History) {
    history.push(this.genUrl(this.rootStore.projectStore.curProjectId, history.location.pathname, "/record"));
  }

  //跳转到研发行为订阅页面
  goToEventSubscribeList(history: History) {
    history.push(this.genUrl(this.rootStore.projectStore.curProjectId, history.location.pathname, "/record/subscribe"));
  }

  //跳转到第三方接入列表
  goToExtEventList(history: History) {
    history.push(this.genUrl(this.rootStore.projectStore.curProjectId, history.location.pathname, "/access"));
  }

  //跳转到知识点列表
  goToIdeaList(history: History) {
    history.push(this.genUrl(this.rootStore.projectStore.curProjectId, history.location.pathname, "/idea"));
  }

  //打开接口集合页面
  async openApiCollPage(apiCollId: string, name: string, apiCollType: API_COLL_TYPE, defaultAddr: string, canEdit: boolean, canAdmin: boolean, showComment: boolean = false) {
    const label = `apiColl:${apiCollId}`;
    const pos = await appWindow.innerPosition();
    let view: WebviewWindow | null = null;
    if (apiCollType == API_COLL_GRPC) {
      view = new WebviewWindow(label, {
        title: `${name}(GRPC)`,
        url: `api_grpc.html?projectId=${this.rootStore.projectStore.curProjectId}&apiCollId=${apiCollId}&fsId=${this.rootStore.projectStore.curProject?.api_coll_fs_id ?? ""}&remoteAddr=${defaultAddr}&edit=${canEdit}&admin=${canAdmin}&showComment=${showComment}`,
        x: pos.x + Math.floor(Math.random() * 200),
        y: pos.y + Math.floor(Math.random() * 200),
      });
    } else if (apiCollType == API_COLL_OPENAPI) {
      view = new WebviewWindow(label, {
        title: `${name}(OPENAPI/SWAGGER)`,
        url: `api_swagger.html?projectId=${this.rootStore.projectStore.curProjectId}&apiCollId=${apiCollId}&fsId=${this.rootStore.projectStore.curProject?.api_coll_fs_id ?? ""}&remoteAddr=${defaultAddr}&edit=${canEdit}&admin=${canAdmin}&showComment=${showComment}`,
        x: pos.x + Math.floor(Math.random() * 200),
        y: pos.y + Math.floor(Math.random() * 200),
      });
    } else if (apiCollType == API_COLL_CUSTOM) {
      view = new WebviewWindow(label, {
        title: `${name}(自定义接口)`,
        url: `api_custom.html?projectId=${this.rootStore.projectStore.curProjectId}&apiCollId=${apiCollId}&remoteAddr=${defaultAddr}&edit=${canEdit}&admin=${canAdmin}&showComment=${showComment}`,
        x: pos.x + Math.floor(Math.random() * 200),
        y: pos.y + Math.floor(Math.random() * 200),
      });
    }
    if (view != null) {
      view.once('tauri://created', function () {
        if (view != null) {
          view.setAlwaysOnTop(true);
        }
        setTimeout(() => {
          if (view != null) {
            view.setAlwaysOnTop(false);
          }
        }, 200);
      });
    }
  }

  async openAnnoProjectPage(annoProjectId: string, annoName: string, showComment: boolean = false) {
    const label = `dataAnno:${annoProjectId}`
    const view = WebviewWindow.getByLabel(label);
    if (view != null) {
      await view.setAlwaysOnTop(true);
      await view.show();
      await view.unminimize();
      setTimeout(() => {
        view.setAlwaysOnTop(false);
      }, 200);
      return;
    }
    const pos = await appWindow.innerPosition();

    const projectStore = this.rootStore.projectStore;

    const newView = new WebviewWindow(label, {
      title: `标注项目(${annoName})`,
      url: `data_anno.html?projectId=${projectStore.curProjectId}&annoProjectId=${annoProjectId}&fsId=${projectStore.curProject?.data_anno_fs_id ?? ""}&showComment=${showComment}`,
      width: 1000,
      minWidth: 800,
      height: 800,
      minHeight: 600,
      resizable: true,
      center: true,
      x: pos.x + Math.floor(Math.random() * 200),
      y: pos.y + Math.floor(Math.random() * 200),
    });
    newView.once('tauri://created', function () {
      newView.setAlwaysOnTop(true);
      setTimeout(() => { newView.setAlwaysOnTop(false) }, 200);
    });
  };

  //跳转到项目需求列表页面
  goToRequirementList(history: History) {
    history.push(this.genUrl(this.rootStore.projectStore.curProjectId, history.location.pathname, "/req"));
  }

  private genUrl(projectId: string, pathname: string, suffix: string): string {
    let newSuffix = suffix;
    if (suffix.indexOf("?") == -1) {
      newSuffix = `${suffix}?v=${uniqId()}`
    }
    if (pathname.startsWith(APP_PROJECT_WORK_PLAN_PATH)) {
      return APP_PROJECT_WORK_PLAN_PATH + newSuffix;
    } else if (pathname.startsWith(APP_PROJECT_KB_DOC_PATH)) {
      return APP_PROJECT_KB_DOC_PATH + newSuffix;
    } else if (pathname.startsWith(APP_PROJECT_KB_BOARD_PATH)) {
      return APP_PROJECT_KB_BOARD_PATH + newSuffix;
    } else if (pathname.startsWith(APP_PROJECT_MY_WORK_PATH)) {
      return APP_PROJECT_MY_WORK_PATH + newSuffix;
    }
    const projectInfo = this.rootStore.projectStore.getProject(projectId);
    if (projectInfo == undefined) {
      return APP_PROJECT_HOME_PATH + newSuffix;
    }
    return APP_PROJECT_HOME_PATH + newSuffix;
  }

  pickupToolbar(history: History) {
    let backUrl = "";
    const pathname = history.location.pathname;
    if (pathname.startsWith(APP_PROJECT_HOME_PATH)) {
      backUrl = APP_PROJECT_HOME_PATH;
    } else if (pathname.startsWith(APP_PROJECT_WORK_PLAN_PATH)) {
      backUrl = APP_PROJECT_WORK_PLAN_PATH;
    } else if (pathname.startsWith(APP_PROJECT_KB_DOC_PATH)) {
      backUrl = APP_PROJECT_KB_DOC_PATH;
    } else if (pathname.startsWith(APP_PROJECT_KB_BOARD_PATH)) {
      backUrl = APP_PROJECT_KB_BOARD_PATH;
    } else if (pathname.startsWith(APP_PROJECT_MY_WORK_PATH)) {
      backUrl = APP_PROJECT_MY_WORK_PATH;
    }
    history.push(backUrl);
  }
}

export default LinkAuxStore;
