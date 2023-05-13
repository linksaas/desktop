import React, { useState } from "react";
import cls from './index.module.less';
import { observer } from 'mobx-react';
import { useStores } from "@/hooks";
import { Badge, Input, Popover, message } from "antd";
import { APP_PROJECT_CHAT_PATH, APP_PROJECT_KB_DOC_PATH, APP_PROJECT_OVERVIEW_PATH, APP_PROJECT_WORK_PLAN_PATH, PROJECT_STATE_OPT_ENUM } from "@/utils/constant";
import { FolderFilled } from "@ant-design/icons";
import { useHistory } from "react-router-dom";
import type { WebProjectInfo } from "@/stores/project";
import type { ProjectInfo } from "@/api/project";
import { useSetState } from "ahooks";
import ActionModal from '../ActionModal';
import Button from '../Button';
import { request } from "@/utils/request";
import { close, open, remove } from '@/api/project';
import { leave } from '@/api/project_member';
import ProjectWatch from "./ProjectWatch";

const ProjectItem: React.FC<{ item: WebProjectInfo }> = ({ item }) => {
    const [hover, setHover] = useState(false);
    const [disableBtn, setDisableBtn] = useState(false);
    const [pjChangeObj, setPjChangeObj] = useSetState({
        visible: false,
        type: PROJECT_STATE_OPT_ENUM.FINISH,
        text: '结束',
        name: '',
        pjId: '',
    });

    const history = useHistory();

    const appStore = useStores('appStore');
    const projectStore = useStores('projectStore');
    const docSpaceStore = useStores('docSpaceStore');
    const memberStore = useStores('memberStore');
    const userStore = useStores('userStore');

    const pjItemChange = (obj: ProjectInfo, type: PROJECT_STATE_OPT_ENUM) => {
        switch (type) {
            case PROJECT_STATE_OPT_ENUM.FINISH:
                setDisableBtn(false);
                setPjChangeObj({
                    visible: true,
                    type: PROJECT_STATE_OPT_ENUM.FINISH,
                    text: '结束',
                    name: obj.basic_info.project_name,
                    pjId: obj.project_id,
                });
                return;
            case PROJECT_STATE_OPT_ENUM.ACTIVATE:
                setDisableBtn(false);
                setPjChangeObj({
                    visible: true,
                    type: PROJECT_STATE_OPT_ENUM.ACTIVATE,
                    text: '激活',
                    name: obj.basic_info.project_name,
                    pjId: obj.project_id,
                });
                return;
            case PROJECT_STATE_OPT_ENUM.QUIT:
                setDisableBtn(false);
                setPjChangeObj({
                    visible: true,
                    type: PROJECT_STATE_OPT_ENUM.QUIT,
                    text: '退出',
                    name: obj.basic_info.project_name,
                    pjId: obj.project_id,
                });
                return;
            case PROJECT_STATE_OPT_ENUM.REMOVE:
                setDisableBtn(true);
                setPjChangeObj({
                    visible: true,
                    type: PROJECT_STATE_OPT_ENUM.REMOVE,
                    text: '删除',
                    name: obj.basic_info.project_name,
                    pjId: obj.project_id,
                });
                return;
            default:
                break;
        }
    };

    const submitPjItem = async () => {
        if (pjChangeObj.type === PROJECT_STATE_OPT_ENUM.FINISH) {
            try {
                await request(close(userStore.sessionId, pjChangeObj.pjId));
                message.success('项目结束成功');
                setPjChangeObj({ visible: false });
                projectStore.updateProject(pjChangeObj.pjId);
            } catch (error) { }
            return;
        } else if (pjChangeObj.type === PROJECT_STATE_OPT_ENUM.ACTIVATE) {
            try {
                await request(open(userStore.sessionId, pjChangeObj.pjId));
                message.success('项目激活成功');
                setPjChangeObj({ visible: false });
                projectStore.updateProject(pjChangeObj.pjId);
            } catch (error) { }
            return;
        } else if (pjChangeObj.type === PROJECT_STATE_OPT_ENUM.QUIT) {
            try {
                await request(leave(userStore.sessionId, pjChangeObj.pjId));
                message.success('项目退出成功');
                setPjChangeObj({ visible: false });
                projectStore.removeProject(pjChangeObj.pjId, history);
            } catch (error) {
                console.log(error);
            }
            return;
        } else if (pjChangeObj.type == PROJECT_STATE_OPT_ENUM.REMOVE) {
            try {
                await request(remove(userStore.sessionId, pjChangeObj.pjId));
                message.success("项目删除成功");
                setPjChangeObj({ visible: false });
                projectStore.removeProject(pjChangeObj.pjId, history);
            } catch (error) {
                console.log(error);
            }
        }
    };
    const rendePjOpenOrClose = (obj: ProjectInfo) => {
        return (
            <div
                className={cls.contextmenu}
            >
                {obj.closed == false && obj.user_project_perm.can_admin && obj.project_id == projectStore.curProjectId && appStore.clientCfg?.can_invite && (
                    <div
                        className={cls.item}
                        style={{ color: "black" }}
                        onClick={() => memberStore.showInviteMember = true}
                    >
                        邀请成员
                    </div>
                )}
                {obj.user_project_perm.can_close && (
                    <div
                        className={cls.item}
                        onClick={() => pjItemChange(obj, PROJECT_STATE_OPT_ENUM.FINISH)}
                    >
                        结束项目
                    </div>
                )}
                {obj.user_project_perm.can_open && (
                    <div
                        className={cls.item}
                        style={{ color: "black" }}
                        onClick={() => pjItemChange(obj, PROJECT_STATE_OPT_ENUM.ACTIVATE)}
                    >
                        激活项目
                    </div>
                )}
                {obj.user_project_perm.can_leave && (
                    <div
                        className={cls.item}
                        onClick={() => pjItemChange(obj, PROJECT_STATE_OPT_ENUM.QUIT)}
                    >
                        退出项目
                    </div>
                )}
                {obj.user_project_perm.can_remove && (
                    <div
                        className={cls.item}
                        onClick={() => pjItemChange(obj, PROJECT_STATE_OPT_ENUM.REMOVE)}
                    >
                        删除项目
                    </div>
                )}
            </div>
        );
    };

    return (
        <div
            className={cls.project_child_wrap}
            onMouseEnter={e => {
                e.stopPropagation();
                e.preventDefault();
                setHover(true);
            }}
            onMouseLeave={e => {
                e.stopPropagation();
                e.preventDefault();
                setHover(false);
            }}
        >
            <div className={`${cls.project_child_title} ${item.closed && cls.close} ${item.project_id == projectStore.curProjectId ? cls.active_menu : ""}`}>
                {item.project_id !== projectStore.curProjectId &&
                    <Badge count={item.project_status.total_count} className={cls.badge} />
                }
                
                <span className={cls.name} onClick={e => {
                    e.stopPropagation();
                    e.preventDefault();
                    if (docSpaceStore.inEdit) {
                        docSpaceStore.showCheckLeave(() => {
                            projectStore.setCurProjectId(item.project_id).then(() => {
                                if(!item.setting.disable_work_plan){
                                    history.push(APP_PROJECT_WORK_PLAN_PATH);
                                } else if (!item.setting.disable_kb) {
                                    history.push(APP_PROJECT_KB_DOC_PATH);
                                }else if (!item.setting.disable_chat) {
                                    history.push(APP_PROJECT_CHAT_PATH);
                                } else if (item.setting.disable_chat && item.setting.disable_kb && item.setting.disable_work_plan) {
                                    history.push(APP_PROJECT_OVERVIEW_PATH);
                                }
                            });
                        });
                        return;
                    }
                    projectStore.setCurProjectId(item.project_id).then(() => {
                        if(!item.setting.disable_work_plan){
                            history.push(APP_PROJECT_WORK_PLAN_PATH);
                        } else if (!item.setting.disable_kb) {
                            history.push(APP_PROJECT_KB_DOC_PATH);
                        }else if (!item.setting.disable_chat) {
                            history.push(APP_PROJECT_CHAT_PATH);
                        } else if (item.setting.disable_chat && item.setting.disable_kb && item.setting.disable_work_plan) {
                            history.push(APP_PROJECT_OVERVIEW_PATH);
                        }
                    });
                }}><FolderFilled style={{ color: item.project_id == projectStore.curProjectId ? "white" : "inherit" }} />&nbsp;{item.basic_info.project_name} </span>
                <Popover content={rendePjOpenOrClose(item)} placement="right" autoAdjustOverflow={false} trigger="click">
                    {hover && <i className={cls.more} />}
                </Popover>
                {item.project_id == projectStore.curProjectId && (
                    <div>
                        <ProjectWatch />
                    </div>
                )}
            </div>

            {pjChangeObj.visible && (
                <ActionModal
                    open={pjChangeObj.visible}
                    title={`${pjChangeObj.text}项目`}
                    width={pjChangeObj.type == PROJECT_STATE_OPT_ENUM.REMOVE ? 430 : 330}
                    mask={false}
                    onCancel={() => setPjChangeObj({ visible: false })}
                >
                    <div className={cls.pj_change_model}>
                        <h1>
                            是否要{pjChangeObj.text} {pjChangeObj.name} 项目?
                        </h1>
                        {pjChangeObj.type === PROJECT_STATE_OPT_ENUM.FINISH && (
                            <p>结束后项目将会封存，无法创建新的聊天/任务/缺陷</p>
                        )}
                        {pjChangeObj.type === PROJECT_STATE_OPT_ENUM.REMOVE && (
                            <>
                                <p style={{ color: "red" }}>项目被删除后，将无法再访问该项目的任何内容</p>
                                <Input addonBefore="请输入要删除的项目名称" onChange={e => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    if (e.target.value == pjChangeObj.name) {
                                        setDisableBtn(false);
                                    } else {
                                        setDisableBtn(true);
                                    }
                                }} />
                            </>
                        )}
                        <div className={cls.btn_wrap}>
                            <Button ghost onClick={() => setPjChangeObj({ visible: false })}>
                                取消
                            </Button>
                            <Button onClick={submitPjItem} disabled={disableBtn}>确定</Button>
                        </div>
                    </div>
                </ActionModal>
            )}
        </div>
    );
};

export default observer(ProjectItem);