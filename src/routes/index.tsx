import React from 'react';
import { Redirect } from 'react-router-dom';

import BasicLayout from '@/layouts/BasicLayout';
import ProjectLayout from '@/layouts/ProjectLayout';
import UserLayout from '@/layouts/UserLayout';
import NoFond from '@/pages/NoFond';

import ProjectHome from '@/pages/Project/Home';
import ProjectMember from '@/pages/Project/Member';
import ProjectAppraise from '@/pages/Project/Appraise';
import ProjectAward from '@/pages/Project/Award';
import ProjectRecord from '@/pages/Project/Record/Record';
import ProjectAccess from '@/pages/Project/Access';
import ProjectAccessView from '@/pages/Project/Access/View';
import AppStore from '@/pages/Project/AppStore';
import IssueList from '@/pages/Issue/IssueList';
import IssueDetail from '@/pages/Issue/IssueDetail';

import Login from '@/pages/User/Login';
import Register from '@/pages/User/Register';
import Workbench from '@/pages/Workbench';
import ChatLayout from '@/layouts/ChatLayout';
import {
  APP_PROJECT_CHAT_PATH,
  APP_PROJECT_KB_BOOK_SHELF_PATH,
  APP_PROJECT_KB_CB_PATH,
  APP_PROJECT_KB_DOC_PATH,
  APP_PROJECT_KB_PATH,
  BUG_CREATE_SUFFIX,
  BUG_DETAIL_SUFFIX,
  REPO_ACTION_ACTION_DETAIL_SUFFIX,
  REPO_ACTION_EXEC_RESULT_SUFFIX,
  ROBOT_METRIC_SUFFIX,
  SPRIT_DETAIL_SUFFIX,
  TASK_CREATE_SUFFIX,
  TASK_DETAIL_SUFFIX,
} from '@/utils/constant';
import KnowledgeBaseLayout from '@/layouts/KnowledgeBaseLayout';
import ProjectDoc from '@/pages/KnowledgeBase/ProjectDoc';
import ContentBlock from '@/pages/KnowledgeBase/ContentBlock';
import IssueCreate from '@/pages/Issue/IssueCreate';
import RobotList from '@/pages/Robot/RobotList';
import MetricList from '@/pages/Robot/MetricList';
import RepoList from '@/pages/Earthly/RepoList';
import ExecResult from '@/pages/Earthly/ExecResult';
import ActionDetail from '@/pages/Earthly/ActionDetail';
import LocalApi from '@/pages/Project/LocalApi';
import BookShelf from '@/pages/KnowledgeBase/BookShelf';
import SpritList from '@/pages/Project/Sprit/SpritList';
import SpritDetail from '@/pages/Project/Sprit/SpritDetail';
import ExtraMenuPage from '@/pages/ExtraMenuPage';
import EntryList from '@/pages/TestCase/EntryList';
import ResultList from '@/pages/TestCase/ResultList';
import SubscribeList from '@/pages/Project/Record/SubscribeList';



export interface IRouteConfig {
  // ????????????
  path: string;
  // ????????????
  component?: any;
  // 302 ??????
  redirect?: string;
  exact?: boolean;
  // ????????????
  title: string;
  icon?: string;
  // ??????????????????, false ????????????, ???????????????????????????true ?????????, ?????????????????????????????? auth ??????
  auth?: boolean;
  routes?: IRouteConfig[];
  render?: any;
}

