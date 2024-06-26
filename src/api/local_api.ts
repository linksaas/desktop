//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import { invoke } from '@tauri-apps/api/tauri';

//移除端口信息文件
export async function remove_info_file(): Promise<void> {
    const cmd = 'plugin:local_api|remove_info_file';
    return invoke<void>(cmd, {});
}

//获取端口
export async function get_port(): Promise<number> {
    const cmd = 'plugin:local_api|get_port';
    return invoke<number>(cmd, {});
}

//获取访问令牌
export async function get_token(): Promise<string> {
    const cmd = 'plugin:local_api|get_token';
    return invoke<string>(cmd, {});
}
