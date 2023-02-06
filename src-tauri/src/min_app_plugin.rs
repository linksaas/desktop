use proto_gen_rust::project_app_api::MinAppPerm;
use std::path::PathBuf;
use std::time::Duration;
use std::{fs, io::Read};
use tauri::async_runtime::Mutex;
use tauri::http::{status::StatusCode, Response};
use tauri::Manager;
use tauri::{
    plugin::{Plugin, Result as PluginResult},
    AppHandle, Invoke, PageLoadPayload, Runtime, Window, WindowBuilder, WindowUrl,
};
use tokio::time::sleep;

const INIT_SCRIPT: &str = r#"
Object.defineProperty(window, "minApp", {
    value: {
        projectId: "__PROJECT_ID__",
        projectName: "__PROJECT_NAME__",
        memberUserId: "__MEMBER_USER_ID__",
        memberDisplayName: "__MEMBER_DISPLAY_NAME__",
        tokenUrl: "__TOKEN_URL__",
        crossHttp: __CROSS_HTTP__
    }
});
"#;

fn get_file_type(url_path: &String) -> &str {
    if url_path.ends_with(".abs") {
        return "audio/x-mpeg";
    }
    if url_path.ends_with(".ai") {
        return "application/postscript";
    }
    if url_path.ends_with(".aif") {
        return "audio/x-aiff";
    }
    if url_path.ends_with(".aifc") {
        return "audio/x-aiff";
    }
    if url_path.ends_with(".aiff") {
        return "audio/x-aiff";
    }
    if url_path.ends_with(".aim") {
        return "application/x-aim";
    }
    if url_path.ends_with(".art") {
        return "image/x-jg";
    }
    if url_path.ends_with(".asf") {
        return "video/x-ms-asf";
    }
    if url_path.ends_with(".asx") {
        return "video/x-ms-asf";
    }
    if url_path.ends_with(".au") {
        return "audio/basic";
    }
    if url_path.ends_with(".avi") {
        return "video/x-msvideo";
    }
    if url_path.ends_with(".avx") {
        return "video/x-rad-screenplay";
    }
    if url_path.ends_with(".bcpio") {
        return "application/x-bcpio";
    }
    if url_path.ends_with(".bin") {
        return "application/octet-stream";
    }
    if url_path.ends_with(".bmp") {
        return "image/bmp";
    }
    if url_path.ends_with(".cdf") {
        return "application/x-cdf";
    }
    if url_path.ends_with(".cer") {
        return "application/x-x509-ca-cert";
    }
    if url_path.ends_with(".class") {
        return "application/java";
    }
    if url_path.ends_with(".cpio") {
        return "application/x-cpio";
    }
    if url_path.ends_with(".csh") {
        return "application/x-csh";
    }
    if url_path.ends_with(".css") {
        return "text/css";
    }
    if url_path.ends_with(".dib") {
        return "image/bmp";
    }
    if url_path.ends_with(".doc") {
        return "application/msword";
    }
    if url_path.ends_with(".dtd") {
        return "text/plain";
    }
    if url_path.ends_with(".dv") {
        return "video/x-dv";
    }
    if url_path.ends_with(".dvi") {
        return "application/x-dvi";
    }
    if url_path.ends_with(".eps") {
        return "application/postscript";
    }
    if url_path.ends_with(".etx") {
        return "text/x-setext";
    }
    if url_path.ends_with(".exe") {
        return "application/octet-stream";
    }
    if url_path.ends_with(".gif") {
        return "image/gif";
    }
    if url_path.ends_with(".gtar") {
        return "application/x-gtar";
    }
    if url_path.ends_with(".gz") {
        return "application/x-gzip";
    }
    if url_path.ends_with(".hdf") {
        return "application/x-hdf";
    }
    if url_path.ends_with(".hqx") {
        return "application/mac-binhex40";
    }
    if url_path.ends_with(".htc") {
        return "text/x-component";
    }
    if url_path.ends_with(".htm") {
        return "text/html";
    }
    if url_path.ends_with(".html") {
        return "text/html";
    }
    if url_path.ends_with(".hqx") {
        return "application/mac-binhex40";
    }
    if url_path.ends_with(".ief") {
        return "image/ief";
    }
    if url_path.ends_with(".jad") {
        return "text/vnd.sun.j2me.app-descriptor";
    }
    if url_path.ends_with(".jar") {
        return "application/java-archive";
    }
    if url_path.ends_with(".java") {
        return "text/plain";
    }
    if url_path.ends_with(".jnlp") {
        return "application/x-java-jnlp-file";
    }
    if url_path.ends_with(".jpe") {
        return "image/jpeg";
    }
    if url_path.ends_with(".jpeg") {
        return "image/jpeg";
    }
    if url_path.ends_with(".jpg") {
        return "image/jpeg";
    }
    if url_path.ends_with(".js") {
        return "text/javascript";
    }
    if url_path.ends_with(".jsf") {
        return "text/plain";
    }
    if url_path.ends_with(".jspf") {
        return "text/plain";
    }
    if url_path.ends_with(".kar") {
        return "audio/x-midi";
    }
    if url_path.ends_with(".latex") {
        return "application/x-latex";
    }
    if url_path.ends_with(".m3u") {
        return "audio/x-mpegurl";
    }
    if url_path.ends_with(".mac") {
        return "image/x-macpaint";
    }
    if url_path.ends_with(".man") {
        return "application/x-troff-man";
    }
    if url_path.ends_with(".me") {
        return "application/x-troff-me";
    }
    if url_path.ends_with(".mid") {
        return "audio/x-midi";
    }
    if url_path.ends_with(".midi") {
        return "audio/x-midi";
    }
    if url_path.ends_with(".mif") {
        return "application/x-mif";
    }
    if url_path.ends_with(".mov") {
        return "video/quicktime";
    }
    if url_path.ends_with(".movie") {
        return "video/x-sgi-movie";
    }
    if url_path.ends_with(".mp1") {
        return "audio/x-mpeg";
    }
    if url_path.ends_with(".mp2") {
        return "audio/x-mpeg";
    }
    if url_path.ends_with(".mp3") {
        return "audio/x-mpeg";
    }
    if url_path.ends_with(".mpa") {
        return "audio/x-mpeg";
    }
    if url_path.ends_with(".mpe") {
        return "video/mpeg";
    }
    if url_path.ends_with(".mpeg") {
        return "video/mpeg";
    }
    if url_path.ends_with(".mpega") {
        return "audio/x-mpeg";
    }
    if url_path.ends_with(".mpg") {
        return "video/mpeg";
    }
    if url_path.ends_with(".mpv2") {
        return "video/mpeg2";
    }
    if url_path.ends_with(".ms") {
        return "application/x-wais-source";
    }
    if url_path.ends_with(".nc") {
        return "application/x-netcdf";
    }
    if url_path.ends_with(".oda") {
        return "application/oda";
    }
    if url_path.ends_with(".pbm") {
        return "image/x-portable-bitmap";
    }
    if url_path.ends_with(".pct") {
        return "image/pict";
    }
    if url_path.ends_with(".pdf") {
        return "application/pdf";
    }
    if url_path.ends_with(".pgm") {
        return "image/x-portable-graymap";
    }
    if url_path.ends_with(".pic") {
        return "image/pict";
    }
    if url_path.ends_with(".pict") {
        return "image/pict";
    }
    if url_path.ends_with(".pls") {
        return "audio/x-scpls";
    }
    if url_path.ends_with(".png") {
        return "image/png";
    }
    if url_path.ends_with(".pnm") {
        return "image/x-portable-anymap";
    }
    if url_path.ends_with(".pnt") {
        return "image/x-macpaint";
    }
    if url_path.ends_with(".ppm") {
        return "image/x-portable-pixmap";
    }
    if url_path.ends_with(".ps") {
        return "application/postscript";
    }
    if url_path.ends_with(".psd") {
        return "image/x-photoshop";
    }
    if url_path.ends_with(".qt") {
        return "video/quicktime";
    }
    if url_path.ends_with(".qti") {
        return "image/x-quicktime";
    }
    if url_path.ends_with(".qtif") {
        return "image/x-quicktime";
    }
    if url_path.ends_with(".ras") {
        return "image/x-cmu-raster";
    }
    if url_path.ends_with(".rgb") {
        return "image/x-rgb";
    }
    if url_path.ends_with(".rm") {
        return "application/vnd.rn-realmedia";
    }
    if url_path.ends_with(".roff") {
        return "application/x-troff";
    }
    if url_path.ends_with(".rtf") {
        return "application/rtf";
    }
    if url_path.ends_with(".rtx") {
        return "text/richtext";
    }
    if url_path.ends_with(".sh") {
        return "application/x-sh";
    }
    if url_path.ends_with(".shar") {
        return "application/x-shar";
    }
    if url_path.ends_with(".sit") {
        return "application/x-stuffit";
    }
    if url_path.ends_with(".smf") {
        return "audio/x-midi";
    }
    if url_path.ends_with(".snd") {
        return "audio/basic";
    }
    if url_path.ends_with(".src") {
        return "application/x-wais-source";
    }
    if url_path.ends_with(".sv4cpio") {
        return "application/x-sv4cpio";
    }
    if url_path.ends_with(".sv4crc") {
        return "application/x-sv4crc";
    }
    if url_path.ends_with(".swf") {
        return "application/x-shockwave-flash";
    }
    if url_path.ends_with(".t") {
        return "application/x-troff";
    }
    if url_path.ends_with(".tar") {
        return "application/x-tar";
    }
    if url_path.ends_with(".tcl") {
        return "application/x-tcl";
    }
    if url_path.ends_with(".tex") {
        return "application/x-tex";
    }
    if url_path.ends_with(".texi") {
        return "application/x-texinfo";
    }
    if url_path.ends_with(".texinfo") {
        return "application/x-texinfo";
    }
    if url_path.ends_with(".tif") {
        return "image/tiff";
    }
    if url_path.ends_with(".tiff") {
        return "image/tiff";
    }
    if url_path.ends_with(".tr") {
        return "application/x-troff";
    }
    if url_path.ends_with(".tsv") {
        return "text/tab-separated-values";
    }
    if url_path.ends_with(".txt") {
        return "text/plain";
    }
    if url_path.ends_with(".ulw") {
        return "audio/basic";
    }
    if url_path.ends_with(".ustar") {
        return "application/x-ustar";
    }
    if url_path.ends_with(".xbm") {
        return "image/x-xbitmap";
    }
    if url_path.ends_with(".xml") {
        return "text/xml";
    }
    if url_path.ends_with(".xpm") {
        return "image/x-xpixmap";
    }
    if url_path.ends_with(".xsl") {
        return "text/xml";
    }
    if url_path.ends_with(".xwd") {
        return "image/x-xwindowdump";
    }
    if url_path.ends_with(".wav") {
        return "audio/x-wav";
    }
    if url_path.ends_with(".svg") {
        return "image/svg+xml";
    }
    if url_path.ends_with(".svgz") {
        return "image/svg+xml";
    }
    if url_path.ends_with(".wbmp") {
        return "image/vnd.wap.wbmp";
    }
    if url_path.ends_with(".wml") {
        return "text/vnd.wap.wml";
    }
    if url_path.ends_with(".wmlc") {
        return "application/vnd.wap.wmlc";
    }
    if url_path.ends_with(".wmls") {
        return "text/vnd.wap.wmlscript";
    }
    if url_path.ends_with(".wmlscriptc") {
        return "application/vnd.wap.wmlscriptc";
    }
    if url_path.ends_with(".wrl") {
        return "x-world/x-vrml";
    }
    if url_path.ends_with(".Z") {
        return "application/x-compress";
    }
    if url_path.ends_with(".z") {
        return "application/x-compress";
    }
    if url_path.ends_with(".zip") {
        return "application/zip";
    }
    return "text/html";
}

