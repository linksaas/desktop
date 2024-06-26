//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import { Card, Checkbox, List, Modal, Progress, Space } from "antd";
import React, { useState } from "react";
import * as dataAnnoPrjApi from "@/api/data_anno_project";
import Button from "@/components/Button";
import type { DialogFilter } from '@tauri-apps/api/dialog';
import { open as open_dialog } from '@tauri-apps/api/dialog';
import { uniqId } from "@/utils/utils";
import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
import { write_file, set_file_owner, FILE_OWNER_TYPE_DATA_ANNO } from "@/api/fs";
import { get_session } from "@/api/user";
import { request } from "@/utils/request";
import { readTextFile } from '@tauri-apps/api/fs';
import type { ANNO_PROJECT_TYPE } from "@/api/project_entry";


export interface AddResourceModalProps {
    projectId: string;
    annoProjectId: string;
    annoType: ANNO_PROJECT_TYPE;
    fsId: string;
    onCancel: () => void;
    onOk: () => void;
}

interface AddResource {
    id: string;
    value: string;
    done: boolean;
}

const AddResourceModal = (props: AddResourceModalProps) => {
    const [resourceList, setResourceList] = useState<AddResource[]>([]);
    const [inUpload, setInUpload] = useState(false);
    const [splitText, setSplitText] = useState(true);
    const [uploadRatio, setUploadRatio] = useState(0);

    const choiceFile = async () => {
        let filter: DialogFilter = {
            name: "",
            extensions: [],
        };
        if (dataAnnoPrjApi.isAnnoAudio(props.annoType)) {
            filter = {
                name: "音频文件",
                extensions: ["wav", "mp3"],
            };
        } else if (dataAnnoPrjApi.isAnnoImage(props.annoType)) {
            filter = {
                name: "图片文件",
                extensions: ["bmp", "png", "jpg", "jpeg"],
            };
        } else if (dataAnnoPrjApi.isAnnoText(props.annoType)) {
            filter = {
                name: "文本文件",
                extensions: ["txt"],
            };
        }
        const selected = await open_dialog({
            multiple: true,
            filters: [filter],
        });
        const fileList: string[] = [];
        if (Array.isArray(selected)) {
            selected.forEach(item => fileList.push(item));
        } else if (selected != null) {
            fileList.push(selected);
        }
        const tmpList = resourceList.slice();
        for (const file of fileList) {
            const index = tmpList.findIndex(item => item.value == file);
            if (index == -1) {
                tmpList.push({
                    id: uniqId(),
                    value: file,
                    done: false,
                })
            }
        }
        setResourceList(tmpList);
    }

    const uploadResource = async () => {
        setInUpload(true);
        const tmpList = resourceList.slice();
        const sessionId = await get_session();
        const reqList = [] as dataAnnoPrjApi.AddResourceRequest[];
        let doneFileCount = 0;
        let doneReqCount = 0;
        try {
            for (const resource of tmpList) {
                if (resource.done) {
                    doneFileCount += 1;
                    continue;
                }
                if (dataAnnoPrjApi.isAnnoText(props.annoType)) {
                    const content = await readTextFile(resource.value);
                    if (splitText) {
                        for (const line of content.split("\n")) {
                            const value = line.trim();
                            if (value != "") {
                                reqList.push({
                                    session_id: sessionId,
                                    project_id: props.projectId,
                                    anno_project_id: props.annoProjectId,
                                    content: value,
                                    store_as_file: false,
                                });
                            }
                        }
                    } else {
                        reqList.push({
                            session_id: sessionId,
                            project_id: props.projectId,
                            anno_project_id: props.annoProjectId,
                            content: content,
                            store_as_file: false,
                        });
                    }
                } else {
                    const uploadRes = await write_file(sessionId, props.fsId, resource.value, "");
                    const addRes = await request(dataAnnoPrjApi.add_resource({
                        session_id: sessionId,
                        project_id: props.projectId,
                        anno_project_id: props.annoProjectId,
                        content: uploadRes.file_id,
                        store_as_file: true,
                    }));
                    await request(set_file_owner({
                        session_id: sessionId,
                        fs_id: props.fsId,
                        file_id: uploadRes.file_id,
                        owner_type: FILE_OWNER_TYPE_DATA_ANNO,
                        owner_id: addRes.resource_id,
                    }));
                    doneFileCount += 1;
                    setUploadRatio(doneFileCount * 100 / resourceList.length);
                }
                resource.done = true;
                setResourceList(tmpList);
            }
            for (const req of reqList) {
                await request(dataAnnoPrjApi.add_resource(req));
                doneReqCount += 1;
                setUploadRatio(doneReqCount * 100 / reqList.length);
            }
        } catch (e) {
            console.log(e);
        }
        setInUpload(false);
        setResourceList(tmpList);
        const index = tmpList.findIndex(item => item.done == false);
        if (index == -1) {
            props.onOk();
        }
    };

    return (
        <Modal open title="增加标注资源"
            okText="增加" okButtonProps={{ disabled: resourceList.length == 0 || inUpload }}
            onCancel={e => {
                e.stopPropagation();
                e.preventDefault();
                props.onCancel();
            }} onOk={e => {
                e.stopPropagation();
                e.preventDefault();
                uploadResource();
            }}>
            <Card bordered={false} extra={
                <Space>
                    {dataAnnoPrjApi.isAnnoText(props.annoType) && (
                        <Checkbox checked={splitText} onChange={e => {
                            e.stopPropagation();
                            setSplitText(e.target.checked);
                        }}>按回车切割语料</Checkbox>
                    )}

                    <Button onClick={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        choiceFile();
                    }}>添加资源</Button>
                </Space>
            } >
                <List rowKey="id" dataSource={resourceList} renderItem={item => (
                    <List.Item extra={
                        <>
                            {item.done == true && (<CheckOutlined />)}
                            {inUpload == false && item.done == false && (
                                <Button type="link" danger onClick={e => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    const tmpList = resourceList.filter(tmpItem => tmpItem.id != item.id);
                                    setResourceList(tmpList);
                                }}><CloseOutlined /></Button>
                            )}
                        </>
                    }>{item.value}</List.Item>
                )} style={{maxHeight: "calc(100vh - 500px)", overflowY: "auto"}}/>
                {inUpload == true && (
                    <Progress percent={uploadRatio} showInfo={false} />
                )}
            </Card>
        </Modal>
    );
};

export default AddResourceModal;

