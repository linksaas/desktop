import React, { useState } from 'react';
import { ReactComponent as Deletesvg } from '@/assets/svg/delete.svg';
import RemoveModal from './RemoveModal';
import { useStores } from '@/hooks';


const RemoveDocBtn = () => {
    const [showModal, setShowModal] = useState(false);
    const docSpaceStore = useStores('docSpaceStore');

    const onRemove = () => {
        if (docSpaceStore.recycleBin) {
            //彻底删除,显示回收站文档列表
            docSpaceStore.showDocList("", true);
        } else {
            //到回收站
            docSpaceStore.recycleBin = true;
        }
        setShowModal(false);
    };

    return (
        <>
            <Deletesvg
                onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setShowModal(true);
                }}
            />
            {showModal && (
                <RemoveModal
                    onCancel={() => setShowModal(false)}
                    onOk={() => onRemove()}
                />
            )}
        </>
    );
};

export default RemoveDocBtn;
