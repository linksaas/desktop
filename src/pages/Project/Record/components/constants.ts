import type { CheckboxOptionType } from 'antd';
import type { ProjectEvCfg, BookShelfEvCfg, DocEvCfg, EarthlyEvCfg, ExtEvCfg, GiteeEvCfg, GitlabEvCfg, RobotEvCfg, TestCaseEvCfg, IssueEvCfg, SpritEvCfg } from '@/api/events_subscribe';

export const projectEvOptionList: CheckboxOptionType[] = [
    {
        label: "创建项目",
        value: "createProject",
    },
    {
        label: "更新项目",
        value: "updateProject",
    },
    {
        label: "激活项目",
        value: "openProject",
    },
    {
        label: "关闭项目",
        value: "closeProject",
    },
    {
        label: "删除项目",
        value: "removeProject",
    },
    {
        label: "邀请成员",
        value: "genInvite",
    },
    {
        label: "加入项目",
        value: "joinProject",
    },
    {
        label: "离开项目",
        value: "leaveProject",
    },
    {
        label: "创建角色",
        value: "createRole",
    },
    {
        label: "更新角色",
        value: "updateRole",
    },
    {
        label: "删除角色",
        value: "removeRole",
    },
    {
        label: "更新项目成员",
        value: "updateProjectMember",
    },
    {
        label: "删除项目成员",
        value: "removeProjectMember",
    },
    {
        label: "设置成员角色",
        value: "setProjectMemberRole",
    },
    {
        label: "创建频道",
        value: "createChannel",
    },
    {
        label: "更新频道",
        value: "updateChannel",
    },
    {
        label: "激活频道",
        value: "openChannel",
    },
    {
        label: "关闭频道",
        value: "closeChannel",
    },
    {
        label: "删除频道",
        value: "removeChannel",
    },
    {
        label: "添加频道成员",
        value: "addChannelMember",
    },
    {
        label: "删除频道成员",
        value: "removeChannelMember",
    },
    {
        label: "创建评估",
        value: "createAppraise",
    },
    {
        label: "更新评估",
        value: "updateAppraise",
    },
    {
        label: "删除评估",
        value: "removeAppraise",
    },
    {
        label: "增加项目应用",
        value: "addProjectApp",
    },
    {
        label: "删除项目应用",
        value: "removeProjectApp",
    },
    {
        label: "创建目标",
        value: "createGoal",
    },
    {
        label: "更新目标",
        value: "updateGoal",
    },
    {
        label: "转移超级管理员",
        value: "changeOwner",
    },
    {
        label: "创建事件订阅",
        value: "createSubscribe",
    },
    {
        label: "修改事件订阅",
        value: "updateSubscribe",
    },
    {
        label: "删除事件订阅",
        value: "removeSubscribe",
    },
];

