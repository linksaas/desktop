//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

use crate::notice_decode::new_wrong_session_notice;
use proto_gen_rust::api_collection_api::api_collection_api_client::ApiCollectionApiClient;
use proto_gen_rust::api_collection_api::*;

use tauri::{
    plugin::{Plugin, Result as PluginResult},
    AppHandle, Invoke, PageLoadPayload, Runtime, Window,
};

#[tauri::command]
async fn create_rpc<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: CreateRpcRequest,
) -> Result<CreateRpcResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = ApiCollectionApiClient::new(chan.unwrap());
    match client.create_rpc(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == create_rpc_response::Code::WrongSession as i32 {
                if let Err(err) =
                    window.emit("notice", new_wrong_session_notice("create_rpc".into()))
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
async fn get_rpc<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: GetRpcRequest,
) -> Result<GetRpcResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = ApiCollectionApiClient::new(chan.unwrap());
    match client.get_rpc(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == get_rpc_response::Code::WrongSession as i32 {
                if let Err(err) = window.emit("notice", new_wrong_session_notice("get_rpc".into()))
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
async fn update_rpc<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: UpdateRpcRequest,
) -> Result<UpdateRpcResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = ApiCollectionApiClient::new(chan.unwrap());
    match client.update_rpc(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == update_rpc_response::Code::WrongSession as i32 {
                if let Err(err) =
                    window.emit("notice", new_wrong_session_notice("update_rpc".into()))
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
async fn create_open_api<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: CreateOpenApiRequest,
) -> Result<CreateOpenApiResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = ApiCollectionApiClient::new(chan.unwrap());
    match client.create_open_api(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == create_open_api_response::Code::WrongSession as i32 {
                if let Err(err) =
                    window.emit("notice", new_wrong_session_notice("create_open_api".into()))
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
async fn get_open_api<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: GetOpenApiRequest,
) -> Result<GetOpenApiResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = ApiCollectionApiClient::new(chan.unwrap());
    match client.get_open_api(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == get_open_api_response::Code::WrongSession as i32 {
                if let Err(err) =
                    window.emit("notice", new_wrong_session_notice("get_open_api".into()))
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
async fn update_open_api<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: UpdateOpenApiRequest,
) -> Result<UpdateOpenApiResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = ApiCollectionApiClient::new(chan.unwrap());
    match client.update_open_api(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == update_open_api_response::Code::WrongSession as i32 {
                if let Err(err) =
                    window.emit("notice", new_wrong_session_notice("update_open_api".into()))
                {
                    println!("{:?}", err);
                }
            }
            return Ok(inner_resp);
        }
        Err(status) => Err(status.message().into()),
    }
}

pub struct ApiCollectionApiPlugin<R: Runtime> {
    invoke_handler: Box<dyn Fn(Invoke<R>) + Send + Sync + 'static>,
}

impl<R: Runtime> ApiCollectionApiPlugin<R> {
    pub fn new() -> Self {
        Self {
            invoke_handler: Box::new(tauri::generate_handler![
                create_rpc,
                get_rpc,
                update_rpc,
                create_open_api,
                get_open_api,
                update_open_api,
            ]),
        }
    }
}

impl<R: Runtime> Plugin<R> for ApiCollectionApiPlugin<R> {
    fn name(&self) -> &'static str {
        "api_collection_api"
    }
    fn initialization_script(&self) -> Option<String> {
        None
    }

    fn initialize(&mut self, _app: &AppHandle<R>, _config: serde_json::Value) -> PluginResult<()> {
        Ok(())
    }

    fn created(&mut self, _window: Window<R>) {}

    fn on_page_load(&mut self, _window: Window<R>, _payload: PageLoadPayload) {}

    fn extend_api(&mut self, message: Invoke<R>) {
        (self.invoke_handler)(message)
    }
}
