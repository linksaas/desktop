import type { ProjectInfo } from '@/api/project';
import { close, open, remove } from '@/api/project';
import { leave } from '@/api/project_member';
import { useStores } from '@/hooks';
import type { FILTER_PROJECT_ENUM } from '@/utils/constant';
import { APP_PROJECT_PATH } from '@/utils/constant';
import { filterProjectItemList, PROJECT_STATE_OPT_ENUM } from '@/utils/constant';
import { request } from '@/utils/request';
import { FolderFilled, VideoCameraOutlined } from '@ant-design/icons';
import { useSetState } from 'ahooks';
import { Badge, message, Popover, Input } from 'antd';
import { runInAction } from 'mobx';
import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import ActionModal from '../ActionModal';
import Button from '../Button';
import cls from './index.module.less';
import { observer } from 'mobx-react';

// 创建项目
const AddMenu: React.FC = observer(() => {
  const appStore = useStores('appStore');

  return (
    <div className={cls.moremenu} onClick={(e) => e.stopPropagation()}>
      {appStore.clientCfg?.can_invite && (
        <div
          className={cls.item}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            appStore.showJoinProject = true;
          }}
        >
          加入项目
        </div>
      )}
      <div
        className={cls.item}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          appStore.showCreateProject = true;
        }}
      >
        创建新项目
      </div>
    </div>
  );
});

