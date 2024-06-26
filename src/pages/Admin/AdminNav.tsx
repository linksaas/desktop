//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import { LogoutOutlined } from "@ant-design/icons";
import { Collapse, Layout, Menu } from "antd";
import React, { useEffect, useState } from "react";
import s from './AdminNav.module.less';
import type { AdminPermInfo } from '@/api/admin_auth';
import { get_admin_perm, is_global_server } from '@/api/admin_auth';
import { useHistory, useLocation } from "react-router-dom";
import {
    ADMIN_PATH_APPSTORE_APP_SUFFIX,
    ADMIN_PATH_APPSTORE_CATE_SUFFIX,
    ADMIN_PATH_CLIENT_MENU_SUFFIX,
    ADMIN_PATH_DEV_CONTAINER_PKG_SUFFIX,
    ADMIN_PATH_DOCKER_TEMPLATE_APP_SUFFIX,
    ADMIN_PATH_DOCKER_TEMPLATE_CATE_SUFFIX,
    ADMIN_PATH_GITVP_REPO_SUFFIX,
    ADMIN_PATH_GITVP_SOURCE_SUFFIX,
    ADMIN_PATH_IDEA_STORE_CATE_SUFFIX,
    ADMIN_PATH_IDEA_STORE_SUFFIX,
    ADMIN_PATH_IDEA_SUFFIX,
    ADMIN_PATH_ORG_DETAIL_SUFFIX,
    ADMIN_PATH_ORG_LIST_SUFFIX,
    ADMIN_PATH_PROJECT_DETAIL_SUFFIX,
    ADMIN_PATH_PROJECT_LIST_SUFFIX, ADMIN_PATH_SECURITY_ADMIN_USER_SUFFIX, ADMIN_PATH_SECURITY_KEYWORD_SUFFIX,
     ADMIN_PATH_SOFTWARE_CATE_SUFFIX, ADMIN_PATH_SOFTWARE_SUFFIX, ADMIN_PATH_USER_CREATE_SUFFIX, ADMIN_PATH_USER_DETAIL_SUFFIX,
    ADMIN_PATH_USER_LIST_SUFFIX,
    ADMIN_PATH_WIDGET_SUFFIX
} from "@/utils/constant";
import { useStores } from "@/hooks";
import { runInAction } from "mobx";

