import React, { useState, useEffect } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';

// メインのDraggableItemコンポーネント
const DraggableItem = ({ item, isInStorage = false, onRemove, onEdit, isEditing = false }) => {
  return isInStorage ? (
    <StorageDraggableItem item={item} onRemove={onRemove} onEdit={onEdit} isEditing={isEditing} />
  ) : (
    <TierSortableItem item={item} onRemove={onRemove} onEdit={onEdit} isEditing={isEditing} />
  );
};

// 編集用モーダル
const EditItemModal = ({ item, onClose, onSave }) => {
  const [editingContent, setEditingContent] = useState(item.content);
  const [selectedColor, setSelectedColor] = useState(item.color);
  const [selectedFile, setSelectedFile] = useState(null);
  const [displayContent] = useState(item.content);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleFileChange = e => {
    e.stopPropagation();
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleSave = e => {
    e.preventDefault();
    e.stopPropagation();

    const updatedItem = {};

    if (selectedFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updatedItem.content = reader.result;
        // 画像の場合はカラーを含めない
        if (!reader.result.startsWith('data:image')) {
          updatedItem.color = selectedColor;
        }
        onSave(updatedItem);
        onClose();
      };
      reader.readAsDataURL(selectedFile);
    } else if (editingContent.trim() || item.content.startsWith('data:image')) {
      updatedItem.content = editingContent.trim() || item.content;
      // 画像の場合はカラーを含めない
      if (!updatedItem.content.startsWith('data:image')) {
        updatedItem.color = selectedColor;
      }
      onSave(updatedItem);
      onClose();
    }
  };

  const handleClose = e => {
    e.preventDefault();
    e.stopPropagation();
    setEditingContent(displayContent); // キャンセル時に元の内容に戻す
    onClose();
  };

  const handleModalClick = e => {
    e.stopPropagation();
  };

  const isImage = item.content.startsWith('http') || item.content.startsWith('data:image');

  if (typeof window === 'undefined' || !document.body) return null;

  return createPortal(
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
      style={{ zIndex: 9999 }}
      onClick={handleClose}
    >
      <div
        className="bg-dark-surface p-6 rounded-lg max-w-md w-full"
        onClick={handleModalClick}
        onKeyDown={e => {
          if (e.key === 'Enter') {
            e.preventDefault();
            e.stopPropagation();
            return false;
          }
        }}
      >
        <h3 className="text-xl font-bold mb-4">アイテムを編集</h3>

        <div className="space-y-4">
          {isImage ? (
            <div>
              <label className="block mb-2">画像:</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                onClick={handleModalClick}
                className="w-full p-2 bg-[#333333] border border-[#555555] rounded cursor-pointer"
              />
            </div>
          ) : (
            <>
              <div>
                <label className="block mb-2">テキスト:</label>
                <input
                  type="text"
                  value={editingContent}
                  onChange={e => setEditingContent(e.target.value)}
                  onClick={handleModalClick}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                    }
                  }}
                  className="w-full p-2 bg-[#333333] border border-[#555555] rounded"
                  placeholder="テキストを入力"
                />
              </div>

              <div>
                <label className="block mb-2">カードの色:</label>
                <input
                  type="color"
                  value={selectedColor}
                  onChange={e => setSelectedColor(e.target.value)}
                  onClick={handleModalClick}
                  className="w-full h-10 p-1 bg-[#333333] border border-[#555555] rounded cursor-pointer"
                />
              </div>
            </>
          )}
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={handleClose}
            className="px-4 py-2 bg-[#444444] rounded hover:bg-[#555555] transition-colors"
            type="button"
          >
            キャンセル
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-[#555555] rounded hover:bg-[#666666] transition-colors"
            type="button"
          >
            保存
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

// ストレージ用のドラッグ可能なアイテム
const StorageDraggableItem = ({ item, onRemove, onEdit, isEditing }) => {
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
      onEdit={onEdit}
      isEditing={isEditing}
    />
  );
};

// Tier表用のソート可能なアイテム
const TierSortableItem = ({ item, onRemove, onEdit, isEditing }) => {
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
      onEdit={onEdit}
      isEditing={isEditing}
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
  onEdit,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const isImage = item?.content?.startsWith('http') || item?.content?.startsWith('data:image');

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        backgroundColor: item.color,
        pointerEvents: isEditing ? 'none' : 'auto',
      }}
      {...(isEditing ? {} : { ...attributes, ...listeners })}
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
        cursor-pointer
      `}
      onClick={e => {
        if (!isDragging) {
          e.preventDefault();
          e.stopPropagation();
          setIsEditing(true);
        }
      }}
    >
      {isEditing && (
        <EditItemModal
          item={item}
          onClose={() => setIsEditing(false)}
          onSave={updatedItem => {
            onEdit(updatedItem);
            setIsEditing(false);
          }}
        />
      )}

      {isImage ? (
        <img
          src={item.content}
          alt="tier item"
          className="w-full h-full object-cover rounded"
          draggable={false}
        />
      ) : (
        <span className="text-center break-all px-1 select-none line-clamp-2 overflow-hidden">
          {item.content}
        </span>
      )}

      {/* 編集・削除ボタン */}
      <div className="absolute -top-2 -right-2 flex gap-1">
        <button
          onClick={e => {
            e.stopPropagation();
            setIsEditing(true);
          }}
          className="
            w-5 h-5
            bg-blue-500
            rounded-full
            flex items-center justify-center
            text-white text-xs
            opacity-0 group-hover:opacity-100
            transition-opacity
            hover:bg-blue-600
            z-10
          "
        >
          ✎
        </button>
        <button
          onClick={e => {
            e.stopPropagation();
            onRemove(item.id);
          }}
          className="
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
    </div>
  );
};

// PropTypes定義
DraggableItem.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
  }).isRequired,
  isInStorage: PropTypes.bool,
  onRemove: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
};

EditItemModal.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
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
  onEdit: PropTypes.func.isRequired,
  isEditing: PropTypes.bool,
};

DraggableItemContent.defaultProps = {
  isEditing: false,
};

StorageDraggableItem.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
  }).isRequired,
  onRemove: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
};

TierSortableItem.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
  }).isRequired,
  onRemove: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
};

export default DraggableItem;
