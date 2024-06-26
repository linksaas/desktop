//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import React, { useEffect, useState } from "react";
import { Select } from 'antd';
import { EditOutlined } from "@ant-design/icons";

export interface EditSelectItem {
    value: string | number;
    label: string;
    color: string;
}

export interface EditSelectProps {
    editable: boolean;
    curValue: string | number;
    itemList: EditSelectItem[];
    onChange: (curValue: string | number | undefined) => Promise<boolean>;
    showEditIcon: boolean;
    allowClear: boolean;
    width?: string;
    showSearch?: boolean;
}

export const EditSelect: React.FC<EditSelectProps> = (props) => {
    const [inEdit, setInEdit] = useState(false);
    const [curValue, setCurValue] = useState(props.curValue);

    const getCurValue = () => {
        const index = props.itemList.findIndex(item => item.value === curValue);
        if (index == -1) {
            return (<span>-</span>);
        }
        return (
            <span style={{ color: props.itemList[index].color, cursor: props.editable ? "pointer" : "default" }}>
                {props.itemList[index].label}
            </span>
        );
    }

    useEffect(() => {
        if (!inEdit) {
            setCurValue(props.curValue);
        }
    }, [props.curValue]);

    return (
        <span onClick={e => {
            e.stopPropagation();
            e.preventDefault();
            if (props.editable) {
                setInEdit(true);
            }
        }}>
            {!inEdit && (<>{getCurValue()}{props.editable && props.showEditIcon &&
                <a style={{ marginLeft: "12px" }}><EditOutlined /></a>
            }</>)}
            {inEdit && (<Select
                allowClear={props.allowClear}
                open={true}
                showArrow={false}
                showSearch={props.showSearch ?? false}
                style={{ width: props.width ?? "80px" }}
                autoFocus
                defaultValue={curValue}
                onBlur={e => {
                    e.stopPropagation();
                    e.preventDefault();
                    setInEdit(false);
                }}
                filterOption={(value, option) => (option?.name ?? "").includes(value)}
                onChange={(value) => {
                    props.onChange(value).then(res => {
                        if (res) {
                            setCurValue(value);
                        }
                        setInEdit(false);

                    });
                }}>
                {props.itemList.map(item => (
                    <Select.Option key={item.value} value={item.value} name={item.label}>
                        <span style={{ color: item.color, display: "inline-block", width: props.width ?? "60px", textAlign: "center" }}>{item.label}</span>
                    </Select.Option>
                ))}
            </Select>)}
        </span>
    );
};