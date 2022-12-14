import { Input, message, Modal } from 'antd';
import type { FC } from 'react';
import { useEffect } from 'react';
import { useState } from 'react';
import React from 'react';
import { writeText } from '@tauri-apps/api/clipboard';
import { gen_invite } from '@/api/project_member';
import { request } from '@/utils/request';
import { observer } from 'mobx-react';
import { useStores } from '@/hooks';


const { TextArea } = Input;

type AddMemberProps = {
  visible: boolean;
  onChange: (boo: boolean) => void;
};

const AddMember: FC<AddMemberProps> = (props) => {
  const { visible, onChange } = props;
  const [linkText, setLinkText] = useState('');
  const userStore = useStores("userStore");
  const projectStore = useStores("projectStore");

  const getgen_invite = async () => {
    const res = await request(gen_invite(userStore.sessionId, projectStore.curProjectId, 0));
    if (res) {
      setLinkText(`${userStore.userInfo.displayName} 邀请您加入 ${projectStore.curProject?.basic_info.project_name ?? ""} 项目，您的邀请码 ${res.invite_code} (有效期24小时),请在软件内输入邀请码加入项目。如您尚未安装【凌鲨】，可直接点击链接下载 https://www.linksaas.pro`);
    }
  };

  useEffect(() => {
    getgen_invite();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const submitText = () => {
    writeText(linkText).then(() => {
      onChange(false);
      message.success('复制成功');
    });
  };

  return (
    <Modal
      open={visible}
      title="添加项目成员"
      width={600}
      okText="复制并关闭"
      onCancel={() => onChange(false)}
      onOk={()=>submitText()}
    >
      <div
        style={{
          textAlign: 'left',
          fontSize: '14px',
          lineHeight: '20px',
          color: ' #2C2D2E',
        }}
      >
        请发送邀请链接给需要邀请的成员，邀请链接有效期24小时
      </div>

      <div style={{ margin: '10px 0' }}>
        <TextArea placeholder="请输入" value={linkText} autoSize={{ minRows: 2, maxRows: 5 }} readOnly/>
      </div>
    </Modal>
  );
};

export default observer(AddMember);
