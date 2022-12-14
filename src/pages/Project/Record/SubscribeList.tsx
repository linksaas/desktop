import React, { useEffect, useState } from "react";
import { observer } from 'mobx-react';
import CardWrap from '@/components/CardWrap';
import DetailsNav from "@/components/DetailsNav";
import Button from "@/components/Button";
import CreateSubscribeModal from "./components/CreateSubscribeModal";
import { useStores } from "@/hooks";
import type { SubscribeInfo } from '@/api/events_subscribe';
import { list as list_subscribe } from '@/api/events_subscribe';
import { request } from "@/utils/request";
import s from './SubscribeList.module.less';
import moment from 'moment';
import { Checkbox, Form } from "antd";
import { bookShelfEvOptionList, docEvOptionList, earthlyEvOptionList, extEvOptionList, genBookShelfEvCfgValues, genDocEvCfgValues, genEarthlyEvCfgValues, genExtEvCfgValues, genGiteeEvCfgValues, genGitlabEvCfgValues, genIssueEvCfgValues, genProjectEvCfgValues, genRobotEvCfgValues, genSpritEvCfgValues, genTestCaseEvCfgValues, giteeEvOptionList, gitlabEvOptionList, issueEvOptionList, projectEvOptionList, robotEvOptionList, spritEvOptionList, testCaseEvOptionList } from "./components/constants";
import UpdateSubscribeModal from "./components/UpdateSubscribeModal";


const SubscribeList = () => {
    const userStore = useStores("userStore");
    const projectStore = useStores("projectStore");

    const [showAddModal, setShowAddModal] = useState(false);
    const [subscribeList, setSubscribeList] = useState<SubscribeInfo[]>([]);
    const [curSubscribeId, setCurSubscribeId] = useState("");
    const [updateSubscribe, setUpdateSubscribe] = useState<SubscribeInfo | null>(null);

    const loadSubscribe = async () => {
        const res = await request(list_subscribe({
            session_id: userStore.sessionId,
            project_id: projectStore.curProjectId,
        }));
        setSubscribeList(res.info_list);
    };

    useEffect(() => {
        loadSubscribe();
    }, [projectStore.curProjectId])
    return (
        <CardWrap>
            <DetailsNav title="研发事件订阅" >
                <Button
                    disabled={projectStore.isAdmin == false}
                    onClick={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        setShowAddModal(true);
                    }}>新增订阅</Button>
            </DetailsNav>
            <div className={s.list}>
                <div className={s.list_cont}>
                    {subscribeList.map(item => (
                        <div className={s.list_item} key={item.subscribe_id}>
                            <div className={s.list_hd}>
                                <div className={s.list_title}>{item.chat_bot_name}</div>
                                <Button type="link" disabled={projectStore.isAdmin == false} onClick={e=>{
                                    e.stopPropagation();
                                    e.preventDefault();
                                    setUpdateSubscribe(item);
                                }}>修改</Button>
                                <div className={s.list_info}>
                                    <div className={s.list_info_item}>
                                        创建人：{item.create_display_name}
                                    </div>
                                    <div className={s.list_info_item}>
                                        创建日期: {moment(item.create_time).format("YYYY-MM-DD")}
                                    </div>
                                    <div className={s.list_info_item}>
                                        更新人：{item.update_display_name}
                                    </div>
                                    <div className={s.list_info_item}>
                                        更新日期: {moment(item.update_time).format("YYYY-MM-DD")}
                                    </div>
                                    <a className={s.list_expand} onClick={e => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        if (curSubscribeId == item.subscribe_id) {
                                            setCurSubscribeId("");
                                        } else {
                                            setCurSubscribeId(item.subscribe_id);
                                        }
                                    }}>
                                        {curSubscribeId == item.subscribe_id ? "收起" : "展开"}
                                    </a>
                                </div>
                            </div>
                            {curSubscribeId == item.subscribe_id && (
                                <Form labelCol={{ span: 3 }}>
                                    <Form.Item label="项目事件">
                                        <Checkbox.Group options={projectEvOptionList} defaultValue={genProjectEvCfgValues(item.event_cfg.project_ev_cfg)} disabled={true} />
                                    </Form.Item>
                                    <Form.Item label="电子书事件">
                                        <Checkbox.Group options={bookShelfEvOptionList} defaultValue={genBookShelfEvCfgValues(item.event_cfg.book_shelf_ev_cfg)} disabled={true} />
                                    </Form.Item>
                                    <Form.Item label="文档事件">
                                        <Checkbox.Group options={docEvOptionList} defaultValue={genDocEvCfgValues(item.event_cfg.doc_ev_cfg)} disabled={true} />
                                    </Form.Item>
                                    <Form.Item label="自动化事件">
                                        <Checkbox.Group options={earthlyEvOptionList} defaultValue={genEarthlyEvCfgValues(item.event_cfg.earthly_ev_cfg)} disabled={true} />
                                    </Form.Item>
                                    <Form.Item label="第三方接入事件">
                                        <Checkbox.Group options={extEvOptionList} defaultValue={genExtEvCfgValues(item.event_cfg.ext_ev_cfg)} disabled={true} />
                                    </Form.Item>
                                    <Form.Item label="gitee事件">
                                        <Checkbox.Group options={giteeEvOptionList} defaultValue={genGiteeEvCfgValues(item.event_cfg.gitee_ev_cfg)} disabled={true} />
                                    </Form.Item>
                                    <Form.Item label="gitlab事件">
                                        <Checkbox.Group options={gitlabEvOptionList} defaultValue={genGitlabEvCfgValues(item.event_cfg.gitlab_ev_cfg)} disabled={true} />
                                    </Form.Item>
                                    <Form.Item label="工单事件">
                                        <Checkbox.Group options={issueEvOptionList} defaultValue={genIssueEvCfgValues(item.event_cfg.issue_ev_cfg)} disabled={true} />
                                    </Form.Item>
                                    <Form.Item label="服务器事件">
                                        <Checkbox.Group options={robotEvOptionList} defaultValue={genRobotEvCfgValues(item.event_cfg.robot_ev_cfg)} disabled={true} />
                                    </Form.Item>
                                    <Form.Item label="迭代事件">
                                        <Checkbox.Group options={spritEvOptionList} defaultValue={genSpritEvCfgValues(item.event_cfg.sprit_ev_cfg)} disabled={true} />
                                    </Form.Item>
                                    <Form.Item label="测试用例事件">
                                        <Checkbox.Group options={testCaseEvOptionList} defaultValue={genTestCaseEvCfgValues(item.event_cfg.test_case_ev_cfg)} disabled={true} />
                                    </Form.Item>
                                </Form>
                            )}
                        </div>
                    ))}
                </div>
            </div>
            {showAddModal == true && <CreateSubscribeModal onCancel={() => setShowAddModal(false)} onOk={() => {
                loadSubscribe();
                setShowAddModal(false);
            }} />}
            {updateSubscribe != null && <UpdateSubscribeModal subscribe={updateSubscribe} onCancel={()=>setUpdateSubscribe(null)} onOk={()=>{
                loadSubscribe();
                setUpdateSubscribe(null);
            }}/>}
        </CardWrap>
    );
}

export default observer(SubscribeList);