export const calcProjectEvCfg = (values: string[] | undefined): ProjectEvCfg => {
    const ret: ProjectEvCfg = {
        create_project: false,
        update_project: false,
        open_project: false,
        close_project: false,
        remove_project: false,
        gen_invite: false,
        join_project: false,
        leave_project: false,
        create_role: false,
        update_role: false,
        remove_role: false,
        update_project_member: false,
        remove_project_member: false,
        set_project_member_role: false,
        create_channel: false,
        update_channel: false,
        open_channel: false,
        close_channel: false,
        remove_channel: false,
        add_channel_member: false,
        remove_channel_member: false,
        create_appraise: false,
        update_appraise: false,
        remove_appraise: false,
        add_project_app: false,
        remove_project_app: false,
        create_goal: false,
        update_goal: false,
        change_owner: false,
        create_subscribe: false,
        update_subscribe: false,
        remove_subscribe: false,
    };
    if (values == undefined) {
        return ret;
    }
    values.forEach(value => {
        if (value == "createProject") {
            ret.create_project = true;
        } else if (value == "updateProject") {
            ret.update_project = true;
        } else if (value == "openProject") {
            ret.open_project = true;
        } else if (value == "closeProject") {
            ret.close_project = true;
        } else if (value == "removeProject") {
            ret.remove_project = true;
        } else if (value == "genInvite") {
            ret.gen_invite = true;
        } else if (value == "joinProject") {
            ret.join_project = true;
        } else if (value == "leaveProject") {
            ret.leave_project = true;
        } else if (value == "createRole") {
            ret.create_role = true;
        } else if (value == "updateRole") {
            ret.update_role = true;
        } else if (value == "removeRole") {
            ret.remove_role = true;
        } else if (value == "updateProjectMember") {
            ret.update_project_member = true;
        } else if (value == "removeProjectMember") {
            ret.remove_project_member = true;
        } else if (value == "setProjectMemberRole") {
            ret.set_project_member_role = true;
        } else if (value == "createChannel") {
            ret.create_channel = true;
        } else if (value == "updateChannel") {
            ret.update_channel = true;
        } else if (value == "openChannel") {
            ret.open_channel = true;
        } else if (value == "closeChannel") {
            ret.close_channel = true;
        } else if (value == "removeChannel") {
            ret.remove_channel = true;
        } else if (value == "addChannelMember") {
            ret.add_channel_member = true;
        } else if (value == "removeChannelMember") {
            ret.remove_channel_member = true;
        } else if (value == "createAppraise") {
            ret.create_appraise = true;
        } else if (value == "updateAppraise") {
            ret.update_appraise = true;
        } else if (value == "removeAppraise") {
            ret.remove_appraise = true;
        } else if (value == "addProjectApp") {
            ret.add_project_app = true;
        } else if (value == "removeProjectApp") {
            ret.remove_project_app = true;
        } else if (value == "createGoal") {
            ret.create_goal = true;
        } else if (value == "updateGoal") {
            ret.update_goal = true;
        } else if (value == "changeOwner") {
            ret.change_owner = true;
        } else if (value == "createSubscribe") {
            ret.create_subscribe = true;
        } else if (value == "updateSubscribe") {
            ret.update_subscribe = true;
        } else if (value == "removeSubscribe") {
            ret.remove_subscribe = true;
        }
    });
    return ret;
};

export const genProjectEvCfgValues = (cfg: ProjectEvCfg): string[] => {
    const retList: string[] = [];
    if (cfg.create_project) {
        retList.push("createProject");
    }
    if (cfg.update_project) {
        retList.push("updateProject");
    }
    if (cfg.open_project) {
        retList.push("openProject");
    }
    if (cfg.close_project) {
        retList.push("closeProject");
    }
    if (cfg.remove_project) {
        retList.push("removeProject");
    }
    if (cfg.gen_invite) {
        retList.push("genInvite");
    }
    if (cfg.join_project) {
        retList.push("joinProject");
    }
    if (cfg.leave_project) {
        retList.push("leaveProject");
    }
    if (cfg.create_role) {
        retList.push("createRole");
    }
    if (cfg.update_role) {
        retList.push("updateRole");
    }
    if (cfg.remove_role) {
        retList.push("removeRole");
    }
    if (cfg.update_project_member) {
        retList.push("updateProjectMember");
    }
    if (cfg.remove_project_member) {
        retList.push("removeProjectMember");
    }
    if (cfg.set_project_member_role) {
        retList.push("setProjectMemberRole");
    }
    if (cfg.create_channel) {
        retList.push("createChannel");
    }
    if (cfg.update_channel) {
        retList.push("updateChannel");
    }
    if (cfg.open_channel) {
        retList.push("openChannel");
    }
    if (cfg.close_channel) {
        retList.push("closeChannel");
    }
    if (cfg.remove_channel) {
        retList.push("removeChannel");
    }
    if (cfg.add_channel_member) {
        retList.push("addChannelMember");
    }
    if (cfg.remove_channel_member) {
        retList.push("removeChannelMember");
    }
    if (cfg.create_appraise) {
        retList.push("createAppraise");
    }
    if (cfg.update_appraise) {
        retList.push("updateAppraise");
    }
    if (cfg.remove_appraise) {
        retList.push("removeAppraise");
    }
    if (cfg.add_project_app) {
        retList.push("addProjectApp");
    }
    if (cfg.remove_project_app) {
        retList.push("removeProjectApp");
    }
    if (cfg.create_goal) {
        retList.push("createGoal");
    }
    if (cfg.update_goal) {
        retList.push("updateGoal");
    }
    if (cfg.change_owner) {
        retList.push("changeOwner");
    }
    if (cfg.create_subscribe) {
        retList.push("createSubscribe");
    }
    if (cfg.update_subscribe) {
        retList.push("updateSubscribe");
    }
    if (cfg.remove_subscribe) {
        retList.push("removeSubscribe");
    }
    return retList;
}

