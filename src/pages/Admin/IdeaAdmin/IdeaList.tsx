import React, { useEffect, useState } from "react";
import { Card, Form, List, Select } from "antd";
import type { AdminPermInfo } from "@/api/admin_auth";
import type { IdeaStore, IdeaInStore } from "@/api/project_idea";
import { get_admin_session, get_admin_perm } from '@/api/admin_auth';
import { KEYWORD_SEARCH_AND, list_store } from "@/api/project_idea";
import { list_idea } from "@/api/project_idea_admin";
import { request } from "@/utils/request";
import Button from "@/components/Button";
import { PlusOutlined } from "@ant-design/icons";
import CreateIdeaModal from "./components/CreateIdeaModal";
import IdeaCard from "./components/IdeaCard";
import { get_idea } from "@/api/project_idea_admin";


const PAGE_SIZE = 10;

const IdeaList = () => {
    const [permInfo, setPermInfo] = useState<AdminPermInfo | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);

    const [storeList, setStoreList] = useState([] as IdeaStore[]);
    const [curStoreId, setCurCateId] = useState("");

    const [ideaList, setIdeaList] = useState([] as IdeaInStore[]);
    const [totalCount, setTotalCount] = useState(0);
    const [curPage, setCurPage] = useState(0);


    const loadStoreList = async () => {
        const res = await list_store({
            filter_by_store_cate_id: false,
            store_cate_id: "",
        });
        setStoreList(res.store_list);
        if (res.store_list.map(item => item.idea_store_id).includes(curStoreId) == false) {
            if (res.store_list.length == 0) {
                setCurCateId("");
            } else {
                setCurCateId(res.store_list[0].idea_store_id);
            }
        }
    };

    const loadIdeaList = async () => {
        setIdeaList([]);
        if (curStoreId == "") {
            return;
        }
        const sessionId = await get_admin_session();
        const res = await request(list_idea({
            admin_session_id: sessionId,
            list_param: {
                filter_by_keyword: false,
                keyword_list: [],
                keyword_search_type: KEYWORD_SEARCH_AND,
                filter_by_group_or_store_id: true,
                group_or_store_id: curStoreId,
            },
            offset: curPage * PAGE_SIZE,
            limit: PAGE_SIZE,
        }));
        setIdeaList(res.idea_list);
        setTotalCount(res.total_count);
    };

    const updateIdea = async (ideaId: string) => {
        const sessionId = await get_admin_session();
        const res = await request(get_idea({
            admin_session_id: sessionId,
            idea_id: ideaId,
        }));
        const tmpList = ideaList.slice();
        const index = tmpList.findIndex(item => item.idea_id == ideaId);
        if (index != -1) {
            tmpList[index] = res.idea;
            setIdeaList(tmpList);
        }
    };

    const removeIdea = async (ideaId: string) => {
        const tmpList = ideaList.filter(item => item.idea_id != ideaId);
        setIdeaList(tmpList);
    };

    useEffect(() => {
        get_admin_perm().then(res => setPermInfo(res));
    }, []);

    useEffect(() => {
        loadStoreList();
    }, []);

    useEffect(() => {
        loadIdeaList();
    }, [curPage, curStoreId]);

    return (
        <Card title="知识点"
            bodyStyle={{ height: "calc(100vh - 90px)", overflowY: "scroll" }}
            extra={
                <>
                    {curStoreId != "" && (
                        <Form layout="inline">
                            <Form.Item label="知识库">
                                <Select value={curStoreId} onChange={value => {
                                    setCurCateId(value);
                                    setCurPage(0);
                                }} style={{ width: "120px" }}>
                                    {storeList.map(item => (
                                        <Select.Option key={item.idea_store_id} value={item.idea_store_id}>{item.name}</Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                            <Form.Item>
                                <Button
                                    disabled={!(permInfo?.idea_store_perm.create_idea ?? false)}
                                    onClick={e => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        setShowAddModal(true);
                                    }}><PlusOutlined />&nbsp;&nbsp;添加知识点</Button>
                            </Form.Item>
                        </Form>
                    )}
                </>
            }>
            <List rowKey="idea_id" dataSource={ideaList}
                pagination={{ total: totalCount, current: curPage + 1, pageSize: PAGE_SIZE, onChange: page => setCurPage(page - 1) }}
                renderItem={item => (
                    <List.Item>
                        {permInfo != null && (
                            <IdeaCard permInfo={permInfo} idea={item} onChange={() => updateIdea(item.idea_id)} onRemove={() => removeIdea(item.idea_id)} />
                        )}
                    </List.Item>
                )} />

            {showAddModal == true && (
                <CreateIdeaModal ideaStoreId={curStoreId} onCancel={() => setShowAddModal(false)} onOk={() => {
                    setShowAddModal(false);
                    if (curPage > 0) {
                        setCurPage(0);
                    } else {
                        loadIdeaList();
                    }
                }} />
            )}
        </Card>
    );
};

export default IdeaList;