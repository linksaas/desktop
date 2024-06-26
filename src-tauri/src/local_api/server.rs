//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

use crate::notice_decode::{
    new_git_post_hook_notice, new_open_entry_notice, new_start_min_app_notice,
};
use async_trait::async_trait;
use local_api_rust::server::MakeService;
use proto_gen_rust::events_api::{EventRefType, EventType};
use proto_gen_rust::project_issue_api::IssueType;
use random_string::generate;
use serde_json::json;
use std::marker::PhantomData;
use std::net::TcpListener;
use swagger::auth::MakeAllowAllAuthenticator;
use swagger::EmptyContext;
use swagger::{Has, XSpanIdString};
use tauri::{AppHandle, Manager};
use tokio::fs;
use tokio::io::AsyncWriteExt;

pub async fn run(app: AppHandle) {
    println!("start local api server");
    //设置token

    let rand_str = generate(
        32,
        "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
    );
    {
        let serv_token = app.state::<ServToken>().inner();
        *serv_token.0.lock().await = Some(rand_str.clone());
    }

    for port in 8001..8099 {
        let addr = format!("127.0.0.1:{}", port);
        let listener = TcpListener::bind(&addr);
        if listener.is_err() {
            continue;
        }
        let listener = listener.unwrap();

        let builder = hyper::server::Server::from_tcp(listener);
        if builder.is_err() {
            continue;
        }
        {
            let serv_port = app.state::<ServPort>().inner();
            *serv_port.0.lock().await = Some(port as i16);
        }
        //写入$HOME/.linksaas/local_api文件
        if let Some(home_dir) = dirs::home_dir() {
            let file_path = format!("{}/.linksaas/local_api", home_dir.to_str().unwrap());
            let file = fs::OpenOptions::new()
                .truncate(true)
                .create(true)
                .write(true)
                .open(file_path)
                .await;
            if file.is_ok() {
                let line = format!("{} {}", &addr, &rand_str);
                let mut file = file.unwrap();
                if let Ok(_) = file.write_all(line.as_bytes()).await {
                    //do nothing
                    if let Err(err) = file.flush().await {
                        println!("{}", err);
                    }
                }
            }
        }

        let server = Server {
            app: app.clone(),
            marker: PhantomData,
        };
        let service = MakeService::new(server);
        let service = MakeAllowAllAuthenticator::new(service, "cosmo");
        let service =
            local_api_rust::server::context::MakeAddContext::<_, EmptyContext>::new(service);

        builder.unwrap().serve(service).await.unwrap();
        break;
    }
}

#[derive(Clone)]
pub struct Server<C> {
    app: AppHandle,
    marker: PhantomData<C>,
}

use local_api_rust::models::{
    ErrInfo, IssueInfo, ProjectProjectIdBugAllGet200Response,
    ProjectProjectIdCodeCommentCommentThreadIdPut200Response,
    ProjectProjectIdCodeCommentCommentThreadIdPutRequest, ProjectProjectIdEventGet200Response,
    ProjectProjectIdTaskAllGet200Response, ProjectProjectIdTaskRecordTaskIdDependGet200Response,
};
use local_api_rust::{
    Api, HelloGetResponse, MinappGetResponse, MinappMinappIdGetResponse, ProjectGetResponse,
    ProjectProjectIdBugAllGetResponse, ProjectProjectIdBugMyGetResponse,
    ProjectProjectIdBugRecordBugIdEventsGetResponse,
    ProjectProjectIdBugRecordBugIdShortNoteGetResponse,
    ProjectProjectIdBugRecordBugIdShowGetResponse,
    ProjectProjectIdCodeCommentCommentThreadIdCommentIdDeleteResponse,
    ProjectProjectIdCodeCommentCommentThreadIdCommentIdGetResponse,
    ProjectProjectIdCodeCommentCommentThreadIdCommentIdOptionsResponse,
    ProjectProjectIdCodeCommentCommentThreadIdCommentIdPostResponse,
    ProjectProjectIdCodeCommentCommentThreadIdGetResponse,
    ProjectProjectIdCodeCommentCommentThreadIdOptionsResponse,
    ProjectProjectIdCodeCommentCommentThreadIdPutResponse,
    ProjectProjectIdEntryFolderIdGetResponse, ProjectProjectIdEntryShowEntryIdGetResponse,
    ProjectProjectIdEventGetResponse, ProjectProjectIdEventOptionsResponse,
    ProjectProjectIdEventPostResponse, ProjectProjectIdTaskAllGetResponse,
    ProjectProjectIdTaskMyGetResponse, ProjectProjectIdTaskRecordTaskIdDependGetResponse,
    ProjectProjectIdTaskRecordTaskIdEventsGetResponse,
    ProjectProjectIdTaskRecordTaskIdShortNoteGetResponse,
    ProjectProjectIdTaskRecordTaskIdShowGetResponse,
    ProjectProjectIdTaskRecordTaskIdSubTaskGetResponse, ProjectProjectIdToolsPostHookGetResponse,
    ShowGetResponse,
};
use swagger::ApiError;

use super::{entry_api, get_token, ServPort, ServToken};

