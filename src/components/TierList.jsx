import React, { useState } from 'react';
import {
  DndContext,
  pointerWithin,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  useDroppable,
} from '@dnd-kit/core';
import { SortableContext, arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import TierRow from './TierRow';
import DraggableItem from './DraggableItem';
import PropTypes from 'prop-types';

const TIERS = [
  { name: 'S', color: '#ff6b6b' },
  { name: 'A', color: '#ffb347' },
  { name: 'B', color: '#ffff66' },
  { name: 'C', color: '#b9ff73' },
  { name: 'D', color: '#73c2fb' },
];

// コンテナの識別子を定数として管理
const STORAGE_ID = 'storage';
const getTierId = name => `tier-${name}`;

// ドロップ先のコンテナIDを取得するヘルパー関数
const getTargetContainer = (over, items) => {
  if (!over) return null;

  // 1. Tier領域への直接ドロップを最優先で確認
  // この判定でマウスを離した位置のTierが判定される
  if (over.data.current?.type === 'tier') {
    return over.data.current.tierId;
  }

  // 2. アイテム上へのドロップを確認（同じTier内での並べ替え用）
  const dropTargetId = over.id;
  for (const tier of TIERS) {
    const tierId = getTierId(tier.name);
    if (items[tierId]?.some(item => item.id === dropTargetId)) {
      return tierId;
    }
  }

  // 3. ストレージエリアへのドロップを確認
  if (over.id === STORAGE_ID || items[STORAGE_ID]?.some(item => item.id === dropTargetId)) {
    return STORAGE_ID;
  }

  return null;
};

const StorageArea = ({ items, onRemove, onEditItem }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: STORAGE_ID,
    data: {
      type: 'storage',
      accepts: ['item'],
    },
  });

  return (
    <div className="mt-4">
      <h2 className="text-center text-xl font-bold mb-2">アイテム置き場</h2>
      <div
        ref={setNodeRef}
        className={`
          w-full h-[90px] bg-[#333333] border-[3px] border-[#777777] rounded p-4
          flex gap-2 items-center overflow-x-auto transition-colors
          ${isOver ? 'bg-opacity-70 border-dashed' : ''}
        `}
      >
        {(items || []).map(item => (
          <DraggableItem
            key={item.id}
            item={item}
            isInStorage={true}
            onRemove={itemId => onRemove(itemId, STORAGE_ID)}
            onEdit={updatedItem => onEditItem(item.id, updatedItem)}
          />
        ))}
      </div>
    </div>
  );
};

StorageArea.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      content: PropTypes.string.isRequired,
      color: PropTypes.string.isRequired,
    })
  ).isRequired,
  onRemove: PropTypes.func.isRequired,
  onEditItem: PropTypes.func.isRequired,
};