const getToolbarRoute = (prefix: string): IRouteConfig[] => {
  const routeList: IRouteConfig[] = [
    {
      path: prefix + '/home',
      title: '????????????',
      component: ProjectHome,
    },
    {
      path: prefix + '/member',
      title: '????????????',
      component: ProjectMember,
    },
    {
      path: prefix + '/appraise',
      title: '??????????????????',
      component: ProjectAppraise,
    },
    {
      path: prefix + '/award',
      title: '??????????????????',
      component: ProjectAward,
    },
    {
      path: prefix + '/task',
      title: '????????????',
      component: IssueList,
      exact: true,
    },
    {
      path: prefix + TASK_DETAIL_SUFFIX,
      title: '????????????',
      component: IssueDetail,
      exact: true,
    },
    {
      path: prefix + TASK_CREATE_SUFFIX,
      title: '????????????',
      component: IssueCreate,
      exact: true,
    },
    {
      path: prefix + '/bug',
      title: '????????????',
      component: IssueList,
      exact: true,
    },
    {
      path: prefix + BUG_DETAIL_SUFFIX,
      title: '????????????',
      component: IssueDetail,
      exact: true,
    },
    {
      path: prefix + BUG_CREATE_SUFFIX,
      title: '????????????',
      component: IssueCreate,
      exact: true,
    },
    {
      path: prefix + "/testcase",
      title: "????????????",
      component: EntryList,
      exact: true,
    },
    {
      path: prefix + "/testcase/result",
      title: "????????????????????????",
      component: ResultList,
      exact: true,
    },
    {
      path: prefix + "/sprit",
      title: "????????????",
      component: SpritList,
      exact: true,
    },
    {
      path: prefix + SPRIT_DETAIL_SUFFIX,
      title: "????????????",
      component: SpritDetail,
      exact: true,
    },
    {
      path: prefix + '/robot',
      title: '???????????????',
      component: RobotList,
      exact: true,
    },
    {
      path: prefix + ROBOT_METRIC_SUFFIX,
      title: '????????????',
      component: MetricList,
      exact: true,
    },
    {
      path: prefix + '/repo',
      title: '??????????????????',
      component: RepoList,
      exact: true,
    },
    {
      path: prefix + REPO_ACTION_ACTION_DETAIL_SUFFIX,
      title: '????????????',
      component: ActionDetail,
      exact: true,
    },
    {
      path: prefix + REPO_ACTION_EXEC_RESULT_SUFFIX,
      title: '??????????????????',
      component: ExecResult,
      exact: true,
    },
    {
      path: prefix + '/record',
      title: '????????????',
      component: ProjectRecord,
      exact: true,
    },
    {
      path: prefix + "/record/subscribe",
      title: "??????????????????",
      component: SubscribeList,
      exact: true,
    },
    {
      path: prefix + '/access',
      title: '???????????????',
      component: ProjectAccess,
      exact: true,
    },
    {
      path: prefix + '/access/view',
      title: '?????????????????????',
      component: ProjectAccessView,
      exact: true,
    },
    {
      path: prefix + "/appstore",
      title: "????????????",
      component: AppStore,
      exact: true,
    },
    {
      path: prefix + "/localapi",
      title: "????????????",
      component: LocalApi,
      exact: true,
    },
  ];
  return routeList;
};

const routesConfig: IRouteConfig[] = [
  {
    path: '/',
    title: '',
    exact: true,
    render: () => {
      return <Redirect to="/app/workbench" />;
    },
  },
  {
    path: '/app',
    component: BasicLayout,
    title: '????????????',
    // exact: true,
    routes: [
      {
        path: '/app/workbench',
        title: '?????????',
        component: Workbench,
      },
      {
        path: '/app/extra_menu',
        title: '??????????????????',
        component: ExtraMenuPage,
      },
      {
        path: '/app/project',
        title: '??????',
        component: ProjectLayout,
        routes: [
          {
            path: APP_PROJECT_CHAT_PATH,
            title: '??????',
            component: ChatLayout,
            routes: getToolbarRoute(APP_PROJECT_CHAT_PATH),
          },
          {
            path: APP_PROJECT_KB_PATH,
            title: '?????????',
            component: KnowledgeBaseLayout,
            routes: [
              {
                path: APP_PROJECT_KB_DOC_PATH,
                title: "????????????",
                component: ProjectDoc,
                routes: getToolbarRoute(APP_PROJECT_KB_DOC_PATH),
              },
              {
                path: APP_PROJECT_KB_BOOK_SHELF_PATH,
                title: "????????????",
                component: BookShelf,
                routes: getToolbarRoute(APP_PROJECT_KB_BOOK_SHELF_PATH),
              },
              {
                path: APP_PROJECT_KB_CB_PATH,
                title: "????????????",
                component: ContentBlock,
                routes: getToolbarRoute(APP_PROJECT_KB_CB_PATH),
              },
            ],
          },
        ],
      },
    ],
  },
  {
    path: '/user',
    component: UserLayout,
    title: '????????????',
    redirect: '/user/login',
    routes: [
      {
        path: '/user/login',
        component: Login,
        title: '??????',
      },
      {
        path: '/user/register',
        component: Register,
        title: '??????',
      },
    ],
  },

  {
    path: '*',
    title: '????????????',
    component: NoFond,
  },
];

export default routesConfig;
