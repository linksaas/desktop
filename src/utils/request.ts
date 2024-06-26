//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

export interface SuccessData {
  code: number;
  err_msg: string;
  [keys: string]: unknown;
}

export function request<T>(func: Promise<T & SuccessData>): Promise<T & SuccessData> {
  return new Promise((resolve, reject) => {
    func
      .then((resp) => {
        console.log('%c接口返回', 'color:#0f0;', resp);
        if (resp.code === 0) {
          //成功
          resolve(resp);
        } else {
          console.log(resp);
          reject(resp.err_msg);
        }
      })
      .catch((err) => {
        console.log(err);
        reject(err);
      });
  });
}
