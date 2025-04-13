import DraggableItem from './DraggableItem';
import { DndContext } from '@dnd-kit/core';

export default {
  title: 'Components/DraggableItem',
  component: DraggableItem,
  argTypes: {
    onRemove: { action: 'onRemove' },
  },
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

export const TextItem = {
  args: {
    item: {
      id: '1',
      content: 'テストアイテム',
      color: '#ff8a8a',
    },
    isInStorage: true,
  },
};

export const ImageItem = {
  args: {
    item: {
      id: '2',
      content: 'https://placekitten.com/60/60',
      color: '#73c2fb',
    },
    isInStorage: false,
  },
};
