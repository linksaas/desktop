//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import * as es from '../events_subscribe';
import type { PluginEvent } from '../events';
import type { LinkInfo } from '@/stores/linkAux';
import {
    LinkNoneInfo, LinkProjectInfo,
    LinkEntryInfo,
    LinkRequirementInfo,
    LinkTaskInfo,
    LinkBugInfo,
} from '@/stores/linkAux';
import { WATCH_TARGET_BUG, WATCH_TARGET_ENTRY, WATCH_TARGET_REQUIRE_MENT, WATCH_TARGET_TASK, WATCH_TARGET_TEST_CASE, type WATCH_TARGET_TYPE } from '../project_watch';
import type { RECYCLE_ITEM_TYPE } from '../project_recycle';
import {
    RECYCLE_ITEM_API_COLL, RECYCLE_ITEM_BOARD, RECYCLE_ITEM_BUG, RECYCLE_ITEM_BULLETIN, RECYCLE_ITEM_DATA_ANNO, RECYCLE_ITEM_DOC, RECYCLE_ITEM_FILE,
    RECYCLE_ITEM_IDEA, RECYCLE_ITEM_PAGES, RECYCLE_ITEM_REQUIREMENT, RECYCLE_ITEM_SPRIT, RECYCLE_ITEM_TASK, RECYCLE_ITEM_TESTCASE
} from '../project_recycle';

function get_chat_bot_type_str(chat_bot_type: number): string {
    if (chat_bot_type == es.CHAT_BOT_QYWX) {
        return "企业微信";
    } else if (chat_bot_type == es.CHAT_BOT_DING) {
        return "钉钉";
    } else if (chat_bot_type == es.CHAT_BOT_FS) {
        return "飞书";
    }
    return "";
}

function getTargetTypeStr(targetType: WATCH_TARGET_TYPE): string {
    if (targetType == WATCH_TARGET_ENTRY) {
        return "内容";
    }
    if (targetType == WATCH_TARGET_REQUIRE_MENT) {
        return "项目需求";
    }
    if (targetType == WATCH_TARGET_TASK) {
        return "任务";
    }
    if (targetType == WATCH_TARGET_BUG) {
        return "缺陷";
    }
    if (targetType == WATCH_TARGET_TEST_CASE) {
        return "测试用例";
    }
    return "";
}

function getTargetLinkInfo(projectId: string, targetType: WATCH_TARGET_TYPE, targetId: string, targetTitle: string): LinkInfo {
    if (targetType == WATCH_TARGET_ENTRY) {
        return new LinkEntryInfo(targetTitle, projectId, targetId);
    }
    if (targetType == WATCH_TARGET_REQUIRE_MENT) {
        return new LinkRequirementInfo(targetTitle, projectId, targetId);
    }
    if (targetType == WATCH_TARGET_TASK) {
        return new LinkTaskInfo(targetTitle, projectId, targetId);
    }
    if (targetType == WATCH_TARGET_BUG) {
        return new LinkBugInfo(targetTitle, projectId, targetId);
    }
    return new LinkNoneInfo("");
}

function getRecycleTypeName(itemType: RECYCLE_ITEM_TYPE): string {
    if (itemType == RECYCLE_ITEM_IDEA) {
        return "知识点";
    } else if (itemType == RECYCLE_ITEM_REQUIREMENT) {
        return "项目需求";
    } else if (itemType == RECYCLE_ITEM_TASK) {
        return "任务";
    } else if (itemType == RECYCLE_ITEM_BUG) {
        return "缺陷";
    } else if (itemType == RECYCLE_ITEM_TESTCASE) {
        return "测试用例";
    } else if (itemType == RECYCLE_ITEM_BULLETIN) {
        return "项目公告";
    } else if (itemType == RECYCLE_ITEM_SPRIT) {
        return "工作计划";
    } else if (itemType == RECYCLE_ITEM_DOC) {
        return "项目文档";
    } else if (itemType == RECYCLE_ITEM_PAGES) {
        return "静态页面";
    } else if (itemType == RECYCLE_ITEM_BOARD) {
        return "信息面板";
    } else if (itemType == RECYCLE_ITEM_FILE) {
        return "文件";
    } else if (itemType == RECYCLE_ITEM_API_COLL) {
        return "接口集合";
    } else if (itemType == RECYCLE_ITEM_DATA_ANNO) {
        return "数据标注";
    } else {
        return "";
    }
}

/*
 *  项目相关的事件定义
 */
