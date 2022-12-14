import React, { useEffect, useState } from "react";
import { observer } from 'mobx-react';
import CardWrap from '@/components/CardWrap';
import DetailsNav from "@/components/DetailsNav";
import type { ActionInfo, ExecInfo, RepoInfo } from "@/api/robot_earthly";
import { EXEC_STATE_FAIL, EXEC_STATE_INIT, EXEC_STATE_RUN, EXEC_STATE_SUCCESS } from "@/api/robot_earthly";
import { get_action, list_exec, get_repo } from "@/api/robot_earthly";
import { useHistory, useLocation } from "react-router-dom";
import type { LinkEarthlyActionState } from "@/stores/linkAux";
import { LinkEarthlyExecInfo } from "@/stores/linkAux";
import { request } from '@/utils/request';
import { useStores } from "@/hooks";
import type { ColumnsType } from 'antd/es/table';
import { message, Popover, Table } from "antd";
import moment from 'moment';
import Button from "@/components/Button";
import Pagination from "@/components/Pagination";
import s from './ActionDetail.module.less';
import ExecModal from "./components/ExecModal";
import { QuestionCircleOutlined } from "@ant-design/icons";
import { writeText } from '@tauri-apps/api/clipboard';
import DownladArtifact from "./components/DownladArtifact";
import CodeEditor from '@uiw/react-textarea-code-editor';


const PAGE_SIZE = 10;
const TIPS_ARTIFACT_ARGS = `ARG LINKSAAS_ARTIFACT_TOKEN=""`;
const TIPS_ARTIFACT_CURL = "RUN curl -s -F your_param=@your_file";

