import React, { useEffect, useState } from "react";
import { observer } from 'mobx-react';
import { Card, List } from "antd";
import type { LearnRecordInfo } from "@/api/skill_learn";
import { list_learn_record_in_org } from "@/api/skill_learn";
import { useStores } from "@/hooks";
import { request } from "@/utils/request";
import moment from "moment";
import { ReadOnlyEditor } from "@/components/Editor";

const PAGE_SIZE = 10;

export interface LearnRecordListProps {
    memberUserId: string;
};

const LearnRecordList = (props: LearnRecordListProps) => {
    const userStore = useStores("userStore");
    const orgStore = useStores("orgStore");

    const [recordList, setRecordList] = useState<LearnRecordInfo[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [curPage, setCurPage] = useState(0);

    const loadRecordList = async () => {
        const res = await request(list_learn_record_in_org({
            session_id: userStore.sessionId,
            org_id: orgStore.curOrgId,
            member_user_id: props.memberUserId,
            offset: PAGE_SIZE * curPage,
            limit: PAGE_SIZE,
        }));
        setTotalCount(res.total_count);
        setRecordList(res.record_list);
    };

    useEffect(() => {
        if (orgStore.curOrgId == "") {
            setRecordList([]);
            setTotalCount(0);
        } else {
            loadRecordList();
        }
    }, [curPage, props.memberUserId, orgStore.curOrgId]);

    return (
        <List rowKey="point_id" dataSource={recordList}
            pagination={{ total: totalCount, current: curPage + 1, pageSize: PAGE_SIZE, onChange: page => setCurPage(page - 1), hideOnSinglePage: true, showSizeChanger: false }}
            renderItem={item => (
                <List.Item>
                    <Card title={`在${moment(item.create_time).format("YYYY-MM-DD HH:mm")}花费${item.learn_hour}小时学会${item.cate_name}:${item.full_point_name}`}
                        style={{ width: "100%" }} bordered={false} headStyle={{ backgroundColor: "#eee" }} bodyStyle={{ padding: item.my_learned_len == 0 ? "0px 0px" : undefined }}>
                        {item.my_learned_len > 0 && (
                            <>
                                <h1 style={{ fontSize: "16px", fontWeight: 700 }}>学习心得</h1>
                                <ReadOnlyEditor content={item.my_learned_content} />
                            </>
                        )}
                    </Card>
                </List.Item>
            )} />
    );
};

export default observer(LearnRecordList);