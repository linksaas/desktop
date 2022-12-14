import React, { useEffect } from 'react';
import { Modal, Form, Input, Button, message, Divider } from 'antd';
import * as API from '@/api/external_events';
// import AccessStore from '../AccessStore';
import { observer, useLocalObservable } from 'mobx-react';
import { runInAction } from 'mobx';
import style from '../index.module.less';
import { request } from '@/utils/request';
import { clipboard } from '@tauri-apps/api';
import { platform } from '../common';
import { useStores } from '@/hooks';

const ExternalList: React.FC<{ sessionId: string; projectId: string; onChange: () => void }> = (
  props,
) => {
  const { sessionId, projectId } = props;
  const [form] = Form.useForm();
  const projectStore = useStores('projectStore');

  const localStore = useLocalObservable(() => ({
    isModalVisible: false,
    sourceId: '',
    sourceUrl: '',
    secret: '',
    eventSource: 0,
    eventTitle: '',
    eventIcon: '',
    isDisplaySecret: false,
    closeModal() {
      this.isModalVisible = false;
      this.isDisplaySecret = false;
      this.sourceId = '';
      this.sourceUrl = '';
      this.secret = '';
      this.eventSource = 0;
      this.eventTitle = '';
      this.eventIcon = '';
    },
    showSecret(value: boolean) {
      this.isDisplaySecret = value;
    },
    async create(title: string) {
      await request(
        API.create({
          session_id: sessionId,
          project_id: projectId,
          event_source: this.eventSource,
          title,
          event_source_id: this.sourceId,
          secret: this.secret,
        }),
      );
      props.onChange();
    },
    async openModal(data: { title: string; icon: string; eventSource: number }) {
      const resp = await request(API.gen_id_and_secret(sessionId, projectId));

      runInAction(() => {
        this.secret = resp.secret;
        this.sourceUrl = resp.event_source_url;
        this.sourceId = resp.event_source_id;
        this.isModalVisible = true;
        this.eventSource = data.eventSource;
        this.eventTitle = data.title;
        this.eventIcon = data.icon;
      });
    },
  }));
  useEffect(() => {
    return () => {
      form.resetFields();
    };
  });
  return (
    <>
      <ul className={style.platform}>
        {!(projectStore.curProject?.closed) && platform.map((item) => (
          <li key={item.eventSource} onClick={() => localStore.openModal(item)}>
            <img src={item.icon} alt="" />
            {item.title}
          </li>
        ))}
      </ul>
      <Divider />
      <Modal
        title="???????????????"
        visible={localStore.isModalVisible}
        wrapClassName={style.externalModal}
        bodyStyle={{
          width: '550px',
        }}
        footer={false}
        onCancel={() => localStore.closeModal()}
      >
        <Form
          form={form}
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          autoComplete="off"
          onFinish={async () => {
            const title = form.getFieldValue('title');
            await localStore.create(title);
            localStore.closeModal();
            message.success('???????????????');
          }}
        >
          <Form.Item label="????????????">
            <div className={style.souceItem}>
              <img src={localStore.eventIcon} alt="" />
              {localStore.eventTitle}
            </div>
          </Form.Item>
          <Form.Item label="??????" name="title" rules={[{ required: true, message: '???????????????' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="??????">
            <span className={style.text}>{localStore.sourceUrl}</span>
            <span
              className={style.copy}
              onClick={() => {
                clipboard.writeText(localStore.sourceUrl);
                message.success('???????????????');
              }}
            >
              ??????
            </span>
          </Form.Item>
          <Form.Item label="??????">
            {localStore.isDisplaySecret ? (
              <span className={style.text}>{localStore.secret}</span>
            ) : (
              <span className={style.text}>*****************************************</span>
            )}
            <span
              className={style.copy}
              onClick={() => {
                clipboard.writeText(localStore.secret);
                message.success('???????????????');
              }}
            >
              ??????
            </span>
            {localStore.isDisplaySecret ? (
              <span className={style.hide} onClick={() => localStore.showSecret(false)}>
                ??????
              </span>
            ) : (
              <span className={style.watch} onClick={() => localStore.showSecret(true)}>
                ??????
              </span>
            )}
          </Form.Item>
          <Form.Item>
            <div className={style.footer}>
              <Button key="cancel" onClick={() => localStore.closeModal()}>
                ??????
              </Button>
              <Button type="primary" htmlType="submit">
                ??????
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};
export default observer(ExternalList);