export const bookShelfEvOptionList: CheckboxOptionType[] = [
    {
        label: "新增电子书",
        value: "addBook",
    },
    {
        label: "删除电子书",
        value: "removeBook",
    },
];

export const calcBookShelfEvCfg = (values: string[] | undefined): BookShelfEvCfg => {
    const ret: BookShelfEvCfg = {
        add_book: false,
        remove_book: false,
    };
    if (values == undefined) {
        return ret;
    }
    values.forEach(value => {
        if (value == "addBook") {
            ret.add_book = true;
        } else if (value == "removeBook") {
            ret.remove_book = true;
        }
    })
    return ret;
};

export const genBookShelfEvCfgValues = (cfg: BookShelfEvCfg): string[] => {
    const retList: string[] = [];
    if (cfg.add_book) {
        retList.push("addBook");
    }
    if (cfg.remove_book) {
        retList.push("removeBook");
    }
    return retList;
}

export const docEvOptionList: CheckboxOptionType[] = [
    {
        label: "创建文档空间",
        value: "createSpace",
    },
    {
        label: "更新文档空间",
        value: "updateSpace",
    },
    {
        label: "删除文档空间",
        value: "removeSpace",
    },
    {
        label: "创建文档",
        value: "createDoc",
    },
    {
        label: "更新文档",
        value: "updateDoc",
    },
    {
        label: "移动到回收站",
        value: "moveDocToRecycle",
    },
    {
        label: "删除文档",
        value: "removeDoc",
    },
    {
        label: "恢复文档",
        value: "recoverDoc",
    },
    {
        label: "关注文档",
        value: "watchDoc",
    },
    {
        label: "取消关注文档",
        value: "unWatchDoc",
    },
    {
        label: "移动文档",
        value: "moveDoc",
    },
];

export const calcDocEvCfg = (values: string[] | undefined): DocEvCfg => {
    const ret: DocEvCfg = {
        create_space: false,
        update_space: false,
        remove_space: false,
        create_doc: false,
        update_doc: false,
        move_doc_to_recycle: false,
        remove_doc: false,
        recover_doc: false,
        watch_doc: false,
        un_watch_doc: false,
        move_doc: false,
    };
    if (values == undefined) {
        return ret;
    }
    values.forEach(value => {
        if (value == "createSpace") {
            ret.create_space = true;
        } else if (value == "updateSpace") {
            ret.update_space = true;
        } else if (value == "removeSpace") {
            ret.remove_space = true;
        } else if (value == "createDoc") {
            ret.create_doc = true;
        } else if (value == "updateDoc") {
            ret.update_doc = true;
        } else if (value == "moveDocToRecycle") {
            ret.move_doc_to_recycle = true;
        } else if (value == "removeDoc") {
            ret.remove_doc = true;
        } else if (value == "recoverDoc") {
            ret.recover_doc = true;
        } else if (value == "watchDoc") {
            ret.watch_doc = true;
        } else if (value == "unWatchDoc") {
            ret.un_watch_doc = true;
        } else if (value == "moveDoc") {
            ret.move_doc = true;
        }
    });
    return ret;
};

export const genDocEvCfgValues = (cfg: DocEvCfg): string[] => {
    const retList: string[] = [];
    if (cfg.create_space) {
        retList.push("createSpace");
    }
    if (cfg.update_space) {
        retList.push("updateSpace");
    }
    if (cfg.remove_space) {
        retList.push("removeSpace");
    }
    if (cfg.create_doc) {
        retList.push("createDoc");
    }
    if (cfg.update_doc) {
        retList.push("updateDoc");
    }
    if (cfg.move_doc_to_recycle) {
        retList.push("moveDocToRecycle");
    }
    if (cfg.remove_doc) {
        retList.push("removeDoc");
    }
    if (cfg.recover_doc) {
        retList.push("recoverDoc");
    }
    if (cfg.watch_doc) {
        retList.push("watchDoc");
    }
    if (cfg.un_watch_doc) {
        retList.push("unWatchDoc");
    }
    if (cfg.move_doc) {
        retList.push("moveDoc");
    }
    return retList;
}

