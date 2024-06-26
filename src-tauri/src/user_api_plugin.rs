//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

use crate::notice_decode::{decode_notice, new_extra_token_notice, new_wrong_session_notice};
use crate::project_cloud_api::net_proxy_api_plugin::stop_all_listen;
use image::EncodableLayout;
use libaes::Cipher;
use prost::Message;
use proto_gen_rust::google::protobuf::Any;
use proto_gen_rust::user_api::user_api_client::UserApiClient;
use proto_gen_rust::user_api::*;
use rand::{thread_rng, Rng};
use rumqttc::AsyncClient as MqttClient;
use rumqttc::{MqttOptions, QoS};
use std::time::Duration;
use tauri::async_runtime::Mutex;
use tauri::Manager;
use tauri::{
    plugin::{Plugin, Result as PluginResult},
    AppHandle, Invoke, PageLoadPayload, Runtime, Window,
};
use tokio::time::sleep;
use url::Url;
use uuid::Uuid;

//不要修改这个常量
const UNLOGIN_USER_TOKEN: &'static str = "VAVPiHGWL6idGXkQ14p9ilvwCoqEQxHw";

#[derive(Default)]
pub struct CurSession(pub Mutex<Option<String>>);

#[derive(Default)]
pub struct CurUserId(pub Mutex<Option<String>>);

#[derive(Default)]
pub struct CurUserSecret(pub Mutex<Option<String>>);

#[derive(Default)]
struct CurNoticeClient(Mutex<Option<MqttClient>>);

async fn keep_alive_run<R: Runtime>(handle: &AppHandle<R>) {
    let mut session_id = String::from("");
    {
        let cur_value = handle.state::<CurSession>().inner();
        let cur_session = cur_value.0.lock().await;
        if let Some(cur_session_id) = cur_session.clone() {
            session_id.clone_from(&cur_session_id);
        }
    }
    if session_id != "" {
        if let Some(chan) = super::get_grpc_chan(&handle).await {
            let mut client = UserApiClient::new(chan);
            let resp = client
                .keep_alive(KeepAliveRequest {
                    session_id: session_id,
                })
                .await;
            if let Err(err) = resp {
                println!("err {}", err);
            } else {
                let window = (&handle).get_window("main").unwrap();
                let resp = resp.unwrap().into_inner();
                if resp.code != keep_alive_response::Code::Ok as i32 {
                    //清空session
                    {
                        let user_id = handle.state::<CurUserId>().inner();
                        *user_id.0.lock().await = None;
                        let user_secret = handle.state::<CurUserSecret>().inner();
                        *user_secret.0.lock().await = None;
                        let user_session = handle.state::<CurSession>().inner();
                        *user_session.0.lock().await = None;
                        let mq_client = handle.state::<CurNoticeClient>().inner();
                        if let Some(c) = mq_client.0.lock().await.clone() {
                            if let Err(err) = c.disconnect().await {
                                println!("{:?}", err);
                            }
                        }
                        *mq_client.0.lock().await = None;
                    }
                    //发送通知
                    let res = window.emit("notice", new_wrong_session_notice("keep_alive".into()));
                    if res.is_err() {
                        println!("{:?}", res);
                    }
                } else {
                    if &resp.new_extra_token != "" {
                        let res =
                            window.emit("notice", new_extra_token_notice(resp.new_extra_token));
                        if res.is_err() {
                            println!("{:?}", res);
                        }
                    }
                }
            }
        }
    }
}

async fn keep_alive<R: Runtime>(app_handle: AppHandle<R>) {
    loop {
        sleep(Duration::from_secs(30)).await;
        keep_alive_run(&app_handle).await;
    }
}

async fn mqtt_event_loop<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    topic: String,
    url: Url,
    option: MqttOptions,
) {
    let (client, mut eventloop) = MqttClient::new(option, 10);
    let sub_res = client.subscribe(topic.clone(), QoS::AtLeastOnce).await;
    if sub_res.is_ok() {
        println!(
            "sub {} {} success",
            (&url).host().unwrap().to_string(),
            topic
        );
        let notice_client = (&app_handle).state::<CurNoticeClient>().inner();
        *notice_client.0.lock().await = Some(client);
        loop {
            let notice = eventloop.poll().await;
            if notice.is_err() {
                println!("disconnect mqtt,error {:?}", notice.err().unwrap());
                return;
            }
            emit_notice(&window, notice.unwrap());
        }
    } else {
        println!("{:?}", sub_res.err().unwrap());
    }
}

fn run_mqtt<R: Runtime>(app_handle: AppHandle<R>, window: Window<R>, notice_key: String, url: Url) {
    tauri::async_runtime::spawn(async move {
        let topic = format!(
            "{notice_key}/{channel}/",
            notice_key = notice_key.trim_matches('/'),
            channel = (&url).path().trim_matches('/')
        );
        let id = Uuid::new_v4().to_string();
        let option = MqttOptions::new(
            id,
            (&url).host().unwrap().to_string(),
            (&url).port().unwrap(),
        );
        loop {
            mqtt_event_loop(
                app_handle.clone(),
                window.clone(),
                topic.clone(),
                url.clone(),
                option.clone(),
            )
            .await;
            {
                let cur_value = (&app_handle).state::<CurSession>().inner();
                let cur_session = cur_value.0.lock().await;
                if cur_session.is_none() {
                    println!("exit run_mqtt");
                    return;
                }
            }
            sleep(Duration::from_secs(5)).await;
        }
    });
}

