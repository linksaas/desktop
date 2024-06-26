//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import { Card } from "antd";
import React, { useEffect, useRef, useState } from "react";
import { Command } from '@tauri-apps/api/shell';

export interface BuildImageProps {
    devType: string;
    onOk: () => void;
}

const BuildImage = (props: BuildImageProps) => {
    const endRef = useRef<HTMLDivElement>(null);
    const [logs, setLogs] = useState("");

    const runPullImage = async () => {
        let image = "";
        if (props.devType == "jupyter") {
            image = "ccr.ccs.tencentyun.com/linksaas/jupyterhub:latest";
        } else if (props.devType == "rstudio") {
            image = "ccr.ccs.tencentyun.com/linksaas/rstudio:latest";
        } else if (props.devType == "vscode") {
            image = "ccr.ccs.tencentyun.com/linksaas/code-server:latest";
        }
        console.log("devc", "image", "pull", image);
        const cmd = Command.sidecar("bin/devc", ["image", "pull", image]);
        cmd.on("close", () => props.onOk());
        cmd.stdout.on("data", line => {
            setLogs(oldValue => oldValue + line);
            endRef.current?.scrollIntoView();
        });
        await cmd.spawn();
    };

    useEffect(() => {
        runPullImage();
    }, [props.devType]);

    return (
        <Card title="构建研发镜像中(需要等待数分钟)..." bodyStyle={{ height: "calc(100vh - 40px)", overflowY: "scroll", backgroundColor: "black", color: "white" }}>
            <pre style={{ whiteSpace: "pre-wrap", wordWrap: "break-word" }}>
                {logs}
                <div ref={endRef} />
            </pre>
        </Card>
    )
};

export default BuildImage;