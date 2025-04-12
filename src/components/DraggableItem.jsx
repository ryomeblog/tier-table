import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import PropTypes from 'prop-types';

// ストレージ用のドラッグ可能なアイテム
const StorageDraggableItem = ({ id, content }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useDraggable({
    id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: 'grab',
  };

  return (
    <DraggableItemContent
      attributes={attributes}
      listeners={listeners}
      setNodeRef={setNodeRef}
      style={style}
      isDragging={isDragging}
      content={content}
    />
  );
};

// Tier表用のソート可能なアイテム
const TierSortableItem = ({ id, content }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: 'grab',
  };

  return (
    <DraggableItemContent
      attributes={attributes}
      listeners={listeners}
      setNodeRef={setNodeRef}
      style={style}
      isDragging={isDragging}
      content={content}
    />
  );
};

// 共通のビジュアル要素
const DraggableItemContent = ({
  attributes,
  listeners,
  setNodeRef,
  style,
  isDragging,
  content,
}) => {
  const isImage = content.startsWith('http') || content.startsWith('data:image');

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        w-[60px] h-[60px] rounded
        flex items-center justify-center
        bg-[#ff8a8a] text-white text-sm
        hover:brightness-110 transition-all
        ${isDragging ? 'shadow-lg ring-2 ring-white ring-opacity-50' : ''}
        active:cursor-grabbing
        touch-none
      `}
    >
      {isImage ? (
        <img
          src={content}
          alt="tier item"
          className="w-full h-full object-cover rounded"
          draggable={false}
        />
      ) : (
        <span className="text-center break-words px-1 select-none">{content}</span>
      )}
    </div>
  );
};

// メインコンポーネント
const DraggableItem = ({ id, content, isInStorage = false }) => {
  return isInStorage ? (
    <StorageDraggableItem id={id} content={content} />
  ) : (
    <TierSortableItem id={id} content={content} />
  );
};

DraggableItem.propTypes = {
  id: PropTypes.string.isRequired,
  content: PropTypes.string.isRequired,
  isInStorage: PropTypes.bool,
};

DraggableItemContent.propTypes = {
  attributes: PropTypes.object.isRequired,
  listeners: PropTypes.object.isRequired,
  setNodeRef: PropTypes.func.isRequired,
  style: PropTypes.object.isRequired,
  isDragging: PropTypes.bool.isRequired,
  content: PropTypes.string.isRequired,
};

StorageDraggableItem.propTypes = {
  id: PropTypes.string.isRequired,
  content: PropTypes.string.isRequired,
};

TierSortableItem.propTypes = {
  id: PropTypes.string.isRequired,
  content: PropTypes.string.isRequired,
};

export default DraggableItem;
