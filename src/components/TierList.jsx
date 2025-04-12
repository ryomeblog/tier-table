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

// すべての有効なコンテナIDを取得
const getAllContainerIds = () => [STORAGE_ID, ...TIERS.map(tier => getTierId(tier.name))];

// ドロップ先のコンテナIDを取得するヘルパー関数
const getTargetContainer = (over, items) => {
  if (!over) return null;

  // 1. ストレージエリアへのドロップ
  if (over.id === STORAGE_ID) {
    return STORAGE_ID;
  }

  // 2. Tier表へのドロップ
  const tierMatch = TIERS.find(tier => getTierId(tier.name) === over.id);
  if (tierMatch) {
    return getTierId(tierMatch.name);
  }

  // 3. アイテム上へのドロップ（親コンテナを特定）
  const targetId = over.id;
  for (const containerId of getAllContainerIds()) {
    if (items[containerId]?.includes(targetId)) {
      return containerId;
    }
  }

  return null;
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
  const [activeContainer, setActiveContainer] = useState(null);

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
    const container = isFromStorage ? STORAGE_ID : event.active.data.current?.sortable.containerId;

    setActiveId(event.active.id);
    setActiveIsStorage(isFromStorage);
    setActiveContainer(container);

    console.log('Drag Start:', {
      id: event.active.id,
      isFromStorage,
      container,
    });
  };

  const handleDragEnd = event => {
    const { active, over } = event;
    setActiveId(null);
    setActiveIsStorage(false);
    setActiveContainer(null);

    if (!over) {
      console.log('No over target, cancelling drag');
      return;
    }

    console.log('Drag End Event:', {
      active: {
        id: active.id,
        data: active.data.current,
      },
      over: {
        id: over.id,
        data: over.data.current,
      },
      activeContainer,
    });

    // ドロップ先のコンテナを特定
    const overContainer = getTargetContainer(over, items);
    if (!overContainer) {
      console.log('Invalid drop target:', over.id);
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
      if (!activeIsStorage && items[activeContainer]) {
        // Tier内での移動のみソート可能
        const oldIndex = items[activeContainer].indexOf(active.id);
        const newIndex = items[activeContainer].indexOf(over.id);

        console.log('Same container movement:', {
          oldIndex,
          newIndex,
          activeItems: items[activeContainer],
        });

        if (oldIndex !== -1) {
          setItems(prev => ({
            ...prev,
            [activeContainer]: arrayMove(
              prev[activeContainer],
              oldIndex,
              newIndex === -1 ? prev[activeContainer].length : newIndex
            ),
          }));
        }
      }
    } else {
      // コンテナ間の移動
      if (!items[activeContainer]?.includes(active.id)) {
        console.log('Item not found in source container');
        return;
      }

      if (!activeIsStorage && overContainer !== STORAGE_ID) {
        // Tier間の移動の場合は重複チェック
        if (isItemInOtherTiers(active.id, overContainer)) {
          console.log('Duplicate item detected in tiers, cancelling move');
          return;
        }
      }

      console.log('Moving between containers:', {
        from: activeContainer,
        to: overContainer,
        item: active.id,
        isFromStorage: activeIsStorage,
      });

      setItems(prev => {
        const newItems = {
          ...prev,
          [activeContainer]: prev[activeContainer].filter(item => item !== active.id),
          [overContainer]: [...(prev[overContainer] || []), active.id],
        };
        console.log('New items state:', newItems);
        return newItems;
      });
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
          return (
            <SortableContext key={name} id={tierId} items={items[tierId] || []}>
              <TierRow tier={name} color={color} items={items[tierId] || []}>
                {(items[tierId] || []).map(id => (
                  <DraggableItem key={id} id={id} content={id} isInStorage={false} />
                ))}
              </TierRow>
            </SortableContext>
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
