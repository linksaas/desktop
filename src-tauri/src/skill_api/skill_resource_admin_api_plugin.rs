use crate::notice_decode::new_wrong_session_notice;
use proto_gen_rust::skill_resource_api::skill_resource_admin_api_client::SkillResourceAdminApiClient;
use proto_gen_rust::skill_resource_api::*;
use tauri::{
    plugin::{Plugin, Result as PluginResult},
    AppHandle, Invoke, PageLoadPayload, Runtime, Window,
};

#[tauri::command]
async fn add<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: AdminAddRequest,
) -> Result<AdminAddResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = SkillResourceAdminApiClient::new(chan.unwrap());
    match client.add(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == admin_add_response::Code::WrongSession as i32
                || inner_resp.code == admin_add_response::Code::NotAuth as i32
            {
                crate::admin_auth_api_plugin::logout(app_handle).await;
                if let Err(err) = window.emit("notice", new_wrong_session_notice("add".into())) {
                    println!("{:?}", err);
                }
            }
            return Ok(inner_resp);
        }
        Err(status) => Err(status.message().into()),
    }
}

#[tauri::command]
async fn update<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: AdminUpdateRequest,
) -> Result<AdminUpdateResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = SkillResourceAdminApiClient::new(chan.unwrap());
    match client.update(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == admin_update_response::Code::WrongSession as i32
                || inner_resp.code == admin_update_response::Code::NotAuth as i32
            {
                crate::admin_auth_api_plugin::logout(app_handle).await;
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
async fn remove<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: AdminRemoveRequest,
) -> Result<AdminRemoveResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = SkillResourceAdminApiClient::new(chan.unwrap());
    match client.remove(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == admin_remove_response::Code::WrongSession as i32
                || inner_resp.code == admin_remove_response::Code::NotAuth as i32
            {
                crate::admin_auth_api_plugin::logout(app_handle).await;
                if let Err(err) = window.emit("notice", new_wrong_session_notice("remove".into())) {
                    println!("{:?}", err);
                }
            }
            return Ok(inner_resp);
        }
        Err(status) => Err(status.message().into()),
    }
}

pub struct SkillResourceAdminApiPlugin<R: Runtime> {
    invoke_handler: Box<dyn Fn(Invoke<R>) + Send + Sync + 'static>,
}

impl<R: Runtime> SkillResourceAdminApiPlugin<R> {
    pub fn new() -> Self {
        Self {
            invoke_handler: Box::new(tauri::generate_handler![add, update, remove,]),
        }
    }
}

impl<R: Runtime> Plugin<R> for SkillResourceAdminApiPlugin<R> {
    fn name(&self) -> &'static str {
        "skill_resource_admin_api"
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
