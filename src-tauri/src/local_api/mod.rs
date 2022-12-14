use reqwest::blocking::ClientBuilder;
use std::io::Read;
use tauri::async_runtime::Mutex;
use tauri::{
    plugin::{Plugin, Result as PluginResult},
    AppHandle, Invoke, Manager, PageLoadPayload, Runtime, Window,
};

mod access_check;
mod doc_space_api;
mod event_api;
mod issue_api;
mod member_api;
mod channel_api;
mod project_api;
mod vc_api;
mod testcase_api;
mod notice;
mod server;

#[derive(Default)]
pub struct ServPort(Mutex<Option<i16>>);

#[tauri::command]
pub fn remove_info_file() {
    if let Some(home_dir) = dirs::home_dir() {
        let file_path = format!("{}/.linksaas/local_api", home_dir.to_str().unwrap());
        if let Err(err) = std::fs::remove_file(file_path) {
            println!("{}", err);
        }
    }
}

#[tauri::command]
async fn get_port<R: Runtime>(app_handle: AppHandle<R>) -> i16 {
    let port = app_handle.state::<ServPort>().inner();
    if let Some(value) = port.0.lock().await.clone() {
        return value;
    }
    return 0;
}

pub fn is_instance_run() -> bool {
    let home_dir = dirs::home_dir();
    if home_dir.is_none() {
        return false;
    }
    let home_dir = home_dir.unwrap();
    let file_path = format!("{}/.linksaas/local_api", home_dir.to_str().unwrap());
    let file = std::fs::OpenOptions::new().read(true).open(file_path);
    if file.is_err() {
        return false;
    }
    let mut file = file.unwrap();
    let mut data: Vec<u8> = Vec::new();
    if let Ok(_) = file.read_to_end(&mut data) {
        if let Ok(addr) = String::from_utf8(data) {
            let builder = ClientBuilder::new();
            let client = builder.build();
            if client.is_err() {
                return false;
            }
            let client = client.unwrap();
            let hello_res = client.get(format!("http://{}/hello", &addr)).send();
            if hello_res.is_err() {
                return false;
            }
            let hello_res = hello_res.unwrap();
            let hello_res_str = hello_res.text_with_charset("utf8");
            if hello_res_str.is_err() {
                return false;
            }
            let hello_res_str = hello_res_str.unwrap();
            if hello_res_str.eq("hello linksaas") == false {
                return false;
            }
            //??????show
            let show_res = client.get(format!("http://{}/show", &addr)).send();
            if show_res.is_err() {
                println!("{:?}", show_res.err().unwrap());
            }
            return true;
        }
    }
    return false;
}

pub struct LocalApiPlugin {
    invoke_handler: Box<dyn Fn(Invoke) + Send + Sync + 'static>,
}

impl LocalApiPlugin {
    pub fn new() -> Self {
        Self {
            invoke_handler: Box::new(tauri::generate_handler![remove_info_file, get_port]),
        }
    }
}

impl Plugin<tauri::Wry> for LocalApiPlugin {
    fn name(&self) -> &'static str {
        "local_api"
    }
    fn initialization_script(&self) -> Option<String> {
        None
    }

    fn initialize(&mut self, app: &AppHandle, _config: serde_json::Value) -> PluginResult<()> {
        let handle = app.clone();
        app.manage(ServPort(Default::default()));
        tauri::async_runtime::spawn(async move {
            server::run(handle).await;
        });
        Ok(())
    }

    fn created(&mut self, _window: Window) {}

    fn on_page_load(&mut self, _window: Window, _payload: PageLoadPayload) {}

    fn extend_api(&mut self, message: Invoke) {
        (self.invoke_handler)(message)
    }
}
