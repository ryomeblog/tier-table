import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import PropTypes from 'prop-types';

// ストレージ用のドラッグ可能なアイテム
const StorageDraggableItem = ({ item, onRemove }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useDraggable({
    id: item.id,
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
      item={item}
      onRemove={onRemove}
    />
  );
};

// Tier表用のソート可能なアイテム
const TierSortableItem = ({ item, onRemove }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
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
      item={item}
      onRemove={onRemove}
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
  item,
  onRemove,
}) => {
  const isImage = item.content.startsWith('http') || item.content.startsWith('data:image');

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        backgroundColor: item.color,
      }}
      {...attributes}
      {...listeners}
      className={`
        group
        w-[60px] h-[60px] rounded
        flex items-center justify-center
        relative
        text-white text-sm
        hover:brightness-110 transition-all
        ${isDragging ? 'shadow-lg ring-2 ring-white ring-opacity-50' : ''}
        active:cursor-grabbing
        touch-none
      `}
    >
      {isImage ? (
        <img
          src={item.content}
          alt="tier item"
          className="w-full h-full object-cover rounded"
          draggable={false}
        />
      ) : (
        <span className="text-center break-words px-1 select-none">{item.content}</span>
      )}

      {/* 削除ボタン */}
      <button
        onClick={e => {
          e.stopPropagation();
          onRemove(item.id);
        }}
        className="
          absolute -top-2 -right-2
          w-5 h-5
          bg-red-500
          rounded-full
          flex items-center justify-center
          text-white text-xs
          opacity-0 group-hover:opacity-100
          transition-opacity
          hover:bg-red-600
          z-10
        "
      >
        ×
      </button>
    </div>
  );
};

// メインコンポーネント
const DraggableItem = ({ item, isInStorage = false, onRemove }) => {
  return isInStorage ? (
    <StorageDraggableItem item={item} onRemove={onRemove} />
  ) : (
    <TierSortableItem item={item} onRemove={onRemove} />
  );
};

DraggableItem.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
  }).isRequired,
  isInStorage: PropTypes.bool,
  onRemove: PropTypes.func.isRequired,
};

DraggableItemContent.propTypes = {
  attributes: PropTypes.object.isRequired,
  listeners: PropTypes.object.isRequired,
  setNodeRef: PropTypes.func.isRequired,
  style: PropTypes.object.isRequired,
  isDragging: PropTypes.bool.isRequired,
  item: PropTypes.shape({
    id: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
  }).isRequired,
  onRemove: PropTypes.func.isRequired,
};

StorageDraggableItem.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
  }).isRequired,
  onRemove: PropTypes.func.isRequired,
};

TierSortableItem.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
  }).isRequired,
  onRemove: PropTypes.func.isRequired,
};

export default DraggableItem;
