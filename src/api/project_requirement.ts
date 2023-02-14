import { invoke } from '@tauri-apps/api/tauri';


export type CateInfo = {
    cate_id: string;
    project_id: string;
    cate_name: string;
    requirement_count: number;
    create_user_id: string;
    create_time: number;
    create_display_name: string;
    create_logo_uri: string;
    update_user_id: string;
    update_time: number;
    update_display_name: string;
    update_logo_uri: string;
};

export type BaseRequirementInfo = {
    title: string;
    content: string;
};

export type RequirementInfo = {
    requirement_id: string;
    cate_id: string;
    project_id: string;
    base_info: BaseRequirementInfo;
    issue_link_count: number;
    comment_count: number;
    create_user_id: string;
    create_time: number;
    create_display_name: string;
    create_logo_uri: string;
    update_user_id: string;
    update_time: number;
    update_display_name: string;
    update_logo_uri: string;
};

export type BasicComment = {
    comment_data: string;
    ref_comment_id: string;
};

export type Comment = {
    comment_id: string;
    project_id: string;
    requirement_id: string;
    basic_comment: BasicComment;
    sender_user_id: string;
    send_time: number;
    sender_logo_uri: string;
    sender_display_name: string;
    ref_comment_data: string;
    ref_user_logo_uri: string;
    ref_user_display_name: string;
};


export type CreateCateRequest = {
    session_id: string;
    project_id: string;
    cate_name: string;
};

export type CreateCateResponse = {
    code: number;
    err_msg: string;
    cate_id: string;
};


export type ListCateRequest = {
    session_id: string;
    project_id: string;
};

export type ListCateResponse = {
    code: number;
    err_msg: string;
    cate_info_list: CateInfo[];
};


export type UpdateCateRequest = {
    session_id: string;
    project_id: string;
    cate_id: string;
    cate_name: string;
};

export type UpdateCateResponse = {
    code: number;
    err_msg: string;
};


export type RemoveCateRequest = {
    session_id: string;
    project_id: string;
    cate_id: string;
};

export type RemoveCateResponse = {
    code: number;
    err_msg: string;
};


export type CreateRequirementRequest = {
    session_id: string;
    project_id: string;
    base_info: BaseRequirementInfo;
    cate_id: string;
};

export type CreateRequirementResponse = {
    code: number;
    err_msg: string;
    requirement_id: string;
};


export type ListRequirementRequest = {
    session_id: string;
    project_id: string;
    filter_by_cate_id: boolean;
    cate_id: string;
    filter_by_keyword: boolean;
    keyword: string;
    filter_by_has_link_issue: boolean;
    has_link_issue: boolean;
    offset: number;
    limit: number;
};

export type ListRequirementResponse = {
    code: number;
    err_msg: string;
    total_count: number;
    requirement_list: RequirementInfo[];
};

export type ListRequirementByIdRequest = {
    session_id: string;
    project_id: string;
    requirement_id_list: string[];
};

export type ListRequirementByIdResponse = {
    code: number;
    err_msg: string;
    requirement_list: RequirementInfo[];
};

export type GetRequirementRequest = {
    session_id: string;
    project_id: string;
    requirement_id: string;
};

export type GetRequirementResponse = {
    code: number;
    err_msg: string;
    requirement: RequirementInfo;
};


export type UpdateRequirementRequest = {
    session_id: string;
    project_id: string;
    requirement_id: string;
    base_info: BaseRequirementInfo;
};

export type UpdateRequirementResponse = {
    code: number;
    err_msg: string;
};


export type SetRequirementCateRequest = {
    session_id: string;
    project_id: string;
    requirement_id: string;
    cate_id: string;
};

export type SetRequirementCateResponse = {
    code: number;
    err_msg: string;
};


export type RemoveRequirementRequest = {
    session_id: string;
    project_id: string;
    requirement_id: string;
};

export type RemoveRequirementResponse = {
    code: number;
    err_msg: string;
};


export type LinkIssueRequest = {
    session_id: string;
    project_id: string;
    requirement_id: string;
    issue_id: string;
};

export type LinkIssueResponse = {
    code: number;
    err_msg: string;
};


export type UnlinkIssueRequest = {
    session_id: string;
    project_id: string;
    requirement_id: string;
    issue_id: string;
};

export type UnlinkIssueResponse = {
    code: number;
    err_msg: string;
};

export type ListIssueLinkRequest = {
    session_id: string;
    project_id: string;
    requirement_id: string;
};

export type ListIssueLinkResponse = {
    code: number;
    err_msg: string;
    issue_id_list: string[];
};

export type ListMultiIssueLinkRequest = {
    session_id: string;
    project_id: string;
    requirement_id_list: string[];
}

export type ListMultiIssueLinkResponse = {
    code: number;
    err_msg: string;
    issue_id_list: string[];
};


export type AddCommentRequest = {
    session_id: string;
    project_id: string;
    requirement_id: string;
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
    requirement_id: string;
    offset: number;
    limit: number;
};

