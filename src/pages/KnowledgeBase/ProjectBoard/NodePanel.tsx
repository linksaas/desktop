//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import { Card, Popover, Space } from "antd";
import React from "react";
import refIcon from '@/assets/board/ref.png';
import imageIcon from '@/assets/board/image.png';
import mermaidIcon from '@/assets/board/mermaid.png';
import textIcon from '@/assets/board/text.png';
import taskIcon from '@/assets/allIcon/icon-task.png';
import bugIcon from '@/assets/allIcon/icon-bug.png';
import reqIcon from '@/assets/allIcon/icon-req.png';
import apiCollIcon from '@/assets/allIcon/icon-apicoll.png';
import { useDrag } from 'react-dnd';
import { BOARD_NODE_TYPE_IMAGE, type BOARD_NODE_TYPE, BOARD_NODE_TYPE_TEXT, BOARD_NODE_TYPE_REF_TASK, BOARD_NODE_TYPE_REF_BUG, BOARD_NODE_TYPE_REF_REQUIRE_MENT, BOARD_NODE_TYPE_REF_API_COLL, BOARD_NODE_TYPE_MERMAID } from "./nodes/types";

export const DND_ITEM_TYPE = "node";

export interface NewNodeInfo {
    nodeType: BOARD_NODE_TYPE;
}

interface NodeIconProps {
    nodeType: BOARD_NODE_TYPE;
    title: string;
    imgSrc: string;
}

const NodeIcon = (props: NodeIconProps) => {
    const [_, drag] = useDrag(() => ({
        type: DND_ITEM_TYPE,
        item: { nodeType: props.nodeType },
        canDrag: true,
    }));

    return (
        <div ref={drag} style={{ cursor: "move" }}>
            <img src={props.imgSrc} title={props.title} />
        </div>
    );
}

const NodePanel = () => {
    return (
        <Card>
            <Space direction="vertical">
                <Popover trigger="hover" placement="rightBottom" content={
                    <Space direction="vertical" style={{ padding: "6px 6px" }}>
                        <NodeIcon nodeType={BOARD_NODE_TYPE_REF_TASK} imgSrc={taskIcon} title="引用任务(拖动到画板)" />
                        <NodeIcon nodeType={BOARD_NODE_TYPE_REF_BUG} imgSrc={bugIcon} title="引用缺陷(拖动到画板)" />
                        <NodeIcon nodeType={BOARD_NODE_TYPE_REF_REQUIRE_MENT} imgSrc={reqIcon} title="引用需求(拖动到画板)" />
                        <NodeIcon nodeType={BOARD_NODE_TYPE_REF_API_COLL} imgSrc={apiCollIcon} title="引用接口(拖动到画板)" />
                    </Space>
                }>
                    <img src={refIcon} title="引用(拖动到画板)" />
                </Popover>
                <NodeIcon nodeType={BOARD_NODE_TYPE_IMAGE} imgSrc={imageIcon} title="图像(拖动到画板)" />
                <NodeIcon nodeType={BOARD_NODE_TYPE_TEXT} imgSrc={textIcon} title="文本(拖动到画板)" />
                <NodeIcon nodeType={BOARD_NODE_TYPE_MERMAID} imgSrc={mermaidIcon} title="Mermaid(拖动到画板)" />
            </Space>
        </Card>
    )
};

export default NodePanel;