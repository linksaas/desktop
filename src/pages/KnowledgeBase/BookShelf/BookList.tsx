import React, { useEffect, useState } from "react";
import { observer } from 'mobx-react';
import { Card, message, Modal, Space, Table, Input } from "antd";
import s from './BookList.module.less';
import { BookOutlined, EditOutlined, LinkOutlined } from "@ant-design/icons";
import Button from "@/components/Button";
import { open as open_dialog } from '@tauri-apps/api/dialog';
import { parse_book_title, list_book, update_book } from '@/api/project_book_shelf';
import UploadBookModal from "./components/UploadBookModal";
import { useStores } from "@/hooks";
import type { BookInfo } from '@/api/project_book_shelf';
import { request } from '@/utils/request';
import Pagination from "@/components/Pagination";
import type { ColumnsType } from 'antd/es/table';
import moment from 'moment';


const PAGE_SIZE = 10;

interface UploadBookInfo {
    filePath: string;
    title: string;
}

const BookList = () => {
    const userStore = useStores('userStore');
    const projectStore = useStores('projectStore');
    const bookShelfStore = useStores('bookShelfStore');

    const [uploadInfo, setUploadInfo] = useState<UploadBookInfo | null>(null);
    const [curPage, setCurPage] = useState(0);
    const [bookCount, setBookCount] = useState(0);
    const [bookList, setBookList] = useState<BookInfo[]>([]);
    const [updateBookId, setUpdateBookId] = useState("");
    const [updateTitle, setUpdateTitle] = useState("");

    const showUploadFile = async () => {
        const bookFile = await open_dialog({
            directory: false,
            filters: [{
                name: "电子书",
                extensions: ["epub"],
            }],
            multiple: false,
            title: "上传电子书(只支持epub)",
        });
        if (Array.isArray(bookFile) || bookFile == null) {
            message.warn("没有选择电子书文件");
            return;
        }
        try {
            const title = await parse_book_title(bookFile as string);
            setUploadInfo({ filePath: bookFile as string, title: title });
        } catch (e: unknown) {
            console.log(e);
            message.error(e as string);
        }
    };

    const loadBook = async () => {
        const res = await request(list_book({
            session_id: userStore.sessionId,
            project_id: projectStore.curProjectId,
            offset: curPage * PAGE_SIZE,
            limit: PAGE_SIZE,
        }));
        if (res) {
            setBookCount(res.total_count);
            setBookList(res.info_list);
        }
    };

    const updateBookTitle = async () => {
        if (updateTitle == "") {
            message.error("书名不能为空");
            return;
        }
        const res = await request(update_book({
            session_id: userStore.sessionId,
            project_id: projectStore.curProjectId,
            book_id: updateBookId,
            book_title: updateTitle,
        }));
        if (res) {
            const tmpList = bookList.slice();
            const index = tmpList.findIndex(book => book.book_id == updateBookId);
            if (index != -1) {
                tmpList[index].book_title = updateTitle;
                setBookList(tmpList);
            }
            setUpdateTitle("");
            setUpdateBookId("");
        }
    }

    const columns: ColumnsType<BookInfo> = [
        {
            title: "书名",
            render: (_, record: BookInfo) => (
                <Space size="large">
                    <a onClick={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        bookShelfStore.setShowBook(record.book_id);
                    }}><LinkOutlined />{record.book_title}</a>
                    <a onClick={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        setUpdateTitle(record.book_title);
                        setUpdateBookId(record.book_id);
                    }}><EditOutlined />修改书名</a>
                </Space>
            )
        },
        {
            title: "创建人员",
            dataIndex: "create_display_name",
            width: 100,
        },
        {
            title: "创建时间",
            width: 150,
            render: (_, record: BookInfo) => (
                <span>{moment(record.create_time).format("YYYY-MM-DD HH:mm:ss")}</span>
            ),
        }
    ];

    useEffect(() => {
        loadBook();
    }, [projectStore.curProjectId, curPage]);

    return (
        <Card
            title={<h1 className={s.header}><BookOutlined /> 电子书库</h1>}
            bordered={false}
            extra={<Button 
                type="primary" 
                style={{ height: "30px" }} 
                disabled={!projectStore.isAdmin}
                onClick={e => {
                e.stopPropagation();
                e.preventDefault();
                showUploadFile();
            }}>上传电子书</Button>}>
            <div className={s.contentWrap}>
                <Table dataSource={bookList} columns={columns} pagination={false} rowKey="book_id" />
                {bookCount > PAGE_SIZE && (<div className={s.pagingWrap}>
                    <div className={s.paging} >
                        <Pagination current={curPage + 1} total={bookCount} pageSize={PAGE_SIZE}
                            onChange={(p: number) => setCurPage(p - 1)} />
                    </div>
                </div>)}
            </div>

            {uploadInfo != null && (<UploadBookModal
                filePath={uploadInfo.filePath}
                title={uploadInfo.title}
                onErr={errMsg => {
                    message.error(errMsg);
                    setUploadInfo(null);
                }}
                onOk={() => {
                    message.info("上传电子书成功");
                    setUploadInfo(null);
                    if (curPage != 0) {
                        setCurPage(0);
                    } else {
                        loadBook();
                    }
                }} />)}
            {updateBookId != "" && (
                <Modal
                    title="修改书名"
                    open
                    mask={false}
                    onCancel={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        setUpdateBookId("");
                    }}
                    onOk={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        updateBookTitle();
                    }}>
                    <Input addonBefore="书名" value={updateTitle} onChange={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        setUpdateTitle(e.target.value);
                    }} />
                </Modal>
            )}
        </Card>
    );
};

export default observer(BookList);