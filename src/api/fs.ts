import { invoke } from '@tauri-apps/api/tauri';

export type FS_OWNER_TYPE = number;

export const FS_OWNER_TYPE_USER: FS_OWNER_TYPE = 0; //用户文件存储
export const FS_OWNER_TYPE_PROJECT: FS_OWNER_TYPE = 1; //项目文件存储

export type FILE_OWNER_TYPE = number;


export const FILE_OWNER_TYPE_NONE: FILE_OWNER_TYPE = 0;//未设置owner
export const FILE_OWNER_TYPE_USER_PHOTO: FILE_OWNER_TYPE = 1;//用户头像
export const FILE_OWNER_TYPE_USER_DOC: FILE_OWNER_TYPE = 2; //用户知识库文档
export const FILE_OWNER_TYPE_CHANNEL: FILE_OWNER_TYPE = 3; //频道
export const FILE_OWNER_TYPE_ISSUE: FILE_OWNER_TYPE = 4; //工单(任务，缺陷)
export const FILE_OWNER_TYPE_WORK_SNAPSHOT: FILE_OWNER_TYPE = 5; //工作快照
export const FILE_OWNER_TYPE_PROJECT_DOC: FILE_OWNER_TYPE = 6; //文档
export const FILE_OWNER_TYPE_PROJECT_EBOOK: FILE_OWNER_TYPE = 7; //电子书
export const FILE_OWNER_TYPE_PROJECT: FILE_OWNER_TYPE = 99; //项目范围 
export const FILE_OWNER_TYPE_PROJECT_ARTIFACT: FILE_OWNER_TYPE = 8;   //自动化构建结果
export const FILE_OWNER_TYPE_TEST_CASE: FILE_OWNER_TYPE = 9;          //测试用例
export const FILE_OWNER_TYPE_TEST_CASE_RESULT: FILE_OWNER_TYPE = 10;  //测试用例结果





export type DownloadResult = {
    exist_in_local: boolean;
    local_path: string;
    local_dir: string;
};

//下载文件时会产生fsProgress事件，可以通过tauri event api listen
export type FsProgressEvent = {
    total_step: number;
    cur_step: number;
    file_id: string;
    file_size: number;
};

export type WriteFileResponse = {
    code: number;
    err_msg: string;
    file_id: string;
};

export type SetFileOwnerRequest = {
    session_id: string;
    fs_id: string;
    file_id: string;
    owner_type: FILE_OWNER_TYPE;
    owner_id: string;
};

export type SetFileOwnerResponse = {
    code: number;
    err_msg: string;
};

export type CopyFileRequest = {
    session_id: string;
    from_fs_id: string;
    from_file_id: string;
    to_fs_id: string;
};

export type CopyFileResponse = {
    code: number;
    err_msg: string;
    to_file_id: string;
};

export type GetFsStatusRequest = {
    session_id: string;
    fs_id: string;
};

export type FsStatus = {
    fs_id: string;
    owner_type: FS_OWNER_TYPE;
    owner_id: string;
    file_count: number;
    total_file_size: number;
};

export type GetFsStatusResponse = {
    code: number;
    err_msg: string;
    fs_status: FsStatus;
};

export async function stat_local_file(file_path: string): Promise<number> {
    return invoke<number>('plugin:fs_api|stat_local_file', { filePath: file_path });
}

export async function get_cache_file(fs_id: string, file_id: string, file_name: string): Promise<DownloadResult> {
    return invoke<DownloadResult>('plugin:fs_api|get_cache_file', {
        fsId: fs_id,
        fileId: file_id,
        fileName: file_name,
    });
}

export async function download_file(
    session_id: string,
    fs_id: string,
    file_id: string,
    track_id: string,
    as_name: string = ""): Promise<DownloadResult> {
    return invoke<DownloadResult>('plugin:fs_api|download_file', {
        sessionId: session_id,
        fsId: fs_id,
        fileId: file_id,
        trackId: track_id,
        asName: as_name,
    });
}
export async function write_file_base64(
    session_id: string,
    fs_id: string,
    file_name: string,
    data: string,
    track_id: string): Promise<WriteFileResponse> {
    return invoke<WriteFileResponse>('plugin:fs_api|write_file_base64', {
        sessionId: session_id,
        fsId: fs_id,
        fileName: file_name,
        data: data,
        trackId: track_id,
    })
}

export async function write_file(
    session_id: string,
    fs_id: string,
    file_name: string,
    track_id: string): Promise<WriteFileResponse> {
    return invoke<WriteFileResponse>('plugin:fs_api|write_file', {
        sessionId: session_id,
        fsId: fs_id,
        fileName: file_name,
        trackId: track_id,
    })
}

export async function set_file_owner(request: SetFileOwnerRequest): Promise<SetFileOwnerResponse> {
    const cmd = "plugin:fs_api|set_file_owner";
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<SetFileOwnerResponse>(cmd, {
        request: request,
    })
}
export async function copy_file(request: CopyFileRequest): Promise<CopyFileResponse> {
    const cmd = "plugin:fs_api|copy_file";
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<CopyFileResponse>(cmd, {
        request: request,
    })
}
export async function get_fs_status(request: GetFsStatusRequest): Promise<GetFsStatusResponse> {
    return invoke<GetFsStatusResponse>("plugin:fs_api|get_fs_status", {
        request: request,
    })
}

export async function write_thumb_image_file(
    session_id: string,
    fs_id: string,
    file_path: string,
    track_id: string,
    width: number,
    height: number): Promise<WriteFileResponse> {
    return invoke<WriteFileResponse>('plugin:fs_api|write_thumb_image_file', {
        sessionId: session_id,
        fsId: fs_id,
        filePath: file_path,
        trackId: track_id,
        width: width,
        height: height,
    })
}
