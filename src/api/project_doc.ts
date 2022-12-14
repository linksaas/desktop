import { invoke } from '@tauri-apps/api/tauri';

export type BaseDocSpace = {
    title: string;
};

export type DocKey = {
    doc_space_id: string;
    project_id: string;
    doc_id: string;
    title: string;
    create_time: number;
    update_time: number;
    create_user_id: string;
    tag_list: string[];
    msg_count: number;
    update_user_id: string;
    create_display_name: string;
    create_logo_uri: string;
    update_display_name: string;
    update_logo_uri: string;
    my_watch: boolean;
    user_perm: UserPerm;
};

export type DocPerm = {
    read_for_all: boolean;
    extra_read_user_id_list: string[];
    write_for_all: boolean;
    extra_write_user_id_list: string[];
};

export type BaseDoc = {
    title: string;
    content: string;
    tag_list: string[];
    doc_perm: DocPerm;
};

export type UserPerm = {
    can_update: boolean;
    can_remove: boolean;
};

export type Doc = {
    doc_id: string;
    base_info: BaseDoc;
    doc_space_id: string;
    project_id: string;
    create_time: number;
    update_time: number;
    create_user_id: string;
    msg_count: number;
    create_display_name: string;
    create_logo_uri: string;
    update_display_name: string;
    update_logo_uri: string;
    my_watch: boolean;
    user_perm: UserPerm;
};

export type ListDocParam = {
    filter_by_tag: boolean;
    tag_list: string[];
    filter_by_watch: boolean;
    watch: boolean;
};

export type DocKeyHistory = {
    history_id: string;
    time_stamp: number;
    update_user_id: string;
    doc_key: DocKey;
};

export type BasicComment = {
    comment_data: string;
    ref_comment_id: string;
};

export type Comment = {
    comment_id: string;
    project_id: string;
    doc_space_id: string;
    doc_id: string;
    basic_comment: BasicComment;
    sender_user_id: string;
    send_time: number;
    sender_logo_uri: string;
    sender_display_name: string;
    ref_comment_data: string;
    ref_user_logo_uri: string;
    ref_user_display_name: string;
}

export type DocSpace = {
    doc_space_id: string;
    base_info: BaseDocSpace;
    project_id: string;
    create_time: number;
    update_time: number;
    create_user_id: string;
    doc_count: number;
    system_doc_space: boolean;
    user_perm: UserPerm;
};

export type CreateDocSpaceRequest = {
    session_id: string;
    project_id: string;
    base_info: BaseDocSpace,
};

export type CreateDocSpaceResponse = {
    code: number;
    err_msg: string;
    doc_space_id: string;
};

export type UpdateDocSpaceRequest = {
    session_id: string;
    project_id: string;
    doc_space_id: string;
    base_info: BaseDocSpace;
};

export type UpdateDocSpaceResponse = {
    code: number;
    err_msg: string;
};

export type ListDocSpaceRequest = {
    session_id: string;
    project_id: string;
};


export type ListDocSpaceResponse = {
    code: number;
    err_msg: string;
    doc_space_list: DocSpace[],
};

export type GetDocSpaceRequest = {
    session_id: string;
    project_id: string;
    doc_space_id: string;
}

export type GetDocSpaceResponse = {
    code: number;
    err_msg: string;
    doc_space: DocSpace;
};

export type RemoveDocSpaceRequest = {
    session_id: string;
    project_id: string;
    doc_space_id: string;
};

export type RemoveDocSpaceResponse = {
    code: number;
    err_msg: string;
};

export type CreateDocRequest = {
    session_id: string;
    project_id: string;
    doc_space_id: string;
    base_info: BaseDoc;
};


export type CreateDocResponse = {
    code: number;
    err_msg: string;
    doc_id: string;
};


export type UpdateDocPermRequest = {
    session_id: string;
    project_id: string;
    doc_space_id: string;
    doc_id: string;
    doc_perm: DocPerm;
};

export type UpdateDocPermResponse = {
    code: number;
    err_msg: string;
};

export type StartUpdateDocRequest = {
    session_id: string;
    project_id: string;
    doc_space_id: string;
    doc_id: string;
};

export type StartUpdateDocResponse = {
    code: number;
    err_msg: string;
};


export type KeepUpdateDocRequest = {
    session_id: string;
    doc_id: string;
};


export type KeepUpdateDocResponse = {
    code: number;
    err_msg: string;
    keep_update: boolean;
};



export type UpdateDocContentRequest = {
    session_id: string;
    project_id: string;
    doc_space_id: string;
    doc_id: string;
    title: string;
    content: string;
};

