//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

export const getTimeDescFromNow = (msTime?: number | null): string => {
    if (msTime === undefined || msTime === null) {
        return "";
    }
    const nowMsTime = (new Date()).getTime();
    const msDiff = nowMsTime - msTime;
    const hourMsTime = 3600 * 1000;
    const dayMsTime = 24 * 3600 * 1000;
    if (msDiff < dayMsTime) {
        return `${(msDiff / hourMsTime).toFixed(0)}小时前`;
    } else {
        return `${(msDiff / dayMsTime).toFixed(0)}天前`;
    }
}

export const sleep = async (ms: number) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};