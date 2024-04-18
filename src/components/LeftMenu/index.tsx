import workbench_icon from '@/assets/allIcon/workbench_icon.png';
import { useStores } from '@/hooks';
import { Layout } from 'antd';
import { observer } from 'mobx-react';
import React, { useEffect, useState } from 'react';
import cls from './index.module.less';
const { Sider } = Layout;
import ProjectList from './ProjectList';
import { GlobalOutlined, RocketOutlined } from '@ant-design/icons';
import { useHistory, useLocation } from 'react-router-dom';
import { PUB_RES_PATH, SKILL_CENTER_PATH, WORKBENCH_PATH } from '@/utils/constant';
import OrgList from './OrgList';
import { getVersion } from '@tauri-apps/api/app';


const LeftMenu: React.FC = () => {
  const location = useLocation();
  const history = useHistory();

  const userStore = useStores('userStore');
  const appStore = useStores('appStore');
  const projectStore = useStores('projectStore');
  const orgStore = useStores('orgStore');

  const [version, setVersion] = useState("");

  useEffect(() => {
    getVersion().then(res => setVersion(res));
  }, []);

  return (
    <Sider className={cls.sider}>
      <div style={{ height: "10px" }} />
      <div>
        <div className={`${cls.workbench_menu} ${location.pathname.startsWith(WORKBENCH_PATH) ? cls.active_menu : ""}`}
          style={{ marginLeft: "10px", marginRight: "10px", paddingBottom: "4px", paddingLeft: "10px" }}
          onClick={e => {
            e.stopPropagation();
            e.preventDefault();
            if (appStore.inEdit) {
              appStore.showCheckLeave(() => {
                history.push(WORKBENCH_PATH);
                projectStore.setCurProjectId("");
                orgStore.setCurOrgId("");
              });
            } else {
              history.push(WORKBENCH_PATH);
              projectStore.setCurProjectId("");
              orgStore.setCurOrgId("");
            }
          }}>
          <img src={workbench_icon} alt="" className={cls.workbench_icon} />
          工作台
        </div>
        {userStore.sessionId != "" && userStore.userInfo.featureInfo.enable_project && (
          <>
            <div style={{ borderBottom: "2px dotted #333", margin: "5px 24px", paddingTop: "5px" }} />
            <ProjectList />
          </>
        )}

        {userStore.sessionId != "" && userStore.userInfo.featureInfo.enable_org && (
          <>
            <div style={{ borderTop: "2px dotted #333", margin: "5px 24px", paddingTop: "5px" }} />
            <OrgList />
          </>
        )}

        <div style={{ borderTop: "2px dotted #333", margin: "5px 24px" }} />

        <div className={`${cls.workbench_menu} ${location.pathname.startsWith(PUB_RES_PATH) ? cls.active_menu : ""}`}
          style={{ marginLeft: "10px", marginRight: "10px", paddingBottom: "4px", paddingLeft: "10px" }}
          onClick={e => {
            e.stopPropagation();
            e.preventDefault();
            if (appStore.inEdit) {
              appStore.showCheckLeave(() => {
                history.push(PUB_RES_PATH);
                projectStore.setCurProjectId("");
                orgStore.setCurOrgId("");
              });
              return;
            }
            history.push(PUB_RES_PATH);
            projectStore.setCurProjectId("");
            orgStore.setCurOrgId("");
          }}>
          <GlobalOutlined />&nbsp;公共资源
        </div>
        {userStore.sessionId != "" && userStore.userInfo.featureInfo.enable_skill_center && (
          <div className={`${cls.workbench_menu} ${location.pathname.startsWith(SKILL_CENTER_PATH) ? cls.active_menu : ""}`}
            style={{ marginLeft: "10px", marginRight: "10px", paddingBottom: "4px", paddingLeft: "10px" }}
            onClick={e => {
              e.stopPropagation();
              e.preventDefault();
              if (appStore.inEdit) {
                appStore.showCheckLeave(() => {
                  history.push(SKILL_CENTER_PATH);
                  projectStore.setCurProjectId("");
                  orgStore.setCurOrgId("");
                });
                return;
              }
              history.push(SKILL_CENTER_PATH);
              projectStore.setCurProjectId("");
              orgStore.setCurOrgId("");
            }}>
            <RocketOutlined />&nbsp;技能中心
          </div>
        )}
      </div>
      <div style={{ position: "absolute", bottom: "2px", right: "10px" }}>
        软件版本:{version}
      </div>
    </Sider>
  );
};
export default observer(LeftMenu);