export const earthlyEvOptionList: CheckboxOptionType[] = [
    {
        label: "创建仓库",
        value: "addRepo",
    },
    {
        label: "删除仓库",
        value: "removeRepo",
    },
    {
        label: "创建指令",
        value: "createAction",
    },
    {
        label: "更新指令",
        value: "updateAction",
    },
    {
        label: "删除指令",
        value: "removeAction",
    },
];

export const calcEarthlyEvCfg = (values: string[] | undefined): EarthlyEvCfg => {
    const ret: EarthlyEvCfg = {
        add_repo: false,
        remove_repo: false,
        create_action: false,
        update_action: false,
        remove_action: false,
    };
    if (values == undefined) {
        return ret;
    }
    values.forEach(value => {
        if (value == "addRepo") {
            ret.add_repo = true;
        } else if (value == "removeRepo") {
            ret.remove_repo = true;
        } else if (value == "createAction") {
            ret.create_action = true;
        } else if (value == "updateAction") {
            ret.update_action = true;
        } else if (value == "removeAction") {
            ret.remove_action = true;
        }
    });
    return ret;
};

export const genEarthlyEvCfgValues = (cfg: EarthlyEvCfg): string[] => {
    const retList: string[] = [];
    if (cfg.add_repo) {
        retList.push("addRepo");
    }
    if (cfg.remove_repo) {
        retList.push("removeRepo");
    }
    if (cfg.create_action) {
        retList.push("createAction");
    }
    if (cfg.update_action) {
        retList.push("updateAction");
    }
    if (cfg.remove_action) {
        retList.push("removeAction");
    }
    return retList
};

export const extEvOptionList: CheckboxOptionType[] = [
    {
        label: "创建第三方接入",
        value: "create",
    },
    {
        label: "更新第三方接入",
        value: "update",
    },
    {
        label: "获取第三方接入密钥",
        value: "getSecret",
    },
    {
        label: "删除第三方接入",
        value: "remove",
    },
    {
        label: "设置事件分发策略",
        value: "setSourceUserPolicy",
    },
];

export const calcExtEvCfg = (values: string[] | undefined): ExtEvCfg => {
    const ret: ExtEvCfg = {
        create: false,
        update: false,
        get_secret: false,
        remove: false,
        set_source_user_policy: false,
    };
    if (values == undefined) {
        return ret;
    }
    values.forEach(value => {
        if (value == "create") {
            ret.create = true;
        } else if (value == "update") {
            ret.update = true;
        } else if (value == "getSecret") {
            ret.get_secret = true;
        } else if (value == "remove") {
            ret.remove = true;
        } else if (value == "setSourceUserPolicy") {
            ret.set_source_user_policy = true;
        }
    });
    return ret;
}

export const genExtEvCfgValues = (cfg: ExtEvCfg): string[] => {
    const retList: string[] = [];
    if (cfg.create) {
        retList.push("create");
    }
    if (cfg.update) {
        retList.push("update");
    }
    if (cfg.get_secret) {
        retList.push("getSecret");
    }
    if (cfg.remove) {
        retList.push("remove");
    }
    if (cfg.set_source_user_policy) {
        retList.push("setSourceUserPolicy");
    }
    return retList;
};

export const giteeEvOptionList: CheckboxOptionType[] = [
    {
        label: "PushEvent",
        value: "push",
    },
    {
        label: "IssueEvent",
        value: "issue",
    },
    {
        label: "PullRequestEvent",
        value: "pullRequest",
    },
    {
        label: "NoteEvent",
        value: "note",
    },
];