#[tauri::command]
async fn login<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: LoginRequest,
) -> Result<LoginResponse, String> {
    let chan = super::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = UserApiClient::new(chan.unwrap());
    match client.login(request).await {
        Ok(response) => {
            let ret = response.into_inner();
            let sess = app_handle.state::<CurSession>().inner();
            *sess.0.lock().await = Some(ret.session_id.clone());
            let user_info = ret.user_info.clone();
            if let Some(user_info) = user_info {
                let user_id = app_handle.state::<CurUserId>().inner();
                *user_id.0.lock().await = Some(user_info.user_id);
                let user_secret = app_handle.state::<CurUserSecret>().inner();
                *user_secret.0.lock().await = Some(ret.user_secret.clone());
            }

            let notice_key = ret.notice_key.clone();
            if let Ok(url) = Url::parse(ret.notice_url.clone().as_str()) {
                run_mqtt(app_handle, window, notice_key, url);
            } else {
                println!("xxxxxxxxx");
            }
            Ok(ret)
        }
        Err(status) => Err(status.message().into()),
    }
}

fn emit_notice<R: Runtime>(window: &Window<R>, event: rumqttc::Event) {
    if let rumqttc::Event::Incoming(income_event) = event {
        if let rumqttc::Packet::Publish(pub_event) = income_event {
            if let Ok(any) = Any::decode(pub_event.payload) {
                if let Some(notice) = decode_notice(&any) {
                    let res = window.emit("notice", notice);
                    if res.is_err() {
                        println!("{:?}", res);
                    }
                }
            }
        }
    }
}

#[tauri::command]
async fn logout<R: Runtime>(
    app_handle: AppHandle<R>,
    _window: Window<R>,
    request: LogoutRequest,
) -> Result<LogoutResponse, String> {
    let chan = super::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = UserApiClient::new(chan.unwrap());
    match client.logout(request).await {
        Ok(response) => {
            let sess = app_handle.state::<CurSession>().inner();
            *sess.0.lock().await = None;
            let user_id = app_handle.state::<CurUserId>().inner();
            *user_id.0.lock().await = None;
            let user_secret = app_handle.state::<CurUserSecret>().inner();
            *user_secret.0.lock().await = None;

            let mq_client = (&app_handle).state::<CurNoticeClient>().inner();
            if let Some(c) = mq_client.0.lock().await.clone() {
                c.disconnect().await.unwrap();
            }
            *mq_client.0.lock().await = None;
            //关闭main以外的所有窗口
            let win_map = app_handle.windows();
            for win in win_map.values() {
                if win.label() != "main" && win.label() != "atomGitLogout" {
                    if let Err(err) = win.close() {
                        println!("{:?}", err);
                    }
                }
            }
            //移除本地监听
            stop_all_listen(app_handle).await;
            Ok(response.into_inner())
        }
        Err(status) => Err(status.message().into()),
    }
}

#[tauri::command]
async fn update<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: UpdateRequest,
) -> Result<UpdateResponse, String> {
    let chan = super::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = UserApiClient::new(chan.unwrap());
    match client.update(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == update_response::Code::WrongSession as i32 {
                if let Err(err) = window.emit("notice", new_wrong_session_notice("update".into())) {
                    println!("{:?}", err);
                }
            }
            return Ok(inner_resp);
        }
        Err(status) => Err(status.message().into()),
    }
}

#[tauri::command]
async fn update_feature<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: UpdateFeatureRequest,
) -> Result<UpdateFeatureResponse, String> {
    let chan = super::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = UserApiClient::new(chan.unwrap());
    match client.update_feature(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == update_feature_response::Code::WrongSession as i32 {
                if let Err(err) =
                    window.emit("notice", new_wrong_session_notice("update_feature".into()))
                {
                    println!("{:?}", err);
                }
            }
            return Ok(inner_resp);
        }
        Err(status) => Err(status.message().into()),
    }
}

#[tauri::command]
async fn change_passwd<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: ChangePasswdRequest,
) -> Result<ChangePasswdResponse, String> {
    let chan = super::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = UserApiClient::new(chan.unwrap());
    match client.change_passwd(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == change_passwd_response::Code::WrongSession as i32 {
                if let Err(err) =
                    window.emit("notice", new_wrong_session_notice("change_passwd".into()))
                {
                    println!("{:?}", err);
                }
            }
            return Ok(inner_resp);
        }
        Err(status) => Err(status.message().into()),
    }
}

