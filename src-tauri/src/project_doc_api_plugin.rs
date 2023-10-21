use crate::notice_decode::new_wrong_session_notice;
use proto_gen_rust::project_doc_api::project_doc_api_client::ProjectDocApiClient;
use proto_gen_rust::project_doc_api::*;
use tauri::{
    plugin::{Plugin, Result as PluginResult},
    AppHandle, Invoke, PageLoadPayload, Runtime, Window,
};

#[tauri::command]
async fn create_doc_space<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: CreateDocSpaceRequest,
) -> Result<CreateDocSpaceResponse, String> {
    let chan = super::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = ProjectDocApiClient::new(chan.unwrap());
    match client.create_doc_space(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == create_doc_space_response::Code::WrongSession as i32 {
                if let Err(err) = window.emit(
                    "notice",
                    new_wrong_session_notice("create_doc_space".into()),
                ) {
                    println!("{:?}", err);
                }
            }
            return Ok(inner_resp);
        }
        Err(status) => Err(status.message().into()),
    }
}

#[tauri::command]
async fn update_doc_space<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: UpdateDocSpaceRequest,
) -> Result<UpdateDocSpaceResponse, String> {
    let chan = super::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = ProjectDocApiClient::new(chan.unwrap());
    match client.update_doc_space(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == update_doc_space_response::Code::WrongSession as i32 {
                if let Err(err) = window.emit(
                    "notice",
                    new_wrong_session_notice("update_doc_space".into()),
                ) {
                    println!("{:?}", err);
                }
            }
            return Ok(inner_resp);
        }
        Err(status) => Err(status.message().into()),
    }
}