export const calcGiteeEvCfg = (values: string[] | undefined): GiteeEvCfg => {
    const ret: GiteeEvCfg = {
        push: false,
        issue: false,
        pull_request: false,
        note: false,
    }
    if (values == undefined) {
        return ret;
    }
    values.forEach(value => {
        if (value == "push") {
            ret.push = true;
        } else if (value == "issue") {
            ret.issue = true;
        } else if (value == "pullRequest") {
            ret.pull_request = true;
        } else if (value == "note") {
            ret.note = true;
        }
    });
    return ret;
};

export const genGiteeEvCfgValues = (cfg: GiteeEvCfg): string[] => {
    const retList: string[] = [];
    if (cfg.push) {
        retList.push("push");
    }
    if (cfg.issue) {
        retList.push("issue");
    }
    if (cfg.pull_request) {
        retList.push("pullRequest");
    }
    if (cfg.note) {
        retList.push("note");
    }
    return retList;
};

export const gitlabEvOptionList: CheckboxOptionType[] = [
    {
        label: "BuildEvent",
        value: "build",
    },
    {
        label: "CommentEvent",
        value: "comment",
    },
    {
        label: "IssueEvent",
        value: "issue",
    },
    {
        label: "JobEvent",
        value: "job",
    },
    {
        label: "MergeRequestEvent",
        value: "mergeRequest",
    },
    {
        label: "PipelineEvent",
        value: "pipeline",
    },
    {
        label: "PushEvent",
        value: "push",
    },
    {
        label: "TagEvent",
        value: "tag",
    },
    {
        label: "WikiEvent",
        value: "wiki",
    },
];

export const calcGitlabEvCfg = (values: string[] | undefined): GitlabEvCfg => {
    const ret: GitlabEvCfg = {
        build: false,
        comment: false,
        issue: false,
        job: false,
        merge_request: false,
        pipeline: false,
        push: false,
        tag: false,
        wiki: false,
    };
    if (values == undefined) {
        return ret;
    }
    values.forEach(value => {
        if (value == "build") {
            ret.build = true;
        } else if (value == "comment") {
            ret.comment = true;
        } else if (value == "issue") {
            ret.issue = true;
        } else if (value == "job") {
            ret.job = true;
        } else if (value == "mergeRequest") {
            ret.merge_request = true;
        } else if (value == "pipeline") {
            ret.pipeline = true;
        } else if (value == "push") {
            ret.push = true;
        } else if (value == "tag") {
            ret.tag = true;
        } else if (value == "wiki") {
            ret.wiki = true;
        }
    });
    return ret;
};

export const genGitlabEvCfgValues = (cfg: GitlabEvCfg): string[] => {
    const retList: string[] = [];
    if (cfg.build) {
        retList.push("build");
    }
    if (cfg.comment) {
        retList.push("comment");
    }
    if (cfg.issue) {
        retList.push("issue");
    }
    if (cfg.job) {
        retList.push("job");
    }
    if (cfg.merge_request) {
        retList.push("mergeRequest");
    }
    if (cfg.pipeline) {
        retList.push("pipeline");
    }
    if (cfg.push) {
        retList.push("push");
    }
    if (cfg.tag) {
        retList.push("tag");
    }
    if (cfg.wiki) {
        retList.push("wiki");
    }
    return retList;
};

export const issueEvOptionList: CheckboxOptionType[] = [
    {
        label: "创建工单",
        value: "create",
    },
    {
        label: "更新工单",
        value: "update",
    },
    {
        label: "删除工单",
        value: "remove",
    },
    {
        label: "指派执行者",
        value: "assignExecUser",
    },
    {
        label: "指派检查者",
        value: "assignCheckUser",
    },
    {
        label: "变更状态",
        value: "changeState",
    },
    {
        label: "关联迭代",
        value: "linkSprit",
    },
    {
        label: "取消关联迭代",
        value: "cancelLinkSprit",
    },
    {
        label: "设置开始时间",
        value: "setStartTime",
    },
    {
        label: "取消开始时间",
        value: "cancelStartTime",
    },
    {
        label: "设置结束时间",
        value: "setEndTime",
    },
    {
        label: "取消结束时间",
        value: "cancelEndTime",
    },
    {
        label: "设置预估工时",
        value: "setEstimateMinutes",
    },
    {
        label: "取消预估工时",
        value: "cancelEstimateMinutes",
    },
    {
        label: "设置剩余工时",
        value: "setRemainMinutes",
    },
    {
        label: "取消剩余工时",
        value: "cancelRemainMinutes",
    },
    {
        label: "创建子工单",
        value: "createSubIssue",
    },
    {
        label: "更新子工单",
        value: "updateSubIssue",
    },
    {
        label: "更新子工单状态",
        value: "updateSubIssueState",
    },
    {
        label: "删除子工单",
        value: "removeSubIssue",
    },
    {
        label: "增加依赖工单",
        value: "addDependence",
    },
    {
        label: "删除依赖工单",
        value: "removeDependence",
    },
];