export type ListCommentResponse = {
    code: number;
    err_msg: string;
    total_count: number;
    comment_list: Comment[];
};


export type RemoveCommentRequest ={
    session_id: string;
    project_id: string;
    requirement_id: string;
    comment_id: string;
};

export type RemoveCommentResponse = {
    code: number;
    err_msg: string;
};


//创建需求分类
export async function create_cate(request: CreateCateRequest): Promise<CreateCateResponse> {
    const cmd = 'plugin:project_requirement_api|create_cate';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<CreateCateResponse>(cmd, {
        request,
    });
}

//列出需求分类
export async function list_cate(request: ListCateRequest): Promise<ListCateResponse> {
    const cmd = 'plugin:project_requirement_api|list_cate';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<ListCateResponse>(cmd, {
        request,
    });
}

//更新需求分类
export async function update_cate(request: UpdateCateRequest): Promise<UpdateCateResponse> {
    const cmd = 'plugin:project_requirement_api|update_cate';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<UpdateCateResponse>(cmd, {
        request,
    });
}

//删除需求分类
export async function remove_cate(request: RemoveCateRequest): Promise<RemoveCateResponse> {
    const cmd = 'plugin:project_requirement_api|remove_cate';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<RemoveCateResponse>(cmd, {
        request,
    });
}

//创建需求
export async function create_requirement(request: CreateRequirementRequest): Promise<CreateRequirementResponse> {
    const cmd = 'plugin:project_requirement_api|create_requirement';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<CreateRequirementResponse>(cmd, {
        request,
    });
}

//列出需求
export async function list_requirement(request: ListRequirementRequest): Promise<ListRequirementResponse> {
    const cmd = 'plugin:project_requirement_api|list_requirement';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<ListRequirementResponse>(cmd, {
        request,
    });
}

//按ID列出需求
export async function list_requirement_by_id(request: ListRequirementByIdRequest): Promise<ListRequirementByIdResponse> {
    const cmd = 'plugin:project_requirement_api|list_requirement_by_id';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<ListRequirementByIdResponse>(cmd, {
        request,
    });
}

//获取单个需求
export async function get_requirement(request: GetRequirementRequest): Promise<GetRequirementResponse> {
    const cmd = 'plugin:project_requirement_api|get_requirement';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<GetRequirementResponse>(cmd, {
        request,
    });
}

//更新需求
export async function update_requirement(request: UpdateRequirementRequest): Promise<UpdateRequirementResponse> {
    const cmd = 'plugin:project_requirement_api|update_requirement';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<UpdateRequirementResponse>(cmd, {
        request,
    });
}

//设置需求分类
export async function set_requirement_cate(request: SetRequirementCateRequest): Promise<SetRequirementCateResponse> {
    const cmd = 'plugin:project_requirement_api|set_requirement_cate';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<SetRequirementCateResponse>(cmd, {
        request,
    });
}

//删除需求
export async function remove_requirement(request: RemoveRequirementRequest): Promise<RemoveRequirementResponse> {
    const cmd = 'plugin:project_requirement_api|remove_requirement';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<RemoveRequirementResponse>(cmd, {
        request,
    });
}

//关联工单
export async function link_issue(request: LinkIssueRequest): Promise<LinkIssueResponse> {
    const cmd = 'plugin:project_requirement_api|link_issue';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<LinkIssueResponse>(cmd, {
        request,
    });
}

//取消关联工单
export async function unlink_issue(request: UnlinkIssueRequest): Promise<UnlinkIssueResponse> {
    const cmd = 'plugin:project_requirement_api|unlink_issue';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<UnlinkIssueResponse>(cmd, {
        request,
    });
}

//列出工单关联
export async function list_issue_link(request: ListIssueLinkRequest): Promise<ListIssueLinkResponse> {
    const cmd = 'plugin:project_requirement_api|list_issue_link';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<ListIssueLinkResponse>(cmd, {
        request,
    });
}

//列出多个需求的工单关联
export async function list_multi_issue_link(request: ListMultiIssueLinkRequest): Promise<ListMultiIssueLinkResponse> {
    const cmd = 'plugin:project_requirement_api|list_multi_issue_link';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<ListMultiIssueLinkResponse>(cmd, {
        request,
    });
}

//增加评论
export async function add_comment(request: AddCommentRequest): Promise<AddCommentResponse> {
    const cmd = 'plugin:project_requirement_api|add_comment';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<AddCommentResponse>(cmd, {
        request,
    });
}

//列出评论
export async function list_comment(request: ListCommentRequest): Promise<ListCommentResponse> {
    const cmd = 'plugin:project_requirement_api|list_comment';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<ListCommentResponse>(cmd, {
        request,
    });
}

//删除评论
export async function remove_comment(request: RemoveCommentRequest): Promise<RemoveCommentResponse> {
    const cmd = 'plugin:project_requirement_api|remove_comment';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<RemoveCommentResponse>(cmd, {
        request,
    });
}