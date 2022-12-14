import CardWrap from "@/components/CardWrap";
import React, { useEffect, useState } from "react";
import s from "./RepoList.module.less";
import Button from "@/components/Button";
import addIcon from '@/assets/image/addIcon.png';
import { observer } from 'mobx-react';
import { useStores } from "@/hooks";
import type { RepoInfo } from '@/api/robot_earthly';
import { list_repo, remove_repo } from '@/api/robot_earthly';
import AddRepoModal from "./components/AddRepoModal";
import { request } from '@/utils/request';
import moment from 'moment';
import Pagination from "@/components/Pagination";
import ActionList from "./components/ActionList";
import { DeleteOutlined } from "@ant-design/icons";
import { Modal } from "antd";


const PAGE_SIZE = 10;

const RepoList = () => {
    const userStore = useStores('userStore');
    const projectStore = useStores('projectStore');

    const [repoList, setRepoList] = useState<RepoInfo[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [curPage, setCurPage] = useState(0);
    const [showAddModal, setShowAddModal] = useState(false);
    const [curRepoId, setCurRepoId] = useState("");
    const [removeRepoId, setRemoveRepoId] = useState("");

    const loadRepo = async () => {
        const res = await request(list_repo({
            session_id: userStore.sessionId,
            project_id: projectStore.curProjectId,
            offset: curPage * PAGE_SIZE,
            limit: PAGE_SIZE,
        }));
        if (res) {
            setTotalCount(res.total_count);
            setRepoList(res.info_list);
        }
    };

    const getRepo = (repoId: string) => {
        const index = repoList.findIndex(repo => repo.repo_id == repoId);
        if (index != -1) {
            return repoList[index];
        }
        return undefined;
    }

    const removeRepo = async () => {
        const res = await request(remove_repo({
            session_id: userStore.sessionId,
            project_id: projectStore.curProjectId,
            repo_id: removeRepoId,
        }));
        if (res) {
            loadRepo();
            setRemoveRepoId("");
        }
    };

    useEffect(() => {
        loadRepo();
    }, [curPage, projectStore.curProjectId])

    return <CardWrap>
        <div className={s.repo_wrap}>
            <div style={{ marginRight: '20px' }}>
                <div className={s.title}>
                    <h2>??????????????????</h2>
                    <Button
                        type="primary"
                        onClick={e => {
                            e.stopPropagation();
                            e.preventDefault();
                            setShowAddModal(true);

                        }}
                        disabled={((projectStore.isAdmin == false) || (projectStore.curProject?.closed))}
                    >
                        <img src={addIcon} alt="" />
                        ??????????????????
                    </Button>
                </div>
                <div>
                    <p><b>???????????????</b>????????????????????????0.1.1??????????????????????????????<a target="_blank" href="https://earthly.dev/" rel="noreferrer">earthly</a>???</p>
                </div>
                <div className={s.list}>
                    <div className={s.list_cont}>
                        {repoList.map(repo => (
                            <div className={s.list_item} key={repo.repo_id}>
                                <div className={s.list_hd}>
                                    <div className={s.list_title}>
                                        {repo.basic_info.repo_url ?? ""}
                                    </div>
                                    {projectStore.isAdmin && repo.action_count == 0 && (
                                        <Button
                                            type="link"
                                            title="????????????"
                                            danger
                                            icon={<DeleteOutlined />}
                                            className={s.remove_btn}
                                            onClick={e => {
                                                e.stopPropagation();
                                                e.preventDefault();
                                                setRemoveRepoId(repo.repo_id);
                                            }}
                                        />
                                    )}
                                    <div className={s.list_info}>
                                        <div className={s.list_info_item}>
                                            ????????????????????????{repo.robot_list.length}
                                        </div>
                                        <div className={s.list_info_item}>
                                            ???????????????{repo.action_count}
                                        </div>
                                        <div className={s.list_info_item}>
                                            ????????????{repo.create_display_name}
                                        </div>
                                        <div className={s.list_info_item}>
                                            ???????????????{moment(repo.create_time).format("YYYY-MM-DD")}
                                        </div>
                                        <a
                                            className={s.list_expand}
                                            onClick={() => {
                                                if (curRepoId == repo.repo_id) {
                                                    setCurRepoId("");
                                                } else {
                                                    setCurRepoId(repo.repo_id);
                                                }
                                            }}>
                                            {curRepoId == repo.repo_id ? '??????' : '??????'}
                                        </a>
                                    </div>
                                </div>
                                {curRepoId == repo.repo_id && (<ActionList repoId={repo.repo_id} repoUrl={repo.basic_info.repo_url} robotList={repo.robot_list} />)}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <Pagination total={totalCount} pageSize={PAGE_SIZE} current={curPage + 1} onChange={page => setCurPage(page - 1)} />
        </div>
        {showAddModal && <AddRepoModal
            onOk={() => {
                if (curPage != 0) {
                    setCurPage(0);
                } else {
                    loadRepo();
                }
                setShowAddModal(false);
            }}
            onCancel={() => setShowAddModal(false)} />}
        {removeRepoId != "" && (
            <Modal
                title={`???????????? ${getRepo(removeRepoId)?.basic_info.repo_url ?? ""}`}
                open
                onCancel={e => {
                    e.stopPropagation();
                    e.preventDefault();
                    setRemoveRepoId("");
                }}
                onOk={e => {
                    e.stopPropagation();
                    e.preventDefault();
                    removeRepo();
                }}
            >
                ?????????????????? {getRepo(removeRepoId)?.basic_info.repo_url ?? ""}?
            </Modal>
        )}
    </CardWrap>
}

export default observer(RepoList);