#[tauri::command]
async fn list_doc_space<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: ListDocSpaceRequest,
) -> Result<ListDocSpaceResponse, String> {
    let chan = super::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = ProjectDocApiClient::new(chan.unwrap());
    match client.list_doc_space(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == list_doc_space_response::Code::WrongSession as i32 {
                if let Err(err) =
                    window.emit("notice", new_wrong_session_notice("list_doc_space".into()))
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
async fn get_doc_space<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: GetDocSpaceRequest,
) -> Result<GetDocSpaceResponse, String> {
    let chan = super::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = ProjectDocApiClient::new(chan.unwrap());
    match client.get_doc_space(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == get_doc_space_response::Code::WrongSession as i32 {
                if let Err(err) =
                    window.emit("notice", new_wrong_session_notice("get_doc_space".into()))
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
async fn remove_doc_space<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: RemoveDocSpaceRequest,
) -> Result<RemoveDocSpaceResponse, String> {
    let chan = super::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = ProjectDocApiClient::new(chan.unwrap());
    match client.remove_doc_space(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == remove_doc_space_response::Code::WrongSession as i32 {
                if let Err(err) = window.emit(
                    "notice",
                    new_wrong_session_notice("remove_doc_space".into()),
                ) {
                    println!("{:?}", err);
                }
            }
            return Ok(inner_resp);
        }
        Err(status) => Err(status.message().into()),
    }
}

#[tauri::command]
async fn create_doc<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: CreateDocRequest,
) -> Result<CreateDocResponse, String> {
    let chan = super::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = ProjectDocApiClient::new(chan.unwrap());
    match client.create_doc(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == create_doc_response::Code::WrongSession as i32 {
                if let Err(err) =
                    window.emit("notice", new_wrong_session_notice("create_doc".into()))
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
async fn update_doc_perm<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: UpdateDocPermRequest,
) -> Result<UpdateDocPermResponse, String> {
    let chan = super::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = ProjectDocApiClient::new(chan.unwrap());
    match client.update_doc_perm(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == update_doc_perm_response::Code::WrongSession as i32 {
                if let Err(err) =
                    window.emit("notice", new_wrong_session_notice("update_doc_perm".into()))
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
async fn start_update_doc<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: StartUpdateDocRequest,
) -> Result<StartUpdateDocResponse, String> {
    let chan = super::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = ProjectDocApiClient::new(chan.unwrap());
    match client.start_update_doc(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == start_update_doc_response::Code::WrongSession as i32 {
                if let Err(err) = window.emit(
                    "notice",
                    new_wrong_session_notice("start_update_doc".into()),
                ) {
                    println!("{:?}", err);
                }
            }
            return Ok(inner_resp);
        }
        Err(status) => Err(status.message().into()),
    }
}

#[tauri::command]
async fn keep_update_doc<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: KeepUpdateDocRequest,
) -> Result<KeepUpdateDocResponse, String> {
    let chan = super::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = ProjectDocApiClient::new(chan.unwrap());
    match client.keep_update_doc(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == keep_update_doc_response::Code::WrongSession as i32 {
                if let Err(err) =
                    window.emit("notice", new_wrong_session_notice("keep_update_doc".into()))
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
async fn update_doc_content<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: UpdateDocContentRequest,
) -> Result<UpdateDocContentResponse, String> {
    let chan = super::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = ProjectDocApiClient::new(chan.unwrap());
    match client.update_doc_content(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == update_doc_content_response::Code::WrongSession as i32 {
                if let Err(err) = window.emit(
                    "notice",
                    new_wrong_session_notice("update_doc_content".into()),
                ) {
                    println!("{:?}", err);
                }
            }
            return Ok(inner_resp);
        }
        Err(status) => Err(status.message().into()),
    }
}

#[tauri::command]
async fn list_doc_key<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: ListDocKeyRequest,
) -> Result<ListDocKeyResponse, String> {
    let chan = super::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = ProjectDocApiClient::new(chan.unwrap());
    match client.list_doc_key(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == list_doc_key_response::Code::WrongSession as i32 {
                if let Err(err) =
                    window.emit("notice", new_wrong_session_notice("list_doc_key".into()))
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
async fn get_doc_key<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: GetDocKeyRequest,
) -> Result<GetDocKeyResponse, String> {
    let chan = super::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = ProjectDocApiClient::new(chan.unwrap());
    match client.get_doc_key(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == get_doc_key_response::Code::WrongSession as i32 {
                if let Err(err) =
                    window.emit("notice", new_wrong_session_notice("get_doc_key".into()))
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
async fn get_doc<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: GetDocRequest,
) -> Result<GetDocResponse, String> {
    let chan = super::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = ProjectDocApiClient::new(chan.unwrap());
    match client.get_doc(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == get_doc_response::Code::WrongSession as i32 {
                if let Err(err) = window.emit("notice", new_wrong_session_notice("get_doc".into()))
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
async fn move_doc<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: MoveDocRequest,
) -> Result<MoveDocResponse, String> {
    let chan = super::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = ProjectDocApiClient::new(chan.unwrap());
    match client.move_doc(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == move_doc_response::Code::WrongSession as i32 {
                if let Err(err) =
                    window.emit("notice", new_wrong_session_notice("move_doc".into()))
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
async fn remove_doc<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: RemoveDocRequest,
) -> Result<RemoveDocResponse, String> {
    let chan = super::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = ProjectDocApiClient::new(chan.unwrap());
    match client.remove_doc(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == remove_doc_response::Code::WrongSession as i32 {
                if let Err(err) =
                    window.emit("notice", new_wrong_session_notice("remove_doc".into()))
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
async fn update_tag_id_list<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: UpdateTagIdListRequest,
) -> Result<UpdateTagIdListResponse, String> {
    let chan = super::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = ProjectDocApiClient::new(chan.unwrap());
    match client.update_tag_id_list(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == update_tag_id_list_response::Code::WrongSession as i32 {
                if let Err(err) =
                    window.emit("notice", new_wrong_session_notice("update_tag_id_list".into()))
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
async fn list_doc_key_history<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: ListDocKeyHistoryRequest,
) -> Result<ListDocKeyHistoryResponse, String> {
    let chan = super::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = ProjectDocApiClient::new(chan.unwrap());
    match client.list_doc_key_history(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == list_doc_key_history_response::Code::WrongSession as i32 {
                if let Err(err) = window.emit(
                    "notice",
                    new_wrong_session_notice("list_doc_key_history".into()),
                ) {
                    println!("{:?}", err);
                }
            }
            return Ok(inner_resp);
        }
        Err(status) => Err(status.message().into()),
    }
}

#[tauri::command]
async fn get_doc_in_history<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: GetDocInHistoryRequest,
) -> Result<GetDocInHistoryResponse, String> {
    let chan = super::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = ProjectDocApiClient::new(chan.unwrap());
    match client.get_doc_in_history(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == get_doc_in_history_response::Code::WrongSession as i32 {
                if let Err(err) = window.emit(
                    "notice",
                    new_wrong_session_notice("get_doc_in_history".into()),
                ) {
                    println!("{:?}", err);
                }
            }
            return Ok(inner_resp);
        }
        Err(status) => Err(status.message().into()),
    }
}

#[tauri::command]
async fn recover_doc_in_history<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: RecoverDocInHistoryRequest,
) -> Result<RecoverDocInHistoryResponse, String> {
    let chan = super::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = ProjectDocApiClient::new(chan.unwrap());
    match client.recover_doc_in_history(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == recover_doc_in_history_response::Code::WrongSession as i32 {
                if let Err(err) = window.emit(
                    "notice",
                    new_wrong_session_notice("recover_doc_in_history".into()),
                ) {
                    println!("{:?}", err);
                }
            }
            return Ok(inner_resp);
        }
        Err(status) => Err(status.message().into()),
    }
}


#[tauri::command]
async fn list_doc_key_in_recycle<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: ListDocKeyInRecycleRequest,
) -> Result<ListDocKeyInRecycleResponse, String> {
    let chan = super::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = ProjectDocApiClient::new(chan.unwrap());
    match client.list_doc_key_in_recycle(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == list_doc_key_in_recycle_response::Code::WrongSession as i32 {
                if let Err(err) = window.emit(
                    "notice",
                    new_wrong_session_notice("list_doc_key_in_recycle".into()),
                ) {
                    println!("{:?}", err);
                }
            }
            return Ok(inner_resp);
        }
        Err(status) => Err(status.message().into()),
    }
}

#[tauri::command]
async fn get_doc_key_in_recycle<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: GetDocKeyInRecycleRequest,
) -> Result<GetDocKeyInRecycleResponse, String> {
    let chan = super::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = ProjectDocApiClient::new(chan.unwrap());
    match client.get_doc_key_in_recycle(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == get_doc_key_in_recycle_response::Code::WrongSession as i32 {
                if let Err(err) = window.emit(
                    "notice",
                    new_wrong_session_notice("get_doc_key_in_recycle".into()),
                ) {
                    println!("{:?}", err);
                }
            }
            return Ok(inner_resp);
        }
        Err(status) => Err(status.message().into()),
    }
}

#[tauri::command]
async fn get_doc_in_recycle<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: GetDocInRecycleRequest,
) -> Result<GetDocInRecycleResponse, String> {
    let chan = super::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = ProjectDocApiClient::new(chan.unwrap());
    match client.get_doc_in_recycle(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == get_doc_in_recycle_response::Code::WrongSession as i32 {
                if let Err(err) = window.emit(
                    "notice",
                    new_wrong_session_notice("get_doc_in_recycle".into()),
                ) {
                    println!("{:?}", err);
                }
            }
            return Ok(inner_resp);
        }
        Err(status) => Err(status.message().into()),
    }
}

#[tauri::command]
async fn remove_doc_in_recycle<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: RemoveDocInRecycleRequest,
) -> Result<RemoveDocInRecycleResponse, String> {
    let chan = super::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = ProjectDocApiClient::new(chan.unwrap());
    match client.remove_doc_in_recycle(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == remove_doc_in_recycle_response::Code::WrongSession as i32 {
                if let Err(err) = window.emit(
                    "notice",
                    new_wrong_session_notice("remove_doc_in_recycle".into()),
                ) {
                    println!("{:?}", err);
                }
            }
            return Ok(inner_resp);
        }
        Err(status) => Err(status.message().into()),
    }
}

#[tauri::command]
async fn recover_doc_in_recycle<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: RecoverDocInRecycleRequest,
) -> Result<RecoverDocInRecycleResponse, String> {
    let chan = super::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = ProjectDocApiClient::new(chan.unwrap());
    match client.recover_doc_in_recycle(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == recover_doc_in_recycle_response::Code::WrongSession as i32 {
                if let Err(err) = window.emit(
                    "notice",
                    new_wrong_session_notice("recover_doc_in_recycle".into()),
                ) {
                    println!("{:?}", err);
                }
            }
            return Ok(inner_resp);
        }
        Err(status) => Err(status.message().into()),
    }
}

#[tauri::command]
async fn get_last_view_doc<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: GetLastViewDocRequest,
) -> Result<GetLastViewDocResponse, String> {
    let chan = super::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = ProjectDocApiClient::new(chan.unwrap());
    match client.get_last_view_doc(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == get_last_view_doc_response::Code::WrongSession as i32 {
                if let Err(err) = window.emit(
                    "notice",
                    new_wrong_session_notice("get_last_view_doc".into()),
                ) {
                    println!("{:?}", err);
                }
            }
            return Ok(inner_resp);
        }
        Err(status) => Err(status.message().into()),
    }
}

pub struct ProjectDocApiPlugin<R: Runtime> {
    invoke_handler: Box<dyn Fn(Invoke<R>) + Send + Sync + 'static>,
}

impl<R: Runtime> ProjectDocApiPlugin<R> {
    pub fn new() -> Self {
        Self {
            invoke_handler: Box::new(tauri::generate_handler![
                create_doc_space,
                update_doc_space,
                list_doc_space,
                get_doc_space,
                remove_doc_space,
                create_doc,
                update_doc_perm,
                start_update_doc,
                keep_update_doc,
                update_doc_content,
                list_doc_key,
                get_doc_key,
                get_doc,
                move_doc,
                remove_doc,
                update_tag_id_list,
                list_doc_key_history,
                get_doc_in_history,
                recover_doc_in_history,
                list_doc_key_in_recycle,
                get_doc_key_in_recycle,
                get_doc_in_recycle,
                remove_doc_in_recycle,
                recover_doc_in_recycle,
                get_last_view_doc,
            ]),
        }
    }
}

impl<R: Runtime> Plugin<R> for ProjectDocApiPlugin<R> {
    fn name(&self) -> &'static str {
        "project_doc_api"
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
