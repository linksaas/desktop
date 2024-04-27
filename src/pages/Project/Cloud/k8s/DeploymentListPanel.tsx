//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import { useStores } from "@/hooks";
import { List } from "antd";
import React, { useEffect } from "react";
import DeploymentCard from "./components/DeploymentCard";
import { observer } from 'mobx-react';


const DeploymentListPanel = () => {
    const cloudStore = useStores('cloudStore');

    useEffect(() => {
        cloudStore.loadDeploymentList().then(() => cloudStore.loadDeploymentPermList());
    }, [cloudStore.curNameSpace]);

    return (
        <List dataSource={cloudStore.deploymentList} renderItem={item => (
            <List.Item key={item.metadata?.name ?? ""} style={{ border: "none" }}>
                <DeploymentCard deployment={item} />
            </List.Item>
        )} />
    );
};


export default observer(DeploymentListPanel);