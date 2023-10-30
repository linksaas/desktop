import type { COMMENT_TARGET_TYPE } from "./project_comment";

/* eslint-disable @typescript-eslint/no-namespace */
export namespace project {
  export type UpdateProjectNotice = {
    project_id: string;
  };
  export type RemoveProjectNotice = {
    project_id: string;
  };
  export type AddMemberNotice = {
    project_id: string;
    member_user_id: string;
  };
  export type UpdateMemberNotice = {
    project_id: string;
    member_user_id: string;
  };
  export type RemoveMemberNotice = {
    project_id: string;
    member_user_id: string;
  };

  export type UserOnlineNotice = {
    user_id: string;
  };
  export type UserOfflineNotice = {
    user_id: string;
  };
  export type NewEventNotice = {
    project_id: string;
    member_user_id: string;
    event_id: string;
  };
  export type SetMemberRoleNotice = {
    project_id: string;
    member_user_id: string;
    role_id: string;
  }

  export type UpdateShortNoteNotice = {
    project_id: string;
    member_user_id: string;
  };

  export type UpdateAlarmStatNotice = {
    project_id: string;
  };

  export type CreateBulletinNotice = {
    project_id: string;
    bulletin_id: string;
  }

  export type UpdateBulletinNotice = {
    project_id: string;
    bulletin_id: string;
  }

  export type RemoveBulletinNotice = {
    project_id: string;
    bulletin_id: string;
  }

  export type AddTagNotice = {
    project_id: string;
    tag_id: string;
  };

  export type UpdateTagNotice = {
    project_id: string;
    tag_id: string;
  };

  export type RemoveTagNotice = {
    project_id: string;
    tag_id: string;
  };

  export type UpdateSpritNotice = {
    project_id: string;
    sprit_id: string;
  };

  export type AllNotice = {
    UpdateProjectNotice?: UpdateProjectNotice;
    RemoveProjectNotice?: RemoveProjectNotice;
    AddMemberNotice?: AddMemberNotice;
    UpdateMemberNotice?: UpdateMemberNotice;
    RemoveMemberNotice?: RemoveMemberNotice;
    UserOnlineNotice?: UserOnlineNotice;
    UserOfflineNotice?: UserOfflineNotice;
    NewEventNotice?: NewEventNotice;
    SetMemberRoleNotice?: SetMemberRoleNotice;
    UpdateShortNoteNotice?: UpdateShortNoteNotice;
    UpdateAlarmStatNotice?: UpdateAlarmStatNotice;
    CreateBulletinNotice?: CreateBulletinNotice;
    UpdateBulletinNotice?: UpdateBulletinNotice;
    RemoveBulletinNotice?: RemoveBulletinNotice;
    AddTagNotice?: AddTagNotice;
    UpdateTagNotice?: UpdateTagNotice;
    RemoveTagNotice?: RemoveTagNotice;
    UpdateSpritNotice?: UpdateSpritNotice;
  };
}

export namespace project_doc {
  export type LinkSpritNotice = {
    project_id: string;
    doc_id: string;
    sprit_id: string;
  };

  export type CancelLinkSpritNotice = {
    project_id: string;
    doc_id: string;
    sprit_id: string;
  };
}

export namespace issue {
  export type NewIssueNotice = {
    project_id: string;
    issue_id: string;
    create_user_id: string;
  };
  export type RemoveIssueNotice = {
    project_id: string;
    issue_id: string;
    create_user_id: string;
    exec_user_id: string;
    check_user_id: string;
  };
  export type SetExecUserNotice = {
    project_id: string;
    issue_id: string;
    exec_user_id: string;
    old_exec_user_id: string;
  };
  export type SetCheckUserNotice = {
    project_id: string;
    issue_id: string;
    check_user_id: string;
    old_check_user_id: string;
  };
  export type UpdateIssueNotice = {
    project_id: string;
    issue_id: string;
  };
  export type UpdateIssueStateNotice = {
    project_id: string;
    issue_id: string;
    exec_user_id: string;
    check_user_id: string;
  };

  export type SetSpritNotice = {
    project_id: string;
    issue_id: string;
    old_sprit_id: string;
    new_sprit_id: string;
  };

  export type AllNotice = {
    NewIssueNotice?: NewIssueNotice;
    RemoveIssueNotice?: RemoveIssueNotice;
    SetExecUserNotice?: SetExecUserNotice;
    SetCheckUserNotice?: SetCheckUserNotice;
    UpdateIssueNotice?: UpdateIssueNotice;
    UpdateIssueStateNotice?: UpdateIssueStateNotice;
    SetSpritNotice?: SetSpritNotice;
  };
}

export namespace appraise {
  export type NewAppraiseNotice = {
    project_id: string;
    appraise_id: string;
  };

  export type UpdateAppraiseNotice = {
    project_id: string;
    appraise_id: string;
  };

  export type RemoveAppraiseNotice = {
    project_id: string;
    appraise_id: string;
  };

  export type NewVoteNotice = {
    project_id: string;
    appraise_id: string;
  };

  export type RevokeVoteNotice = {
    project_id: string;
    appraise_id: string;
  };

  export type AllNotice = {
    NewAppraiseNotice?: NewAppraiseNotice;
    UpdateAppraiseNotice?: UpdateAppraiseNotice;
    RemoveAppraiseNotice?: RemoveAppraiseNotice;
    NewVoteNotice?: NewVoteNotice;
    RevokeVoteNotice?: RevokeVoteNotice;
  };
}

export namespace client {
  export type WrongSessionNotice = {
    name: string;
  };

  export type SwitchUserNotice = {};

  export type GitPostHookNotice = {
    project_id: string;
  };

  export type AllNotice = {
    WrongSessionNotice?: WrongSessionNotice;
    SwitchUserNotice?: SwitchUserNotice;
    GitPostHookNotice?: GitPostHookNotice;
  };
}

export namespace idea {
  export type KeywordChangeNotice = {
    project_id: string;
    add_keyword_list: string[];
    remove_keyword_list: string[];
  };

  export type AllNotice = {
    KeywordChangeNotice?: KeywordChangeNotice;
  };
}

export namespace comment {
  export type AddCommentNotice = {
    project_id: string;
    comment_id: string;
    target_type: COMMENT_TARGET_TYPE;
    target_id: string;

  };

  export type UpdateCommentNotice = {
    project_id: string;
    comment_id: string;
    target_type: COMMENT_TARGET_TYPE;
    target_id: string;
  };

  export type RemoveCommentNotice = {
    project_id: string;
    comment_id: string;
    target_type: COMMENT_TARGET_TYPE;
    target_id: string;
  };

  export type RemoveUnReadNotice = {
    project_id: string;
  };

  export type AllNotice = {
    AddCommentNotice?: AddCommentNotice;
    UpdateCommentNotice?: UpdateCommentNotice;
    RemoveCommentNotice?: RemoveCommentNotice;
    RemoveUnReadNotice?: RemoveUnReadNotice;
  };
}

export type AllNotice = {
  ProjectNotice?: project.AllNotice;
  IssueNotice?: issue.AllNotice;
  AppraiseNotice?: appraise.AllNotice;
  ClientNotice?: client.AllNotice;
  IdeaNotice?: idea.AllNotice;
  CommentNotice?: comment.AllNotice;
};
