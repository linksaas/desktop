import { Card, Form, Input, Modal, Select, message } from "antd";
import React from "react";
import { observer, useLocalObservable } from 'mobx-react';
import type { RESULT_TYPE } from "@/api/project_test_case";
import { RESULT_TYPE_FAIL, RESULT_TYPE_SUCCESS, RESULT_TYPE_WARN, add_result, RESULT_FROM_UI } from "@/api/project_test_case";
import Button from "@/components/Button";
import s from './AddResultModal.module.less';
import { open as open_dialog } from '@tauri-apps/api/dialog';
import { useStores } from "@/hooks";
import { uniqId } from "@/utils/utils";
import { request } from "@/utils/request";
import * as fsApi from '@/api/fs';
import FsImage from "@/components/Fs/FsImage";
import { runInAction } from "mobx";
import FsFile from "@/components/Fs/FsFile";



interface AddResultModalProps {
    entryId: string;
    onCancel: () => void;
    onOk: () => void;
}

interface ImageItem {
    itemId: string;
    thumbFileId: string;
    fileId: string;
    filePath: string;
    fileName: string;
}

interface FileItem {
    itemId: string;
    fileId: string;
    fileName: string;
    fileSize: number;
    filePath: string;
}

interface FormValue {
    resultType: RESULT_TYPE | undefined;
    desc: string | undefined;
}