export const calcIssueEvCfg = (values: string[] | undefined): IssueEvCfg => {
    const ret: IssueEvCfg = {
        create: false,
        update: false,
        remove: false,
        assign_exec_user: false,
        assign_check_user: false,
        change_state: false,
        link_sprit: false,
        cancel_link_sprit: false,
        set_start_time: false,
        cancel_start_time: false,
        set_end_time: false,
        cancel_end_time: false,
        set_estimate_minutes: false,
        cancel_estimate_minutes: false,
        set_remain_minutes: false,
        cancel_remain_minutes: false,
        create_sub_issue: false,
        update_sub_issue: false,
        update_sub_issue_state: false,
        remove_sub_issue: false,
        add_dependence: false,
        remove_dependence: false,
    };
    if (values == undefined) {
        return ret;
    }
    values.forEach(value => {
        if (value == "create") {
            ret.create = true;
        } else if (value == "update") {
            ret.update = true;
        } else if (value == "remove") {
            ret.remove = true;
        } else if (value == "assignExecUser") {
            ret.assign_exec_user = true;
        } else if (value == "assignCheckUser") {
            ret.assign_check_user = true;
        } else if (value == "changeState") {
            ret.change_state = true;
        } else if (value == "linkSprit") {
            ret.link_sprit = true;
        } else if (value == "cancelLinkSprit") {
            ret.cancel_link_sprit = true;
        } else if (value == "setStartTime") {
            ret.set_start_time = true;
        } else if (value == "cancelStartTime") {
            ret.cancel_start_time = true;
        } else if (value == "setEndTime") {
            ret.set_end_time = true;
        } else if (value == "cancelEndTime") {
            ret.cancel_end_time = true;
        } else if (value == "setEstimateMinutes") {
            ret.set_estimate_minutes = true;
        } else if (value == "cancelEstimateMinutes") {
            ret.cancel_estimate_minutes = true;
        } else if (value == "setRemainMinutes") {
            ret.set_remain_minutes = true;
        } else if (value == "cancelRemainMinutes") {
            ret.cancel_remain_minutes = true;
        } else if (value == "createSubIssue") {
            ret.create_sub_issue = true;
        } else if (value == "updateSubIssue") {
            ret.update_sub_issue = true;
        } else if (value == "updateSubIssueState") {
            ret.update_sub_issue_state = true;
        } else if (value == "removeSubIssue") {
            ret.remove_sub_issue = true;
        } else if (value == "addDependence") {
            ret.add_dependence = true;
        } else if (value == "removeDependence") {
            ret.remove_dependence = true;
        }
    });
    return ret;
};