#[tauri::command]
async fn check_session<R: Runtime>(
    app_handle: AppHandle<R>,
    _window: Window<R>,
    request: CheckSessionRequest,
) -> Result<CheckSessionResponse, String> {
    let chan = super::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = UserApiClient::new(chan.unwrap());
    match client.check_session(request).await {
        Ok(response) => Ok(response.into_inner()),
        Err(status) => Err(status.message().into()),
    }
}

#[tauri::command]
pub async fn get_session<R: Runtime>(app_handle: AppHandle<R>) -> String {
    let cur_value = app_handle.state::<CurSession>().inner();
    let cur_session = cur_value.0.lock().await;
    if let Some(cur_session) = cur_session.clone() {
        return cur_session;
    }
    return "".into();
}

pub async fn get_session_inner(app_handle: &AppHandle) -> String {
    let cur_value = app_handle.state::<CurSession>().inner();
    let cur_session = cur_value.0.lock().await;
    if let Some(cur_session) = cur_session.clone() {
        return cur_session;
    }
    return "".into();
}

#[tauri::command]
pub async fn get_user_id<R: Runtime>(app_handle: AppHandle<R>) -> String {
    let cur_value = app_handle.state::<CurUserId>().inner();
    let cur_user_id = cur_value.0.lock().await;
    if let Some(cur_user_id) = cur_user_id.clone() {
        return cur_user_id;
    }
    return "".into();
}

async fn get_user_secret<R: Runtime>(app_handle: AppHandle<R>) -> String {
    let cur_value = app_handle.state::<CurUserSecret>().inner();
    let cur_user_secret = cur_value.0.lock().await;
    if let Some(cur_user_secret) = cur_user_secret.clone() {
        return cur_user_secret;
    }
    return "".into();
}

pub async fn encrypt<R: Runtime>(
    app_handle: AppHandle<R>,
    data: Vec<u8>,
    default_secret: bool,
) -> Result<Vec<u8>, String> {
    let mut secret = get_user_secret(app_handle).await;
    if &secret == "" || default_secret {
        secret = String::from(UNLOGIN_USER_TOKEN);
    }
    let mut new_secret = [0 as u8; 32];
    new_secret[..32].copy_from_slice(secret.as_bytes());

    let mut iv: [u8; 16] = [0; 16];
    let mut rng = thread_rng();
    let res = rng.try_fill(&mut iv);
    if res.is_err() {
        return Err(res.err().unwrap().to_string());
    }
    let cipher = Cipher::new_256(&new_secret);
    let encrypted = cipher.cbc_encrypt(&iv, data.as_bytes());
    let mut result = Vec::from(iv);
    result.extend(encrypted);
    return Ok(result);
}

pub async fn decrypt<R: Runtime>(
    app_handle: AppHandle<R>,
    data: Vec<u8>,
    default_secret: bool,
) -> Result<Vec<u8>, String> {
    let mut secret = get_user_secret(app_handle).await;
    if &secret == "" || default_secret {
        secret = String::from(UNLOGIN_USER_TOKEN);
    }
    let mut new_secret = [0 as u8; 32];
    new_secret[..32].copy_from_slice(secret.as_bytes());

    if data.len() < 16 {
        return Err("miss iv".into());
    }
    let (iv, data) = data.split_at(16);
    let cipher = Cipher::new_256(&new_secret);
    let decrypted = cipher.cbc_decrypt(iv, data);
    return Ok(decrypted);
}

pub async fn get_user_id_inner(app_handle: &AppHandle) -> String {
    let cur_value = app_handle.state::<CurUserId>().inner();
    let cur_user_id = cur_value.0.lock().await;
    if let Some(cur_user_id) = cur_user_id.clone() {
        return cur_user_id;
    }
    return "".into();
}

pub struct UserApiPlugin<R: Runtime> {
    invoke_handler: Box<dyn Fn(Invoke<R>) + Send + Sync + 'static>,
}

impl<R: Runtime> UserApiPlugin<R> {
    pub fn new() -> Self {
        Self {
            invoke_handler: Box::new(tauri::generate_handler![
                login,
                logout,
                update,
                update_feature,
                change_passwd,
                check_session,
                get_session,
                get_user_id,
            ]),
        }
    }
}

impl<R: Runtime> Plugin<R> for UserApiPlugin<R> {
    fn name(&self) -> &'static str {
        "user_api"
    }
    fn initialization_script(&self) -> Option<String> {
        None
    }

    fn initialize(&mut self, app: &AppHandle<R>, _config: serde_json::Value) -> PluginResult<()> {
        app.manage(CurSession(Default::default()));
        app.manage(CurUserId(Default::default()));
        app.manage(CurUserSecret(Default::default()));
        app.manage(CurNoticeClient(Default::default()));
        let handle = app.clone();
        tauri::async_runtime::spawn(async move {
            keep_alive(handle).await;
        });
        Ok(())
    }

    fn created(&mut self, _window: Window<R>) {}

    fn on_page_load(&mut self, _window: Window<R>, _payload: PageLoadPayload) {}

    fn extend_api(&mut self, message: Invoke<R>) {
        (self.invoke_handler)(message)
    }
}
