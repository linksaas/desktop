//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import { makeAutoObservable, runInAction } from 'mobx';
import { platform } from '@tauri-apps/api/os';
import * as clientCfgApi from '@/api/client_cfg';
import type { ProxyInfo } from "@/api/net_proxy";
import { list_all_listen } from "@/api/net_proxy";
import type { RootStore } from '.';

class AppStore {
  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
    platform().then((platName: string) => {
      if (platName.includes("win32")) {
        this._isOsWindows = true;
      }
    })
  }
  rootStore: RootStore;
  private _isOsWindows = false;

  get isOsWindows(): boolean {
    return this._isOsWindows;
  }

  private _clientCfg: clientCfgApi.GetCfgResponse | undefined = undefined;

  get clientCfg(): clientCfgApi.GetCfgResponse | undefined {
    return this._clientCfg;
  }

  private _curExtraMenu: clientCfgApi.ExtraMenuItem | null = null;

  get curExtraMenu() {
    return this._curExtraMenu;
  }

  set curExtraMenu(val: clientCfgApi.ExtraMenuItem | null) {
    runInAction(() => {
      this._curExtraMenu = val;
    });
  }

  async loadClientCfg() {
    const res = await clientCfgApi.get_cfg();
    runInAction(() => {
      this._clientCfg = res;
    });
  }

  private _localProxyList: ProxyInfo[] = [];

  get localProxyList(): ProxyInfo[] {
    return this._localProxyList;
  }

  async loadLocalProxy() {
    const res = await list_all_listen();
    runInAction(() => {
      this._localProxyList = res.sort((a, b) => a.port - b.port);
    });
  }

  private _showCreateOrJoinProject: boolean = false;

  get showCreateOrJoinProject(): boolean {
    return this._showCreateOrJoinProject;
  }

  set showCreateOrJoinProject(val: boolean) {
    runInAction(() => {
      this._showCreateOrJoinProject = val;
    });
  }

  private _showCreateOrJoinOrg: boolean = false;

  get showCreateOrJoinOrg(): boolean {
    return this._showCreateOrJoinOrg;
  }

  set showCreateOrJoinOrg(val: boolean) {
    runInAction(() => {
      this._showCreateOrJoinOrg = val;
    });
  }

  //显示全局服务器设置
  private _showGlobalServerModal = false;

  get showGlobalServerModal() {
    return this._showGlobalServerModal;
  }

  set showGlobalServerModal(val: boolean) {
    runInAction(() => {
      this._showGlobalServerModal = val;
    });
  }

  //离开编辑状态提示
  private _inEdit = false;
  private _checkLeave = false;
  private _onLeave: (() => void) | null = null;

  get inEdit(): boolean {
    return this._inEdit;
  }

  set inEdit(val: boolean) {
    runInAction(() => {
      this._inEdit = val;
    });
  }

  get checkLeave(): boolean {
    return this._checkLeave;
  }
  get onLeave(): (() => void) | null {
    return this._onLeave;
  }

  showCheckLeave(fn: () => void) {
    runInAction(() => {
      this._checkLeave = true;
      this._onLeave = fn;
    });
  }

  clearCheckLeave() {
    runInAction(() => {
      this._checkLeave = false;
      this._onLeave = null;
    });
  }

  // 打开微应用
  private _openMinAppId = "";

  get openMinAppId() {
    return this._openMinAppId;
  }

  set openMinAppId(val: string) {
    runInAction(() => {
      this._openMinAppId = val;
    });
  }

  // 显示帮助
  private _showHelp = false;

  get showHelp() {
    return this._showHelp;
  }

  set showHelp(val: boolean) {
    runInAction(() => {
      this._showHelp = val;
    });
  }

  // 显示退出
  private _showExit = false;

  get showExit() {
    return this._showExit;
  }

  set showExit(val: boolean) {
    runInAction(() => {
      this._showExit = val;
    });
  }

  // 显示加入项目/团队
  private _showJoinModal = false;

  get showJoinModal() {
    return this._showJoinModal;
  }

  set showJoinModal(val: boolean) {
    runInAction(() => {
      this._showJoinModal = val;
    });
  }
}

export default AppStore;
