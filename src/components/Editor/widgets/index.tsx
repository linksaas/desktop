export type { WidgetProps } from './common';
export { FunnelWidget } from './FunnelWidget';
export { IssueRefWidget } from './IssueRefWidget';
export { SpritRefWidget } from './SpritRefWidget';
export { L5w2hWidget } from './L5w2hWidget';
export { MemberDutyWidget } from './MemberDutyWidget';
export { OtswWidget } from './OtswWidget';
export { SoarWidget } from './SoarWidget';
export { SwaggerWidget } from './SwaggerWidget';
export { SwotWidget } from './SwotWidget';
export { TechCompareWidget } from './TechCompareWidget';
export { TimeRangeWidget } from './TimeRangeWidget';
export { MermaidWidget } from './MermaidWidget';
export { MarkmapWidget } from './MarkmapWidget';
export { MysqlQueryWidget } from './MysqlQueryWidget';
export { MongoQueryWidget } from './MongoQueryWidget';
export { GitlabListCommitWidget } from './GitlabListCommitWidget';
export { GitlabListGroupWidget } from './GitlabListGroupWidget';
export { GitlabListIssueWidget } from './GitlabListIssueWidget';
export { GitlabListProjectWidget } from './GitlabListProjectWidget';
export { GitlabListWikiWidget } from './GitlabListWikiWidget';
export { SurveyChoiceWidget } from './SurveyChoiceWidget';
export { SurveyTrueOrFalseWidget } from './SurveyTrueOrFalseWidget';

import { funnelWidgetInitData } from './FunnelWidget';
import { taskRefWidgetInitData, bugRefWidgetInitData } from './IssueRefWidget';
import { spritRefWidgetInitData } from './SpritRefWidget';
import { l5w2hWidgetInitData } from './L5w2hWidget';
import { memberDutyWidgetInitData } from './MemberDutyWidget';
import { otswWidgetInitData } from './OtswWidget';
import { soarWidgetInitData } from './SoarWidget';
import { swaggerWidgetInitData } from './SwaggerWidget';
import { swotWidgetInitData } from './SwotWidget';
import { techCompareWidgetInitData } from './TechCompareWidget';
import { timeRangeWidgetInitData } from './TimeRangeWidget';
import { mermaidWidgetInitData } from './MermaidWidget';
import { markmapWidgetInitData } from './MarkmapWidget';
import { mysqlQueryWidgetInitData } from './MysqlQueryWidget';
import { mongoQueryWidgetInitData } from './MongoQueryWidget';
import { gitlabListCommitWidgetInitData } from './GitlabListCommitWidget';
import { gitlabListGroupWidgetInitData } from './GitlabListGroupWidget';
import { gitlabListIssueWidgetInitData } from './GitlabListIssueWidget';
import { gitlabListProjectWidgetInitData } from './GitlabListProjectWidget';
import { gitlabListWikiWidgetInitData } from './GitlabListWikiWidget';
import { surveyChoiceWidgetInitData } from './SurveyChoiceWidget';
import { surveyTrueOrFlaseWidgetInitData } from './SurveyTrueOrFalseWidget';

export type WIDGET_TYPE = string;
export const WIDGET_TYPE_FUNNEL: WIDGET_TYPE = "funnel";//???????????????
export const WIDGET_TYPE_TASK_REF: WIDGET_TYPE = "taskRef";//????????????
export const WIDGET_TYPE_BUG_REF: WIDGET_TYPE = "bugRef";//????????????
export const WIDGET_TYPE_SPRIT_REF: WIDGET_TYPE = "spritRef"; //????????????
export const WIDGET_TYPE_5W2H: WIDGET_TYPE = "5w2h"; //???????????????
export const WIDGET_TYPE_MEMBER_DUTY: WIDGET_TYPE = "memberDuty"; //???????????? 
export const WIDGET_TYPE_OTSW: WIDGET_TYPE = "otsw"; //OTSW????????? 
export const WIDGET_TYPE_SOAR: WIDGET_TYPE = "soar"; //SOAR????????? 
export const WIDGET_TYPE_SWAGGER: WIDGET_TYPE = "swagger"; //swagger api?????? 
export const WIDGET_TYPE_SWOT: WIDGET_TYPE = "swot"; //SWOT????????? 
export const WIDGET_TYPE_TECH_COMPARE: WIDGET_TYPE = "techCompare"; //???????????? 
export const WIDGET_TYPE_TIME_RANGE: WIDGET_TYPE = "timeRange"; // ????????????
export const WIDGET_TYPE_MERMAID: WIDGET_TYPE = "mermaid";
export const WIDGET_TYPE_MARK_MAP: WIDGET_TYPE = "markMap";
export const WIDGET_TYPE_MYSQL_QUERY: WIDGET_TYPE = "mysqlQuery";
export const WIDGET_TYPE_MONGO_QUERY: WIDGET_TYPE = "mongoQuery";
export const WIDGET_TYPE_GITLAB_LIST_GROUP: WIDGET_TYPE = "gitlabListGroup";
export const WIDGET_TYPE_GITLAB_LIST_PROJECT: WIDGET_TYPE = "gitlabListProject";
export const WIDGET_TYPE_GITLAB_LIST_WIKI: WIDGET_TYPE = "gitlabListWiki";
export const WIDGET_TYPE_GITLAB_LIST_COMMIT: WIDGET_TYPE = "gitlabListCommit";
export const WIDGET_TYPE_GITLAB_LIST_ISSUE: WIDGET_TYPE = "gitlabListIssue";
export const WIDGET_TYPE_SURVEY_CHOICE: WIDGET_TYPE = "surveyChoice"; //???????????????
export const WIDGET_TYPE_SURVEY_TRUE_OR_FALSE: WIDGET_TYPE = "surveyTrueOrFalse"; //???????????????