export type CreateProjectEvent = {};
function get_create_simple_content(
    ev: PluginEvent,
    skip_prj_name: boolean,
    // inner: CreateProjectEvent,
): LinkInfo[] {
    const ret_list: LinkInfo[] = [new LinkNoneInfo('创建项目')];
    if (!skip_prj_name) {
        ret_list.push(new LinkProjectInfo(ev.project_name, ev.project_id));
    }
    return ret_list;
}
export type UpdateProjectEvent = {
    new_project_name: string;
};
function get_update_simple_content(
    ev: PluginEvent,
    skip_prj_name: boolean,
    inner: UpdateProjectEvent,
): LinkInfo[] {
    const ret_list: LinkInfo[] = [new LinkNoneInfo('修改项目')];
    if (!skip_prj_name) {
        ret_list.push(new LinkProjectInfo(ev.project_name, ev.project_id));
    }
    if (inner.new_project_name != ev.project_name) {
        ret_list.push(
            new LinkNoneInfo(`新项目名 ${inner.new_project_name}`)
        );
    }
    return ret_list;
}
export type OpenProjectEvent = {};
function get_open_simple_content(
    ev: PluginEvent,
    skip_prj_name: boolean,
    // inner: OpenProjectEvent,
): LinkInfo[] {
    const ret_list: LinkInfo[] = [new LinkNoneInfo('激活项目')];
    if (!skip_prj_name) {
        ret_list.push(new LinkProjectInfo(ev.project_name, ev.project_id));
    }
    return ret_list;
}

export type CloseProjectEvent = {};
function get_close_simple_content(
    ev: PluginEvent,
    skip_prj_name: boolean,
    // inner: CloseProjectEvent,
): LinkInfo[] {
    const ret_list: LinkInfo[] = [new LinkNoneInfo('关闭项目')];
    if (!skip_prj_name) {
        ret_list.push(new LinkProjectInfo(ev.project_name, ev.project_id));
    }
    return ret_list;
}

export type RemoveProjectEvent = {};
function get_remove_simple_content(
    ev: PluginEvent,
    skip_prj_name: boolean,
    // inner: RemoveProjectEvent,
): LinkInfo[] {
    const ret_list: LinkInfo[] = [new LinkNoneInfo('删除项目')];
    if (!skip_prj_name) {
        ret_list.push(new LinkProjectInfo(ev.project_name, ev.project_id));
    }
    return ret_list;
}

export type GenInviteEvent = {};
function get_gen_invite_simple_content(
    ev: PluginEvent,
    skip_prj_name: boolean,
    // inner: GenInviteEvent,
): LinkInfo[] {
    const ret_list = [
        new LinkNoneInfo(`${skip_prj_name ? '' : ev.project_name} 发送加入项目邀请`),
    ];
    return ret_list;
}
export type JoinProjectEvent = {};
function get_join_simple_content(
    ev: PluginEvent,
    skip_prj_name: boolean,
    // inner: JoinProjectEvent,
): LinkInfo[] {
    const ret_list = [
        new LinkNoneInfo(`${skip_prj_name ? '' : ev.project_name} 加入项目`),
    ];
    return ret_list;
}
export type LeaveProjectEvent = {};
function get_leave_simple_content(
    ev: PluginEvent,
    skip_prj_name: boolean,
    // inner: LeaveProjectEvent,
): LinkInfo[] {
    const ret_list: LinkInfo[] = [new LinkNoneInfo('离开项目')];
    if (!skip_prj_name) {
        ret_list.push(new LinkProjectInfo(ev.project_name, ev.project_id));
    }
    return ret_list;
}

export type CreateRoleEvent = {
    role_id: string;
    role_name: string;
};

function get_create_role_simple_content(
    ev: PluginEvent,
    skip_prj_name: boolean,
    inner: CreateRoleEvent,
): LinkInfo[] {
    return [
        new LinkNoneInfo(`${skip_prj_name ? '' : ev.project_name} 创建项目角色`),
        new LinkNoneInfo(` ${inner.role_name}`),
    ];
}

export type UpdateRoleEvent = {
    role_id: string;
    old_role_name: string;
    new_role_name: string;
};

function get_update_role_simple_content(
    ev: PluginEvent,
    skip_prj_name: boolean,
    inner: UpdateRoleEvent,
): LinkInfo[] {
    const ret_list = [
        new LinkNoneInfo(`${skip_prj_name ? '' : ev.project_name} 更新项目角色`),
        new LinkNoneInfo(` ${inner.old_role_name}`)
    ];
    if (inner.old_role_name != inner.new_role_name) {
        ret_list.push(new LinkNoneInfo(`新角色 ${inner.new_role_name}`));
    }
    return ret_list;
}

export type RemoveRoleEvent = {
    role_id: string;
    role_name: string;
};

