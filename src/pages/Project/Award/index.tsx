import React, { useEffect, useState } from "react";
import CardWrap from '@/components/CardWrap';
import styles from './index.module.less';
import type { AwardState, AwardRecord, AWARD_RELATE_TYPE } from '@/api/project_award';
import { list_state, list_record, AWARD_RELATE_TASK, AWARD_RELATE_BUG } from '@/api/project_award';
import { observer } from 'mobx-react';
import { useStores } from "@/hooks";
import { request } from '@/utils/request';
import UserPhoto from "@/components/Portrait/UserPhoto";
import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import moment from 'moment';
import { useHistory } from "react-router-dom";
import { LinkTaskInfo, LinkBugInfo } from '@/stores/linkAux';
import { LinkOutlined } from "@ant-design/icons/lib/icons";


const ITEM_PER_PAGE = 10;

const ProjectAward: React.FC = () => {
    const userStore = useStores('userStore');
    const projectStore = useStores('projectStore');
    const linkAuxStore = useStores('linkAuxStore');
    const history = useHistory();


    const [stateList, setStateList] = useState<AwardState[]>([]);
    const [recordList, setRecordList] = useState<AwardRecord[]>([]);
    const [curMemberUserId, setCurMemberUserId] = useState("");
    const [page, setPage] = useState(0);
    const [recordCount, setRecordCount] = useState(0);

    const loadState = async () => {
        const res = await request(list_state({
            session_id: userStore.sessionId,
            project_id: projectStore.curProjectId,
        }));
        if (res) {
            setStateList(res.state_list);
        }
    };

    const loadRecord = async () => {
        if (curMemberUserId == "") {
            return;
        }
        const res = await request(list_record({
            session_id: userStore.sessionId,
            project_id: projectStore.curProjectId,
            member_user_id: curMemberUserId,
            offset: page * ITEM_PER_PAGE,
            limit: ITEM_PER_PAGE,
        }));
        if (res) {
            setRecordList(res.record_list);
            setRecordCount(res.total_count);
        }
    };

    useEffect(() => {
        loadState();
    }, [projectStore.curProjectId]);

    useEffect(() => {
        setRecordList([]);
        if (curMemberUserId != "") {
            loadRecord();
        }
    }, [page, curMemberUserId, projectStore.curProjectId])

    const columns: ColumnsType<AwardRecord> = [
        {
            title: "??????",
            dataIndex: "time_stamp",
            width: 150,
            render: (t: number) => {
                return moment(t).format('YYYY-MM-DD HH:mm:ss');
            },
        },
        {
            title: "????????????",
            dataIndex: "relate_type",
            width: 100,
            render: (t: AWARD_RELATE_TYPE) => {
                if (t == AWARD_RELATE_TASK) {
                    return "??????????????????";
                } else if (t == AWARD_RELATE_BUG) {
                    return "??????????????????";
                }
                return ""
            }
        },
        {
            title: "?????????",
            dataIndex: "point",
            width: 60,
        },
        {
            title: "????????????",
            render: (_, record: AwardRecord) => {
                if (record.relate_type == AWARD_RELATE_TASK) {
                    return (<a onClick={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        linkAuxStore.goToLink(
                            new LinkTaskInfo('', projectStore.curProjectId, record.relate_id),
                            history,
                        );
                    }}>{record.title}</a>);
                } else if (record.relate_type == AWARD_RELATE_BUG) {
                    return (<a onClick={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        linkAuxStore.goToLink(
                            new LinkBugInfo('', projectStore.curProjectId, record.relate_id),
                            history,
                        );
                    }}>{record.title}</a>);
                }
                return ""
            },
        }
    ];

    return (
        <CardWrap title="??????????????????" halfContent>
            <div className={styles.wrap}>
                <div className={styles.list}>
                    <div className={styles.list_cont}>
                        {stateList.map(state =>
                        (
                            <div className={styles.list_item} key={state.member_user_id}>
                                <div className={styles.list_hd}>
                                    <div className={styles.list_title}>
                                        <UserPhoto logoUri={state.member_logo_uri} width="32px" height="32px"
                                            style={{
                                                borderRadius: '20px',
                                                marginRight: "10px",
                                                left: '16px',
                                                top: '10px',
                                            }} />
                                        {state.member_display_name}
                                    </div>
                                    <div className={styles.state}>??????:&nbsp;{state.cur_week_point}</div>
                                    <div className={styles.state}>??????:&nbsp;{state.cur_month_point}</div>
                                    <div className={styles.state}>??????:&nbsp;{state.last_weak_point}</div>
                                    <div className={styles.state}>??????:&nbsp;{state.last_month_point}</div>
                                    <div className={styles.list_info}>
                                        <a
                                            className={styles.list_expand}
                                            onClick={e => {
                                                console.log(e);
                                                e.stopPropagation();
                                                e.preventDefault();
                                                if (curMemberUserId == state.member_user_id) {
                                                    setCurMemberUserId("");
                                                } else {
                                                    setCurMemberUserId(state.member_user_id);
                                                    setPage(0);
                                                }
                                            }}>
                                            {curMemberUserId == state.member_user_id ? '??????' : '??????'}
                                        </a>
                                    </div>
                                </div>
                                {curMemberUserId == state.member_user_id && (
                                    <>
                                        {recordList.length > 0 &&
                                            <Table<AwardRecord>
                                                rowKey={e=>`${e.relate_id}${e.relate_type}`}
                                                style={{ marginLeft: "30px" }}
                                                dataSource={recordList}
                                                columns={columns}
                                                pagination={recordCount <= ITEM_PER_PAGE ? false : {
                                                    current: page + 1,
                                                    total: recordCount,
                                                    pageSize: ITEM_PER_PAGE,
                                                    onChange: pageNum => {
                                                        setPage(pageNum - 1);
                                                    },
                                                }} />
                                        }
                                        {recordList.length == 0 && (
                                            <span style={{ marginLeft: "40px" }}>????????????????????????????????????<a onClick={e => {
                                                e.stopPropagation();
                                                e.preventDefault();
                                                linkAuxStore.goToTaskList({
                                                    stateList: [],
                                                    execUserIdList: [],
                                                    checkUserIdList: [],
                                                }, history);
                                            }}><LinkOutlined />??????</a>?????????<a onClick={e => {
                                                e.stopPropagation();
                                                e.preventDefault();
                                                linkAuxStore.goToBugList({
                                                    stateList: [],
                                                    execUserIdList: [],
                                                    checkUserIdList: [],
                                                }, history);
                                            }}><LinkOutlined />??????</a>?????????????????????</span>
                                        )}
                                    </>
                                )}
                            </div>
                        )
                        )}
                    </div>
                </div>
            </div>
        </CardWrap>
    );
}

export default observer(ProjectAward);