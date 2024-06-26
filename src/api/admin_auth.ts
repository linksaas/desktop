//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import { invoke } from '@tauri-apps/api/tauri';


export type Signature = {
    format: string;
    blob: number[];
    rest: number[];
};

export type UserPerm = {
    read: boolean;
    create: boolean;
    set_state: boolean;
    set_test_account: boolean;
    reset_password: boolean;
};

export type ProjectPerm = {
    read: boolean;
    update: boolean;
    access_event: boolean;
};

export type ProjectMemberPerm = {
    read: boolean;
};

export type MenuPerm = {
    read: boolean;
    add: boolean;
    remove: boolean;
    update: boolean;
};

export type AppStorePerm = {
    read: boolean;
    add_cate: boolean;
    update_cate: boolean;
    remove_cate: boolean;
    add_app: boolean;
    update_app: boolean;
    remove_app: boolean;
};

export type DockerTemplatePerm = {
    read: boolean;
    create_cate: boolean;
    update_cate: boolean;
    remove_cate: boolean;
    create_app: boolean;
    update_app: boolean;
    remove_app: boolean;
    create_template: boolean;
    remove_template: boolean;
};

export type DevContainerPerm = {
    read: boolean;
    add_package: boolean;
    remove_package: boolean;
    add_package_version: boolean;
    remove_package_version: boolean;
};

export type IdeaStorePerm = {
    read: boolean;
    create_store_cate: boolean;
    update_store_cate: boolean;
    remove_store_cate: boolean;
    create_store: boolean;
    update_store: boolean;
    move_store: boolean;
    remove_store: boolean;
    create_idea: boolean;
    update_idea: boolean;
    move_idea: boolean;
    remove_idea: boolean;
};

export type WidgetStorePerm = {
    read: boolean;
    add_widget: boolean;
    update_widget: boolean;
    remove_widget: boolean;
};

export type SwStorePerm = {
    read: boolean;
    add_cate: boolean;
    update_cate: boolean;
    remove_cate: boolean;
    add_soft_ware: boolean;
    update_soft_ware: boolean;
    remove_soft_ware: boolean;
};

export type OrgPerm = {
    read: boolean;
    update: boolean;
};

export type OrgMemberPerm = {
    read: boolean;
}

export type KeywordPerm = {
    read: boolean;
    add: boolean;
    remove: boolean;
};

export type GitVpPerm = {
    read: boolean;
    renew_secret: boolean;
    add_vp_source: boolean;
    update_vp_source: boolean;
    remove_vp_source: boolean;
    remove_vp: boolean;
};

export type AdminPermInfo = {
    user_perm: UserPerm;
    project_perm: ProjectPerm;
    project_member_perm: ProjectMemberPerm;
    menu_perm: MenuPerm;
    app_store_perm: AppStorePerm;
    docker_template_perm: DockerTemplatePerm;
    dev_container_perm: DevContainerPerm;
    idea_store_perm: IdeaStorePerm;
    widget_store_perm: WidgetStorePerm;
    sw_store_perm: SwStorePerm;
    org_perm: OrgPerm;
    org_member_perm: OrgMemberPerm;
    keyword_perm: KeywordPerm;
    git_vp_perm: GitVpPerm;
    super_admin_user: boolean;
};

export type PreAuthRequest = {
    user_name: string;
};

export type PreAuthResponse = {
    code: number;
    err_msg: string;
    admin_session_id: string;
    to_sign_str: string;
};


export type AuthRequest = {
    admin_session_id: string;
    sign: Signature;
};

export type AuthResponse = {
    code: number;
    err_msg: string;
    admin_perm_info: AdminPermInfo;
    global_server: boolean;
};

export async function pre_auth(request: PreAuthRequest): Promise<PreAuthResponse> {
    const cmd = 'plugin:admin_auth_api|pre_auth';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<PreAuthResponse>(cmd, {
        request,
    });
}

export async function auth(request: AuthRequest): Promise<AuthResponse> {
    const cmd = 'plugin:admin_auth_api|auth';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    const ret = await invoke<AuthResponse>(cmd, {
        request,
    });
    if (ret.admin_perm_info.git_vp_perm == undefined || ret.admin_perm_info.git_vp_perm == null) {
        ret.admin_perm_info.git_vp_perm = {
            read: false,
            renew_secret: false,
            add_vp_source: false,
            update_vp_source: false,
            remove_vp_source: false,
            remove_vp: false,
        };
    }
    return ret;
}

//获取当前管理会话ID
export async function get_admin_session(): Promise<string> {
    const cmd = 'plugin:admin_auth_api|get_admin_session';
    return invoke<string>(cmd, {});
}

//获取当前管理会话权限
export async function get_admin_perm(): Promise<AdminPermInfo | null> {
    const cmd = 'plugin:admin_auth_api|get_admin_perm';
    const perm = await invoke<AdminPermInfo>(cmd, {});
    if (perm != null) {
        if (perm.git_vp_perm == undefined || perm.git_vp_perm == null) {
            perm.git_vp_perm = {
                read: false,
                renew_secret: false,
                add_vp_source: false,
                update_vp_source: false,
                remove_vp_source: false,
                remove_vp: false,
            };
        }
    }
    return perm;
}

//检测是否是全局服务器
export async function is_global_server(): Promise<boolean> {
    const cmd = 'plugin:admin_auth_api|is_global_server';
    const globalServer = await invoke<boolean>(cmd, {});
    return globalServer ?? false;
}

//用私钥对内容签名
export async function sign(privateKeyFile: string, toSignStr: string): Promise<Signature> {
    const cmd = 'plugin:admin_auth_api|sign';
    const request = {
        privateKeyFile,
        toSignStr,
    };
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<Signature>(cmd, request);
}