function get_remove_role_simple_content(
    ev: PluginEvent,
    skip_prj_name: boolean,
    inner: RemoveRoleEvent,
): LinkInfo[] {
    return [
        new LinkNoneInfo(`${skip_prj_name ? '' : ev.project_name} 删除项目角色`),
        new LinkNoneInfo(` ${inner.role_name}`),
    ];
}

export type UpdateProjectMemberEvent = {
    member_user_id: string;
    old_member_display_name: string;
    new_member_display_name: string;
};
function get_update_prj_member_simple_content(
    ev: PluginEvent,
    skip_prj_name: boolean,
    inner: UpdateProjectMemberEvent,
): LinkInfo[] {
    const ret_list = [
        new LinkNoneInfo(`${skip_prj_name ? '' : ev.project_name} 更新项目成员`),
        new LinkNoneInfo(`${inner.old_member_display_name}`),
    ];
    if (inner.old_member_display_name != inner.new_member_display_name) {
        ret_list.push(new LinkNoneInfo(`新名称 ${inner.new_member_display_name}`));
    }
    return ret_list;
}
export type RemoveProjectMemberEvent = {
    member_user_id: string;
    member_display_name: string;
};
function get_remove_prj_member_simple_content(
    ev: PluginEvent,
    skip_prj_name: boolean,
    inner: RemoveProjectMemberEvent,
): LinkInfo[] {
    return [
        new LinkNoneInfo(`${skip_prj_name ? '' : ev.project_name} 删除项目成员 ${inner.member_display_name}`)
    ];
}
export type SetProjectMemberRoleEvent = {
    role_id: string;
    role_name: string;
    member_user_id: string;
    member_display_name: string;
};
function get_set_role_simple_content(
    ev: PluginEvent,
    skip_prj_name: boolean,
    inner: SetProjectMemberRoleEvent,
): LinkInfo[] {
    return [
        new LinkNoneInfo(`${skip_prj_name ? '' : ev.project_name} 更新项目成员角色`),
        new LinkNoneInfo(` ${inner.member_display_name}`),
        new LinkNoneInfo(` ${inner.role_name}`),
    ];
}

export type ChangeOwnerEvent = {
    member_user_id: string;
    member_display_name: string;
};

function get_change_owner_simple_content(
    ev: PluginEvent,
    skip_prj_name: boolean,
    inner: ChangeOwnerEvent,
): LinkInfo[] {
    return [new LinkNoneInfo(`${skip_prj_name ? '' : ev.project_name} 转移超级管理员给 ${inner.member_display_name}`)];
}

export type CreateEventSubscribeEvent = {
    subscribe_id: string;
    chat_bot_type: number;
    chat_bot_name: string;
}

function get_create_subscribe_simple_content(
    ev: PluginEvent,
    skip_prj_name: boolean,
    inner: CreateEventSubscribeEvent,
): LinkInfo[] {
    return [new LinkNoneInfo(`${skip_prj_name ? '' : ev.project_name} 创建事件订阅 ${get_chat_bot_type_str(inner.chat_bot_type)} ${inner.chat_bot_name}`)];
}

export type UpdateEventSubscribeEvent = {
    subscribe_id: string;
    chat_bot_type: number;
    old_chat_bot_name: string;
    new_chat_bot_name: string;
};

function get_update_subscribe_simple_content(
    ev: PluginEvent,
    skip_prj_name: boolean,
    inner: UpdateEventSubscribeEvent,
): LinkInfo[] {
    return [new LinkNoneInfo(`${skip_prj_name ? '' : ev.project_name} 更新事件订阅 ${get_chat_bot_type_str(inner.chat_bot_type)} ${inner.new_chat_bot_name} 原标题 ${inner.old_chat_bot_name}`)];
}

export type RemoveEventSubscribeEvent = {
    subscribe_id: string;
    chat_bot_type: number;
    chat_bot_name: string;
};

function get_remove_subscribe_simple_content(
    ev: PluginEvent,
    skip_prj_name: boolean,
    inner: RemoveEventSubscribeEvent,
): LinkInfo[] {
    return [new LinkNoneInfo(`${skip_prj_name ? '' : ev.project_name} 删除事件订阅 ${get_chat_bot_type_str(inner.chat_bot_type)} ${inner.chat_bot_name}`)];
}

export type SetAlarmConfigEvent = {};

function get_set_alarm_config_simple_content(
    ev: PluginEvent,
    skip_prj_name: boolean,
    // inner: SetAlarmConfigEvent
): LinkInfo[] {
    return [
        new LinkNoneInfo(`${skip_prj_name ? '' : ev.project_name} 更新项目预警设置`),
    ];
}

