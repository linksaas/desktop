import React, { useEffect, useState } from "react";
import CardWrap from '@/components/CardWrap';
import { observer } from 'mobx-react';
import s from './SpritList.module.less';
import Button from "@/components/Button";
import addIcon from '@/assets/image/addIcon.png';
import ModifySpritModal from "./components/ModifySpritModal";
import type { SpritInfo } from '@/api/project_sprit';
import { list as list_sprit, get as get_sprit } from '@/api/project_sprit';
import { Table, Tag } from "antd";
import Pagination from "@/components/Pagination";
import type { ColumnsType } from "antd/lib/table";
import { useStores } from "@/hooks";
import { request } from "@/utils/request";
import moment from "moment";
import { LinkSpritInfo } from "@/stores/linkAux";
import { useHistory } from "react-router-dom";


const PAGE_SIZE = 10;

const SpritList = () => {
    const history = useHistory();

    const userStore = useStores('userStore');
    const projectStore = useStores('projectStore');
    const linkAuxStore = useStores('linkAuxStore');
    const spritStore = useStores('spritStore');

    const [spritList, setSpritList] = useState<SpritInfo[]>([]);
    const [curPage, setCurPage] = useState(0);
    const [totalCount, setTotalCount] = useState(0);

    const [updateSpritId, setUpdateSpritId] = useState("");

    const loadSprit = async () => {
        const res = await request(
            list_sprit(
                userStore.sessionId,
                projectStore.curProjectId,
                curPage * PAGE_SIZE, PAGE_SIZE));
        setTotalCount(res.total_count);
        setSpritList(res.info_list);
        spritStore.setcurSpritId("");
    }

    const updateSprit = async () => {
        const res = await request(get_sprit(userStore.sessionId, projectStore.curProjectId, updateSpritId));
        const tmpList = spritList.slice();
        const index = tmpList.findIndex(item => item.sprit_id == updateSpritId);
        if (index != -1) {
            tmpList[index] = res.info;
            setSpritList(tmpList);
        }
        setUpdateSpritId("");
    }

    const columns: ColumnsType<SpritInfo> = [
        {
            title: "????????????",
            width: 200,
            render: (_, record: SpritInfo) => <a onClick={e => {
                e.stopPropagation();
                e.preventDefault();
                linkAuxStore.goToLink(new LinkSpritInfo("", record.project_id, record.sprit_id), history);
            }}>{record.basic_info.title}</a>
        },
        {
            title: "????????????",
            width: 80,
            render: (_, record: SpritInfo) => (
                <span>
                    {moment(record.basic_info.start_time).format("YYYY-MM-DD")}
                </span>
            ),
        },
        {
            title: "????????????",
            width: 80,
            render: (_, record: SpritInfo) => (
                <span>
                    {moment(record.basic_info.end_time).format("YYYY-MM-DD")}
                </span>
            ),
        },
        {
            title: "????????????",
            render: (_, record: SpritInfo) => (
                <div>
                    {record.basic_info.non_work_day_list.map(item => (
                        <Tag key={item}>{moment(item).format("YYYY-MM-DD")}</Tag>
                    ))}
                </div>
            ),
        },
        {
            title: "?????????",
            width: 60,
            dataIndex: "task_count",
        },
        {
            title: "?????????",
            width: 60,
            dataIndex: "bug_count",
        },
        {
            title: "?????????",
            width: 80,
            dataIndex: "create_display_name",
        },
        {
            title: "??????",
            width: 120,
            render: (_, record: SpritInfo) => (
                <div>
                    <a onClick={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        setUpdateSpritId(record.sprit_id);
                    }}>??????</a>
                </div>
            )
        }

    ];

    useEffect(() => {
        loadSprit();
    }, [projectStore.curProjectId, curPage]);

    return (
        <CardWrap>
            <div className={s.sprit_wrap}>
                <div style={{ marginRight: '20px' }}>
                    <div className={s.title}>
                        <h2>????????????</h2>
                        <Button onClick={e => {
                            e.stopPropagation();
                            e.preventDefault();
                            spritStore.showCreateSprit = true;
                        }} disabled={!projectStore.isAdmin}>
                            <img src={addIcon} alt="" />
                            ????????????
                        </Button>
                    </div>
                    <Table
                        rowKey="sprit_id"
                        dataSource={spritList}
                        columns={columns}
                        pagination={false}
                        scroll={{ x: 800, y: 'calc(100vh - 260px)' }} />
                    <Pagination current={curPage + 1} total={totalCount} pageSize={PAGE_SIZE} onChange={page => setCurPage(page - 1)} />
                </div>
            </div>
            {spritStore.showCreateSprit == true && <ModifySpritModal
                onCancel={() => spritStore.showCreateSprit=false}
                onOk={() => {
                    if (curPage != 0) {
                        setCurPage(0);
                    } else {
                        loadSprit();
                    }
                    spritStore.showCreateSprit = false;
                }} />
            }
            {updateSpritId != "" && <ModifySpritModal
                spritId={updateSpritId}
                onCancel={() => setUpdateSpritId("")}
                onOk={() => {
                    updateSprit();
                }} />}
        </CardWrap>
    );
};

export default observer(SpritList);