export const WidgetTypeList: WIDGET_TYPE[] = [
    WIDGET_TYPE_FUNNEL,
    WIDGET_TYPE_TASK_REF,
    WIDGET_TYPE_BUG_REF,
    WIDGET_TYPE_SPRIT_REF,
    WIDGET_TYPE_5W2H,
    WIDGET_TYPE_MEMBER_DUTY,
    WIDGET_TYPE_OTSW,
    WIDGET_TYPE_SOAR,
    WIDGET_TYPE_SWAGGER,
    WIDGET_TYPE_SWOT,
    WIDGET_TYPE_TECH_COMPARE,
    WIDGET_TYPE_TIME_RANGE,
    WIDGET_TYPE_MERMAID,
    WIDGET_TYPE_MYSQL_QUERY,
    WIDGET_TYPE_MONGO_QUERY,
    WIDGET_TYPE_GITLAB_LIST_GROUP,
    WIDGET_TYPE_GITLAB_LIST_PROJECT,
    WIDGET_TYPE_GITLAB_LIST_WIKI,
    WIDGET_TYPE_GITLAB_LIST_COMMIT,
    WIDGET_TYPE_GITLAB_LIST_ISSUE,
    WIDGET_TYPE_MARK_MAP,
    WIDGET_TYPE_SURVEY_CHOICE,
    WIDGET_TYPE_SURVEY_TRUE_OR_FALSE,
];


export const WidgetInitDataMap: Map<WIDGET_TYPE, unknown> = new Map();

WidgetInitDataMap.set(WIDGET_TYPE_FUNNEL, funnelWidgetInitData);
WidgetInitDataMap.set(WIDGET_TYPE_TASK_REF, taskRefWidgetInitData);
WidgetInitDataMap.set(WIDGET_TYPE_BUG_REF, bugRefWidgetInitData);
WidgetInitDataMap.set(WIDGET_TYPE_SPRIT_REF, spritRefWidgetInitData);
WidgetInitDataMap.set(WIDGET_TYPE_5W2H, l5w2hWidgetInitData);
WidgetInitDataMap.set(WIDGET_TYPE_MEMBER_DUTY, memberDutyWidgetInitData);
WidgetInitDataMap.set(WIDGET_TYPE_OTSW, otswWidgetInitData);
WidgetInitDataMap.set(WIDGET_TYPE_SOAR, soarWidgetInitData);
WidgetInitDataMap.set(WIDGET_TYPE_SWAGGER, swaggerWidgetInitData);
WidgetInitDataMap.set(WIDGET_TYPE_SWOT, swotWidgetInitData);
WidgetInitDataMap.set(WIDGET_TYPE_TECH_COMPARE, techCompareWidgetInitData);
WidgetInitDataMap.set(WIDGET_TYPE_TIME_RANGE, timeRangeWidgetInitData);
WidgetInitDataMap.set(WIDGET_TYPE_MERMAID, mermaidWidgetInitData);
WidgetInitDataMap.set(WIDGET_TYPE_MARK_MAP, markmapWidgetInitData)
WidgetInitDataMap.set(WIDGET_TYPE_MYSQL_QUERY, mysqlQueryWidgetInitData);
WidgetInitDataMap.set(WIDGET_TYPE_MONGO_QUERY, mongoQueryWidgetInitData);
WidgetInitDataMap.set(WIDGET_TYPE_GITLAB_LIST_GROUP, gitlabListGroupWidgetInitData);
WidgetInitDataMap.set(WIDGET_TYPE_GITLAB_LIST_PROJECT, gitlabListProjectWidgetInitData);
WidgetInitDataMap.set(WIDGET_TYPE_GITLAB_LIST_WIKI, gitlabListWikiWidgetInitData);
WidgetInitDataMap.set(WIDGET_TYPE_GITLAB_LIST_COMMIT, gitlabListCommitWidgetInitData);
WidgetInitDataMap.set(WIDGET_TYPE_GITLAB_LIST_ISSUE, gitlabListIssueWidgetInitData);
WidgetInitDataMap.set(WIDGET_TYPE_SURVEY_CHOICE, surveyChoiceWidgetInitData);
WidgetInitDataMap.set(WIDGET_TYPE_SURVEY_TRUE_OR_FALSE, surveyTrueOrFlaseWidgetInitData);