export type CustomEvent = {
    event_type: string;
    event_content: string;
};

function get_custom_simple_content(
    ev: PluginEvent,
    skip_prj_name: boolean,
    inner: CustomEvent,
): LinkInfo[] {
    return [
        new LinkNoneInfo(`${skip_prj_name ? '' : ev.project_name} ${inner.event_type}:${inner.event_content}`),
    ];
}

export type WatchEvent = {
    target_type: WATCH_TARGET_TYPE;
    target_id: string;
    target_title: string;
};

function get_watch_simple_content(
    ev: PluginEvent,
    skip_prj_name: boolean,
    inner: WatchEvent,
): LinkInfo[] {
    return [
        new LinkNoneInfo(`${skip_prj_name ? '' : ev.project_name} 关注 ${getTargetTypeStr(inner.target_type)}`),
        getTargetLinkInfo(ev.project_id, inner.target_type, inner.target_id, inner.target_title),
    ];
}

export type UnwatchEvent = {
    target_type: WATCH_TARGET_TYPE;
    target_id: string;
    target_title: string;
};

function get_unwatch_simple_content(
    ev: PluginEvent,
    skip_prj_name: boolean,
    inner: UnwatchEvent,
): LinkInfo[] {
    return [
        new LinkNoneInfo(`${skip_prj_name ? '' : ev.project_name} ${getTargetTypeStr(inner.target_type)}`),
        getTargetLinkInfo(ev.project_id, inner.target_type, inner.target_id, inner.target_title),
    ];
}

export type RecoverFromRecycleEvent = {
    recycle_item_id: string;
    recycle_item_type: number;
    title: string;
};

function get_recover_from_recycle_simple_content(
    ev: PluginEvent,
    skip_prj_name: boolean,
    inner: RecoverFromRecycleEvent,
): LinkInfo[] {
    return [
        new LinkNoneInfo(`${skip_prj_name ? '' : ev.project_name} 从回收站 恢复 ${getRecycleTypeName(inner.recycle_item_type)} ${inner.title}`),
    ];
}

export type RemoveFromRecycleEvent = {
    recycle_item_id: string;
    recycle_item_type: number;
    title: string;
};


function get_remove_from_recycle_simple_content(
    ev: PluginEvent,
    skip_prj_name: boolean,
    inner: RemoveFromRecycleEvent,
): LinkInfo[] {
    return [
        new LinkNoneInfo(`${skip_prj_name ? '' : ev.project_name} 从回收站 删除 ${getRecycleTypeName(inner.recycle_item_type)} ${inner.title}`),
    ];
}

export type ClearFromRecycleEvent = {
    recycle_item_type_list: number[];
};

function get_clear_from_recycle_simple_content(
    ev: PluginEvent,
    skip_prj_name: boolean,
    inner: ClearFromRecycleEvent,
): LinkInfo[] {
    const tmpTypeNameList: string[] = [];
    for (const itemType of inner.recycle_item_type_list) {
        tmpTypeNameList.push(getRecycleTypeName(itemType));
    }
    return [
        new LinkNoneInfo(`${skip_prj_name ? '' : ev.project_name} 从回收站 清空 ${tmpTypeNameList.join(",")}`),
    ];
}

export type AllProjectEvent = {
    CreateProjectEvent?: CreateProjectEvent;
    UpdateProjectEvent?: UpdateProjectEvent;
    OpenProjectEvent?: OpenProjectEvent;
    CloseProjectEvent?: CloseProjectEvent;
    RemoveProjectEvent?: RemoveProjectEvent;
    GenInviteEvent?: GenInviteEvent;
    JoinProjectEvent?: JoinProjectEvent;
    LeaveProjectEvent?: LeaveProjectEvent;
    CreateRoleEvent?: CreateRoleEvent;
    UpdateRoleEvent?: UpdateRoleEvent;
    RemoveRoleEvent?: RemoveRoleEvent;
    UpdateProjectMemberEvent?: UpdateProjectMemberEvent;
    RemoveProjectMemberEvent?: RemoveProjectMemberEvent;
    SetProjectMemberRoleEvent?: SetProjectMemberRoleEvent;
    ChangeOwnerEvent?: ChangeOwnerEvent;
    CreateEventSubscribeEvent?: CreateEventSubscribeEvent;
    UpdateEventSubscribeEvent?: UpdateEventSubscribeEvent;
    RemoveEventSubscribeEvent?: RemoveEventSubscribeEvent;
    SetAlarmConfigEvent?: SetAlarmConfigEvent;
    CustomEvent?: CustomEvent;

    WatchEvent?: WatchEvent;
    UnwatchEvent?: UnwatchEvent;
    RecoverFromRecycleEvent?: RecoverFromRecycleEvent;
    RemoveFromRecycleEvent?: RemoveFromRecycleEvent;
    ClearFromRecycleEvent?: ClearFromRecycleEvent;
};

