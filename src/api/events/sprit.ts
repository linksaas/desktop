import type { PluginEvent } from '../events';
import type { LinkInfo } from '@/stores/linkAux';
import {
  LinkNoneInfo,
  LinkSpritInfo,  LinkDocInfo,
} from '@/stores/linkAux';

import moment from 'moment';

export type CreateEvent = {
    sprit_id: string;
    title: string;
    start_time: number;
    end_time: number;
  };

  function get_create_simple_content(
    ev: PluginEvent,
    skip_prj_name: boolean,
    inner: CreateEvent,
  ): LinkInfo[] {
    return [
      new LinkNoneInfo(`${skip_prj_name ? '' : ev.project_name} 创建工作计划`),
      new LinkSpritInfo(inner.title, ev.project_id, inner.sprit_id),
      new LinkNoneInfo(`工作计划时间 ${moment(inner.start_time).format("YYYY-MM-DD")} 至 ${moment(inner.end_time).format("YYYY-MM-DD")}`),
    ];
  }

  export type UpdateEvent = {
    sprit_id: string;
    old_title: string;
    new_title: string;
    old_start_time: number;
    new_start_time: number;
    old_end_time: number;
    new_end_time: number;
  };

  function get_update_simple_content(
    ev: PluginEvent,
    skip_prj_name: boolean,
    inner: UpdateEvent,
  ): LinkInfo[] {
    const ret_list = [
      new LinkNoneInfo(`${skip_prj_name ? '' : ev.project_name} 更新工作计划`),
      new LinkSpritInfo(inner.new_title, ev.project_id, inner.sprit_id),
    ];
    if (inner.old_title != inner.new_title) {
      ret_list.push(new LinkNoneInfo(`老标题 ${inner.old_title}`));
    }
    const oldStartTime = moment(inner.old_start_time).format("YYYY-MM-DD");
    const newStartTime = moment(inner.new_start_time).format("YYYY-MM-DD");
    if (oldStartTime != newStartTime) {
      ret_list.push(new LinkNoneInfo(`开始时间从${oldStartTime}调整到${newStartTime}`));
    }
    const oldEndTime = moment(inner.old_end_time).format("YYYY-MM-DD");
    const newEndTime = moment(inner.new_end_time).format("YYYY-MM-DD");
    if (oldEndTime != newEndTime) {
      ret_list.push(new LinkNoneInfo(`结束时间从${oldEndTime}调整到${newEndTime}`));
    }
    return ret_list;
  }

  export type RemoveEvent = {
    sprit_id: string;
    title: string;
    start_time: number;
    end_time: number;
  };

  function get_remove_simple_content(
    ev: PluginEvent,
    skip_prj_name: boolean,
    inner: RemoveEvent,
  ): LinkInfo[] {
    return [
      new LinkNoneInfo(`${skip_prj_name ? '' : ev.project_name} 删除工作计划`),
      new LinkNoneInfo(inner.title),
      new LinkNoneInfo(`(${moment(inner.start_time).format("YYYY-MM-DD")}-${moment(inner.end_time).format("YYYY-MM-DD")})`),
    ];
  }

  export type LinkDocEvent = {
    sprit_id: string;
    sprit_title: string;
    doc_id: string;
    doc_title: string;
  };

  function get_link_doc_simple_content(
    ev: PluginEvent,
    skip_prj_name: boolean,
    inner: LinkDocEvent,
  ): LinkInfo[] {
    return [
      new LinkNoneInfo(`${skip_prj_name ? '' : ev.project_name} 关联工作计划`),
      new LinkSpritInfo(inner.sprit_title, ev.project_id, inner.sprit_id),
      new LinkNoneInfo("和文档"),
      new LinkDocInfo(inner.doc_title, ev.project_id, "", inner.doc_id),
    ];
  }

  export type CancelLinkDocEvent = {
    sprit_id: string;
    sprit_title: string;
    doc_id: string;
    doc_title: string;
  }

  function get_cancel_link_doc_simple_content(
    ev: PluginEvent,
    skip_prj_name: boolean,
    inner: CancelLinkDocEvent,
  ): LinkInfo[] {
    return [
      new LinkNoneInfo(`${skip_prj_name ? '' : ev.project_name} 取消工作计划`),
      new LinkSpritInfo(inner.sprit_title, ev.project_id, inner.sprit_id),
      new LinkNoneInfo("和文档"),
      new LinkDocInfo(inner.doc_title, ev.project_id, "", inner.doc_id),
      new LinkNoneInfo("关联"),
    ];
  }

  export type AllSpritEvent = {
    CreateEvent?: CreateEvent;
    UpdateEvent?: UpdateEvent;
    RemoveEvent?: RemoveEvent;
    LinkDocEvent?: LinkDocEvent;
    CancelLinkDocEvent?: CancelLinkDocEvent;
  };

  export function get_sprit_simple_content(
    ev: PluginEvent,
    skip_prj_name: boolean,
    inner: AllSpritEvent,
  ): LinkInfo[] {
    if (inner.CreateEvent !== undefined) {
      return get_create_simple_content(ev, skip_prj_name, inner.CreateEvent);
    } else if (inner.UpdateEvent !== undefined) {
      return get_update_simple_content(ev, skip_prj_name, inner.UpdateEvent);
    } else if (inner.RemoveEvent !== undefined) {
      return get_remove_simple_content(ev, skip_prj_name, inner.RemoveEvent);
    } else if (inner.LinkDocEvent !== undefined) {
      return get_link_doc_simple_content(ev, skip_prj_name, inner.LinkDocEvent)
    } else if (inner.CancelLinkDocEvent !== undefined) {
      return get_cancel_link_doc_simple_content(ev, skip_prj_name, inner.CancelLinkDocEvent);
    } 
    return [new LinkNoneInfo('未知事件')];
  }