export const genIssueEvCfgValues = (cfg: IssueEvCfg): string[] => {
    const retList: string[] = [];
    if (cfg.create) {
        retList.push("create");
    }
    if (cfg.update) {
        retList.push("update");
    }
    if (cfg.remove) {
        retList.push("remove");
    }
    if (cfg.assign_exec_user) {
        retList.push("assignExecUser");
    }
    if (cfg.assign_check_user) {
        retList.push("assignCheckUser");
    }
    if (cfg.change_state) {
        retList.push("changeState");
    }
    if (cfg.link_sprit) {
        retList.push("linkSprit");
    }
    if (cfg.cancel_link_sprit) {
        retList.push("cancelLinkSprit");
    }
    if (cfg.set_start_time) {
        retList.push("setStartTime");
    }
    if (cfg.cancel_start_time) {
        retList.push("cancelStartTime");
    }
    if (cfg.set_end_time) {
        retList.push("setEndTime");
    }
    if (cfg.cancel_end_time) {
        retList.push("cancelEndTime");
    }
    if (cfg.set_estimate_minutes) {
        retList.push("setEstimateMinutes");
    }
    if (cfg.cancel_estimate_minutes) {
        retList.push("cancelEstimateMinutes");
    }
    if (cfg.set_remain_minutes) {
        retList.push("setRemainMinutes");
    }
    if (cfg.cancel_remain_minutes) {
        retList.push("cancelRemainMinutes");
    }
    if (cfg.create_sub_issue) {
        retList.push("createSubIssue");
    }
    if (cfg.update_sub_issue) {
        retList.push("updateSubIssue");
    }
    if (cfg.update_sub_issue_state) {
        retList.push("updateSubIssueState");
    }
    if (cfg.remove_sub_issue) {
        retList.push("removeSubIssue");
    }
    if (cfg.add_dependence) {
        retList.push("addDependence");
    }
    if (cfg.remove_dependence) {
        retList.push("removeDependence");
    }
    return retList;
};

export const robotEvOptionList: CheckboxOptionType[] = [
    {
        label: "创建服务器代理",
        value: "create",
    },
    {
        label: "更新服务器代理",
        value: "update",
    },
    {
        label: "删除服务器代理",
        value: "remove",
    },
    {
        label: "增加访问用户",
        value: "addAccessUser",
    },
    {
        label: "删除访问用户",
        value: "removeAccessUser",
    },
    {
        label: "更新服务器代理令牌",
        value: "renewToken",
    },
];

export const calcRobotEvCfg = (values: string[] | undefined): RobotEvCfg => {
    const ret: RobotEvCfg = {
        create: false,
        update: false,
        remove: false,
        add_access_user: false,
        remove_access_user: false,
        renew_token: false,
    };
    if (values == undefined) {
        return ret;
    }
    values.forEach(value => {
        if (value == "create") {
            ret.create = true;
        } else if (value == "update") {
            ret.update = true;
        } else if (value == "remove") {
            ret.remove = true;
        } else if (value == "addAccessUser") {
            ret.add_access_user = true;
        } else if (value == "removeAccessUser") {
            ret.remove_access_user = true;
        } else if (value == "renewToken") {
            ret.renew_token = true;
        }
    });
    return ret;
};

export const genRobotEvCfgValues = (cfg: RobotEvCfg): string[] => {
    const retList: string[] = [];
    if (cfg.create) {
        retList.push("create");
    }
    if (cfg.update) {
        retList.push("update");
    }
    if (cfg.remove) {
        retList.push("remove");
    }
    if (cfg.add_access_user) {
        retList.push("addAccessUser");
    }
    if (cfg.remove_access_user) {
        retList.push("removeAccessUser");
    }
    if (cfg.renew_token) {
        retList.push("renewToken");
    }
    return retList;
};

export const spritEvOptionList: CheckboxOptionType[] = [
    {
        label: "创建迭代",
        value: "create",
    },
    {
        label: "更新迭代",
        value: "update",
    },
    {
        label: "删除迭代",
        value: "remove",
    },
    {
        label: "关联文档",
        value: "linkDoc",
    },
    {
        label: "取消关联文档",
        value: "cancelLinkDoc",
    },
    {
        label: "关联频道",
        value: "linkChannel",
    },
    {
        label: "取消关联文档",
        value: "cancelLinkChannel",
    },
];

export const calcSpritEvCfg = (values: string[] | undefined): SpritEvCfg => {
    const ret: SpritEvCfg = {
        create: false,
        update: false,
        remove: false,
        link_doc: false,
        cancel_link_doc: false,
        link_channel: false,
        cancel_link_channel: false,
    };
    if (values == undefined) {
        return ret;
    }
    values.forEach(value => {
        if (value == "create") {
            ret.create = true;
        } else if (value == "update") {
            ret.update = true;
        } else if (value == "remove") {
            ret.remove = true;
        } else if (value == "linkDoc") {
            ret.link_doc = true;
        } else if (value == "cancelLinkDoc") {
            ret.cancel_link_doc = true;
        } else if (value == "linkChannel") {
            ret.link_channel = true;
        } else if (value == "cancelLinkChannel") {
            ret.cancel_link_channel = true;
        }
    });
    return ret;
};

