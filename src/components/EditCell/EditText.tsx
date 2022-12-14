import React, { useState } from "react";
import { Input } from 'antd'
import { CheckOutlined, CloseOutlined, EditOutlined } from "@ant-design/icons";


export interface EditTextProps {
    editable: boolean;
    content: string;
    onChange: (content: string) => Promise<boolean>;
    showEditIcon: boolean;
}

export const EditText: React.FC<EditTextProps> = (props) => {
    const [inEdit, setInEdit] = useState(false);
    const [content, setContent] = useState(props.content);


    return (
        <span onClick={e => {
            e.stopPropagation();
            e.preventDefault();
            if (props.editable) {
                setInEdit(true);
            }
        }}>
            {!inEdit && (
                <span title={content} style={{ cursor: props.editable ? "pointer" : "default" }}>{content == "" ? "-" : content}
                    {props.editable && props.showEditIcon &&
                        <a><EditOutlined /></a>
                    }
                </span>)}
            {inEdit && (
                <Input value={content}
                    autoFocus={true}
                    style={{ width: "calc(100% - 50px)" }} suffix={<>
                        <a onClick={e => {
                            e.stopPropagation();
                            e.preventDefault();
                            setContent(props.content);
                            setInEdit(false);
                        }}><CloseOutlined /></a>
                        <a onClick={e => {
                            e.stopPropagation();
                            e.preventDefault();
                            props.onChange(content).then(res => {
                                if (!res) {
                                    setContent(props.content);
                                }
                                setInEdit(false);
                            })
                        }}><CheckOutlined /></a>
                    </>}
                    onBlurCapture={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        if (content == props.content) {
                            setInEdit(false);
                        }
                    }}
                    onChange={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        setContent(e.target.value);
                    }} onKeyDown={e => {
                        if (e.key == "Escape") {
                            e.stopPropagation();
                            e.preventDefault();
                            setContent(props.content);
                            setInEdit(false);
                        } else if (e.key == "Enter") {
                            e.stopPropagation();
                            e.preventDefault();
                            props.onChange(content).then(res => {
                                if (!res) {
                                    setContent(props.content);
                                }
                                setInEdit(false);
                            })
                        }
                    }} />
            )}
        </span>
    )
};