export type UpdateDocContentResponse = {
    code: number;
    err_msg: string;
};


export type UpdateDocTagsRequest = {
    session_id: string;
    project_id: string;
    doc_space_id: string;
    doc_id: string;
    tag_list: string[];
};

export type UpdateDocTagsResponse = {
    code: number;
    err_msg: string;
};


export type ListDocTagsRequest = {
    session_id: string;
    project_id: string;
    filter_by_doc_space_id: boolean;
    doc_space_id: string;
};

export type ListDocTagsResponse = {
    code: number;
    err_msg: string;
    tag_list: string[];
};

export type ListDocKeyRequest = {
    session_id: string;
    project_id: string;
    filter_by_doc_space_id: boolean;
    doc_space_id: string;
    list_param: ListDocParam;
    offset: number;
    limit: number;
};

export type ListDocKeyResponse = {
    code: number;
    err_msg: string;
    total_count: number;
    doc_key_list: DocKey[];
};

export type GetDocKeyRequest = {
    session_id: string;
    project_id: string;
    doc_space_id: string;
    doc_id: string;
};

export type GetDocKeyResponse = {
    code: number;
    err_msg: string;
    doc_key: DocKey;
};

export type GetDocRequest = {
    session_id: string;
    project_id: string;
    doc_space_id: string;
    doc_id: string;
};

export type GetDocResponse = {
    code: number;
    err_msg: string;
    doc: Doc;
};

export type MoveDocRequest = {
    session_id: string;
    project_id: string;
    doc_space_id: string;
    doc_id: string;
    dest_doc_space_id: string;
};

export type MoveDocResponse = {
    code: number;
    err_msg: string;
};

export type RemoveDocRequest = {
    session_id: string;
    project_id: string;
    doc_space_id: string;
    doc_id: string;
};


export type RemoveDocResponse = {
    code: number;
    err_msg: string;
};


export type ListDocKeyHistoryRequest = {
    session_id: string;
    project_id: string;
    doc_space_id: string;
    doc_id: string;
};


export type ListDocKeyHistoryResponse = {
    code: number;
    err_msg: string;
    history_list: DocKeyHistory[];
};

export type GetDocInHistoryRequest = {
    session_id: string;
    project_id: string;
    doc_space_id: string;
    doc_id: string;
    history_id: string;
};


export type GetDocInHistoryResponse = {
    code: number;
    err_msg: string;
    doc: Doc;
};

export type RecoverDocInHistoryRequest = {
    session_id: string;
    project_id: string;
    doc_space_id: string;
    doc_id: string;
    history_id: string;
};

export type RecoverDocInHistoryResponse = {
    code: number;
    err_msg: string;
};


export type ListDocKeyInRecycleRequest = {
    session_id: string;
    project_id: string;
    offset: number;
    limit: number;
};

export type ListDocKeyInRecycleResponse = {
    code: number;
    err_msg: string;
    total_count: number;
    doc_key_list: DocKey[];
};

export type GetDocKeyInRecycleRequest = {
    session_id: string;
    project_id: string;
    doc_space_id: string;
    doc_id: string;
};

export type GetDocKeyInRecycleResponse = {
    code: number;
    err_msg: string;
    doc_key: DocKey;
};

export type GetDocInRecycleRequest = {
    session_id: string;
    project_id: string;
    doc_space_id: string;
    doc_id: string;
};


export type GetDocInRecycleResponse = {
    code: number;
    err_msg: string;
    doc: Doc;
};

export type RemoveDocInRecycleRequest = {
    session_id: string;
    project_id: string;
    doc_space_id: string;
    doc_id: string;
};


export type RemoveDocInRecycleResponse = {
    code: number;
    err_msg: string;
};


export type RecoverDocInRecycleRequest = {
    session_id: string;
    project_id: string;
    doc_space_id: string;
    doc_id: string;
};


export type RecoverDocInRecycleResponse = {
    code: number;
    err_msg: string;
};


export type WatchDocRequest = {
    session_id: string;
    project_id: string;
    doc_space_id: string;
    doc_id: string;
};

export type WatchDocResponse = {
    code: number;
    err_msg: string;
};


export type UnWatchDocRequest = {
    session_id: string;
    project_id: string;
    doc_space_id: string;
    doc_id: string;
};


export type UnWatchDocResponse = {
    code: number;
    err_msg: string;
};


export type AddCommentRequest = {
    session_id: string;
    project_id: string;
    doc_space_id: string;
    doc_id: string;
    comment: BasicComment;
};

export type AddCommentResponse = {
    code: number;
    err_msg: string;
    comment_id: string;
};


