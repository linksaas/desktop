import React, { useEffect, useState } from "react";
import CardWrap from '@/components/CardWrap';
import { observer } from 'mobx-react';
import { MenuTab } from "./components/MenuTab";
import { useHistory, useLocation } from "react-router-dom";
import type { LinkTestCaseEntryState } from "@/stores/linkAux";
import { useStores } from "@/hooks";
import { request } from "@/utils/request";
import type { GetEntryResponse, ENTRY_TYPE } from '@/api/project_test_case';
import { get_entry, ENTRY_TYPE_DIR, ENTRY_TYPE_TC, create_entry, remove_entry } from '@/api/project_test_case';
import { Breadcrumb, Form, Input, Modal, Popover, Space, message } from 'antd';
import s from './common.module.less';
import Button from "@/components/Button";
import DirContent from "./components/DirContent";
import TcDetail from "./components/TcDetail";
import { MoreOutlined } from "@ant-design/icons";
import EventModal from "./components/EventModal";
import GenCodeModal from "./components/GenCodeModal";

const EntryList = () => {
    const userStore = useStores('userStore');
    const projectStore = useStores('projectStore');
    const linkAuxStore = useStores('linkAuxStore');

    const location = useLocation();
    let state = location.state as (LinkTestCaseEntryState | undefined);
    if (state == undefined) {
        state = {
            entryId: "",
        };
    }
    const history = useHistory();

    const [curEntryRes, setCurEntryRes] = useState<GetEntryResponse | null>(null);
    const [showCreateEntry, setShowCreateEntry] = useState<ENTRY_TYPE | null>(null);
    const [showEventModal, setShowEventModal] = useState(false);
    const [newTitle, setNewTitle] = useState("");
    const [showGenCodeModal, setShowGenCodeModal] = useState(false);

    const loadCurEntry = async () => {
        const res = await request(get_entry({
            session_id: userStore.sessionId,
            project_id: projectStore.curProjectId,
            entry_id: state!.entryId,
        }));
        setCurEntryRes(res);
    };

    const createEntry = async () => {
        if (newTitle == "") {
            message.warn("??????????????????");
            return;
        }
        await request(create_entry({
            session_id: userStore.sessionId,
            project_id: projectStore.curProjectId,
            entry_type: showCreateEntry!,
            title: newTitle,
            parent_entry_id: state!.entryId,
        }));
        setNewTitle("");
        setShowCreateEntry(null);
        await loadCurEntry();
    };

    const removeEntry = async () => {
        await request(remove_entry({
            session_id: userStore.sessionId,
            project_id: projectStore.curProjectId,
            entry_id: state!.entryId,
        }));
        if (curEntryRes != null) {
            const pos = curEntryRes.path_element_list.length - 1;
            linkAuxStore.goToTestCaseList({ entryId: curEntryRes.path_element_list[pos].entry_id }, history);
        }
    }

    useEffect(() => {
        loadCurEntry();
    }, [state.entryId]);

    return (<CardWrap title="????????????">
        <MenuTab activeKey="entryList">
            {curEntryRes != null && (
                <div className={s.content_wrap}>
                    <div className={s.nav_head}>
                        <div>
                            <Breadcrumb>
                                {curEntryRes.path_element_list.map(el => (
                                    <Breadcrumb.Item key={el.entry_id}>
                                        <a onClick={e => {
                                            e.stopPropagation();
                                            e.preventDefault();
                                            linkAuxStore.goToTestCaseList({ entryId: el.entry_id }, history);
                                        }}>{el.title}</a>
                                    </Breadcrumb.Item>))}
                            </Breadcrumb>
                        </div>
                        <div className={s.btn_wrap}>
                            {curEntryRes.entry.entry_type == ENTRY_TYPE_DIR && (
                                <Space size="middle">
                                    <Button type="default" onClick={e => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        setShowCreateEntry(ENTRY_TYPE_DIR);
                                    }}>????????????</Button>
                                    <Button onClick={e => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        setShowCreateEntry(ENTRY_TYPE_TC);
                                    }}>??????????????????</Button>
                                    <Popover
                                        content={
                                            <Button type="link" danger
                                                disabled={curEntryRes.entry.user_perm.can_remove == false || curEntryRes.child_count > 0}
                                                onClick={e => {
                                                    e.stopPropagation();
                                                    e.preventDefault();
                                                    removeEntry();
                                                }}>??????</Button>}
                                        placement="bottom"
                                        trigger="click">
                                        <a><MoreOutlined /></a>
                                    </Popover>
                                </Space>
                            )}
                            {curEntryRes.entry.entry_type == ENTRY_TYPE_TC && (
                                <Space size="middle">
                                    <Button onClick={e => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        setShowGenCodeModal(true);
                                    }}>????????????</Button>
                                    <Popover
                                        content={<ul>
                                            <li><Button type="link" onClick={e => {
                                                e.stopPropagation();
                                                e.preventDefault();
                                                setShowEventModal(true);
                                            }}>????????????</Button></li>
                                            <li>
                                                <Button type="link" danger
                                                    disabled={curEntryRes.entry.user_perm.can_remove == false}
                                                    onClick={e => {
                                                        e.stopPropagation();
                                                        e.preventDefault();
                                                        removeEntry();
                                                    }}>??????</Button></li>
                                        </ul>}
                                        placement="bottom"
                                        trigger="click">
                                        <a><MoreOutlined /></a>
                                    </Popover>
                                </Space>
                            )}
                        </div>
                    </div>
                    {curEntryRes.entry.entry_type == ENTRY_TYPE_DIR && curEntryRes.entry.entry_id == state!.entryId && <DirContent entryId={state!.entryId} childCount={curEntryRes.child_count} />}
                    {curEntryRes.entry.entry_type == ENTRY_TYPE_TC && curEntryRes.entry.entry_id == state!.entryId && <TcDetail entryId={state!.entryId} />}
                </div>
            )}
        </MenuTab>
        {showCreateEntry != null && (
            <Modal
                open
                title={`??????${showCreateEntry == ENTRY_TYPE_DIR ? "??????" : "????????????"}`}
                onCancel={e => {
                    e.stopPropagation();
                    e.preventDefault();
                    setShowCreateEntry(null);
                }}
                onOk={e => {
                    e.stopPropagation();
                    e.preventDefault();
                    createEntry();
                }}>
                <Form>
                    <Form.Item name="title" label="??????" rules={[{ required: true }]}>
                        <Input onChange={e => setNewTitle(e.target.value)} />
                    </Form.Item>
                </Form>
            </Modal>
        )}
        {showEventModal == true && <EventModal entryId={state!.entryId} onCancel={() => setShowEventModal(false)} />}
        {showGenCodeModal == true && <GenCodeModal entryId={state!.entryId} onCancel={() => setShowGenCodeModal(false)} />}
    </CardWrap>);
};


export default observer(EntryList);