const AddResultModal: React.FC<AddResultModalProps> = (props) => {
    const userStore = useStores('userStore');
    const projectStore = useStores('projectStore');

    const [form] = Form.useForm();


    const localStore = useLocalObservable(() => ({
        imageList: [] as ImageItem[],
        fileList: [] as FileItem[],
    }));

    const setThumbFileId = (itemId: string, fileId: string) => {
        const tmpList = localStore.imageList.slice();
        const index = tmpList.findIndex(item => item.itemId == itemId);
        if (index != -1) {
            tmpList[index].thumbFileId = fileId;
        }
        runInAction(() => {
            localStore.imageList = tmpList;
        });
    };

    const setImageFileId = (itemId: string, fileId: string) => {
        const tmpList = localStore.imageList.slice();
        const index = tmpList.findIndex(item => item.itemId == itemId);
        if (index != -1) {
            tmpList[index].fileId = fileId;
        }
        runInAction(() => {
            localStore.imageList = tmpList;
        });
    }

    const removeImage = (itemId: string) => {
        const tmpList = localStore.imageList.filter(item => item.itemId != itemId);
        runInAction(() => {
            localStore.imageList = tmpList;
        });
    }

    const uploadImage = async () => {
        const selected = await open_dialog({
            multiple: true,
            filters: [
                {
                    name: '??????',
                    extensions: ['png', 'jpg', 'jpeg', 'gif'],
                },
            ],
        });
        let tmpFileList: string[] = [];
        if (Array.isArray(selected)) {
            tmpFileList = selected;
        } else if (selected === null) {
            //do nothing
        } else {
            tmpFileList.push(selected);
        }
        const uploadList: ImageItem[] = [];
        const tmpImgList = localStore.imageList.slice();
        for (const file of tmpFileList) {
            let fileName = file.replaceAll('\\', '/');
            const pos = fileName.lastIndexOf('/');
            if (pos != -1) {
                fileName = fileName.substring(pos + 1);
            }
            const item = {
                itemId: uniqId(),
                thumbFileId: "",
                fileId: "",
                filePath: file,
                fileName: fileName,
            }
            uploadList.push(item);
            tmpImgList.push(item);
        }
        runInAction(() => {
            localStore.imageList = tmpImgList;
        });

        for (const uploadInfo of uploadList) {
            //???????????????
            const thumbRes = await request(
                fsApi.write_thumb_image_file(
                    userStore.sessionId,
                    projectStore.curProject?.test_case_fs_id ?? "",
                    uploadInfo.filePath, "", 200, 150));
            await request(
                fsApi.set_file_owner({
                    session_id: userStore.sessionId,
                    fs_id: projectStore.curProject?.test_case_fs_id ?? "",
                    file_id: thumbRes.file_id,
                    owner_type: fsApi.FILE_OWNER_TYPE_PROJECT,
                    owner_id: projectStore.curProjectId,
                }),
            );
            setThumbFileId(uploadInfo.itemId, thumbRes.file_id);
            //??????????????????
            const res = await request(
                fsApi.write_file(
                    userStore.sessionId,
                    projectStore.curProject?.test_case_fs_id ?? "",
                    uploadInfo.filePath,
                    uploadInfo.itemId));
            await request(
                fsApi.set_file_owner({
                    session_id: userStore.sessionId,
                    fs_id: projectStore.curProject?.test_case_fs_id ?? "",
                    file_id: res.file_id,
                    owner_type: fsApi.FILE_OWNER_TYPE_PROJECT,
                    owner_id: projectStore.curProjectId,
                }),
            );
            setImageFileId(uploadInfo.itemId, res.file_id);
        }
    };

    const setFileFileId = (itemId: string, fileId: string) => {
        const tmpList = localStore.fileList.slice();
        const index = tmpList.findIndex(item => item.itemId == itemId);
        if (index != -1) {
            tmpList[index].fileId = fileId;
        }
        runInAction(() => {
            localStore.fileList = tmpList;
        });
    };

    const uploadFile = async () => {
        const selected = await open_dialog({
            multiple: true,
        });
        let tmpFileList: string[] = [];
        if (Array.isArray(selected)) {
            tmpFileList = selected;
        } else if (selected === null) {
            //do nothing
        } else {
            tmpFileList.push(selected);
        }
        const uploadList: FileItem[] = [];
        const tmpFList = localStore.fileList.slice();
        for (const file of tmpFileList) {
            let fileName = file.replaceAll('\\', '/');
            const pos = fileName.lastIndexOf('/');
            if (pos != -1) {
                fileName = fileName.substring(pos + 1);
            }
            const fileSize = await fsApi.stat_local_file(file);
            const item = {
                itemId: uniqId(),
                fileId: "",
                fileName: fileName,
                fileSize: fileSize,
                filePath: file,
            }
            uploadList.push(item);
            tmpFList.push(item);
        }
        runInAction(() => {
            localStore.fileList = tmpFList;
        });
        for (const uploadInfo of uploadList) {
            const res = await request(
                fsApi.write_file(
                    userStore.sessionId,
                    projectStore.curProject?.test_case_fs_id ?? "",
                    uploadInfo.filePath,
                    uploadInfo.itemId));
            await request(
                fsApi.set_file_owner({
                    session_id: userStore.sessionId,
                    fs_id: projectStore.curProject?.test_case_fs_id ?? "",
                    file_id: res.file_id,
                    owner_type: fsApi.FILE_OWNER_TYPE_PROJECT,
                    owner_id: projectStore.curProjectId,
                }),
            );
            setFileFileId(uploadInfo.itemId, res.file_id);
        }
    };

    const removeFile = (itemId: string) => {
        const tmpList = localStore.fileList.filter(item => item.itemId != itemId);
        runInAction(() => {
            localStore.fileList = tmpList;
        });
    }

    const addResult = async () => {
        //????????????
        const formValue = form.getFieldsValue() as FormValue;
        console.log(formValue);
        if (formValue.resultType == undefined) {
            formValue.resultType = RESULT_TYPE_SUCCESS;
        }
        if (formValue.desc == undefined || formValue.desc == "") {
            message.warn("????????????????????????");
            return;
        }
        const imgIndex = localStore.imageList.findIndex(item => item.fileId == "");
        if (imgIndex != -1) {
            message.warn("????????????????????????");
            return;
        }
        const fileIndex = localStore.fileList.findIndex(item => item.fileId == "");
        if (fileIndex != -1) {
            message.warn("????????????????????????");
            return;
        }
        //????????????
        const addResultRes = await request(add_result({
            session_id: userStore.sessionId,
            project_id: projectStore.curProjectId,
            entry_id: props.entryId,
            basic_result: {
                desc: formValue.desc!,
                result_type: formValue.resultType!,
                result_from: RESULT_FROM_UI,
                image_list: localStore.imageList.map(item => {
                    return {
                        file_id: item.fileId,
                        thumb_file_id: item.thumbFileId,
                    };
                }),
                extra_file_id_list: localStore.fileList.map(item => item.fileId),
            },
        }));
        //????????????owner
        for (const imageItem of localStore.imageList) {
            await fsApi.set_file_owner({
                session_id: userStore.sessionId,
                fs_id: projectStore.curProject?.test_case_fs_id ?? "",
                file_id: imageItem.thumbFileId,
                owner_type: fsApi.FILE_OWNER_TYPE_TEST_CASE_RESULT,
                owner_id: addResultRes.result_id,
            });
            await fsApi.set_file_owner({
                session_id: userStore.sessionId,
                fs_id: projectStore.curProject?.test_case_fs_id ?? "",
                file_id: imageItem.fileId,
                owner_type: fsApi.FILE_OWNER_TYPE_TEST_CASE_RESULT,
                owner_id: addResultRes.result_id,
            });
        }
        for (const fileItem of localStore.fileList) {
            await fsApi.set_file_owner({
                session_id: userStore.sessionId,
                fs_id: projectStore.curProject?.test_case_fs_id ?? "",
                file_id: fileItem.fileId,
                owner_type: fsApi.FILE_OWNER_TYPE_TEST_CASE_RESULT,
                owner_id: addResultRes.result_id,
            });
        }
        //????????????
        props.onOk();
    };


    return (
        <Modal
            open
            title="??????????????????"
            width={800}
            onCancel={e => {
                e.stopPropagation();
                e.preventDefault();
                props.onCancel();
            }}
            onOk={e => {
                e.stopPropagation();
                e.preventDefault();
                addResult();
            }}
        >
            <div className={s.content_wrap}>
                <Form form={form} labelCol={{ span: 4 }}>
                    <Form.Item label="????????????" name="resultType" rules={[{ required: true }]}>
                        <Select defaultValue={RESULT_TYPE_SUCCESS}>
                            <Select.Option value={RESULT_TYPE_SUCCESS}>??????</Select.Option>
                            <Select.Option value={RESULT_TYPE_WARN}>??????</Select.Option>
                            <Select.Option value={RESULT_TYPE_FAIL}>??????</Select.Option>
                        </Select>
                    </Form.Item>
                    <Form.Item label="????????????" name="desc" rules={[{ required: true }]}>
                        <Input.TextArea rows={4} />
                    </Form.Item>
                </Form>
                <Card title="????????????" bordered={false} extra={
                    <Button onClick={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        uploadImage();
                    }}>????????????</Button>}>
                    <div>
                        {localStore.imageList.map(item => (
                            <FsImage key={item.itemId} itemId={item.itemId}
                                fsId={projectStore.curProject?.test_case_fs_id ?? ""}
                                thumbFileId={item.thumbFileId}
                                fileId={item.fileId}
                                fileName={item.fileName}
                                preview={false}
                                onRemove={() => {
                                    removeImage(item.itemId);
                                }} />
                        ))}
                    </div>
                </Card>
                <Card title="????????????" bordered={false} extra={
                    <Button onClick={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        uploadFile();
                    }}>????????????</Button>
                }>
                    <div>
                        {localStore.fileList.map(item => (
                            <FsFile key={item.itemId} itemId={item.itemId}
                                fsId={projectStore.curProject?.test_case_fs_id ?? ""}
                                fileId={item.fileId}
                                fileName={item.fileName}
                                fileSize={item.fileSize}
                                download={false}
                                onRemove={() => {
                                    removeFile(item.itemId);
                                }}
                            />
                        ))}
                    </div>
                </Card>
            </div>
        </Modal>
    );
};

export default observer(AddResultModal);