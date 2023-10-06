import { useStores } from '@/hooks';
import { APP_PROJECT_KB_DOC_PATH } from '@/utils/constant';
import { Popover, Modal, Input, message, Form } from 'antd';
import classNames from 'classnames';
import { observer } from 'mobx-react';
import React, { useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import DocSpace from './components/DocSpace';
import s from './index.module.less';
import * as prjDocApi from '@/api/project_doc';
import { request } from '@/utils/request';
import { DeleteOutlined, FileTextOutlined } from '@ant-design/icons';


const KnowledgeBaseMenu = () => {
  const history = useHistory();
  const { pathname } = useLocation();
  const userStore = useStores('userStore');
  const projectStore = useStores('projectStore');
  const docSpaceStore = useStores('docSpaceStore');


  const [showAddModal, setShowAddModal] = useState(false);
  const [spaceTitle, setSpaceTitle] = useState("");


  const addDocSpace = async () => {
    const title = spaceTitle.trim();
    if (title == "") {
      message.warn("文档空间标题不能为空");
      return;
    }
    const res = await request(prjDocApi.create_doc_space({
      session_id: userStore.sessionId,
      project_id: projectStore.curProjectId,
      base_info: {
        title: title,
      },
    }));
    if (res) {
      await docSpaceStore.updateDocSpace(res.doc_space_id);
      setShowAddModal(false);
      message.info("创建文档空间成功");
    }
  };

  const docRightTop = () => {
    return (
      <div className={s.submenu_icon_wrap}>
        {projectStore.isAdmin && !projectStore.isClosed && (
          <Popover
            placement="bottomLeft"
            trigger="click"
            overlayClassName="popover"
          >
            <a
              className={s.icon_wrap}
              onClick={e => {
                e.stopPropagation();
                e.preventDefault();
                setShowAddModal(true);
              }}
            >
              <i className={s.add} />
            </a>
          </Popover>
        )}
      </div>
    );
  };

  return (
    <div className={s.menu_wrap}>
      <div
        className={classNames(s.sub_menu_wrap, pathname.startsWith(APP_PROJECT_KB_DOC_PATH) && !docSpaceStore.recycleBin && s.active)}
        onClick={e => {
          e.stopPropagation();
          e.preventDefault();
          if (docSpaceStore.inEdit) {
            docSpaceStore.showCheckLeave(() => {
              docSpaceStore.showDocList("", false);
              history.push(APP_PROJECT_KB_DOC_PATH);
            });
            return;
          }
          docSpaceStore.showDocList("", false);
          history.push(APP_PROJECT_KB_DOC_PATH);
        }}
      >
        <FileTextOutlined /> <span className={s.sub_menu_head}>文档空间</span>{docRightTop()}
      </div>
      <div className={s.doc_space_wrap}>
        <DocSpace />
      </div>
      <div
        className={classNames(s.sub_menu_wrap, pathname.startsWith(APP_PROJECT_KB_DOC_PATH) && docSpaceStore.recycleBin && s.active)}
        onClick={e => {
          e.stopPropagation();
          e.preventDefault();
          if (docSpaceStore.inEdit) {
            docSpaceStore.showCheckLeave(() => {
              docSpaceStore.showDocList("", true);
              history.push(APP_PROJECT_KB_DOC_PATH);
            });
            return;
          }
          docSpaceStore.showDocList("", true);
          history.push(APP_PROJECT_KB_DOC_PATH);
        }}
      >
        <DeleteOutlined /> <span className={s.sub_menu_head}>文档回收站</span>
      </div>
      {showAddModal && (
        <Modal
          title="创建文档空间"
          open={showAddModal}
          onCancel={e => {
            e.stopPropagation();
            e.preventDefault();
            setShowAddModal(false);
          }}
          onOk={e => {
            e.stopPropagation();
            e.preventDefault();
            addDocSpace();
          }}
        >
          <Form>
            <Form.Item label="文档空间名称">
              <Input onChange={e => {
                e.stopPropagation();
                e.preventDefault();
                setSpaceTitle(e.target.value);
              }} />
            </Form.Item>
          </Form>
        </Modal>
      )}
    </div>
  );
};
export default observer(KnowledgeBaseMenu);
