import React from 'react';
import type { WebMsg } from '@/stores/chatMsg';
import { MSG_LINK_BUG, MSG_LINK_TASK, MSG_LINK_CHANNEL, SENDER_TYPE_ROBOT, MSG_LINK_ROBOT_METRIC } from '@/api/project_channel';
import type { MSG_LINK_TYPE } from '@/api/project_channel';
import { observer } from 'mobx-react';
import { runInAction } from 'mobx';
import { Space } from 'antd';
import { useStores } from '@/hooks';
import { useHistory } from 'react-router-dom';
import { LinkTaskInfo, LinkBugInfo, LinkChannelInfo, LinkRobotMetricInfo } from '@/stores/linkAux';
import { ReadOnlyEditor } from '@/components/Editor';
import UserPhoto from '@/components/Portrait/UserPhoto';
import styles from './ChatMsg.module.less';
import { LinkOutlined } from '@ant-design/icons';
import moment from 'moment';
import { CloseOutlined } from '@ant-design/icons';

export type ChatMsgProp = {
  msg: WebMsg;
  readonly: boolean;
};

const ChatMsg: React.FC<ChatMsgProp> = (props) => {
  const { msg, readonly } = props;
  const userStore = useStores('userStore');
  const projectStore = useStores('projectStore');
  const chatMsgStore = useStores('chatMsgStore');
  const linkAuxStore = useStores('linkAuxStore');
  const history = useHistory();

  const goToDest = () => {
    if (msg.msg.basic_msg.link_type == MSG_LINK_TASK) {
      linkAuxStore.goToLink(
        new LinkTaskInfo('', msg.msg.project_id, msg.msg.basic_msg.link_dest_id),
        history,
      );
    } else if (msg.msg.basic_msg.link_type == MSG_LINK_BUG) {
      linkAuxStore.goToLink(
        new LinkBugInfo('', msg.msg.project_id, msg.msg.basic_msg.link_dest_id),
        history,
      );
    } else if (msg.msg.basic_msg.link_type == MSG_LINK_CHANNEL) {
      linkAuxStore.goToLink(
        new LinkChannelInfo('', msg.msg.project_id, msg.msg.basic_msg.link_dest_id, msg.msg.msg_id),
        history,
      );
    } else if (msg.msg.basic_msg.link_type == MSG_LINK_ROBOT_METRIC) {
      linkAuxStore.goToLink(
        new LinkRobotMetricInfo('', msg.msg.project_id, msg.msg.basic_msg.link_dest_id),
        history);
    }
  };
  const setHover = (hover: boolean) => {
    runInAction(() => (msg.hovered = hover));
  };
  const getLinkType = (linkType: MSG_LINK_TYPE) => {
    if (linkType == MSG_LINK_BUG) {
      return "缺陷";
    } else if (linkType == MSG_LINK_TASK) {
      return "任务";
    } else if (linkType == MSG_LINK_CHANNEL) {
      return "频道";
    }
    return "";
  };
  return (
    <>
      <div
        className={styles.chatItem}
        onMouseOver={() => setHover(true)}
        onMouseOut={() => setHover(false)}
      >
        <div>
          <UserPhoto
            logoUri={msg.msg.sender_logo_uri ?? ''}
            width="32px"
            height="32px"
            style={{
              borderRadius: '20px',
              position: 'absolute',
              left: '16px',
              top: '10px',
            }}
          />
          <span className={styles.chatName}>{msg.msg.sender_type == SENDER_TYPE_ROBOT ? "机器人" : msg.msg.sender_display_name}</span>
          <span className={styles.chatTime}>{moment(msg.msg.send_time).format("YYYY-MM-DD HH:mm:ss")}</span>
          {msg.msg.has_update_time && (
            <>
              <span className={styles.chatName}>修改时间</span>
              <span className={styles.chatTime}>&nbsp;&nbsp;{moment(msg.msg.update_time).format("YYYY-MM-DD HH:mm:ss")}</span>
            </>
          )}
          {msg.msg.basic_msg.link_dest_id != "" && (
            <span className={styles.linkInfo}>
              来自{getLinkType(msg.msg.basic_msg.link_type)}:
              <a
                style={{ marginLeft: "10px" }}
                onClick={e => {
                  e.stopPropagation();
                  e.preventDefault();
                  goToDest();
                }}><Space>{msg.msg.link_dest_title}<LinkOutlined /></Space></a>
            </span>
          )}
          {msg.hovered && (
            <span className={styles.tools}>
              {readonly == false && msg.msg.sender_user_id == userStore.userInfo.userId && moment().diff(msg.msg.send_time) < (900 * 1000) && (<span
                title="修改"
                className={styles.editBtn}
                onClick={() => chatMsgStore.setEditMsg(msg)}
              />)}
              <span
                title="创建文档"
                className={styles.docBtn}
                onClick={() => linkAuxStore.goToCreateDoc(msg.msg.basic_msg.msg_data, projectStore.curProjectId, "", history)}
              />
              <span
                title="创建任务"
                className={styles.taskBtn}
                onClick={() => linkAuxStore.goToCreateTask(msg.msg.basic_msg.msg_data, projectStore.curProjectId, history)}
              />
              <span
                title="创建缺陷"
                className={styles.bugBtn}
                onClick={() => linkAuxStore.goToCreateBug(msg.msg.basic_msg.msg_data, projectStore.curProjectId, history)}
              />
            </span>
          )}
        </div>
        <div>
          <ReadOnlyEditor content={msg.msg.basic_msg.msg_data} collapse={true} />
        </div>
      </div>
      {chatMsgStore.listRefMsgId == msg.msg.msg_id && (
        <div style={{ backgroundColor: "#E18160", position: "relative", textAlign: "center" }}>
          来自提到我的(关闭后查看更多信息)<CloseOutlined style={{ position: "absolute", right: "5px", top: "5px" }} onClick={e => {
            e.stopPropagation();
            e.preventDefault();
            chatMsgStore.listRefMsgId = '';
          }} />
          &nbsp;&nbsp;
        </div>
      )}
    </>
  );
};

export default observer(ChatMsg);
