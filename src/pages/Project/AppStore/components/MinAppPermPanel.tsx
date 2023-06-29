import { Card, Checkbox, Form, Popover, Space } from "antd";
import React, { useState } from "react";
import type { MinAppPerm } from "@/api/project_app";
import type { CheckboxOptionType } from 'antd';
import { InfoCircleOutlined } from "@ant-design/icons";


const netOptionList: CheckboxOptionType[] = [
    {
        label: (
            <Space size="small">
                <span>跨域http访问</span>
                <Popover content={
                    <div style={{ padding: "10px 10px" }}>
                        可以调用tauri的http相关接口,查看
                        <a href="https://tauri.app/v1/api/js/http" target="_blank" rel="noreferrer">接口详情</a>。
                    </div>
                }>
                    <InfoCircleOutlined style={{ color: "blue" }} />
                </Popover>
            </Space>
        ),
        value: "cross_domain_http",
    },
    {
        label: "代理redis访问",
        value: "proxy_redis",
    },
    {
        label: "代理mysql访问",
        value: "proxy_mysql",
    },
    {
        label: "代理mongo访问",
        value: "proxy_mongo",
    },
    {
        label: "代理ssh访问",
        value: "proxy_ssh",
    },
    {
        label: "网络诊断",
        value: "net_util",
    }
];

const memberOptionList: CheckboxOptionType[] = [
    {
        label: "列出项目成员",
        value: "list_member",
    },
    {
        label: "列出目标历史",
        value: "list_goal_history",
    },
];

const issueOptionList: CheckboxOptionType[] = [
    {
        label: "列出我的任务",
        value: "list_my_task",
    },
    {
        label: "列出所有任务",
        value: "list_all_task",
    },
    {
        label: "列出我的缺陷",
        value: "list_my_bug",
    },
    {
        label: "列出所有权限",
        value: "list_all_bug",
    },
];

const eventOptionList: CheckboxOptionType[] = [
    {
        label: "列出我的事件",
        value: "list_my_event",
    },
    {
        label: "列出所有事件",
        value: "list_all_event",
    },
];

const fsOptionList: CheckboxOptionType[] = [
    {
        label: "读本地文件",
        value: "read_file",
    },
    {
        label: "写本地文件",
        value: "write_file",
    },
];

const extraOptionList: CheckboxOptionType[] = [
    {
        label: (
            <Space size="small">
                <span>crossOriginIsolated</span>
                <Popover content={
                    <div style={{ padding: "10px 10px" }}>
                        设置windows.crossOriginIsolated为true
                        <a href="https://developer.mozilla.org/en-US/docs/Web/API/crossOriginIsolated" target="_blank" rel="noreferrer">详细信息</a>。
                    </div>
                }>
                    <InfoCircleOutlined style={{ color: "blue" }} />
                </Popover>
            </Space>
        ),
        value: "cross_origin_isolated",
    },
    {
        label: "打开浏览器",
        value: "open_browser",
    },
];

interface MinAppPermPanelProps {
    disable: boolean;
    showTitle: boolean;
    perm?: MinAppPerm;
    onChange: (perm: MinAppPerm) => void;
}