fn send_error(code: u16, msg: String, response: &mut Response) {
    response.set_status(StatusCode::from_u16(code).unwrap());
    response.body_mut().clear();
    let content = Vec::from(msg);
    response.body_mut().extend_from_slice(&content);
}

fn send_file_data(data_path: String, url_path: String, response: &mut Response) {
    let mut file_path = PathBuf::from(data_path);
    for sub_path in url_path.split("/") {
        file_path.push(sub_path);
    }
    if url_path.ends_with("/") {
        file_path.push("index.html");
    }

    let file = fs::File::open(file_path);
    if file.is_err() {
        send_error(500, file.err().unwrap().to_string(), response);
        return;
    }
    let mut file = file.unwrap();
    let mut content = vec![];
    let read_res = file.read_to_end(&mut content);
    if read_res.is_err() {
        send_error(404, read_res.err().unwrap().to_string(), response);
        return;
    }

    response.set_status(StatusCode::from_u16(200).unwrap());
    response.set_mimetype(Some(String::from(get_file_type(&url_path))));
    response.body_mut().clear();
    response.body_mut().extend_from_slice(&content);
}

#[derive(Default)]
pub struct DebugPerm(pub Mutex<Option<MinAppPerm>>);

#[derive(serde::Serialize, serde::Deserialize, Clone, PartialEq)]
pub struct StartRequest {
    pub project_id: String,
    pub project_name: String,
    pub member_user_id: String,
    pub member_display_name: String,
    pub token_url: String,
    pub label: String,
    pub title: String,
    pub path: String,
}