#[async_trait]
impl<C> Api<C> for Server<C>
where
    C: Has<XSpanIdString> + Send + Sync,
{
    /// 握手协议
    async fn hello_get(
        &self,
        access_token: String,
        _context: &C,
    ) -> Result<HelloGetResponse, ApiError> {
        let serv_token = get_token(self.app.clone()).await;
        if serv_token != access_token {
            return Ok(HelloGetResponse::Status200 {
                body: "wrong access token".into(),
                access_control_allow_origin: Some("*".into()),
            });
        }
        Ok(HelloGetResponse::Status200 {
            body: "hello linksaas".into(),
            access_control_allow_origin: Some("*".into()),
        })
    }

    /// 显示软件桌面
    async fn show_get(
        &self,
        access_token: String,
        _context: &C,
    ) -> Result<ShowGetResponse, ApiError> {
        let serv_token = get_token(self.app.clone()).await;
        if serv_token != access_token {
            return Ok(ShowGetResponse::Status500 {
                body: ErrInfo {
                    err_msg: Some("令牌错误".into()),
                },
                access_control_allow_origin: Some("*".into()),
            });
        }
        let win = self.app.get_window("main");
        if win.is_none() {
            return Ok(ShowGetResponse::Status500 {
                body: ErrInfo {
                    err_msg: Some("无法找到主窗口".into()),
                },
                access_control_allow_origin: Some("*".into()),
            });
        }
        let win = win.unwrap();
        if let Err(err) = win.show() {
            println!("{}", err);
        }
        if let Err(err) = win.unminimize() {
            println!("{}", err);
        }
        return Ok(ShowGetResponse::Status200 {
            body: json!({}),
            access_control_allow_origin: Some("*".into()),
        });
    }

    /// 列出微应用
    async fn minapp_get(
        &self,
        access_token: String,
        _context: &C,
    ) -> Result<MinappGetResponse, ApiError> {
        let serv_token = get_token(self.app.clone()).await;
        if serv_token != access_token {
            return Ok(MinappGetResponse::Status500 {
                body: ErrInfo {
                    err_msg: Some("令牌错误".into()),
                },
                access_control_allow_origin: Some("*".into()),
            });
        }
        let app_id_list = crate::user_app_api_plugin::list_app().await;
        if app_id_list.is_err() {
            return Ok(MinappGetResponse::Status500 {
                body: ErrInfo {
                    err_msg: Some(app_id_list.err().unwrap().to_string()),
                },
                access_control_allow_origin: Some("*".into()),
            });
        }
        let app_id_list = app_id_list.unwrap();
        let app_list = crate::pubres_api::appstore_api_plugin::list_app_by_id(
            self.app.clone(),
            proto_gen_rust::appstore_api::ListAppByIdRequest {
                app_id_list: app_id_list,
                session_id: "".into(),
            },
        )
        .await;
        if app_list.is_err() {
            return Ok(MinappGetResponse::Status500 {
                body: ErrInfo {
                    err_msg: Some(app_list.err().unwrap().to_string()),
                },
                access_control_allow_origin: Some("*".into()),
            });
        }
        let app_list = app_list.unwrap();
        if app_list.code != proto_gen_rust::appstore_api::list_app_by_id_response::Code::Ok as i32 {
            return Ok(MinappGetResponse::Status500 {
                body: ErrInfo {
                    err_msg: Some(app_list.err_msg),
                },
                access_control_allow_origin: Some("*".into()),
            });
        }

        let mut ret_list: Vec<local_api_rust::models::MinappInfo> = Vec::new();

        for app in &app_list.app_info_list {
            let base_info = app.base_info.clone();
            if base_info.is_none() {
                continue;
            }
            ret_list.push(local_api_rust::models::MinappInfo {
                minapp_id: Some(app.app_id.clone()),
                minapp_name: Some(base_info.unwrap().app_name.clone()),
            })
        }

        return Ok(MinappGetResponse::Status200 {
            body: ret_list,
            access_control_allow_origin: Some("*".into()),
        });
    }

    /// 显示微应用
    async fn minapp_minapp_id_get(
        &self,
        minapp_id: String,
        access_token: String,
        _context: &C,
    ) -> Result<MinappMinappIdGetResponse, ApiError> {
        let serv_token = get_token(self.app.clone()).await;
        if serv_token != access_token {
            return Ok(MinappMinappIdGetResponse::Status500 {
                body: ErrInfo {
                    err_msg: Some("令牌错误".into()),
                },
                access_control_allow_origin: Some("*".into()),
            });
        }
        let win = self.app.get_window("main");
        if win.is_none() {
            return Ok(MinappMinappIdGetResponse::Status500 {
                body: ErrInfo {
                    err_msg: Some("无法找到主窗口".into()),
                },
                access_control_allow_origin: Some("*".into()),
            });
        }
        let win = win.unwrap();
        if let Err(_) = win.emit("notice", new_start_min_app_notice(minapp_id)) {
            return Ok(MinappMinappIdGetResponse::Status500 {
                body: ErrInfo {
                    err_msg: Some("发送消息失败".into()),
                },
                access_control_allow_origin: Some("*".into()),
            });
        }
        return Ok(MinappMinappIdGetResponse::Status200 {
            body: json!({}),
            access_control_allow_origin: Some("*".into()),
        });
    }

    /// 所有缺陷
    async fn project_project_id_bug_all_get(
        &self,
        project_id: String,
        offset: i32,
        limit: i32,
        access_token: String,
        _context: &C,
    ) -> Result<ProjectProjectIdBugAllGetResponse, ApiError> {
        let serv_token = get_token(self.app.clone()).await;
        if serv_token != access_token {
            return Ok(ProjectProjectIdBugAllGetResponse::Status500 {
                body: ErrInfo {
                    err_msg: Some("令牌错误".into()),
                },
                access_control_allow_origin: Some("*".into()),
            });
        }
        let res = super::issue_api::list_issue(
            &self.app,
            &project_id,
            IssueType::Bug as i32,
            offset as u32,
            limit as u32,
        )
        .await;
        if res.is_err() {
            return Ok(ProjectProjectIdBugAllGetResponse::Status500 {
                body: ErrInfo {
                    err_msg: Some(res.err().unwrap()),
                },
                access_control_allow_origin: Some("*".into()),
            });
        } else {
            let res = res.unwrap();
            if &res.err_msg != "" {
                return Ok(ProjectProjectIdBugAllGetResponse::Status500 {
                    body: ErrInfo {
                        err_msg: Some(res.err_msg),
                    },
                    access_control_allow_origin: Some("*".into()),
                });
            }
            return Ok(ProjectProjectIdBugAllGetResponse::Status200 {
                body: ProjectProjectIdBugAllGet200Response {
                    total_count: Some(res.total_count as i32),
                    bug_list: Some(super::issue_api::convert_to_bug_list(res.info_list)),
                },
                access_control_allow_origin: Some("*".into()),
            });
        }
    }

    /// 指派给我的缺陷
    async fn project_project_id_bug_my_get(
        &self,
        project_id: String,
        access_token: String,
        state: String,
        _context: &C,
    ) -> Result<ProjectProjectIdBugMyGetResponse, ApiError> {
        let serv_token = get_token(self.app.clone()).await;
        if serv_token != access_token {
            return Ok(ProjectProjectIdBugMyGetResponse::Status500 {
                body: ErrInfo {
                    err_msg: Some("令牌错误".into()),
                },
                access_control_allow_origin: Some("*".into()),
            });
        }
        let res =
            super::issue_api::list_my_issue(&self.app, &project_id, IssueType::Bug as i32, &state)
                .await;
        if res.is_err() {
            return Ok(ProjectProjectIdBugMyGetResponse::Status500 {
                body: ErrInfo {
                    err_msg: Some(res.err().unwrap()),
                },
                access_control_allow_origin: Some("*".into()),
            });
        } else {
            let res = res.unwrap();
            if &res.err_msg != "" {
                return Ok(ProjectProjectIdBugMyGetResponse::Status500 {
                    body: ErrInfo {
                        err_msg: Some(res.err_msg),
                    },
                    access_control_allow_origin: Some("*".into()),
                });
            }
            return Ok(ProjectProjectIdBugMyGetResponse::Status200 {
                body: super::issue_api::convert_to_bug_list(res.info_list),
                access_control_allow_origin: Some("*".into()),
            });
        }
    }

    /// 显示缺陷
    async fn project_project_id_bug_record_bug_id_show_get(
        &self,
        project_id: String,
        bug_id: String,
        access_token: String,
        _context: &C,
    ) -> Result<ProjectProjectIdBugRecordBugIdShowGetResponse, ApiError> {
        let serv_token = get_token(self.app.clone()).await;
        if serv_token != access_token {
            return Ok(ProjectProjectIdBugRecordBugIdShowGetResponse::Status500 {
                body: ErrInfo {
                    err_msg: Some("令牌错误".into()),
                },
                access_control_allow_origin: Some("*".into()),
            });
        }
        let win = self.app.get_window("main");
        if win.is_none() {
            return Ok(ProjectProjectIdBugRecordBugIdShowGetResponse::Status500 {
                body: ErrInfo {
                    err_msg: Some("无法找到主窗口".into()),
                },
                access_control_allow_origin: Some("*".into()),
            });
        }
        let win = win.unwrap();
        if let Err(_) = win.emit(
            "shortNote",
            super::notice::ShortNotetNotice {
                project_id: project_id,
                short_note_mode_type: super::notice::ShortNoteMode::Detail as u32,
                short_note_type: super::notice::ShortNoteType::ShortNoteBug as u32,
                target_id: bug_id,
                extra_target_value: "".into(),
            },
        ) {
            return Ok(ProjectProjectIdBugRecordBugIdShowGetResponse::Status500 {
                body: ErrInfo {
                    err_msg: Some("发送消息失败".into()),
                },
                access_control_allow_origin: Some("*".into()),
            });
        }
        return Ok(ProjectProjectIdBugRecordBugIdShowGetResponse::Status200 {
            body: json!({}),
            access_control_allow_origin: Some("*".into()),
        });
    }

    /// 事件列表
    async fn project_project_id_event_get(
        &self,
        project_id: String,
        from_time: i64,
        to_time: i64,
        offset: i32,
        limit: i32,
        access_token: String,
        user_id: Option<String>,
        _context: &C,
    ) -> Result<ProjectProjectIdEventGetResponse, ApiError> {
        let serv_token = get_token(self.app.clone()).await;
        if serv_token != access_token {
            return Ok(ProjectProjectIdEventGetResponse::Status500 {
                body: ErrInfo {
                    err_msg: Some("令牌错误".into()),
                },
                access_control_allow_origin: Some("*".into()),
            });
        }
        let mut member_user_id = String::from("");
        if let Some(user_id) = user_id {
            member_user_id = user_id;
        }
        let res = super::event_api::list_project_event(
            &self.app,
            &project_id,
            &member_user_id,
            from_time,
            to_time,
            offset as u32,
            limit as u32,
        )
        .await;
        if res.is_err() {
            return Ok(ProjectProjectIdEventGetResponse::Status500 {
                body: ErrInfo {
                    err_msg: Some(res.err().unwrap()),
                },
                access_control_allow_origin: Some("*".into()),
            });
        } else {
            let res = res.unwrap();
            if &res.err_msg != "" {
                return Ok(ProjectProjectIdEventGetResponse::Status500 {
                    body: ErrInfo {
                        err_msg: Some(res.err_msg),
                    },
                    access_control_allow_origin: Some("*".into()),
                });
            }
            return Ok(ProjectProjectIdEventGetResponse::Status200 {
                body: ProjectProjectIdEventGet200Response {
                    total_count: Some(res.total_count as i32),
                    event_list: Some(super::event_api::convert_event_list(res.event_list)),
                },
                access_control_allow_origin: Some("*".into()),
            });
        }
    }

    /// 所有任务
    async fn project_project_id_task_all_get(
        &self,
        project_id: String,
        offset: i32,
        limit: i32,
        access_token: String,
        _context: &C,
    ) -> Result<ProjectProjectIdTaskAllGetResponse, ApiError> {
        let serv_token = get_token(self.app.clone()).await;
        if serv_token != access_token {
            return Ok(ProjectProjectIdTaskAllGetResponse::Status500 {
                body: ErrInfo {
                    err_msg: Some("令牌错误".into()),
                },
                access_control_allow_origin: Some("*".into()),
            });
        }
        let res = super::issue_api::list_issue(
            &self.app,
            &project_id,
            IssueType::Task as i32,
            offset as u32,
            limit as u32,
        )
        .await;
        if res.is_err() {
            return Ok(ProjectProjectIdTaskAllGetResponse::Status500 {
                body: ErrInfo {
                    err_msg: Some(res.err().unwrap()),
                },
                access_control_allow_origin: Some("*".into()),
            });
        } else {
            let res = res.unwrap();
            if &res.err_msg != "" {
                return Ok(ProjectProjectIdTaskAllGetResponse::Status500 {
                    body: ErrInfo {
                        err_msg: Some(res.err_msg),
                    },
                    access_control_allow_origin: Some("*".into()),
                });
            }
            return Ok(ProjectProjectIdTaskAllGetResponse::Status200 {
                body: ProjectProjectIdTaskAllGet200Response {
                    total_count: Some(res.total_count as i32),
                    task_list: Some(super::issue_api::convert_to_task_list(res.info_list)),
                },
                access_control_allow_origin: Some("*".into()),
            });
        }
    }

    /// 指派给我的任务
    async fn project_project_id_task_my_get(
        &self,
        project_id: String,
        state: String,
        access_token: String,
        _context: &C,
    ) -> Result<ProjectProjectIdTaskMyGetResponse, ApiError> {
        let serv_token = get_token(self.app.clone()).await;
        if serv_token != access_token {
            return Ok(ProjectProjectIdTaskMyGetResponse::Status500 {
                body: ErrInfo {
                    err_msg: Some("令牌错误".into()),
                },
                access_control_allow_origin: Some("*".into()),
            });
        }
        let res =
            super::issue_api::list_my_issue(&self.app, &project_id, IssueType::Task as i32, &state)
                .await;
        if res.is_err() {
            return Ok(ProjectProjectIdTaskMyGetResponse::Status500 {
                body: ErrInfo {
                    err_msg: Some(res.err().unwrap()),
                },
                access_control_allow_origin: Some("*".into()),
            });
        } else {
            let res = res.unwrap();
            if &res.err_msg != "" {
                return Ok(ProjectProjectIdTaskMyGetResponse::Status500 {
                    body: ErrInfo {
                        err_msg: Some(res.err_msg),
                    },
                    access_control_allow_origin: Some("*".into()),
                });
            }
            return Ok(ProjectProjectIdTaskMyGetResponse::Status200 {
                body: super::issue_api::convert_to_task_list(res.info_list),
                access_control_allow_origin: Some("*".into()),
            });
        }
    }

    /// 显示任务
    async fn project_project_id_task_record_task_id_show_get(
        &self,
        project_id: String,
        task_id: String,
        access_token: String,
        _context: &C,
    ) -> Result<ProjectProjectIdTaskRecordTaskIdShowGetResponse, ApiError> {
        let serv_token = get_token(self.app.clone()).await;
        if serv_token != access_token {
            return Ok(ProjectProjectIdTaskRecordTaskIdShowGetResponse::Status500 {
                body: ErrInfo {
                    err_msg: Some("令牌错误".into()),
                },
                access_control_allow_origin: Some("*".into()),
            });
        }
        let win = self.app.get_window("main");
        if win.is_none() {
            return Ok(ProjectProjectIdTaskRecordTaskIdShowGetResponse::Status500 {
                body: ErrInfo {
                    err_msg: Some("无法找到主窗口".into()),
                },
                access_control_allow_origin: Some("*".into()),
            });
        }
        let win = win.unwrap();
        if let Err(_) = win.emit(
            "shortNote",
            super::notice::ShortNotetNotice {
                project_id: project_id,
                short_note_mode_type: super::notice::ShortNoteMode::Detail as u32,
                short_note_type: super::notice::ShortNoteType::ShortNoteTask as u32,
                target_id: task_id,
                extra_target_value: "".into(),
            },
        ) {
            return Ok(ProjectProjectIdTaskRecordTaskIdShowGetResponse::Status500 {
                body: ErrInfo {
                    err_msg: Some("发送消息失败".into()),
                },
                access_control_allow_origin: Some("*".into()),
            });
        }
        return Ok(ProjectProjectIdTaskRecordTaskIdShowGetResponse::Status200 {
            body: json!({}),
            access_control_allow_origin: Some("*".into()),
        });
    }

    /// 便签方式显示缺陷
    async fn project_project_id_bug_record_bug_id_short_note_get(
        &self,
        project_id: String,
        bug_id: String,
        access_token: String,
        _context: &C,
    ) -> Result<ProjectProjectIdBugRecordBugIdShortNoteGetResponse, ApiError> {
        let serv_token = get_token(self.app.clone()).await;
        if serv_token != access_token {
            return Ok(
                ProjectProjectIdBugRecordBugIdShortNoteGetResponse::Status500 {
                    body: ErrInfo {
                        err_msg: Some("令牌错误".into()),
                    },
                    access_control_allow_origin: Some("*".into()),
                },
            );
        }
        let win = self.app.get_window("main");
        if win.is_none() {
            return Ok(
                ProjectProjectIdBugRecordBugIdShortNoteGetResponse::Status500 {
                    body: ErrInfo {
                        err_msg: Some("无法找到主窗口".into()),
                    },
                    access_control_allow_origin: Some("*".into()),
                },
            );
        }
        let win = win.unwrap();
        if let Err(_) = win.emit(
            "shortNote",
            super::notice::ShortNotetNotice {
                project_id: project_id,
                short_note_mode_type: super::notice::ShortNoteMode::Show as u32,
                short_note_type: super::notice::ShortNoteType::ShortNoteBug as u32,
                target_id: bug_id,
                extra_target_value: "".into(),
            },
        ) {
            return Ok(
                ProjectProjectIdBugRecordBugIdShortNoteGetResponse::Status500 {
                    body: ErrInfo {
                        err_msg: Some("发送消息失败".into()),
                    },
                    access_control_allow_origin: Some("*".into()),
                },
            );
        }
        return Ok(
            ProjectProjectIdBugRecordBugIdShortNoteGetResponse::Status200 {
                body: json!({}),
                access_control_allow_origin: Some("*".into()),
            },
        );
    }

    /// 便签方式显示任务
    async fn project_project_id_task_record_task_id_short_note_get(
        &self,
        project_id: String,
        task_id: String,
        access_token: String,
        _context: &C,
    ) -> Result<ProjectProjectIdTaskRecordTaskIdShortNoteGetResponse, ApiError> {
        let serv_token = get_token(self.app.clone()).await;
        if serv_token != access_token {
            return Ok(
                ProjectProjectIdTaskRecordTaskIdShortNoteGetResponse::Status500 {
                    body: ErrInfo {
                        err_msg: Some("令牌错误".into()),
                    },
                    access_control_allow_origin: Some("*".into()),
                },
            );
        }
        let win = self.app.get_window("main");
        if win.is_none() {
            return Ok(
                ProjectProjectIdTaskRecordTaskIdShortNoteGetResponse::Status500 {
                    body: ErrInfo {
                        err_msg: Some("无法找到主窗口".into()),
                    },
                    access_control_allow_origin: Some("*".into()),
                },
            );
        }
        let win = win.unwrap();
        if let Err(_) = win.emit(
            "shortNote",
            super::notice::ShortNotetNotice {
                project_id: project_id,
                short_note_mode_type: super::notice::ShortNoteMode::Show as u32,
                short_note_type: super::notice::ShortNoteType::ShortNoteTask as u32,
                target_id: task_id,
                extra_target_value: "".into(),
            },
        ) {
            return Ok(
                ProjectProjectIdTaskRecordTaskIdShortNoteGetResponse::Status500 {
                    body: ErrInfo {
                        err_msg: Some("发送消息失败".into()),
                    },
                    access_control_allow_origin: Some("*".into()),
                },
            );
        }
        return Ok(
            ProjectProjectIdTaskRecordTaskIdShortNoteGetResponse::Status200 {
                body: json!({}),
                access_control_allow_origin: Some("*".into()),
            },
        );
    }

    /// 任务相关事件
    async fn project_project_id_task_record_task_id_events_get(
        &self,
        project_id: String,
        task_id: String,
        access_token: String,
        _context: &C,
    ) -> Result<ProjectProjectIdTaskRecordTaskIdEventsGetResponse, ApiError> {
        let serv_token = get_token(self.app.clone()).await;
        if serv_token != access_token {
            return Ok(
                ProjectProjectIdTaskRecordTaskIdEventsGetResponse::Status500 {
                    body: ErrInfo {
                        err_msg: Some("令牌错误".into()),
                    },
                    access_control_allow_origin: Some("*".into()),
                },
            );
        }
        let res = super::event_api::list_event_by_ref(
            &self.app,
            &project_id,
            EventType::Task,
            EventRefType::Task,
            &task_id,
        )
        .await;
        if res.is_err() {
            return Ok(
                ProjectProjectIdTaskRecordTaskIdEventsGetResponse::Status500 {
                    body: ErrInfo {
                        err_msg: Some(res.err().unwrap()),
                    },
                    access_control_allow_origin: Some("*".into()),
                },
            );
        } else {
            let res = res.unwrap();
            if &res.err_msg != "" {
                return Ok(
                    ProjectProjectIdTaskRecordTaskIdEventsGetResponse::Status500 {
                        body: ErrInfo {
                            err_msg: Some(res.err_msg),
                        },
                        access_control_allow_origin: Some("*".into()),
                    },
                );
            }
            return Ok(
                ProjectProjectIdTaskRecordTaskIdEventsGetResponse::Status200 {
                    body: super::event_api::convert_event_list(res.event_list),
                    access_control_allow_origin: Some("*".into()),
                },
            );
        }
    }

    /// 缺陷相关事件
    async fn project_project_id_bug_record_bug_id_events_get(
        &self,
        project_id: String,
        bug_id: String,
        access_token: String,
        _context: &C,
    ) -> Result<ProjectProjectIdBugRecordBugIdEventsGetResponse, ApiError> {
        let serv_token = get_token(self.app.clone()).await;
        if serv_token != access_token {
            return Ok(ProjectProjectIdBugRecordBugIdEventsGetResponse::Status500 {
                body: ErrInfo {
                    err_msg: Some("令牌错误".into()),
                },
                access_control_allow_origin: Some("*".into()),
            });
        }
        let res = super::event_api::list_event_by_ref(
            &self.app,
            &project_id,
            EventType::Bug,
            EventRefType::Bug,
            &bug_id,
        )
        .await;
        if res.is_err() {
            return Ok(ProjectProjectIdBugRecordBugIdEventsGetResponse::Status500 {
                body: ErrInfo {
                    err_msg: Some(res.err().unwrap()),
                },
                access_control_allow_origin: Some("*".into()),
            });
        } else {
            let res = res.unwrap();
            if &res.err_msg != "" {
                return Ok(ProjectProjectIdBugRecordBugIdEventsGetResponse::Status500 {
                    body: ErrInfo {
                        err_msg: Some(res.err_msg),
                    },
                    access_control_allow_origin: Some("*".into()),
                });
            }
            return Ok(ProjectProjectIdBugRecordBugIdEventsGetResponse::Status200 {
                body: super::event_api::convert_event_list(res.event_list),
                access_control_allow_origin: Some("*".into()),
            });
        }
    }

    /// 列出子任务
    async fn project_project_id_task_record_task_id_sub_task_get(
        &self,
        project_id: String,
        task_id: String,
        access_token: String,
        _context: &C,
    ) -> Result<ProjectProjectIdTaskRecordTaskIdSubTaskGetResponse, ApiError> {
        let serv_token = get_token(self.app.clone()).await;
        if serv_token != access_token {
            return Ok(
                ProjectProjectIdTaskRecordTaskIdSubTaskGetResponse::Status500 {
                    body: ErrInfo {
                        err_msg: Some("令牌错误".into()),
                    },
                    access_control_allow_origin: Some("*".into()),
                },
            );
        }
        let res = super::issue_api::list_sub_task(&self.app, &project_id, &task_id).await;
        if res.is_err() {
            return Ok(
                ProjectProjectIdTaskRecordTaskIdSubTaskGetResponse::Status500 {
                    body: ErrInfo {
                        err_msg: Some(res.err().unwrap()),
                    },
                    access_control_allow_origin: Some("*".into()),
                },
            );
        } else {
            let res = res.unwrap();
            if &res.err_msg != "" {
                return Ok(
                    ProjectProjectIdTaskRecordTaskIdSubTaskGetResponse::Status500 {
                        body: ErrInfo {
                            err_msg: Some(res.err_msg),
                        },
                        access_control_allow_origin: Some("*".into()),
                    },
                );
            }
            return Ok(
                ProjectProjectIdTaskRecordTaskIdSubTaskGetResponse::Status200 {
                    body: super::issue_api::convert_to_sub_task_list(res.sub_issue_list),
                    access_control_allow_origin: Some("*".into()),
                },
            );
        }
    }

    /// 列出依赖工单
    async fn project_project_id_task_record_task_id_depend_get(
        &self,
        project_id: String,
        task_id: String,
        access_token: String,
        _context: &C,
    ) -> Result<ProjectProjectIdTaskRecordTaskIdDependGetResponse, ApiError> {
        let serv_token = get_token(self.app.clone()).await;
        if serv_token != access_token {
            return Ok(
                ProjectProjectIdTaskRecordTaskIdDependGetResponse::Status500 {
                    body: ErrInfo {
                        err_msg: Some("令牌错误".into()),
                    },
                    access_control_allow_origin: Some("*".into()),
                },
            );
        }
        let my_dep_res = super::issue_api::list_my_depend(&self.app, &project_id, &task_id).await;
        let mut my_dep_list: Vec<IssueInfo> = Vec::new();
        if my_dep_res.is_err() {
            return Ok(
                ProjectProjectIdTaskRecordTaskIdDependGetResponse::Status500 {
                    body: ErrInfo {
                        err_msg: Some(my_dep_res.err().unwrap()),
                    },
                    access_control_allow_origin: Some("*".into()),
                },
            );
        } else {
            let res = my_dep_res.unwrap();
            if &res.err_msg != "" {
                return Ok(
                    ProjectProjectIdTaskRecordTaskIdDependGetResponse::Status500 {
                        body: ErrInfo {
                            err_msg: Some(res.err_msg),
                        },
                        access_control_allow_origin: Some("*".into()),
                    },
                );
            }
            super::issue_api::convert_to_issue_list(res.issue_list)
                .iter()
                .for_each(|item| {
                    my_dep_list.push(item.clone());
                });
        }
        let dep_me_res = super::issue_api::list_depend_me(&self.app, &project_id, &task_id).await;
        let mut dep_me_list: Vec<IssueInfo> = Vec::new();
        if dep_me_res.is_err() {
            return Ok(
                ProjectProjectIdTaskRecordTaskIdDependGetResponse::Status500 {
                    body: ErrInfo {
                        err_msg: Some(dep_me_res.err().unwrap()),
                    },
                    access_control_allow_origin: Some("*".into()),
                },
            );
        } else {
            let res = dep_me_res.unwrap();
            if &res.err_msg != "" {
                return Ok(
                    ProjectProjectIdTaskRecordTaskIdDependGetResponse::Status500 {
                        body: ErrInfo {
                            err_msg: Some(res.err_msg),
                        },
                        access_control_allow_origin: Some("*".into()),
                    },
                );
            }
            super::issue_api::convert_to_issue_list(res.issue_list)
                .iter()
                .for_each(|item| {
                    dep_me_list.push(item.clone());
                });
        }
        return Ok(
            ProjectProjectIdTaskRecordTaskIdDependGetResponse::Status200 {
                body: ProjectProjectIdTaskRecordTaskIdDependGet200Response {
                    my_depend_list: Some(my_dep_list),
                    depend_me_list: Some(dep_me_list),
                },
                access_control_allow_origin: Some("*".into()),
            },
        );
    }

    /// 删除代码评论
    async fn project_project_id_code_comment_comment_thread_id_comment_id_delete(
        &self,
        project_id: String,
        _comment_thread_id: String,
        comment_id: String,
        access_token: String,
        _context: &C,
    ) -> Result<ProjectProjectIdCodeCommentCommentThreadIdCommentIdDeleteResponse, ApiError> {
        let serv_token = get_token(self.app.clone()).await;
        if serv_token != access_token {
            return Ok(
                ProjectProjectIdCodeCommentCommentThreadIdCommentIdDeleteResponse::Status500 {
                    body: ErrInfo {
                        err_msg: Some("令牌错误".into()),
                    },
                    access_control_allow_origin: Some("*".into()),
                },
            );
        }
        let res =
            super::project_code_api::remove_comment(&self.app, &project_id, &comment_id).await;
        if res.is_err() {
            return Ok(
                ProjectProjectIdCodeCommentCommentThreadIdCommentIdDeleteResponse::Status500 {
                    body: ErrInfo {
                        err_msg: Some(res.err().unwrap()),
                    },
                    access_control_allow_origin: Some("*".into()),
                },
            );
        } else {
            let res = res.unwrap();
            if &res.err_msg != "" {
                return Ok(
                    ProjectProjectIdCodeCommentCommentThreadIdCommentIdDeleteResponse::Status500 {
                        body: ErrInfo {
                            err_msg: Some(res.err_msg),
                        },
                        access_control_allow_origin: Some("*".into()),
                    },
                );
            }
            return Ok(
                ProjectProjectIdCodeCommentCommentThreadIdCommentIdDeleteResponse::Status200 {
                    body: json!({}),
                    access_control_allow_origin: Some("*".into()),
                },
            );
        }
    }

    /// 获取单个代码评论
    async fn project_project_id_code_comment_comment_thread_id_comment_id_get(
        &self,
        project_id: String,
        _comment_thread_id: String,
        comment_id: String,
        access_token: String,
        _context: &C,
    ) -> Result<ProjectProjectIdCodeCommentCommentThreadIdCommentIdGetResponse, ApiError> {
        let serv_token = get_token(self.app.clone()).await;
        if serv_token != access_token {
            return Ok(
                ProjectProjectIdCodeCommentCommentThreadIdCommentIdGetResponse::Status500 {
                    body: ErrInfo {
                        err_msg: Some("令牌错误".into()),
                    },
                    access_control_allow_origin: Some("*".into()),
                },
            );
        }
        let res = super::project_code_api::get_comment(&self.app, &project_id, &comment_id).await;
        if res.is_err() {
            return Ok(
                ProjectProjectIdCodeCommentCommentThreadIdCommentIdGetResponse::Status500 {
                    body: ErrInfo {
                        err_msg: Some(res.err().unwrap()),
                    },
                    access_control_allow_origin: Some("*".into()),
                },
            );
        } else {
            let res = res.unwrap();
            if &res.err_msg != "" {
                return Ok(
                    ProjectProjectIdCodeCommentCommentThreadIdCommentIdGetResponse::Status500 {
                        body: ErrInfo {
                            err_msg: Some(res.err_msg),
                        },
                        access_control_allow_origin: Some("*".into()),
                    },
                );
            }
            if res.comment.is_none() {
                return Ok(
                    ProjectProjectIdCodeCommentCommentThreadIdCommentIdGetResponse::Status500 {
                        body: ErrInfo {
                            err_msg: Some("no code comment".into()),
                        },
                        access_control_allow_origin: Some("*".into()),
                    },
                );
            }
            let comment = res.comment.unwrap();
            return Ok(
                ProjectProjectIdCodeCommentCommentThreadIdCommentIdGetResponse::Status200 {
                    body: super::project_code_api::convert_to_comment(&comment),
                    access_control_allow_origin: Some("*".into()),
                },
            );
        }
    }

    /// 更新单个代码评论
    async fn project_project_id_code_comment_comment_thread_id_comment_id_post(
        &self,
        project_id: String,
        _comment_thread_id: String,
        comment_id: String,
        access_token: String,
        request: Option<ProjectProjectIdCodeCommentCommentThreadIdPutRequest>,
        _context: &C,
    ) -> Result<ProjectProjectIdCodeCommentCommentThreadIdCommentIdPostResponse, ApiError> {
        let serv_token = get_token(self.app.clone()).await;
        if serv_token != access_token {
            return Ok(
                ProjectProjectIdCodeCommentCommentThreadIdCommentIdPostResponse::Status500 {
                    body: ErrInfo {
                        err_msg: Some("令牌错误".into()),
                    },
                    access_control_allow_origin: Some("*".into()),
                },
            );
        }
        if request.is_none() {
            return Ok(
                ProjectProjectIdCodeCommentCommentThreadIdCommentIdPostResponse::Status500 {
                    body: ErrInfo {
                        err_msg: Some("错误的请求参数".into()),
                    },
                    access_control_allow_origin: Some("*".into()),
                },
            );
        }
        let request = request.unwrap();
        let content = request.content.unwrap_or_default();
        let content_type_str = request.content_type.unwrap_or_default();
        let mut content_type = proto_gen_rust::project_code_api::ContentType::Text;
        if content_type_str == "markdown" {
            content_type = proto_gen_rust::project_code_api::ContentType::Markdown;
        }
        let res = super::project_code_api::update_comment(
            &self.app,
            &project_id,
            &comment_id,
            content_type,
            &content,
        )
        .await;
        if res.is_err() {
            return Ok(
                ProjectProjectIdCodeCommentCommentThreadIdCommentIdPostResponse::Status500 {
                    body: ErrInfo {
                        err_msg: Some(res.err().unwrap()),
                    },
                    access_control_allow_origin: Some("*".into()),
                },
            );
        } else {
            let res = res.unwrap();
            if &res.err_msg != "" {
                return Ok(
                    ProjectProjectIdCodeCommentCommentThreadIdCommentIdPostResponse::Status500 {
                        body: ErrInfo {
                            err_msg: Some(res.err_msg),
                        },
                        access_control_allow_origin: Some("*".into()),
                    },
                );
            }
            return Ok(
                ProjectProjectIdCodeCommentCommentThreadIdCommentIdPostResponse::Status200 {
                    body: json!({}),
                    access_control_allow_origin: Some("*".into()),
                },
            );
        }
    }

    /// 列出代码评论
    async fn project_project_id_code_comment_comment_thread_id_get(
        &self,
        project_id: String,
        thread_id: String,
        access_token: String,
        _context: &C,
    ) -> Result<ProjectProjectIdCodeCommentCommentThreadIdGetResponse, ApiError> {
        let serv_token = get_token(self.app.clone()).await;
        if serv_token != access_token {
            return Ok(
                ProjectProjectIdCodeCommentCommentThreadIdGetResponse::Status500 {
                    body: ErrInfo {
                        err_msg: Some("令牌错误".into()),
                    },
                    access_control_allow_origin: Some("*".into()),
                },
            );
        }
        let res = super::project_code_api::list_comment(&self.app, &project_id, &thread_id).await;
        if res.is_err() {
            return Ok(
                ProjectProjectIdCodeCommentCommentThreadIdGetResponse::Status500 {
                    body: ErrInfo {
                        err_msg: Some(res.err().unwrap()),
                    },
                    access_control_allow_origin: Some("*".into()),
                },
            );
        } else {
            let res = res.unwrap();
            if &res.err_msg != "" {
                return Ok(
                    ProjectProjectIdCodeCommentCommentThreadIdGetResponse::Status500 {
                        body: ErrInfo {
                            err_msg: Some(res.err_msg),
                        },
                        access_control_allow_origin: Some("*".into()),
                    },
                );
            }
            return Ok(
                ProjectProjectIdCodeCommentCommentThreadIdGetResponse::Status200 {
                    body: super::project_code_api::convert_to_comment_list(&res.comment_list),
                    access_control_allow_origin: Some("*".into()),
                },
            );
        }
    }

    /// 新增代码评论
    async fn project_project_id_code_comment_comment_thread_id_put(
        &self,
        project_id: String,
        thread_id: String,
        access_token: String,
        request: Option<ProjectProjectIdCodeCommentCommentThreadIdPutRequest>,
        _context: &C,
    ) -> Result<ProjectProjectIdCodeCommentCommentThreadIdPutResponse, ApiError> {
        let serv_token = get_token(self.app.clone()).await;
        if serv_token != access_token {
            return Ok(
                ProjectProjectIdCodeCommentCommentThreadIdPutResponse::Status500 {
                    body: ErrInfo {
                        err_msg: Some("令牌错误".into()),
                    },
                    access_control_allow_origin: Some("*".into()),
                },
            );
        }
        if request.is_none() {
            return Ok(
                ProjectProjectIdCodeCommentCommentThreadIdPutResponse::Status500 {
                    body: ErrInfo {
                        err_msg: Some("错误的请求参数".into()),
                    },
                    access_control_allow_origin: Some("*".into()),
                },
            );
        }
        let request = request.unwrap();
        let content = request.content.unwrap_or_default();
        let content_type_str = request.content_type.unwrap_or_default();
        let mut content_type = proto_gen_rust::project_code_api::ContentType::Text;
        if content_type_str == "markdown" {
            content_type = proto_gen_rust::project_code_api::ContentType::Markdown;
        }

        let res = super::project_code_api::add_comment(
            &self.app,
            &project_id,
            &thread_id,
            content_type,
            &content,
        )
        .await;
        if res.is_err() {
            return Ok(
                ProjectProjectIdCodeCommentCommentThreadIdPutResponse::Status500 {
                    body: ErrInfo {
                        err_msg: Some(res.err().unwrap()),
                    },
                    access_control_allow_origin: Some("*".into()),
                },
            );
        } else {
            let res = res.unwrap();
            if &res.err_msg != "" {
                return Ok(
                    ProjectProjectIdCodeCommentCommentThreadIdPutResponse::Status500 {
                        body: ErrInfo {
                            err_msg: Some(res.err_msg),
                        },
                        access_control_allow_origin: Some("*".into()),
                    },
                );
            }
            return Ok(
                ProjectProjectIdCodeCommentCommentThreadIdPutResponse::Status200 {
                    body: ProjectProjectIdCodeCommentCommentThreadIdPut200Response {
                        comment_id: Some(res.comment_id),
                    },
                    access_control_allow_origin: Some("*".into()),
                },
            );
        }
    }

    /// git post commit hook回调
    async fn project_project_id_tools_post_hook_get(
        &self,
        project_id: String,
        access_token: String,
        _context: &C,
    ) -> Result<ProjectProjectIdToolsPostHookGetResponse, ApiError> {
        let serv_token = get_token(self.app.clone()).await;
        if serv_token != access_token {
            return Ok(ProjectProjectIdToolsPostHookGetResponse::Status500 {
                body: ErrInfo {
                    err_msg: Some("令牌错误".into()),
                },
                access_control_allow_origin: Some("*".into()),
            });
        }
        let win = self.app.get_window("main");
        if win.is_some() {
            let win = win.unwrap();
            if let Err(_) = win.emit("notice", new_git_post_hook_notice(project_id)) {
                return Ok(ProjectProjectIdToolsPostHookGetResponse::Status500 {
                    body: ErrInfo {
                        err_msg: Some("发送通知失败".into()),
                    },
                    access_control_allow_origin: Some("*".into()),
                });
            }
        }
        return Ok(ProjectProjectIdToolsPostHookGetResponse::Status200 {
            body: json!({}),
            access_control_allow_origin: Some("*".into()),
        });
    }

    /// 获取项目列表
    async fn project_get(
        &self,
        access_token: String,
        _context: &C,
    ) -> Result<ProjectGetResponse, ApiError> {
        let serv_token = get_token(self.app.clone()).await;
        if serv_token != access_token {
            return Ok(ProjectGetResponse::Status500 {
                body: ErrInfo {
                    err_msg: Some("令牌错误".into()),
                },
                access_control_allow_origin: Some("*".into()),
            });
        }
        let res = super::project_api::list_project(&self.app).await;
        if res.is_err() {
            return Ok(ProjectGetResponse::Status500 {
                body: ErrInfo {
                    err_msg: Some(res.err().unwrap()),
                },
                access_control_allow_origin: Some("*".into()),
            });
        } else {
            let res = res.unwrap();
            if &res.err_msg != "" {
                return Ok(ProjectGetResponse::Status500 {
                    body: ErrInfo {
                        err_msg: Some(res.err_msg),
                    },
                    access_control_allow_origin: Some("*".into()),
                });
            }
            let mut project_list: Vec<local_api_rust::models::ProjectInfo> = Vec::new();
            res.info_list.iter().for_each(|prj| {
                project_list.push(local_api_rust::models::ProjectInfo {
                    project_id: Some(prj.project_id.clone()),
                    project_name: Some(prj.basic_info.as_ref().unwrap().project_name.clone()),
                })
            });
            return Ok(ProjectGetResponse::Status200 {
                body: project_list,
                access_control_allow_origin: Some("*".into()),
            });
        }
    }

    /// 上报自定义事件
    async fn project_project_id_event_post(
        &self,
        project_id: String,
        access_token: String,
        request: Option<local_api_rust::models::ProjectProjectIdEventPostRequest>,
        _context: &C,
    ) -> Result<ProjectProjectIdEventPostResponse, ApiError> {
        let serv_token = get_token(self.app.clone()).await;
        if serv_token != access_token {
            return Ok(ProjectProjectIdEventPostResponse::Status500 {
                body: ErrInfo {
                    err_msg: Some("令牌错误".into()),
                },
                access_control_allow_origin: Some("*".into()),
            });
        }
        println!("request is none {}", request.is_none());
        if request.is_none() {
            return Ok(ProjectProjectIdEventPostResponse::Status500 {
                body: ErrInfo {
                    err_msg: Some("错误的请求参数".into()),
                },
                access_control_allow_origin: Some("*".into()),
            });
        }

        let request = request.unwrap();
        println!("{:?}", &request);
        let ev_type = request.ev_type.unwrap_or_default();
        let ev_content = request.ev_content.unwrap_or_default();
        if &ev_type == "" || &ev_content == "" {
            return Ok(ProjectProjectIdEventPostResponse::Status500 {
                body: ErrInfo {
                    err_msg: Some("错误的请求参数".into()),
                },
                access_control_allow_origin: Some("*".into()),
            });
        }
        let res =
            super::event_api::add_custom_event(&self.app, &project_id, &ev_type, &ev_content).await;
        if res.is_err() {
            return Ok(ProjectProjectIdEventPostResponse::Status500 {
                body: ErrInfo {
                    err_msg: Some(res.err().unwrap()),
                },
                access_control_allow_origin: Some("*".into()),
            });
        }
        return Ok(ProjectProjectIdEventPostResponse::Status200 {
            body: json!({}),
            access_control_allow_origin: Some("*".into()),
        });
    }

    async fn project_project_id_code_comment_comment_thread_id_comment_id_options(
        &self,
        _project_id: String,
        _comment_thread_id: String,
        _comment_id: String,
        _access_token: String,
        _context: &C,
    ) -> Result<ProjectProjectIdCodeCommentCommentThreadIdCommentIdOptionsResponse, ApiError> {
        return Ok(
            ProjectProjectIdCodeCommentCommentThreadIdCommentIdOptionsResponse::Status200 {
                body: json!({}),
                access_control_allow_origin: Some("*".into()),
                access_control_allow_methods: Some("PUT, GET, POST, DELETE, OPTIONS".into()),
                access_control_allow_headers: Some("Origin, X-Requested-With, Content-Type, Accept, Authorization, Access-Control-Allow-Credentials".into()),
                access_control_allow_credentials: Some("true".into()),
            },
        );
    }

    async fn project_project_id_code_comment_comment_thread_id_options(
        &self,
        _project_id: String,
        _comment_thread_id: String,
        _access_token: String,
        _context: &C,
    ) -> Result<ProjectProjectIdCodeCommentCommentThreadIdOptionsResponse, ApiError> {
        return Ok(
            ProjectProjectIdCodeCommentCommentThreadIdOptionsResponse::Status200 {
                body: json!({}),
                access_control_allow_origin: Some("*".into()),
                access_control_allow_methods: Some("PUT, GET, POST, DELETE, OPTIONS".into()),
                access_control_allow_headers: Some("Origin, X-Requested-With, Content-Type, Accept, Authorization, Access-Control-Allow-Credentials".into()),
                access_control_allow_credentials: Some("true".into()),
            },
        );
    }

    async fn project_project_id_event_options(
        &self,
        _project_id: String,
        _access_token: String,
        _context: &C,
    ) -> Result<ProjectProjectIdEventOptionsResponse, ApiError> {
        return Ok(ProjectProjectIdEventOptionsResponse::Status200 {
            body: json!({}),
                access_control_allow_origin: Some("*".into()),
                access_control_allow_methods: Some("PUT, GET, POST, DELETE, OPTIONS".into()),
                access_control_allow_headers: Some("Origin, X-Requested-With, Content-Type, Accept, Authorization, Access-Control-Allow-Credentials".into()),
                access_control_allow_credentials: Some("true".into()),
        });
    }

    /// 打开内容入口
    async fn project_project_id_entry_show_entry_id_get(
        &self,
        project_id: String,
        entry_id: String,
        access_token: String,
        _context: &C,
    ) -> Result<ProjectProjectIdEntryShowEntryIdGetResponse, ApiError> {
        let serv_token = get_token(self.app.clone()).await;
        if serv_token != access_token {
            return Ok(ProjectProjectIdEntryShowEntryIdGetResponse::Status500 {
                body: ErrInfo {
                    err_msg: Some("令牌错误".into()),
                },
                access_control_allow_origin: Some("*".into()),
            });
        }
        let win = self.app.get_window("main");
        if win.is_none() {
            return Ok(ProjectProjectIdEntryShowEntryIdGetResponse::Status500 {
                body: ErrInfo {
                    err_msg: Some("无法找到主窗口".into()),
                },
                access_control_allow_origin: Some("*".into()),
            });
        }
        let win = win.unwrap();
        if let Err(_) = win.emit("notice", new_open_entry_notice(project_id, entry_id)) {
            return Ok(ProjectProjectIdEntryShowEntryIdGetResponse::Status500 {
                body: ErrInfo {
                    err_msg: Some("发送消息失败".into()),
                },
                access_control_allow_origin: Some("*".into()),
            });
        }
        return Ok(ProjectProjectIdEntryShowEntryIdGetResponse::Status200 {
            body: json!({}),
            access_control_allow_origin: Some("*".into()),
        });
    }

    /// 列出内容目录和入口
    async fn project_project_id_entry_folder_id_get(
        &self,
        project_id: String,
        folder_id: String,
        access_token: String,
        _context: &C,
    ) -> Result<ProjectProjectIdEntryFolderIdGetResponse, ApiError> {
        let serv_token = get_token(self.app.clone()).await;
        if serv_token != access_token {
            return Ok(ProjectProjectIdEntryFolderIdGetResponse::Status500 {
                body: ErrInfo {
                    err_msg: Some("令牌错误".into()),
                },
                access_control_allow_origin: Some("*".into()),
            });
        }
        let mut parent_folder_id = folder_id;
        if &parent_folder_id == "__ROOT__" {
            let root_folder_id = String::from("");
            parent_folder_id.clone_from(&root_folder_id);
        }
        //列出目录
        let folder_res = entry_api::list_folder(&self.app, &project_id, &parent_folder_id).await;
        if folder_res.is_err() {
            return Ok(ProjectProjectIdEntryFolderIdGetResponse::Status500 {
                body: ErrInfo {
                    err_msg: Some(folder_res.err().unwrap()),
                },
                access_control_allow_origin: Some("*".into()),
            });
        }
        let folder_res = folder_res.unwrap();
        if folder_res.code
            != proto_gen_rust::project_entry_api::list_sub_folder_response::Code::Ok as i32
        {
            return Ok(ProjectProjectIdEntryFolderIdGetResponse::Status500 {
                body: ErrInfo {
                    err_msg: Some(folder_res.err_msg),
                },
                access_control_allow_origin: Some("*".into()),
            });
        }
        //列出内容入口
        let entry_res = entry_api::list_entry(&self.app, &project_id, &parent_folder_id).await;
        if entry_res.is_err() {
            return Ok(ProjectProjectIdEntryFolderIdGetResponse::Status500 {
                body: ErrInfo {
                    err_msg: Some(entry_res.err().unwrap()),
                },
                access_control_allow_origin: Some("*".into()),
            });
        }
        let entry_res = entry_res.unwrap();
        if entry_res.code
            != proto_gen_rust::project_entry_api::list_sub_entry_response::Code::Ok as i32
        {
            return Ok(ProjectProjectIdEntryFolderIdGetResponse::Status500 {
                body: ErrInfo {
                    err_msg: Some(entry_res.err_msg),
                },
                access_control_allow_origin: Some("*".into()),
            });
        }
        let mut ret_list: Vec<local_api_rust::models::EntryInfo> = Vec::new();

        for folder in &folder_res.folder_list {
            ret_list.push(local_api_rust::models::EntryInfo {
                entry_or_folder_id: Some(folder.folder_id.clone()),
                r#type: Some("folder".into()),
                title: Some(folder.folder_title.clone()),
                create_user_id: Some(folder.create_user_id.clone()),
                create_display_name: Some(folder.create_display_name.clone()),
                create_time: Some(folder.create_time),
            });
        }

        for entry in &entry_res.entry_list {
            ret_list.push(local_api_rust::models::EntryInfo {
                entry_or_folder_id: Some(entry.entry_id.clone()),
                r#type: Some("entry".into()),
                title: Some(entry.entry_title.clone()),
                create_user_id: Some(entry.create_user_id.clone()),
                create_display_name: Some(entry.create_display_name.clone()),
                create_time: Some(entry.create_time),
            });
        }

        return Ok(ProjectProjectIdEntryFolderIdGetResponse::Status200 {
            body: ret_list,
            access_control_allow_origin: Some("*".into()),
        });
    }
}