const ActionDetail = () => {
    const location = useLocation();
    const state = location.state as LinkEarthlyActionState;
    const history = useHistory();

    const userStore = useStores('userStore');
    const projectStore = useStores('projectStore');
    const linkAuxStore = useStores('linkAuxStore');

    const [repoInfo, setRepoInfo] = useState<RepoInfo | null>(null);
    const [actionInfo, setActionInfo] = useState<ActionInfo | null>(null);
    const [totalCount, setTotalCount] = useState(0);
    const [curPage, setCurPage] = useState(0);
    const [execInfoList, setExecInfoList] = useState<ExecInfo[]>([]);
    const [showExecModal, setShowExecModal] = useState(false);


    const loadRepoInfo = async () => {
        const res = await request(get_repo({
            session_id: userStore.sessionId,
            project_id: projectStore.curProjectId,
            repo_id: state.repoId,
        }));
        if (res) {
            setRepoInfo(res.info);
        }
    };
    const loadActionInfo = async () => {
        const res = await request(get_action({
            session_id: userStore.sessionId,
            project_id: projectStore.curProjectId,
            repo_id: state.repoId,
            action_id: state.actionId,
        }));
        if (res) {
            setActionInfo(res.info);
        }
    };

    const loadExecInfo = async () => {
        const res = await request(list_exec({
            session_id: userStore.sessionId,
            project_id: projectStore.curProjectId,
            repo_id: state.repoId,
            action_id: state.actionId,
            offset: curPage * PAGE_SIZE,
            limit: PAGE_SIZE,
        }));
        if (res) {
            setTotalCount(res.total_count);
            setExecInfoList(res.info_list);
        }
    };

    const columns: ColumnsType<ExecInfo> = [
        {
            title: "??????/??????",
            dataIndex: "branch",
        },
        {
            title: "????????????",
            render: (_, record: ExecInfo) => (
                <div>
                    {record.param_list.map((param, index) => (
                        <div key={index}>{param.name}={param.value}</div>
                    ))}
                </div>
            ),
        },
        {
            title: "????????????",
            render: (_, record: ExecInfo) => (
                <div>
                    {record.exec_state == EXEC_STATE_INIT && <span>????????????</span>}
                    {record.exec_state == EXEC_STATE_RUN && <span>?????????</span>}
                    {record.exec_state == EXEC_STATE_SUCCESS && <span style={{ color: "green" }}>????????????</span>}
                    {record.exec_state == EXEC_STATE_FAIL && <span style={{ color: "red" }}>????????????</span>}
                </div>
            ),
        },
        {
            title: (
                <span>
                    artifact&nbsp;&nbsp;
                    <Popover content={<div className={s.artifact_tips}>
                        <h3 style={{ fontSize: 16, fontWeight: 600 }}>???????????????????????????????????????curl??????artifact</h3>
                        <p>????????????????????????0.1.2???????????????Earthfile?????????<a target="_blank" href="https://jihulab.com/linksaas/robot/-/blob/develop/Earthfile" rel="noreferrer">demo</a></p>
                        <ul>
                            <li><p>????????????????????????&nbsp;&nbsp;<a onClick={e => {
                                e.stopPropagation();
                                e.preventDefault();
                                writeText(TIPS_ARTIFACT_ARGS).then(() => message.info("????????????"));
                            }}>??????</a></p>
                                <CodeEditor
                                    value={TIPS_ARTIFACT_ARGS}
                                    language="bash"
                                    disabled
                                    style={{
                                        fontSize: 14,
                                        backgroundColor: '#f5f5f5',
                                    }}
                                />
                            </li>
                            <li><p>????????????????????????&nbsp;&nbsp;<a onClick={e => {
                                e.stopPropagation();
                                e.preventDefault();
                                writeText(`${TIPS_ARTIFACT_CURL} ${actionInfo?.artifact_url ?? ""}`).then(() => message.info("????????????"));
                            }}>??????</a></p>
                                <CodeEditor
                                    value={`${TIPS_ARTIFACT_CURL} ${actionInfo?.artifact_url ?? ""}`}
                                    language="bash"
                                    disabled
                                    style={{
                                        fontSize: 14,
                                        backgroundColor: '#f5f5f5',
                                    }}
                                />
                            </li>
                        </ul>
                    </div>}>
                        <a><QuestionCircleOutlined /></a>
                    </Popover>
                </span>),
            render: (_, record: ExecInfo) => (<div>
                {record.artifact_list.map(atrifact => (
                    <DownladArtifact key={atrifact.file_id} fileId={atrifact.file_id} fileName={atrifact.file_name} />
                ))}
            </div>),
        },
        {
            title: "?????????",
            dataIndex: "exec_display_name",
        },
        {
            title: "????????????",
            render: (_, record: ExecInfo) => (
                <span>{moment(record.exec_time).format("YYYY-MM-DD HH:mm:ss")}</span>
            ),
        },
        {
            title: "",
            render: (_, record: ExecInfo) => (
                <Button type="link" onClick={e => {
                    e.stopPropagation();
                    e.preventDefault();
                    linkAuxStore.goToLink(
                        new LinkEarthlyExecInfo("", projectStore.curProjectId, state.repoId, state.actionId, record.exec_id),
                        history);
                }}>??????????????????</Button>
            ),
        }
    ];

    useEffect(() => {
        loadActionInfo();
        loadRepoInfo();
    }, [state]);

    useEffect(() => {
        loadExecInfo();
    }, [projectStore.curProjectId, curPage]);
    return (
        <CardWrap>
            <DetailsNav title={`??????${actionInfo?.basic_info.action_name ?? ""}??????`} />
            <h2 className={s.sub_title}>????????????</h2>
            <div className={s.info_wrap}>
                <div className={s.info}>
                    <div className={s.label}>????????????:</div>
                    <div>{repoInfo?.basic_info.repo_url ?? ""}</div>
                </div>
                <div className={s.info}>
                    <div className={s.label}>????????????:</div>
                    <div>{actionInfo?.basic_info.action_name ?? ""}</div>
                </div>
            </div>
            <h2 className={s.sub_title}>
                ????????????
                <div className={s.exec_wrap}>
                    <Button onClick={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        setShowExecModal(true);
                    }}>????????????</Button>
                </div>
            </h2>
            <div className={s.content_wrap}>

                <Table rowKey="exec_id" dataSource={execInfoList} columns={columns} pagination={false} />
                <Pagination total={totalCount} pageSize={PAGE_SIZE} current={curPage + 1} onChange={page => setCurPage(page - 1)} />
            </div>
            {showExecModal == true && <ExecModal
                repoId={state.repoId}
                actionInfo={actionInfo!}
                onCancel={() => setShowExecModal(false)}
                onOk={(execId: string) => {
                    linkAuxStore.goToLink(new LinkEarthlyExecInfo("", projectStore.curProjectId, state.repoId, state.actionId, execId), history);
                    setShowExecModal(false);
                }} />}
        </CardWrap>
    );
};

export default observer(ActionDetail);