const MinAppPermPanel: React.FC<MinAppPermPanelProps> = (props) => {
    const tmpNetValues: string[] = [];
    const tmpMemberValues: string[] = [];
    const tmpIssueValues: string[] = [];
    const tmpEventValues: string[] = [];
    const tmpFsValues: string[] = [];
    const tmpExtraValues: string[] = [];

    if (props.perm != undefined) {

        if (props.perm.net_perm.cross_domain_http) {
            tmpNetValues.push("cross_domain_http");
        }
        if (props.perm.net_perm.proxy_redis) {
            tmpNetValues.push("proxy_redis");
        }
        if (props.perm.net_perm.proxy_mysql) {
            tmpNetValues.push("proxy_mysql");
        }
        if (props.perm.net_perm.proxy_mongo) {
            tmpNetValues.push("proxy_mongo");
        }
        if (props.perm.net_perm.proxy_ssh){
            tmpNetValues.push("proxy_ssh");
        }
        if (props.perm.net_perm.net_util){
            tmpNetValues.push("net_util");
        }

        if (props.perm.member_perm.list_member) {
            tmpMemberValues.push("list_member");
        }
        if (props.perm.member_perm.list_goal_history) {
            tmpMemberValues.push("list_goal_history");
        }


        if (props.perm.issue_perm.list_my_task) {
            tmpIssueValues.push("list_my_task");
        }
        if (props.perm.issue_perm.list_all_task) {
            tmpIssueValues.push("list_all_task");
        }
        if (props.perm.issue_perm.list_my_bug) {
            tmpIssueValues.push("list_my_bug");
        }
        if (props.perm.issue_perm.list_all_bug) {
            tmpIssueValues.push("list_all_bug");
        }


        if (props.perm.event_perm.list_my_event) {
            tmpEventValues.push("list_my_event");
        }
        if (props.perm.event_perm.list_all_event) {
            tmpEventValues.push("list_all_event");
        }

        if (props.perm.fs_perm.read_file) {
            tmpFsValues.push("read_file");
        }
        if (props.perm.fs_perm.write_file) {
            tmpFsValues.push("write_file");
        }

        if (props.perm.extra_perm.cross_origin_isolated) {
            tmpExtraValues.push("cross_origin_isolated");
        }
        if (props.perm.extra_perm.open_browser) {
            tmpExtraValues.push("open_browser");
        }
    }

    const [netValues, setNetValues] = useState<string[]>(tmpNetValues);
    const [memberValues, setMemberValues] = useState<string[]>(tmpMemberValues);
    const [issueValues, setIssueValues] = useState<string[]>(tmpIssueValues);
    const [eventValues, setEventValues] = useState<string[]>(tmpEventValues);
    const [fsValues, setFsValues] = useState<string[]>(tmpFsValues);
    const [extraValues, setExtraValues] = useState<string[]>(tmpExtraValues);

    const calcPerm = (netPermList: string[], memberPermList: string[], issuePermList: string[], eventPermList: string[], fsPermList: string[], extraPermList: string[]) => {
        const tempPerm: MinAppPerm = {
            net_perm: {
                cross_domain_http: false,
                proxy_redis: false,
                proxy_mysql: false,
                proxy_mongo: false,
                proxy_ssh: false,
                net_util: false,
            },
            member_perm: {
                list_member: false,
                list_goal_history: false,
            },
            issue_perm: {
                list_my_task: false,
                list_all_task: false,
                list_my_bug: false,
                list_all_bug: false,
            },
            event_perm: {
                list_my_event: false,
                list_all_event: false,
            },
            fs_perm: {
                read_file: false,
                write_file: false,
            },
            extra_perm: {
                cross_origin_isolated: false,
                open_browser: false,
            }
        };
        netPermList.forEach(permStr => {
            if (permStr == "cross_domain_http") {
                tempPerm.net_perm.cross_domain_http = true;
            } else if(permStr == "proxy_redis"){
                tempPerm.net_perm.proxy_redis = true;
            }else if(permStr == "proxy_mysql"){
                tempPerm.net_perm.proxy_mysql = true;
            }else if(permStr == "proxy_mongo"){
                tempPerm.net_perm.proxy_mongo = true;
            }else if(permStr == "proxy_ssh"){
                tempPerm.net_perm.proxy_ssh = true;
            }else if(permStr == "net_util"){
                tempPerm.net_perm.net_util = true;
            }
        });
        memberPermList.forEach(permStr => {
            if (permStr == "list_member") {
                tempPerm.member_perm.list_member = true;
            } else if (permStr == "list_goal_history") {
                tempPerm.member_perm.list_goal_history = true;
            }
        });
        issuePermList.forEach(permStr => {
            if (permStr == "list_my_task") {
                tempPerm.issue_perm.list_my_task = true;
            } else if (permStr == "list_all_task") {
                tempPerm.issue_perm.list_all_task = true;
            } else if (permStr == "list_my_bug") {
                tempPerm.issue_perm.list_my_bug = true;
            } else if (permStr == "list_all_bug") {
                tempPerm.issue_perm.list_all_bug = true;
            }
        });
        eventPermList.forEach(permStr => {
            if (permStr == "list_my_event") {
                tempPerm.event_perm.list_my_event = true;
            } else if (permStr == "list_all_event") {
                tempPerm.event_perm.list_all_event = true;
            }
        });
        fsPermList.forEach(permStr => {
            if (permStr == "read_file") {
                tempPerm.fs_perm.read_file = true;
            } else if (permStr == "write_file") {
                tempPerm.fs_perm.write_file = true;
            }
        })
        extraPermList.forEach(permStr => {
            if (permStr == "cross_origin_isolated") {
                tempPerm.extra_perm.cross_origin_isolated = true;
            } else if (permStr == "open_browser") {
                tempPerm.extra_perm.open_browser = true;
            }
        });
        props.onChange(tempPerm);
    };

    return (
        <Card title={props.showTitle ? "微应用权限" : null} bordered={false}>
            <Form labelCol={{ span: 5 }}>
                <Form.Item label="网络权限">
                    <Checkbox.Group disabled={props.disable} options={netOptionList} value={netValues}
                        onChange={values => {
                            setNetValues(values as string[]);
                            calcPerm(values as string[], memberValues, issueValues, eventValues, fsValues, extraValues);
                        }} />
                </Form.Item>
                <Form.Item label="项目成员权限">
                    <Checkbox.Group disabled={props.disable} options={memberOptionList} value={memberValues}
                        onChange={values => {
                            setMemberValues(values as string[]);
                            calcPerm(netValues, values as string[], issueValues, eventValues, fsValues, extraValues);
                        }} />
                </Form.Item>
                <Form.Item label="工单权限">
                    <Checkbox.Group disabled={props.disable} options={issueOptionList} value={issueValues}
                        onChange={values => {
                            setIssueValues(values as string[]);
                            calcPerm(netValues, memberValues, values as string[], eventValues, fsValues, extraValues);
                        }} />
                </Form.Item>
                <Form.Item label="事件权限">
                    <Checkbox.Group disabled={props.disable} options={eventOptionList} value={eventValues}
                        onChange={values => {
                            setEventValues(values as string[]);
                            calcPerm(netValues, memberValues, issueValues, values as string[], fsValues, extraValues);
                        }} />
                </Form.Item>
                <Form.Item label="本地文件权限">
                    <Checkbox.Group disabled={props.disable} options={fsOptionList} value={fsValues}
                        onChange={values => {
                            setFsValues(values as string[]);
                            calcPerm(netValues, memberValues, issueValues, eventValues, values as string[], extraValues);
                        }} />
                </Form.Item>
                <Form.Item label="其他权限">
                    <Checkbox.Group disabled={props.disable} options={extraOptionList} value={extraValues}
                        onChange={values => {
                            setExtraValues(values as string[]);
                            calcPerm(netValues, memberValues, issueValues, eventValues, fsValues, values as string[]);
                        }} />
                </Form.Item>
            </Form>
        </Card>
    );
}

export default MinAppPermPanel;