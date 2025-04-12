import React, { useState } from 'react';
import {
  DndContext,
  closestCenter,
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
const getTargetContainer = over => {
  if (!over) return null;

  // ストレージエリアへのドロップ
  if (over.id === STORAGE_ID) {
    return STORAGE_ID;
  }

  // Tier表の領域へのドロップ
  if (over.id.startsWith('tier-')) {
    return over.id;
  }

  // アイテム上へのドロップの場合は、アイテムが属するコンテナのIDを使用
  const containerData = over.data.current?.sortable;
  return containerData?.containerId || null;
};

const StorageArea = ({ items }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: STORAGE_ID,
  });

  return (
    <div className="mt-4">
      <h2 className="text-center text-xl font-bold mb-2">アイテム置き場</h2>
      <div
        ref={setNodeRef}
        className={`
          w-full h-[40px] bg-[#333333] border-2 border-[#555555] rounded px-2
          flex gap-2 items-center overflow-x-auto transition-colors
          ${isOver ? 'bg-opacity-70 border-dashed' : ''}
        `}
      >
        {(items || []).map(id => (
          <DraggableItem key={id} id={id} content={id} isInStorage={true} />
        ))}
      </div>
    </div>
  );
};

StorageArea.propTypes = {
  items: PropTypes.arrayOf(PropTypes.string).isRequired,
};

const TierList = ({ items, setItems }) => {
  const [activeId, setActiveId] = useState(null);
  const [activeIsStorage, setActiveIsStorage] = useState(false);

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

  // アイテムが指定のTier内に存在するかチェック
  const isItemInTier = (itemId, tierId) => {
    const tierItems = items[tierId] || [];
    return tierItems.includes(itemId);
  };

  // アイテムが他のTierに存在するかチェック（ストレージは除く）
  const isItemInOtherTiers = (itemId, currentTierId) => {
    return TIERS.map(tier => getTierId(tier.name))
      .filter(tierId => tierId !== currentTierId)
      .some(tierId => isItemInTier(itemId, tierId));
  };

  const handleDragStart = event => {
    const isFromStorage = !event.active.data.current?.sortable;
    setActiveId(event.active.id);
    setActiveIsStorage(isFromStorage);

    console.log('Drag Start:', {
      id: event.active.id,
      isFromStorage,
      container: event.active.data.current?.sortable?.containerId,
    });
  };

  const handleDragEnd = event => {
    const { active, over } = event;
    setActiveId(null);
    setActiveIsStorage(false);

    if (!over) {
      console.log('No over target, cancelling drag');
      return;
    }

    // アクティブなアイテムのコンテナを特定
    const activeContainer = active.data.current?.sortable?.containerId || STORAGE_ID;

    // ドロップ先のコンテナを特定
    const overContainer = getTargetContainer(over);

    if (!overContainer) {
      console.log('Invalid drop target:', over);
      return;
    }

    console.log('Container Info:', {
      activeContainer,
      overContainer,
      activeItems: items[activeContainer],
      overItems: items[overContainer],
    });

    if (overContainer === activeContainer) {
      // 同じコンテナ内での移動
      const activeItems = items[activeContainer];
      if (!activeItems) return;

      const oldIndex = activeItems.indexOf(active.id);
      const newIndex = activeItems.indexOf(over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        console.log('Reordering within container:', {
          container: activeContainer,
          oldIndex,
          newIndex,
        });

        setItems(prev => ({
          ...prev,
          [activeContainer]: arrayMove(prev[activeContainer], oldIndex, newIndex),
        }));
      }
    } else {
      // コンテナ間の移動
      const sourceItems = items[activeContainer];
      if (!sourceItems?.includes(active.id)) {
        console.log('Item not found in source container');
        return;
      }

      // ストレージとの移動、または同じアイテムが存在しない場合のみ許可
      if (
        activeContainer === STORAGE_ID ||
        overContainer === STORAGE_ID ||
        !isItemInOtherTiers(active.id, overContainer)
      ) {
        console.log('Moving between containers:', {
          from: activeContainer,
          to: overContainer,
          item: active.id,
        });

        setItems(prev => ({
          ...prev,
          [activeContainer]: prev[activeContainer].filter(item => item !== active.id),
          [overContainer]: [...(prev[overContainer] || []), active.id],
        }));
      } else {
        console.log('Duplicate item detected, cancelling move');
      }
    }
  };

  return (
    <div className="w-full max-w-[700px] mx-auto space-y-0">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {TIERS.map(({ name, color }) => {
          const tierId = getTierId(name);
          const tierItems = items[tierId] || [];

          return (
            <TierRow key={name} tier={name} color={color} items={tierItems}>
              {tierItems.map(id => (
                <DraggableItem key={id} id={id} content={id} isInStorage={false} />
              ))}
            </TierRow>
          );
        })}

        <StorageArea items={items.storage} />

        {/* Drag Overlay */}
        <DragOverlay>
          {activeId ? (
            <DraggableItem id={activeId} content={activeId} isInStorage={activeIsStorage} />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};

TierList.propTypes = {
  items: PropTypes.shape({
    storage: PropTypes.arrayOf(PropTypes.string).isRequired,
    'tier-S': PropTypes.arrayOf(PropTypes.string),
    'tier-A': PropTypes.arrayOf(PropTypes.string),
    'tier-B': PropTypes.arrayOf(PropTypes.string),
    'tier-C': PropTypes.arrayOf(PropTypes.string),
    'tier-D': PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
  setItems: PropTypes.func.isRequired,
};

export default TierList;
