//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import React from 'react';
import type { NodeViewComponentProps } from '@remirror/react';
import * as widgets from '../widgets';
import { useCommands } from '@remirror/react';

export type WidgetProps = NodeViewComponentProps & {
  widgetType: widgets.WIDGET_TYPE;
  widgetData: unknown;
};

export const Widget: React.FC<WidgetProps> = (props) => {
  const { deleteWidget } = useCommands();

  const widgetProps: widgets.WidgetProps = {
    editMode: props.view.editable,
    initData: props.widgetData,
    removeSelf: () => {
      deleteWidget((props.getPosition as () => number)());
    },
    writeData: (data: unknown) => {
      props.updateAttributes({
        widgetType: props.widgetType,
        widgetData: data,
      });
    },
  };
  switch (props.widgetType) {
    case widgets.WIDGET_TYPE_TASK_REF: {
      return <widgets.IssueRefWidget {...widgetProps} />;
    }
    case widgets.WIDGET_TYPE_BUG_REF: {
      return <widgets.IssueRefWidget {...widgetProps} />;
    }
    case widgets.WIDGET_TYPE_SPRIT_REF: {
      return <widgets.SpritRefWidget {...widgetProps} />;
    }
    case widgets.WIDGET_TYPE_MERMAID: {
      return <widgets.MermaidWidget {...widgetProps} />;
    }
    case widgets.WIDGET_TYPE_REQUIRE_MENT_REF: {
      return <widgets.RequirementRefWidget {...widgetProps} />;
    }
    case widgets.WIDGET_TYPE_TLDRAW: {
      return <widgets.TldrawWidget {...widgetProps} />
    }
    case widgets.WIDGET_TYPE_SWAGGER: {
      return <widgets.SwaggerWidget {...widgetProps} />
    }
    case widgets.WIDGET_TYPE_TESTCASE_REF: {
      return <widgets.TestcaseRefWidget {...widgetProps}/>
    }
    default: {
      return <div>不支持的插件</div>;
    }
  }
};