#[tauri::command]
async fn start<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: StartRequest,
    perm: MinAppPerm,
) -> Result<(), String> {
    if window.label() != "main" {
        return Err("no permission".into());
    }
    let mut script = INIT_SCRIPT
        .replace("__PROJECT_ID__", &request.project_id)
        .replace(
            "__PROJECT_NAME__",
            &html_escape::encode_script_quoted_text(&request.project_name),
        )
        .replace("__MEMBER_USER_ID__", &request.member_user_id)
        .replace(
            "__MEMBER_DISPLAY_NAME__",
            &html_escape::encode_script_quoted_text(&request.member_display_name),
        )
        .replace(
            "__TOKEN_URL__",
            &html_escape::encode_script_quoted_text(&request.token_url),
        );
    if let Some(net_perm) = perm.net_perm {
        if net_perm.cross_domain_http {
            script = script.replace("__CROSS_HTTP__", "true");
        } else {
            script = script.replace("__CROSS_HTTP__", "false");
        }
    } else {
        script = script.replace("__CROSS_HTTP__", "false");
    }
    
    let init_url = if request.path.starts_with("http://") || request.path.starts_with("https://") {
        match url::Url::parse(&request.path) {
            Ok(res_url) => WindowUrl::External(res_url),
            Err(_) => WindowUrl::App("index.html".into()),
        }
    } else {
        WindowUrl::App("index.html".into())
    };

    let res = WindowBuilder::new(&app_handle, request.label, init_url)
        .title(request.title)
        .visible(true)
        .on_web_resource_request(move |req, response| {
            let req_url = url::Url::parse(req.uri());
            if req_url.is_err() {
                send_error(500, req_url.err().unwrap().to_string(), response);
                return;
            }
            let req_url = req_url.unwrap();
            if req_url.scheme() != "tauri" {
                return;
            }
            send_file_data(request.path.clone(), String::from(req_url.path()), response);
        })
        .initialization_script(&script)
        .build();
    if res.is_err() {
        return Err(res.err().unwrap().to_string());
    }
    Ok(())
}

