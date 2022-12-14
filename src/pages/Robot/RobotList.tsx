import React, { useEffect, useState } from "react";
import { observer } from 'mobx-react';
import CardWrap from '@/components/CardWrap';
import s from './RobotList.module.less';
import addIcon from '@/assets/image/addIcon.png';
import Button from "@/components/Button";
import { useStores } from "@/hooks";
import AddRobotModal from "./components/AddRobotModal";
import { Modal, Table, message } from "antd";
import type { RobotInfo } from '@/api/robot';
import {
    list as list_robot,
    get_token,
    remove as remove_robot,
    add_access_user,
    remove_access_user,
    update_basic_info,
} from '@/api/robot';
import { request } from '@/utils/request';
import type { ColumnsType } from "antd/lib/table";
import Pagination from "@/components/Pagination";
import { UseageModal } from "./components/UseageModal";
import { LinkRobotMetricInfo } from "@/stores/linkAux";
import { useHistory } from "react-router-dom";
import { EditText } from "@/components/EditCell/EditText";
import EditMemberList from "./components/EditMemberList";

const PAGE_SIZE = 10;

interface UsageInfo {
    robotId: string;
    serverAddr: string;
    token: string;
}


const RobotList = () => {
    const userStore = useStores('userStore');
    const projectStore = useStores('projectStore');
    const linkAuxStore = useStores('linkAuxStore');

    const history = useHistory();

    const [showAddModal, setShowAddModal] = useState(false);
    const [robotList, setRobotList] = useState<RobotInfo[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [curPage, setCurPage] = useState(0);
    const [useage, setUseage] = useState<UsageInfo | null>(null);
    const [removeRobotInfo, setRemoveRobotInfo] = useState<RobotInfo | null>(null);


    const showUseage = async (robotId: string) => {
        const res = await request(get_token({
            session_id: userStore.sessionId,
            project_id: projectStore.curProjectId,
            robot_id: robotId,
        }));
        if (res) {
            setUseage({
                robotId: robotId,
                serverAddr: res.server_addr,
                token: res.token,
            });
        }
    };

    const addMember = async (robotId: string, memberUserId: string) => {
        try {
            const res = await add_access_user({
                session_id: userStore.sessionId,
                project_id: projectStore.curProjectId,
                robot_id: robotId,
                member_user_id: memberUserId,
            });
            if (res.code != 0) {
                message.error(res.err_msg);
                return false;
            }
            return true;
        } catch (e) {
            console.log(e);
            return false;
        }
    };

    const removeMember = async (robotId: string, memberUserId: string) => {
        try {
            const res = await remove_access_user({
                session_id: userStore.sessionId,
                project_id: projectStore.curProjectId,
                robot_id: robotId,
                member_user_id: memberUserId,
            });
            if (res.code != 0) {
                message.error(res.err_msg);
                return false;
            }
            return true;
        } catch (e) {
            console.log(e);
            return false;
        }
    };

    const columns: ColumnsType<RobotInfo> = [
        {
            title: "??????",
            width: 150,
            render: (_, record: RobotInfo) => (
                <EditText
                    editable={projectStore.isAdmin}
                    content={record.basic_info.name}
                    onChange={async (value: string) => {
                        try {
                            const res = await update_basic_info({
                                session_id: userStore.sessionId,
                                project_id: record.project_id,
                                robot_id: record.robot_id,
                                basic_info: {
                                    name: value,
                                },
                            });
                            if (res.code != 0) {
                                message.error(res.err_msg);
                                return false;
                            }
                            return true;
                        } catch (e) {
                            console.log(e);
                            return false;
                        }
                    }} showEditIcon={true} />),
        },
        {
            title: "????????????",
            dataIndex: "online",
            width: 100,
            render: (online: boolean, record: RobotInfo) => {
                return (<span>
                    {online ? "??????" : "??????"}&nbsp;&nbsp;
                    {online == false && <a onClick={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        showUseage(record.robot_id);
                    }}>????????????</a>}
                </span>)
            }
        },
        {
            title: "???????????????",
            dataIndex: "robot_version",
            width: 80,
        },
        {
            title: "???????????????",
            width: 100,
            render: (_, record: RobotInfo) => (<div>
                <div>????????????</div>
                <div>??????earthly???{record.robot_cap.earthly ? "???" : "???"}</div>
                <div>??????artifact???{record.robot_cap.artifact ? "???" : "???"}</div>
            </div>)
        },
        {
            title: "??????",
            width: 100,
            render: (_, record: RobotInfo) => {
                return <span>
                    ???{record.metric_count}????????????&nbsp;&nbsp;
                    {record.online && record.can_metric &&
                        <div>
                            <a onClick={e => {
                                e.stopPropagation();
                                e.preventDefault();
                                linkAuxStore.goToLink(new LinkRobotMetricInfo("", projectStore.curProjectId, record.robot_id), history);
                            }}>????????????</a>
                        </div>}
                </span>
            }
        },
        {
            title: "????????????",
            width: 200,
            render: (_, record: RobotInfo) => (
                <EditMemberList
                    editable={projectStore.isAdmin}
                    memberIdList={record.access_member_id_list}
                    showEditIcon={true}
                    onAddMember={async (memberId: string) => {
                        return addMember(record.robot_id, memberId);
                    }} onRemoveMember={async (memberId: string) => {
                        return removeMember(record.robot_id, memberId);
                    }} />),
        },
        {
            title: "??????",
            width: 50,
            render: (_, record: RobotInfo) => {
                return <a onClick={e => {
                    e.stopPropagation();
                    e.preventDefault();
                    setRemoveRobotInfo(record);
                }}>??????</a>
            }
        }
    ];

    const loadRobot = async () => {
        const res = await request(list_robot({
            session_id: userStore.sessionId,
            project_id: projectStore.curProjectId,
            offset: curPage * PAGE_SIZE,
            limit: PAGE_SIZE,
        }));
        if (res) {
            setRobotList(res.robot_list);
            setTotalCount(res.total_count);
        }
    }

    const removeRobot = async () => {
        if (removeRobotInfo == null) {
            return;
        }
        const res = await request(remove_robot({
            session_id: userStore.sessionId,
            project_id: projectStore.curProjectId,
            robot_id: removeRobotInfo!.robot_id,
        }));
        if (res) {
            setRemoveRobotInfo(null);
            loadRobot();
        }
    };

    useEffect(() => {
        loadRobot();
    }, [projectStore.curProjectId, curPage]);

    return (<CardWrap>
        <div className={s.robot_wrap}>
            <div style={{ marginRight: '20px' }}>
                <div className={s.title}>
                    <h2>???????????????</h2>
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
                        ???????????????
                    </Button>
                </div>
                <Table
                    rowKey={"robot_id"}
                    dataSource={robotList}
                    columns={columns}
                    pagination={false}
                    scroll={{ x: 800, y: 'calc(100vh - 260px)' }} />
                <Pagination current={curPage + 1} total={totalCount} pageSize={PAGE_SIZE} onChange={page => setCurPage(page - 1)} />
            </div>
        </div>
        {showAddModal && <AddRobotModal onCancel={() => setShowAddModal(false)} onOk={() => {
            if (curPage != 0) {
                setCurPage(0);
            } else {
                loadRobot();
            }
            setShowAddModal(false);
        }} />}
        {useage != null && <UseageModal
            projectId={projectStore.curProjectId}
            robotId={useage.robotId}
            serverAddr={useage.serverAddr}
            token={useage.token}
            onCancel={() => {
                setUseage(null);
            }} />}
        {removeRobotInfo != null && (
            <Modal
                title={`???????????????${removeRobotInfo.basic_info.name}`}
                open={true}
                onCancel={e => {
                    e.stopPropagation();
                    e.preventDefault();
                    setRemoveRobotInfo(null);
                }}
                onOk={e => {
                    e.stopPropagation();
                    e.preventDefault();
                    removeRobot();
                }}
            >
                ?????????????????????{removeRobotInfo.basic_info.name}?
            </Modal>)}
    </CardWrap>)
};

export default observer(RobotList);