export type ListCommentRequest = {
    session_id: string;
    project_id: string;
    doc_space_id: string;
    doc_id: string;
    offset: number;
    limit: number;
};

export type ListCommentResponse = {
    code: number;
    err_msg: string;
    total_count: number;
    comment_list: Comment[];
};


export type RemoveCommentRequest = {
    session_id: string;
    project_id: string;
    doc_space_id: string;
    doc_id: string;
    comment_id: string;
};


export type RemoveCommentResponse = {
    code: number;
    err_msg: string;
};

export type GetLastViewDocRequest = {
    session_id: string;
    project_id: string;
};

export type GetLastViewDocResponse = {
    code: number;
    err_msg: string;
    has_last_view: boolean;
    doc_space_id: string;
    doc_id: string;
};

//??????????????????
export async function create_doc_space(request: CreateDocSpaceRequest): Promise<CreateDocSpaceResponse> {
    const cmd = 'plugin:project_doc_api|create_doc_space';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<CreateDocSpaceResponse>(cmd, {
        request,
    });
}

//??????????????????
export async function update_doc_space(request: UpdateDocSpaceRequest): Promise<UpdateDocSpaceResponse> {
    const cmd = 'plugin:project_doc_api|update_doc_space';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<UpdateDocSpaceResponse>(cmd, {
        request,
    });
}

//??????????????????
export async function list_doc_space(request: ListDocSpaceRequest): Promise<ListDocSpaceResponse> {
    const cmd = 'plugin:project_doc_api|list_doc_space';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<ListDocSpaceResponse>(cmd, {
        request,
    });
}

//????????????????????????
export async function get_doc_space(request: GetDocSpaceRequest): Promise<GetDocSpaceResponse> {
    const cmd = 'plugin:project_doc_api|get_doc_space';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<GetDocSpaceResponse>(cmd, {
        request,
    });
}

//??????????????????
export async function remove_doc_space(request: RemoveDocSpaceRequest): Promise<RemoveDocSpaceResponse> {
    const cmd = 'plugin:project_doc_api|remove_doc_space';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<RemoveDocSpaceResponse>(cmd, {
        request,
    });
}

//????????????
export async function create_doc(request: CreateDocRequest): Promise<CreateDocResponse> {
    const cmd = 'plugin:project_doc_api|create_doc';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<CreateDocResponse>(cmd, {
        request,
    });
}

//??????????????????
export async function update_doc_perm(request: UpdateDocPermRequest): Promise<UpdateDocPermResponse> {
    const cmd = 'plugin:project_doc_api|update_doc_perm';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<UpdateDocPermResponse>(cmd, {
        request,
    });
}

//????????????????????????
export async function start_update_doc(request: StartUpdateDocRequest): Promise<StartUpdateDocResponse> {
    const cmd = 'plugin:project_doc_api|start_update_doc';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<StartUpdateDocResponse>(cmd, {
        request,
    });
}

//??????????????????????????????(??????)
export async function keep_update_doc(request: KeepUpdateDocRequest): Promise<KeepUpdateDocResponse> {
    const cmd = 'plugin:project_doc_api|keep_update_doc';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<KeepUpdateDocResponse>(cmd, {
        request,
    });
}

//??????????????????
export async function update_doc_content(request: UpdateDocContentRequest): Promise<UpdateDocContentResponse> {
    const cmd = 'plugin:project_doc_api|update_doc_content';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<UpdateDocContentResponse>(cmd, {
        request,
    });
}

//??????????????????
export async function update_doc_tags(request: UpdateDocTagsRequest): Promise<UpdateDocTagsResponse> {
    const cmd = 'plugin:project_doc_api|update_doc_tags';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<UpdateDocTagsResponse>(cmd, {
        request,
    });
}

//????????????????????????
export async function list_doc_tags(request: ListDocTagsRequest): Promise<ListDocTagsResponse> {
    const cmd = 'plugin:project_doc_api|list_doc_tags';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<ListDocTagsResponse>(cmd, {
        request,
    });
}

//????????????key
export async function list_doc_key(request: ListDocKeyRequest): Promise<ListDocKeyResponse> {
    const cmd = 'plugin:project_doc_api|list_doc_key';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<ListDocKeyResponse>(cmd, {
        request,
    });
}

//????????????key
export async function get_doc_key(request: GetDocKeyRequest): Promise<GetDocKeyResponse> {
    const cmd = 'plugin:project_doc_api|get_doc_key';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<GetDocKeyResponse>(cmd, {
        request,
    });
}

