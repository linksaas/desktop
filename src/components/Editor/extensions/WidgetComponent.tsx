import React from 'react';
import type { NodeViewComponentProps } from '@remirror/react';
import * as widgets from '../widgets';
import { useCommands } from '@remirror/react';

export type WidgetProps = NodeViewComponentProps & {
  widgetType: widgets.WIDGET_TYPE;
  widgetData: unknown;
  collapse?: boolean;
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
    collapse: props.collapse || false,
  };
  switch (props.widgetType) {
    case widgets.WIDGET_TYPE_FUNNEL: {
      return <widgets.FunnelWidget {...widgetProps} />;
    }
    case widgets.WIDGET_TYPE_TASK_REF: {
      return <widgets.IssueRefWidget {...widgetProps} />;
    }
    case widgets.WIDGET_TYPE_BUG_REF: {
      return <widgets.IssueRefWidget {...widgetProps} />;
    }
    case widgets.WIDGET_TYPE_SPRIT_REF: {
      return <widgets.SpritRefWidget {...widgetProps} />;
    }
    case widgets.WIDGET_TYPE_5W2H: {
      return <widgets.L5w2hWidget {...widgetProps} />;
    }
    case widgets.WIDGET_TYPE_MEMBER_DUTY: {
      return <widgets.MemberDutyWidget {...widgetProps} />;
    }
    case widgets.WIDGET_TYPE_OTSW: {
      return <widgets.OtswWidget {...widgetProps} />;
    }
    case widgets.WIDGET_TYPE_SOAR: {
      return <widgets.SoarWidget {...widgetProps} />;
    }
    case widgets.WIDGET_TYPE_SWAGGER: {
      return <widgets.SwaggerWidget {...widgetProps} />;
    }
    case widgets.WIDGET_TYPE_SWOT: {
      return <widgets.SwotWidget {...widgetProps} />;
    }
    case widgets.WIDGET_TYPE_TECH_COMPARE: {
      return <widgets.TechCompareWidget {...widgetProps} />;
    }
    case widgets.WIDGET_TYPE_TIME_RANGE: {
      return <widgets.TimeRangeWidget {...widgetProps} />;
    }
    case widgets.WIDGET_TYPE_MERMAID: {
      return <widgets.MermaidWidget {...widgetProps} />;
    }
    case widgets.WIDGET_TYPE_MARK_MAP: {
      return <widgets.MarkmapWidget {...widgetProps} />;
    }
    case widgets.WIDGET_TYPE_MYSQL_QUERY: {
      return <widgets.MysqlQueryWidget {...widgetProps} />;
    }
    case widgets.WIDGET_TYPE_MONGO_QUERY: {
      return <widgets.MongoQueryWidget {...widgetProps} />;
    }
    case widgets.WIDGET_TYPE_GITLAB_LIST_GROUP: {
      return <widgets.GitlabListGroupWidget {...widgetProps} />;
    }
    case widgets.WIDGET_TYPE_GITLAB_LIST_PROJECT: {
      return <widgets.GitlabListProjectWidget {...widgetProps} />;
    }
    case widgets.WIDGET_TYPE_GITLAB_LIST_WIKI: {
      return <widgets.GitlabListWikiWidget {...widgetProps} />;
    }
    case widgets.WIDGET_TYPE_GITLAB_LIST_COMMIT: {
      return <widgets.GitlabListCommitWidget {...widgetProps} />;
    }
    case widgets.WIDGET_TYPE_GITLAB_LIST_ISSUE: {
      return <widgets.GitlabListIssueWidget {...widgetProps} />;
    }
    case widgets.WIDGET_TYPE_SURVEY_CHOICE: {
      return <widgets.SurveyChoiceWidget {...widgetProps} />;
    }
    case widgets.WIDGET_TYPE_SURVEY_TRUE_OR_FALSE: {
      return <widgets.SurveyTrueOrFalseWidget {...widgetProps} />;
    }
    default: {
      return <div>??????????????????</div>;
    }
  }
};
