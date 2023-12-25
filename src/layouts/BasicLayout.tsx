import BottomNav from '@/components/BottomNav';
import { useStores } from '@/hooks';
import type { IRouteConfig } from '@/routes';
import { WORKBENCH_PATH } from '@/utils/constant';
import { Layout } from 'antd';
import classNames from 'classnames';
import { observer } from 'mobx-react';
import React, { useEffect } from 'react';
import { renderRoutes } from 'react-router-config';
import { useHistory, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import LeftMenu from '../components/LeftMenu';
import Toolbar from '../components/Toolbar';
import style from './style.module.less';

const { Content } = Layout;

const BasicLayout: React.FC<{ route: IRouteConfig }> = ({ route }) => {
  const history = useHistory();
  const { pathname } = useLocation();

  const { sessionId } = useStores('userStore');
  const userStore = useStores('userStore');
  const { curProjectId } = useStores('projectStore');
  const noticeStore = useStores('noticeStore');
  const appStore = useStores('appStore');

  noticeStore.setHistory(history);

  const location = useLocation();
  const urlParams = new URLSearchParams(location.search);
  const type = urlParams.get('type');


  useEffect(() => {
    userStore.setIsResetPassword(type === 'resetPassword');
  });

  return (
    <Layout className={style.basicLayout}>
      {appStore.focusMode == false && <LeftMenu />}
      <Layout>
        <Header />
        <Content
          className={classNames(
            style.basicContent,
            pathname !== WORKBENCH_PATH && style.showbottomnav,
          )}
        >
          {renderRoutes(route.routes, { sessionId, projectId: curProjectId })}
        </Content>
        {curProjectId && <Toolbar />}
        {curProjectId != '' && <BottomNav />}
      </Layout>
    </Layout>
  );
};

export default observer(BasicLayout);
