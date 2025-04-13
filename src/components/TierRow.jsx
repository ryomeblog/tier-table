import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import PropTypes from 'prop-types';

const TierRow = ({ tier, color, items, children }) => {
  const containerId = `tier-${tier}`;

  // ドロップ可能な領域の設定
  const { setNodeRef, isOver } = useDroppable({
    id: containerId,
    data: {
      type: 'tier',
      accepts: ['item'],
      tierId: containerId,
    },
    strategy: 'always', // 常にドロップ可能な状態を維持
  });

  return (
    <div className="flex w-full h-[90px] border-[3px] border-[#777777] rounded">
      {/* Tier Label */}
      <div
        className="w-[60px] h-full flex items-center justify-center font-bold text-4xl"
        style={{ backgroundColor: color }}
      >
        {tier}
      </div>

      {/* Droppable Area */}
      <div
        ref={setNodeRef}
        className={`
          flex-1 bg-[#333333] border-l-2 border-[#555555] p-4
          flex gap-2 items-center overflow-x-auto transition-colors
          ${isOver ? 'bg-opacity-70 border-dashed' : ''}
        `}
      >
        <SortableContext items={items} strategy={horizontalListSortingStrategy}>
          {children}
        </SortableContext>
      </div>
    </div>
  );
};

TierRow.propTypes = {
  tier: PropTypes.string.isRequired,
  color: PropTypes.string.isRequired,
  items: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      content: PropTypes.string.isRequired,
      color: PropTypes.string.isRequired,
    })
  ).isRequired,
  children: PropTypes.node,
};

export default TierRow;