const AdminNav = () => {
    const location = useLocation();
    const history = useHistory();

    const userStore = useStores('userStore');

    const [permInfo, setPermInfo] = useState<AdminPermInfo | null>(null);
    const [globalServer, setGlobalServer] = useState(false);
    const [userSelectedKeys, setUserSelectedKeys] = useState<string[]>([]);
    const [projectSelectedKeys, setProjectSelectedKeys] = useState<string[]>([]);
    const [orgSelectedKeys, setOrgSelectedKeys] = useState<string[]>([]);
    const [clientCfgSelectedKeys, setClientCfgSelectedKeys] = useState<string[]>([]);
    const [securitySelectedKeys, setSecuritySelectedKeys] = useState<string[]>([]);
    const [gitvpSelectedKeys, setGitvpSelectedKeys] = useState<string[]>([]);
    const [appstoreSelectedKeys, setAppstoreSelectedKeys] = useState<string[]>([]);
    const [swStoreSelectedKeys, setSwStoreSelectedKeys] = useState<string[]>([]);
    const [widgetStoreSelectedKeys, setWidgetStoreSelectedKeys] = useState<string[]>([]);
    const [ideastoreSelectedKeys, setIdeastoreSelectedKeys] = useState<string[]>([]);
    const [dockerTemplateSelectedKeys, setDockerTemplateSelectedKeys] = useState<string[]>([]);
    const [devContainerSelectedKeys, setDevContainerSelectedKeys] = useState<string[]>([]);

    useEffect(() => {
        setUserSelectedKeys([]);
        if (location.pathname == ADMIN_PATH_USER_LIST_SUFFIX || location.pathname == ADMIN_PATH_USER_DETAIL_SUFFIX) {
            setUserSelectedKeys(["user_list"]);
        } else if (location.pathname == ADMIN_PATH_USER_CREATE_SUFFIX) {
            setUserSelectedKeys(["user_create"]);
        }
    }, [location.pathname]);

    useEffect(() => {
        setProjectSelectedKeys([]);
        if (location.pathname == ADMIN_PATH_PROJECT_LIST_SUFFIX || location.pathname == ADMIN_PATH_PROJECT_DETAIL_SUFFIX) {
            setProjectSelectedKeys(["prj_list"]);
        }
    }, [location.pathname]);


    useEffect(() => {
        setOrgSelectedKeys([]);
        if (location.pathname == ADMIN_PATH_ORG_LIST_SUFFIX || location.pathname == ADMIN_PATH_ORG_DETAIL_SUFFIX) {
            setOrgSelectedKeys(["org_list"]);
        }
    }, [location.pathname]);


    useEffect(() => {
        setClientCfgSelectedKeys([]);
        if (location.pathname == ADMIN_PATH_CLIENT_MENU_SUFFIX) {
            setClientCfgSelectedKeys(["menu_admin"]);
        }
    }, [location.pathname]);

    useEffect(() => {
        setSecuritySelectedKeys([]);
        if (location.pathname == ADMIN_PATH_SECURITY_KEYWORD_SUFFIX) {
            setSecuritySelectedKeys(["security_keyword"]);
        } else if (location.pathname == ADMIN_PATH_SECURITY_ADMIN_USER_SUFFIX) {
            setSecuritySelectedKeys(["security_admin_user"]);
        }
    }, [location.pathname]);

    useEffect(() => {
        setGitvpSelectedKeys([]);
        if (location.pathname == ADMIN_PATH_GITVP_SOURCE_SUFFIX) {
            setGitvpSelectedKeys(["gitvp_source"]);
        } else if (location.pathname == ADMIN_PATH_GITVP_REPO_SUFFIX) {
            setGitvpSelectedKeys(["gitvp_repo"]);
        }
    }, [location.pathname]);

    useEffect(() => {
        setAppstoreSelectedKeys([]);
        if (location.pathname == ADMIN_PATH_APPSTORE_CATE_SUFFIX) {
            setAppstoreSelectedKeys(["app_cate"]);
        } else if (location.pathname == ADMIN_PATH_APPSTORE_APP_SUFFIX) {
            setAppstoreSelectedKeys(["app_app"]);
        }
    }, [location.pathname]);

    useEffect(() => {
        setWidgetStoreSelectedKeys([]);
        if (location.pathname == ADMIN_PATH_WIDGET_SUFFIX) {
            setWidgetStoreSelectedKeys(["git_widget"]);
        }
    }, [location.pathname]);

    useEffect(() => {
        setIdeastoreSelectedKeys([]);
        if (location.pathname == ADMIN_PATH_IDEA_STORE_CATE_SUFFIX) {
            setIdeastoreSelectedKeys(["ideastore_cate"]);
        } else if (location.pathname == ADMIN_PATH_IDEA_STORE_SUFFIX) {
            setIdeastoreSelectedKeys(["ideastore_store"]);
        } else if (location.pathname == ADMIN_PATH_IDEA_SUFFIX) {
            setIdeastoreSelectedKeys(["ideastore_idea"]);
        }
    }, [location.pathname]);

    useEffect(() => {
        setDockerTemplateSelectedKeys([]);
        if (location.pathname == ADMIN_PATH_DOCKER_TEMPLATE_CATE_SUFFIX) {
            setDockerTemplateSelectedKeys(["docker_template_cate"]);
        } else if (location.pathname == ADMIN_PATH_DOCKER_TEMPLATE_APP_SUFFIX) {
            setDockerTemplateSelectedKeys(["docker_template_app"]);
        }
    }, [location.pathname]);

    useEffect(() => {
        setDevContainerSelectedKeys([]);
        if (location.pathname == ADMIN_PATH_DEV_CONTAINER_PKG_SUFFIX) {
            setDevContainerSelectedKeys(["dev_container_pkg"]);
        }
    }, [location.pathname]);

    useEffect(() => {
        setSwStoreSelectedKeys([]);
        if (location.pathname == ADMIN_PATH_SOFTWARE_CATE_SUFFIX) {
            setSwStoreSelectedKeys(["sw_cate"]);
        } else if (location.pathname == ADMIN_PATH_SOFTWARE_SUFFIX) {
            setSwStoreSelectedKeys(["software"]);
        }
    }, [location.pathname]);

    useEffect(() => {
        get_admin_perm().then(res => {
            console.log(res);
            setPermInfo(res);
        });
        is_global_server().then(res => setGlobalServer(res));
    }, []);

    return (
        <Layout.Sider>
            <div className={s.head_wrap}>
                <h1>管理后台</h1>
                <div className={s.logout_wrap}>
                    <a onClick={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        runInAction(() => {
                            userStore.adminSessionId = "";
                        });
                        history.push("/");
                    }}><LogoutOutlined />&nbsp;&nbsp;退出</a>
                </div>
            </div>
            <Collapse defaultActiveKey={["user", "org", "project", "clientCfg", "appstore", "swstore", "dockerTemplate",
                "devContainer", "pubSearch", "ideastore", "widgetStore", "skillcenter", "security", "gitvp"]}
                style={{ height: "calc(100vh - 132px)", overflowY: "scroll", paddingBottom: "10px" }}>
                <Collapse.Panel header="用户管理" key="user">
                    <Menu selectedKeys={userSelectedKeys} items={[
                        {
                            label: "查看用户",
                            key: "user_list",
                            disabled: !(permInfo?.user_perm.read ?? false),
                        },
                        {
                            label: "新增用户",
                            key: "user_create",
                            disabled: !(permInfo?.user_perm.create ?? false),
                        },
                    ]}
                        style={{ borderRightWidth: "0px" }}
                        onSelect={e => {
                            if (e.selectedKeys.length == 1) {
                                if (e.selectedKeys[0] == "user_list") {
                                    history.push(ADMIN_PATH_USER_LIST_SUFFIX);
                                } else if (e.selectedKeys[0] == "user_create") {
                                    history.push(ADMIN_PATH_USER_CREATE_SUFFIX);
                                }
                            }
                        }} />
                </Collapse.Panel>
                <Collapse.Panel header="项目管理" key="project">
                    <Menu selectedKeys={projectSelectedKeys} items={[
                        {
                            label: "查看项目",
                            key: "prj_list",
                            disabled: !(permInfo?.project_perm.read ?? false),
                        }
                    ]}
                        style={{ borderRightWidth: "0px" }}
                        onSelect={e => {
                            if (e.selectedKeys.length == 1) {
                                if (e.selectedKeys[0] == "prj_list") {
                                    history.push(ADMIN_PATH_PROJECT_LIST_SUFFIX);
                                }
                            }
                        }}
                    />
                </Collapse.Panel>
                <Collapse.Panel header="团队管理" key="org">
                    <Menu selectedKeys={orgSelectedKeys} items={[
                        {
                            label: "查看团队",
                            key: "org_list",
                            disabled: !(permInfo?.org_perm.read ?? false),
                        }
                    ]}
                        style={{ borderRightWidth: "0px" }}
                        onSelect={e => {
                            if (e.selectedKeys.length == 1) {
                                if (e.selectedKeys[0] == "org_list") {
                                    history.push(ADMIN_PATH_ORG_LIST_SUFFIX);
                                }
                            }
                        }}
                    />
                </Collapse.Panel>
                {globalServer == true && (
                    <Collapse.Panel header="代码仓库精选" key="gitvp">
                        <Menu selectedKeys={gitvpSelectedKeys} items={[
                            {
                                label: "数据来源",
                                key: "gitvp_source",
                                disabled: !(permInfo?.git_vp_perm?.read ?? false),
                            },
                            {
                                label: "代码仓库",
                                key: "gitvp_repo",
                                disabled: !(permInfo?.git_vp_perm?.read ?? false),
                            },
                        ]}
                            style={{ borderRightWidth: "0px" }}
                            onSelect={e => {
                                if (e.selectedKeys.length == 1) {
                                    if (e.selectedKeys[0] == "gitvp_source") {
                                        history.push(ADMIN_PATH_GITVP_SOURCE_SUFFIX);
                                    } else if (e.selectedKeys[0] == "gitvp_repo") {
                                        history.push(ADMIN_PATH_GITVP_REPO_SUFFIX);
                                    }
                                }
                            }}
                        />
                    </Collapse.Panel>
                )}
                {globalServer == true && (
                    <Collapse.Panel header="应用管理" key="appstore">
                        <Menu selectedKeys={appstoreSelectedKeys} items={[
                            {
                                label: "管理类别",
                                key: "app_cate",
                                disabled: !(permInfo?.app_store_perm.read ?? false),
                            },
                            {
                                label: "管理应用",
                                key: "app_app",
                                disabled: !(permInfo?.app_store_perm.read ?? false),
                            },
                        ]}
                            style={{ borderRightWidth: "0px" }}
                            onSelect={e => {
                                if (e.selectedKeys.length == 1) {
                                    if (e.selectedKeys[0] == "app_cate") {
                                        history.push(ADMIN_PATH_APPSTORE_CATE_SUFFIX);
                                    } else if (e.selectedKeys[0] == "app_app") {
                                        history.push(ADMIN_PATH_APPSTORE_APP_SUFFIX);
                                    }
                                }
                            }}
                        />
                    </Collapse.Panel>
                )}
                {globalServer == true && (
                    <Collapse.Panel header="软件管理" key="swstore">
                        <Menu selectedKeys={swStoreSelectedKeys} items={[
                            {
                                label: "管理类别",
                                key: "sw_cate",
                                disabled: !(permInfo?.sw_store_perm.read ?? false),
                            },
                            {
                                label: "管理软件",
                                key: "software",
                                disabled: !(permInfo?.sw_store_perm.read ?? false),
                            },
                        ]}
                            style={{ borderRightWidth: "0px" }}
                            onSelect={e => {
                                if (e.selectedKeys.length == 1) {
                                    if (e.selectedKeys[0] == "sw_cate") {
                                        history.push(ADMIN_PATH_SOFTWARE_CATE_SUFFIX);
                                    } else if (e.selectedKeys[0] == "software") {
                                        history.push(ADMIN_PATH_SOFTWARE_SUFFIX);
                                    }
                                }
                            }}
                        />
                    </Collapse.Panel>
                )}
                {globalServer == true && (
                    <Collapse.Panel header="Git插件管理" key="widgetStore">
                        <Menu selectedKeys={widgetStoreSelectedKeys} items={[
                            {
                                label: "管理Git插件",
                                key: "git_widget",
                                disabled: !(permInfo?.widget_store_perm.read ?? false),
                            },
                        ]}
                            style={{ borderRightWidth: "0px" }}
                            onSelect={e => {
                                if (e.selectedKeys.length == 1) {
                                    if (e.selectedKeys[0] == "git_widget") {
                                        history.push(ADMIN_PATH_WIDGET_SUFFIX);
                                    }
                                }
                            }}
                        />
                    </Collapse.Panel>
                )}
                {globalServer == true && (
                    <Collapse.Panel header="知识点管理" key="ideastore">
                        <Menu selectedKeys={ideastoreSelectedKeys} items={[
                            {
                                label: "管理知识库类别",
                                key: "ideastore_cate",
                                disabled: !(permInfo?.idea_store_perm.read ?? false),
                            },
                            {
                                label: "管理知识库",
                                key: "ideastore_store",
                                disabled: !(permInfo?.idea_store_perm.read ?? false),
                            },
                            {
                                label: "管理知识点",
                                key: "ideastore_idea",
                                disabled: !(permInfo?.idea_store_perm.read ?? false),
                            },
                        ]}
                            style={{ borderRightWidth: "0px" }}
                            onSelect={e => {
                                if (e.selectedKeys.length == 1) {
                                    if (e.selectedKeys[0] == "ideastore_cate") {
                                        history.push(ADMIN_PATH_IDEA_STORE_CATE_SUFFIX);
                                    } else if (e.selectedKeys[0] == "ideastore_store") {
                                        history.push(ADMIN_PATH_IDEA_STORE_SUFFIX);
                                    } else if (e.selectedKeys[0] == "ideastore_idea") {
                                        history.push(ADMIN_PATH_IDEA_SUFFIX);
                                    }
                                }
                            }}
                        />
                    </Collapse.Panel>
                )}
                {globalServer == true && (
                    <Collapse.Panel header="Docker模板管理" key="dockerTemplate">
                        <Menu selectedKeys={dockerTemplateSelectedKeys} items={[
                            {
                                label: "管理类别",
                                key: "docker_template_cate",
                                disabled: !(permInfo?.docker_template_perm.read ?? false),
                            },
                            {
                                label: "管理模板",
                                key: "docker_template_app",
                                disabled: !(permInfo?.docker_template_perm.read ?? false),
                            }
                        ]}
                            style={{ borderRightWidth: "0px" }}
                            onSelect={e => {
                                if (e.selectedKeys.length == 1) {
                                    if (e.selectedKeys[0] == "docker_template_cate") {
                                        history.push(ADMIN_PATH_DOCKER_TEMPLATE_CATE_SUFFIX);
                                    } else if (e.selectedKeys[0] == "docker_template_app") {
                                        history.push(ADMIN_PATH_DOCKER_TEMPLATE_APP_SUFFIX);
                                    }
                                }
                            }} />
                    </Collapse.Panel>
                )}
                {globalServer == true && (
                    <Collapse.Panel header="研发环境管理" key="devContainer">
                        <Menu selectedKeys={devContainerSelectedKeys} items={[
                            {
                                label: "软件包管理",
                                key: "dev_container_pkg",
                                disabled: !(permInfo?.dev_container_perm.read ?? false),
                            },
                        ]}
                            style={{ borderRightWidth: "0px" }}
                            onSelect={e => {
                                if (e.selectedKeys.length == 1) {
                                    if (e.selectedKeys[0] == "dev_container_pkg") {
                                        history.push(ADMIN_PATH_DEV_CONTAINER_PKG_SUFFIX);
                                    }
                                }
                            }} />
                    </Collapse.Panel>
                )}
                <Collapse.Panel header="界面管理" key="clientCfg">
                    <Menu selectedKeys={clientCfgSelectedKeys} items={[
                        {
                            label: "扩展菜单",
                            key: "menu_admin",
                            disabled: !(permInfo?.menu_perm.read ?? false),
                        },
                    ]}
                        style={{ borderRightWidth: "0px" }}
                        onSelect={e => {
                            if (e.selectedKeys.length == 1) {
                                if (e.selectedKeys[0] == "menu_admin") {
                                    history.push(ADMIN_PATH_CLIENT_MENU_SUFFIX);
                                }
                            }
                        }} />
                </Collapse.Panel>
                <Collapse.Panel header="安全管理" key="security">
                    <Menu selectedKeys={securitySelectedKeys} items={[
                        {
                            label: "关键词管理",
                            key: "security_keyword",
                            disabled: !(permInfo?.keyword_perm.read ?? false),
                        },
                        {
                            label: "管理员列表",
                            key: "security_admin_user",
                            disabled: !(permInfo?.super_admin_user ?? false),
                        },
                    ]}
                        style={{ borderRightWidth: "0px" }}
                        onSelect={e => {
                            if (e.selectedKeys.length == 1) {
                                if (e.selectedKeys[0] == "security_keyword") {
                                    history.push(ADMIN_PATH_SECURITY_KEYWORD_SUFFIX);
                                } else if (e.selectedKeys[0] == "security_admin_user") {
                                    history.push(ADMIN_PATH_SECURITY_ADMIN_USER_SUFFIX);
                                }
                            }
                        }} />
                </Collapse.Panel>

            </Collapse>
        </Layout.Sider>
    );
};

export default AdminNav;