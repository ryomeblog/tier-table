import TierRow from './TierRow';
import DraggableItem from './DraggableItem';
import { DndContext } from '@dnd-kit/core';

export default {
  title: 'Components/TierRow',
  component: TierRow,
  decorators: [
    Story => (
      <DndContext>
        <div style={{ padding: '20px' }}>
          <Story />
        </div>
      </DndContext>
    ),
  ],
};

export const STier = {
  args: {
    tier: 'S',
    color: '#ff6b6b',
    items: [],
  },
};

export const WithItems = {
  args: {
    tier: 'A',
    color: '#ffb347',
    items: [
      { id: '1', content: 'テスト1', color: '#ff8a8a' },
      { id: '2', content: 'テスト2', color: '#73c2fb' },
    ],
    children: [
      <DraggableItem
        key="1"
        item={{ id: '1', content: 'テスト1', color: '#ff8a8a' }}
        onRemove={() => {}}
      />,
      <DraggableItem
        key="2"
        item={{ id: '2', content: 'テスト2', color: '#73c2fb' }}
        onRemove={() => {}}
      />,
    ],
  },
};