export function get_project_simple_content(
    ev: PluginEvent,
    skip_prj_name: boolean,
    inner: AllProjectEvent,
): LinkInfo[] {
    if (inner.CreateProjectEvent !== undefined) {
        return get_create_simple_content(ev, skip_prj_name);
    } else if (inner.RemoveProjectEvent !== undefined) {
        return get_remove_simple_content(ev, skip_prj_name);
    } else if (inner.UpdateProjectEvent !== undefined) {
        return get_update_simple_content(ev, skip_prj_name, inner.UpdateProjectEvent);
    } else if (inner.OpenProjectEvent !== undefined) {
        return get_open_simple_content(ev, skip_prj_name);
    } else if (inner.CloseProjectEvent !== undefined) {
        return get_close_simple_content(ev, skip_prj_name);
    } else if (inner.GenInviteEvent !== undefined) {
        return get_gen_invite_simple_content(ev, skip_prj_name);
    } else if (inner.JoinProjectEvent !== undefined) {
        return get_join_simple_content(ev, skip_prj_name);
    } else if (inner.LeaveProjectEvent !== undefined) {
        return get_leave_simple_content(ev, skip_prj_name);
    } else if (inner.CreateRoleEvent !== undefined) {
        return get_create_role_simple_content(ev, skip_prj_name, inner.CreateRoleEvent);
    } else if (inner.UpdateRoleEvent !== undefined) {
        return get_update_role_simple_content(ev, skip_prj_name, inner.UpdateRoleEvent);
    } else if (inner.RemoveRoleEvent !== undefined) {
        return get_remove_role_simple_content(ev, skip_prj_name, inner.RemoveRoleEvent);
    } else if (inner.UpdateProjectMemberEvent !== undefined) {
        return get_update_prj_member_simple_content(
            ev,
            skip_prj_name,
            inner.UpdateProjectMemberEvent,
        );
    } else if (inner.RemoveProjectMemberEvent !== undefined) {
        return get_remove_prj_member_simple_content(
            ev,
            skip_prj_name,
            inner.RemoveProjectMemberEvent,
        );
    } else if (inner.SetProjectMemberRoleEvent !== undefined) {
        return get_set_role_simple_content(ev, skip_prj_name, inner.SetProjectMemberRoleEvent);
    } else if (inner.ChangeOwnerEvent !== undefined) {
        return get_change_owner_simple_content(ev, skip_prj_name, inner.ChangeOwnerEvent);
    } else if (inner.CreateEventSubscribeEvent !== undefined) {
        return get_create_subscribe_simple_content(ev, skip_prj_name, inner.CreateEventSubscribeEvent);
    } else if (inner.UpdateEventSubscribeEvent !== undefined) {
        return get_update_subscribe_simple_content(ev, skip_prj_name, inner.UpdateEventSubscribeEvent);
    } else if (inner.RemoveEventSubscribeEvent !== undefined) {
        return get_remove_subscribe_simple_content(ev, skip_prj_name, inner.RemoveEventSubscribeEvent);
    } else if (inner.SetAlarmConfigEvent !== undefined) {
        return get_set_alarm_config_simple_content(ev, skip_prj_name);
    } else if (inner.CustomEvent !== undefined) {
        return get_custom_simple_content(ev, skip_prj_name, inner.CustomEvent);
    } else if (inner.WatchEvent !== undefined) {
        return get_watch_simple_content(ev, skip_prj_name, inner.WatchEvent);
    } else if (inner.UnwatchEvent !== undefined) {
        return get_unwatch_simple_content(ev, skip_prj_name, inner.UnwatchEvent);
    } else if (inner.RecoverFromRecycleEvent !== undefined) {
        return get_recover_from_recycle_simple_content(ev, skip_prj_name, inner.RecoverFromRecycleEvent);
    } else if (inner.RemoveFromRecycleEvent !== undefined) {
        return get_remove_from_recycle_simple_content(ev, skip_prj_name, inner.RemoveFromRecycleEvent);
    } else if (inner.ClearFromRecycleEvent !== undefined) {
        return get_clear_from_recycle_simple_content(ev, skip_prj_name, inner.ClearFromRecycleEvent);
    } else {
        return [new LinkNoneInfo('未知事件')];
    }
}