export const genSpritEvCfgValues = (cfg: SpritEvCfg): string[] => {
    const retList: string[] = [];
    if (cfg.create) {
        retList.push("create");
    }
    if (cfg.update) {
        retList.push("update");
    }
    if (cfg.remove) {
        retList.push("remove");
    }
    if (cfg.link_doc) {
        retList.push("linkDoc");
    }
    if (cfg.cancel_link_doc) {
        retList.push("cancelLinkDoc");
    }
    if (cfg.link_channel) {
        retList.push("linkChannel");
    }
    if (cfg.cancel_link_channel) {
        retList.push("cancelLinkChannel");
    }
    return retList;
};

export const testCaseEvOptionList: CheckboxOptionType[] = [
    {
        label: "创建节点",
        value: "createEntry",
    },
    {
        label: "移动节点",
        value: "moveEntry",
    },
    {
        label: "更新节点标题",
        value: "updateEntryTitle",
    },
    {
        label: "删除节点",
        value: "removeEntry",
    },
    {
        label: "增加验证规则",
        value: "addRule",
    },
    {
        label: "更新验证规则",
        value: "updateRule",
    },
    {
        label: "删除验证规则",
        value: "removeRule",
    },
    {
        label: "新增测试指标",
        value: "addMetric",
    },
    {
        label: "更新测试指标",
        value: "updateMetric",
    },
    {
        label: "删除测试指标",
        value: "removeMetric",
    },
    {
        label: "更新测试步骤",
        value: "updateContent",
    },
];

export const calcTestCaseEvCfg = (values: string[] | undefined): TestCaseEvCfg => {
    const ret: TestCaseEvCfg = {
        create_entry: false,
        move_entry: false,
        update_entry_title: false,
        remove_entry: false,
        add_rule: false,
        update_rule: false,
        remove_rule: false,
        add_metric: false,
        update_metric: false,
        remove_metric: false,
        update_content: false,
    };
    if (values == undefined) {
        return ret;
    }
    values.forEach(value => {
        if (value == "createEntry") {
            ret.create_entry = true;
        } else if (value == "moveEntry") {
            ret.move_entry = true;
        } else if (value == "updateEntryTitle") {
            ret.update_entry_title = true;
        } else if (value == "removeEntry") {
            ret.remove_entry = true;
        } else if (value == "addRule") {
            ret.add_rule = true;
        } else if (value == "updateRule") {
            ret.update_rule = true;
        } else if (value == "removeRule") {
            ret.remove_rule = true;
        } else if (value == "addMetric") {
            ret.add_metric = true;
        } else if (value == "updateMetric") {
            ret.update_metric = true;
        } else if (value == "removeMetric") {
            ret.remove_metric = true;
        } else if (value == "updateContent") {
            ret.update_content = true;
        }
    });
    return ret;
};

export const genTestCaseEvCfgValues = (cfg: TestCaseEvCfg): string[] => {
    const retList: string[] = [];
    if (cfg.create_entry) {
        retList.push("createEntry");
    }
    if (cfg.move_entry) {
        retList.push("moveEntry");
    }
    if (cfg.update_entry_title) {
        retList.push("updateEntryTitle");
    }
    if (cfg.remove_entry) {
        retList.push("removeEntry");
    }
    if (cfg.add_rule) {
        retList.push("addRule");
    }
    if (cfg.update_rule) {
        retList.push("updateRule");
    }
    if (cfg.remove_rule) {
        retList.push("removeRule");
    }
    if (cfg.add_metric) {
        retList.push("addMetric");
    }
    if (cfg.update_metric) {
        retList.push("updateMetric");
    }
    if (cfg.remove_metric) {
        retList.push("removeMetric");
    }
    if (cfg.update_content) {
        retList.push("updateContent");
    }
    return retList;
};