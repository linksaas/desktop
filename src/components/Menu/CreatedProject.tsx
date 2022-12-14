import ActionModal from '@/components/ActionModal';
import { Form, Input, message } from 'antd';
import type { FC } from 'react';
import React from 'react';
import Button from '../Button';
import type { BasicProjectInfo } from '@/api/project';
import { create } from '@/api/project';
import { useStores } from '@/hooks';
import { request } from '@/utils/request';
import { useSimpleEditor } from '@/components/Editor';

type CreatedProjectProps = {
  visible: boolean;
  onChange: (boo: boolean) => void;
};

const CreatedProject: FC<CreatedProjectProps> = (props) => {
  const { visible, onChange } = props;
  const [form] = Form.useForm();
  const userStore = useStores('userStore');
  const projectStore = useStores('projectStore');

  const { editor, editorRef } = useSimpleEditor("请输入项目描述");

  const submit = async (values: { project_name: string }) => {
    const content = editorRef.current?.getContent() ?? {};

    const data: BasicProjectInfo = {
      project_name: values.project_name,
      project_desc: JSON.stringify(content),
    };
    try {
      const res = await request(create(userStore.sessionId, data));
      message.success('创建项目成功');
      await projectStore.updateProject(res.project_id);
      onChange(false);
    } catch (error) {}
  };

  return (
    <ActionModal visible={visible} title="创建项目" width={800} onCancel={() => onChange(false)}>
      <Form form={form} onFinish={submit} labelCol={{ span: 3 }}>
        <Form.Item
          name="project_name"
          label="项目名称"
          rules={[{ required: true, message: '项目名称必填' }]}
        >
          <Input allowClear placeholder={`请输入项目名称`} style={{ borderRadius: '6px' }} />
        </Form.Item>
        <Form.Item name="project_desc" label="项目介绍">
          <div className="_projectEditContext" style={{ marginTop: '-12px' }}>
            {editor}
          </div>
        </Form.Item>
        <Form.Item>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button ghost onClick={() => onChange(false)}>
              取消
            </Button>
            &nbsp; &nbsp;
            <Button htmlType="submit">创建</Button>
          </div>
        </Form.Item>
      </Form>
    </ActionModal>
  );
};

export default CreatedProject;