//????????????
export async function get_doc(request: GetDocRequest): Promise<GetDocResponse> {
    const cmd = 'plugin:project_doc_api|get_doc';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<GetDocResponse>(cmd, {
        request,
    });
}

//????????????
export async function move_doc(request: MoveDocRequest): Promise<MoveDocResponse> {
    const cmd = 'plugin:project_doc_api|move_doc';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<MoveDocResponse>(cmd, {
        request,
    });
}

//????????????
export async function remove_doc(request: RemoveDocRequest): Promise<RemoveDocResponse> {
    const cmd = 'plugin:project_doc_api|remove_doc';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<RemoveDocResponse>(cmd, {
        request,
    });
}

//????????????????????????
export async function list_doc_key_history(request: ListDocKeyHistoryRequest): Promise<ListDocKeyHistoryResponse> {
    const cmd = 'plugin:project_doc_api|list_doc_key_history';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<ListDocKeyHistoryResponse>(cmd, {
        request,
    });
}

//????????????????????????
export async function get_doc_in_history(request: GetDocInHistoryRequest): Promise<GetDocInHistoryResponse> {
    const cmd = 'plugin:project_doc_api|get_doc_in_history';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<GetDocInHistoryResponse>(cmd, {
        request,
    });
}

//?????????????????????
export async function recover_doc_in_history(request: RecoverDocInHistoryRequest): Promise<RecoverDocInHistoryResponse> {
    const cmd = 'plugin:project_doc_api|recover_doc_in_history';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<RecoverDocInHistoryResponse>(cmd, {
        request,
    });
}

//?????????????????????key
export async function list_doc_key_in_recycle(request: ListDocKeyInRecycleRequest): Promise<ListDocKeyInRecycleResponse> {
    const cmd = 'plugin:project_doc_api|list_doc_key_in_recycle';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<ListDocKeyInRecycleResponse>(cmd, {
        request,
    });
}

//?????????????????????key
export async function get_doc_key_in_recycle(request: GetDocKeyInRecycleRequest): Promise<GetDocKeyInRecycleResponse> {
    const cmd = 'plugin:project_doc_api|get_doc_key_in_recycle';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<GetDocKeyInRecycleResponse>(cmd, {
        request,
    });
}

//????????????????????????
export async function get_doc_in_recycle(request: GetDocInRecycleRequest): Promise<GetDocInRecycleResponse> {
    const cmd = 'plugin:project_doc_api|get_doc_in_recycle';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<GetDocInRecycleResponse>(cmd, {
        request,
    });
}

//????????????????????????
export async function remove_doc_in_recycle(request: RemoveDocInRecycleRequest): Promise<RemoveDocInRecycleResponse> {
    const cmd = 'plugin:project_doc_api|remove_doc_in_recycle';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<RemoveDocInRecycleResponse>(cmd, {
        request,
    });
}

//????????????????????????
export async function recover_doc_in_recycle(request: RecoverDocInRecycleRequest): Promise<RecoverDocInRecycleResponse> {
    const cmd = 'plugin:project_doc_api|recover_doc_in_recycle';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<RecoverDocInRecycleResponse>(cmd, {
        request,
    });
}

//????????????
export async function watch_doc(request: WatchDocRequest): Promise<WatchDocResponse> {
    const cmd = 'plugin:project_doc_api|watch_doc';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<WatchDocResponse>(cmd, {
        request,
    });
}

//??????????????????
export async function un_watch_doc(request: UnWatchDocRequest): Promise<UnWatchDocResponse> {
    const cmd = 'plugin:project_doc_api|un_watch_doc';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<UnWatchDocResponse>(cmd, {
        request,
    });
}

//????????????
export async function add_comment(request: AddCommentRequest): Promise<AddCommentResponse> {
    const cmd = 'plugin:project_doc_api|add_comment';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<AddCommentResponse>(cmd, {
        request,
    });
}

//????????????
export async function list_comment(request: ListCommentRequest): Promise<ListCommentResponse> {
    const cmd = 'plugin:project_doc_api|list_comment';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<ListCommentResponse>(cmd, {
        request,
    });
}

//????????????
export async function remove_comment(request: RemoveCommentRequest): Promise<ListCommentResponse> {
    const cmd = 'plugin:project_doc_api|remove_comment';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<ListCommentResponse>(cmd, {
        request,
    });
}

//???????????????????????????
export async function get_last_view_doc(request: GetLastViewDocRequest): Promise<GetLastViewDocResponse> {
    const cmd = 'plugin:project_doc_api|get_last_view_doc';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<GetLastViewDocResponse>(cmd, {
        request,
    });
}