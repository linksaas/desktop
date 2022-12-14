import { Button, message, Popover, Modal } from 'antd';
import { useState } from 'react';
import React from 'react';
import s from './index.module.less';
import iconEdit from '@/assets/allIcon/icon-edit.png';
import Input from 'antd/lib/input/Input';
import { CheckOutlined } from '@ant-design/icons';
import PasswordModal from '../PasswordModal';
import { useStores } from '@/hooks';
import { observer } from 'mobx-react';
import { request } from '@/utils/request';
import { update } from '@/api/user';
import { ReactComponent as Quitsvg } from '@/assets/svg/quit.svg';

import { useHistory } from 'react-router-dom';
import Profile from '../Profile';
import * as fsApi from '@/api/fs';
import UserPhoto from '@/components/Portrait/UserPhoto';


const Portrait = ({ ...props }) => {
  const [isSetName, setIsSetName] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [showExit, setShowExit] = useState(false);
  const userStore = useStores('userStore');
  const [name, setSetName] = useState(userStore.userInfo.displayName);
  const [pictrueListVisible, setPictrueListVisible] = useState(false);
  const { push } = useHistory();

  const changeName = async () => {
    try {
      await request(
        update(userStore.sessionId, {
          display_name: name,
          logo_uri: userStore.userInfo.logoUri,
        }),
      );
      userStore.updateDisplayName(name);
      message.success('修改昵称成功');
      setIsSetName(false);
    } catch (error) { }
  };

  const uploadFile = async (data: string | null) => {
    if (data === null) {
      return;
    }
    //上传文件
    const uploadRes = await request(fsApi.write_file_base64(userStore.sessionId, userStore.userInfo.userFsId, "portrait.png", data, ""));
    console.log(uploadRes);
    if (!uploadRes) {
      return;
    }
    //设置文件owner
    const ownerRes = await request(fsApi.set_file_owner({
      session_id: userStore.sessionId,
      fs_id: userStore.userInfo.userFsId,
      file_id: uploadRes.file_id,
      owner_type: fsApi.FILE_OWNER_TYPE_USER_PHOTO,
      owner_id: userStore.userInfo.userId,
    }));
    if (!ownerRes) {
      return;
    }
    //设置头像url
    const logoUri = `fs://localhost/${userStore.userInfo.userFsId}/${uploadRes.file_id}/portrait.png`;
    const updateRes = await request(update(userStore.sessionId, {
      display_name: userStore.userInfo.displayName,
      logo_uri: logoUri,
    }));
    if (updateRes) {
      setPictrueListVisible(false);
    }
    userStore.updateLogoUri(logoUri);
  };

  const renderContent = () => {
    return (
      <div className={s.portrait_wrap}>
        <div className={s.portrait_img} onClick={() => {
          setPictrueListVisible(true);
          userStore.setAccountsModal(false);
        }}>
          <UserPhoto logoUri={userStore.userInfo.logoUri ?? ""} />
          <div>更换</div>
          {/* </Popover> */}
        </div>
        <div className={s.content_wrap}>
          <div className={s.content_itme}>
            <span>昵 &nbsp;&nbsp; 称</span>
            {!isSetName ? (
              <div>
                {name}
                <img src={iconEdit} alt="" onClick={() => setIsSetName(true)} />
              </div>
            ) : (
              <div className={s.name_input_wrap}>
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setSetName(e.target.value);
                  }}
                />
                <Button type="primary" disabled={!name.length} onClick={changeName}>
                  <CheckOutlined />
                </Button>
              </div>
            )}
          </div>
          <div className={s.content_itme}>
            <span>用户名</span>
            <div>{userStore.userInfo.userName}</div>
          </div>
        </div>
        <div
          className={s.changePassword}
          onClick={() => {
            setPasswordVisible(true);
            userStore.setAccountsModal(false);
          }}
        >
          修改密码
        </div>
        <div
          className={s.exit}
          onClick={() => {
            setShowExit(true);
            userStore.setAccountsModal(false);
          }}
        >
          <Quitsvg />
          退出登录
        </div>
        {passwordVisible && (
          <PasswordModal {...props} visible={passwordVisible} onCancel={setPasswordVisible} />
        )}
        {showExit && (
          <Modal
            visible={showExit}
            title="退出"
            onCancel={() => setShowExit(false)}
            onOk={() => {
              userStore.logout();
              push('/user/login');
            }}
          >
            <p style={{ textAlign: 'center' }}>是否确认退出?</p>
          </Modal>
        )}
        <Profile
          visible={pictrueListVisible}
          defaultSrc={userStore.userInfo.logoUri ?? ""}
          onCancel={() => setPictrueListVisible(false)}
          onOK={(data: string | null) => uploadFile(data)}
        />
      </div>
    );
  };
  return (
    <Popover
      content={renderContent()}
      placement="bottomLeft"
      trigger="click"
      visible={userStore.accountsModal}
      overlayInnerStyle={{
        left: '2px',
      }}
      style={{
        left: '2px',
      }}
      onVisibleChange={(boo) => userStore.setAccountsModal(boo)}
    >
      {props.children}
    </Popover>
  );
};

export default observer(Portrait);