const useProjectMenu = () => {
  const projectStore = useStores('projectStore');
  const userStore = useStores('userStore');
  const history = useHistory();
  const pjMenuItemH = 40;
  const docStore = useStores('docStore');
  const [pjMenu, setPjMenu] = useSetState({
    x: 0,
    y: 0,
    id: '',
  });

  const [pjChangeObj, setPjChangeObj] = useSetState({
    visible: false,
    type: PROJECT_STATE_OPT_ENUM.FINISH,
    text: '结束',
    name: '',
    pjId: '',
  });

  const [disableBtn, setDisableBtn] = useState(false);

  const hideContextMenu = (e: React.MouseEvent<Element, MouseEvent>) => {
    e.stopPropagation();
    if (!pjMenu.id) return;
    setPjMenu({ id: '' });
  };

  // 结束项目弹窗确定事件
  const submitPjItem = async () => {
    if (pjChangeObj.type === PROJECT_STATE_OPT_ENUM.FINISH) {
      try {
        await request(close(userStore.sessionId, pjChangeObj.pjId));
        message.success('项目结束成功');
        setPjChangeObj({ visible: false });
        projectStore.updateProject(pjChangeObj.pjId);
      } catch (error) { }
      return;
    } else if (pjChangeObj.type === PROJECT_STATE_OPT_ENUM.ACTIVATE) {
      try {
        await request(open(userStore.sessionId, pjChangeObj.pjId));
        message.success('项目激活成功');
        setPjChangeObj({ visible: false });
        projectStore.updateProject(pjChangeObj.pjId);
      } catch (error) { }
      return;
    } else if (pjChangeObj.type === PROJECT_STATE_OPT_ENUM.QUIT) {
      try {
        await request(leave(userStore.sessionId, pjChangeObj.pjId));
        message.success('项目退出成功');
        setPjChangeObj({ visible: false });
        projectStore.removeProject(pjChangeObj.pjId, history);
      } catch (error) {
        console.log(error);
      }
      return;
    } else if (pjChangeObj.type == PROJECT_STATE_OPT_ENUM.REMOVE) {
      try {
        await request(remove(userStore.sessionId, pjChangeObj.pjId));
        message.success("项目删除成功");
        setPjChangeObj({ visible: false });
        projectStore.removeProject(pjChangeObj.pjId, history);
      } catch (error) {
        console.log(error);
      }
    }
  };

  // 结束项目弹窗
  const renderPjItemChange = () => {
    let width = 330;
    if (pjChangeObj.type === PROJECT_STATE_OPT_ENUM.REMOVE) {
      width = 430;
    }
    return (
      <ActionModal
        open={pjChangeObj.visible}
        title={`${pjChangeObj.text}项目`}
        width={width}
        mask={false}
        onCancel={() => setPjChangeObj({ visible: false })}
      >
        <div className={cls.pj_change_model}>
          <h1>
            是否要{pjChangeObj.text} {pjChangeObj.name} 项目?
          </h1>
          {pjChangeObj.type === PROJECT_STATE_OPT_ENUM.FINISH && (
            <p>结束后项目将会封存，无法创建新的聊天/任务/缺陷</p>
          )}
          {pjChangeObj.type === PROJECT_STATE_OPT_ENUM.REMOVE && (
            <>
              <p style={{ color: "red" }}>项目被删除后，将无法再访问该项目的任何内容</p>
              <Input addonBefore="请输入要删除的项目名称" onChange={e => {
                e.stopPropagation();
                e.preventDefault();
                if (e.target.value == pjChangeObj.name) {
                  setDisableBtn(false);
                } else {
                  setDisableBtn(true);
                }
              }} />
            </>
          )}
          <div className={cls.btn_wrap}>
            <Button ghost onClick={() => setPjChangeObj({ visible: false })}>
              取消
            </Button>
            <Button onClick={submitPjItem} disabled={disableBtn}>确定</Button>
          </div>
        </div>
      </ActionModal>
    );
  };

  // 结束项目事件
  const pjItemChange = (obj: ProjectInfo, type: PROJECT_STATE_OPT_ENUM) => {
    switch (type) {
      case PROJECT_STATE_OPT_ENUM.FINISH:
        setDisableBtn(false);
        setPjChangeObj({
          visible: true,
          type: PROJECT_STATE_OPT_ENUM.FINISH,
          text: '结束',
          name: obj.basic_info.project_name,
          pjId: obj.project_id,
        });
        return;
      case PROJECT_STATE_OPT_ENUM.ACTIVATE:
        setDisableBtn(false);
        setPjChangeObj({
          visible: true,
          type: PROJECT_STATE_OPT_ENUM.ACTIVATE,
          text: '激活',
          name: obj.basic_info.project_name,
          pjId: obj.project_id,
        });
        return;
      case PROJECT_STATE_OPT_ENUM.QUIT:
        setDisableBtn(false);
        setPjChangeObj({
          visible: true,
          type: PROJECT_STATE_OPT_ENUM.QUIT,
          text: '退出',
          name: obj.basic_info.project_name,
          pjId: obj.project_id,
        });
        return;
      case PROJECT_STATE_OPT_ENUM.REMOVE:
        setDisableBtn(true);
        setPjChangeObj({
          visible: true,
          type: PROJECT_STATE_OPT_ENUM.REMOVE,
          text: '删除',
          name: obj.basic_info.project_name,
          pjId: obj.project_id,
        });
        return;
      default:
        break;
    }
  };

  // 右键菜单
  const rendePjOpenOrClose = (obj: ProjectInfo) => {
    return (
      <div
        key={obj.project_id}
        className={cls.contextmenu_box + ' ' + (pjMenu.id === obj.project_id ? cls.show : '')}
        onClick={hideContextMenu}
        onContextMenu={hideContextMenu}
      >
        <div
          className={cls.contextmenu}
          style={{ top: pjMenu.y, left: pjMenu.x }}
          onMouseLeave={hideContextMenu}
        >
          {obj.user_project_perm.can_close && (
            <div
              className={cls.item}
              onClick={() => pjItemChange(obj, PROJECT_STATE_OPT_ENUM.FINISH)}
            >
              结束项目
            </div>
          )}
          {obj.user_project_perm.can_open && (
            <div
              className={cls.item}
              onClick={() => pjItemChange(obj, PROJECT_STATE_OPT_ENUM.ACTIVATE)}
            >
              激活项目
            </div>
          )}
          {obj.user_project_perm.can_leave && (
            <div
              className={cls.item}
              onClick={() => pjItemChange(obj, PROJECT_STATE_OPT_ENUM.QUIT)}
            >
              退出项目
            </div>
          )}
          {obj.user_project_perm.can_remove && (
            <div
              className={cls.item}
              onClick={() => pjItemChange(obj, PROJECT_STATE_OPT_ENUM.REMOVE)}
            >
              删除项目
            </div>
          )}
        </div>
      </div>
    );
  };

  // 项目列表目录
  const renderProjectItemsChilds = () => {
    return projectStore.filterProjectList.map((item) => {
      return {
        className: `${cls.project_child_menu}`,
        label: (
          <div
            key={item.project_id}
            onClick={() => {
              if (docStore.editing) {
                docStore.setShowleavePage(true);
                docStore.setNextLocation(APP_PROJECT_PATH);
                docStore.setCurProjectId(item.project_id);
                return;
              }
              history.push(APP_PROJECT_PATH);
              projectStore.setCurProjectId(item.project_id);
              projectStore.setShowChannel(true);
            }}
            onContextMenu={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const isH = e.clientY + pjMenuItemH > window.innerHeight;
              setPjMenu({
                x: e.clientX,
                y: isH ? e.clientY - pjMenuItemH : e.clientY,
                id: item.project_id,
              });
            }}
            className={cls.project_child_wrap}
          >
            <div className={`${cls.project_child_title} ${item.closed && cls.close}`}>
              {item.project_id !== projectStore.curProjectId && (
                <Badge count={item.project_status.total_count} className={cls.badge} />
              )}
              {item.project_id !== projectStore.curProjectId && <FolderFilled />}
              {item.project_id == projectStore.curProjectId &&
                item.project_status.work_snap_shot_enable && <VideoCameraOutlined />}
              {item.project_id == projectStore.curProjectId &&
                !item.project_status.work_snap_shot_enable && <FolderFilled />}
              <span>{item.basic_info.project_name}</span>
            </div>
            {rendePjOpenOrClose(item)}
          </div>
        ),
        key: item.project_id,
      };
    });
  };

  const filterChange = (type: FILTER_PROJECT_ENUM) => {
    runInAction(() => {
      projectStore.filterProjectType = type;
    });
  };

  // 过滤项目
  const rendeFilterMenu = () => {
    return (
      <div className={cls.moremenu} onClick={(e) => e.stopPropagation()}>
        {filterProjectItemList.map((item) => (
          <div
            key={item.value}
            className={
              cls.item + ' ' + (item.value === projectStore.filterProjectType ? cls.selected : '')
            }
            onClick={(e) => {
              e.stopPropagation();
              filterChange(item.value);
            }}
          >
            {item.label}
          </div>
        ))}
      </div>
    );
  };

  const menuList = [
    {
      className: `${cls.project_submenu}`,
      label: (
        <div className={cls.submenu_title}>
          项目
          <div className={cls.submenu_icon_wrap}>
            <Popover
              placement="bottomLeft"
              content={<AddMenu />}
              trigger="click"
              overlayClassName="popover"
              // @ts-ignore
              onClick={(e) => e.stopPropagation()}
            >
              <a className={cls.icon_wrap}>
                <i className={cls.add} />
              </a>
            </Popover>
            <Popover
              placement="bottomLeft"
              content={rendeFilterMenu}
              trigger="click"
              overlayClassName="popover"
              // @ts-ignore
              onClick={(e) => e.stopPropagation()}
            >
              <a className={cls.icon_wrap}>
                <i className={cls.more} />
              </a>
            </Popover>
          </div>
        </div>
      ),
      key: 'sub2',
      children: renderProjectItemsChilds(),
    },
  ];
  return {
    menuList,
    renderPjItemChange,
  };
};

export default useProjectMenu;