const TierList = ({ items, setItems, onRemoveItem, onEditItem }) => {
  const [activeId, setActiveId] = useState(null);
  const [activeIsStorage, setActiveIsStorage] = useState(false);
  const [activeContainer, setActiveContainer] = useState(null);

  const handleRemove = (itemId, containerId) => {
    onRemoveItem(itemId, containerId);
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = event => {
    const isFromStorage = !event.active.data.current?.sortable;
    let container;

    // コンテナの特定
    if (isFromStorage) {
      container = STORAGE_ID;
    } else {
      // Tierからの開始の場合
      for (const tier of TIERS) {
        const tierId = getTierId(tier.name);
        if (items[tierId]?.some(item => item.id === event.active.id)) {
          container = tierId;
          break;
        }
      }
    }

    setActiveId(event.active.id);
    setActiveIsStorage(isFromStorage);
    setActiveContainer(container);
  };

  const handleDragEnd = event => {
    const { active, over } = event;

    if (!over) {
      setActiveId(null);
      setActiveIsStorage(false);
      setActiveContainer(null);
      return;
    }

    // 1. まず、ドロップ先のTierを特定（Tier領域への直接ドロップを優先）
    const overTierId = over.data.current?.type === 'tier' ? over.data.current.tierId : null;
    // それ以外の場合は、通常のコンテナ特定ロジックを使用
    const overContainer = overTierId || getTargetContainer(over, items);

    if (!overContainer || !activeContainer) {
      setActiveId(null);
      setActiveIsStorage(false);
      setActiveContainer(null);
      return;
    }

    // 2. 同じTier内での移動かどうかを判定
    if (overContainer === activeContainer) {
      const activeItems = items[activeContainer];
      if (!activeItems) return;

      const oldIndex = activeItems.findIndex(item => item.id === active.id);
      const overItemIndex = activeItems.findIndex(item => item.id === over.id);

      // 同じTier内での並び替えの場合のみ順序を変更
      if (overItemIndex !== -1 && oldIndex !== overItemIndex) {
        setItems(prev => ({
          ...prev,
          [activeContainer]: arrayMove(prev[activeContainer], oldIndex, overItemIndex),
        }));
      }
    } else {
      // 3. 異なるTier間での移動
      const sourceItems = items[activeContainer];
      const movedItem = sourceItems?.find(item => item.id === active.id);
      if (!movedItem) return;

      // 新しいTierに移動（離した場所のTierを優先）
      setItems(prev => ({
        ...prev,
        [activeContainer]: prev[activeContainer].filter(item => item.id !== active.id),
        [overContainer]: [...(prev[overContainer] || []), movedItem],
      }));
    }

    setActiveId(null);
    setActiveIsStorage(false);
    setActiveContainer(null);
  };

  return (
    <div id="tier-list-container" className="w-full max-w-[700px] mx-auto space-y-0 relative">
      <DndContext
        sensors={sensors}
        collisionDetection={pointerWithin}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {TIERS.map(({ name, color }) => {
          const tierId = getTierId(name);
          const tierItems = items[tierId] || [];

          return (
            <SortableContext key={tierId} items={tierItems}>
              <TierRow tier={name} color={color} items={tierItems}>
                {tierItems.map(item => (
                  <DraggableItem
                    key={item.id}
                    item={item}
                    isInStorage={false}
                    onRemove={itemId => handleRemove(itemId, tierId)}
                    onEdit={updatedItem => onEditItem(item.id, tierId, updatedItem)}
                  />
                ))}
              </TierRow>
            </SortableContext>
          );
        })}

        <StorageArea
          items={items.storage}
          onRemove={handleRemove}
          onEditItem={(itemId, updatedItem) => onEditItem(itemId, STORAGE_ID, updatedItem)}
        />

        {/* Drag Overlay */}
        <DragOverlay>
          {activeId && items[activeContainer] ? (
            <DraggableItem
              item={items[activeContainer].find(item => item.id === activeId)}
              isInStorage={activeIsStorage}
              onRemove={() => {}}
              onEdit={() => {}}
            />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};

TierList.propTypes = {
  items: PropTypes.shape({
    storage: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        content: PropTypes.string.isRequired,
        color: PropTypes.string.isRequired,
      })
    ).isRequired,
    'tier-S': PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        content: PropTypes.string.isRequired,
        color: PropTypes.string.isRequired,
      })
    ),
    'tier-A': PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        content: PropTypes.string.isRequired,
        color: PropTypes.string.isRequired,
      })
    ),
    'tier-B': PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        content: PropTypes.string.isRequired,
        color: PropTypes.string.isRequired,
      })
    ),
    'tier-C': PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        content: PropTypes.string.isRequired,
        color: PropTypes.string.isRequired,
      })
    ),
    'tier-D': PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        content: PropTypes.string.isRequired,
        color: PropTypes.string.isRequired,
      })
    ),
  }).isRequired,
  setItems: PropTypes.func.isRequired,
  onRemoveItem: PropTypes.func.isRequired,
  onEditItem: PropTypes.func.isRequired,
};

export default TierList;