#[tauri::command]
async fn start_debug<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: StartRequest,
    perm: MinAppPerm,
) -> Result<(), String> {
    let debug_perm = app_handle.state::<DebugPerm>().inner();
    *debug_perm.0.lock().await = Some(perm.clone());

    if let Some(win) = app_handle.get_window(&request.label) {
        win.close().unwrap();
        sleep(Duration::from_millis(100)).await;
    }

    return start(app_handle, window, request, perm).await;
}
pub struct MinAppPlugin<R: Runtime> {
    invoke_handler: Box<dyn Fn(Invoke<R>) + Send + Sync + 'static>,
}

impl<R: Runtime> MinAppPlugin<R> {
    pub fn new() -> Self {
        Self {
            invoke_handler: Box::new(tauri::generate_handler![start, start_debug]),
        }
    }
}

impl<R: Runtime> Plugin<R> for MinAppPlugin<R> {
    fn name(&self) -> &'static str {
        "min_app"
    }
    fn initialization_script(&self) -> Option<String> {
        None
    }

    fn initialize(&mut self, app: &AppHandle<R>, _config: serde_json::Value) -> PluginResult<()> {
        app.manage(DebugPerm(Default::default()));
        Ok(())
    }

    fn created(&mut self, _window: Window<R>) {}

    fn on_page_load(&mut self, _window: Window<R>, _payload: PageLoadPayload) {}

    fn extend_api(&mut self, message: Invoke<R>) {
        (self.invoke_handler)(message)
    }
}
